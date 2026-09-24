import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, ClipboardCheck, FilePlus2, Newspaper, Users } from "lucide-react";

import { Avatar, DateCell, DemoMark, PersonCell, ServiceSummary, WebsiteLink } from "@/components/admin/cells";
import { ClickableRow } from "@/components/admin/clickable-row";
import { DateRangePicker } from "@/components/admin/date-range-picker";
import { KpiCard, KpiGrid } from "@/components/admin/kpi-card";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { BarList } from "@/components/charts/bar-list";
import { ChartCard } from "@/components/charts/chart-card";
import { ColumnChart } from "@/components/charts/column-chart";
import { TrendChart } from "@/components/charts/trend-chart";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { TD, TH, THead, Table } from "@/components/ui/table";
import { requireUser } from "@/lib/auth/session";
import { publicEnv } from "@/lib/config/env";
import { auditTypeLabels, leadSourceLabels, meetingTypeLabels } from "@/lib/data/labels";
import { getOverview } from "@/lib/services/admin/dashboard";
import { parseDateRange } from "@/lib/services/admin/date-range";
import { param } from "@/lib/services/admin/query";
import { formatDateTime, formatRelative } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Overview" };

export default async function AdminOverviewPage(props: PageProps<"/admin">) {
  await requireUser();
  const sp = await props.searchParams;
  const range = parseDateRange(sp);
  const data = await getOverview(range);
  const demo = publicEnv.demoMode;
  const forbidden = param(sp, "error") === "forbidden";

  const periodNote = range.bucket === "day" ? "per day" : range.bucket === "week" ? "per week" : "per month";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description={`${range.label} · compared with the previous ${range.key === "custom" ? "period of the same length" : range.label.replace("Last ", "")}`}
        demo={demo}
        actions={<DateRangePicker basePath="/admin" range={range} />}
      />

      {forbidden && (
        <Alert tone="warning" title="You don't have permission for that">
          Ask an admin if you need access to that action.
        </Alert>
      )}

      <section aria-labelledby="kpi-heading" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="kpi-heading" className="text-[13px] font-medium text-fg-2">
            Key numbers · {range.label}
          </h2>
        </div>
        <KpiGrid className="grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {data.kpis.map((k) => (
            <KpiCard
              key={k.key}
              kpi={k}
              trend={k.key === "leads" ? data.leadsOverTime.map((p) => p.value) : k.key === "audits" ? data.auditsOverTime.map((p) => p.value) : undefined}
            />
          ))}
        </KpiGrid>
        <p className="flex flex-wrap items-center gap-x-1 px-0.5 text-[12.5px] text-fg-3">
          <span className="font-medium text-fg-2">This month ({data.thisMonth.monthLabel}):</span>{" "}
          <span className="tabular">{data.thisMonth.leads}</span> leads · <span className="tabular">{data.thisMonth.audits}</span> audit requests ·{" "}
          <span className="tabular">{data.thisMonth.bookings}</span> bookings
        </p>
      </section>

      <ChartCard title="Leads over time" description={`New leads and audit requests ${periodNote}, ${range.label.toLowerCase()}`}>
        <TrendChart
          title="Leads and audit requests over time"
          labels={data.leadsOverTime.map((p) => p.label)}
          series={[
            { name: "Leads", values: data.leadsOverTime.map((p) => p.value) },
            { name: "Audit requests", values: data.auditsOverTime.map((p) => p.value) },
          ]}
          height={240}
          emptyMessage="No leads in this period yet. Try a longer date range."
        />
      </ChartCard>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Lead sources" description="Where leads created in this period came from">
          <BarList title="Lead sources" items={data.leadSources} showShare valueLabel="Leads" emptyMessage="No leads in this period yet." />
        </ChartCard>
        <ChartCard title="Service interest" description="Services requested (a lead can pick several)">
          <BarList title="Service interest" items={data.serviceInterest} valueLabel="Leads interested" emptyMessage="No service requests in this period yet." />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ChartCard title="Lead status" description="Leads created in period, by current status">
          <BarList title="Lead status distribution" items={data.leadStatus} dense showShare valueLabel="Leads" emptyMessage="No leads in this period." />
        </ChartCard>
        <ChartCard title="Audit status" description="Audit requests in period, by status">
          <BarList title="Audit status distribution" items={data.auditStatus} dense showShare valueLabel="Audits" emptyMessage="No audit requests in this period." />
        </ChartCard>
        <ChartCard title="Monthly conversion" description="Won ÷ leads created, per month">
          <ColumnChart
            title="Monthly lead-to-won conversion rate"
            format="percent"
            data={data.monthlyConversion.map((m) => ({ key: m.key, label: m.label, value: m.rate, detail: `${m.won} won of ${m.leads} leads` }))}
            emptyMessage="No leads in these months yet."
          />
        </ChartCard>
        <ChartCard title="Traffic sources" description="Page views by source in period">
          <BarList title="Traffic sources" items={data.trafficSources} dense showShare limit={6} valueLabel="Page views" emptyMessage="No page views recorded yet. Tracking fills this once visitors consent." />
        </ChartCard>
      </div>

      <Card>
        <CardHeader
          title="Recent leads"
          description="Newest first, across all dates"
          action={
            <Link href="/admin/leads" className="font-medium text-brand underline-offset-4 hover:underline inline-flex items-center gap-1 text-[13px]">
              All leads <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          }
        />
        {data.recentLeads.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No leads yet." description="Leads appear here as soon as someone submits the growth audit or contact form." />
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <Table className="text-[13px]">
                <THead>
                  <tr>
                    <TH>Name</TH>
                    <TH>Company</TH>
                    <TH>Service</TH>
                    <TH>Source</TH>
                    <TH>Status</TH>
                    <TH>Date</TH>
                    <TH className="text-right">Action</TH>
                  </tr>
                </THead>
                <tbody>
                  {data.recentLeads.map((l) => (
                    <ClickableRow key={l.id} href={`/admin/leads/${l.id}`}>
                      <TD>
                        <PersonCell name={l.full_name}>
                          <DemoMark show={l.is_demo} />
                        </PersonCell>
                      </TD>
                      <TD>{l.company ?? "—"}</TD>
                      <TD>
                        <ServiceSummary services={l.services} />
                      </TD>
                      <TD>{leadSourceLabels[l.source]}</TD>
                      <TD>
                        <StatusBadge kind="lead" value={l.status} />
                      </TD>
                      <TD>
                        <DateCell iso={l.created_at} />
                      </TD>
                      <TD className="text-right">
                        <Link href={`/admin/leads/${l.id}`} className="font-medium text-brand underline-offset-4 hover:underline whitespace-nowrap">
                          Review Lead<span className="sr-only">: {l.full_name}</span>
                        </Link>
                      </TD>
                    </ClickableRow>
                  ))}
                </tbody>
              </Table>
            </div>
            <ul className="divide-y divide-hair md:hidden">
              {data.recentLeads.map((l) => (
                <li key={l.id}>
                  <Link href={`/admin/leads/${l.id}`} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-[#fafaf9]">
                    <Avatar name={l.full_name} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-sm font-medium text-fg">
                        {l.full_name} <DemoMark show={l.is_demo} />
                      </span>
                      <span className="block truncate text-[12.5px] text-fg-2">
                        {[l.company, leadSourceLabels[l.source], formatRelative(l.created_at)].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                    <StatusBadge kind="lead" value={l.status} />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <Card>
        <CardHeader
          title="Recent audit requests"
          action={
            <Link href="/admin/audits" className="font-medium text-brand underline-offset-4 hover:underline inline-flex items-center gap-1 text-[13px]">
              All audits <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          }
        />
        {data.recentAudits.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No audit requests yet." description="Requests from the Free Growth Audit form land here." />
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <Table className="text-[13px]">
                <THead>
                  <tr>
                    <TH>Company</TH>
                    <TH>Website</TH>
                    <TH>Audit Type</TH>
                    <TH>Priority</TH>
                    <TH>Status</TH>
                    <TH>Assigned</TH>
                    <TH>Date</TH>
                    <TH className="text-right">Action</TH>
                  </tr>
                </THead>
                <tbody>
                  {data.recentAudits.map((a) => (
                    <ClickableRow key={a.id} href={`/admin/audits/${a.id}`}>
                      <TD className="whitespace-nowrap">
                        <PersonCell name={a.company || a.full_name}>
                          <DemoMark show={a.is_demo} />
                        </PersonCell>
                      </TD>
                      <TD>
                        <WebsiteLink url={a.website} />
                      </TD>
                      <TD>{auditTypeLabels[a.audit_type]}</TD>
                      <TD>
                        <StatusBadge kind="priority" value={a.priority} />
                      </TD>
                      <TD>
                        <StatusBadge kind="audit" value={a.status} />
                      </TD>
                      <TD>
                        {a.assigned_to ? (
                          <span className="flex items-center gap-2 whitespace-nowrap">
                            <Avatar name={data.profiles[a.assigned_to]?.full_name ?? "Team member"} size="xs" />
                            {data.profiles[a.assigned_to]?.full_name ?? "Team member"}
                          </span>
                        ) : (
                          <span className="inline-flex h-[22px] items-center rounded-full bg-[#f1f2f4] px-2 text-[12px] font-medium text-fg-3">Unassigned</span>
                        )}
                      </TD>
                      <TD>
                        <DateCell iso={a.created_at} />
                      </TD>
                      <TD className="text-right">
                        <Link href={`/admin/audits/${a.id}`} className="font-medium text-brand underline-offset-4 hover:underline whitespace-nowrap">
                          View Audit<span className="sr-only">: {a.company || a.full_name}</span>
                        </Link>
                      </TD>
                    </ClickableRow>
                  ))}
                </tbody>
              </Table>
            </div>
            <ul className="divide-y divide-hair md:hidden">
              {data.recentAudits.map((a) => (
                <li key={a.id}>
                  <Link href={`/admin/audits/${a.id}`} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-[#fafaf9]">
                    <Avatar name={a.company || a.full_name} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-sm font-medium text-fg">
                        {a.company || a.full_name} <DemoMark show={a.is_demo} />
                      </span>
                      <span className="block truncate text-[12.5px] text-fg-2">
                        {auditTypeLabels[a.audit_type]} · {formatRelative(a.created_at)}
                      </span>
                    </span>
                    <StatusBadge kind="audit" value={a.status} />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <Card>
          <CardHeader
            title="Upcoming bookings"
            action={
              <Link href="/admin/bookings?when=upcoming" className="font-medium text-brand underline-offset-4 hover:underline inline-flex items-center gap-1 text-[13px]">
                All bookings <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            }
          />
          {data.upcomingBookings.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-fg-2">No calls scheduled. New bookings show up here.</p>
          ) : (
            <ul className="divide-y divide-hair">
              {data.upcomingBookings.map((b) => (
                <li key={b.id}>
                  <Link href={`/admin/bookings?highlight=${b.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#fafaf9]">
                    <span className="flex w-12 shrink-0 flex-col items-center overflow-hidden rounded-[10px] border border-hair bg-white text-center">
                      <span className="block w-full bg-brand-soft py-0.5 text-[10.5px] font-medium text-brand">
                        {b.meeting_at ? new Date(b.meeting_at).toLocaleString("en-US", { month: "short" }) : "—"}
                      </span>
                      <span className="tabular py-1 text-[17px] leading-tight font-semibold text-fg">{b.meeting_at ? new Date(b.meeting_at).getDate() : "—"}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-sm font-medium text-fg">
                        {b.name} <DemoMark show={b.is_demo} />
                      </span>
                      <span className="block truncate text-[12.5px] text-fg-2">
                        {[b.company, meetingTypeLabels[b.meeting_type], formatDateTime(b.meeting_at)].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                    <StatusBadge kind="booking" value={b.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Quick actions" />
          <div className="grid gap-3 p-4 sm:p-5">
            <ButtonLink href="/admin/leads?status=new" variant="primary" size="sm" className="justify-start" icon={<Users className="size-4" aria-hidden="true" />}>
              Review Leads
            </ButtonLink>
            <ButtonLink href="/admin/audits?status=new" variant="outline" size="sm" className="justify-start" icon={<ClipboardCheck className="size-4" aria-hidden="true" />}>
              Review Audits
            </ButtonLink>
            <ButtonLink href="/admin/case-studies/new" variant="outline" size="sm" className="justify-start" icon={<FilePlus2 className="size-4" aria-hidden="true" />}>
              Add Case Study
            </ButtonLink>
            <ButtonLink href="/admin/blog/new" variant="outline" size="sm" className="justify-start" icon={<Newspaper className="size-4" aria-hidden="true" />}>
              Create Blog Post
            </ButtonLink>
            <ButtonLink href="/admin/bookings" variant="ghost" size="sm" className="justify-start" icon={<CalendarDays className="size-4" aria-hidden="true" />}>
              Manage bookings
            </ButtonLink>
          </div>
        </Card>
      </div>
    </div>
  );
}
