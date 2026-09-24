"use client";

import type { TouchPoint } from "@/lib/data/types";
import { readConsent } from "./consent";

/**
 * Attribution capture.
 *
 * - Last touch lives in sessionStorage (strictly needed to attach the
 *   campaign that brought someone to the form they submit).
 * - First touch persists in localStorage only when analytics consent exists.
 *
 * Nothing here identifies a person; it's only sent when they submit a form.
 */
const FIRST_KEY = "vg_first_touch";
const LAST_KEY = "vg_last_touch";
const SESSION_KEY = "vg_sid";

function safeGet(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(storage: Storage, key: string, value: string): void {
  try {
    storage.setItem(key, value);
  } catch {
    // storage unavailable
  }
}

function parse(raw: string | null): TouchPoint | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TouchPoint;
  } catch {
    return null;
  }
}

function currentTouch(): TouchPoint {
  const params = new URLSearchParams(window.location.search);
  const referrer = document.referrer && !document.referrer.startsWith(window.location.origin) ? document.referrer : null;
  const clip = (v: string | null) => (v ? v.slice(0, 200) : null);
  return {
    source: clip(params.get("utm_source") ?? (params.get("gclid") ? "google" : params.get("fbclid") ? "facebook" : null)),
    medium: clip(params.get("utm_medium") ?? (params.get("gclid") ? "cpc" : params.get("fbclid") ? "paid_social" : null)),
    campaign: clip(params.get("utm_campaign")),
    term: clip(params.get("utm_term")),
    content: clip(params.get("utm_content")),
    referrer: referrer ? referrer.slice(0, 500) : null,
    landing_page: window.location.pathname,
    at: new Date().toISOString(),
  };
}

/** Call once per page load (AttributionCapture component). */
export function captureTouch(): void {
  const touch = currentTouch();
  const isNewSignal = Boolean(touch.source || touch.referrer);
  const existingLast = parse(safeGet(window.sessionStorage, LAST_KEY));

  // Keep the session's entry touch unless a new campaign/referrer arrives.
  if (!existingLast || isNewSignal) safeSet(window.sessionStorage, LAST_KEY, JSON.stringify(touch));

  if (readConsent().analytics && !safeGet(window.localStorage, FIRST_KEY)) {
    const first = existingLast && !isNewSignal ? existingLast : touch;
    safeSet(window.localStorage, FIRST_KEY, JSON.stringify(first));
  }
}

/** JSON sent in the hidden `attribution` field of every public form. */
export function getAttributionPayload(): string {
  const last = parse(safeGet(window.sessionStorage, LAST_KEY));
  const first = readConsent().analytics ? parse(safeGet(window.localStorage, FIRST_KEY)) : null;
  return JSON.stringify({ first_touch: first ?? last, last_touch: last });
}

/** Random per-tab session id; not persisted beyond the browser session. */
export function getSessionId(): string {
  let id = safeGet(window.sessionStorage, SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    safeSet(window.sessionStorage, SESSION_KEY, id);
  }
  return id;
}
