import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";

import { ListFilters } from "@/components/admin/cms/list-filters";
import { listHref, matchesQuery, paginate, readListQuery, sortRowsBy } from "@/components/admin/cms/list-query";
import { CmsRowActions } from "@/components/admin/cms/row-actions";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { DemoBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/states";
import { ResponsiveTable, SortableTH, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { deleteCaseStudyAction, setCaseStudyStatusAction } from "@/lib/actions/admin/cms-case-studies";
import { can, requireUser } from "@/lib/auth/session";
import { industryLabels, publishStatusLabels, toOptions } from "@/lib/data/labels";
import { cmsList } from "@/lib/services/admin/cms";
import { formatDate, formatRelative } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Case Studies" };

const SORTS = ["title", "client", "status", "published_at", "updated_at"] as const;
type Sort = (typeof SORTS)[number];
const PAGE_SIZE = 20;

export default async function CaseStudiesPage(props: PageProps<"/admin/case-studies">) {
  const user = await requireUser();
  const canEdit = can(user, "content:write");
  const query = readListQuery(await props.searchParams, { sorts: SORTS, defaultSort: "updated_at", filters: ["status", "industry", "demo"] });

  const rows = await cmsList("case_studies");
  const filtered = rows.filter(
    (c) =>
      matchesQuery(query.q, c.title, c.client, c.slug, c.excerpt) &&
      (!query.filters.status || c.status === query.filters.status) &&
      (!query.filters.industry || c.industry === query.filters.industry) &&
      (!query.filters.demo || (query.filters.demo === "demo") === c.is_demo),
  );
  const { items, page, pageCount, total } = paginate(sortRowsBy(filtered, (c) => c[query.sort], query.dir), query.page, PAGE_SIZE);
  const href = (patch: Parameters<typeof listHref<Sort>>[2]) => listHref("/admin/case-studies", query, patch);
  const sortHref = (sort: string, dir: "asc" | "desc") => href({ sort: sort as Sort, dir, page: 1 });
  const demoCount = rows.filter((c) => c.is_demo).length;

  const addButton = canEdit ? (
    <ButtonLink href="/admin/case-studies/new" icon={<Plus className="size-4" />}>
      Add Case Study
    </ButtonLink>
  ) : null;

  const actionsFor = (c: (typeof items)[number]) =>
    canEdit ? (
      <CmsRowActions
        label={c.title}
        editHref={`/admin/case-studies/${c.id}`}
        viewHref={c.status === "published" ? `/case-studies/${c.slug}` : null}
        toggle={{
          active: c.status === "published",
          activateLabel: "Publish",
          deactivateLabel: "Unpublish",
          run: setCaseStudyStatusAction.bind(null, c.id, c.status === "published" ? "draft" : "published"),
        }}
        onDelete={deleteCaseStudyAction.bind(null, c.id)}
      />
    ) : null;

  return (
    <>
      <PageHeader
        title="Case Studies"
        description={
          demoCount > 0
            ? `${rows.length} total · ${demoCount} flagged as demo data and labelled "Illustrative Example" on the site`
            : `${rows.length} total`
        }
        actions={addButton}
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={<FileText className="size-5" />}
          title="No case studies yet."
          description="Add a real, client-approved result — or load illustrative examples from Settings → Data."
          action={addButton}
        />
      ) : (
        <>
          <ListFilters
            placeholder="Search title or client…"
            filters={[
              { key: "status", label: "Statuses", options: toOptions(publishStatusLabels) },
              { key: "industry", label: "Industries", options: toOptions(industryLabels) },
              { key: "demo", label: "Records", options: [{ value: "real", label: "Real results" }, { value: "demo", label: "Demo data" }] },
            ]}
          />
          {total === 0 ? (
            <EmptyState title="No case studies match these filters." description="Try a different search or clear the filters." />
          ) : (
            <>
              <ResponsiveTable
                table={
                  <Table>
                    <THead>
                      <tr>
                        <SortableTH label="Title" column="title" currentSort={query.sort} currentDir={query.dir} href={sortHref} />
                        <SortableTH label="Client" column="client" currentSort={query.sort} currentDir={query.dir} href={sortHref} />
                        <TH>Industry</TH>
                        <SortableTH label="Status" column="status" currentSort={query.sort} currentDir={query.dir} href={sortHref} />
                        <SortableTH label="Published" column="published_at" currentSort={query.sort} currentDir={query.dir} href={sortHref} />
                        <SortableTH label="Updated" column="updated_at" currentSort={query.sort} currentDir={query.dir} href={sortHref} />
                        <TH className="w-12">
                          <span className="sr-only">Actions</span>
                        </TH>
                      </tr>
                    </THead>
                    <tbody>
                      {items.map((c) => (
                        <TR key={c.id}>
                          <TD className="max-w-sm">
                            <div className="flex items-center gap-2">
                              <Link href={`/admin/case-studies/${c.id}`} className="truncate font-medium text-fg underline decoration-transparent decoration-2 underline-offset-4 hover:decoration-[#0a6cff]">
                                {c.title}
                              </Link>
                              {c.is_demo && <DemoBadge />}
                            </div>
                            <p className="truncate font-mono text-xs text-fg-3">/case-studies/{c.slug}</p>
                          </TD>
                          <TD>{c.client}</TD>
                          <TD>{c.industry ? industryLabels[c.industry] : "—"}</TD>
                          <TD>
                            <StatusBadge kind="publish" value={c.status} />
                          </TD>
                          <TD className="tabular whitespace-nowrap">{formatDate(c.published_at)}</TD>
                          <TD className="tabular whitespace-nowrap text-fg-2">{formatRelative(c.updated_at)}</TD>
                          <TD className="text-right">{actionsFor(c)}</TD>
                        </TR>
                      ))}
                    </tbody>
                  </Table>
                }
                cards={items.map((c) => (
                  <li key={c.id} className="rounded-[16px] border border-hair bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/admin/case-studies/${c.id}`} className="min-w-0 font-medium text-fg">
                        {c.title}
                      </Link>
                      {actionsFor(c)}
                    </div>
                    <p className="mt-1 text-[13px] text-fg-2">{c.client}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <StatusBadge kind="publish" value={c.status} />
                      {c.is_demo && <DemoBadge />}
                    </div>
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
