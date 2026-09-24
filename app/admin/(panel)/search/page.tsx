import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { requireUser } from "@/lib/auth/session";
import { param } from "@/lib/services/admin/query";
import { globalSearch, searchTypeLabels, type SearchResult } from "@/lib/services/admin/search";

export const metadata: Metadata = { title: "Search" };

const ORDER: SearchResult["type"][] = ["lead", "audit", "message", "case_study", "blog"];

export default async function SearchPage(props: PageProps<"/admin/search">) {
  await requireUser();
  const sp = await props.searchParams;
  const q = (param(sp, "q") ?? "").slice(0, 100);
  const results = q.length >= 2 ? await globalSearch(q, 50) : [];
  const groups = ORDER.map((type) => ({ type, items: results.filter((r) => r.type === type) })).filter((g) => g.items.length > 0);

  return (
    <div>
      <PageHeader title="Search" description="Leads, audits, messages, case studies and blog posts." />

      <form action="/admin/search" method="get" role="search" className="mb-6 flex max-w-xl gap-2">
        <label htmlFor="search-page-q" className="sr-only">
          Search the admin
        </label>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-3" aria-hidden="true" />
          <input
            id="search-page-q"
            name="q"
            type="search"
            defaultValue={q}
            minLength={2}
            placeholder="Name, company, email, website, title…"
            className="h-10 w-full rounded-[10px] border border-hair bg-white pr-3 pl-9 text-sm placeholder:text-fg-3 focus:outline-none"
          />
        </div>
        <Button size="sm" type="submit">Search</Button>
      </form>

      {q.length < 2 ? (
        <EmptyState icon={<Search className="size-5" strokeWidth={1.75} />} title="Search everything in one place" description="Type at least two characters — a name, company, email, website or post title." />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={<Search className="size-5" strokeWidth={1.75} />}
          title={`No matches for “${q}”`}
          description="Check the spelling, try part of an email or domain, or browse a list directly."
          action={
            <div className="flex flex-wrap justify-center gap-3 text-[13px] font-medium">
              <Link href="/admin/leads" className="font-medium text-brand underline-offset-4 hover:underline">
                Leads
              </Link>
              <Link href="/admin/audits" className="font-medium text-brand underline-offset-4 hover:underline">
                Audits
              </Link>
              <Link href="/admin/messages" className="font-medium text-brand underline-offset-4 hover:underline">
                Messages
              </Link>
            </div>
          }
        />
      ) : (
        <div className="space-y-5">
          <p className="text-[13px] text-fg-2" role="status">
            {results.length} result{results.length === 1 ? "" : "s"} for “{q}”
          </p>
          {groups.map((g) => (
            <section key={g.type} aria-labelledby={`results-${g.type}`} className="overflow-hidden rounded-[16px] border border-hair bg-white">
              <h2 id={`results-${g.type}`} className="flex items-center gap-2 border-b border-hair bg-soft px-5 py-2.5 font-sans text-[13px] font-semibold tracking-normal text-fg">
                {searchTypeLabels[g.type]}
                <span className="tabular rounded bg-white px-1.5 text-[11px] text-fg-2">{g.items.length}</span>
              </h2>
              <ul className="divide-y divide-hair">
                {g.items.map((r) => (
                  <li key={`${r.type}-${r.id}`}>
                    <Link href={r.href} className="block px-5 py-3 hover:bg-[#fafaf9]">
                      <span className="block text-[14px] font-medium text-fg">{r.title}</span>
                      <span className="block truncate text-[12.5px] text-fg-2">{r.subtitle}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
