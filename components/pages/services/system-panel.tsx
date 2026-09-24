import { CheckCircle2, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils/cn";

import { SampleTag } from "./shared";

/*
 * "Funnel health" sample screen for the services index hero: one row per
 * stage, the service that owns it, and a status. All numbers are made up.
 */
const stages = [
  { stage: "Attract", service: "Meta Ads + Google Ads", metric: "7,120 clicks", status: "ok", note: "Search terms reviewed" },
  { stage: "Capture", service: "Landing pages", metric: "6,380 views", status: "ok", note: "Matches ad offer" },
  { stage: "Convert", service: "CRO", metric: "5.8% conv. rate", status: "warn", note: "Form drop-off high" },
  { stage: "Measure", service: "Analytics & Tracking", metric: "412 leads", status: "ok", note: "GA4 = CRM ± 3%" },
] as const;

export function SystemPanel() {
  return (
    <div className="overflow-hidden rounded-[16px] border border-hair bg-white shadow-[0_1px_2px_rgb(10_13_20/0.04),0_40px_80px_-36px_rgb(10_13_20/0.3)]">
      <div className="flex items-center gap-2 border-b border-hair bg-[#fbfbfa] px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-[#e5e5e8]" />
        <span className="size-2.5 rounded-full bg-[#e5e5e8]" />
        <span className="size-2.5 rounded-full bg-[#e5e5e8]" />
        <span className="ml-2 truncate font-mono text-[11px] text-fg-3">Funnel health · last 90 days</span>
        <SampleTag className="ml-auto" />
      </div>
      <ol className="divide-y divide-hair">
        {stages.map((s, i) => (
          <li key={s.stage} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3.5">
            <span className="grid size-7 place-items-center rounded-full bg-soft font-mono text-[11px] text-fg-2">{i + 1}</span>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold tracking-tight">
                {s.stage} <span className="font-normal text-fg-3">· {s.service}</span>
              </p>
              <p className={cn("mt-0.5 flex items-center gap-1.5 text-[11.5px]", s.status === "ok" ? "text-[#0f7a3d]" : "text-[#b54708]")}>
                {s.status === "ok" ? <CheckCircle2 className="size-3.5" /> : <TriangleAlert className="size-3.5" />}
                {s.note}
              </p>
            </div>
            <span className="text-[12.5px] font-medium tabular-nums">{s.metric}</span>
          </li>
        ))}
      </ol>
      <div className="border-t border-hair bg-[#fbfbfa] px-4 py-3 text-[12px] text-fg-2">
        <span className="font-medium text-fg">Next month:</span> shorten the quote form, then re-check conversion rate.
      </div>
    </div>
  );
}
