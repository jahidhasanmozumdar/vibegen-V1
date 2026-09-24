import { ArrowRight, ArrowUpRight, Plus } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { cta } from "@/lib/config/site";
import type { FaqItem } from "@/lib/data/types";
import { cn } from "@/lib/utils/cn";

/*
 * Small "Premium Calm" building blocks shared by the services, industries and
 * case-study pages. Everything here is presentational.
 */

/** The two site CTAs, primary first. */
export function CtaPair({ primaryLabel }: { primaryLabel?: string }) {
  return (
    <>
      <Link href={cta.primary.href} className="pm-btn pm-btn-dark">
        {primaryLabel ?? cta.primary.label}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
      <Link href={cta.secondary.href} className="pm-btn pm-btn-light">
        {cta.secondary.label}
      </Link>
    </>
  );
}

/** Amber "Sample data" / "Illustrative" tag for any visual with made-up numbers. */
export function SampleTag({ children = "Sample data", className }: { children?: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full bg-[#fff4e0] px-2.5 py-1 font-mono text-[10.5px] font-medium tracking-wide whitespace-nowrap text-[#8a5a00] uppercase", className)}>
      {children}
    </span>
  );
}

/** Soft stage behind a product visual, with an honest caption underneath. */
export function VisualStage({ children, caption = "Illustrative sample screen. Not client data." }: { children: ReactNode; caption?: string }) {
  return (
    <figure className="m-0 w-0 min-w-full">
      <div aria-hidden="true" className="rounded-[28px] bg-[radial-gradient(120%_90%_at_50%_0%,#fbfbfa,#f1f0ec)] p-4 sm:p-8">
        {children}
      </div>
      <figcaption className="mt-3 text-center text-[12.5px] text-fg-3">{caption}</figcaption>
    </figure>
  );
}

/** Standard section wrapper. */
export function Section({ id, tone = "white", className, children }: { id: string; tone?: "white" | "soft" | "line"; className?: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className={cn("py-20 lg:py-28", tone === "soft" && "bg-soft", tone === "line" && "border-t border-hair", className)}>
      <div className="pm-wrap">{children}</div>
    </section>
  );
}

export interface LedgerRow {
  problem: ReactNode;
  cause: ReactNode;
  fix: ReactNode;
  href?: string;
  linkLabel?: string;
}

/**
 * Problem → real cause → what we do. The fix column sits on the dark panel so
 * it is what the eye lands on first. On mobile each row is its own card.
 */
export function Ledger({ rows, fixLabel = "What we do" }: { rows: LedgerRow[]; fixLabel?: string }) {
  return (
    <div className="mt-14 lg:overflow-hidden lg:rounded-[24px] lg:border lg:border-hair">
      <div className="hidden grid-cols-[1fr_1fr_1.25fr] border-b border-hair bg-[#fbfbfa] lg:grid">
        <p className="pm-eyebrow px-7 py-4">The problem</p>
        <p className="pm-eyebrow border-l border-hair px-7 py-4">The real cause</p>
        <p className="border-l border-fg bg-fg px-7 py-4 font-mono text-[0.76rem] font-medium tracking-[0.04em] text-[#7fb2ff] uppercase">{fixLabel}</p>
      </div>
      <ol className="space-y-4 lg:space-y-0 lg:divide-y lg:divide-hair">
        {rows.map((r, i) => (
          <li key={i} className="grid overflow-hidden rounded-[20px] border border-hair lg:grid-cols-[1fr_1fr_1.25fr] lg:overflow-visible lg:rounded-none lg:border-0">
            <div className="px-6 pt-6 lg:px-7 lg:py-7">
              <p className="pm-eyebrow lg:hidden">The problem</p>
              <p className="mt-2 text-[17px] leading-snug font-medium tracking-[-0.02em] lg:mt-0">{r.problem}</p>
            </div>
            <div className="px-6 pt-4 pb-6 lg:border-l lg:border-hair lg:px-7 lg:py-7">
              <p className="pm-eyebrow lg:hidden">The real cause</p>
              <p className="mt-2 text-[15px] leading-relaxed text-fg-2 lg:mt-0">{r.cause}</p>
            </div>
            <div className="bg-fg px-6 py-6 text-white lg:px-7 lg:py-7">
              <p className="font-mono text-[0.76rem] font-medium tracking-[0.04em] text-[#7fb2ff] uppercase lg:hidden">{fixLabel}</p>
              <p className="mt-2 text-[15.5px] leading-relaxed text-white/85 lg:mt-0">{r.fix}</p>
              {r.href ? (
                <Link href={r.href} className="group mt-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-white">
                  {r.linkLabel ?? "Learn more"}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** FAQ accordion between hairlines, with a heading column. */
export function FaqBlock({ id, title, accent, items }: { id: string; title: string; accent?: string; items: FaqItem[] }) {
  return (
    <section aria-labelledby={id} className="border-t border-hair py-20 lg:py-28">
      <div className="pm-wrap grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <p className="pm-eyebrow">FAQ</p>
          <h2 id={id} className="pm-h2 mt-5">
            {title} {accent ? <span className="pm-serif">{accent}</span> : null}
          </h2>
          <p className="pm-lede mt-5">Straight answers to what people ask before starting.</p>
          <p className="mt-7 text-[15px] text-fg-2">
            Something else?{" "}
            <Link href="/contact" className="pm-link">
              Send us a message
            </Link>{" "}
            or{" "}
            <Link href={cta.secondary.href} className="pm-link">
              book a call
            </Link>
            .
          </p>
        </div>
        <div className="divide-y divide-hair border-y border-hair">
          {items.map((f, i) => (
            <details key={f.question} className="group" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[17px] font-medium tracking-[-0.015em] [&::-webkit-details-marker]:hidden">
                {f.question}
                <Plus className="size-5 shrink-0 text-fg-3 transition-transform duration-200 group-open:rotate-45" aria-hidden="true" />
              </summary>
              <p className="max-w-2xl pb-6 text-[15.5px] leading-relaxed text-fg-2">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Linked card used for "related" services and industries. */
export function LinkCard({ href, title, body, meta, children }: { href: string; title: string; body: string; meta?: ReactNode; children?: ReactNode }) {
  return (
    <Link href={href} className="group pm-card flex h-full flex-col p-6 transition-shadow hover:shadow-[0_24px_48px_-24px_rgb(10_13_20/0.22)]">
      <div className="flex items-start justify-between gap-4">
        {meta ? <span className="pm-eyebrow">{meta}</span> : <span />}
        <ArrowUpRight className="size-5 shrink-0 text-fg-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand" aria-hidden="true" />
      </div>
      {children}
      <h3 className="mt-6 text-[18px] font-semibold tracking-[-0.02em]">{title}</h3>
      <p className="mt-2 text-[14.5px] leading-relaxed text-fg-2">{body}</p>
    </Link>
  );
}
