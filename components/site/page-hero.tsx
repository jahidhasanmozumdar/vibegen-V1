import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { JsonLd, breadcrumbSchema } from "@/components/seo/json-ld";
import { cn } from "@/lib/utils/cn";

export interface Crumb {
  name: string;
  path: string;
}

export interface PageHeroProps {
  /** Trail after "Home". The last crumb is the current page. Also emitted as BreadcrumbList JSON-LD. */
  crumbs: Crumb[];
  /** Small label above the title. */
  eyebrow?: ReactNode;
  /** The page's only h1. */
  title: string;
  /** Word or phrase inside `title` set in the italic serif accent (first match). */
  accent?: string;
  /** Lead paragraph(s). A string is wrapped in <p>. */
  lead: ReactNode;
  /** CTA buttons. */
  children?: ReactNode;
  /** Optional right-hand visual (decorative: aria-hidden, label sample data). */
  aside?: ReactNode;
  /** Soft grey stage instead of white. */
  tone?: "white" | "soft";
  id?: string;
}

function Title({ title, accent }: { title: string; accent?: string }) {
  const at = accent ? title.indexOf(accent) : -1;
  if (!accent || at === -1) return <>{title}</>;
  return (
    <>
      {title.slice(0, at)}
      <span className="pm-serif text-brand">{accent}</span>
      {title.slice(at + accent.length)}
    </>
  );
}

/** "Premium Calm" inner-page hero: breadcrumb, refined h1 with one serif accent, lead, CTAs, optional visual. */
export function PageHero({ crumbs, eyebrow, title, accent, lead, children, aside, tone = "white", id = "page-title" }: PageHeroProps) {
  const trail: Crumb[] = [{ name: "Home", path: "/" }, ...crumbs];

  return (
    <section aria-labelledby={id} className={cn("border-b border-hair", tone === "soft" ? "bg-soft" : "bg-white")}>
      <div className={cn("pm-wrap grid gap-12 pt-10 pb-16 sm:pt-14 lg:pb-24", aside ? "lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16" : "")}>
        <div className={aside ? "" : "max-w-3xl"}>
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-[13px] text-fg-3">
              {trail.map((c, i) => (
                <li key={c.path} className="flex items-center gap-1.5">
                  {i > 0 ? <ChevronRight className="size-3.5" aria-hidden="true" /> : null}
                  {i === trail.length - 1 ? (
                    <span aria-current="page" className="text-fg-2">
                      {c.name}
                    </span>
                  ) : (
                    <Link href={c.path} className="hover:text-fg">
                      {c.name}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          {eyebrow ? <div className="pm-eyebrow mt-10">{eyebrow}</div> : null}
          <h1 id={id} className={cn("pm-h1 text-[clamp(2.4rem,1.2rem+3.6vw,4.2rem)]", eyebrow ? "mt-4" : "mt-10")}>
            <Title title={title} accent={accent} />
          </h1>
          <div className="pm-lede mt-6 max-w-2xl space-y-4">{typeof lead === "string" ? <p>{lead}</p> : lead}</div>
          {children ? <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{children}</div> : null}
        </div>
        {aside ? <div className="relative">{aside}</div> : null}
      </div>
      <JsonLd data={breadcrumbSchema(trail)} />
    </section>
  );
}
