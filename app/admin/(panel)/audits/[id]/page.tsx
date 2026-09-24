import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { AuditHeaderActions, AuditUpdateForm, FindingsSection } from "@/components/admin/audits/audit-workspace";
import { Avatar } from "@/components/admin/cells";
import { DetailList, SectionLabel } from "@/components/admin/detail-list";
import { StatusBadge } from "@/components/admin/status-badge";
import { DemoBadge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { adSpendLabels, auditTypeLabels, platformLabels, priorityLabels, serviceLabels } from "@/lib/data/labels";
import { AUDIT_SECTIONS, PRIORITIES } from "@/lib/data/types";
import { getAuditDetail } from "@/lib/services/admin/audits";
import { listProfiles } from "@/lib/services/admin/leads";
import { isUuid } from "@/lib/services/admin/query";
import { formatDateTime, formatRelative, hostname } from "@/lib/utils/format";

export async function generateMetadata(props: PageProps<"/admin/audits/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const detail = isUuid(id) ? await getAuditDetail(id).catch(() => null) : null;
  return { title: detail ? `Audit · ${detail.audit.company || detail.audit.full_name}` : "Audit" };
}

export default async function AuditDetailPage(props: PageProps<"/admin/audits/[id]">) {
  await requireUser();
  const { id } = await props.params;
  if (!isUuid(id)) notFound();
  const [detail, profiles] = await Promise.all([getAuditDetail(id), listProfiles()]);
  if (!detail) notFound();
  const { audit, findings, findingCounts, lead, assignee } = detail;
  const totalFindings = PRIORITIES.reduce((s, p) => s + findingCounts[p], 0);

  return (
    <div>
      <Link href="/admin/audits" className="mb-3 inline-flex items-center gap-1.5 text-[13px] text-fg-2 transition-colors hover:text-fg">
        <ArrowLeft className="size-3.5" aria-hidden="true" /> Audit Requests
      </Link>
      <header className="rounded-[16px] border border-hair bg-white mb-6 flex flex-wrap items-start justify-between gap-4 px-5 py-5 sm:px-6">
        <div className="flex min-w-0 items-start gap-4">
          <Avatar name={audit.company || audit.full_name} size="lg" ring className="hidden sm:flex" />
          <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[22px] leading-tight font-semibold tracking-[-0.03em] text-fg sm:text-[26px]">{audit.company || audit.full_name}</h1>
            <StatusBadge kind="audit" value={audit.status} />
            <StatusBadge kind="priority" value={audit.priority} />
            {audit.is_demo && <DemoBadge />}
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[14px] text-fg-2">
            {audit.website && (
              <a href={audit.website} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 font-medium text-brand underline-offset-4 hover:underline">
                {hostname(audit.website)} <ExternalLink className="size-3" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
            <span>· {auditTypeLabels[audit.audit_type]} audit</span>
            <span>· {assignee ? `Assigned to ${assignee.full_name}` : "Unassigned"}</span>
            <span>· requested {formatRelative(audit.created_at)}</span>
          </p>
          </div>
        </div>
        <AuditHeaderActions auditId={audit.id} status={audit.status} />
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_21rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="min-w-0 space-y-4">
          <div className="rounded-[16px] border border-hair bg-white flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3 text-[13px]">
            <span className="text-[17px] font-semibold text-fg">
              <span className="tabular">{totalFindings}</span> finding{totalFindings === 1 ? "" : "s"}
            </span>
            {PRIORITIES.map((p) => (
              <span key={p} className="flex items-center gap-1.5 text-fg-2">
                <StatusBadge kind="priority" value={p} />
                <span className="tabular font-medium text-fg">{findingCounts[p]}</span>
                <span className="sr-only">{priorityLabels[p]} priority findings</span>
              </span>
            ))}
          </div>
          {AUDIT_SECTIONS.map((s) => (
            <FindingsSection key={s} auditId={audit.id} section={s} findings={findings[s]} />
          ))}
        </div>

        <aside className="min-w-0 space-y-4" aria-label="Audit settings and request details">
          <Card>
            <CardHeader title="Status, priority & summary" />
            <CardBody>
              <AuditUpdateForm
                auditId={audit.id}
                values={{ status: audit.status, priority: audit.priority, audit_type: audit.audit_type, assigned_to: audit.assigned_to, summary: audit.summary, notes: audit.notes }}
                profiles={profiles.map((p) => ({ id: p.id, name: p.full_name }))}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Request details" />
            <CardBody className="space-y-4">
              <DetailList
                className="sm:grid-cols-1"
                items={[
                  { label: "Contact", value: audit.full_name },
                  { label: "Email", wide: true, value: <a href={`mailto:${audit.email}`} className="break-all font-medium text-brand underline-offset-4 hover:underline">{audit.email}</a> },
                  { label: "Primary platform", value: audit.primary_platform ? platformLabels[audit.primary_platform] : null },
                  { label: "Monthly ad spend", value: audit.monthly_ad_spend ? adSpendLabels[audit.monthly_ad_spend] : null },
                  { label: "Services needed", value: audit.services_needed.map((s) => serviceLabels[s]).join(", ") },
                  { label: "Requested", value: formatDateTime(audit.created_at) },
                  { label: "Completed", value: audit.completed_at ? formatDateTime(audit.completed_at) : null },
                ]}
              />
              <div>
                <SectionLabel>Challenge</SectionLabel>
                {audit.challenge ? <p className="text-[13.5px] leading-relaxed whitespace-pre-line text-fg-2">{audit.challenge}</p> : <p className="text-[13px] text-fg-3">Not provided</p>}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Lead" />
            <CardBody>
              {lead ? (
                <Link href={`/admin/leads/${lead.id}`} className="flex items-center justify-between gap-3 rounded-[10px] border border-hair bg-white px-3 py-2.5 hover:bg-[#fafaf9]">
                  <span className="min-w-0">
                    <span className="block text-[13.5px] font-medium text-fg">{lead.full_name}</span>
                    <span className="block truncate text-[12px] text-fg-2">{lead.email}</span>
                  </span>
                  <StatusBadge kind="lead" value={lead.status} />
                </Link>
              ) : (
                <p className="text-[13px] text-fg-2">This request isn&apos;t linked to a lead.</p>
              )}
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}
