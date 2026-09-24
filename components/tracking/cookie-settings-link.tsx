"use client";

import { openConsentPreferences } from "@/lib/tracking/consent";

export function CookieSettingsLink({ className }: { className?: string }) {
  return (
    <button type="button" onClick={openConsentPreferences} className={className}>
      Cookie settings
    </button>
  );
}
