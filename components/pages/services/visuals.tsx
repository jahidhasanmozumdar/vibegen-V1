import { ArrowRight, Check, CircleAlert, Search, X } from "lucide-react";
import type { ReactNode } from "react";

import type { ServiceSlug } from "@/lib/data/types";
import { cn } from "@/lib/utils/cn";

import { SampleTag } from "./shared";

/*
 * High-fidelity sample UI for the service pages. Every number is made up and
 * every frame says so. All visuals are decorative (aria-hidden by the caller).
 */

const floatShadow = "shadow-[0_1px_2px_rgb(10_13_20/0.04),0_40px_80px_-36px_rgb(10_13_20/0.3)]";

function Frame({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-[16px] border border-hair bg-white", floatShadow, className)}>
      <div className="flex items-center gap-2 border-b border-hair bg-[#fbfbfa] px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-[#e5e5e8]" />
        <span className="size-2.5 rounded-full bg-[#e5e5e8]" />
        <span className="size-2.5 rounded-full bg-[#e5e5e8]" />
        <span className="ml-2 truncate font-mono text-[11px] text-fg-3">{title}</span>
        <SampleTag className="ml-auto">Sample data</SampleTag>
      </div>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero visuals                                                        */
/* ------------------------------------------------------------------ */

function MetaVisual() {
  const rows = [
    { name: "Prospecting · Broad", goal: "Lead", spend: "$2,140", leads: 58, cpl: "$36.90", ok: true },
    { name: "Prospecting · Lookalike 1%", goal: "Lead", spend: "$1,480", leads: 37, cpl: "$40.00", ok: true },
    { name: "Retargeting · 30-day visitors", goal: "Lead", spend: "$620", leads: 21, cpl: "$29.52", ok: true },
    { name: "Old · Traffic campaign", goal: "Link click", spend: "$910", leads: 3, cpl: "$303.33", ok: false },
  ];
  return (
    <div>
      <Frame title="Campaigns · last 30 days">
        <div className="overflow-x-auto p-4">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="text-[11px] text-fg-3">
                <th className="pb-2 font-normal">Campaign</th>
                <th className="pb-2 font-normal max-sm:hidden">Optimizes for</th>
                <th className="pb-2 text-right font-normal">Spend</th>
                <th className="pb-2 text-right font-normal">Leads</th>
                <th className="pb-2 text-right font-normal">CPL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hair border-t border-hair">
              {rows.map((r) => (
                <tr key={r.name} className={cn(!r.ok && "text-fg-3")}>
                  <td className="py-2.5 pr-3">
                    <span className="flex items-center gap-2">
                      <span className={cn("size-1.5 shrink-0 rounded-full", r.ok ? "bg-[#12a150]" : "bg-[#c4c8d0]")} />
                      <span className={cn("truncate", r.ok && "font-medium text-fg")}>{r.name}</span>
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 max-sm:hidden">
                    <span className={cn("rounded-full px-2 py-0.5 text-[10.5px]", r.ok ? "bg-brand-soft text-brand" : "bg-[#fdecea] text-[#b42318]")}>{r.goal}</span>
                  </td>
                  <td className="py-2.5 text-right tabular-nums">{r.spend}</td>
                  <td className="py-2.5 text-right tabular-nums">{r.leads}</td>
                  <td className="py-2.5 text-right font-medium tabular-nums">{r.cpl}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 flex items-center gap-2 rounded-[10px] bg-[#fbfbfa] px-3 py-2 text-[11.5px] text-fg-2">
            <CircleAlert className="size-3.5 shrink-0 text-[#b54708]" />
            Traffic campaign optimizes for clicks, not leads. Recommend pausing and moving budget.
          </p>
        </div>
      </Frame>
    </div>
  );
}

function GoogleVisual() {
  const rows = [
    { term: "kitchen refit cost near me", intent: "High", conv: 14, cost: "$212", keep: true },
    { term: "kitchen refit quote", intent: "High", conv: 9, cost: "$168", keep: true },
    { term: "kitchen fitter reviews", intent: "Medium", conv: 3, cost: "$94", keep: true },
    { term: "kitchen fitter jobs", intent: "None", conv: 0, cost: "$61", keep: false },
    { term: "free kitchen design software", intent: "None", conv: 0, cost: "$88", keep: false },
  ];
  return (
    <Frame title="Search terms · weekly review">
      <div className="p-4">
        <div className="flex items-center gap-2 rounded-full border border-hair px-3 py-1.5 text-[12px] text-fg-2">
          <Search className="size-3.5" /> Search terms · last 7 days
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="text-[11px] text-fg-3">
                <th className="pb-2 font-normal">Search term</th>
                <th className="pb-2 font-normal max-sm:hidden">Intent</th>
                <th className="pb-2 text-right font-normal max-sm:hidden">Cost</th>
                <th className="pb-2 text-right font-normal">Conv.</th>
                <th className="pb-2 text-right font-normal">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hair border-t border-hair">
              {rows.map((r) => (
                <tr key={r.term}>
                  <td className={cn("max-w-[11rem] truncate py-2.5 pr-3", !r.keep && "text-fg-3 line-through")}>{r.term}</td>
                  <td className="py-2.5 pr-3 text-fg-2 max-sm:hidden">{r.intent}</td>
                  <td className="py-2.5 text-right tabular-nums max-sm:hidden">{r.cost}</td>
                  <td className="py-2.5 text-right font-medium tabular-nums">{r.conv}</td>
                  <td className="py-2.5 text-right">
                    {r.keep ? (
                      <span className="rounded-full bg-[#e7f6ed] px-2 py-0.5 text-[10.5px] font-medium text-[#0f7a3d]">Keep</span>
                    ) : (
                      <span className="rounded-full bg-[#fdecea] px-2 py-0.5 text-[10.5px] font-medium whitespace-nowrap text-[#b42318]">Add negative</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11.5px] text-fg-2">
          <span className="font-medium text-fg">$149</span> of spend this week on searches that can’t convert, now blocked.
        </p>
      </div>
    </Frame>
  );
}

function LandingVisual() {
  const checks = ["Headline repeats the ad’s offer", "Price range visible above the fold", "One next step: get a quote", "Lead event fires on submit"];
  return (
    <div className="grid items-center gap-4 sm:grid-cols-[0.8fr_auto_1.2fr]">
      <div className={cn("rounded-[14px] border border-hair bg-white p-3", floatShadow)}>
        <p className="pm-eyebrow text-[10px]">The ad</p>
        <p className="mt-2 text-[12.5px] leading-snug font-medium">Kitchen refit quotes in 48 hours. See a price range first.</p>
        <div className="mt-2 h-14 rounded-[8px] bg-[linear-gradient(135deg,#dfe7ff,#efe4ff)]" />
        <span className="mt-2 inline-block rounded-[6px] bg-[#f1f2f4] px-2 py-1 text-[10.5px] font-medium">Get quote</span>
      </div>
      <ArrowRight className="mx-auto size-5 rotate-90 text-fg-3 sm:rotate-0" />
      <Frame title="yourbrand.com/kitchen-quote">
        <div className="p-4">
          <p className="text-[15px] leading-tight font-semibold tracking-tight">See your kitchen refit price range first.</p>
          <p className="mt-1.5 text-[11.5px] text-fg-2">Written quote within 48 hours. No obligation.</p>
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            <div className="h-7 rounded-[7px] border border-hair px-2 text-[10.5px] leading-7 text-fg-3">Postcode</div>
            <div className="h-7 rounded-[7px] border border-hair px-2 text-[10.5px] leading-7 text-fg-3">Kitchen size</div>
          </div>
          <div className="mt-1.5 h-8 rounded-[8px] bg-fg text-center text-[11px] leading-8 font-medium text-white">Get my price range</div>
          <ul className="mt-3 space-y-1.5 border-t border-hair pt-3">
            {checks.map((c) => (
              <li key={c} className="flex items-center gap-2 text-[11.5px] text-fg-2">
                <Check className="size-3.5 shrink-0 text-[#12a150]" strokeWidth={2.5} />
                {c}
              </li>
            ))}
          </ul>
        </div>
      </Frame>
    </div>
  );
}

function CroVisual() {
  const funnel = [
    { l: "Landing view", v: "100%", w: 100 },
    { l: "Scrolled to form", v: "54%", w: 54 },
    { l: "Form started", v: "18%", w: 18 },
    { l: "Form submitted", v: "6%", w: 6 },
  ];
  return (
    <Frame title="Experiment · quote form">
      <div className="grid gap-4 p-4 sm:grid-cols-2">
        <div className="rounded-[10px] border border-hair p-3.5">
          <p className="text-[12px] font-medium">Where visitors drop off</p>
          <ul className="mt-3 space-y-2.5">
            {funnel.map((f, i) => (
              <li key={f.l}>
                <div className="flex justify-between text-[11px]">
                  <span className="text-fg-2">{f.l}</span>
                  <span className="font-medium tabular-nums">{f.v}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-[#f1f2f4]">
                  <div className={cn("h-full rounded-full", i === 2 ? "bg-[#b54708]" : "bg-brand")} style={{ width: `${Math.max(f.w, 4)}%` }} />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] text-[#b54708]">Biggest drop: form start → submit</p>
        </div>
        <div className="rounded-[10px] border border-hair p-3.5">
          <div className="flex items-center justify-between text-[12px]">
            <span className="font-medium">Hypothesis</span>
            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-medium text-brand">Running</span>
          </div>
          <p className="mt-2 text-[11.5px] leading-snug text-fg-2">Asking 11 questions up front stops people finishing. Four fields will lift submissions.</p>
          {[
            { l: "A · 11 fields", v: "3.1%", w: 52 },
            { l: "B · 4 fields", v: "5.4%", w: 90 },
          ].map((r, i) => (
            <div key={r.l} className="mt-3">
              <div className="flex justify-between text-[11px] text-fg-2">
                <span>{r.l}</span>
                <span className="font-medium text-fg tabular-nums">{r.v}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-[#f1f2f4]">
                <div className={cn("h-full rounded-full", i ? "bg-brand" : "bg-[#c4c8d0]")} style={{ width: `${r.w}%` }} />
              </div>
            </div>
          ))}
          <p className="mt-3 text-[10.5px] text-fg-3">Needs ~2 more weeks of traffic for a clear answer.</p>
        </div>
      </div>
    </Frame>
  );
}

function AnalyticsVisual() {
  const events = [
    { e: "page_view", t: "10:42:03", ok: true },
    { e: "form_start", t: "10:42:31", ok: true },
    { e: "generate_lead", t: "10:43:10", ok: true },
    { e: "generate_lead (duplicate)", t: "10:43:10", ok: false },
  ];
  const recon = [
    { src: "Google Ads", before: 40, after: 13 },
    { src: "Meta Ads", before: 31, after: 11 },
    { src: "GA4", before: 26, after: 24 },
    { src: "CRM (actual)", before: 24, after: 24 },
  ];
  return (
    <Frame title="Tracking audit · lead events">
      <div className="grid gap-4 p-4 sm:grid-cols-[1.1fr_1fr]">
        <div className="rounded-[10px] border border-hair p-3 font-mono">
          <p className="px-1 text-[10.5px] text-fg-3 uppercase">Event debugger</p>
          <ul className="mt-2 space-y-1">
            {events.map((ev) => (
              <li key={ev.e} className={cn("flex items-center justify-between gap-2 rounded-[7px] px-2.5 py-1.5 text-[11px]", ev.ok ? "bg-[#fbfbfa]" : "bg-[#fdecea] text-[#b42318]")}>
                <span className="flex min-w-0 items-center gap-1.5">
                  {ev.ok ? <span className="size-1.5 shrink-0 rounded-full bg-[#12a150]" /> : <X className="size-3 shrink-0" strokeWidth={2.5} />}
                  <span className="truncate">{ev.e}</span>
                </span>
                <span className={ev.ok ? "text-fg-3" : ""}>{ev.t}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 px-1 text-[10.5px] text-[#0f7a3d]">✓ GA4 · Google Ads · Meta CAPI</p>
        </div>
        <div className="rounded-[10px] border border-hair p-3">
          <p className="text-[12px] font-medium">Leads reported, last month</p>
          <table className="mt-2 w-full text-left text-[11.5px]">
            <thead>
              <tr className="text-[10.5px] text-fg-3">
                <th className="pb-1.5 font-normal">Source</th>
                <th className="pb-1.5 text-right font-normal">Before</th>
                <th className="pb-1.5 text-right font-normal">After fix</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hair border-t border-hair">
              {recon.map((r) => (
                <tr key={r.src}>
                  <td className="py-1.5">{r.src}</td>
                  <td className="py-1.5 text-right text-fg-3 tabular-nums">{r.before}</td>
                  <td className="py-1.5 text-right font-medium tabular-nums">{r.after}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-[10.5px] text-fg-3">Platforms now roughly agree with the CRM.</p>
        </div>
      </div>
    </Frame>
  );
}

const heroVisuals: Record<ServiceSlug, () => ReactNode> = {
  "meta-ads": MetaVisual,
  "google-ads": GoogleVisual,
  "landing-pages": LandingVisual,
  cro: CroVisual,
  analytics: AnalyticsVisual,
};

/** The large sample screen for a service's hero. */
export function ServiceVisual({ slug }: { slug: ServiceSlug }) {
  const Visual = heroVisuals[slug];
  return <Visual />;
}

/* ------------------------------------------------------------------ */
/* Mini previews for cards                                             */
/* ------------------------------------------------------------------ */

const miniShadow = "shadow-[0_16px_32px_-18px_rgb(10_13_20/0.25)]";

function MetaMini() {
  return (
    <div className={cn("mx-auto w-[14rem] rounded-[12px] border border-hair bg-white p-3", miniShadow)}>
      <div className="flex items-center gap-2">
        <span className="size-6 rounded-full bg-[#dfe7ff]" />
        <div className="leading-tight">
          <p className="text-[11.5px] font-semibold">Your brand</p>
          <p className="text-[10px] text-fg-3">Sponsored</p>
        </div>
      </div>
      <p className="mt-2 text-[11px] leading-snug text-fg-2">Kitchen refit quotes in 48 hours.</p>
      <div className="mt-2 h-14 rounded-[8px] bg-[linear-gradient(135deg,#dfe7ff,#efe4ff)]" />
    </div>
  );
}

function GoogleMini() {
  const rows = [
    { term: "kitchen refit cost near me", conv: 14, keep: true },
    { term: "free kitchen design software", conv: 0, keep: false },
  ];
  return (
    <div className={cn("mx-auto w-full max-w-[17rem] rounded-[12px] border border-hair bg-white p-3", miniShadow)}>
      <div className="flex items-center gap-2 rounded-full border border-hair px-3 py-1.5 text-[11px] text-fg-2">
        <Search className="size-3.5" /> Search terms
      </div>
      <ul className="mt-2 divide-y divide-hair">
        {rows.map((r) => (
          <li key={r.term} className="flex items-center justify-between gap-2 py-2 text-[11px]">
            <span className={cn("truncate", !r.keep && "text-fg-3 line-through")}>{r.term}</span>
            {r.keep ? (
              <span className="shrink-0 font-medium tabular-nums">{r.conv} conv.</span>
            ) : (
              <span className="shrink-0 rounded-full bg-[#fdecea] px-2 py-0.5 text-[10px] font-medium text-[#b42318]">Negative</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PageMini() {
  return (
    <div className={cn("mx-auto w-[13rem] overflow-hidden rounded-[12px] border border-hair bg-white", miniShadow)}>
      <div className="flex gap-1 border-b border-hair px-2.5 py-2">
        <span className="size-1.5 rounded-full bg-[#e5e5e8]" />
        <span className="size-1.5 rounded-full bg-[#e5e5e8]" />
        <span className="size-1.5 rounded-full bg-[#e5e5e8]" />
      </div>
      <div className="p-3">
        <p className="text-[12px] leading-tight font-semibold tracking-tight">See your refit price range first.</p>
        <div className="mt-2 h-5 rounded-[6px] border border-hair" />
        <div className="mt-2 h-6 rounded-[7px] bg-fg" />
        <p className="mt-2 flex items-center gap-1 text-[10px] text-[#0f7a3d]">
          <Check className="size-3" /> Matches the ad’s promise
        </p>
      </div>
    </div>
  );
}

function CroMini() {
  return (
    <div className={cn("mx-auto w-full max-w-[17rem] rounded-[12px] border border-hair bg-white p-3.5", miniShadow)}>
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-medium">Test: shorter form</span>
        <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-medium text-brand">Running</span>
      </div>
      {[
        { l: "A · 11 fields", w: 52 },
        { l: "B · 4 fields", w: 90 },
      ].map((r, i) => (
        <div key={r.l} className="mt-2.5">
          <p className="text-[10.5px] text-fg-2">{r.l}</p>
          <div className="mt-1 h-2 rounded-full bg-[#f1f2f4]">
            <div className={cn("h-full rounded-full", i ? "bg-brand" : "bg-[#c4c8d0]")} style={{ width: `${r.w}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function AnalyticsMini() {
  return (
    <div className={cn("mx-auto w-full max-w-[17rem] rounded-[12px] border border-hair bg-white p-3 font-mono", miniShadow)}>
      <p className="px-1 text-[10px] text-fg-3 uppercase">Event debugger</p>
      <ul className="mt-2 space-y-1">
        {["page_view", "form_start", "generate_lead"].map((e) => (
          <li key={e} className="flex items-center gap-1.5 rounded-[7px] bg-[#fbfbfa] px-2.5 py-1.5 text-[10.5px]">
            <span className="size-1.5 rounded-full bg-[#12a150]" />
            {e}
          </li>
        ))}
      </ul>
    </div>
  );
}

const minis: Record<ServiceSlug, () => ReactNode> = {
  "meta-ads": MetaMini,
  "google-ads": GoogleMini,
  "landing-pages": PageMini,
  cro: CroMini,
  analytics: AnalyticsMini,
};

/** Small sample preview for service cards. */
export function ServiceMini({ slug }: { slug: ServiceSlug }) {
  const Mini = minis[slug];
  return <Mini />;
}
