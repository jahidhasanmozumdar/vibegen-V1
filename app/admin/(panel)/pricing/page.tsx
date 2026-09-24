import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Tag } from "lucide-react";

import { ListFilters } from "@/components/admin/cms/list-filters";
import { listHref, matchesQuery, paginate, readListQuery, sortRowsBy } from "@/components/admin/cms/list-query";
import { CmsRowActions } from "@/components/admin/cms/row-actions";
import { PageHeader } from "@/components/admin/page-header";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/states";
import { ResponsiveTable, SortableTH, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { deletePricingPlanAction, setPricingPlanActiveAction } from "@/lib/actions/admin/cms-pricing";
import { can, requireUser } from "@/lib/auth/session";
import { cmsList } from "@/lib/services/admin/cms";
import { formatCurrency, formatRelative } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Pricing" };

const SORTS = ["sort_order", "name", "monthly_price", "updated_at"] as const;
type Sort = (typeof SORTS)[number];
const PAGE_SIZE = 20;

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <Badge tone={active ? "success" : "neutral"} dot>
      {active ? "Active" : "Hidden"}
    </Badge>
  );
}

export default async function PricingPage(props: PageProps<"/admin/pricing">) {
  const user = await requireUser();
  const canEdit = can(user, "content:write");
  const query = readListQuery(await props.searchParams, { sorts: SORTS, defaultSort: "sort_order", defaultDir: "asc", filters: ["active"] });

  const rows = await cmsList("pricing_plans");
  const filtered = rows.filter((p) => matchesQuery(query.q, p.name, p.description, p.badge) && (!query.filters.active || (query.filters.active === "active") === p.active));
  const { items, page, pageCount, total } = paginate(sortRowsBy(filtered, (p) => p[query.sort], query.dir), query.page, PAGE_SIZE);
  const href = (patch: Parameters<typeof listHref<Sort>>[2]) => listHref("/admin/pricing", query, patch);
  const sortHref = (sort: string, dir: "asc" | "desc") => href({ sort: sort as Sort, dir, page: 1 });

  const addButton = canEdit ? (
    <ButtonLink href="/admin/pricing/new" icon={<Plus className="size-4" />}>
      Add plan
    </ButtonLink>
  ) : null;

  const actionsFor = (p: (typeof items)[number]) =>
    canEdit ? (
      <CmsRowActions
        label={p.name}
        editHref={`/admin/pricing/${p.id}`}
        viewHref={p.active ? "/pricing" : null}
        toggle={{ active: p.active, activateLabel: "Show on site", deactivateLabel: "Hide from site", run: setPricingPlanActiveAction.bind(null, p.id, !p.active) }}
        onDelete={deletePricingPlanAction.bind(null, p.id)}
        deleteDescription="The plan disappears from the pricing page immediately. Consider hiding it instead. This can't be undone."
      />
    ) : null;

  return (
    <>
      <PageHeader title="Pricing" description="Packages shown on /pricing, in order." actions={addButton} />
      <Alert tone="warning" className="mb-5">
        Pricing changes go live immediately. Hidden plans stay here but are not shown on the site.
      </Alert>

      {rows.length === 0 ? (
        <EmptyState icon={<Tag className="size-5" />} title="No pricing plans yet." description="The site shows the built-in starter packages until you add plans here." action={addButton} />
      ) : (
        <>
          <ListFilters
            placeholder="Search plans…"
            filters={[{ key: "active", label: "Visibility", options: [{ value: "active", label: "Active" }, { value: "hidden", label: "Hidden" }] }]}
          />
          {total === 0 ? (
            <EmptyState title="No plans match these filters." />
          ) : (
            <>
              <ResponsiveTable
                table={
                  <Table>
                    <THead>
                      <tr>
                        <SortableTH label="Order" column="sort_order" currentSort={query.sort} currentDir={query.dir} href={sortHref} className="w-20" />
                        <SortableTH label="Plan" column="name" currentSort={query.sort} currentDir={query.dir} href={sortHref} />
                        <SortableTH label="Monthly" column="monthly_price" currentSort={query.sort} currentDir={query.dir} href={sortHref} />
                        <TH>Setup fee</TH>
                        <TH>Ad spend</TH>
                        <TH>Status</TH>
                        <SortableTH label="Updated" column="updated_at" currentSort={query.sort} currentDir={query.dir} href={sortHref} />
                        <TH className="w-12">
                          <span className="sr-only">Actions</span>
                        </TH>
                      </tr>
                    </THead>
                    <tbody>
                      {items.map((p) => (
                        <TR key={p.id}>
                          <TD className="tabular text-fg-2">{p.sort_order}</TD>
                          <TD>
                            <div className="flex items-center gap-2">
                              <Link href={`/admin/pricing/${p.id}`} className="font-medium text-fg underline decoration-transparent decoration-2 underline-offset-4 hover:decoration-[#0a6cff]">
                                {p.name}
                              </Link>
                              {p.badge && <Badge tone="accent">{p.badge}</Badge>}
                            </div>
                          </TD>
                          <TD className="tabular">{formatCurrency(p.monthly_price)}</TD>
                          <TD className="tabular">{p.setup_fee ? formatCurrency(p.setup_fee) : "—"}</TD>
                          <TD className="text-fg-2">{p.ad_spend_range}</TD>
                          <TD>
                            <ActiveBadge active={p.active} />
                          </TD>
                          <TD className="tabular whitespace-nowrap text-fg-2">{formatRelative(p.updated_at)}</TD>
                          <TD className="text-right">{actionsFor(p)}</TD>
                        </TR>
                      ))}
                    </tbody>
                  </Table>
                }
                cards={items.map((p) => (
                  <li key={p.id} className="rounded-[16px] border border-hair bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/admin/pricing/${p.id}`} className="font-medium text-fg">
                        {p.name}
                      </Link>
                      {actionsFor(p)}
                    </div>
                    <p className="tabular mt-1 text-[13px] text-fg-2">
                      {formatCurrency(p.monthly_price)} / month{p.setup_fee ? ` + ${formatCurrency(p.setup_fee)} setup` : ""}
                    </p>
                    <div className="mt-2">
                      <ActiveBadge active={p.active} />
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
