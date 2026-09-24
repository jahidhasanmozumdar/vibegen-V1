import Link from "next/link";
import { CalendarRange } from "lucide-react";

import { RANGE_KEYS, rangeLabels, type DateRange } from "@/lib/services/admin/date-range";
import { buildHref } from "@/lib/services/admin/query";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const shortLabels: Record<(typeof RANGE_KEYS)[number], string> = { "7d": "7D", "30d": "30D", "90d": "90D", "6m": "6M", "12m": "12M", custom: "Custom" };

/**
 * Segmented date-range control driven by URL params (works without JS).
 * Custom range is a small GET form behind a disclosure.
 */
export function DateRangePicker({ basePath, range, extra = {} }: { basePath: string; range: DateRange; extra?: Record<string, string | undefined> }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <nav aria-label="Date range" className="inline-flex rounded-full border border-hair bg-white p-0.5">
        {RANGE_KEYS.filter((k) => k !== "custom").map((key) => {
          const active = range.key === key;
          return (
            <Link
              key={key}
              href={buildHref(basePath, { ...extra, range: key })}
              aria-current={active ? "true" : undefined}
              aria-label={`Last ${rangeLabels[key]}`}
              scroll={false}
              className={cn(
                "inline-flex h-7 min-w-10 items-center justify-center rounded-full px-2.5 text-[12.5px] font-medium transition-colors",
                active ? "bg-soft text-fg shadow-[inset_0_0_0_1px_#e8e8ec]" : "text-fg-3 hover:text-fg",
              )}
            >
              {shortLabels[key]}
            </Link>
          );
        })}
      </nav>
      <details className="group relative">
        <summary
          className={cn(
            "inline-flex h-8 cursor-pointer list-none items-center gap-1.5 rounded-full border px-3 text-[12.5px] font-medium [&::-webkit-details-marker]:hidden",
            range.key === "custom" ? "border-transparent bg-fg text-white" : "border-hair bg-white text-fg-2 hover:text-fg",
          )}
        >
          <CalendarRange className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
          {range.key === "custom" ? range.label : "Custom"}
        </summary>
        <form action={basePath} method="get" className="absolute right-0 z-30 mt-2 w-64 rounded-[14px] border border-hair bg-white p-3 shadow-[0_20px_48px_-20px_rgb(10_13_20/0.28)]">
          {Object.entries(extra).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
          <input type="hidden" name="range" value="custom" />
          <div className="grid grid-cols-2 gap-2">
            <label className="text-[12.5px] font-medium text-fg-2">
              From
              <input type="date" name="from" required defaultValue={range.fromInput} className="h-9 rounded-[10px] border border-[#d9dbe1] bg-white text-[13.5px] text-fg placeholder:text-fg-3 transition-[border-color,box-shadow] hover:border-[#c3c6ce] focus:border-brand focus:shadow-[0_0_0_3px_rgb(10_108_255/0.14)] focus:outline-none mt-1 w-full px-2" />
            </label>
            <label className="text-[12.5px] font-medium text-fg-2">
              To
              <input type="date" name="to" required defaultValue={range.toInput} className="h-9 rounded-[10px] border border-[#d9dbe1] bg-white text-[13.5px] text-fg placeholder:text-fg-3 transition-[border-color,box-shadow] hover:border-[#c3c6ce] focus:border-brand focus:shadow-[0_0_0_3px_rgb(10_108_255/0.14)] focus:outline-none mt-1 w-full px-2" />
            </label>
          </div>
          <button type="submit" className={buttonClasses("primary", "sm", "mt-3 w-full")}>
            Apply range
          </button>
        </form>
      </details>
    </div>
  );
}
