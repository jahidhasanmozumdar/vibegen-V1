import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export interface DetailItem {
  label: string;
  value: ReactNode;
  /** Span both columns. */
  wide?: boolean;
}

/** Label/value grid for record details. Empty values render as an em dash. */
export function DetailList({ items, className }: { items: DetailItem[]; className?: string }) {
  return (
    <dl className={cn("grid grid-cols-1 gap-x-6 gap-y-3.5 sm:grid-cols-2", className)}>
      {items.map((item) => (
        <div key={item.label} className={cn("min-w-0", item.wide && "sm:col-span-2")}>
          <dt className="text-[12.5px] text-fg-3">{item.label}</dt>
          <dd className="mt-0.5 text-[13.5px] break-words text-fg">{item.value === null || item.value === undefined || item.value === "" ? <span className="text-fg-3">—</span> : item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Small section heading inside a card body. */
export function SectionLabel({ children }: { children: ReactNode }) {
  return <h3 className="mb-2.5 text-[13px] font-medium text-fg">{children}</h3>;
}
