/**
 * Lightweight, privacy-friendly spam protection for public forms:
 *
 * 1. Honeypot: a visually hidden field real people never fill in.
 * 2. Time trap: forms submitted within a couple of seconds of rendering
 *    are almost always bots.
 *
 * Both fields are rendered by <SpamGuard /> in components/forms.
 * For higher-volume abuse, add Cloudflare Turnstile or hCaptcha in the same place.
 */
export const HONEYPOT_FIELD = "company_url";
export const TIMESTAMP_FIELD = "_rendered_at";

const MIN_FILL_MS = 2500;
const MAX_AGE_MS = 1000 * 60 * 60 * 24;

export type SpamVerdict = { spam: false } | { spam: true; reason: "honeypot" | "too_fast" | "stale" };

export function checkSpam(formData: FormData, now = Date.now()): SpamVerdict {
  const honeypot = formData.get(HONEYPOT_FIELD);
  if (typeof honeypot === "string" && honeypot.trim() !== "") return { spam: true, reason: "honeypot" };

  const rendered = Number(formData.get(TIMESTAMP_FIELD));
  if (!Number.isFinite(rendered) || rendered <= 0) return { spam: true, reason: "stale" };
  const elapsed = now - rendered;
  if (elapsed < MIN_FILL_MS) return { spam: true, reason: "too_fast" };
  if (elapsed > MAX_AGE_MS) return { spam: true, reason: "stale" };
  return { spam: false };
}
