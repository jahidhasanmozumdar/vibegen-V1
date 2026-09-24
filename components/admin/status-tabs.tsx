import Link from "next/link";

import { buildHref } from "@/lib/services/admin/query";
import { cn } from "@/lib/utils/cn";

export interface StatusTab {
  value: string | undefined;
  label: string;
  count?: number;
}

/** URL-driven status tabs with counts (links, so they work without JS). */
export function StatusTabs({ basePath, values, param = "status", tabs, label = "Filter by status" }: { basePath: string; values: Record<string, string | undefined>; param?: string; tabs: StatusTab[]; label?: string }) {
  const current = values[param];
  return (
    <nav aria-label={label} className="mb-4 -mx-1 overflow-x-auto">
      <ul className="flex min-w-max gap-1 px-1 pb-1">
        {tabs.map((t) => {
          const active = (t.value ?? undefined) === (current ?? undefined);
          return (
            <li key={t.value ?? "all"}>
              <Link
                href={buildHref(basePath, { ...values, [param]: t.value, page: undefined })}
                aria-current={active ? "page" : undefined}
                scroll={false}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] whitespace-nowrap transition-[background-color,border-color,color]",
                  active ? "border-hair bg-white font-medium text-fg" : "border-transparent text-fg-2 hover:text-fg",
                )}
              >
                {t.label}
                {t.count !== undefined && (
                  <span className={cn("tabular rounded-full px-1.5 text-[11.5px] font-medium", active ? "bg-brand-soft text-brand" : "bg-[#efeee9] text-fg-3")}>{t.count}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
