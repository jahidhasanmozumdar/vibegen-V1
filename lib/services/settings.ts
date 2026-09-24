import "server-only";

import { defaultSiteSettings } from "@/lib/content/settings";
import { publicStore } from "@/lib/data";
import type { DataStore } from "@/lib/data";
import type { SiteSettings } from "@/lib/data/types";

/** Public-safe settings (tracking IDs, booking URL, contact email). Env values win when set. */
export async function getSiteSettings(store?: DataStore): Promise<SiteSettings> {
  try {
    const s = store ?? (await publicStore());
    const row = await s.findOne("site_settings", { key: "site" });
    const saved = row?.value ?? {};
    const merged: SiteSettings = { ...defaultSiteSettings, ...saved };
    // Environment configuration takes precedence over saved values for public IDs.
    for (const key of ["ga4_id", "gtm_id", "meta_pixel_id", "google_ads_id", "booking_url", "contact_email", "linkedin_url", "x_url"] as const) {
      if (defaultSiteSettings[key]) merged[key] = defaultSiteSettings[key];
    }
    return merged;
  } catch {
    return defaultSiteSettings;
  }
}
