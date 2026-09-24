import {
  BarChart3,
  CheckCircle2,
  ChevronDown,
  FlaskConical,
  LayoutDashboard,
  LayoutTemplate,
  Megaphone,
  Radio,
  TriangleAlert,
} from "lucide-react";

/*
 * High-fidelity "VibeGen reporting" screen used as the hero visual.
 * Every number is sample data and the frame says so.
 */

const nav = [
  { icon: LayoutDashboard, label: "Overview", active: true },
  { icon: Megaphone, label: "Campaigns" },
  { icon: LayoutTemplate, label: "Landing pages" },
  { icon: FlaskConical, label: "Experiments" },
  { icon: Radio, label: "Tracking" },
  { icon: BarChart3, label: "Reports" },
];

const kpis = [
  { label: "Ad spend", value: "$18,420", delta: "+4%", good: null, spark: [8, 9, 9, 10, 10, 11, 11, 12] },
  { label: "Qualified leads", value: "412", delta: "+18%", good: true, spark: [5, 6, 6, 8, 8, 10, 11, 13] },
  { label: "Cost per lead", value: "$44.70", delta: "−12%", good: true, spark: [13, 12, 12, 11, 10, 10, 9, 8] },
  { label: "Conversion rate", value: "5.8%", delta: "+0.9pt", good: true, spark: [6, 6, 7, 7, 8, 8, 9, 10] },
];

const google = [22, 26, 25, 31, 30, 36, 34, 41, 44, 43, 49, 54];
const meta = [14, 15, 19, 18, 22, 21, 26, 25, 29, 33, 32, 36];

const funnel = [
  { label: "Ad clicks", value: 7120, w: 100 },
  { label: "Landing views", value: 6380, w: 90 },
  { label: "Form starts", value: 1020, w: 34 },
  { label: "Qualified leads", value: 412, w: 16 },
];

/** Catmull-Rom → cubic Bézier for smooth chart lines. */
function smooth(values: number[], w: number, h: number, max: number) {
  const pts = values.map((v, i) => [(i / (values.length - 1)) * w, h - (v / max) * h] as const);
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

function Spark({ values, good }: { values: number[]; good: boolean | null }) {
  const max = Math.max(...values) * 1.1;
  return (
    <svg viewBox="0 0 80 24" className="h-6 w-20" aria-hidden="true">
      <path d={smooth(values, 80, 24, max)} fill="none" stroke={good === null ? "#858c9b" : "#12a150"} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function Chart() {
  const W = 560;
  const H = 170;
  const max = 60;
  const g = smooth(google, W, H, max);
  const m = smooth(meta, W, H, max);
  return (
    <svg viewBox={`0 0 ${W} ${H + 22}`} className="h-auto w-full" aria-hidden="true">
      <defs>
        <linearGradient id="ps-g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#0a6cff" stopOpacity="0.16" />
          <stop offset="1" stopColor="#0a6cff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1="0" x2={W} y1={(H / 3) * i} y2={(H / 3) * i} stroke="#eef0f3" />
      ))}
      <path d={`${g} L${W} ${H} L0 ${H} Z`} fill="url(#ps-g)" />
      <path d={g} fill="none" stroke="#0a6cff" strokeWidth="2.2" strokeLinecap="round" />
      <path d={m} fill="none" stroke="#7a3eff" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="0" />
      <circle cx={W} cy={H - (google[11] / max) * H} r="4.5" fill="#fff" stroke="#0a6cff" strokeWidth="2.2" />
      {["Wk 1", "Wk 4", "Wk 8", "Wk 12"].map((l, i) => (
        <text key={l} x={(W / 3) * i} y={H + 18} textAnchor={i === 0 ? "start" : i === 3 ? "end" : "middle"} fontSize="10.5" fill="#858c9b" fontFamily="var(--font-mono-face)">
          {l}
        </text>
      ))}
    </svg>
  );
}

export function ProductShot() {
  return (
    <div className="relative" aria-hidden="true">
      <div className="overflow-hidden rounded-[16px] border border-hair bg-white shadow-[0_1px_2px_rgb(10_13_20/0.04),0_40px_80px_-32px_rgb(10_13_20/0.28)]">
        {/* window bar */}
        <div className="flex items-center gap-2 border-b border-hair bg-[#fbfbfa] px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-[#e5e5e8]" />
          <span className="size-2.5 rounded-full bg-[#e5e5e8]" />
          <span className="size-2.5 rounded-full bg-[#e5e5e8]" />
          <span className="mx-auto font-mono text-[11px] text-fg-3">Performance report · sample</span>
        </div>

        <div className="grid grid-cols-[176px_1fr] max-md:grid-cols-1">
          {/* sidebar */}
          <aside className="border-r border-hair bg-[#fbfbfa] p-3 max-md:hidden">
            <div className="flex items-center gap-2 rounded-[8px] px-2 py-1.5">
              <span className="grid size-6 place-items-center rounded-[6px] bg-fg text-[11px] font-semibold text-white">Y</span>
              <span className="truncate text-[12.5px] font-medium whitespace-nowrap">Workspace</span>
              <ChevronDown className="ml-auto size-3.5 text-fg-3" />
            </div>
            <ul className="mt-3 space-y-0.5">
              {nav.map(({ icon: Icon, label, active }) => (
                <li key={label} className={`flex items-center gap-2.5 rounded-[7px] px-2 py-1.5 text-[12.5px] ${active ? "bg-white font-medium text-fg shadow-[0_0_0_1px_#e8e8ec]" : "text-fg-2"}`}>
                  <Icon className="size-3.5" strokeWidth={1.8} />
                  {label}
                </li>
              ))}
            </ul>
          </aside>

          {/* main */}
          <div className="min-w-0 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[15px] font-semibold tracking-tight">Monthly performance</p>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-hair px-2.5 py-1 text-[11.5px] text-fg-2">Last 90 days</span>
                <span className="rounded-full bg-[#fff4e0] px-2.5 py-1 font-mono text-[10.5px] font-medium text-[#8a5a00] uppercase">Sample data</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {kpis.map((k) => (
                <div key={k.label} className="rounded-[10px] border border-hair p-3">
                  <p className="text-[11.5px] text-fg-3">{k.label}</p>
                  <div className="mt-1 flex items-end justify-between gap-2">
                    <p className="text-[19px] font-semibold tracking-tight">{k.value}</p>
                    <Spark values={k.spark} good={k.good} />
                  </div>
                  <p className={`mt-0.5 text-[11px] font-medium ${k.good ? "text-[#12a150]" : "text-fg-3"}`}>{k.delta} vs prior</p>
                </div>
              ))}
            </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-[1.55fr_1fr]">
              <div className="rounded-[10px] border border-hair p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[12.5px] font-medium">Qualified leads by channel</p>
                  <div className="flex gap-3 text-[11px] text-fg-2">
                    <span className="flex items-center gap-1.5">
                      <span className="h-0.5 w-3 rounded bg-brand" />
                      Google Ads
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-0.5 w-3 rounded bg-[#7a3eff]" />
                      Meta Ads
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <Chart />
                </div>
              </div>

              <div className="rounded-[10px] border border-hair p-4">
                <p className="text-[12.5px] font-medium">Funnel</p>
                <ul className="mt-3 space-y-3">
                  {funnel.map((f) => (
                    <li key={f.label}>
                      <div className="flex justify-between text-[11.5px]">
                        <span className="text-fg-2">{f.label}</span>
                        <span className="font-medium tabular-nums">{f.value.toLocaleString("en-US")}</span>
                      </div>
                      <div className="mt-1.5 h-2 rounded-full bg-[#f1f2f4]">
                        <div className="h-full rounded-full bg-brand" style={{ width: `${f.w}%`, opacity: 0.35 + f.w / 160 }} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* floating: audit finding (Ramp-style "recommendation" card) */}
      <div className="absolute -right-4 -bottom-10 hidden w-[19rem] rounded-[14px] border border-hair bg-white p-4 shadow-[0_24px_48px_-20px_rgb(10_13_20/0.3)] lg:block xl:-right-10">
        <div className="flex items-center gap-2 text-[12px] font-medium text-[#b54708]">
          <TriangleAlert className="size-4" strokeWidth={2} />
          Audit finding · High priority
        </div>
        <p className="mt-2 text-[13.5px] leading-snug font-medium">Conversions are counted twice: GA4 import and the Google Ads tag both fire.</p>
        <p className="mt-1.5 text-[12px] text-fg-3">Google is optimizing toward inflated numbers.</p>
      </div>

      {/* floating: event verified */}
      <div className="absolute -top-6 -left-4 hidden rounded-[12px] border border-hair bg-white px-3.5 py-2.5 shadow-[0_20px_40px_-20px_rgb(10_13_20/0.3)] lg:block xl:-left-10">
        <div className="flex items-center gap-2 text-[12.5px] font-medium">
          <CheckCircle2 className="size-4 text-[#12a150]" strokeWidth={2} />
          generate_lead verified
        </div>
        <p className="mt-0.5 font-mono text-[10.5px] text-fg-3">GA4 · Google Ads · Meta CAPI</p>
      </div>
    </div>
  );
}
