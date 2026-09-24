import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Avatar, WebsiteLink } from "@/components/admin/cells";
import { DetailList } from "@/components/admin/detail-list";
import { MarkReadOnView, MessageActions, MessageNoteForm } from "@/components/admin/messages/message-actions";
import { StatusBadge } from "@/components/admin/status-badge";
import { DemoBadge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { can, requireUser } from "@/lib/auth/session";
import { adSpendLabels, serviceLabels } from "@/lib/data/labels";
import { getMessage } from "@/lib/services/admin/messages";
import { isUuid } from "@/lib/services/admin/query";
import { formatDateTime, formatRelative } from "@/lib/utils/format";

export async function generateMetadata(props: PageProps<"/admin/messages/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const detail = isUuid(id) ? await getMessage(id).catch(() => null) : null;
  return { title: detail ? `Message · ${detail.message.name}` : "Message" };
}

export default async function MessageDetailPage(props: PageProps<"/admin/messages/[id]">) {
  const user = await requireUser();
  const { id } = await props.params;
  if (!isUuid(id)) notFound();
  const detail = await getMessage(id);
  if (!detail) notFound();
  const { message: m, lead } = detail;
  const a = m.attribution;

  return (
    <div>
      <MarkReadOnView id={m.id} unread={m.status === "unread"} />
      <Link href="/admin/messages" className="mb-3 inline-flex items-center gap-1.5 text-[13px] text-fg-2 transition-colors hover:text-fg">
        <ArrowLeft className="size-3.5" aria-hidden="true" /> Contact Messages
      </Link>
      <header className="rounded-[16px] border border-hair bg-white mb-6 flex flex-wrap items-start justify-between gap-4 px-5 py-5 sm:px-6">
        <div className="flex min-w-0 items-start gap-4">
          <Avatar name={m.name} size="lg" ring className="hidden sm:flex" />
          <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[22px] leading-tight font-semibold tracking-[-0.03em] text-fg sm:text-[26px]">{m.name}</h1>
            <StatusBadge kind="message" value={m.status} />
            {m.is_demo && <DemoBadge />}
          </div>
          <p className="mt-1 text-[14px] text-fg-2">
            {[m.company, m.email].filter(Boolean).join(" · ")} · received {formatRelative(m.created_at)}
          </p>
          </div>
        </div>
        <MessageActions id={m.id} status={m.status} leadId={lead?.id ?? null} canDelete={can(user, "leads:delete")} />
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="min-w-0 space-y-4">
          <Card>
            <CardHeader title="Message" description={formatDateTime(m.created_at)} />
            <CardBody>
              <p className="max-w-[70ch] border-l-2 border-brand pl-4 text-[15px] leading-relaxed whitespace-pre-line text-fg">{m.message}</p>
              {m.services.length > 0 && (
                <div className="mt-5">
                  <p className="mb-1.5 text-[12.5px] text-fg-3">Interested in</p>
                  <ul className="flex flex-wrap gap-1.5">
                    {m.services.map((s) => (
                      <li key={s} className="rounded-full bg-[#f1f2f4] px-2.5 py-0.5 text-[12.5px] text-fg-2">
                        {serviceLabels[s]}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Attribution" />
            <CardBody>
              {a ? (
                <DetailList
                  items={[
                    { label: "UTM source", value: a.utm_source },
                    { label: "UTM medium", value: a.utm_medium },
                    { label: "UTM campaign", value: a.utm_campaign },
                    { label: "Referrer", value: a.referrer },
                    { label: "Landing page", value: a.landing_page },
                    { label: "Device", value: a.device },
                    { label: "First visit", value: a.first_visit ? formatDateTime(a.first_visit) : null },
                    { label: "Last visit", value: a.last_visit ? formatDateTime(a.last_visit) : null },
                  ]}
                />
              ) : (
                <p className="text-[13px] text-fg-2">No attribution captured for this message.</p>
              )}
            </CardBody>
          </Card>
        </div>

        <aside className="min-w-0 space-y-4" aria-label="Sender and notes">
          <Card>
            <CardHeader title="Sender" />
            <CardBody>
              <DetailList
                className="sm:grid-cols-1"
                items={[
                  { label: "Email", value: <a href={`mailto:${m.email}`} className="font-medium text-brand underline-offset-4 hover:underline">{m.email}</a> },
                  { label: "Company", value: m.company },
                  { label: "Website", value: <WebsiteLink url={m.website} /> },
                  { label: "Country", value: m.country },
                  { label: "Business type", value: m.business_type },
                  { label: "Monthly ad spend", value: m.monthly_ad_spend ? adSpendLabels[m.monthly_ad_spend] : null },
                ]}
              />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Lead" />
            <CardBody>
              {lead ? (
                <Link href={`/admin/leads/${lead.id}`} className="flex items-center justify-between gap-3 rounded-[10px] border border-hair bg-white px-3 py-2.5 hover:bg-[#fafaf9]">
                  <span className="text-[13.5px] font-medium text-fg">{lead.full_name}</span>
                  <StatusBadge kind="lead" value={lead.status} />
                </Link>
              ) : (
                <p className="text-[13px] text-fg-2">Not a lead yet. Use &ldquo;Convert to lead&rdquo; to add it to the pipeline.</p>
              )}
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <MessageNoteForm id={m.id} note={m.note} />
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}
