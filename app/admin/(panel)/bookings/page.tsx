import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, PlugZap } from "lucide-react";

import { AddBookingButton, BookingRowActions } from "@/components/admin/bookings/booking-controls";
import { DemoMark } from "@/components/admin/cells";
import { ListToolbar } from "@/components/admin/list-toolbar";
import { PageHeader } from "@/components/admin/page-header";
import { ScrollTo } from "@/components/admin/scroll-to";
import { StatusBadge } from "@/components/admin/status-badge";
import { ButtonLink } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/states";
import { ResponsiveTable, TD, TH, THead, Table } from "@/components/ui/table";
import { can, requireUser } from "@/lib/auth/session";
import { publicEnv } from "@/lib/config/env";
import { bookingProviderLabels, bookingStatusLabels, leadSourceLabels, meetingTypeLabels, toOptions } from "@/lib/data/labels";
import { hasActiveBookingFilters, listBookings, parseBookingFilters } from "@/lib/services/admin/bookings";
import { buildHref, flatParams } from "@/lib/services/admin/query";
import { getSiteSettings } from "@/lib/services/settings";
import { cn } from "@/lib/utils/cn";
import { formatDateTime, formatRelative } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Bookings" };

function IntegrationNotice({ bookingUrl, provider }: { bookingUrl: string; provider: string }) {
  return (
    <div className="mb-5 flex gap-3 rounded-[16px] border border-hair bg-white px-4 py-3.5 text-[13px]">
      <PlugZap className="mt-0.5 size-4 shrink-0 text-fg-2" strokeWidth={1.75} aria-hidden="true" />
      <div className="min-w-0 text-fg-2">
        {bookingUrl ? (
          <>
            <p className="font-semibold text-fg">Booking link set ({provider})</p>
            <p className="mt-0.5">
              Visitors book through <span className="font-medium break-all text-fg">{bookingUrl}</span>. Those calls appear here only once the provider&apos;s webhook is
              connected to <code className="rounded-[5px] bg-[#f1f2f4] px-1 font-mono text-[12px]">/api/bookings/webhook</code>. Until then, add them manually.
            </p>
          </>
        ) : (
          <>
            <p className="font-semibold text-fg">No calendar connected</p>
            <p className="mt-0.5">
              Bookings come from &ldquo;Request a call&rdquo; submissions and manual entry. To sync Calendly or Cal.com automatically, add the booking URL in{" "}
              <Link href="/admin/settings" className="font-medium text-brand underline-offset-4 hover:underline">
                Settings
              </Link>{" "}
              and point the provider&apos;s webhook at <code className="rounded-[5px] bg-[#f1f2f4] px-1 font-mono text-[12px]">/api/bookings/webhook</code>.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default async function BookingsPage(props: PageProps<"/admin/bookings">) {
  const user = await requireUser();
  const sp = await props.searchParams;
  const filters = parseBookingFilters(sp);
  const values = flatParams(sp);
  const [result, settings] = await Promise.all([listBookings(filters), getSiteSettings()]);
  const canDelete = can(user, "leads:delete");
  const pageHref = (page: number) => buildHref("/admin/bookings", { ...values, page, highlight: undefined });
  const now = new Date(result.now).getTime();

  return (
    <div>
      <PageHeader title="Bookings" description="Strategy calls and audit reviews. Upcoming calls first." demo={publicEnv.demoMode} actions={<AddBookingButton />} />

      {filters.highlight && result.rows.some((b) => b.id === filters.highlight) && <ScrollTo id={`booking-${filters.highlight}`} />}
      <IntegrationNotice bookingUrl={settings.booking_url} provider={bookingProviderLabels[settings.booking_provider]} />

      <ListToolbar
        values={values}
        searchLabel="Search bookings"
        searchPlaceholder="Search name, email, company…"
        filters={[
          { name: "when", label: "When", allLabel: "Upcoming + past", options: [{ value: "upcoming", label: "Upcoming" }, { value: "past", label: "Past" }] },
          { name: "status", label: "Status", allLabel: "All statuses", options: toOptions(bookingStatusLabels) },
          { name: "type", label: "Meeting type", allLabel: "All meeting types", options: toOptions(meetingTypeLabels) },
          { name: "demo", label: "Data type", allLabel: "Real + demo", options: [{ value: "real", label: "Real only" }, { value: "demo", label: "Demo only" }] },
        ]}
        dateFilters={{ fromLabel: "Meeting from", toLabel: "to" }}
      />

      {result.total === 0 ? (
        hasActiveBookingFilters(filters) ? (
          <EmptyState
            icon={<CalendarDays className="size-5" strokeWidth={1.75} />}
            title="No bookings match these filters"
            description="Try a different date range or status."
            action={
              <ButtonLink href="/admin/bookings" variant="outline" size="sm">
                Clear filters
              </ButtonLink>
            }
          />
        ) : (
          <EmptyState icon={<CalendarDays className="size-5" strokeWidth={1.75} />} title="No bookings yet." description="Add a call by hand, or connect a booking provider." action={<AddBookingButton />} />
        )
      ) : (
        <>
          <ResponsiveTable
            table={
              <Table className="text-[13px]">
                <THead>
                  <tr>
                    <TH>Name</TH>
                    <TH>Company</TH>
                    <TH>Email</TH>
                    <TH>Meeting Date</TH>
                    <TH>Meeting Type</TH>
                    <TH>Status</TH>
                    <TH>Source</TH>
                    <TH>
                      <span className="sr-only">Actions</span>
                    </TH>
                  </tr>
                </THead>
                <tbody>
                  {result.rows.map((b) => {
                    const highlighted = filters.highlight === b.id;
                    const past = b.meeting_at ? new Date(b.meeting_at).getTime() < now : false;
                    return (
                      <tr
                        key={b.id}
                        id={`booking-${b.id}`}
                        aria-current={highlighted ? "true" : undefined}
                        className={cn("transition-colors hover:bg-[#fafaf9] [&:not(:last-child)>td]:border-b [&>td]:border-hair", highlighted && "bg-brand-soft/60 outline-2 -outline-offset-2 outline-brand")}
                      >
                        <TD className="font-medium text-fg">
                          <span className="flex items-center gap-2">
                            {b.lead_id ? (
                              <Link href={`/admin/leads/${b.lead_id}`} className="underline decoration-transparent decoration-2 underline-offset-4 hover:decoration-[#0a6cff]">
                                {b.name}
                              </Link>
                            ) : (
                              b.name
                            )}
                            <DemoMark show={b.is_demo} />
                          </span>
                        </TD>
                        <TD>{b.company ?? <span className="text-fg-3">—</span>}</TD>
                        <TD className="max-w-48 truncate" title={b.email}>
                          {b.email}
                        </TD>
                        <TD className="whitespace-nowrap">
                          <span className={cn("tabular", past ? "text-fg-2" : "text-fg")}>{b.meeting_at ? formatDateTime(b.meeting_at) : "Not set"}</span>
                          {b.meeting_at && <span className="block text-[11.5px] text-fg-3">{formatRelative(b.meeting_at)}</span>}
                        </TD>
                        <TD className="whitespace-nowrap">{meetingTypeLabels[b.meeting_type]}</TD>
                        <TD>
                          <StatusBadge kind="booking" value={b.status} />
                        </TD>
                        <TD>
                          {leadSourceLabels[b.source]}
                          <span className="block text-[11.5px] text-fg-3">{bookingProviderLabels[b.provider]}</span>
                        </TD>
                        <TD className="text-right">
                          <BookingRowActions booking={b} canDelete={canDelete} />
                        </TD>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            }
            cards={result.rows.map((b) => (
              <li key={b.id} className={cn("rounded-lg border bg-white", filters.highlight === b.id ? "border-accent" : "border-hair")}>
                <div className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-sm font-semibold text-fg">
                      {b.name} <DemoMark show={b.is_demo} />
                    </p>
                    <p className="mt-0.5 truncate text-[13px] text-fg-2">{[b.company, meetingTypeLabels[b.meeting_type]].filter(Boolean).join(" · ")}</p>
                    <p className="mt-2 flex flex-wrap items-center gap-2 text-[12.5px] text-fg-2">
                      <StatusBadge kind="booking" value={b.status} />
                      <span className="tabular">{b.meeting_at ? formatDateTime(b.meeting_at) : "Time not set"}</span>
                    </p>
                  </div>
                  <BookingRowActions booking={b} canDelete={canDelete} />
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
