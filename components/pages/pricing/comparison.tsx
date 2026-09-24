import { Check, Minus } from "lucide-react";

import type { PricingPlan } from "@/lib/data/types";
import { cn } from "@/lib/utils/cn";

type Cell = true | false | string;

/**
 * Feature-by-feature comparison, derived from the default plan feature lists
 * (lib/content/pricing.ts), keyed by plan slug. Plans with other slugs are
 * skipped here; their cards still list every feature.
 */
const rows: { group: string; items: { label: string; values: Record<string, Cell> }[] }[] = [
  {
    group: "Acquisition",
    items: [
      { label: "Meta Ads", values: { launch: "2 active campaigns", growth: "Multiple campaigns", performance: "Full management" } },
      { label: "Google Ads", values: { launch: "Search campaigns", growth: "Search + advanced keywords", performance: "Full management" } },
      { label: "Retargeting", values: { launch: "Basic", growth: true, performance: "Full-funnel" } },
      { label: "Audience architecture", values: { launch: false, growth: "Prospecting + retargeting", performance: "Advanced" } },
    ],
  },
  {
    group: "Landing pages & CRO",
    items: [
      { label: "Landing pages", values: { launch: "1 campaign page", growth: "Build or optimization", performance: "Up to 2 a month" } },
      { label: "Conversion rate optimization", values: { launch: "Basic", growth: true, performance: "Advanced" } },
    ],
  },
  {
    group: "Tracking",
    items: [
      { label: "GA4, GTM, Meta Pixel", values: { launch: true, growth: true, performance: true } },
      { label: "Conversion tracking", values: { launch: true, growth: true, performance: "Advanced" } },
      { label: "UTM tracking", values: { launch: false, growth: true, performance: true } },
      { label: "Conversions API (CAPI)", values: { launch: false, growth: false, performance: "Where applicable" } },
      { label: "CRM / offline conversions", values: { launch: false, growth: false, performance: "Where feasible" } },
      { label: "Attribution analysis", values: { launch: false, growth: false, performance: true } },
    ],
  },
  {
    group: "Reporting & time with us",
    items: [
      { label: "Reporting", values: { launch: "Monthly", growth: "Bi-weekly + funnel", performance: "Custom" } },
      { label: "Strategy calls", values: { launch: false, growth: "2 a month", performance: "Weekly" } },
    ],
  },
];

function Value({ value, hot }: { value: Cell | undefined; hot: boolean }) {
  if (value === true)
    return (
      <>
        <Check className={cn("mx-auto size-4.5", hot ? "text-brand" : "text-fg")} strokeWidth={2.5} aria-hidden="true" />
        <span className="sr-only">Included</span>
      </>
    );
  if (!value)
    return (
      <>
        <Minus className="mx-auto size-4 text-[#c3c6ce]" aria-hidden="true" />
        <span className="sr-only">Not included</span>
      </>
    );
  return <span className="text-[14px] text-fg-2">{value}</span>;
}

export function PlanComparison({ plans }: { plans: PricingPlan[] }) {
  const cols = plans.filter((p) => rows.some((g) => g.items.some((r) => p.slug in r.values)));
  if (cols.length === 0) return null;

  return (
    <div className="relative overflow-x-auto rounded-[24px] border border-hair bg-white">
      <table className="w-full min-w-[680px] border-collapse text-left">
        <caption className="sr-only">Feature comparison between plans</caption>
        <thead>
          <tr className="border-b border-hair">
            <th scope="col" className="w-[34%] px-6 py-5 text-[13px] font-normal text-fg-3">
              Feature
            </th>
            {cols.map((p) => {
              const hot = Boolean(p.badge);
              return (
                <th key={p.id} scope="col" className={cn("px-4 py-5 text-center", hot && "bg-brand-soft")}>
                  <span className="block text-[15px] font-semibold tracking-[-0.015em]">{p.name}</span>
                  {hot ? <span className="mt-1 block text-[12px] font-medium text-brand">{p.badge}</span> : null}
                </th>
              );
            })}
          </tr>
        </thead>
        {rows.map((g) => (
          <tbody key={g.group}>
            <tr>
              <th scope="colgroup" colSpan={cols.length + 1} className="bg-soft px-6 py-2.5 font-mono text-[11.5px] font-normal tracking-wide text-fg-3 uppercase">
                {g.group}
              </th>
            </tr>
            {g.items.map((r) => (
              <tr key={r.label} className="border-t border-hair first:border-t-0">
                <th scope="row" className="px-6 py-4 text-[14.5px] font-medium">
                  {r.label}
                </th>
                {cols.map((p) => (
                  <td key={p.id} className={cn("px-4 py-4 text-center", p.badge && "bg-brand-soft/60")}>
                    <Value value={r.values[p.slug]} hot={Boolean(p.badge)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}
