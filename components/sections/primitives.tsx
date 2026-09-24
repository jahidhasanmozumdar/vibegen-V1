import { ArrowRight, Check, Plus, X } from "lucide-react";
import type { ReactNode } from "react";

import type { FaqItem } from "@/lib/data/types";
import { cn } from "@/lib/utils/cn";

/*
 * "Premium Calm" building blocks for inner pages (docs/spec/02-design-direction.md).
 * Small, composable, server-safe. Pages combine these with PageHero,
 * SectionHead and FooterCta.
 */

/** A page band: white or soft, optional top hairline, standard vertical rhythm. */
export function Section({
  id,
  labelledBy,
  tone = "white",
  bordered = false,
  className,
  children,
}: {
  id?: string;
  labelledBy?: string;
  tone?: "white" | "soft";
  bordered?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn("scroll-mt-20 py-20 lg:py-28", tone === "soft" ? "bg-soft" : "bg-white", bordered && "border-t border-hair", className)}>
      <div className="pm-wrap">{children}</div>
    </section>
  );
}

/** Tick list. `tone="light"` for use on dark panels. */
export function Ticks({ items, tone = "brand", className }: { items: readonly string[]; tone?: "brand" | "green" | "light"; className?: string }) {
  const color = tone === "light" ? "text-[#7fb2ff]" : tone === "green" ? "text-[#12a150]" : "text-brand";
  return (
    <ul className={cn("space-y-3", className)}>
      {items.map((item) => (
        <li key={item} className={cn("flex items-start gap-2.5 text-[15px] leading-snug", tone === "light" ? "text-white/85" : "text-fg-2")}>
          <Check className={cn("mt-0.5 size-4 shrink-0", color)} strokeWidth={2.5} aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Cross list for "not included" / "not a fit". */
export function Crosses({ items, className }: { items: readonly string[]; className?: string }) {
  return (
    <ul className={cn("space-y-3", className)}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-[15px] leading-snug text-fg-2">
          <X className="mt-0.5 size-4 shrink-0 text-fg-3" strokeWidth={2.5} aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Numbered 1-2-3 list for side panels ("What happens next"). */
export function NumberedSteps({ steps, tone = "light", className }: { steps: readonly { title: string; body?: string }[]; tone?: "light" | "dark"; className?: string }) {
  const dark = tone === "dark";
  return (
    <ol className={cn("space-y-5", className)}>
      {steps.map((s, i) => (
        <li key={s.title} className="flex gap-4">
          <span
            aria-hidden="true"
            className={cn("grid size-7 shrink-0 place-items-center rounded-full text-[13px] font-medium tabular-nums", dark ? "bg-white text-fg" : "bg-fg text-white")}
          >
            {i + 1}
          </span>
          <div className="min-w-0 pt-0.5">
            <p className={cn("text-[15px] leading-snug font-medium", dark ? "text-white" : "text-fg")}>{s.title}</p>
            {s.body ? <p className={cn("mt-1 text-[14px] leading-relaxed", dark ? "text-white/60" : "text-fg-3")}>{s.body}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

/**
 * Problem → cause → our fix ledger. The fix column is the dark highlight and
 * is read first on every screen size.
 */
export function FixLedger({ rows, className }: { rows: readonly { problem: string; cause: string; fix: string }[]; className?: string }) {
  return (
    <ol className={cn("space-y-4", className)}>
      {rows.map((r, i) => (
        <li key={r.problem} className="grid overflow-hidden rounded-[24px] border border-hair bg-white lg:grid-cols-[1fr_1fr_1.25fr]">
          <div className="p-6 sm:p-7">
            <p className="pm-eyebrow flex items-center gap-2">
              <span className="grid size-5 place-items-center rounded-full bg-[#fdecea] text-[#b42318]">
                <X className="size-3" strokeWidth={3} aria-hidden="true" />
              </span>
              Problem {String(i + 1).padStart(2, "0")}
            </p>
            <p className="mt-3 text-[17px] leading-snug font-medium tracking-[-0.015em]">{r.problem}</p>
          </div>
          <div className="border-t border-hair p-6 sm:p-7 lg:border-t-0 lg:border-l">
            <p className="pm-eyebrow">Real cause</p>
            <p className="mt-3 text-[15px] leading-relaxed text-fg-2">{r.cause}</p>
          </div>
          <div className="order-first bg-fg p-6 text-white sm:p-7 lg:order-none">
            <p className="flex items-center gap-2 font-mono text-[12px] tracking-wide text-[#7fb2ff] uppercase">
              <ArrowRight className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
              Our fix
            </p>
            <p className="mt-3 text-[16px] leading-relaxed text-white/90">{r.fix}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** FAQ accordion between hairlines. */
export function FaqList({ items, openFirst = true, className }: { items: readonly FaqItem[]; openFirst?: boolean; className?: string }) {
  return (
    <div className={cn("divide-y divide-hair border-y border-hair", className)}>
      {items.map((f, i) => (
        <details key={f.question} className="group" open={openFirst && i === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[17px] font-medium tracking-[-0.015em] [&::-webkit-details-marker]:hidden">
            {f.question}
            <Plus className="size-5 shrink-0 text-fg-3 transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none" aria-hidden="true" />
          </summary>
          <p className="max-w-2xl pb-6 text-[15.5px] leading-relaxed text-fg-2">{f.answer}</p>
        </details>
      ))}
    </div>
  );
}

/** Small "Sample data" pill for illustrative UI. */
export function SampleTag({ className, children = "Sample data" }: { className?: string; children?: ReactNode }) {
  return <span className={cn("rounded-full border border-hair bg-white px-2.5 py-0.5 font-mono text-[10.5px] tracking-wide text-fg-3 uppercase", className)}>{children}</span>;
}

/** Definition rows for a hero side card ("at a glance"). */
export function GlanceCard({ title, rows, footer, className }: { title: string; rows: readonly { term: string; value: ReactNode }[]; footer?: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-[24px] bg-soft p-2", className)}>
      <div className="rounded-[18px] border border-hair bg-white p-6 shadow-[0_40px_80px_-36px_rgb(10_13_20/0.3)] sm:p-7">
        <p className="text-[14px] font-medium">{title}</p>
        <dl className="mt-4 divide-y divide-hair">
          {rows.map((r) => (
            <div key={r.term} className="flex items-baseline justify-between gap-6 py-3.5">
              <dt className="text-[14px] text-fg-3">{r.term}</dt>
              <dd className="text-right text-[15px] font-medium">{r.value}</dd>
            </div>
          ))}
        </dl>
        {footer ? <div className="mt-4 border-t border-hair pt-4 text-[13.5px] leading-relaxed text-fg-3">{footer}</div> : null}
      </div>
    </div>
  );
}
