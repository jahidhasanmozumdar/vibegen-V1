import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

/** Standard section header: mono eyebrow, bold headline, one-sentence lede. */
export function SectionHead({
  id,
  eyebrow,
  title,
  lede,
  align = "left",
  className,
}: {
  id: string;
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      <p className="pm-eyebrow">{eyebrow}</p>
      <h2 id={id} className="pm-h2 mt-5">
        {title}
      </h2>
      {lede ? <p className={cn("pm-lede mt-5", align === "center" && "mx-auto")}>{lede}</p> : null}
    </div>
  );
}
