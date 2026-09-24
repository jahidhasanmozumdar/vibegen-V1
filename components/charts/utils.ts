/** Chart helpers shared by the hand-built SVG charts (no chart library). */

export type ValueFormat = "number" | "percent";

/**
 * Brand chart tokens ("Premium Calm": flat fills, hairline grid, no gradients).
 * Colour = meaning: brand blue = leads/action, violet = audits/insight.
 */
export const chartColors = {
  primary: "#0a6cff",
  secondary: "#7a3eff",
  violet: "#7a3eff",
  cyan: "#0fa39b",
  /** Crosshair / emphasis line. */
  indigo: "#c3c6ce",
  ink: "#0a0d14",
  grid: "#eef0f3",
  text: "#858c9b",
  track: "#f1f2f4",
  surface: "#ffffff",
} as const;

const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const whole = new Intl.NumberFormat("en-US");

export function formatValue(value: number | null | undefined, format: ValueFormat = "number"): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  if (format === "percent") return `${(value * 100).toFixed(value > 0 && value < 0.1 ? 1 : 0)}%`;
  return Math.abs(value) >= 10_000 ? compact.format(value) : whole.format(value);
}

/** Round a max up to a clean axis top and return evenly spaced ticks. */
export function niceTicks(max: number, format: ValueFormat = "number", count = 4): number[] {
  if (format === "percent") {
    const top = Math.max(0.1, Math.ceil(Math.max(max, 0.0001) * 10) / 10);
    const step = top / count;
    return Array.from({ length: count + 1 }, (_, i) => Number((i * step).toFixed(4)));
  }
  if (max <= 0) return [0, 1];
  if (max <= count) return Array.from({ length: Math.ceil(max) + 1 }, (_, i) => i);
  const rough = max / count;
  const mag = 10 ** Math.floor(Math.log10(rough));
  const norm = rough / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag;
  const top = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= top + step / 2; v += step) ticks.push(Math.round(v));
  return ticks;
}

/** Indices of x labels to show so they never collide (always includes the last). */
export function labelIndices(length: number, width: number, minGap = 64): number[] {
  if (length === 0) return [];
  const max = Math.max(2, Math.floor(width / minGap));
  if (length <= max) return Array.from({ length }, (_, i) => i);
  const step = Math.ceil((length - 1) / (max - 1));
  const out: number[] = [];
  for (let i = length - 1; i >= 0; i -= step) out.unshift(i);
  return out;
}
