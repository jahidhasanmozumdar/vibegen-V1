import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Quote } from "lucide-react";

import { ListFilters } from "@/components/admin/cms/list-filters";
import { listHref, matchesQuery, paginate, readListQuery, sortRowsBy } from "@/components/admin/cms/list-query";
import { CmsRowActions } from "@/components/admin/cms/row-actions";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Alert } from "@/components/ui/alert";
import { DemoBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/states";
import { ResponsiveTable, SortableTH, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { deleteTestimonialAction, setTestimonialStatusAction } from "@/lib/actions/admin/cms-testimonials";
import { can, requireUser } from "@/lib/auth/session";
import { publishStatusLabels, toOptions } from "@/lib/data/labels";
import { cmsList } from "@/lib/services/admin/cms";
import { formatRelative, truncate } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Testimonials" };

const SORTS = ["name", "company", "status", "updated_at"] as const;
type Sort = (typeof SORTS)[number];
const PAGE_SIZE = 20;

export default async function TestimonialsPage(props: PageProps<"/admin/testimonials">) {
  const user = await requireUser();
  const canEdit = can(user, "content:write");
  const query = readListQuery(await props.searchParams, { sorts: SORTS, defaultSort: "updated_at", filters: ["status", "demo"] });

  const rows = await cmsList("testimonials");
  const filtered = rows.filter(
    (t) =>
      matchesQuery(query.q, t.name, t.company, t.role, t.quote) &&
      (!query.filters.status || t.status === query.filters.status) &&
      (!query.filters.demo || (query.filters.demo === "demo") === t.is_demo),
  );
  const { items, page, pageCount, total } = paginate(sortRowsBy(filtered, (t) => t[query.sort], query.dir), query.page, PAGE_SIZE);
  const href = (patch: Parameters<typeof listHref<Sort>>[2]) => listHref("/admin/testimonials", query, patch);
  const sortHref = (sort: string, dir: "asc" | "desc") => href({ sort: sort as Sort, dir, page: 1 });

  const addButton = canEdit ? (
    <ButtonLink href="/admin/testimonials/new" icon={<Plus className="size-4" />}>
      Add Testimonial
    </ButtonLink>
  ) : null;

  const actionsFor = (t: (typeof items)[number]) =>
    canEdit ? (
      <CmsRowActions
        label={t.name}
        editHref={`/admin/testimonials/${t.id}`}
        toggle={{
          active: t.status === "published",
          activateLabel: "Publish",
          deactivateLabel: "Unpublish",
          run: setTestimonialStatusAction.bind(null, t.id, t.status === "published" ? "draft" : "published"),
        }}
        onDelete={deleteTestimonialAction.bind(null, t.id)}
        deleteDescription="It will be removed from the site and unlinked from any case study. This can't be undone."
      />
    ) : null;

  return (
    <>
      <PageHeader title="Testimonials" description={`${rows.length} total`} actions={addButton} />
      <Alert tone="warning" className="mb-5">
        Only publish real testimonials you have permission to use. Demo testimonials are labelled and never presented as real clients.
      </Alert>

      {rows.length === 0 ? (
        <EmptyState icon={<Quote className="size-5" />} title="No testimonials yet." description="Add a quote from a real client once you have their approval." action={addButton} />
      ) : (
        <>
          <ListFilters
            placeholder="Search name, company, quote…"
            filters={[
              { key: "status", label: "Statuses", options: toOptions(publishStatusLabels) },
              { key: "demo", label: "Records", options: [{ value: "real", label: "Real" }, { value: "demo", label: "Demo data" }] },
            ]}
          />
          {total === 0 ? (
            <EmptyState title="No testimonials match these filters." description="Try a different search or clear the filters." />
          ) : (
            <>
              <ResponsiveTable
                table={
                  <Table>
                    <THead>
                      <tr>
                        <SortableTH label="Name" column="name" currentSort={query.sort} currentDir={query.dir} href={sortHref} />
                        <SortableTH label="Company" column="company" currentSort={query.sort} currentDir={query.dir} href={sortHref} />
                        <TH>Quote</TH>
                        <SortableTH label="Status" column="status" currentSort={query.sort} currentDir={query.dir} href={sortHref} />
                        <SortableTH label="Updated" column="updated_at" currentSort={query.sort} currentDir={query.dir} href={sortHref} />
                        <TH className="w-12">
                          <span className="sr-only">Actions</span>
                        </TH>
                      </tr>
                    </THead>
                    <tbody>
                      {items.map((t) => (
                        <TR key={t.id}>
                          <TD>
                            <div className="flex items-center gap-2">
                              <Link href={`/admin/testimonials/${t.id}`} className="font-medium whitespace-nowrap text-fg underline decoration-transparent decoration-2 underline-offset-4 hover:decoration-[#0a6cff]">
                                {t.name}
                              </Link>
                              {t.is_demo && <DemoBadge />}
                            </div>
                            {t.role && <p className="text-xs text-fg-3">{t.role}</p>}
                          </TD>
                          <TD>{t.company ?? "—"}</TD>
                          <TD className="max-w-sm text-fg-2">“{truncate(t.quote, 90)}”</TD>
                          <TD>
                            <StatusBadge kind="publish" value={t.status} />
                          </TD>
                          <TD className="tabular whitespace-nowrap text-fg-2">{formatRelative(t.updated_at)}</TD>
                          <TD className="text-right">{actionsFor(t)}</TD>
                        </TR>
                      ))}
                    </tbody>
                  </Table>
                }
                cards={items.map((t) => (
                  <li key={t.id} className="rounded-[16px] border border-hair bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/admin/testimonials/${t.id}`} className="font-medium text-fg">
                        {t.name}
                        {t.company && <span className="font-normal text-fg-2"> · {t.company}</span>}
                      </Link>
                      {actionsFor(t)}
                    </div>
                    <p className="mt-1 text-[13px] text-fg-2">“{truncate(t.quote, 120)}”</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <StatusBadge kind="publish" value={t.status} />
                      {t.is_demo && <DemoBadge />}
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
