import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";

import { ActivityTimeline } from "@/components/admin/activity-timeline";
import { Avatar, DateCell, WebsiteLink } from "@/components/admin/cells";
import { DetailList, SectionLabel } from "@/components/admin/detail-list";
import { LeadDangerZone, LeadStatusControl, OwnerSelect, TagsEditor } from "@/components/admin/leads/lead-controls";
import { LeadNoteForm } from "@/components/admin/leads/note-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { DemoBadge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { can, requireUser } from "@/lib/auth/session";
import {
  adSpendLabels,
  auditTypeLabels,
  leadFormLabels,
  leadSourceLabels,
  meetingTypeLabels,
  platformLabels,
  serviceLabels,
} from "@/lib/data/labels";
import type { TouchPoint } from "@/lib/data/types";
import { getLeadDetail, listProfiles } from "@/lib/services/admin/leads";
import { isUuid } from "@/lib/services/admin/query";
import { formatDateTime, formatRelative, truncate } from "@/lib/utils/format";

export async function generateMetadata(props: PageProps<"/admin/leads/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const detail = isUuid(id) ? await getLeadDetail(id).catch(() => null) : null;
  return { title: detail ? detail.lead.full_name : "Lead" };
}

function TouchSummary({ touch }: { touch: TouchPoint | null }) {
  if (!touch) return <span className="text-fg-3">Not captured</span>;
  const parts = [touch.source && `${touch.source}${touch.medium ? ` / ${touch.medium}` : ""}`, touch.campaign, touch.landing_page].filter(Boolean);
  return (
    <span>
      {parts.length ? parts.join(" · ") : "Direct / unknown"}
      <span className="block text-[12px] text-fg-2">{formatDateTime(touch.at)}</span>
    </span>
  );
}

export default async function LeadDetailPage(props: PageProps<"/admin/leads/[id]">) {
  const user = await requireUser();
  const { id } = await props.params;
  if (!isUuid(id)) notFound();
  const [detail, profiles] = await Promise.all([getLeadDetail(id), listProfiles()]);
  if (!detail) notFound();
  const { lead, notes, activities, audits, bookings, messages, owner } = detail;
  const a = lead.attribution;

  return (
    <div>
      <Link href="/admin/leads" className="mb-3 inline-flex items-center gap-1.5 text-[13px] text-fg-2 transition-colors hover:text-fg">
        <ArrowLeft className="size-3.5" aria-hidden="true" /> Leads
      </Link>
      <header className="rounded-[16px] border border-hair bg-white mb-6 flex flex-wrap items-start justify-between gap-4 px-5 py-5 sm:px-6">
        <div className="flex min-w-0 items-start gap-4">
          <Avatar name={lead.full_name} size="lg" ring className="hidden sm:flex" />
          <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[22px] leading-tight font-semibold tracking-[-0.03em] text-fg sm:text-[26px]">{lead.full_name}</h1>
            <StatusBadge kind="lead" value={lead.status} />
            {lead.is_demo && <DemoBadge />}
          </div>
          <p className="mt-1 text-[14px] text-fg-2">
            {[lead.company, lead.industry, lead.country].filter(Boolean).join(" · ") || "No company details"} · via {leadFormLabels[lead.form].toLowerCase()} ·{" "}
            {formatRelative(lead.created_at)}
          </p>
          </div>
        </div>
        <a href={`mailto:${lead.email}`} className={buttonClasses("outline", "sm")}>
          <Mail className="size-3.5" aria-hidden="true" /> Email {lead.full_name.split(" ")[0]}
        </a>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-4">
          <Card>
            <CardHeader title="Contact & company" />
            <CardBody>
              <DetailList
                items={[
                  { label: "Name", value: lead.full_name },
                  { label: "Email", value: <a href={`mailto:${lead.email}`} className="font-medium text-brand underline-offset-4 hover:underline">{lead.email}</a> },
                  { label: "Company", value: lead.company },
                  { label: "Website", value: <WebsiteLink url={lead.website} /> },
                  { label: "Industry", value: lead.industry },
                  { label: "Business type", value: lead.business_type },
                  { label: "Country", value: lead.country },
                  { label: "Came in via", value: leadFormLabels[lead.form] },
                ]}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Request" />
            <CardBody className="space-y-5">
              <DetailList
                items={[
                  {
                    label: "Requested services",
                    wide: true,
                    value: lead.services.length ? (
                      <ul className="mt-1 flex flex-wrap gap-1.5">
                        {lead.services.map((s) => (
                          <li key={s} className="rounded-full bg-[#f1f2f4] px-2.5 py-0.5 text-[12.5px] text-fg-2">
                            {serviceLabels[s]}
                          </li>
                        ))}
                      </ul>
                    ) : null,
                  },
                  { label: "Monthly ad spend", value: lead.monthly_ad_spend ? adSpendLabels[lead.monthly_ad_spend] : null },
                  { label: "Primary platform", value: lead.primary_platform ? platformLabels[lead.primary_platform] : null },
                ]}
              />
              <div>
                <SectionLabel>Challenge</SectionLabel>
                {lead.challenge ? <p className="text-[14px] leading-relaxed whitespace-pre-line text-fg-2">{lead.challenge}</p> : <p className="text-[13px] text-fg-3">Not provided</p>}
              </div>
              {lead.message && (
                <div>
                  <SectionLabel>Message</SectionLabel>
                  <p className="text-[14px] leading-relaxed whitespace-pre-line text-fg-2">{lead.message}</p>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Source & attribution" description="What we know about how they found us. First touch vs last touch shows the full path." />
            <CardBody className="space-y-5">
              <DetailList
                items={[
                  { label: "Source", value: leadSourceLabels[lead.source] },
                  { label: "Referrer", value: a?.referrer },
                  { label: "UTM source", value: a?.utm_source },
                  { label: "UTM medium", value: a?.utm_medium },
                  { label: "UTM campaign", value: a?.utm_campaign },
                  { label: "UTM term", value: a?.utm_term },
                  { label: "UTM content", value: a?.utm_content },
                  { label: "Landing page", value: a?.landing_page },
                  { label: "First visit", value: a?.first_visit ? formatDateTime(a.first_visit) : null },
                  { label: "Last visit", value: a?.last_visit ? formatDateTime(a.last_visit) : null },
                  { label: "Device", value: a?.device ? a.device[0].toUpperCase() + a.device.slice(1) : null },
                  { label: "Country", value: a?.country },
                ]}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[10px] border border-hair bg-soft p-3 text-[13px]">
                  <p className="mb-1 text-[12.5px] text-fg-3">First touch</p>
                  <TouchSummary touch={a?.first_touch ?? null} />
                </div>
                <div className="rounded-[10px] border border-hair bg-soft p-3 text-[13px]">
                  <p className="mb-1 text-[12.5px] text-fg-3">Last touch</p>
                  <TouchSummary touch={a?.last_touch ?? null} />
                </div>
              </div>
              {!a && <p className="text-[13px] text-fg-2">No attribution was captured for this lead (added manually, or the visitor declined tracking).</p>}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Notes" description={`${notes.length} note${notes.length === 1 ? "" : "s"}`} />
            <CardBody className="space-y-5">
              <LeadNoteForm leadId={lead.id} />
              {notes.length === 0 ? (
                <p className="text-[13px] text-fg-2">No notes yet. Add the first one after your call.</p>
              ) : (
                <ul className="space-y-3">
                  {notes.map((n) => (
                    <li key={n.id} className="rounded-[12px] border border-hair bg-[#fafaf9] px-4 py-3">
                      <p className="text-[13.5px] leading-relaxed whitespace-pre-line text-fg">{n.body}</p>
                      <p className="mt-1 text-[12px] text-fg-2">
                        {n.author_name} · <time dateTime={n.created_at} title={formatDateTime(n.created_at)}>{formatRelative(n.created_at)}</time>
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Activity" />
            <CardBody>
              <ActivityTimeline activities={activities} />
            </CardBody>
          </Card>
        </div>

        <aside className="min-w-0 space-y-4" aria-label="Lead actions and history">
          <Card>
            <CardHeader title="Pipeline" />
            <CardBody className="space-y-4">
              <LeadStatusControl leadId={lead.id} status={lead.status} />
              <OwnerSelect leadId={lead.id} ownerId={lead.owner_id} profiles={profiles.map((p) => ({ id: p.id, name: p.full_name }))} />
              <TagsEditor leadId={lead.id} tags={lead.tags} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Record" />
            <CardBody>
              <DetailList
                className="sm:grid-cols-1"
                items={[
                  { label: "Created", value: formatDateTime(lead.created_at) },
                  { label: "Last updated", value: formatDateTime(lead.updated_at) },
                  { label: "Last activity", value: formatRelative(lead.last_activity_at) },
                  { label: "Owner", value: owner?.full_name ?? "Unassigned" },
                ]}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Audit history" />
            {audits.length === 0 ? (
              <CardBody>
                <p className="text-[13px] text-fg-2">No audit requests from this lead.</p>
              </CardBody>
            ) : (
              <ul className="divide-y divide-hair">
                {audits.map((au) => (
                  <li key={au.id}>
                    <Link href={`/admin/audits/${au.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-[#fafaf9]">
                      <span className="min-w-0">
                        <span className="block text-[13.5px] font-medium text-fg">{auditTypeLabels[au.audit_type]} audit</span>
                        <span className="block text-[12px] text-fg-2">
                          <DateCell iso={au.created_at} />
                        </span>
                      </span>
                      <StatusBadge kind="audit" value={au.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader title="Booking history" />
            {bookings.length === 0 ? (
              <CardBody>
                <p className="text-[13px] text-fg-2">No calls booked yet.</p>
              </CardBody>
            ) : (
              <ul className="divide-y divide-hair">
                {bookings.map((b) => (
                  <li key={b.id}>
                    <Link href={`/admin/bookings?highlight=${b.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-[#fafaf9]">
                      <span className="min-w-0">
                        <span className="block text-[13.5px] font-medium text-fg">{meetingTypeLabels[b.meeting_type]}</span>
                        <span className="block text-[12px] text-fg-2">{b.meeting_at ? formatDateTime(b.meeting_at) : "Time not set"}</span>
                      </span>
                      <StatusBadge kind="booking" value={b.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader title="Messages" />
            {messages.length === 0 ? (
              <CardBody>
                <p className="text-[13px] text-fg-2">No contact messages linked.</p>
              </CardBody>
            ) : (
              <ul className="divide-y divide-hair">
                {messages.map((m) => (
                  <li key={m.id}>
                    <Link href={`/admin/messages/${m.id}`} className="block px-5 py-3 hover:bg-[#fafaf9]">
                      <span className="block text-[13px] text-fg">{truncate(m.message, 110)}</span>
                      <span className="mt-0.5 block text-[12px] text-fg-2">{formatRelative(m.created_at)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader title="Manage" />
            <CardBody>
              <LeadDangerZone leadId={lead.id} name={lead.full_name} archived={lead.status === "archived"} canDelete={can(user, "leads:delete")} />
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}
