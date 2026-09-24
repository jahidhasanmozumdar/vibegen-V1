import { publicEnv } from "@/lib/config/env";
import type { SiteSettings } from "@/lib/data/types";

/**
 * Defaults for the editable site settings row. Public tracking IDs fall back
 * to environment variables so a fresh deployment works before anyone opens
 * the admin settings page. Secrets never live here — only in server env.
 */
export const defaultSiteSettings: SiteSettings = {
  company_name: "VibeGen",
  contact_email: publicEnv.contactEmail,
  booking_url: publicEnv.bookingUrl,
  booking_provider: "other",
  ga4_id: publicEnv.ga4Id,
  gtm_id: publicEnv.gtmId,
  meta_pixel_id: publicEnv.metaPixelId,
  google_ads_id: publicEnv.googleAdsId,
  notify_new_lead: true,
  notify_new_audit: true,
  notify_new_message: true,
  notify_new_booking: true,
  send_lead_confirmation: true,
  linkedin_url: publicEnv.linkedinUrl,
  x_url: publicEnv.xUrl,
  default_seo_title: "VibeGen — Performance Marketing & Conversion",
  default_seo_description:
    "Meta Ads, Google Ads, landing pages, CRO and analytics working as one acquisition system. For startups and growing businesses in the US and UK.",
};
