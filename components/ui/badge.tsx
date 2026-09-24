import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger" | "violet" | "cyan" | "dark";

/* "Premium Calm" status pills: soft tint + deep text of the same hue (AA). */
const tones: Record<BadgeTone, { box: string; dot: string }> = {
  neutral: { box: "bg-[#f1f2f4] text-fg-2", dot: "bg-fg-3" },
  accent: { box: "bg-brand-soft text-brand", dot: "bg-brand" },
  success: { box: "bg-[#e7f7ee] text-[#0f7a3d]", dot: "bg-[#12a150]" },
  warning: { box: "bg-[#fff4e0] text-[#b54708]", dot: "bg-[#f79009]" },
  danger: { box: "bg-[#fdecea] text-[#b42318]", dot: "bg-[#d92d20]" },
  violet: { box: "bg-[#f1ebff] text-[#5b21d6]", dot: "bg-[#7a3eff]" },
  cyan: { box: "bg-[#e3f6f5] text-[#0b6e69]", dot: "bg-[#0fa39b]" },
  dark: { box: "bg-fg text-white", dot: "bg-white" },
};

/** Status/metadata pill. The text carries the meaning; the dot is decoration. */
export function Badge({ tone = "neutral", dot, className, children }: { tone?: BadgeTone; dot?: boolean; className?: string; children: ReactNode }) {
  const t = tones[tone];
  return (
    <span className={cn("inline-flex h-[22px] items-center gap-1.5 rounded-full px-2 text-[12px] leading-none font-medium whitespace-nowrap", t.box, className)}>
      {dot && <span className={cn("size-1.5 shrink-0 rounded-full", t.dot)} aria-hidden="true" />}
      {children}
    </span>
  );
}

/** Shown wherever sample/demo records or illustrative numbers appear. */
export function DemoBadge({ label = "Demo Data", className }: { label?: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-[20px] items-center gap-1 rounded-full bg-[#fff4e0] px-2 font-mono text-[10px] font-medium tracking-[0.04em] whitespace-nowrap text-[#8a5a00] uppercase",
        className,
      )}
    >
      <svg className="size-2.5" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M6 1.5 11 10.5H1L6 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M6 5v2.2M6 8.8v.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      {label}
    </span>
  );
}
