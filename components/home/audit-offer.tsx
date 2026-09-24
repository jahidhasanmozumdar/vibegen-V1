import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

import { Ribbon } from "@/components/art/ribbon";
import { cta } from "@/lib/config/site";

const covers = [
  "Campaign structure, targeting and wasted spend",
  "Landing page clarity, speed and message match",
  "Offer and form friction",
  "GA4, GTM, Pixel and conversion tracking accuracy",
  "A prioritized list of what to fix first",
];

const findings = [
  { sev: "High", tone: "bg-[#3b1d1a] text-[#ff9b8a]", text: "Conversions counted twice in GA4 and Google Ads" },
  { sev: "High", tone: "bg-[#3b1d1a] text-[#ff9b8a]", text: "All ads land on the homepage, not a matching page" },
  { sev: "Medium", tone: "bg-[#382c12] text-[#ffc861]", text: "Broad match keywords without negatives" },
  { sev: "Low", tone: "bg-[#12302a] text-[#5fe0c4]", text: "UTM naming inconsistent across Meta campaigns" },
];

/** The offer on an ink stage: what the audit covers, and what the output looks like. */
export function AuditOffer() {
  return (
    <section aria-labelledby="audit-title" className="pm-wrap py-6">
      <div className="relative overflow-hidden rounded-[32px] bg-fg px-6 py-16 text-white sm:px-12 lg:px-16 lg:py-24">
        <Ribbon preset="band" lines={48} opacity={0.45} className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] w-full" />

        <div className="relative grid gap-14 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="font-mono text-[12px] tracking-wide text-white/50 uppercase">The free growth audit</p>
            <h2 id="audit-title" className="pm-h2 mt-5">
              See where your budget <span className="pm-serif text-[#7fb2ff]">leaks</span>, before you spend more.
            </h2>
            <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-white/65">A real review of your acquisition funnel, written by a person. Free, and without obligation.</p>
            <ul className="mt-8 space-y-3">
              {covers.map((c) => (
                <li key={c} className="flex items-start gap-3 text-[15.5px] text-white/85">
                  <Check className="mt-0.5 size-4.5 shrink-0 text-[#7fb2ff]" strokeWidth={2.5} aria-hidden="true" />
                  {c}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href={cta.primary.href} className="pm-btn bg-white text-fg hover:bg-white/90">
                {cta.primary.label}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <span className="text-[14px] text-white/50">Written reply within 2 business days.</span>
            </div>
          </div>

          <div className="self-center">
            <div className="rounded-[18px] border border-white/10 bg-[#141925] p-2 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.6)]">
              <div className="flex items-center justify-between px-4 pt-3 pb-4">
                <p className="text-[14px] font-medium">Growth audit · findings</p>
                <span className="rounded-full border border-white/15 px-2.5 py-0.5 font-mono text-[10.5px] text-white/60 uppercase">Sample</span>
              </div>
              <ul className="space-y-1.5">
                {findings.map((f) => (
                  <li key={f.text} className="flex items-center gap-3.5 rounded-[12px] bg-white/[0.04] px-4 py-3.5">
                    <span className={`w-16 shrink-0 rounded-full py-0.5 text-center text-[11px] font-medium ${f.tone}`}>{f.sev}</span>
                    <span className="text-[14px] text-white/85">{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
