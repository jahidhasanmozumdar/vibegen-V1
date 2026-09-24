import type { NextRequest } from "next/server";
import { z } from "zod";

import { serviceStore } from "@/lib/data";
import type { LeadSource } from "@/lib/data/types";
import { LEAD_SOURCES } from "@/lib/data/types";
import { RATE_LIMITS, rateLimit } from "@/lib/security/rate-limit";
import { classifySource } from "@/lib/services/attribution";
import type { TrackEvent } from "@/lib/tracking/events";

/**
 * First-party, cookie-less event log (sent by lib/tracking/events.ts only
 * after analytics consent). Always answers 204 so tracking can never break
 * or slow down the page, and never echoes validation details.
 */

const EVENT_NAMES = [
  "page_view",
  "growth_audit_submit",
  "contact_submit",
  "booking_request_submit",
  "book_call_click",
  "service_view",
  "pricing_view",
  "case_study_view",
  "form_start",
  "form_error",
  "external_booking_click",
] as const satisfies readonly TrackEvent[];

const primitive = z.union([z.string().max(300), z.number().finite(), z.boolean(), z.null()]);

const eventSchema = z.object({
  name: z.enum(EVENT_NAMES),
  path: z.string().max(300).startsWith("/").nullable().optional(),
  session_id: z
    .string()
    .max(64)
    .regex(/^[A-Za-z0-9-]+$/)
    .nullable()
    .optional(),
  properties: z
    .record(z.string().max(64), primitive)
    .refine((p) => Object.keys(p).length <= 20, "Too many properties.")
    .optional()
    .default({}),
});

const MAX_BODY_BYTES = 4_096;

function noContent() {
  return new Response(null, { status: 204 });
}

function clientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function resolveSource(properties: Record<string, unknown>, referrer: string | null): LeadSource {
  const given = properties.source;
  if (typeof given === "string" && (LEAD_SOURCES as readonly string[]).includes(given)) return given as LeadSource;
  // The Referer here is our own page; classifySource treats same-site referrers as direct.
  return classifySource({ source: null, medium: null, referrer });
}

export async function POST(request: NextRequest) {
  try {
    if (!rateLimit(`track:${clientIp(request)}`, RATE_LIMITS.track).ok) return noContent();

    const raw = await request.text();
    if (!raw || raw.length > MAX_BODY_BYTES) return noContent();

    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      return noContent();
    }

    const parsed = eventSchema.safeParse(json);
    if (!parsed.success) return noContent();
    const event = parsed.data;

    const store = await serviceStore();
    await store.insert("analytics_events", {
      name: event.name,
      path: event.path ?? null,
      session_id: event.session_id ?? null,
      properties: event.properties,
      source: resolveSource(event.properties, request.headers.get("referer")),
      is_demo: false,
    });
  } catch (error) {
    console.error("[track] failed to record event", error instanceof Error ? error.message : error);
  }
  return noContent();
}
