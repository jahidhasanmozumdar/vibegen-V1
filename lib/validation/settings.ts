import { z } from "zod";

import { BOOKING_PROVIDERS } from "@/lib/data/types";
import { sanitizeText } from "./schemas";

/**
 * Admin settings validation, one schema per settings tab. Each tab saves only
 * its own keys into the site_settings row (key "site").
 */

const trimmed = z
  .string()
  .optional()
  .transform((v) => (v ? sanitizeText(v) : ""));

const pattern = (re: RegExp, message: string) => trimmed.refine((v) => v === "" || re.test(v), message);

const httpsUrl = (message: string) =>
  trimmed.refine((v) => {
    if (!v) return true;
    try {
      return new URL(v).protocol === "https:";
    } catch {
      return false;
    }
  }, message);

const checkbox = z
  .string()
  .optional()
  .transform((v) => v === "on");

export const generalSettingsSchema = z.object({
  company_name: trimmed.pipe(z.string().min(1, "Company name is required.").max(120)),
  contact_email: trimmed.refine((v) => v === "" || z.email().safeParse(v).success, "Enter a valid email, or leave it empty to hide it."),
});

export const notificationSettingsSchema = z.object({
  notify_new_lead: checkbox,
  notify_new_audit: checkbox,
  notify_new_message: checkbox,
  notify_new_booking: checkbox,
  send_lead_confirmation: checkbox,
});

export const integrationSettingsSchema = z.object({
  ga4_id: pattern(/^G-[A-Z0-9]+$/, "GA4 Measurement IDs look like G-XXXXXXXXXX."),
  gtm_id: pattern(/^GTM-[A-Z0-9]+$/, "GTM container IDs look like GTM-XXXXXXX."),
  meta_pixel_id: pattern(/^\d{10,20}$/, "A Meta Pixel ID is 10–20 digits."),
  google_ads_id: pattern(/^AW-\d+$/, "Google Ads conversion IDs look like AW-123456789."),
  booking_url: httpsUrl("Use a full https:// link to your booking page."),
  booking_provider: z.enum(BOOKING_PROVIDERS),
});

export const siteSettingsSchema = z.object({
  default_seo_title: trimmed.pipe(z.string().min(1, "A default title is required.").max(70, "Keep this under 70 characters.")),
  default_seo_description: trimmed.pipe(z.string().min(1, "A default description is required.").max(170, "Keep this under 170 characters.")),
  linkedin_url: httpsUrl("Use a full https:// link, or leave it empty to hide it."),
  x_url: httpsUrl("Use a full https:// link, or leave it empty to hide it."),
});

export const profileSchema = z.object({
  full_name: trimmed.pipe(z.string().min(1, "Your name is required.").max(120)),
});

export const SETTINGS_SECTIONS = {
  general: generalSettingsSchema,
  notifications: notificationSettingsSchema,
  integrations: integrationSettingsSchema,
  site: siteSettingsSchema,
} as const;

export type SettingsSection = keyof typeof SETTINGS_SECTIONS;
