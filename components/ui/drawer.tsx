"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils/cn";

/** Side sheet on the native <dialog>. Used for the mobile nav and admin sidebar. */
export function Drawer({
  open,
  onClose,
  title,
  side = "left",
  tone = "light",
  header,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  side?: "left" | "right";
  /** "light" (default) is the white sheet; "night" is a dark surface. */
  tone?: "light" | "night";
  /** Optional custom header content (the title stays as the accessible name). */
  header?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const night = tone === "night";

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        "fixed top-0 m-0 h-dvh max-h-dvh w-[min(22rem,88vw)] max-w-none border-hair p-0 backdrop:bg-[rgb(10_13_20/0.32)]",
        night ? "bg-fg text-white" : "bg-white text-fg",
        side === "left" ? "left-0 border-r shadow-[24px_0_48px_-24px_rgb(10_13_20/0.25)] open:animate-slide-in" : "right-0 left-auto border-l shadow-[-24px_0_48px_-24px_rgb(10_13_20/0.25)]",
        className,
      )}
    >
      <div className="relative flex h-full flex-col">
        <div className={cn("flex h-16 shrink-0 items-center justify-between px-4", night ? "border-b border-white/10" : "border-b border-hair")}>
          <h2 id={titleId} className={cn("text-[15px] font-semibold tracking-[-0.01em]", night && "text-white", header && "sr-only")}>
            {title}
          </h2>
          {header}
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-full transition-colors",
              night ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-fg-2 hover:bg-soft hover:text-fg",
            )}
            aria-label="Close menu"
          >
            <X className="size-[18px]" strokeWidth={1.8} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </dialog>
  );
}
