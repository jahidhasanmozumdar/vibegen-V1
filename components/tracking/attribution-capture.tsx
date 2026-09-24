"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { captureTouch } from "@/lib/tracking/attribution";
import { onConsentChange } from "@/lib/tracking/consent";
import { track } from "@/lib/tracking/events";

/** Records campaign touch points and first-party page views on client navigation. */
export function AttributionCapture() {
  const pathname = usePathname();

  useEffect(() => {
    captureTouch();
    track("page_view", { page_path: pathname });
  }, [pathname]);

  // Persist first touch as soon as someone grants analytics consent.
  useEffect(() => onConsentChange(() => captureTouch()), []);

  return null;
}

/** Fires a single view event (service_view, pricing_view, case_study_view) when a page mounts. */
export function TrackView({ event, params }: { event: "service_view" | "pricing_view" | "case_study_view"; params?: Record<string, string> }) {
  const key = JSON.stringify(params ?? {});
  useEffect(() => {
    track(event, JSON.parse(key) as Record<string, string>);
  }, [event, key]);
  return null;
}
