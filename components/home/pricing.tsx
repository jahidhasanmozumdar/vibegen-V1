import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

import { defaultPricingPlans, pricingDisclaimer } from "@/lib/content/pricing";
import { cn } from "@/lib/utils/cn";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function Pricing() {
  const plans = defaultPricingPlans.filter((p) => p.active).sort((a, b) => a.sort_order - b.sort_order);

  return (
    <section aria-labelledby="pricing-title" className="py-24 lg:py-32">
      <div className="pm-wrap">
        <div className="mx-auto max-w-2xl text-center">
          <p className="pm-eyebrow">Pricing</p>
          <h2 id="pricing-title" className="pm-h2 mt-5">
            Simple monthly plans. <span className="pm-serif">No surprises.</span>
          </h2>
          <p className="pm-lede mx-auto mt-5 max-w-xl">Sized by how much you already spend on ads. Every plan starts by getting tracking right.</p>
        </div>

        <ul className="mt-14 grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => {
            const hot = plan.badge !== null;
            return (
              <li key={plan.slug} className={cn("flex flex-col rounded-[24px] p-8", hot ? "bg-fg text-white" : "border border-hair bg-white")}>
                <div className="flex items-center justify-between">
                  <h3 className="text-[17px] font-semibold tracking-[-0.02em]">{plan.name}</h3>
                  {hot ? <span className="rounded-full bg-white/10 px-2.5 py-1 text-[12px] font-medium">{plan.badge}</span> : null}
                </div>
                <p className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-[2.8rem] leading-none font-semibold tracking-[-0.045em]">{usd.format(plan.monthly_price)}</span>
                  <span className={cn("text-[14px]", hot ? "text-white/55" : "text-fg-3")}>/ month</span>
                </p>
                <p className={cn("mt-2 text-[13.5px]", hot ? "text-white/55" : "text-fg-3")}>
                  + {usd.format(plan.setup_fee)} setup · ad spend {plan.ad_spend_range}
                </p>
                <p className={cn("mt-6 text-[14.5px] leading-relaxed", hot ? "text-white/75" : "text-fg-2")}>{plan.description}</p>
                <ul className={cn("mt-6 space-y-2.5 border-t pt-6", hot ? "border-white/10" : "border-hair")}>
                  {plan.features.slice(0, 7).map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-[14.5px]">
                      <Check className={cn("size-4 shrink-0", hot ? "text-[#7fb2ff]" : "text-brand")} strokeWidth={2.5} aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-8">
                  <Link href={plan.cta_href} className={cn("pm-btn w-full", hot ? "bg-white text-fg hover:bg-white/90" : "pm-btn-light")}>
                    {plan.cta_label}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>

        <p className="mx-auto mt-10 max-w-3xl text-center text-[14px] leading-relaxed text-fg-3">
          <span className="font-medium text-fg-2">Ad spend is separate.</span> {pricingDisclaimer.adSpend} We don&rsquo;t guarantee specific results.{" "}
          <Link href="/pricing" className="pm-link">
            Compare every feature
          </Link>
        </p>
      </div>
    </section>
  );
}
