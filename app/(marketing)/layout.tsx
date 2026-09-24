import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { JsonLd, organizationSchema, websiteSchema } from "@/components/seo/json-ld";
import { AttributionCapture } from "@/components/tracking/attribution-capture";
import { ConsentManager } from "@/components/tracking/consent-manager";
import { TrackingScripts } from "@/components/tracking/tracking-scripts";
import { getSiteSettings } from "@/lib/services/settings";

export default async function MarketingLayout({ children }: LayoutProps<"/">) {
  const settings = await getSiteSettings();

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[70] rounded-md bg-ink px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer contactEmail={settings.contact_email} />

      <ConsentManager />
      <AttributionCapture />
      <TrackingScripts
        ids={{ gtmId: settings.gtm_id, ga4Id: settings.ga4_id, metaPixelId: settings.meta_pixel_id, googleAdsId: settings.google_ads_id }}
      />
      <JsonLd data={organizationSchema()} />
      <JsonLd data={websiteSchema()} />
    </>
  );
}
