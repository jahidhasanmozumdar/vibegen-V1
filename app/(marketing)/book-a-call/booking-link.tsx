"use client";

import { ArrowUpRight } from "lucide-react";

import { buttonClasses } from "@/components/ui/button";
import { track } from "@/lib/tracking/events";

/** External booking link (Calendly, Cal.com, etc.) that records the click before leaving. */
export function BookingLink({ href, provider }: { href: string; provider: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonClasses("primary", "lg")}
      onClick={() => {
        track("external_booking_click", { provider });
        track("book_call_click", { location: "book_a_call" });
      }}
    >
      Choose a time
      <ArrowUpRight className="size-4" aria-hidden="true" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}
