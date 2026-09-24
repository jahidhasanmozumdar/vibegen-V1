"use client";

import { useState } from "react";

import { ChartDataTable, ChartEmpty, chartTooltipCls } from "./chart-card";
import styles from "./chart.module.css";
import { useChartWidth } from "./use-chart-width";
import { chartColors, formatValue, labelIndices, niceTicks, type ValueFormat } from "./utils";

export interface ColumnDatum {
  key: string;
  label: string;
  /** Null = no data for this period (rendered as a gap, not a zero). */
  value: number | null;
  /** Extra line for the tooltip/table, e.g. "3 won of 12 leads". */
  detail?: string;
}

/**
 * Single-series column chart. Flat brand-blue columns ≤24px, rounded tops, square on
 * the baseline; each column is its own hover/focus target with a tooltip.
 */
export function ColumnChart({
  title,
  data,
  format = "number",
  height = 180,
  emptyMessage,
}: {
  title: string;
  data: ColumnDatum[];
  format?: ValueFormat;
  height?: number;
  emptyMessage?: string;
}) {
  const { ref, width } = useChartWidth<HTMLDivElement>(320);
  const [active, setActive] = useState<number | null>(null);
  const values = data.map((d) => d.value ?? 0);

  if (data.length === 0 || data.every((d) => d.value === null)) {
    return (
      <div ref={ref}>
        <ChartEmpty message={emptyMessage} height={height} />
      </div>
    );
  }

  const pad = { top: 18, right: 4, bottom: 24, left: 34 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const ticks = niceTicks(Math.max(...values), format, 3);
  const top = ticks[ticks.length - 1] || 1;
  const band = plotW / data.length;
  const barW = Math.min(24, Math.max(6, band * 0.55));
  const cx = (i: number) => pad.left + band * i + band / 2;
  const y = (v: number) => pad.top + plotH - (v / top) * plotH;
  const baseline = pad.top + plotH;
  const shown = new Set(labelIndices(data.length, plotW, 40));
  const withData = data.filter((d) => d.value !== null);
  const latest = withData[withData.length - 1];

  const summary = `${title}. ${data.length} periods from ${data[0].label} to ${data[data.length - 1].label}. ${latest ? `Latest ${latest.label}: ${formatValue(latest.value, format)}.` : ""}`;

  // Rounded top, square bottom.
  const columnPath = (x0: number, y0: number, w: number, h: number) => {
    const r = Math.min(4, w / 2, h);
    return `M${x0},${y0 + h} V${y0 + r} Q${x0},${y0} ${x0 + r},${y0} H${x0 + w - r} Q${x0 + w},${y0} ${x0 + w},${y0 + r} V${y0 + h} Z`;
  };

  return (
    <div>
      <div ref={ref} className="relative">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={summary} className="block max-w-full">
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
              <text x={pad.left - 6} y={y(t)} dy="0.32em" textAnchor="end" fontSize={11} fill={chartColors.text} className="tabular">
                {formatValue(t, format)}
              </text>
            </g>
          ))}
          {data.map((d, i) => {
            const v = d.value ?? 0;
            const h = Math.max(d.value && d.value > 0 ? 2 : 0, baseline - y(v));
            return (
              <g key={d.key}>
                {d.value !== null && h > 0 && (
                  <path
                    d={columnPath(cx(i) - barW / 2, baseline - h, barW, h)}
                    fill={chartColors.primary}
                    fillOpacity={active === null || active === i ? 1 : 0.35}
                    className={styles.growY}
                    style={{ animationDelay: `${i * 35}ms` }}
                  />
                )}
                {shown.has(i) && (
                  <text x={cx(i)} y={height - 6} textAnchor="middle" fontSize={11} fill={chartColors.text}>
                    {d.label}
                  </text>
                )}
              </g>
            );
          })}
          {latest && active === null && (
            <text x={cx(data.indexOf(latest))} y={y(latest.value ?? 0) - 6} textAnchor="middle" fontSize={11} fontWeight={600} fill={chartColors.ink} className="tabular">
              {formatValue(latest.value, format)}
            </text>
          )}
        </svg>
        {/* Hit targets: whole band per column, focusable, larger than the mark. */}
        <div className="absolute inset-y-0 flex" style={{ left: pad.left, width: plotW }}>
          {data.map((d, i) => (
            <button
              key={d.key}
              type="button"
              className="h-full flex-1 cursor-default rounded-sm focus-visible:outline-2 focus-visible:outline-brand"
              aria-label={`${d.label}: ${d.value === null ? "no data" : formatValue(d.value, format)}${d.detail ? `, ${d.detail}` : ""}`}
              onPointerEnter={() => setActive(i)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
            />
          ))}
        </div>
        {active !== null && (
          <div
            aria-hidden="true"
            className={`${chartTooltipCls} whitespace-nowrap`}
            style={{ left: Math.min(Math.max(cx(active), 60), width - 60) }}
          >
            <p className="tabular text-[13px] font-semibold text-fg">{data[active].value === null ? "No data" : formatValue(data[active].value, format)}</p>
            <p className="text-fg-2">
              {data[active].label}
              {data[active].detail ? ` · ${data[active].detail}` : ""}
            </p>
          </div>
        )}
      </div>
      <ChartDataTable
        caption={title}
        columns={["Period", "Value", "Detail"]}
        rows={data.map((d) => [d.label, d.value === null ? "No data" : formatValue(d.value, format), d.detail ?? ""])}
      />
    </div>
  );
}
