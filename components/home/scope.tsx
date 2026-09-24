import { Check, KeyRound } from "lucide-react";

import { clientOwnership, serviceScope } from "@/lib/content/pricing";

/** Who does what — removes the biggest uncertainty before a first call. */
export function Scope() {
  return (
    <section aria-labelledby="scope-title" className="py-24 lg:py-28">
      <div className="pm-wrap">
        <div className="mx-auto max-w-2xl text-center">
          <p className="pm-eyebrow">Who does what</p>
          <h2 id="scope-title" className="pm-h2 mt-5">
            Clear roles from <span className="pm-serif">day one.</span>
          </h2>
        </div>

        <div className="mt-14 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <div className="pm-card p-8">
            <h3 className="text-[17px] font-semibold tracking-[-0.02em]">We handle</h3>
            <ul className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {serviceScope.weHandle.map((x) => (
                <li key={x} className="flex items-start gap-2.5 text-[15px] text-fg-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand" strokeWidth={2.5} aria-hidden="true" />
                  {x}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[20px] bg-soft p-8">
              <h3 className="text-[17px] font-semibold tracking-[-0.02em]">You provide</h3>
              <ul className="mt-5 flex flex-wrap gap-2">
                {serviceScope.clientProvides.map((x) => (
                  <li key={x} className="rounded-full bg-white px-3 py-1.5 text-[14px] text-fg-2">
                    {x}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-[13.5px] leading-relaxed text-fg-3">{serviceScope.note}</p>
            </div>
            <div className="rounded-[20px] bg-fg p-8 text-white">
              <h3 className="flex items-center gap-2 text-[17px] font-semibold tracking-[-0.02em]">
                <KeyRound className="size-4.5 text-[#7fb2ff]" aria-hidden="true" />
                You own everything
              </h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-white/70">{clientOwnership.intro}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
