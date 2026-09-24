"use client";

import { publicEnv } from "@/lib/config/env";
import { readConsent } from "./consent";
import { getSessionId } from "./attribution";

/** The only conversion events the site sends. Add here before tracking anything new. */
export type TrackEvent =
  | "page_view"
  | "growth_audit_submit"
  | "contact_submit"
  | "booking_request_submit"
  | "book_call_click"
  | "service_view"
  | "pricing_view"
  | "case_study_view"
  | "form_start"
  | "form_error"
  | "external_booking_click";

export type TrackParams = Record<string, string | number | boolean | null | undefined>;

type Gtag = (...args: unknown[]) => void;
type Fbq = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
    fbq?: Fbq;
  }
}

/** Map our events to Meta standard events where one exists. */
const META_EVENTS: Partial<Record<TrackEvent, string>> = {
  growth_audit_submit: "Lead",
  contact_submit: "Contact",
  booking_request_submit: "Schedule",
  external_booking_click: "Schedule",
  pricing_view: "ViewContent",
  service_view: "ViewContent",
};

const CONVERSIONS: TrackEvent[] = ["growth_audit_submit", "contact_submit", "booking_request_submit"];

/**
 * Central tracking entry point. Components call track(); only this file
 * knows about GTM, GA4, Meta Pixel and the first-party endpoint.
 */
export function track(event: TrackEvent, params: TrackParams = {}): void {
  if (typeof window === "undefined") return;
  const consent = readConsent();

  if (consent.analytics) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...params });
    if (window.gtag) window.gtag("event", event, params);
    sendFirstParty(event, params);
  }

  if (consent.marketing) {
    const metaEvent = META_EVENTS[event];
    if (window.fbq && metaEvent) window.fbq("track", metaEvent, { content_name: event });
    if (window.gtag && publicEnv.googleAdsId && publicEnv.googleAdsAuditLabel && CONVERSIONS.includes(event)) {
      window.gtag("event", "conversion", { send_to: `${publicEnv.googleAdsId}/${publicEnv.googleAdsAuditLabel}` });
    }
  }
}

/** First-party, cookie-less event log that feeds the admin analytics page. */
function sendFirstParty(event: TrackEvent, params: TrackParams): void {
  // Demo mode must not mix real visits into illustrative analytics.
  if (publicEnv.demoMode && process.env.NODE_ENV === "production") return;
  const body = JSON.stringify({
    name: event,
    path: window.location.pathname,
    session_id: getSessionId(),
    properties: Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined)),
  });
  try {
    if (navigator.sendBeacon) navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    else void fetch("/api/track", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true });
  } catch {
    // Tracking must never break the page.
  }
}
