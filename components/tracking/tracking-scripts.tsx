"use client";

import Script from "next/script";

import { publicEnv } from "@/lib/config/env";
import { useConsent } from "./consent-manager";

export interface TrackingIds {
  gtmId: string;
  ga4Id: string;
  metaPixelId: string;
  googleAdsId: string;
}

const safeId = (id: string) => (/^[A-Za-z0-9-_]+$/.test(id) ? id : "");

/**
 * Loads third-party tags only after the matching consent category is granted.
 * In demo mode nothing loads, so test traffic never pollutes real accounts.
 */
export function TrackingScripts({ ids }: { ids: TrackingIds }) {
  const consent = useConsent();
  if (!consent || publicEnv.demoMode) return null;

  const gtm = safeId(ids.gtmId);
  const ga4 = safeId(ids.ga4Id);
  const pixel = safeId(ids.metaPixelId);
  const ads = safeId(ids.googleAdsId);
  const needsGtag = (consent.analytics && ga4 && !gtm) || (consent.marketing && ads);

  return (
    <>
      {/* Google Consent Mode v2 defaults, then the user's actual choice. */}
      <Script id="vg-consent-mode" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=window.gtag||gtag;
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied'});
gtag('consent','update',{analytics_storage:'${consent.analytics ? "granted" : "denied"}',ad_storage:'${consent.marketing ? "granted" : "denied"}',ad_user_data:'${consent.marketing ? "granted" : "denied"}',ad_personalization:'${consent.marketing ? "granted" : "denied"}'});`}
      </Script>

      {consent.analytics && gtm && (
        <Script id="vg-gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
        </Script>
      )}

      {needsGtag && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4 || ads}`} strategy="afterInteractive" />
          <Script id="vg-gtag" strategy="afterInteractive">
            {`gtag('js',new Date());${consent.analytics && ga4 && !gtm ? `gtag('config','${ga4}');` : ""}${consent.marketing && ads ? `gtag('config','${ads}');` : ""}`}
          </Script>
        </>
      )}

      {consent.marketing && pixel && (
        <Script id="vg-meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  );
}
