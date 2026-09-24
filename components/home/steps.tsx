import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { cta } from "@/lib/config/site";

const steps = [
  {
    when: "Week 1",
    title: "Free growth audit",
    body: "Tell us about your business. A person reviews your ads, landing pages and tracking, and sends a written list of what to fix first.",
  },
  {
    when: "Weeks 2–4",
    title: "We fix, build and launch",
    body: "Tracking set up properly, campaigns restructured, landing pages built to match the ads. Then we launch and watch closely.",
  },
  {
    when: "Month 2 onward",
    title: "Improve every month",
    body: "We cut what doesn't work, test new ideas and move budget toward what brings leads. You get clear, regular reports.",
  },
];

/** "How it works" in three plain steps with timing. */
export function Steps() {
  return (
    <section aria-labelledby="steps-title" className="py-24 lg:py-28">
      <div className="pm-wrap">
        <div className="mx-auto max-w-2xl text-center">
          <p className="pm-eyebrow">How it works</p>
          <h2 id="steps-title" className="pm-h2 mt-5">
            Three steps. <span className="pm-serif">No guesswork.</span>
          </h2>
        </div>

        <ol className="mt-14 grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="relative rounded-[24px] bg-soft p-8">
              <div className="flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-full bg-fg text-[15px] font-medium text-white">{i + 1}</span>
                <span className="rounded-full bg-white px-3 py-1 text-[12.5px] text-fg-2">{s.when}</span>
              </div>
              <h3 className="mt-8 text-[20px] font-semibold tracking-[-0.025em]">{s.title}</h3>
              <p className="mt-3 text-[15.5px] leading-relaxed text-fg-2">{s.body}</p>
              {i < steps.length - 1 ? (
                <ArrowRight className="absolute top-1/2 -right-3.5 z-10 hidden size-7 -translate-y-1/2 rounded-full border border-hair bg-white p-1.5 text-fg-3 md:block" aria-hidden="true" />
              ) : null}
            </li>
          ))}
        </ol>

        <div className="mt-10 text-center">
          <Link href={cta.primary.href} className="pm-btn pm-btn-dark">
            Start with step 1: {cta.primary.label}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
