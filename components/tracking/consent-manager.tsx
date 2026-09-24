"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { OPEN_PREFERENCES_EVENT, onConsentChange, readConsent, writeConsent, type ConsentState } from "@/lib/tracking/consent";

function subscribe(cb: () => void) {
  const off = onConsentChange(cb);
  window.addEventListener("storage", cb);
  return () => {
    off();
    window.removeEventListener("storage", cb);
  };
}

let cached: ConsentState | null = null;
function snapshot(): ConsentState {
  const next = readConsent();
  if (!cached || cached.analytics !== next.analytics || cached.marketing !== next.marketing || cached.decided !== next.decided) cached = next;
  return cached;
}
const serverSnapshot = (): ConsentState | null => null;

/** Shared hook for anything that needs to react to consent (e.g. script loader). */
export function useConsent(): ConsentState | null {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}

export function ConsentManager() {
  const consent = useConsent();
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const open = () => {
      const current = readConsent();
      setAnalytics(current.analytics);
      setMarketing(current.marketing);
      setPrefsOpen(true);
    };
    window.addEventListener(OPEN_PREFERENCES_EVENT, open);
    return () => window.removeEventListener(OPEN_PREFERENCES_EVENT, open);
  }, []);

  const showBanner = consent !== null && !consent.decided && !prefsOpen;

  return (
    <>
      {showBanner && (
        <section
          aria-labelledby="consent-title"
          className="fixed inset-x-3 bottom-3 z-50 rounded-[20px] border border-hair bg-white p-5 shadow-[0_40px_80px_-36px_rgb(10_13_20/0.35)] sm:inset-x-auto sm:bottom-5 sm:left-5 sm:max-w-[400px]"
        >
          <h2 id="consent-title" className="text-[15px] font-semibold tracking-[-0.015em] text-fg">
            Cookies on this site
          </h2>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-fg-2">
            We use necessary storage to make forms work. With your permission we also use analytics and advertising cookies to see which campaigns bring people
            here.{" "}
            <Link href="/cookie-policy" className="font-medium text-brand underline-offset-2 hover:underline">
              Cookie policy
            </Link>
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button size="sm" onClick={() => writeConsent({ analytics: true, marketing: true })}>
              Accept all
            </Button>
            <Button size="sm" variant="outline" onClick={() => writeConsent({ analytics: false, marketing: false })}>
              Reject non-essential
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="col-span-2"
              onClick={() => {
                setAnalytics(false);
                setMarketing(false);
                setPrefsOpen(true);
              }}
            >
              Cookie settings
            </Button>
          </div>
        </section>
      )}

      <Modal
        open={prefsOpen}
        onClose={() => setPrefsOpen(false)}
        title="Cookie preferences"
        description="Choose which optional cookies we can use. You can change this at any time from the footer."
        footer={
          <>
            <Button variant="outline" onClick={() => setPrefsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                writeConsent({ analytics, marketing });
                setPrefsOpen(false);
              }}
            >
              Save preferences
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <Checkbox checked disabled label="Strictly necessary" description="Session storage used to submit forms and remember these choices. Always on." onChange={() => undefined} />
          <Checkbox
            checked={analytics}
            onChange={(e) => setAnalytics(e.target.checked)}
            label="Analytics"
            description="Google Analytics 4 and our own first-party event log. Helps us see which pages and campaigns are useful."
          />
          <Checkbox
            checked={marketing}
            onChange={(e) => setMarketing(e.target.checked)}
            label="Advertising"
            description="Meta Pixel and Google Ads conversion tracking. Lets us measure and improve our own ads."
          />
        </div>
      </Modal>
    </>
  );
}
