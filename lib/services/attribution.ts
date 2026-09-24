import type { Attribution, LeadSource, TouchPoint } from "@/lib/data/types";
import type { ClientAttribution } from "@/lib/validation/schemas";

/** Map UTM source / referrer to one of the reporting buckets. */
export function classifySource(touch: Pick<TouchPoint, "source" | "medium" | "referrer"> | null | undefined): LeadSource {
  if (!touch) return "direct";
  const source = (touch.source ?? "").toLowerCase();
  const medium = (touch.medium ?? "").toLowerCase();
  const referrer = (touch.referrer ?? "").toLowerCase();

  if (source) {
    if (/google|adwords|gads/.test(source)) return medium && /organic/.test(medium) ? "organic" : "google";
    if (/facebook|instagram|meta|fb|ig/.test(source)) return "meta";
    if (/linkedin/.test(source)) return "linkedin";
    if (/newsletter|email|mailchimp|klaviyo/.test(source) || medium === "email") return "email";
    return medium === "referral" ? "referral" : "other";
  }
  if (!referrer) return "direct";
  if (/google\.|bing\.|duckduckgo\.|yahoo\.|ecosia\./.test(referrer)) return "organic";
  if (/facebook\.|instagram\.|fb\.me/.test(referrer)) return "meta";
  if (/linkedin\.|lnkd\.in/.test(referrer)) return "linkedin";
  try {
    const host = new URL(referrer).hostname;
    if (host.endsWith("vibegen.studio")) return "direct";
  } catch {
    // ignore malformed referrer
  }
  return "referral";
}

/** Merge client-side touch points with server-side request context into the stored shape. */
export function buildAttribution(
  client: ClientAttribution,
  ctx: { device: Attribution["device"]; country: string | null },
): { attribution: Attribution; source: LeadSource } {
  const first = client.first_touch ?? null;
  const last = client.last_touch ?? first;
  const primary = last ?? first;

  const attribution: Attribution = {
    utm_source: primary?.source ?? null,
    utm_medium: primary?.medium ?? null,
    utm_campaign: primary?.campaign ?? null,
    utm_term: primary?.term ?? null,
    utm_content: primary?.content ?? null,
    referrer: primary?.referrer ?? null,
    landing_page: first?.landing_page ?? primary?.landing_page ?? null,
    first_visit: first?.at ?? null,
    last_visit: last?.at ?? null,
    device: ctx.device,
    country: ctx.country,
    first_touch: first,
    last_touch: last,
  };

  // Credit the last non-direct touch; fall back to first touch.
  const lastSource = classifySource(last);
  const source = lastSource !== "direct" ? lastSource : classifySource(first);
  return { attribution, source };
}
