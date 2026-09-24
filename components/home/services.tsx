import { ArrowRight, Check, Search } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { defaultServices } from "@/lib/content/services";
import { cn } from "@/lib/utils/cn";

/* Small high-fidelity previews — one per service. Sample content only. */

function MetaPreview() {
  return (
    <div className="mx-auto w-[15.5rem] rounded-[12px] border border-hair bg-white p-3 shadow-[0_16px_32px_-18px_rgb(10_13_20/0.25)]">
      <div className="flex items-center gap-2">
        <span className="size-6 rounded-full bg-[#dfe7ff]" />
        <div className="leading-tight">
          <p className="text-[11.5px] font-semibold">Your brand</p>
          <p className="text-[10px] text-fg-3">Sponsored</p>
        </div>
      </div>
      <p className="mt-2 text-[11.5px] leading-snug text-fg-2">Kitchen refit quotes in 48 hours. See a price range first.</p>
      <div className="mt-2 h-20 rounded-[8px] bg-[linear-gradient(135deg,#dfe7ff,#efe4ff)]" />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10.5px] text-fg-3">yourbrand.com</span>
        <span className="rounded-[6px] bg-[#f1f2f4] px-2 py-1 text-[10.5px] font-medium">Get quote</span>
      </div>
    </div>
  );
}

function GooglePreview() {
  const rows = [
    { term: "kitchen refit cost near me", conv: 14, keep: true },
    { term: "kitchen refit quote", conv: 9, keep: true },
    { term: "free kitchen design software", conv: 0, keep: false },
  ];
  return (
    <div className="mx-auto w-full max-w-[20rem] rounded-[12px] border border-hair bg-white p-3 shadow-[0_16px_32px_-18px_rgb(10_13_20/0.25)]">
      <div className="flex items-center gap-2 rounded-full border border-hair px-3 py-1.5 text-[11.5px] text-fg-2">
        <Search className="size-3.5" /> Search terms · last 30 days
      </div>
      <ul className="mt-2 divide-y divide-hair">
        {rows.map((r) => (
          <li key={r.term} className="flex items-center justify-between gap-2 py-2 text-[11.5px]">
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

function PagePreview() {
  return (
    <div className="mx-auto w-[15rem] overflow-hidden rounded-[12px] border border-hair bg-white shadow-[0_16px_32px_-18px_rgb(10_13_20/0.25)]">
      <div className="flex gap-1 border-b border-hair px-2.5 py-2">
        <span className="size-1.5 rounded-full bg-[#e5e5e8]" />
        <span className="size-1.5 rounded-full bg-[#e5e5e8]" />
        <span className="size-1.5 rounded-full bg-[#e5e5e8]" />
      </div>
      <div className="p-3.5">
        <p className="text-[13px] leading-tight font-semibold tracking-tight">See your refit price range first.</p>
        <div className="mt-2 h-1.5 w-11/12 rounded bg-[#f1f2f4]" />
        <div className="mt-1.5 h-1.5 w-8/12 rounded bg-[#f1f2f4]" />
        <div className="mt-3 space-y-1.5">
          <div className="h-6 rounded-[6px] border border-hair" />
          <div className="h-6 rounded-[6px] border border-hair" />
        </div>
        <div className="mt-2.5 h-7 rounded-[7px] bg-fg" />
        <p className="mt-2.5 flex items-center gap-1 text-[10.5px] text-[#0f7a3d]">
          <Check className="size-3" /> Matches the ad&rsquo;s promise
        </p>
      </div>
    </div>
  );
}

function CroPreview() {
  return (
    <div className="mx-auto w-full max-w-[20rem] rounded-[12px] border border-hair bg-white p-4 shadow-[0_16px_32px_-18px_rgb(10_13_20/0.25)]">
      <div className="flex items-center justify-between text-[11.5px]">
        <span className="font-medium">Test: shorter quote form</span>
        <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-medium text-brand">Running</span>
      </div>
      {[
        { l: "A · 11 fields", v: 3.1, w: 52 },
        { l: "B · 4 fields", v: 5.4, w: 90 },
      ].map((r, i) => (
        <div key={r.l} className="mt-3">
          <div className="flex justify-between text-[11px] text-fg-2">
            <span>{r.l}</span>
            <span className="font-medium text-fg tabular-nums">{r.v}%</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-[#f1f2f4]">
            <div className={cn("h-full rounded-full", i ? "bg-brand" : "bg-[#c4c8d0]")} style={{ width: `${r.w}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function TrackingPreview() {
  const events = [
    { e: "page_view", t: "10:42:03" },
    { e: "form_start", t: "10:42:31" },
    { e: "generate_lead", t: "10:43:10" },
  ];
  return (
    <div className="mx-auto w-full max-w-[20rem] rounded-[12px] border border-hair bg-white p-3 font-mono shadow-[0_16px_32px_-18px_rgb(10_13_20/0.25)]">
      <p className="px-1 text-[10.5px] text-fg-3 uppercase">Event debugger</p>
      <ul className="mt-2 space-y-1">
        {events.map((ev) => (
          <li key={ev.e} className="flex items-center justify-between rounded-[7px] bg-[#fbfbfa] px-2.5 py-1.5 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[#12a150]" />
              {ev.e}
            </span>
            <span className="text-fg-3">{ev.t}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 px-1 text-[10.5px] text-[#0f7a3d]">✓ GA4 · Google Ads · Meta CAPI</p>
    </div>
  );
}

const previews: Record<string, ReactNode> = {
  "meta-ads": <MetaPreview />,
  "google-ads": <GooglePreview />,
  "landing-pages": <PagePreview />,
  cro: <CroPreview />,
  analytics: <TrackingPreview />,
};

// The problem each part solves — ties the solution back to the diagnosis.
const solves: Record<string, string> = {
  "meta-ads": "Clicks from people who were never going to buy",
  "google-ads": "Paying for searches that never convert",
  "landing-pages": "Ads that land on a page that doesn’t match",
  cro: "Visitors who arrive but don’t act",
  analytics: "Numbers nobody trusts enough to decide with",
};

// Bento spans on large screens: two wide cards on top, three below.
const spans: Record<string, string> = {
  "meta-ads": "lg:col-span-3",
  "google-ads": "lg:col-span-3",
  "landing-pages": "lg:col-span-2",
  cro: "lg:col-span-2",
  analytics: "lg:col-span-2",
};

export function Services() {
  const services = defaultServices.filter((s) => s.status === "published").sort((a, b) => a.sort_order - b.sort_order);

  return (
    <section aria-labelledby="services-title" className="bg-soft py-24 lg:py-32">
      <div className="pm-wrap">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <div>
            <p className="pm-eyebrow">The solution</p>
            <h2 id="services-title" className="pm-h2 mt-5">
              One system, in <span className="pm-serif text-brand">five</span> parts.
            </h2>
          </div>
          <p className="pm-lede max-w-md lg:justify-self-end">Each service fixes one stage of your funnel. Together they turn paid clicks into leads you can trace.</p>
        </div>

        <ul className="mt-14 grid gap-4 lg:grid-cols-6">
          {services.map((s) => (
            <li key={s.slug} className={spans[s.slug]}>
              <Link href={`/services/${s.slug}`} className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-hair bg-white transition-shadow hover:shadow-[0_24px_48px_-24px_rgb(10_13_20/0.22)]">
                <div className="flex h-60 items-center justify-center bg-[radial-gradient(120%_90%_at_50%_0%,#fbfbfa,#f3f3f0)] px-6 transition-transform duration-500 group-hover:scale-[1.02]">
                  {previews[s.slug]}
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <h3 className="pm-h3">{s.name}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-fg-2">{s.tagline}</p>
                  {solves[s.slug] ? (
                    <p className="mt-4 flex items-start gap-2 rounded-[12px] bg-soft px-3 py-2.5 text-[13.5px] leading-snug">
                      <span className="shrink-0 font-mono text-[11px] leading-[1.7] tracking-[0.04em] text-brand uppercase">Solves</span>
                      <span className="text-fg-2">{solves[s.slug]}</span>
                    </p>
                  ) : null}
                  <span className="mt-auto flex items-center gap-1.5 pt-6 text-[14.5px] font-medium text-brand">
                    Learn more
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-center text-[12.5px] text-fg-3">Previews are illustrative sample screens, not client data.</p>
      </div>
    </section>
  );
}
