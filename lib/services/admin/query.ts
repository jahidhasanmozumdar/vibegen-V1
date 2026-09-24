/**
 * Pure helpers shared by admin list services, pages and JSON routes:
 * reading Next's `searchParams`, validating enum params and paginating.
 * No data access here, so it's safe to import anywhere on the server.
 */

export type SearchParamsRecord = Record<string, string | string[] | undefined>;

export const DEFAULT_PAGE_SIZE = 20;

export interface Paged<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

/** First value of a search param, trimmed; undefined when empty. */
export function param(sp: SearchParamsRecord, key: string): string | undefined {
  const raw = sp[key];
  const value = (Array.isArray(raw) ? raw[0] : raw)?.trim();
  return value ? value.slice(0, 200) : undefined;
}

/** A param restricted to a known list of values; anything else is ignored. */
export function enumParam<T extends string>(sp: SearchParamsRecord, key: string, allowed: readonly T[]): T | undefined {
  const value = param(sp, key);
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : undefined;
}

export function pageParam(sp: SearchParamsRecord): number {
  const n = Number.parseInt(param(sp, "page") ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 10_000) : 1;
}

/** YYYY-MM-DD date param. */
export function dateParam(sp: SearchParamsRecord, key: string): string | undefined {
  const value = param(sp, key);
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) ? value : undefined;
}

/** Flatten searchParams to single string values (for toolbars and link builders). */
export function flatParams(sp: SearchParamsRecord): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const key of Object.keys(sp)) out[key] = param(sp, key);
  return out;
}

export function searchParamsFromUrl(url: URL): SearchParamsRecord {
  const out: SearchParamsRecord = {};
  url.searchParams.forEach((value, key) => {
    out[key] = value;
  });
  return out;
}

export function paginate<T>(rows: T[], page: number, pageSize = DEFAULT_PAGE_SIZE): Paged<T> {
  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), pageCount);
  return { rows: rows.slice((current - 1) * pageSize, current * pageSize), total, page: current, pageSize, pageCount };
}

/** Case-insensitive "contains" across several nullable fields. */
export function matchesQuery(q: string | undefined, ...fields: (string | null | undefined)[]): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  return fields.some((f) => f?.toLowerCase().includes(needle));
}

/** Inclusive date filter on an ISO timestamp against YYYY-MM-DD bounds (local time). */
export function withinDates(iso: string | null, from?: string, to?: string): boolean {
  if (!from && !to) return true;
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (from && t < new Date(`${from}T00:00:00`).getTime()) return false;
  if (to && t > new Date(`${to}T23:59:59.999`).getTime()) return false;
  return true;
}

export function compareValues(a: unknown, b: unknown, dir: "asc" | "desc"): number {
  const m = dir === "asc" ? 1 : -1;
  if (a === b) return 0;
  if (a === null || a === undefined || a === "") return 1;
  if (b === null || b === undefined || b === "") return -1;
  return String(a).localeCompare(String(b), undefined, { sensitivity: "base", numeric: true }) * m;
}

/** Build `path?query` from a params object, dropping empty values. */
export function buildHref(path: string, params: Record<string, string | number | undefined | null>): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    qs.set(key, String(value));
  }
  const s = qs.toString();
  return s ? `${path}?${s}` : path;
}

export type DemoFilter = "real" | "demo";
export const DEMO_FILTERS = ["real", "demo"] as const;

export function matchesDemo(isDemo: boolean, filter: DemoFilter | undefined): boolean {
  if (!filter) return true;
  return filter === "demo" ? isDemo : !isDemo;
}

/** Route ids are UUIDs; anything else is a 404 before it reaches the store. */
export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
