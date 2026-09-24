import { Target } from "lucide-react";

import { SampleTag } from "@/components/pages/services/shared";
import type { Industry, IndustrySlug } from "@/lib/data/types";
import { cn } from "@/lib/utils/cn";

/*
 * Illustrative funnel screens for the industry pages. Numbers are made up and
 * labelled; the point is which step we optimize for.
 */

interface Step {
  label: string;
  value: string;
  w: number;
}

export const industryFunnels: Record<IndustrySlug, { goal: string; target: number; steps: Step[]; note: string }> = {
  saas: {
    goal: "Qualified demos",
    target: 3,
    steps: [
      { label: "Ad clicks", value: "4,800", w: 100 },
      { label: "Signups", value: "620", w: 46 },
      { label: "Activated", value: "210", w: 26 },
      { label: "Demo booked", value: "64", w: 14 },
      { label: "Paid", value: "18", w: 6 },
    ],
    note: "Bidding trained on booked demos, not raw signups.",
  },
  "home-services": {
    goal: "Booked jobs",
    target: 3,
    steps: [
      { label: "Local clicks", value: "2,300", w: 100 },
      { label: "Calls + forms", value: "240", w: 40 },
      { label: "Quotes sent", value: "130", w: 26 },
      { label: "Jobs booked", value: "58", w: 14 },
    ],
    note: "Calls tracked alongside forms, so every lead is counted.",
  },
  "professional-services": {
    goal: "Qualified consultations",
    target: 2,
    steps: [
      { label: "Ad clicks", value: "1,900", w: 100 },
      { label: "Enquiries", value: "150", w: 36 },
      { label: "Qualified consults", value: "46", w: 18 },
      { label: "New clients", value: "12", w: 7 },
    ],
    note: "Qualifying questions filter out poor-fit enquiries.",
  },
  ecommerce: {
    goal: "Profitable purchases",
    target: 3,
    steps: [
      { label: "Ad clicks", value: "12,400", w: 100 },
      { label: "Product views", value: "9,100", w: 78 },
      { label: "Add to cart", value: "1,050", w: 30 },
      { label: "Purchases", value: "372", w: 14 },
    ],
    note: "Purchase value and margin passed back to the platforms.",
  },
};

/** Hero visual for an industry detail page. */
export function IndustryFunnel({ slug }: { slug: IndustrySlug }) {
  const f = industryFunnels[slug];
  return (
    <div className="overflow-hidden rounded-[16px] border border-hair bg-white shadow-[0_1px_2px_rgb(10_13_20/0.04),0_40px_80px_-36px_rgb(10_13_20/0.3)]">
      <div className="flex items-center gap-2 border-b border-hair bg-[#fbfbfa] px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-[#e5e5e8]" />
        <span className="size-2.5 rounded-full bg-[#e5e5e8]" />
        <span className="size-2.5 rounded-full bg-[#e5e5e8]" />
        <span className="ml-2 truncate font-mono text-[11px] text-fg-3">Funnel · last 30 days</span>
        <SampleTag className="ml-auto">Illustrative</SampleTag>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[14px] font-semibold tracking-tight">Conversion we optimize for</p>
          <span className="flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-1 text-[11.5px] font-medium text-brand">
            <Target className="size-3.5" />
            {f.goal}
          </span>
        </div>
        <ul className="mt-5 space-y-3.5">
          {f.steps.map((s, i) => {
            const target = i === f.target;
            return (
              <li key={s.label} className={cn(target && "-mx-2.5 rounded-[10px] bg-[#f3f7ff] px-2.5 py-2 ring-1 ring-[#cfe0ff]")}>
                <div className="flex justify-between text-[12px]">
                  <span className={cn(target ? "font-medium text-fg" : "text-fg-2")}>
                    {s.label}
                    {target ? <span className="ml-2 text-[10.5px] text-brand">← bidding target</span> : null}
                  </span>
                  <span className="font-medium tabular-nums">{s.value}</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-[#f1f2f4]">
                  <div className={cn("h-full rounded-full", target ? "bg-brand" : "bg-[#b9c3d3]")} style={{ width: `${s.w}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-5 border-t border-hair pt-4 text-[12px] text-fg-2">{f.note}</p>
      </div>
    </div>
  );
}

/** Hero visual for the industries index: the conversion each funnel is built around. */
export function FunnelTypes({ industries }: { industries: Industry[] }) {
  return (
    <div className="overflow-hidden rounded-[16px] border border-hair bg-white shadow-[0_1px_2px_rgb(10_13_20/0.04),0_40px_80px_-36px_rgb(10_13_20/0.3)]">
      <div className="flex items-center gap-2 border-b border-hair bg-[#fbfbfa] px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-[#e5e5e8]" />
        <span className="size-2.5 rounded-full bg-[#e5e5e8]" />
        <span className="size-2.5 rounded-full bg-[#e5e5e8]" />
        <span className="ml-2 truncate font-mono text-[11px] text-fg-3">Funnel plans</span>
        <SampleTag className="ml-auto">Illustrative</SampleTag>
      </div>
      <table className="w-full text-left text-[12.5px]">
        <thead>
          <tr className="text-[11px] text-fg-3">
            <th className="px-4 pt-3 pb-2 font-normal">Industry</th>
            <th className="px-4 pt-3 pb-2 font-normal">Optimize for</th>
            <th className="px-4 pt-3 pb-2 font-normal max-sm:hidden">Path</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hair border-t border-hair">
          {industries.map((ind) => {
            const f = industryFunnels[ind.slug];
            if (!f) return null;
            return (
              <tr key={ind.slug}>
                <td className="px-4 py-3 font-medium">{ind.name}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-brand">{f.goal}</span>
                </td>
                <td className="px-4 py-3 text-[11.5px] text-fg-3 max-sm:hidden">{f.steps.map((s) => s.label).join(" → ")}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
