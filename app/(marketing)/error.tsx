"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

const helpful = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/free-growth-audit", label: "Free Growth Audit" },
  { href: "/contact", label: "Contact" },
];

/** Friendly error state for marketing pages. Never shows the error message or stack. */
export default function MarketingError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    // Digest lets us match server logs without exposing details to visitors.
    if (error.digest) console.error(`[marketing] render error ${error.digest}`);
  }, [error]);

  return (
    <section className="bg-white">
      <div className="pm-wrap pt-16 pb-24 sm:pt-24 sm:pb-32">
        <div className="max-w-2xl">
          <p className="pm-eyebrow">
            Error{error.digest ? <span className="ml-2 normal-case">· Ref {error.digest}</span> : null}
          </p>
          <h1 className="pm-h1 mt-4 text-[clamp(2.4rem,1.2rem+3.6vw,4.2rem)]">
            Something went <span className="pm-serif text-brand">wrong.</span>
          </h1>
          <p className="pm-lede mt-6">This page didn&apos;t load properly. It&apos;s usually temporary, so trying again often fixes it.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={() => retry()} icon={<RotateCcw className="size-4" aria-hidden="true" />}>
              Try Again
            </Button>
            <Link href="/" className="pm-btn pm-btn-light">
              Back to Home
            </Link>
          </div>
          <nav aria-label="Helpful links" className="mt-12 border-t border-hair pt-6">
            <ul className="flex flex-wrap gap-2">
              {helpful.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="inline-flex h-9 items-center rounded-full bg-soft px-4 text-[14px] text-fg-2 hover:bg-soft-2 hover:text-fg">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
}
