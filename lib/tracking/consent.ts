"use client";

/**
 * Cookie consent state. Necessary storage is always on; analytics and
 * marketing are opt-in. Nothing that sets third-party cookies loads until
 * the relevant category is granted.
 */
export interface ConsentState {
  analytics: boolean;
  marketing: boolean;
  decided: boolean;
  version: number;
  updatedAt: string | null;
}

const KEY = "vg_consent";
const VERSION = 1;
const EVENT = "vg:consent";

export const defaultConsent: ConsentState = { analytics: false, marketing: false, decided: false, version: VERSION, updatedAt: null };

export function readConsent(): ConsentState {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultConsent;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    if (parsed.version !== VERSION) return defaultConsent;
    return { ...defaultConsent, ...parsed, decided: true };
  } catch {
    return defaultConsent;
  }
}

export function writeConsent(next: Pick<ConsentState, "analytics" | "marketing">): ConsentState {
  const state: ConsentState = { ...next, decided: true, version: VERSION, updatedAt: new Date().toISOString() };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage blocked: consent applies for this page view only.
  }
  window.dispatchEvent(new CustomEvent<ConsentState>(EVENT, { detail: state }));
  return state;
}

export function onConsentChange(listener: (state: ConsentState) => void): () => void {
  const handler = (e: Event) => listener((e as CustomEvent<ConsentState>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}

/** Lets any "Cookie settings" link re-open the preferences dialog. */
export const OPEN_PREFERENCES_EVENT = "vg:open-consent";
export function openConsentPreferences(): void {
  window.dispatchEvent(new Event(OPEN_PREFERENCES_EVENT));
}
