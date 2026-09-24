"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";

import type { DropdownItem } from "@/components/ui/dropdown";
import { cn } from "@/lib/utils/cn";

/**
 * Row "⋯" menu for tables. Same keyboard model as <Dropdown>, but the panel is
 * position:fixed so it's never clipped by the table's scroll container.
 */
export function RowMenu({ label, items }: { label: string; items: (DropdownItem | false | null)[] }) {
  const list = items.filter((i): i is DropdownItem => Boolean(i));
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; up: boolean } | null>(null);
  const menuId = useId();
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const menuH = (menuRef.current?.offsetHeight ?? 40 * list.length) + 8;
    const up = r.bottom + menuH > window.innerHeight && r.top > menuH;
    setPos({ top: up ? r.top - 6 : r.bottom + 6, left: Math.max(8, r.right), up });
  }, [open, list.length]);

  useEffect(() => {
    if (!open) return;
    itemRefs.current.find((el) => el && !el.disabled)?.focus();
    const close = () => setOpen(false);
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node) && !btnRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  function focusAt(i: number) {
    const n = list.length;
    itemRefs.current[((i % n) + n) % n]?.focus();
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex size-8 items-center justify-center rounded-[8px] border border-transparent text-fg hover:border-[#c3c6ce] hover:bg-white aria-expanded:border-[#c3c6ce] aria-expanded:bg-soft"
      >
        <MoreHorizontal className="size-4" strokeWidth={2.5} aria-hidden="true" />
      </button>
      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={label}
          style={pos ? { top: pos.top, left: pos.left } : { visibility: "hidden" }}
          onKeyDown={(e) => {
            const current = itemRefs.current.findIndex((el) => el === document.activeElement);
            if (e.key === "ArrowDown") {
              e.preventDefault();
              focusAt(current + 1);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              focusAt(current - 1);
            } else if (e.key === "Escape") {
              setOpen(false);
              btnRef.current?.focus();
            } else if (e.key === "Tab") setOpen(false);
          }}
          className={cn("fixed z-50 min-w-48 -translate-x-full animate-fade rounded-[12px] border border-hair bg-white p-1.5 text-left shadow-[0_16px_40px_-16px_rgb(10_13_20/0.25)]", pos?.up && "-translate-y-full")}
        >
          {list.map((item, i) => (
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
                "flex w-full items-center gap-2 rounded-[8px] px-2.5 py-1.5 text-left text-[13px] whitespace-nowrap focus:outline-none disabled:opacity-45",
                item.danger ? "text-[#b42318] hover:bg-[#fdecea] focus:bg-[#fdecea]" : "text-fg hover:bg-soft focus:bg-soft",
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
