import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";

import { DateCell, DemoMark, ServiceSummary, WebsiteLink } from "@/components/admin/cells";
import { ClickableRow } from "@/components/admin/clickable-row";
import { AddLeadButton } from "@/components/admin/leads/add-lead-button";
import { LeadRowActions } from "@/components/admin/leads/lead-row-actions";
import { ListToolbar } from "@/components/admin/list-toolbar";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { ButtonLink } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/states";
import { ResponsiveTable, SortableTH, TD, TH, THead, Table } from "@/components/ui/table";
import { requireUser } from "@/lib/auth/session";
import { publicEnv } from "@/lib/config/env";
import { leadSourceLabels, leadStatusLabels, serviceLabels, toOptions } from "@/lib/data/labels";
import { hasActiveLeadFilters, listLeadIndustries, listLeads, listProfiles, parseLeadFilters } from "@/lib/services/admin/leads";
import { buildHref, flatParams } from "@/lib/services/admin/query";
import { formatRelative } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Leads" };

export default async function LeadsPage(props: PageProps<"/admin/leads">) {
  await requireUser();
  const sp = await props.searchParams;
  const filters = parseLeadFilters(sp);
  const values = flatParams(sp);
  const [result, profiles, industries] = await Promise.all([listLeads(filters), listProfiles(), listLeadIndustries()]);
  const ownerName = new Map(profiles.map((p) => [p.id, p.full_name]));
  const filtered = hasActiveLeadFilters(filters);

  const sortHref = (column: string, dir: "asc" | "desc") => buildHref("/admin/leads", { ...values, sort: column, dir, page: undefined });
  const pageHref = (page: number) => buildHref("/admin/leads", { ...values, page });

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Everyone who asked for an audit, sent a message or booked a call."
        demo={publicEnv.demoMode}
        actions={<AddLeadButton />}
      />

      <ListToolbar
        values={values}
        searchLabel="Search leads"
        searchPlaceholder="Search name, email, company, website…"
        filters={[
          { name: "status", label: "Status", allLabel: "All statuses", options: toOptions(leadStatusLabels) },
          { name: "source", label: "Source", allLabel: "All sources", options: toOptions(leadSourceLabels) },
          { name: "industry", label: "Industry", allLabel: "All industries", options: industries.map((i) => ({ value: i, label: i })) },
          { name: "service", label: "Service", allLabel: "All services", options: toOptions(serviceLabels) },
          {
            name: "owner",
            label: "Owner",
            allLabel: "Any owner",
            options: [{ value: "unassigned", label: "Unassigned" }, ...profiles.map((p) => ({ value: p.id, label: p.full_name }))],
          },
          { name: "demo", label: "Data type", allLabel: "Real + demo", options: [{ value: "real", label: "Real only" }, { value: "demo", label: "Demo only" }] },
        ]}
        dateFilters={{ fromLabel: "Created from", toLabel: "to" }}
      />

      {result.total === 0 ? (
        filtered ? (
          <EmptyState
            icon={<Users className="size-5" strokeWidth={1.75} />}
            title="No leads match these filters"
            description="Try a different search, or clear the filters to see every lead."
            action={
              <ButtonLink href="/admin/leads" variant="outline" size="sm">
                Clear filters
              </ButtonLink>
            }
          />
        ) : (
          <EmptyState
            icon={<Users className="size-5" strokeWidth={1.75} />}
            title="No leads yet."
            description="Leads appear here when someone submits the growth audit or contact form. You can also add one by hand."
            action={<AddLeadButton />}
          />
        )
      ) : (
        <>
          <ResponsiveTable
            table={
              <Table className="text-[13px]">
                <THead>
                  <tr>
                    <SortableTH label="Name · Email" column="full_name" currentSort={filters.sort} currentDir={filters.dir} href={sortHref} />
                    <SortableTH label="Company · Website" column="company" currentSort={filters.sort} currentDir={filters.dir} href={sortHref} />
                    <TH>Industry</TH>
                    <TH>Source</TH>
                    <TH>Service</TH>
                    <SortableTH label="Status" column="status" currentSort={filters.sort} currentDir={filters.dir} href={sortHref} />
                    <SortableTH label="Created" column="created_at" currentSort={filters.sort} currentDir={filters.dir} href={sortHref} />
                    <TH>
                      <span className="sr-only">Actions</span>
                    </TH>
                  </tr>
                </THead>
                <tbody>
                  {result.rows.map((l) => (
                    <ClickableRow key={l.id} href={`/admin/leads/${l.id}`}>
                      <TD>
                        <span className="flex items-center gap-2 font-medium whitespace-nowrap text-fg">
                          <Link href={`/admin/leads/${l.id}`} className="underline decoration-transparent decoration-2 underline-offset-4 hover:decoration-[#0a6cff]">
                            {l.full_name}
                          </Link>
                          <DemoMark show={l.is_demo} />
                        </span>
                        <span className="block max-w-60 truncate text-[12px] text-fg-2" title={l.email}>
                          {l.email}
                        </span>
                        {l.owner_id && <span className="block max-w-60 truncate text-[11.5px] text-fg-3">Owner: {ownerName.get(l.owner_id) ?? "Team member"}</span>}
                      </TD>
                      <TD>
                        <span className="block max-w-52 truncate text-fg">{l.company ?? <span className="text-fg-3">—</span>}</span>
                        <span className="block max-w-52 truncate text-[12px]">
                          <WebsiteLink url={l.website} />
                        </span>
                      </TD>
                      <TD className="min-w-28">{l.industry ?? <span className="text-fg-3">—</span>}</TD>
                      <TD>{leadSourceLabels[l.source]}</TD>
                      <TD>
                        <ServiceSummary services={l.services} />
                      </TD>
                      <TD>
                        <StatusBadge kind="lead" value={l.status} />
                      </TD>
                      <TD>
                        <DateCell iso={l.created_at} />
                      </TD>
                      <TD className="text-right">
                        <LeadRowActions id={l.id} name={l.full_name} status={l.status} />
                      </TD>
                    </ClickableRow>
                  ))}
                </tbody>
              </Table>
            }
            cards={result.rows.map((l) => (
              <li key={l.id} className="rounded-[16px] border border-hair bg-white">
                <div className="flex items-start justify-between gap-3 p-4">
                  <Link href={`/admin/leads/${l.id}`} className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-sm font-semibold text-fg">
                      {l.full_name} <DemoMark show={l.is_demo} />
                    </span>
                    <span className="mt-0.5 block truncate text-[13px] text-fg-2">{[l.company, l.email].filter(Boolean).join(" · ")}</span>
                    <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-fg-2">
                      <StatusBadge kind="lead" value={l.status} />
                      <span>{leadSourceLabels[l.source]}</span>
                      <ServiceSummary services={l.services} />
                      <span>{formatRelative(l.created_at)}</span>
                    </span>
                  </Link>
                  <LeadRowActions id={l.id} name={l.full_name} status={l.status} />
                </div>
              </li>
            ))}
          />
          <Pagination page={result.page} pageCount={result.pageCount} total={result.total} pageSize={result.pageSize} href={pageHref} />
        </>
      )}
    </div>
  );
}
