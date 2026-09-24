import type { Metadata } from "next";
import Link from "next/link";
import { Building2 } from "lucide-react";

import { ListFilters } from "@/components/admin/cms/list-filters";
import { listHref, matchesQuery, paginate, readListQuery, sortRowsBy } from "@/components/admin/cms/list-query";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { ButtonLink } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/states";
import { ResponsiveTable, SortableTH, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { can, requireUser } from "@/lib/auth/session";
import { publishStatusLabels, toOptions } from "@/lib/data/labels";
import { cmsList } from "@/lib/services/admin/cms";
import { formatRelative } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Industries" };

const SORTS = ["sort_order", "name", "status", "updated_at"] as const;
type Sort = (typeof SORTS)[number];
const PAGE_SIZE = 20;

export default async function IndustriesPage(props: PageProps<"/admin/industries">) {
  const user = await requireUser();
  const canEdit = can(user, "content:write");
  const query = readListQuery(await props.searchParams, { sorts: SORTS, defaultSort: "sort_order", defaultDir: "asc", filters: ["status"] });

  const rows = await cmsList("industries");
  const filtered = rows.filter((s) => matchesQuery(query.q, s.name, s.slug, s.headline, s.summary) && (!query.filters.status || s.status === query.filters.status));
  const { items, page, pageCount, total } = paginate(sortRowsBy(filtered, (s) => s[query.sort], query.dir), query.page, PAGE_SIZE);
  const href = (patch: Parameters<typeof listHref<Sort>>[2]) => listHref("/admin/industries", query, patch);
  const sortHref = (sort: string, dir: "asc" | "desc") => href({ sort: sort as Sort, dir, page: 1 });

  const edit = (id: string, name: string) =>
    canEdit ? (
      <ButtonLink href={`/admin/industries/${id}`} variant="outline" size="sm" aria-label={`Edit ${name}`}>
        Edit
      </ButtonLink>
    ) : null;

  return (
    <>
      <PageHeader title="Industries" description="Industry landing pages. Content is editable; URLs are fixed." />
      {rows.length === 0 ? (
        <EmptyState
          icon={<Building2 className="size-5" />}
          title="No industries yet."
          description="The public site is showing the built-in starter copy. Install starter content to edit it here."
          action={
            can(user, "demo:manage") ? (
              <ButtonLink href="/admin/settings?tab=data" variant="outline">
                Go to Settings → Data
              </ButtonLink>
            ) : undefined
          }
        />
      ) : (
        <>
          <ListFilters placeholder="Search industries…" filters={[{ key: "status", label: "Statuses", options: toOptions(publishStatusLabels) }]} />
          {total === 0 ? (
            <EmptyState title="No industries match these filters." />
          ) : (
            <>
              <ResponsiveTable
                table={
                  <Table>
                    <THead>
                      <tr>
                        <SortableTH label="Order" column="sort_order" currentSort={query.sort} currentDir={query.dir} href={sortHref} className="w-20" />
                        <SortableTH label="Industry" column="name" currentSort={query.sort} currentDir={query.dir} href={sortHref} />
                        <TH>Headline</TH>
                        <SortableTH label="Status" column="status" currentSort={query.sort} currentDir={query.dir} href={sortHref} />
                        <SortableTH label="Updated" column="updated_at" currentSort={query.sort} currentDir={query.dir} href={sortHref} />
                        <TH className="w-20">
                          <span className="sr-only">Actions</span>
                        </TH>
                      </tr>
                    </THead>
                    <tbody>
                      {items.map((s) => (
                        <TR key={s.id}>
                          <TD className="tabular text-fg-2">{s.sort_order}</TD>
                          <TD>
                            <Link href={`/admin/industries/${s.id}`} className="font-medium text-fg underline decoration-transparent decoration-2 underline-offset-4 hover:decoration-[#0a6cff]">
                              {s.name}
                            </Link>
                            <p className="font-mono text-xs text-fg-3">/industries/{s.slug}</p>
                          </TD>
                          <TD className="max-w-md truncate text-fg-2">{s.headline}</TD>
                          <TD>
                            <StatusBadge kind="publish" value={s.status} />
                          </TD>
                          <TD className="tabular whitespace-nowrap text-fg-2">{formatRelative(s.updated_at)}</TD>
                          <TD className="text-right">{edit(s.id, s.name)}</TD>
                        </TR>
                      ))}
                    </tbody>
                  </Table>
                }
                cards={items.map((s) => (
                  <li key={s.id} className="rounded-[16px] border border-hair bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/admin/industries/${s.id}`} className="font-medium text-fg">
                        {s.name}
                      </Link>
                      <StatusBadge kind="publish" value={s.status} />
                    </div>
                    <p className="mt-1 text-[13px] text-fg-2">{s.headline}</p>
                  </li>
                ))}
              />
              <Pagination page={page} pageCount={pageCount} total={total} pageSize={PAGE_SIZE} href={(n) => href({ page: n })} />
            </>
          )}
        </>
      )}
    </>
  );
}
