"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, X } from "lucide-react";

import { Select } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";

export interface FilterDef {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

/**
 * Search box + filter selects for CMS lists. Everything lives in URL params
 * (shareable, back-button friendly); changing a filter resets to page 1.
 */
export function ListFilters({ filters = [], placeholder = "Search…" }: { filters?: FilterDef[]; placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [pending, start] = useTransition();

  function apply(patch: Record<string, string>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    next.delete("page");
    const qs = next.toString();
    start(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  const active = filters.some((f) => params.get(f.key)) || Boolean(params.get("q"));

  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <form
        role="search"
        className="relative sm:w-72"
        onSubmit={(e) => {
          e.preventDefault();
          apply({ q: q.trim() });
        }}
      >
        <label htmlFor="list-search" className="sr-only">
          Search
        </label>
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-3.5 -translate-y-1/2 text-fg-3" aria-hidden="true" />
        <input
          id="list-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onBlur={() => q.trim() !== (params.get("q") ?? "") && apply({ q: q.trim() })}
          placeholder={placeholder}
          className="h-9 w-full rounded-full border border-hair bg-white pr-3 pl-9 text-[13.5px] transition-[border-color,box-shadow] placeholder:text-fg-3 hover:border-[#d9dbe1] focus:border-brand focus:shadow-[0_0_0_3px_rgb(10_108_255/0.14)] focus:outline-none"
        />
      </form>
      {filters.map((f) => (
        <div key={f.key} className="sm:w-44">
          <label htmlFor={`filter-${f.key}`} className="sr-only">
            {f.label}
          </label>
          <Select
            id={`filter-${f.key}`}
            options={f.options}
            placeholder={`All ${f.label.toLowerCase()}`}
            value={params.get(f.key) ?? ""}
            onChange={(e) => apply({ [f.key]: e.target.value })}
            className="h-9! rounded-full! border-hair! pl-3.5! text-[13.5px]! text-fg-2!"
          />
        </div>
      ))}
      {active && (
        <button
          type="button"
          onClick={() => {
            setQ("");
            apply(Object.fromEntries([["q", ""], ...filters.map((f) => [f.key, ""])]));
          }}
          className="inline-flex h-9 items-center gap-1 rounded-full px-3 text-[13px] font-medium text-fg-2 hover:bg-white hover:text-fg"
        >
          <X className="size-3.5" aria-hidden="true" /> Clear filters
        </button>
      )}
      {pending && <Spinner className="size-4 text-fg-2" label="Updating results" />}
    </div>
  );
}
