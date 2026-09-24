import "server-only";

import { publicEnv } from "@/lib/config/env";
import { serverEnv } from "@/lib/config/server-env";
import { defaultSiteSettings } from "@/lib/content/settings";
import { adminStore, dataDriver } from "@/lib/data";
import type { Profile, SiteSettings } from "@/lib/data/types";

/** Public settings that an environment variable overrides (env wins; see lib/services/settings.ts). */
export const ENV_OVERRIDES = {
  ga4_id: { env: "NEXT_PUBLIC_GA4_ID", value: publicEnv.ga4Id },
  gtm_id: { env: "NEXT_PUBLIC_GTM_ID", value: publicEnv.gtmId },
  meta_pixel_id: { env: "NEXT_PUBLIC_META_PIXEL_ID", value: publicEnv.metaPixelId },
  google_ads_id: { env: "NEXT_PUBLIC_GOOGLE_ADS_ID", value: publicEnv.googleAdsId },
  booking_url: { env: "NEXT_PUBLIC_BOOKING_URL", value: publicEnv.bookingUrl },
  contact_email: { env: "NEXT_PUBLIC_CONTACT_EMAIL", value: publicEnv.contactEmail },
  linkedin_url: { env: "NEXT_PUBLIC_LINKEDIN_URL", value: publicEnv.linkedinUrl },
  x_url: { env: "NEXT_PUBLIC_X_URL", value: publicEnv.xUrl },
} as const satisfies Partial<Record<keyof SiteSettings, { env: string; value: string }>>;

export type EnvOverrideKey = keyof typeof ENV_OVERRIDES;
export type ActiveOverrides = Partial<Record<EnvOverrideKey, { env: string; value: string }>>;

export function activeEnvOverrides(): ActiveOverrides {
  const out: ActiveOverrides = {};
  for (const key of Object.keys(ENV_OVERRIDES) as EnvOverrideKey[]) {
    if (ENV_OVERRIDES[key].value) out[key] = ENV_OVERRIDES[key];
  }
  return out;
}

/** Saved values as stored in site_settings (merged over defaults), without env overrides applied. */
export async function getSavedSettings(): Promise<{ settings: SiteSettings; persisted: boolean }> {
  const store = await adminStore();
  const row = await store.findOne("site_settings", { key: "site" });
  return { settings: { ...defaultSiteSettings, ...(row?.value ?? {}) }, persisted: Boolean(row) };
}

export async function saveSiteSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
  const store = await adminStore();
  const row = await store.findOne("site_settings", { key: "site" });
  const value: SiteSettings = { ...defaultSiteSettings, ...(row?.value ?? {}), ...patch };
  if (row) await store.update("site_settings", row.id, { value });
  else await store.insert("site_settings", { key: "site", value });
  return value;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const store = await adminStore();
  return store.get("profiles", userId);
}

export async function updateOwnName(userId: string, fullName: string): Promise<void> {
  const store = await adminStore();
  await store.update("profiles", userId, { full_name: fullName });
}

/** Configuration status for the Settings page. Booleans only — never secret values. */
export function integrationStatus() {
  const env = serverEnv();
  return {
    dataDriver,
    databaseHost: process.env.DATABASE_URL ? safeHost(process.env.DATABASE_URL) : null,
    directUrlConfigured: Boolean(process.env.DIRECT_URL),
    sessionSecretConfigured: Boolean(process.env.SESSION_SECRET),
    demoPasswordIsDefault: !process.env.DEMO_ADMIN_PASSWORD,
    emailProvider: env.emailProvider,
    resendConfigured: env.emailProvider === "resend" && Boolean(env.resendApiKey),
    emailFrom: env.emailFrom,
    adminNotificationConfigured: Boolean(env.adminNotificationEmail),
    bookingWebhookConfigured: Boolean(env.bookingWebhookSecret),
    googleAdsAuditLabelConfigured: Boolean(publicEnv.googleAdsAuditLabel),
    demoMode: publicEnv.demoMode,
    isProduction: process.env.NODE_ENV === "production",
    siteUrl: publicEnv.siteUrl,
  };
}

export type IntegrationStatus = ReturnType<typeof integrationStatus>;

function safeHost(url: string): string | null {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}
