import { NextResponse, type NextRequest } from "next/server";

import { serverEnv } from "@/lib/config/server-env";
import type { ApiResponse } from "@/lib/data/types";
import { RATE_LIMITS, rateLimit } from "@/lib/security/rate-limit";
import { applyBookingEvent, parseBookingWebhook, verifyWebhook, type ApplyResult } from "@/lib/services/booking-integration";

/**
 * POST /api/bookings/webhook — Calendly / Cal.com booking events.
 * Setup instructions: lib/services/booking-integration.ts.
 *
 * 200 processed (or ignored event type) · 400 bad payload · 401 bad/missing
 * signature · 413 too large · 429 rate limited · 500 temporary failure (the
 * provider retries).
 */
const MAX_BODY_BYTES = 256 * 1024;

type Envelope = ApiResponse<ApplyResult | { action: "ignored" }>;

function fail(message: string, status: number) {
  return NextResponse.json<Envelope>({ success: false, message }, { status });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`booking-webhook:${ip}`, RATE_LIMITS.api).ok) return fail("Too many requests.", 429);

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) return fail("Payload too large.", 413);
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return fail("Payload too large.", 413);

  const verified = verifyWebhook(raw, request.headers, serverEnv().bookingWebhookSecret);
  if (!verified.ok) return fail("Unauthorized.", 401);

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return fail("Body must be JSON.", 400);
  }

  const parsed = parseBookingWebhook(body);
  if (!parsed.ok) return fail(parsed.message, 400);
  if (!parsed.event) return NextResponse.json<Envelope>({ success: true, data: { action: "ignored" }, message: parsed.reason });

  try {
    const result = await applyBookingEvent(parsed.event);
    return NextResponse.json<Envelope>({ success: true, data: result }, { status: result.action === "created" ? 201 : 200 });
  } catch (error) {
    console.error("[booking-webhook] apply failed", error instanceof Error ? error.message : error);
    return fail("Could not record the booking. Try again.", 500);
  }
}

export function GET() {
  return fail("Method not allowed. Send booking events with POST.", 405);
}
