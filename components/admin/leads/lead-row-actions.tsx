"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { RowMenu } from "@/components/admin/row-menu";
import { useActionRunner } from "@/components/admin/use-action";
import { ConfirmDialog } from "@/components/ui/modal";
import { archiveLeadAction, updateLeadStatusAction } from "@/lib/actions/admin/leads";
import type { LeadStatus } from "@/lib/data/types";

/** Per-row menu on the leads table. */
export function LeadRowActions({ id, name, status }: { id: string; name: string; status: LeadStatus }) {
  const router = useRouter();
  const { pending, run } = useActionRunner();
  const [confirmArchive, setConfirmArchive] = useState(false);

  return (
    <>
      <RowMenu
        label={`Actions for ${name}`}
        items={[
          { label: "Review Lead", onSelect: () => router.push(`/admin/leads/${id}`) },
          { label: "Mark as Contacted", disabled: pending || status === "contacted", onSelect: () => run(() => updateLeadStatusAction(id, "contacted")) },
          { label: "Mark as Qualified", disabled: pending || status === "qualified", onSelect: () => run(() => updateLeadStatusAction(id, "qualified")) },
          { label: "Archive", danger: true, disabled: pending || status === "archived", onSelect: () => setConfirmArchive(true) },
        ]}
      />
      <ConfirmDialog
        open={confirmArchive}
        onCancel={() => setConfirmArchive(false)}
        onConfirm={() => run(() => archiveLeadAction(id), () => setConfirmArchive(false))}
        pending={pending}
        title="Archive this lead?"
        description={`${name} will move to Archived. You can change the status back at any time.`}
        confirmLabel="Archive lead"
      />
    </>
  );
}
