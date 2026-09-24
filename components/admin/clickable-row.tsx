"use client";

import { useRouter } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * Table row that opens `href` on click. The row itself isn't focusable; each
 * row must also contain a real link to the same place for keyboard users.
 */
export function ClickableRow({ href, className, highlighted, ...props }: ComponentProps<"tr"> & { href: string; highlighted?: boolean }) {
  const router = useRouter();
  function onClick(e: MouseEvent<HTMLTableRowElement>) {
    const target = e.target as HTMLElement;
    if (target.closest("a, button, input, select, textarea, label, dialog, [role=menu]")) return;
    if (window.getSelection()?.toString()) return;
    if (e.metaKey || e.ctrlKey) window.open(href, "_blank", "noopener");
    else router.push(href);
  }
  return (
    <tr
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-colors hover:bg-[#fafaf9] [&:not(:last-child)>td]:border-b [&>td]:border-hair",
        highlighted && "bg-brand-soft/60 outline-2 -outline-offset-2 outline-brand",
        className,
      )}
      {...props}
    />
  );
}
