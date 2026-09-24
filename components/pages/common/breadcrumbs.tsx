import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { JsonLd, breadcrumbSchema } from "@/components/seo/json-ld";
import type { Crumb } from "@/components/site/page-hero";

/**
 * Breadcrumb trail + BreadcrumbList JSON-LD, matching PageHero's crumbs, for
 * pages that don't use PageHero (forms, articles, legal, thank-you).
 * `crumbs` excludes "Home"; the last crumb is the current page.
 */
export function Breadcrumbs({ crumbs, className }: { crumbs: Crumb[]; className?: string }) {
  const trail: Crumb[] = [{ name: "Home", path: "/" }, ...crumbs];
  return (
    <>
      <nav aria-label="Breadcrumb" className={className}>
        <ol className="flex flex-wrap items-center gap-1.5 text-[13px] text-fg-3">
          {trail.map((c, i) => (
            <li key={c.path} className="flex min-w-0 items-center gap-1.5">
              {i > 0 ? <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" /> : null}
              {i === trail.length - 1 ? (
                <span aria-current="page" className="truncate text-fg-2">
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
      <JsonLd data={breadcrumbSchema(trail)} />
    </>
  );
}
