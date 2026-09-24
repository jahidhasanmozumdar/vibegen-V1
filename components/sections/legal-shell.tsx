import { Plus } from "lucide-react";
import type { ReactNode } from "react";

import { Breadcrumbs } from "@/components/pages/common/breadcrumbs";
import { proseCalm } from "@/components/pages/common/prose";
import { cn } from "@/lib/utils/cn";
import { formatLongDate } from "@/lib/utils/format";

export const LEGAL_LAST_UPDATED = "2026-09-24";

function Contents({ toc, id }: { toc: { id: string; label: string }[]; id: string }) {
  return (
    <ol aria-labelledby={id} className="space-y-2.5 text-[14px] leading-snug">
      {toc.map((item, i) => (
        <li key={item.id} className="flex gap-3">
          <span aria-hidden="true" className="w-5 shrink-0 font-mono text-[12px] leading-[1.6] text-fg-3 tabular-nums">
            {String(i + 1).padStart(2, "0")}
          </span>
          <a href={`#${item.id}`} className="text-fg-2 hover:text-brand">
            {item.label}
          </a>
        </li>
      ))}
    </ol>
  );
}

/** Shared frame for Privacy, Terms and Cookie Policy: calm document layout with a template notice, sticky contents and readable prose. */
export function LegalShell({
  title,
  path,
  intro,
  toc,
  children,
}: {
  title: string;
  path: string;
  intro: ReactNode;
  toc: { id: string; label: string }[];
  children: ReactNode;
}) {
  const updated = formatLongDate(`${LEGAL_LAST_UPDATED}T12:00:00Z`);

  return (
    <>
      <section aria-labelledby="legal-title" className="border-b border-hair bg-white pt-10 pb-14 sm:pt-14 sm:pb-16">
        <div className="pm-wrap">
          <Breadcrumbs crumbs={[{ name: title, path }]} />
          <div className="mt-10 max-w-3xl">
            <p className="pm-eyebrow">
              Last updated <time dateTime={LEGAL_LAST_UPDATED}>{updated}</time>
            </p>
            <h1 id="legal-title" className="pm-h1 mt-4 text-[clamp(2.4rem,1.4rem+3vw,3.8rem)]">
              {title}
            </h1>
            <div className="pm-lede mt-6 max-w-2xl text-[1.08rem]">{intro}</div>
            <p role="note" className="mt-8 flex max-w-2xl items-start gap-3 rounded-[16px] bg-[#fffaeb] p-4 text-[14px] leading-relaxed text-[#7a2e0e] shadow-[inset_0_0_0_1px_#fedf89]">
              <span className="shrink-0 rounded-full bg-[#b54708] px-2 py-0.5 text-[11.5px] font-medium text-white">Template</span>
              <span>This is a template. Review it with a qualified lawyer for your jurisdiction before relying on it.</span>
            </p>
          </div>
        </div>
      </section>

      <div className="bg-white py-14 sm:py-20">
        <div className="pm-wrap grid gap-x-16 gap-y-10 lg:grid-cols-[14rem_minmax(0,680px)]">
          <div>
            <div className="lg:sticky lg:top-24">
              <details className="group rounded-[16px] bg-soft p-5 lg:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between text-[14px] font-medium [&::-webkit-details-marker]:hidden">
                  <span id="legal-toc-mobile">Contents</span>
                  <Plus className="size-4 text-fg-3 transition-transform group-open:rotate-45 motion-reduce:transition-none" aria-hidden="true" />
                </summary>
                <div className="mt-4">
                  <Contents toc={toc} id="legal-toc-mobile" />
                </div>
              </details>
              <nav aria-labelledby="legal-toc" className="hidden lg:block">
                <p id="legal-toc" className="pm-eyebrow mb-4">
                  Contents
                </p>
                <Contents toc={toc} id="legal-toc" />
              </nav>
            </div>
          </div>
          <article className={cn(proseCalm, "min-w-0 [&_h2]:scroll-mt-24")}>{children}</article>
        </div>
      </div>
    </>
  );
}
