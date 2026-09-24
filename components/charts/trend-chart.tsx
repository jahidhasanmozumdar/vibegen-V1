"use client";

import { useState, type KeyboardEvent, type PointerEvent } from "react";

import { cn } from "@/lib/utils/cn";
import { ChartDataTable, ChartEmpty, chartTooltipCls } from "./chart-card";
import styles from "./chart.module.css";
import { useChartWidth } from "./use-chart-width";
import { chartColors, formatValue, labelIndices, niceTicks, type ValueFormat } from "./utils";

export interface TrendSeries {
  name: string;
  values: number[];
}

const SERIES_COLORS = [chartColors.primary, chartColors.secondary];

/**
 * Line/area chart over time. Max two series (brand blue, then violet), smooth
 * flat strokes; the first gets a faint area fill. Crosshair tooltip on hover, and the same
 * readout on keyboard focus with ←/→. An sr-only table mirrors the data.
 */
export function TrendChart({
  title,
  labels,
  series,
  format = "number",
  height = 220,
  emptyMessage,
}: {
  title: string;
  labels: string[];
  series: TrendSeries[];
  format?: ValueFormat;
  height?: number;
  emptyMessage?: string;
}) {
  const { ref, width } = useChartWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const lines = series.slice(0, 2);
  const n = labels.length;
  const total = lines.reduce((s, l) => s + l.values.reduce((a, b) => a + b, 0), 0);

  if (n === 0 || total === 0) {
    return (
      <div ref={ref}>
        <ChartEmpty message={emptyMessage} height={height} />
      </div>
    );
  }

  const pad = { top: 14, right: 16, bottom: 26, left: 36 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const ticks = niceTicks(Math.max(...lines.flatMap((l) => l.values)), format);
  const top = ticks[ticks.length - 1] || 1;
  const x = (i: number) => pad.left + (n === 1 ? plotW / 2 : (i * plotW) / (n - 1));
  const y = (v: number) => pad.top + plotH - (v / top) * plotH;
  const baseline = pad.top + plotH;

  // Catmull-Rom → cubic Bézier, control points clamped to the plot so curves never dip below zero.
  const clampY = (v: number) => Math.min(baseline, Math.max(pad.top, v));
  const linePath = (values: number[]) => {
    const pts = values.map((v, i) => [x(i), y(v)] as const);
    if (pts.length === 1) return `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] ?? pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] ?? p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, clampY(p1[1] + (p2[1] - p0[1]) / 6)];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, clampY(p2[1] - (p3[1] - p1[1]) / 6)];
      d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    return d;
  };
  const areaPath = (values: number[]) => `${linePath(values)} L${x(n - 1).toFixed(1)},${baseline} L${x(0).toFixed(1)},${baseline} Z`;

  const shownLabels = labelIndices(n, plotW);
  const last = n - 1;

  const summary = `${title}. ${lines
    .map((l) => {
      const sum = l.values.reduce((a, b) => a + b, 0);
      const peak = Math.max(...l.values);
      return `${l.name}: ${formatValue(sum, format)} total from ${labels[0]} to ${labels[last]}, peak ${formatValue(peak, format)} (${labels[l.values.indexOf(peak)]})`;
    })
    .join("; ")}. Use left and right arrow keys to read each point.`;

  function onPointerMove(e: PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const i = n === 1 ? 0 : Math.round(((px - pad.left) / plotW) * (n - 1));
    setActive(Math.min(last, Math.max(0, i)));
  }

  function onKeyDown(e: KeyboardEvent<SVGSVGElement>) {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft" || e.key === "Home" || e.key === "End") {
      e.preventDefault();
      setActive((cur) => {
        const c = cur ?? last;
        if (e.key === "Home") return 0;
        if (e.key === "End") return last;
        return Math.min(last, Math.max(0, c + (e.key === "ArrowRight" ? 1 : -1)));
      });
    } else if (e.key === "Escape") setActive(null);
  }

  const tipLeft = active === null ? 0 : Math.min(Math.max(x(active), 70), width - 70);

  return (
    <div>
      {lines.length > 1 && (
        <ul className="mb-4 flex flex-wrap gap-x-5 gap-y-2 text-[12.5px] text-fg-2" aria-hidden="true">
          {lines.map((l, i) => (
            <li key={l.name} className="flex items-center gap-2">
              <span className="h-0.5 w-3.5 rounded-full" style={{ backgroundColor: SERIES_COLORS[i] }} />
              {l.name}
              <span className="tabular font-medium text-fg">{formatValue(l.values.reduce((a, b) => a + b, 0), format)}</span>
            </li>
          ))}
        </ul>
      )}
      <div ref={ref} className="relative">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={summary}
          tabIndex={0}
          onPointerMove={onPointerMove}
          onPointerLeave={() => setActive(null)}
          onFocus={() => setActive(last)}
          onBlur={() => setActive(null)}
          onKeyDown={onKeyDown}
          className="block max-w-full touch-pan-y rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        >
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={pad.left}
                x2={width - pad.right}
                y1={y(t)}
                y2={y(t)}
                stroke={t === 0 ? "#e8e8ec" : chartColors.grid}
                strokeWidth={1}
                shapeRendering="crispEdges"
              />
              <text x={pad.left - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize={11} fill={chartColors.text} className="tabular">
                {formatValue(t, format)}
              </text>
            </g>
          ))}
          {shownLabels.map((i) => (
            <text key={i} x={x(i)} y={height - 6} textAnchor={i === 0 && n > 1 ? "start" : i === last && n > 1 ? "end" : "middle"} fontSize={11} fill={chartColors.text}>
              {labels[i]}
            </text>
          ))}

          <path d={areaPath(lines[0].values)} fill={SERIES_COLORS[0]} fillOpacity={0.07} className={styles.fade} />
          {lines.map((l, i) => (
            <path
              key={l.name}
              d={linePath(l.values)}
              pathLength={1}
              fill="none"
              stroke={SERIES_COLORS[i]}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              className={styles.draw}
            />
          ))}

          {active === null && (
            <g className={styles.fade}>
              <circle cx={x(last)} cy={y(lines[0].values[last])} r={4.5} fill="#ffffff" stroke={SERIES_COLORS[0]} strokeWidth={2} />
            </g>
          )}

          {active !== null && (
            <g>
              <line x1={x(active)} x2={x(active)} y1={pad.top} y2={baseline} stroke={chartColors.indigo} strokeDasharray="3 3" strokeWidth={1} shapeRendering="crispEdges" />
              {lines.map((l, i) => (
                <circle key={l.name} cx={x(active)} cy={y(l.values[active])} r={4.5} fill="#ffffff" stroke={SERIES_COLORS[i]} strokeWidth={2} />
              ))}
            </g>
          )}
        </svg>

        {active !== null && (
          <div
            aria-hidden="true"
            className={`${chartTooltipCls} min-w-36`}
            style={{ left: tipLeft }}
          >
            <p className="mb-1 text-[11.5px] text-fg-3">{labels[active]}</p>
            {lines.map((l, i) => (
              <p key={l.name} className="flex items-center gap-2">
                <span className={cn("size-2 rounded-full")} style={{ backgroundColor: SERIES_COLORS[i] }} />
                <span className="tabular font-semibold text-fg">{formatValue(l.values[active], format)}</span>
                <span className="text-fg-2">{l.name}</span>
              </p>
            ))}
          </div>
        )}
      </div>
      <ChartDataTable caption={title} columns={["Period", ...lines.map((l) => l.name)]} rows={labels.map((lab, i) => [lab, ...lines.map((l) => formatValue(l.values[i], format))])} />
    </div>
  );
}
