"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export interface DropdownItem {
  label: ReactNode;
  onSelect: () => void;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
}

/** Menu button with arrow-key navigation, Escape to close and click-outside. */
export function Dropdown({
  trigger,
  items,
  align = "end",
  label,
}: {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "start" | "end";
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    itemRefs.current[0]?.focus();
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  function focusAt(i: number) {
    const n = items.length;
    itemRefs.current[((i % n) + n) % n]?.focus();
  }

  return (
    <div ref={wrapRef} className="relative inline-block">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center justify-center rounded-md"
      >
        {trigger}
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={(e) => {
            const current = itemRefs.current.findIndex((el) => el === document.activeElement);
            if (e.key === "ArrowDown") {
              e.preventDefault();
              focusAt(current + 1);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              focusAt(current - 1);
            } else if (e.key === "Escape" || e.key === "Tab") {
              setOpen(false);
            }
          }}
          className={cn(
            "absolute z-40 mt-2 min-w-48 animate-fade rounded-[12px] border border-hair bg-white p-1.5 shadow-[0_16px_40px_-16px_rgb(10_13_20/0.25)]",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          {items.map((item, i) => (
            <button
              key={i}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              role="menuitem"
              type="button"
              disabled={item.disabled}
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-[8px] px-2.5 py-1.5 text-left text-[13.5px] focus:outline-none disabled:opacity-50",
                item.danger ? "text-[#b42318] hover:bg-[#fdecea] focus:bg-[#fdecea]" : "text-fg hover:bg-soft focus:bg-soft",
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
