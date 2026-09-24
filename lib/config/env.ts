/**
 * Centralised environment access.
 *
 * NEXT_PUBLIC_* values are inlined into the browser bundle — never put a
 * secret behind that prefix. Server-only values are read through
 * `serverEnv()` which is guarded by `server-only` in lib/config/server-env.ts.
 */

function flag(value: string | undefined, fallback = false): boolean {
  if (value === undefined || value === "") return fallback;
  return value === "true" || value === "1";
}

export const publicEnv = {
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || "https://vibegen.studio").replace(/\/$/, ""),
  demoMode: flag(process.env.NEXT_PUBLIC_DEMO_MODE, true),
  ga4Id: process.env.NEXT_PUBLIC_GA4_ID || "",
  gtmId: process.env.NEXT_PUBLIC_GTM_ID || "",
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
  googleAdsId: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "",
  googleAdsAuditLabel: process.env.NEXT_PUBLIC_GOOGLE_ADS_AUDIT_LABEL || "",
  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL || "",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
  linkedinUrl: process.env.NEXT_PUBLIC_LINKEDIN_URL || "",
  xUrl: process.env.NEXT_PUBLIC_X_URL || "",
} as const;

