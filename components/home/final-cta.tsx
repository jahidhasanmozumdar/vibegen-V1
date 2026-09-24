import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Ribbon } from "@/components/art/ribbon";
import { cta } from "@/lib/config/site";

/** Closing band on the soft canvas with the silk ribbon running underneath. */
export function FinalCta({ title = "Turn your paid traffic into a measurable growth system." }: { title?: string }) {
  return (
    <section aria-labelledby="final-title" className="pm-wrap pt-6 pb-24">
      <div className="relative overflow-hidden rounded-[32px] bg-soft px-6 py-20 text-center sm:px-12 lg:py-28">
        <Ribbon preset="band" lines={56} opacity={0.75} className="pointer-events-none absolute inset-x-0 bottom-0 h-[75%] w-full" />
        <div className="relative">
          <h2 id="final-title" className="pm-h2 mx-auto max-w-[22ch]">
            {title}
          </h2>
          <p className="pm-lede mx-auto mt-5 max-w-xl">Let&rsquo;s find the gaps in your acquisition funnel before you spend more money sending traffic into it.</p>
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
