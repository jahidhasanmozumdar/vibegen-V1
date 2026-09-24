import { FlaskConical } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

/** The mandatory label for any case study with is_demo = true. */
export function DemoLabel({ className, children = "Illustrative Example — Demo Data" }: { className?: string; children?: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full bg-[#fff4e0] px-3 py-1 text-[12.5px] font-medium text-[#8a5a00] ring-1 ring-[#f5dcaa]", className)}>
      <FlaskConical className="size-3.5" aria-hidden="true" />
      {children}
    </span>
  );
}

/** Calm long-form typography for CMS markdown (case studies). */
export const proseClasses = cn(
  "max-w-[68ch] text-[17px] leading-[1.75] text-fg-2",
  "[&>*+*]:mt-5",
  "[&_h2]:mt-10 [&_h2]:text-[1.5rem] [&_h2]:font-semibold [&_h2]:tracking-[-0.03em] [&_h2]:text-fg",
  "[&_h3]:mt-8 [&_h3]:text-[1.2rem] [&_h3]:font-semibold [&_h3]:tracking-[-0.02em] [&_h3]:text-fg",
  "[&_a]:font-medium [&_a]:text-brand [&_a]:underline-offset-4 hover:[&_a]:underline",
  "[&_strong]:font-semibold [&_strong]:text-fg",
  "[&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_li]:marker:text-fg-3",
  "[&_blockquote]:border-l-2 [&_blockquote]:border-brand [&_blockquote]:pl-5 [&_blockquote]:text-fg",
  "[&_code]:rounded-[6px] [&_code]:bg-soft [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.88em]",
  "[&_hr]:my-10 [&_hr]:border-hair",
);
