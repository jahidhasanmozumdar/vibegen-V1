import type React from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarCheck,
  ClipboardCheck,
  Gauge,
  Inbox,
  Minus,
  Percent,
  Sparkles,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

import { formatValue } from "@/components/charts/utils";
import type { Kpi } from "@/lib/services/admin/dashboard";
import { cn } from "@/lib/utils/cn";

function formatChange(kpi: Kpi): string {
  const c = kpi.change ?? 0;
  const sign = c > 0 ? "+" : c < 0 ? "−" : "";
  if (kpi.changeKind === "points") return `${sign}${Math.abs(c * 100).toFixed(1)} pts`;
  return `${sign}${Math.round(Math.abs(c) * 100)}%`;
}

/*
 * Colour = meaning (docs/spec/02-design-direction.md §7): brand blue for
 * leads, violet for audits, neutral grey for everything else. Flat, calm.
 */
type Tone = "blue" | "violet" | "neutral";

const tones: Record<Tone, { chip: string; line: string }> = {
  blue: { chip: "bg-brand-soft text-brand", line: "#0a6cff" },
  violet: { chip: "bg-[#f1ebff] text-[#7a3eff]", line: "#7a3eff" },
  neutral: { chip: "bg-[#f1f2f4] text-fg-2", line: "#0a6cff" },
};

/** Presentational icon + tone per KPI key. Unknown keys fall back to a neutral gauge. */
const kpiLook: Record<string, { icon: LucideIcon; tone: Tone }> = {
  leads: { icon: Users, tone: "blue" },
  new_leads: { icon: Sparkles, tone: "blue" },
  qualified: { icon: BadgeCheck, tone: "blue" },
  won: { icon: Trophy, tone: "blue" },
  lead_cvr: { icon: Percent, tone: "neutral" },
  conversion: { icon: Percent, tone: "neutral" },
  audits: { icon: ClipboardCheck, tone: "violet" },
  audit_completion: { icon: Gauge, tone: "violet" },
  messages: { icon: Inbox, tone: "neutral" },
  bookings: { icon: CalendarCheck, tone: "neutral" },
  booking_cvr: { icon: Percent, tone: "neutral" },
};

/** Grid wrapper for a row of KPI cards. */
export function KpiGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("grid gap-3 sm:gap-4", className)}>{children}</div>;
}

/** Tiny decorative sparkline (the numbers are in the card text and in the charts below). */
function Sparkline({ values, line }: { values: number[]; line: string }) {
  const w = 100;
  const h = 28;
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => [values.length === 1 ? w : (i / (values.length - 1)) * w, h - 2 - (v / max) * (h - 6)] as const);
  const path = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-7 w-full overflow-visible" aria-hidden="true">
      <path d={`${path} L${w},${h} L0,${h} Z`} fill={line} fillOpacity={0.08} />
      <path d={path} fill="none" stroke={line} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/**
 * Stat card: label + small icon chip, large value and a signed change vs the
 * previous equal-length period. `trend` (optional) draws a decorative
 * sparkline from data already on the page; percent KPIs get a thin meter.
 */
export function KpiCard({ kpi, trend }: { kpi: Kpi; trend?: number[] }) {
  const c = kpi.change;
  const dir = c === null ? null : c > 0.0005 ? "up" : c < -0.0005 ? "down" : "flat";
  const DeltaIcon = dir === "up" ? ArrowUpRight : dir === "down" ? ArrowDownRight : Minus;
  const look = kpiLook[kpi.key] ?? { icon: Gauge, tone: "neutral" as const };
  const tone = tones[look.tone];
  const Icon = look.icon;
  const hasTrend = trend && trend.length > 1 && trend.some((v) => v > 0);

  return (
    <div className="flex min-w-0 flex-col rounded-[16px] border border-hair bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 text-[12.5px] leading-snug text-fg-3">{kpi.label}</p>
        <span className={cn("grid size-6 shrink-0 place-items-center rounded-full", tone.chip)} aria-hidden="true">
          <Icon className="size-3.5" strokeWidth={2} />
        </span>
      </div>

      <p className="tabular mt-2 text-[28px] leading-none font-semibold tracking-[-0.035em] text-fg">{formatValue(kpi.value, kpi.format)}</p>

      <div className="mt-2 min-h-5 text-[12px]">
        {dir === null ? (
          <span className="text-fg-3">Not enough data yet</span>
        ) : (
          <span className="inline-flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "tabular inline-flex h-5 items-center gap-0.5 rounded-full px-1.5 text-[11.5px] font-medium",
                dir === "up" && "bg-[#e7f7ee] text-[#0f7a3d]",
                dir === "down" && "bg-[#fdecea] text-[#b42318]",
                dir === "flat" && "bg-[#f1f2f4] text-fg-2",
              )}
            >
              <DeltaIcon className="size-3" strokeWidth={2.25} aria-hidden="true" />
              <span className="sr-only">{dir === "up" ? "Up" : dir === "down" ? "Down" : "No change"} </span>
              {formatChange(kpi)}
            </span>
            <span className="text-fg-3">vs previous</span>
          </span>
        )}
      </div>

      {kpi.format === "percent" ? (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#f1f2f4]" aria-hidden="true">
          <div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.max(kpi.value * 100, kpi.value > 0 ? 3 : 0))}%`, backgroundColor: tone.line }} />
        </div>
      ) : hasTrend ? (
        <div className="mt-2">
          <Sparkline values={trend} line={tone.line} />
        </div>
      ) : null}

      {kpi.hint && (
        <p className="mt-auto truncate pt-2 text-[12px] text-fg-3" title={kpi.hint}>
          {kpi.hint}
        </p>
      )}
    </div>
  );
}
