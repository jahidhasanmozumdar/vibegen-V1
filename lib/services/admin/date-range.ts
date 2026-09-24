/**
 * One date-range model for the overview and analytics pages.
 * URL params: `range=7d|30d|90d|6m|12m|custom&from=YYYY-MM-DD&to=YYYY-MM-DD`.
 * Pure (no data access), so both server pages and JSON routes share it.
 */
import { dateParam, enumParam, type SearchParamsRecord } from "./query";

export const RANGE_KEYS = ["7d", "30d", "90d", "6m", "12m", "custom"] as const;
export type RangeKey = (typeof RANGE_KEYS)[number];

export const rangeLabels: Record<RangeKey, string> = {
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
  "6m": "6 months",
  "12m": "12 months",
  custom: "Custom",
};

export type Bucket = "day" | "week" | "month";

export interface DateRange {
  key: RangeKey;
  from: Date;
  to: Date;
  prevFrom: Date;
  prevTo: Date;
  bucket: Bucket;
  /** Human label, e.g. "Last 30 days" or "Mar 1, 2026 – Apr 2, 2026". */
  label: string;
  /** Echo of custom bounds for form inputs (YYYY-MM-DD). */
  fromInput: string;
  toInput: string;
}

const DAY = 86_400_000;

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function toInputDate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

const labelFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

function autoBucket(from: Date, to: Date): Bucket {
  const days = (to.getTime() - from.getTime()) / DAY;
  if (days <= 14) return "day";
  if (days <= 120) return "week";
  return "month";
}

export function parseDateRange(sp: SearchParamsRecord, fallback: RangeKey = "30d", now: Date = new Date()): DateRange {
  let key = enumParam(sp, "range", RANGE_KEYS) ?? fallback;
  let from: Date;
  let to: Date = now;
  let bucket: Bucket;

  const customFrom = dateParam(sp, "from");
  const customTo = dateParam(sp, "to");
  if (key === "custom" && !(customFrom && customTo)) key = fallback === "custom" ? "30d" : fallback;

  switch (key) {
    case "7d":
      from = startOfDay(new Date(now.getTime() - 6 * DAY));
      bucket = "day";
      break;
    case "90d":
      from = startOfDay(new Date(now.getTime() - 89 * DAY));
      bucket = "week";
      break;
    case "6m":
      from = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 5, 1));
      bucket = "month";
      break;
    case "12m":
      from = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 11, 1));
      bucket = "month";
      break;
    case "custom": {
      let a = new Date(`${customFrom}T00:00:00`);
      let b = new Date(`${customTo}T23:59:59.999`);
      if (a > b) [a, b] = [new Date(`${customTo}T00:00:00`), new Date(`${customFrom}T23:59:59.999`)];
      // Keep custom ranges sane: max ~3 years.
      if (b.getTime() - a.getTime() > 3 * 366 * DAY) a = new Date(b.getTime() - 3 * 366 * DAY);
      from = a;
      to = b;
      bucket = autoBucket(from, to);
      break;
    }
    case "30d":
    default:
      from = startOfDay(new Date(now.getTime() - 29 * DAY));
      bucket = "week";
      break;
  }

  const span = to.getTime() - from.getTime();
  const prevTo = new Date(from.getTime() - 1);
  const prevFrom = new Date(from.getTime() - span - 1);

  return {
    key,
    from,
    to,
    prevFrom,
    prevTo,
    bucket,
    label: key === "custom" ? `${labelFmt.format(from)} – ${labelFmt.format(to)}` : `Last ${rangeLabels[key]}`,
    fromInput: toInputDate(from),
    toInput: toInputDate(to),
  };
}

export function inWindow(iso: string | null | undefined, from: Date, to: Date): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return t >= from.getTime() && t <= to.getTime();
}

export interface BucketPoint {
  key: string;
  label: string;
  start: string;
  value: number;
}

const dayFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const monthFmt = new Intl.DateTimeFormat("en-US", { month: "short" });
const monthYearFmt = new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit" });

/** Bucket start dates covering [from, to]. */
export function bucketStarts(from: Date, to: Date, bucket: Bucket): Date[] {
  const out: Date[] = [];
  if (bucket === "month") {
    for (let d = startOfMonth(from); d <= to; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) out.push(d);
  } else if (bucket === "week") {
    // Anchor weeks to the end of the range so the latest bucket is a full week
    // (a partial trailing week would read as a false drop). Only the first bucket may be partial.
    const end = startOfDay(to);
    for (let d = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 6); d > startOfDay(from); d = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7)) out.unshift(d);
    out.unshift(startOfDay(from));
  } else {
    for (let d = startOfDay(from); d <= to; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) out.push(d);
  }
  return out;
}

export function bucketLabel(d: Date, bucket: Bucket, spansYears: boolean): string {
  if (bucket === "month") return spansYears ? monthYearFmt.format(d) : monthFmt.format(d);
  return dayFmt.format(d);
}

/** Count timestamps per bucket. Timestamps outside the range are ignored. */
export function countByBucket(isoDates: (string | null | undefined)[], range: Pick<DateRange, "from" | "to" | "bucket">): BucketPoint[] {
  const starts = bucketStarts(range.from, range.to, range.bucket);
  const spansYears = range.from.getFullYear() !== range.to.getFullYear();
  const counts = new Array<number>(starts.length).fill(0);
  for (const iso of isoDates) {
    if (!iso || !inWindow(iso, range.from, range.to)) continue;
    const t = new Date(iso).getTime();
    // Last bucket whose start <= t.
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (starts[mid].getTime() <= t) lo = mid;
      else hi = mid - 1;
    }
    counts[lo] += 1;
  }
  return starts.map((d, i) => ({
    key: toInputDate(d),
    label: range.bucket === "week" ? `Wk of ${bucketLabel(d, "week", spansYears)}` : bucketLabel(d, range.bucket, spansYears),
    start: d.toISOString(),
    value: counts[i],
  }));
}

/** Calendar months ending with the month of `to`, at least `min` months long. */
export function monthsCovering(range: Pick<DateRange, "from" | "to">, min = 6): Date[] {
  const minStart = new Date(range.to.getFullYear(), range.to.getMonth() - (min - 1), 1);
  const start = startOfMonth(range.from) < minStart ? startOfMonth(range.from) : minStart;
  return bucketStarts(start, range.to, "month");
}

/**
 * % change vs previous period. Null when the previous period has fewer
 * than `minPrevious` records, so tiny samples never show as "+300%".
 */
export function percentChange(current: number, previous: number, minPrevious = 3): number | null {
  if (previous < minPrevious) return null;
  return (current - previous) / previous;
}
