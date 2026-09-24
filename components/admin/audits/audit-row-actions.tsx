"use client";

import { useRouter } from "next/navigation";

import { RowMenu } from "@/components/admin/row-menu";
import { useActionRunner } from "@/components/admin/use-action";
import { setAuditStatusAction } from "@/lib/actions/admin/audits";
import type { AuditStatus } from "@/lib/data/types";

export function AuditRowActions({ id, name, status, leadId }: { id: string; name: string; status: AuditStatus; leadId: string | null }) {
  const router = useRouter();
  const { pending, run } = useActionRunner();
  return (
    <RowMenu
      label={`Actions for ${name}`}
      items={[
        { label: "View Audit", onSelect: () => router.push(`/admin/audits/${id}`) },
        leadId ? { label: "Review Lead", onSelect: () => router.push(`/admin/leads/${leadId}`) } : null,
        { label: "Start review", disabled: pending || status !== "new", onSelect: () => run(() => setAuditStatusAction(id, "reviewing")) },
        { label: "Send Audit", disabled: pending || status === "sent" || status === "completed", onSelect: () => run(() => setAuditStatusAction(id, "sent")) },
        { label: "Mark completed", disabled: pending || status === "completed", onSelect: () => run(() => setAuditStatusAction(id, "completed")) },
        { label: "Archive", danger: true, disabled: pending || status === "archived", onSelect: () => run(() => setAuditStatusAction(id, "archived")) },
      ]}
    />
  );
}
