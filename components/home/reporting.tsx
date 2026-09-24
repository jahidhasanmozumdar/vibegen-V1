import { Check } from "lucide-react";

import { ProductShot } from "./product-shot";

const shows = ["Spend and leads by channel", "Cost per lead, and the trend", "Where visitors drop out of the funnel", "What we changed, and what’s next"];

/** Proof section: what the client actually sees each month. */
export function Reporting() {
  return (
    <section aria-labelledby="reporting-title" className="py-24 lg:py-32">
      <div className="pm-wrap grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <p className="pm-eyebrow">The result</p>
          <h2 id="reporting-title" className="pm-h2 mt-5">
            Every dollar, <span className="pm-serif text-brand">accounted for.</span>
          </h2>
          <p className="pm-lede mt-5">When the system works, the numbers in GA4, Google, Meta and your CRM finally agree, so decisions get easy.</p>
          <ul className="mt-8 space-y-3">
            {shows.map((s) => (
              <li key={s} className="flex items-start gap-3 text-[15.5px] text-fg-2">
                <Check className="mt-0.5 size-4.5 shrink-0 text-brand" strokeWidth={2.5} aria-hidden="true" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-8">
          <div className="rounded-[28px] bg-soft p-3 sm:p-6">
            <ProductShot />
          </div>
          <p className="mt-4 text-center text-[13px] text-fg-3">What your reporting looks like. Sample data, not a real client.</p>
        </div>
      </div>
    </section>
  );
}
