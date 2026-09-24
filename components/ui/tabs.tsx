"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export interface TabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
}

/** WAI-ARIA tabs with arrow-key navigation. */
export function Tabs({ items, defaultTab, className }: { items: TabItem[]; defaultTab?: string; className?: string }) {
  const [active, setActive] = useState(defaultTab ?? items[0]?.id);
  const baseId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: KeyboardEvent, index: number) {
    const last = items.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowRight") next = index === last ? 0 : index + 1;
    if (e.key === "ArrowLeft") next = index === 0 ? last : index - 1;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = last;
    if (next === null) return;
    e.preventDefault();
    setActive(items[next].id);
    refs.current[next]?.focus();
  }

  return (
    <div className={className}>
      <div role="tablist" className="inline-flex max-w-full gap-0.5 overflow-x-auto rounded-full bg-[#efeee9] p-1">
        {items.map((item, i) => {
          const selected = item.id === active;
          return (
            <button
              key={item.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              role="tab"
              type="button"
              id={`${baseId}-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(item.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                "h-8 rounded-full px-3.5 text-[13px] font-medium whitespace-nowrap transition-[background-color,color,box-shadow]",
                selected ? "bg-white text-fg shadow-[0_1px_2px_rgb(10_13_20/0.08),0_0_0_1px_#e8e8ec]" : "text-fg-2 hover:text-fg",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`${baseId}-panel-${item.id}`}
          aria-labelledby={`${baseId}-tab-${item.id}`}
          hidden={item.id !== active}
          tabIndex={0}
          className="pt-5 focus-visible:outline-none"
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
