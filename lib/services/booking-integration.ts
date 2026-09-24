import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

import { serviceStore } from "@/lib/data";
import type { Booking } from "@/lib/data/types";
import { adminRecipient, sendEmail } from "@/lib/email";
import { adminNotificationEmail } from "@/lib/email/templates";
import { findOrCreateLeadByEmail, logLeadActivity } from "./lead-upsert";
import { createNotification } from "./notifications";
import { getSiteSettings } from "./settings";

/**
 * Booking provider webhooks → bookings table.
 *
 * SETUP
 *   1. Pick a long random secret and set BOOKING_WEBHOOK_SECRET in the server
 *      environment (e.g. `openssl rand -hex 32`). Without it every call is
 *      rejected with 401.
 *   2. Calendly (paid plan, API v2): create a webhook subscription for
 *      `invitee.created` and `invitee.canceled` pointing at
 *        https://<your-domain>/api/bookings/webhook
 *      with `signing_key` = BOOKING_WEBHOOK_SECRET. Calendly signs each call
 *      with the `Calendly-Webhook-Signature: t=<unix>,v1=<hex hmac>` header.
 *      (POST https://api.calendly.com/webhook_subscriptions, scope
 *      "organization" or "user".)
 *   3. Cal.com: Settings → Developer → Webhooks → New. Subscriber URL as
 *      above, triggers Booking Created / Cancelled / Rescheduled, and
 *      "Secret" = BOOKING_WEBHOOK_SECRET. Cal.com sends
 *      `X-Cal-Signature-256: <hex hmac of the raw body>`.
 *   4. Other tools (Zapier, Make, custom): send the Calendly or Cal.com
 *      payload shape with header `x-webhook-secret: <secret>`.
 *
 * Writes use the service-role store: the request is authenticated by the
 * signature, not by a user session.
 */

/* ------------------------------------------------------------------ */
/* Signature verification                                               */
/* ------------------------------------------------------------------ */

const CALENDLY_TOLERANCE_MS = 5 * 60_000;

function equalHex(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

function hmacHex(secret: string, data: string): string {
  return createHmac("sha256", secret).update(data, "utf8").digest("hex");
}

export type VerifyResult = { ok: true; method: "shared_secret" | "cal_com" | "calendly" } | { ok: false; reason: string };

export function verifyWebhook(rawBody: string, headers: Headers, secret: string, now: number = Date.now()): VerifyResult {
  if (!secret) return { ok: false, reason: "Webhook secret is not configured." };

  const shared = headers.get("x-webhook-secret");
  if (shared) {
    const a = createHmac("sha256", "cmp").update(shared).digest();
    const b = createHmac("sha256", "cmp").update(secret).digest();
    return timingSafeEqual(a, b) ? { ok: true, method: "shared_secret" } : { ok: false, reason: "Invalid secret." };
  }

  const cal = headers.get("x-cal-signature-256");
  if (cal) {
    return equalHex(cal.trim().toLowerCase(), hmacHex(secret, rawBody)) ? { ok: true, method: "cal_com" } : { ok: false, reason: "Invalid signature." };
  }

  const calendly = headers.get("calendly-webhook-signature");
  if (calendly) {
    const parts = Object.fromEntries(
      calendly.split(",").map((p) => {
        const [k, ...v] = p.trim().split("=");
        return [k, v.join("=")];
      }),
    );
    const t = Number(parts.t);
    if (!parts.t || !parts.v1 || !Number.isFinite(t)) return { ok: false, reason: "Malformed signature." };
    if (Math.abs(now - t * 1000) > CALENDLY_TOLERANCE_MS) return { ok: false, reason: "Signature timestamp is too old." };
    return equalHex(parts.v1.toLowerCase(), hmacHex(secret, `${parts.t}.${rawBody}`)) ? { ok: true, method: "calendly" } : { ok: false, reason: "Invalid signature." };
  }

  return { ok: false, reason: "Missing signature." };
}

/* ------------------------------------------------------------------ */
/* Payload shapes (only the fields we use)                              */
/* ------------------------------------------------------------------ */

const optionalString = z.string().max(2000).nullish();

export const calendlyWebhookSchema = z.object({
  event: z.string().max(100),
  payload: z.object({
    email: z.string().max(254),
    name: z.string().max(200).nullish(),
    uri: z.string().max(500),
    rescheduled: z.boolean().nullish(),
    old_invitee: optionalString,
    scheduled_event: z
      .object({
        uri: optionalString,
        name: optionalString,
        start_time: optionalString,
      })
      .nullish(),
    questions_and_answers: z.array(z.object({ question: z.string().max(500), answer: z.string().max(2000) })).max(20).nullish(),
    cancellation: z.object({ reason: optionalString }).nullish(),
  }),
});
export type CalendlyWebhook = z.infer<typeof calendlyWebhookSchema>;

export const calComWebhookSchema = z.object({
  triggerEvent: z.string().max(100),
  payload: z.object({
    uid: z.string().max(200),
    title: optionalString,
    startTime: optionalString,
    rescheduleUid: optionalString,
    fromReschedule: optionalString,
    description: optionalString,
    cancellationReason: optionalString,
    attendees: z.array(z.object({ email: z.string().max(254), name: z.string().max(200).nullish() })).max(20).nullish(),
  }),
});
export type CalComWebhook = z.infer<typeof calComWebhookSchema>;

export interface BookingEvent {
  provider: "calendly" | "cal_com";
  kind: "created" | "cancelled" | "rescheduled";
  externalId: string;
  previousExternalId: string | null;
  name: string;
  email: string;
  meetingAt: string | null;
  notes: string | null;
}

export type ParseResult = { ok: true; event: BookingEvent } | { ok: true; event: null; reason: string } | { ok: false; message: string };

function isoOrNull(value: string | null | undefined): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Detect the provider from the payload shape and normalise it. */
export function parseBookingWebhook(body: unknown): ParseResult {
  if (body && typeof body === "object" && "triggerEvent" in body) {
    const parsed = calComWebhookSchema.safeParse(body);
    if (!parsed.success) return { ok: false, message: "Unrecognised Cal.com payload." };
    const { triggerEvent, payload } = parsed.data;
    const kinds: Record<string, BookingEvent["kind"]> = { BOOKING_CREATED: "created", BOOKING_CANCELLED: "cancelled", BOOKING_RESCHEDULED: "rescheduled" };
    const kind = kinds[triggerEvent];
    if (!kind) return { ok: true, event: null, reason: `Ignored ${triggerEvent}.` };
    const attendee = payload.attendees?.[0];
    if (!attendee?.email) return { ok: false, message: "Booking has no attendee email." };
    return {
      ok: true,
      event: {
        provider: "cal_com",
        kind,
        externalId: payload.uid,
        previousExternalId: payload.rescheduleUid ?? payload.fromReschedule ?? null,
        name: attendee.name || attendee.email,
        email: attendee.email,
        meetingAt: isoOrNull(payload.startTime),
        notes: [payload.title, payload.description, payload.cancellationReason && `Cancellation reason: ${payload.cancellationReason}`].filter(Boolean).join("\n") || null,
      },
    };
  }

  if (body && typeof body === "object" && "event" in body && "payload" in body) {
    const parsed = calendlyWebhookSchema.safeParse(body);
    if (!parsed.success) return { ok: false, message: "Unrecognised Calendly payload." };
    const { event, payload } = parsed.data;
    if (event !== "invitee.created" && event !== "invitee.canceled") return { ok: true, event: null, reason: `Ignored ${event}.` };
    // A Calendly reschedule = cancel(old, rescheduled: true) + create(new, old_invitee). The create carries both ids.
    if (event === "invitee.canceled" && payload.rescheduled) return { ok: true, event: null, reason: "Rescheduled; handled by the new invitee event." };
    const answers = (payload.questions_and_answers ?? []).map((qa) => `${qa.question}: ${qa.answer}`);
    return {
      ok: true,
      event: {
        provider: "calendly",
        kind: event === "invitee.canceled" ? "cancelled" : payload.old_invitee ? "rescheduled" : "created",
        externalId: payload.uri,
        previousExternalId: payload.old_invitee ?? null,
        name: payload.name || payload.email,
        email: payload.email,
        meetingAt: isoOrNull(payload.scheduled_event?.start_time),
        notes:
          [payload.scheduled_event?.name, ...answers, payload.cancellation?.reason && `Cancellation reason: ${payload.cancellation.reason}`].filter(Boolean).join("\n") || null,
      },
    };
  }

  return { ok: false, message: "Unsupported payload. Send a Calendly or Cal.com webhook." };
}

/* ------------------------------------------------------------------ */
/* Apply                                                                */
/* ------------------------------------------------------------------ */

export interface ApplyResult {
  action: "created" | "rescheduled" | "cancelled" | "duplicate" | "not_found";
  bookingId: string | null;
}

const providerLabel = { calendly: "Calendly", cal_com: "Cal.com" } as const;

function when(iso: string | null): string {
  return iso ? new Date(iso).toUTCString().replace(":00 GMT", " UTC") : "time to be confirmed";
}

export async function applyBookingEvent(event: BookingEvent): Promise<ApplyResult> {
  const store = await serviceStore();
  const find = (externalId: string | null) => (externalId ? store.findOne("bookings", { provider: event.provider, external_id: externalId }) : Promise.resolve(null));
  const label = providerLabel[event.provider];

  if (event.kind === "cancelled") {
    const booking = await find(event.externalId);
    if (!booking) return { action: "not_found", bookingId: null };
    if (booking.status !== "cancelled") {
      await store.update("bookings", booking.id, { status: "cancelled", notes: mergeNotes(booking, event.notes) });
      if (booking.lead_id) await logLeadActivity(store, booking.lead_id, "updated", `Cancelled the strategy call on ${when(booking.meeting_at)} (${label})`);
      await createNotification(store, {
        type: "new_booking",
        title: "Strategy call cancelled",
        body: `${booking.name} cancelled their call on ${when(booking.meeting_at)}.`,
        link: `/admin/bookings?highlight=${booking.id}`,
      });
    }
    return { action: "cancelled", bookingId: booking.id };
  }

  const duplicate = await find(event.externalId);
  if (duplicate) return { action: "duplicate", bookingId: duplicate.id };

  if (event.kind === "rescheduled") {
    const previous = await find(event.previousExternalId);
    if (previous) {
      await store.update("bookings", previous.id, {
        external_id: event.externalId,
        meeting_at: event.meetingAt,
        status: "scheduled",
        notes: mergeNotes(previous, event.notes),
      });
      if (previous.lead_id) await logLeadActivity(store, previous.lead_id, "updated", `Rescheduled the strategy call to ${when(event.meetingAt)} (${label})`);
      await createNotification(store, {
        type: "new_booking",
        title: "Strategy call rescheduled",
        body: `${previous.name} moved their call to ${when(event.meetingAt)}.`,
        link: `/admin/bookings?highlight=${previous.id}`,
      });
      return { action: "rescheduled", bookingId: previous.id };
    }
    // Unknown original booking: record it as a new one.
  }

  const { lead, created } = await findOrCreateLeadByEmail(store, { full_name: event.name, email: event.email }, { form: "booking", source: "direct" });
  const booking = await store.insert("bookings", {
    lead_id: lead.id,
    name: event.name,
    email: event.email.toLowerCase(),
    company: lead.company,
    meeting_at: event.meetingAt,
    meeting_type: "strategy_call",
    status: "scheduled",
    source: lead.source,
    provider: event.provider,
    external_id: event.externalId,
    notes: event.notes,
    is_demo: false,
    deleted_at: null,
  });

  if (created) await logLeadActivity(store, lead.id, "submitted", `Booked a call through ${label}`);
  await logLeadActivity(store, lead.id, "call_booked", `Booked a strategy call for ${when(event.meetingAt)} (${label})`, { provider: event.provider });
  await createNotification(store, {
    type: "new_booking",
    title: "New strategy call booked",
    body: `${event.name} booked a call for ${when(event.meetingAt)} via ${label}.`,
    link: `/admin/bookings?highlight=${booking.id}`,
  });

  const settings = await getSiteSettings(store);
  const to = adminRecipient();
  if (settings.notify_new_booking && to) {
    await sendEmail(
      adminNotificationEmail({
        to,
        kind: "booking",
        name: event.name,
        email: event.email,
        adminPath: "/admin/bookings",
        fields: [
          ["Meeting", when(event.meetingAt)],
          ["Booked via", label],
          ["Notes", event.notes],
        ],
      }),
    );
  }

  return { action: "created", bookingId: booking.id };
}

function mergeNotes(booking: Booking, incoming: string | null): string | null {
  if (!incoming) return booking.notes;
  if (!booking.notes) return incoming;
  return booking.notes.includes(incoming) ? booking.notes : `${booking.notes}\n${incoming}`.slice(0, 4000);
}
