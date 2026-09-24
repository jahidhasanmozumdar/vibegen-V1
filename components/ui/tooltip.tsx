import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * CSS-only tooltip shown on hover and keyboard focus. The trigger must be
 * focusable, and the text is also exposed to assistive tech via a visually
 * hidden span, so it never relies on hover alone.
 */
export function Tooltip({ content, children, side = "top", className }: { content: string; children: ReactNode; side?: "top" | "bottom"; className?: string }) {
  return (
    <span className={cn("group/tt relative inline-flex", className)}>
      {children}
      <span className="sr-only">{content}</span>
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute left-1/2 z-50 w-max max-w-60 -translate-x-1/2 rounded-[8px] bg-fg px-2.5 py-1.5 text-xs leading-snug font-medium text-white opacity-0 shadow-[0_8px_24px_-8px_rgb(10_13_20/0.35)] transition-opacity duration-150 group-focus-within/tt:opacity-100 group-hover/tt:opacity-100",
          side === "top" ? "bottom-full mb-2" : "top-full mt-2",
        )}
      >
        {content}
      </span>
    </span>
  );
}
