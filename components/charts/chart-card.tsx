import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

/** Card wrapper that gives every chart a visible text title (and optional description / action). */
export function ChartCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-[16px] border border-hair bg-white flex min-w-0 flex-col", className)}>
      <header className="flex items-start justify-between gap-3 px-5 pt-4 sm:px-6 sm:pt-5">
        <div className="min-w-0">
          <h2 className="text-[15px] leading-tight font-semibold tracking-[-0.015em] text-fg">{title}</h2>
          {description && <p className="mt-1 text-[12.5px] leading-snug text-fg-3">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      <div className="flex-1 px-5 pt-4 pb-5 sm:px-6 sm:pb-6">{children}</div>
    </section>
  );
}

/** Friendly placeholder when a chart has nothing to show. */
export function ChartEmpty({ message = "Nothing here yet for this period.", height = 160 }: { message?: string; height?: number }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 rounded-[12px] bg-[#fafaf9] px-4 text-center text-[13px] text-fg-3"
      style={{ minHeight: height }}
    >
      <svg className="size-7" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M5 25h22" stroke="#d9dbe1" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="8" y="16" width="4" height="8" rx="1.5" fill="#e8e8ec" />
        <rect x="14" y="11" width="4" height="13" rx="1.5" fill="#e8e8ec" />
        <rect x="20" y="7" width="4" height="17" rx="1.5" fill="#b9d3ff" />
      </svg>
      {message}
    </div>
  );
}

/** Visually hidden table so every charted value is reachable without the graphic. */
export function ChartDataTable({ caption, columns, rows }: { caption: string; columns: string[]; rows: (string | number)[][] }) {
  return (
    <div className="sr-only">
      <table>
        <caption>{caption}</caption>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((cell, j) =>
                j === 0 ? (
                  <th key={j} scope="row">
                    {cell}
                  </th>
                ) : (
                  <td key={j}>{cell}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Shared tooltip surface for the hand-built charts (values are also in the sr-only table). */
export const chartTooltipCls =
  "pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-[10px] border border-hair bg-white px-3 py-2 text-[12px] text-fg shadow-[0_12px_32px_-12px_rgb(10_13_20/0.25)]";
