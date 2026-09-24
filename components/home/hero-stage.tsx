import { AlertTriangle, Check, Radio, Sparkles } from "lucide-react";
import type { CSSProperties } from "react";

/*
 * The hero's scan stage: a large tilted window where a sample landing page is
 * scanned live — a sweep line runs down the phone, the score counts in,
 * findings appear one by one. Illustration only (labelled).
 */

const checks = [
  { ok: true, label: "Google Analytics 4", note: "Sending data · 3 hits" },
  { ok: true, label: "Meta Pixel", note: "Firing on page view" },
  { ok: false, label: "Google Ads conversion tag", note: "Not firing: Google can’t learn" },
  { ok: false, label: "Main content on mobile", note: "3.8s, target under 2.5s" },
  { ok: true, label: "Call to action on first screen", note: "“Get my quote”" },
  { ok: false, label: "Lead form length", note: "11 fields: mobile visitors drop off" },
];

const R = 34;
const FULL = 2 * Math.PI * R;
const SCORE = 64;

function Phone() {
  return (
    <div className="relative mx-auto w-[210px] rounded-[34px] bg-fg p-2 shadow-[0_30px_60px_-30px_rgb(10_13_20/0.6)]">
      <div className="relative overflow-hidden rounded-[27px] bg-white">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <span className="h-2 w-12 rounded-full bg-[#e8e8ec]" />
          <span className="h-2 w-5 rounded-full bg-[#e8e8ec]" />
        </div>
        <div className="px-4 pb-5">
          <p className="text-[14px] leading-tight font-semibold tracking-tight">Kitchen refits, priced in 48 hours.</p>
          <div className="mt-2 h-1.5 w-11/12 rounded bg-[#f0f1f3]" />
          <div className="mt-1 h-1.5 w-8/12 rounded bg-[#f0f1f3]" />
          <div className="mt-3 h-20 rounded-[12px] bg-[linear-gradient(135deg,#e3ecff,#efe6ff)]" />
          <div className="relative mt-3 space-y-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-5 rounded-[6px] border border-[#e3e5ea]" />
            ))}
            {/* highlighted finding */}
            <span className="pm-rise absolute -inset-1.5 rounded-[9px] border-2 border-[#f97066] bg-[#f97066]/5" style={{ animationDelay: "2.9s" }} />
          </div>
          <div className="mt-2.5 h-7 rounded-full bg-fg" />
        </div>
        {/* scan sweep */}
        <span className="pm-sweep pointer-events-none absolute inset-x-0 h-12 bg-[linear-gradient(180deg,rgb(10_108_255/0),rgb(10_108_255/0.16))]">
          <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand" />
        </span>
      </div>
    </div>
  );
}

export function Stage() {
  return (
    <div className="relative mx-auto max-w-[1080px] [perspective:2200px]" aria-hidden="true">
      <div className="origin-top transition-transform duration-700 [transform:rotateX(9deg)] hover:[transform:rotateX(0deg)] max-md:[transform:none]">
        <div className="overflow-hidden rounded-[22px] border border-hair bg-white shadow-[0_2px_4px_rgb(10_13_20/0.04),0_60px_120px_-50px_rgb(10_13_20/0.45)]">
          {/* chrome */}
          <div className="flex items-center gap-3 border-b border-hair bg-[#fbfbfa] px-5 py-3">
            <div className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-[#e5e5e8]" />
              <span className="size-2.5 rounded-full bg-[#e5e5e8]" />
              <span className="size-2.5 rounded-full bg-[#e5e5e8]" />
            </div>
            <span className="mx-auto flex items-center gap-2 truncate rounded-full bg-white px-4 py-1 text-[12px] whitespace-nowrap text-fg-2 shadow-[0_0_0_1px_#e8e8ec] max-sm:hidden">
              <Radio className="size-3.5 text-[#12a150]" />
              Instant Funnel Scan · yourbrand.com
            </span>
            <span className="rounded-full bg-[#fff4e0] px-2.5 py-0.5 font-mono text-[10.5px] font-medium text-[#8a5a00] uppercase max-sm:ml-auto">Illustration</span>
          </div>

          <div className="grid gap-8 p-6 md:grid-cols-[250px_1fr] md:p-8">
            <div className="max-md:hidden">
              <Phone />
            </div>

            <div className="min-w-0">
              {/* score */}
              <div className="flex items-center gap-5">
                <svg viewBox="0 0 80 80" className="size-20 shrink-0">
                  <circle cx="40" cy="40" r={R} fill="none" stroke="#eef0f3" strokeWidth="8" />
                  <circle
                    cx="40"
                    cy="40"
                    r={R}
                    fill="none"
                    stroke="#d97706"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={FULL}
                    strokeDashoffset={FULL * (1 - SCORE / 100)}
                    transform="rotate(-90 40 40)"
                    className="pm-ring"
                    style={{ "--ring-full": `${FULL}` } as CSSProperties}
                  />
                  <text x="40" y="47" textAnchor="middle" fontSize="22" fontWeight="600" fill="#0a0d14">
                    {SCORE}
                  </text>
                </svg>
                <div>
                  <p className="text-[13px] text-fg-3">yourbrand.com · scanned on a phone</p>
                  <p className="text-[22px] font-semibold tracking-[-0.03em] text-[#d97706]">Room to grow</p>
                  <p className="text-[14px] text-fg-2">3 leaks found before a single ad dollar is spent.</p>
                </div>
              </div>

              {/* metrics */}
              <dl className="mt-6 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
                {[
                  ["Main content", "3.8s"],
                  ["Page weight", "2.9 MB"],
                  ["Requests", "118"],
                  ["Tags firing", "2 of 3"],
                ].map(([k, v], i) => (
                  <div key={k} className="pm-rise rounded-[12px] border border-hair p-3" style={{ animationDelay: `${0.5 + i * 0.1}s` }}>
                    <dt className="text-[11.5px] text-fg-3">{k}</dt>
                    <dd className="mt-0.5 text-[18px] font-semibold tracking-tight tabular-nums">{v}</dd>
                  </div>
                ))}
              </dl>

              {/* findings */}
              <ul className="mt-5 grid gap-2 lg:grid-cols-2">
                {checks.map((c, i) => (
                  <li key={c.label} className={`pm-rise flex items-start gap-3 rounded-[12px] border border-hair p-3 ${i > 3 ? "max-md:hidden" : ""}`} style={{ animationDelay: `${1.1 + i * 0.28}s` }}>
                    <span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ${c.ok ? "bg-[#e7f7ee] text-[#0f7a3d]" : "bg-[#fff4e0] text-[#b54708]"}`}>
                      {c.ok ? <Check className="size-3.5" strokeWidth={2.6} /> : <AlertTriangle className="size-3.5" strokeWidth={2.4} />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13.5px] font-medium">{c.label}</span>
                      <span className="block text-[12.5px] text-fg-3">{c.note}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* floating notes */}
      <div className="pm-drift absolute top-[58%] -left-14 hidden rounded-[14px] border border-hair bg-white px-4 py-3 shadow-[0_24px_48px_-20px_rgb(10_13_20/0.35)] xl:block">
        <p className="flex items-center gap-2 text-[13px] font-medium">
          <Check className="size-4 text-[#12a150]" strokeWidth={2.6} /> generate_lead verified
        </p>
        <p className="mt-0.5 font-mono text-[10.5px] text-fg-3">GA4 · Meta CAPI</p>
      </div>
      <div className="pm-drift absolute -top-8 -right-12 hidden w-64 rounded-[14px] border border-hair bg-white p-4 shadow-[0_24px_48px_-20px_rgb(10_13_20/0.35)] xl:block" style={{ animationDelay: "-3s" }}>
        <p className="flex items-center gap-2 text-[12px] font-medium text-brand">
          <Sparkles className="size-4" /> What we&rsquo;d fix first
        </p>
        <p className="mt-1.5 text-[13.5px] leading-snug font-medium">Cut the form to 4 fields and fire the Google Ads tag on submit.</p>
      </div>
    </div>
  );
}
