import { cn } from "@/lib/utils/cn";
import { ChartDataTable, ChartEmpty } from "./chart-card";
import styles from "./chart.module.css";
import { chartColors, formatValue, type ValueFormat } from "./utils";

export interface BarListItem {
  key: string;
  label: string;
  value: number;
}

/**
 * Horizontal bar list: one series, one hue, value at the bar tip.
 * Categories are nominal, so they share a single colour (no value ramp).
 * Every value is printed, so no tooltip is needed; an sr-only table mirrors it.
 */
export function BarList({
  title,
  items,
  format = "number",
  showShare = false,
  valueLabel = "Count",
  emptyMessage,
  limit,
  dense = false,
}: {
  /** Used for the accessible summary and table caption. */
  title: string;
  items: BarListItem[];
  format?: ValueFormat;
  /** Also print each item's share of the total. */
  showShare?: boolean;
  valueLabel?: string;
  emptyMessage?: string;
  limit?: number;
  dense?: boolean;
}) {
  const shown = limit ? items.slice(0, limit) : items;
  const total = items.reduce((sum, i) => sum + i.value, 0);
  if (shown.length === 0 || (format === "number" && total === 0)) return <ChartEmpty message={emptyMessage} height={dense ? 120 : 160} />;

  const max = Math.max(...shown.map((i) => i.value), format === "percent" ? 1 : 0);
  const share = (v: number) => (total > 0 ? `${Math.round((v / total) * 100)}%` : "0%");
  const top = [...shown].sort((a, b) => b.value - a.value)[0];
  const summary = `${title}: ${shown.length} categories. Highest is ${top.label} with ${formatValue(top.value, format)}${showShare ? ` (${share(top.value)} of ${formatValue(total)})` : ""}.`;

  return (
    <div>
      <div role="img" aria-label={summary} className={cn(dense ? "space-y-2.5" : "space-y-3.5")}>
        {shown.map((item, i) => {
          const pct = max > 0 ? (item.value / max) * 100 : 0;
          return (
            <div key={item.key}>
              <div className="flex items-baseline justify-between gap-3 text-[13px]">
                <span className="min-w-0 truncate text-fg-2">{item.label}</span>
                <span className="tabular shrink-0 font-medium text-fg">
                  {formatValue(item.value, format)}
                  {showShare && <span className="ml-2 inline-block min-w-[2.4rem] text-right text-[12px] font-normal text-fg-3">{share(item.value)}</span>}
                </span>
              </div>
              <div className={cn("mt-1.5 w-full overflow-hidden rounded-full", dense ? "h-1.5" : "h-2")} style={{ backgroundColor: chartColors.track }}>
                <div
                  className={cn("h-full rounded-full", styles.growX)}
                  style={{
                    width: `${Math.max(pct, item.value > 0 ? 1.5 : 0)}%`,
                    backgroundColor: chartColors.primary,
                    animationDelay: `${i * 40}ms`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <ChartDataTable
        caption={title}
        columns={showShare ? ["Category", valueLabel, "Share"] : ["Category", valueLabel]}
        rows={shown.map((i) => (showShare ? [i.label, formatValue(i.value, format), share(i.value)] : [i.label, formatValue(i.value, format)]))}
      />
    </div>
  );
}
