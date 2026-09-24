"use client";

import "./globals.css";

import { Wordmark } from "@/components/brand/logo-mark";
import { buttonClasses } from "@/components/ui/button";

/** Replaces the root layout when it fails, so it renders its own document. No error details shown. */
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-white font-sans text-fg antialiased">
        <title>Something went wrong — VibeGen</title>
        <div className="flex min-h-dvh flex-col">
          <header className="border-b border-hair">
            <div className="pm-wrap flex h-16 items-center gap-2">
              <Wordmark />
            </div>
          </header>
          <main className="flex-1">
            <div className="pm-wrap pt-16 pb-24 sm:pt-24">
              <div className="max-w-2xl">
                <p className="pm-eyebrow">Error</p>
                <h1 className="pm-h1 mt-4 text-[clamp(2.4rem,1.2rem+3.6vw,4.2rem)]">
                  Something went <span className="pm-serif text-brand">wrong.</span>
                </h1>
                <p className="pm-lede mt-6">Nothing you did. We couldn&apos;t load this page, so please try again in a moment.</p>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <button type="button" onClick={() => retry()} className={buttonClasses("primary", "lg")}>
                    Try Again
                  </button>
                  {/* A plain anchor forces a full reload, which is what we want after a root failure. */}
                  {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                  <a href="/" className={buttonClasses("outline", "lg")}>
                    Back to Home
                  </a>
                </div>
              </div>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
