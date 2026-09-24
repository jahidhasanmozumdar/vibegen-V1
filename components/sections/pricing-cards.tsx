import Link from "next/link";
import { ArrowRight, Check, Info, Scale } from "lucide-react";

import { pricingDisclaimer } from "@/lib/content/pricing";
import type { PricingPlan } from "@/lib/data/types";
import { cn } from "@/lib/utils/cn";

const money = (value: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD", maximumFractionDigits: 0 }).format(value);

/**
 * Shared pricing (/pricing): a calm three-column comparison. The plan with a
 * `badge` is the recommended one and sits on the dark card.
 */
export function PricingCards({ plans, className }: { plans: PricingPlan[]; className?: string }) {
  return (
    <ul className={cn("grid gap-4 lg:grid-cols-3 lg:items-stretch", className)}>
      {plans.map((plan) => {
        const hot = Boolean(plan.badge);
        return (
          <li key={plan.id} className={cn("flex flex-col rounded-[24px] p-7 sm:p-8", hot ? "bg-fg text-white shadow-[0_40px_80px_-36px_rgb(10_13_20/0.45)]" : "border border-hair bg-white")}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[18px] font-semibold tracking-[-0.02em]">{plan.name}</h3>
              {hot ? <span className="rounded-full bg-white/10 px-2.5 py-1 text-[12px] font-medium text-white">{plan.badge}</span> : null}
            </div>
            <p className={cn("mt-2 text-[14px] leading-relaxed", hot ? "text-white/65" : "text-fg-3")}>For ad spend of {plan.ad_spend_range}</p>

            <p className="mt-7 flex items-baseline gap-1.5">
              <span className="text-[2.9rem] leading-none font-semibold tracking-[-0.045em] tabular-nums">{money(plan.monthly_price, plan.currency)}</span>
              <span className={cn("text-[14px]", hot ? "text-white/55" : "text-fg-3")}>/ month</span>
            </p>
            <p className={cn("mt-2 text-[13.5px]", hot ? "text-white/55" : "text-fg-3")}>+ {money(plan.setup_fee, plan.currency)} one-time setup</p>

            <p className={cn("mt-6 text-[15px] leading-relaxed", hot ? "text-white/75" : "text-fg-2")}>{plan.description}</p>

            <div className={cn("mt-7 border-t pt-6", hot ? "border-white/10" : "border-hair")}>
              <p className={cn("font-mono text-[11.5px] tracking-wide uppercase", hot ? "text-white/50" : "text-fg-3")}>What&apos;s included</p>
              <ul className="mt-4 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className={cn("flex items-start gap-2.5 text-[14.5px] leading-snug", hot ? "text-white/90" : "text-fg-2")}>
                    <Check className={cn("mt-0.5 size-4 shrink-0", hot ? "text-[#7fb2ff]" : "text-brand")} strokeWidth={2.5} aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto pt-8">
              <Link href={plan.cta_href} className={cn("pm-btn w-full", hot ? "bg-white text-fg hover:bg-white/90" : "pm-btn-light")}>
                {plan.cta_label}
                <ArrowRight className="size-4" aria-hidden="true" />
                <span className="sr-only"> ({plan.name} plan)</span>
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** §21 — the pricing disclaimers: ad spend, no guarantee, what results depend on. */
export function PricingDisclaimer({ className }: { className?: string }) {
  return (
    <aside aria-label="Pricing notes" className={cn("grid gap-4 lg:grid-cols-3", className)}>
      <div className="rounded-[20px] bg-soft p-7">
        <p className="flex items-center gap-2 text-[16px] font-semibold tracking-[-0.015em]">
          <Info className="size-4 text-brand" aria-hidden="true" />
          Ad spend is separate
        </p>
        <p className="mt-2.5 text-[14.5px] leading-relaxed text-fg-2">{pricingDisclaimer.adSpend}</p>
      </div>
      <div className="rounded-[20px] bg-soft p-7">
        <p className="flex items-center gap-2 text-[16px] font-semibold tracking-[-0.015em]">
          <Scale className="size-4 text-brand" aria-hidden="true" />
          No guaranteed numbers
        </p>
        <p className="mt-2.5 text-[14.5px] leading-relaxed text-fg-2">{pricingDisclaimer.noGuarantee}</p>
      </div>
      <div className="rounded-[20px] bg-soft p-7">
        <p className="text-[16px] font-semibold tracking-[-0.015em]">Results depend on</p>
        <ul className="mt-3.5 flex flex-wrap gap-1.5">
          {pricingDisclaimer.factors.map((f) => (
            <li key={f} className="rounded-full bg-white px-2.5 py-1 text-[13px] text-fg-2">
              {f}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
