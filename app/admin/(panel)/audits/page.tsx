import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardCheck } from "lucide-react";

import { AuditRowActions } from "@/components/admin/audits/audit-row-actions";
import { DateCell, DemoMark, WebsiteLink } from "@/components/admin/cells";
import { ClickableRow } from "@/components/admin/clickable-row";
import { ListToolbar } from "@/components/admin/list-toolbar";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { StatusTabs } from "@/components/admin/status-tabs";
import { ButtonLink } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/states";
import { ResponsiveTable, SortableTH, TD, TH, THead, Table } from "@/components/ui/table";
import { requireUser } from "@/lib/auth/session";
import { publicEnv } from "@/lib/config/env";
import { auditStatusLabels, auditTypeLabels, priorityLabels, toOptions } from "@/lib/data/labels";
import { AUDIT_STATUSES } from "@/lib/data/types";
import { hasActiveAuditFilters, listAudits, parseAuditFilters } from "@/lib/services/admin/audits";
import { listProfiles } from "@/lib/services/admin/leads";
import { buildHref, flatParams } from "@/lib/services/admin/query";
import { formatRelative } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Audit Requests" };

export default async function AuditsPage(props: PageProps<"/admin/audits">) {
  await requireUser();
  const sp = await props.searchParams;
  const filters = parseAuditFilters(sp);
  const values = flatParams(sp);
  const [result, profiles] = await Promise.all([listAudits(filters), listProfiles()]);
  const names = new Map(profiles.map((p) => [p.id, p.full_name]));

  const sortHref = (column: string, dir: "asc" | "desc") => buildHref("/admin/audits", { ...values, sort: column, dir, page: undefined });
  const pageHref = (page: number) => buildHref("/admin/audits", { ...values, page });
  const assignee = (id: string | null) => (id ? (names.get(id) ?? "Team member") : null);

  return (
    <div>
      <PageHeader title="Audit Requests" description="Free Growth Audit submissions. Open one to work through findings." demo={publicEnv.demoMode} />

      <StatusTabs
        basePath="/admin/audits"
        values={values}
        label="Filter audits by status"
        tabs={[
          { value: undefined, label: "All", count: result.statusCounts.all },
          ...AUDIT_STATUSES.map((s) => ({ value: s, label: auditStatusLabels[s], count: result.statusCounts[s] })),
        ]}
      />

      <ListToolbar
        values={values}
        searchLabel="Search audit requests"
        searchPlaceholder="Search name, company, website…"
        filters={[
          { name: "priority", label: "Priority", allLabel: "Any priority", options: toOptions(priorityLabels) },
          { name: "type", label: "Audit type", allLabel: "All types", options: toOptions(auditTypeLabels) },
          {
            name: "assigned",
            label: "Assigned to",
            allLabel: "Anyone",
            options: [{ value: "unassigned", label: "Unassigned" }, ...profiles.map((p) => ({ value: p.id, label: p.full_name }))],
          },
          { name: "demo", label: "Data type", allLabel: "Real + demo", options: [{ value: "real", label: "Real only" }, { value: "demo", label: "Demo only" }] },
        ]}
      />

      {result.total === 0 ? (
        hasActiveAuditFilters(filters) ? (
          <EmptyState
            icon={<ClipboardCheck className="size-5" strokeWidth={1.75} />}
            title="No audits match these filters"
            description="Try another status or clear the filters."
            action={
              <ButtonLink href="/admin/audits" variant="outline" size="sm">
                Clear filters
              </ButtonLink>
            }
          />
        ) : (
          <EmptyState
            icon={<ClipboardCheck className="size-5" strokeWidth={1.75} />}
            title="No audit requests yet."
            description="When someone submits the Free Growth Audit form, it lands here ready for review."
            action={
              <ButtonLink href="/free-growth-audit" variant="outline" size="sm" target="_blank">
                View the audit form
              </ButtonLink>
            }
          />
        )
      ) : (
        <>
          <ResponsiveTable
            table={
              <Table className="text-[13px]">
                <THead>
                  <tr>
                    <TH>Lead</TH>
                    <SortableTH label="Company" column="company" currentSort={filters.sort} currentDir={filters.dir} href={sortHref} />
                    <TH>Website</TH>
                    <TH>Audit Type</TH>
                    <SortableTH label="Priority" column="priority" currentSort={filters.sort} currentDir={filters.dir} href={sortHref} />
                    <SortableTH label="Status" column="status" currentSort={filters.sort} currentDir={filters.dir} href={sortHref} />
                    <TH>Assigned To</TH>
                    <SortableTH label="Created" column="created_at" currentSort={filters.sort} currentDir={filters.dir} href={sortHref} />
                    <TH>
                      <span className="sr-only">Actions</span>
                    </TH>
                  </tr>
                </THead>
                <tbody>
                  {result.rows.map((a) => (
                    <ClickableRow key={a.id} href={`/admin/audits/${a.id}`}>
                      <TD className="font-medium text-fg">
                        <span className="flex items-center gap-2">
                          <Link href={`/admin/audits/${a.id}`} className="underline decoration-transparent decoration-2 underline-offset-4 hover:decoration-[#0a6cff]">
                            {a.full_name}
                          </Link>
                          <DemoMark show={a.is_demo} />
                        </span>
                        <span className="block max-w-52 truncate text-[11.5px] font-normal text-fg-3">{a.email}</span>
                      </TD>
                      <TD>{a.company ?? <span className="text-fg-3">—</span>}</TD>
                      <TD>
                        <WebsiteLink url={a.website} />
                      </TD>
                      <TD className="whitespace-nowrap">{auditTypeLabels[a.audit_type]}</TD>
                      <TD>
                        <StatusBadge kind="priority" value={a.priority} />
                      </TD>
                      <TD>
                        <StatusBadge kind="audit" value={a.status} />
                      </TD>
                      <TD className="whitespace-nowrap">{assignee(a.assigned_to) ?? <span className="text-fg-3">Unassigned</span>}</TD>
                      <TD>
                        <DateCell iso={a.created_at} />
                      </TD>
                      <TD className="text-right">
                        <AuditRowActions id={a.id} name={a.company || a.full_name} status={a.status} leadId={a.lead_id} />
                      </TD>
                    </ClickableRow>
                  ))}
                </tbody>
              </Table>
            }
            cards={result.rows.map((a) => (
              <li key={a.id} className="rounded-[16px] border border-hair bg-white">
                <div className="flex items-start justify-between gap-3 p-4">
                  <Link href={`/admin/audits/${a.id}`} className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-sm font-semibold text-fg">
                      {a.company || a.full_name} <DemoMark show={a.is_demo} />
                    </span>
                    <span className="mt-0.5 block truncate text-[13px] text-fg-2">
                      {a.full_name} · {auditTypeLabels[a.audit_type]}
                    </span>
                    <span className="mt-2 flex flex-wrap items-center gap-2 text-[12.5px] text-fg-2">
                      <StatusBadge kind="audit" value={a.status} />
                      <StatusBadge kind="priority" value={a.priority} />
                      <span>{assignee(a.assigned_to) ?? "Unassigned"}</span>
                      <span>{formatRelative(a.created_at)}</span>
                    </span>
                  </Link>
                  <AuditRowActions id={a.id} name={a.company || a.full_name} status={a.status} leadId={a.lead_id} />
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
