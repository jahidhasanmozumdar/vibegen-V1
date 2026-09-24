import { Plus } from "lucide-react";
import Link from "next/link";

import { cta } from "@/lib/config/site";
import { homeFaqs } from "@/lib/content/faqs";

export function Faq() {
  return (
    <section aria-labelledby="faq-title" className="border-t border-hair py-24 lg:py-32">
      <div className="pm-wrap grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <p className="pm-eyebrow">FAQ</p>
          <h2 id="faq-title" className="pm-h2 mt-5">
            Straight <span className="pm-serif">answers.</span>
          </h2>
          <p className="pm-lede mt-5">The questions we hear before almost every first call.</p>
          <p className="mt-7 text-[15px] text-fg-2">
            Something else?{" "}
            <Link href="/contact" className="pm-link">
              Send us a message
            </Link>{" "}
            or{" "}
            <Link href={cta.secondary.href} className="pm-link">
              book a call
            </Link>
            .
          </p>
        </div>

        <div className="divide-y divide-hair border-y border-hair">
          {homeFaqs.map((f, i) => (
            <details key={f.question} className="group" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[17px] font-medium tracking-[-0.015em] [&::-webkit-details-marker]:hidden">
                {f.question}
                <Plus className="size-5 shrink-0 text-fg-3 transition-transform duration-200 group-open:rotate-45" aria-hidden="true" />
              </summary>
              <p className="max-w-2xl pb-6 text-[15.5px] leading-relaxed text-fg-2">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
