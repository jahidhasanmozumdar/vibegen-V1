import type { NextRequest } from "next/server";
import { z } from "zod";

import { serverEnv } from "@/lib/config/server-env";
import { rateLimit } from "@/lib/security/rate-limit";
import { ScanError, scanSite } from "@/lib/services/site-scan";

/**
 * Instant Funnel Scan. Public; stores no page data.
 * - Burst guard: 10 attempts / 10 min per IP (any outcome).
 * - Free quota: `FREE_SCANS_PER_DAY` successful scans / 24h per IP, then the
 *   visitor is offered unlimited scans with a paid plan.
 * In-memory counters: on multi-instance hosting, move them to a shared store.
 */

export const maxDuration = 60;

const DAY = 24 * 60 * 60_000;
const bodySchema = z.object({ url: z.string().min(3).max(300) });

const G = globalThis as unknown as { __vgScanQuota?: Map<string, { used: number; resetAt: number }> };
const quota = (G.__vgScanQuota ??= new Map());

function quotaFor(ip: string, limit: number) {
  const now = Date.now();
  let q = quota.get(ip);
  if (!q || q.resetAt <= now) {
    q = { used: 0, resetAt: now + DAY };
    quota.set(ip, q);
  }
  if (quota.size > 20_000) for (const [k, v] of quota) if (v.resetAt <= now) quota.delete(k);
  return { q, remaining: Math.max(0, limit - q.used) };
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  const limit = serverEnv().freeScansPerDay;

  const { q, remaining } = quotaFor(ip, limit);
  if (remaining <= 0) {
    const hours = Math.max(1, Math.ceil((q.resetAt - Date.now()) / 3_600_000));
    return Response.json(
      { ok: false, code: "limit", limit, resetsInHours: hours, error: `You've used your ${limit} free scans for today.` },
      { status: 429 },
    );
  }

  const burst = rateLimit(`scan:${ip}`, { limit: 10, windowMs: 10 * 60_000 });
  if (!burst.ok) {
    return Response.json({ ok: false, code: "burst", error: "Too many scans in a short time. Please wait a few minutes." }, { status: 429 });
  }

  let url: string;
  try {
    url = bodySchema.parse(await req.json()).url;
  } catch {
    return Response.json({ ok: false, code: "input", error: "Enter a website address, like yourcompany.com." }, { status: 400 });
  }

  try {
    const result = await scanSite(url);
    q.used += 1;
    return Response.json({ ok: true, result, remaining: Math.max(0, limit - q.used), limit }, { headers: { "cache-control": "no-store" } });
  } catch (err) {
    const message = err instanceof ScanError ? err.userMessage : "Something went wrong while scanning. Please try again.";
    if (!(err instanceof ScanError)) console.error("[scan] failed", err);
    return Response.json({ ok: false, code: "scan", error: message, remaining }, { status: 422 });
  }
}
