"use client";

import { usePathname, useRouter } from "next/navigation";
import { useRef, useState, useTransition, type ReactNode } from "react";
import { Search, X } from "lucide-react";

import { Spinner } from "@/components/ui/spinner";
import { buildHref } from "@/lib/services/admin/query";
import { cn } from "@/lib/utils/cn";

export interface ToolbarFilter {
  name: string;
  label: string;
  /** Label of the empty option, e.g. "All statuses". */
  allLabel: string;
  options: readonly { value: string; label: string }[];
}

const controlCls = "h-9 rounded-full border border-hair bg-white text-[13.5px] text-fg placeholder:text-fg-3 transition-[border-color,box-shadow] hover:border-[#d9dbe1] focus:border-brand focus:shadow-[0_0_0_3px_rgb(10_108_255/0.14)] focus:outline-none";

/**
 * Search + filter row for admin lists. Every value lives in the URL, so views
 * are bookmarkable and the back button works. Changing a filter resets paging.
 */
export function ListToolbar({
  values,
  searchPlaceholder,
  searchLabel = "Search",
  filters = [],
  dateFilters,
  children,
}: {
  /** Current URL params (all of them, so sort/dir survive filter changes). */
  values: Record<string, string | undefined>;
  searchPlaceholder: string;
  searchLabel?: string;
  filters?: ToolbarFilter[];
  /** Show from/to date inputs bound to these param names. */
  dateFilters?: { fromLabel: string; toLabel: string };
  children?: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(values.q ?? "");
  const timer = useRef<number | undefined>(undefined);

  const filterKeys = ["q", ...filters.map((f) => f.name), ...(dateFilters ? ["from", "to"] : [])];
  const active = filterKeys.some((k) => Boolean(values[k]));

  function navigate(patch: Record<string, string | undefined>) {
    const next = { ...values, ...patch, page: undefined, highlight: undefined };
    startTransition(() => router.replace(buildHref(pathname, next), { scroll: false }));
  }

  function onSearch(value: string) {
    setQ(value);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => navigate({ q: value.trim() || undefined }), 300);
  }

  function clearAll() {
    setQ("");
    window.clearTimeout(timer.current);
    const cleared = Object.fromEntries(filterKeys.map((k) => [k, undefined]));
    navigate(cleared);
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2" role="search" aria-label={searchLabel}>
      <div className="relative w-full sm:w-64">
        <label htmlFor="list-search" className="sr-only">
          {searchLabel}
        </label>
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-3.5 -translate-y-1/2 text-fg-3" strokeWidth={2} aria-hidden="true" />
        <input
          id="list-search"
          type="search"
          value={q}
          onChange={(e) => onSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              window.clearTimeout(timer.current);
              navigate({ q: q.trim() || undefined });
            }
          }}
          placeholder={searchPlaceholder}
          className={cn(controlCls, "w-full pr-3 pl-9")}
        />
      </div>

      {filters.map((f) => (
        <div key={f.name} className="relative">
          <label htmlFor={`filter-${f.name}`} className="sr-only">
            {f.label}
          </label>
          <select
            id={`filter-${f.name}`}
            value={values[f.name] ?? ""}
            onChange={(e) => navigate({ [f.name]: e.target.value || undefined })}
            className={cn(controlCls, "appearance-none pr-8 pl-3.5 text-fg-2", values[f.name] ? "border-[#b9d3ff] bg-brand-soft font-medium text-brand hover:border-[#9cc0ff]" : "")}
          >
            <option value="">{f.allLabel}</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <svg className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-fg-3" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ))}

      {dateFilters && (
        <div className="flex w-full items-center gap-1.5 sm:w-auto">
          <label htmlFor="filter-from" className="pl-1 text-[12.5px] text-fg-3">
            {dateFilters.fromLabel}
          </label>
          <input id="filter-from" type="date" value={values.from ?? ""} max={values.to} onChange={(e) => navigate({ from: e.target.value || undefined })} className={cn(controlCls, "min-w-0 flex-1 px-3 text-fg-2 sm:flex-none")} />
          <label htmlFor="filter-to" className="text-[12.5px] text-fg-3">
            {dateFilters.toLabel}
          </label>
          <input id="filter-to" type="date" value={values.to ?? ""} min={values.from} onChange={(e) => navigate({ to: e.target.value || undefined })} className={cn(controlCls, "min-w-0 flex-1 px-3 text-fg-2 sm:flex-none")} />
        </div>
      )}

      {active && (
        <button type="button" onClick={clearAll} className="inline-flex h-9 items-center gap-1 rounded-full px-3 text-[13px] font-medium text-fg-2 transition-colors hover:bg-white hover:text-fg">
          <X className="size-3.5" aria-hidden="true" />
          Clear filters
        </button>
      )}
      {pending && <Spinner className="size-3.5 text-fg-2" label="Updating results" />}
      {children && <div className="ml-auto flex items-center gap-2">{children}</div>}
    </div>
  );
}
