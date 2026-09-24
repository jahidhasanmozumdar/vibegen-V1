import { useId } from "react";

import { cn } from "@/lib/utils/cn";

/** Arc and lens paths of the VibeGen mark, drawn on a 64×36 grid. Shared with the favicon and OG image. */
export const LOGO_ARC = "M3 24.5C9 24.5 12 19 16 13C20 7 25 3 32 3C39 3 44 7 48 13C52 19 55 24.5 61 24.5";
export const LOGO_LENS = "M20 24.6C24 20 28 18.2 32 18.2C36 18.2 40 20 44 24.6C40 29.2 36 31 32 31C28 31 24 29.2 20 24.6Z";
export const LOGO_ARC_STOPS = ["#9a24e6", "#b21ff7", "#3a4cf9"] as const;
export const LOGO_LENS_STOPS = ["#14a8f7", "#1f73f6"] as const;

/** The VibeGen mark: a violet-to-blue arc over a blue lens. Size it with a height class; width follows the 16:9 box. */
export function LogoMark({ className }: { className?: string }) {
  const id = useId();
  const arc = `${id}-arc`;
  const lens = `${id}-lens`;
  return (
    <svg viewBox="0 0 64 36" className={cn("h-6 w-auto shrink-0", className)} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={arc} x1="0" y1="0" x2="64" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={LOGO_ARC_STOPS[0]} />
          <stop offset="0.45" stopColor={LOGO_ARC_STOPS[1]} />
          <stop offset="1" stopColor={LOGO_ARC_STOPS[2]} />
        </linearGradient>
        <linearGradient id={lens} x1="20" y1="18" x2="44" y2="31" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={LOGO_LENS_STOPS[0]} />
          <stop offset="1" stopColor={LOGO_LENS_STOPS[1]} />
        </linearGradient>
      </defs>
      <path d={LOGO_ARC} stroke={`url(#${arc})`} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={LOGO_LENS} stroke={`url(#${lens})`} strokeWidth="3.8" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/** Mark + "VibeGen" wordmark, no link. */
export function Wordmark({ className, size = 17 }: { className?: string; size?: number }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-fg", className)} style={{ fontSize: size }}>
      <LogoMark className="h-[1.45em]" />
      <span className="font-semibold tracking-[-0.03em]">VibeGen</span>
    </span>
  );
}
