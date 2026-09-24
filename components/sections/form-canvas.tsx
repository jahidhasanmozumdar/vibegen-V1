import type { ReactNode } from "react";

import { Breadcrumbs } from "@/components/pages/common/breadcrumbs";
import type { Crumb } from "@/components/site/page-hero";
import { cn } from "@/lib/utils/cn";

/**
 * Conversion page layout ("Premium Calm"): breadcrumb, H1 and lead on a soft
 * stage, then the form on a clean white card with a sticky side panel.
 * DOM order is H1 → form → side panel, so on mobile the form comes straight
 * after the heading.
 */
export function FormCanvas({
  id,
  crumbs,
  eyebrow,
  title,
  lead,
  intro,
  aside,
  cardTitle,
  cardMeta,
  children,
}: {
  id: string;
  crumbs: Crumb[];
  eyebrow: ReactNode;
  title: ReactNode;
  lead: ReactNode;
  /** Small reassurance chips under the lead. */
  intro?: ReactNode;
  /** Side panel (what happens next, what you get). */
  aside?: ReactNode;
  /** Optional header row inside the form card. */
  cardTitle?: string;
  cardMeta?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="bg-soft pt-10 pb-24 sm:pt-14 lg:pb-32">
      <div className="pm-wrap">
        <Breadcrumbs crumbs={crumbs} />

        <div className="mt-10 max-w-3xl">
          <p className="pm-eyebrow">{eyebrow}</p>
          <h1 id={id} className="pm-h1 mt-4 text-[clamp(2.4rem,1.2rem+3.6vw,4.2rem)]">
            {title}
          </h1>
          <div className="pm-lede mt-6 max-w-2xl">{lead}</div>
          {intro ? <div className="mt-7">{intro}</div> : null}
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:gap-8">
          <div className="min-w-0 rounded-[24px] border border-hair bg-white px-5 pt-5 pb-7 sm:px-8 sm:pt-7 sm:pb-9">
            {cardTitle && (
              <div className="-mx-5 -mt-5 mb-7 flex flex-wrap items-center justify-between gap-3 border-b border-hair px-5 py-4 sm:-mx-8 sm:-mt-7 sm:px-8">
                <p className="text-[14px] font-medium">{cardTitle}</p>
                {cardMeta}
              </div>
            )}
            {children}
          </div>

          {aside && (
            <aside className="min-w-0">
              <div className="space-y-4 lg:sticky lg:top-24">{aside}</div>
            </aside>
          )}
        </div>
      </div>
    </section>
  );
}

/** Quiet step labels for the form card header (decorative mirror of the fieldset legends). */
export function StepChips({ steps }: { steps: string[] }) {
  return (
    <ol aria-hidden="true" className="hidden items-center gap-3 sm:flex">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-1.5 text-[12.5px] text-fg-3">
          <span className="grid size-5 place-items-center rounded-full bg-soft text-[11px] font-medium text-fg-2">{i + 1}</span>
          {s}
        </li>
      ))}
    </ol>
  );
}

/** Side-panel card. `tone="dark"` is the highlighted one (the answer to "what happens next"). */
export function SideCard({
  id,
  title,
  eyebrow,
  tone = "light",
  children,
  className,
}: {
  id: string;
  title: string;
  eyebrow?: string;
  tone?: "light" | "dark";
  children: ReactNode;
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <section aria-labelledby={id} className={cn("rounded-[24px] p-7", dark ? "bg-fg text-white" : "border border-hair bg-white", className)}>
      {eyebrow ? <p className={cn("font-mono text-[11.5px] tracking-wide uppercase", dark ? "text-white/50" : "text-fg-3")}>{eyebrow}</p> : null}
      <h2 id={id} className={cn("text-[19px] leading-tight font-semibold tracking-[-0.02em]", eyebrow && "mt-2")}>
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** Reassurance chips under a form page lead. */
export function TrustChips({ items }: { items: { icon: ReactNode; text: ReactNode }[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <li key={i} className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[13.5px] text-fg-2 shadow-[inset_0_0_0_1px_#e8e8ec] [&_svg]:size-4 [&_svg]:text-brand">
          {item.icon}
          {item.text}
        </li>
      ))}
    </ul>
  );
}
