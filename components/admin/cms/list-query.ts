/**
 * URL-param helpers for CMS list pages (search, filters, sort, pagination).
 * Pure functions: safe to use in server components.
 */

export type SearchParamsRecord = Record<string, string | string[] | undefined>;

export interface ListQuery<S extends string> {
  q: string;
  page: number;
  sort: S;
  dir: "asc" | "desc";
  filters: Record<string, string>;
}

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export function readListQuery<S extends string>(
  params: SearchParamsRecord,
  opts: { sorts: readonly S[]; defaultSort: S; defaultDir?: "asc" | "desc"; filters?: string[] },
): ListQuery<S> {
  const sortRaw = first(params.sort) as S;
  const dirRaw = first(params.dir);
  const page = Number.parseInt(first(params.page), 10);
  const filters: Record<string, string> = {};
  for (const key of opts.filters ?? []) {
    const v = first(params[key]).slice(0, 100);
    if (v) filters[key] = v;
  }
  return {
    q: first(params.q).trim().slice(0, 100),
    page: Number.isFinite(page) && page > 0 ? page : 1,
    sort: opts.sorts.includes(sortRaw) ? sortRaw : opts.defaultSort,
    dir: dirRaw === "asc" || dirRaw === "desc" ? dirRaw : (opts.defaultDir ?? "desc"),
    filters,
  };
}

export function listHref<S extends string>(base: string, query: ListQuery<S>, patch: Partial<Pick<ListQuery<S>, "page" | "sort" | "dir">>): string {
  const next = { ...query, ...patch };
  const sp = new URLSearchParams();
  if (next.q) sp.set("q", next.q);
  for (const [k, v] of Object.entries(next.filters)) sp.set(k, v);
  sp.set("sort", next.sort);
  sp.set("dir", next.dir);
  if (next.page > 1) sp.set("page", String(next.page));
  return `${base}?${sp.toString()}`;
}

export function matchesQuery(q: string, ...fields: (string | null | undefined)[]): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  return fields.some((f) => f?.toLowerCase().includes(needle));
}

export function sortRowsBy<T>(rows: T[], get: (row: T) => string | number | null | undefined, dir: "asc" | "desc"): T[] {
  const m = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = get(a);
    const bv = get(b);
    if (av === bv) return 0;
    if (av === null || av === undefined || av === "") return 1;
    if (bv === null || bv === undefined || bv === "") return -1;
    if (typeof av === "number" && typeof bv === "number") return (av - bv) * m;
    return String(av).localeCompare(String(bv)) * m;
  });
}

export function paginate<T>(rows: T[], page: number, pageSize: number): { items: T[]; page: number; pageCount: number; total: number } {
  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, pageCount);
  return { items: rows.slice((current - 1) * pageSize, current * pageSize), page: current, pageCount, total };
}
