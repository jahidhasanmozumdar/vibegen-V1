import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

import { Ribbon } from "@/components/art/ribbon";
import { FinalCta as HomeFinalCta } from "@/components/home/final-cta";
import { cta } from "@/lib/config/site";

/** §121 — final CTA (homepage and key pages). Same component as the homepage. */
export function FinalCta() {
  return <HomeFinalCta />;
}

const covers = ["Acquisition", "Landing pages", "Conversion", "Tracking"];

/** §97 — pre-footer CTA on inner pages ("Premium Calm"). */
export function FooterCta() {
  return (
    <section aria-labelledby="footer-cta" className="pm-wrap pt-10 pb-24">
      <div className="relative overflow-hidden rounded-[32px] bg-soft px-6 py-16 text-center sm:px-12 lg:py-24">
        <Ribbon preset="band" lines={48} opacity={0.6} className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] w-full" />
        <div className="relative">
          <p className="pm-eyebrow">Next step</p>
          <h2 id="footer-cta" className="pm-h2 mx-auto mt-4 max-w-3xl">
            Ready to see where your funnel is <span className="pm-serif">leaking?</span>
          </h2>
          <p className="pm-lede mx-auto mt-5 max-w-xl">Get a practical growth audit covering acquisition, landing pages, conversion and tracking.</p>
          <ul className="mx-auto mt-6 flex max-w-2xl flex-wrap justify-center gap-x-6 gap-y-2" aria-label="The audit covers">
            {covers.map((c) => (
              <li key={c} className="flex items-center gap-2 text-[14.5px] text-fg-2">
                <Check className="size-4 text-[#12a150]" strokeWidth={2.5} aria-hidden="true" />
                {c}
              </li>
            ))}
          </ul>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={cta.primary.href} className="pm-btn pm-btn-dark">
              {cta.primary.label}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href={cta.secondary.href} className="pm-btn pm-btn-light">
              {cta.secondary.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
