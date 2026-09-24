"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, Pencil, Plus, Send, Trash2 } from "lucide-react";

import { StatusBadge } from "@/components/admin/status-badge";
import { submitKeepingValues, useActionRunner, useActionStateToast } from "@/components/admin/use-action";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, Select, Textarea, fieldAria } from "@/components/ui/field";
import { ConfirmDialog, Modal } from "@/components/ui/modal";
import { deleteFindingAction, saveFindingAction, setAuditStatusAction, updateAuditAction } from "@/lib/actions/admin/audits";
import { auditSectionLabels, auditStatusLabels, auditTypeLabels, findingStatusLabels, priorityLabels, toOptions } from "@/lib/data/labels";
import type { ActionState, AuditFinding, AuditSection, AuditStatus, AuditType, Priority } from "@/lib/data/types";

const idle: ActionState = { status: "idle" };

/** Small priority dot before the badges (decorative — the priority badge carries the text). */
const priorityDot: Record<Priority, string> = { high: "bg-[#d92d20]", medium: "bg-[#f79009]", low: "bg-[#c3c6ce]" };

/* ------------------------------------------------------------------ */
/* Header actions                                                       */
/* ------------------------------------------------------------------ */

export function AuditHeaderActions({ auditId, status }: { auditId: string; status: AuditStatus }) {
  const { pending, run } = useActionRunner();
  const [confirm, setConfirm] = useState<"sent" | "completed" | null>(null);
  const done = status === "completed";
  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" disabled={pending || status === "sent" || done} icon={<Send className="size-3.5" aria-hidden="true" />} onClick={() => setConfirm("sent")}>
        Send Audit
      </Button>
      <Button size="sm" disabled={pending || done} icon={<CheckCircle2 className="size-3.5" aria-hidden="true" />} onClick={() => setConfirm("completed")}>
        {done ? "Completed" : "Mark completed"}
      </Button>
      <ConfirmDialog
        open={confirm !== null}
        onCancel={() => setConfirm(null)}
        onConfirm={() => confirm && run(() => setAuditStatusAction(auditId, confirm), () => setConfirm(null))}
        pending={pending}
        confirmVariant="primary"
        title={confirm === "sent" ? "Mark this audit as sent?" : "Mark this audit as completed?"}
        description={
          confirm === "sent"
            ? "This sets the status to Sent. It doesn't email anything — send the audit to the client yourself first."
            : "This sets the status to Completed, records the completion date and notifies the team."
        }
        confirmLabel={confirm === "sent" ? "Mark as sent" : "Mark completed"}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Findings                                                             */
/* ------------------------------------------------------------------ */

function FindingForm({ auditId, section, finding, onDone }: { auditId: string; section: AuditSection; finding: AuditFinding | null; onDone: () => void }) {
  const [state, action, pending] = useActionState(saveFindingAction.bind(null, auditId, finding?.id ?? null), idle);
  useActionStateToast(state, onDone);
  const e = state.fieldErrors ?? {};
  const p = finding ? `finding-${finding.id}` : `finding-new-${section}`;

  return (
    <form onSubmit={submitKeepingValues(action)} noValidate className="space-y-4">
      {state.status === "error" && state.message && <Alert tone="danger">{state.message}</Alert>}
      <div className="grid gap-4 sm:grid-cols-3">
        <Field id={`${p}-section`} label="Section" required error={e.section}>
          <Select {...fieldAria(`${p}-section`, e.section)} name="section" defaultValue={finding?.section ?? section} options={toOptions(auditSectionLabels)} />
        </Field>
        <Field id={`${p}-priority`} label="Priority" required error={e.priority}>
          <Select {...fieldAria(`${p}-priority`, e.priority)} name="priority" defaultValue={finding?.priority ?? "medium"} options={toOptions(priorityLabels)} />
        </Field>
        <Field id={`${p}-status`} label="Status" required error={e.status}>
          <Select {...fieldAria(`${p}-status`, e.status)} name="status" defaultValue={finding?.status ?? "open"} options={toOptions(findingStatusLabels)} />
        </Field>
      </div>
      <Field id={`${p}-issue`} label="Issue" required error={e.issue} hint="What's wrong, in one or two sentences.">
        <Textarea {...fieldAria(`${p}-issue`, e.issue, true)} name="issue" rows={2} defaultValue={finding?.issue} required />
      </Field>
      <Field id={`${p}-impact`} label="Impact" required error={e.impact} hint="Why it matters for leads, cost or tracking.">
        <Textarea {...fieldAria(`${p}-impact`, e.impact, true)} name="impact" rows={2} defaultValue={finding?.impact} required />
      </Field>
      <Field id={`${p}-rec`} label="Recommendation" required error={e.recommendation} hint="The specific fix you'd make.">
        <Textarea {...fieldAria(`${p}-rec`, e.recommendation, true)} name="recommendation" rows={3} defaultValue={finding?.recommendation} required />
      </Field>
      <div className="flex justify-end gap-2.5 border-t border-hair pt-4">
        <Button type="button" variant="outline" size="sm" onClick={onDone} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" size="sm" loading={pending} loadingText="Saving…">
          {finding ? "Save Changes" : "Add finding"}
        </Button>
      </div>
    </form>
  );
}

export function FindingsSection({ auditId, section, findings }: { auditId: string; section: AuditSection; findings: AuditFinding[] }) {
  const [editing, setEditing] = useState<AuditFinding | "new" | null>(null);
  const [deleting, setDeleting] = useState<AuditFinding | null>(null);
  const [formKey, setFormKey] = useState(0);
  const { pending, run } = useActionRunner();
  const label = auditSectionLabels[section];
  const headingId = `section-${section}`;

  function close() {
    setEditing(null);
    setFormKey((k) => k + 1);
  }

  return (
    <section aria-labelledby={headingId} className="rounded-[16px] border border-hair bg-white">
      <header className="flex items-center justify-between gap-3 border-b border-hair px-5 py-3">
        <h2 id={headingId} className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.015em] text-fg">
          {label}
          <span className="tabular rounded-full bg-[#f1f2f4] px-1.5 text-[11.5px] font-medium text-fg-2">{findings.length}</span>
        </h2>
        <Button size="sm" variant="ghost" icon={<Plus className="size-3.5" aria-hidden="true" />} onClick={() => setEditing("new")}>
          Add finding<span className="sr-only"> to {label}</span>
        </Button>
      </header>
      {findings.length === 0 ? (
        <p className="px-5 py-4 text-[13px] text-fg-2">No findings yet. Add the first one when you spot a leak.</p>
      ) : (
        <ul className="space-y-3 p-4 sm:p-5">
          {findings.map((f) => (
            <li key={f.id} className="rounded-[12px] border border-hair bg-white px-4 py-3.5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`size-2 rounded-full ${priorityDot[f.priority]}`} aria-hidden="true" />
                  <StatusBadge kind="priority" value={f.priority} />
                  <StatusBadge kind="finding" value={f.status} />
                </div>
                <div className="flex gap-1">
                  <button type="button" onClick={() => setEditing(f)} className="inline-flex size-7 items-center justify-center rounded-full text-fg-3 transition-colors hover:bg-soft hover:text-fg" aria-label="Edit finding">
                    <Pencil className="size-3.5" aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => setDeleting(f)} className="inline-flex size-7 items-center justify-center rounded-full text-fg-3 transition-colors hover:bg-[#fdecea] hover:text-[#b42318]" aria-label="Delete finding">
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <dl className="mt-2.5 grid gap-2.5 text-[13.5px] md:grid-cols-3">
                <div>
                  <dt className="text-[12.5px] text-fg-3">Issue</dt>
                  <dd className="mt-0.5 leading-relaxed font-medium text-fg">{f.issue}</dd>
                </div>
                <div>
                  <dt className="text-[12.5px] text-fg-3">Impact</dt>
                  <dd className="mt-0.5 leading-relaxed text-fg-2">{f.impact}</dd>
                </div>
                <div>
                  <dt className="text-[12.5px] text-fg-3">Recommendation</dt>
                  <dd className="mt-0.5 leading-relaxed text-fg-2">{f.recommendation}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}

      <Modal open={editing !== null} onClose={close} title={editing === "new" ? `Add a ${label} finding` : "Edit finding"} size="lg">
        {editing !== null && <FindingForm key={formKey} auditId={auditId} section={section} finding={editing === "new" ? null : editing} onDone={close} />}
      </Modal>
      <ConfirmDialog
        open={deleting !== null}
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && run(() => deleteFindingAction(auditId, deleting.id), () => setDeleting(null))}
        pending={pending}
        title="Delete this finding?"
        description="It will be removed from the audit. This can't be undone."
        confirmLabel="Delete finding"
      />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Status / assignment / summary form                                   */
/* ------------------------------------------------------------------ */

export function AuditUpdateForm({
  auditId,
  values,
  profiles,
}: {
  auditId: string;
  values: { status: AuditStatus; priority: Priority; audit_type: AuditType; assigned_to: string | null; summary: string | null; notes: string | null };
  profiles: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(updateAuditAction.bind(null, auditId), idle);
  useActionStateToast(state);
  const e = state.fieldErrors ?? {};
  // Re-mount the fields when the saved values change (e.g. after "Mark completed").
  const key = `${values.status}-${values.priority}-${values.audit_type}-${values.assigned_to}`;

  return (
    <form key={key} onSubmit={submitKeepingValues(action)} noValidate className="space-y-4">
      {state.status === "error" && state.message && <Alert tone="danger">{state.message}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <Field id="audit-status" label="Status" required error={e.status}>
          <Select {...fieldAria("audit-status", e.status)} name="status" defaultValue={values.status} options={toOptions(auditStatusLabels)} />
        </Field>
        <Field id="audit-priority" label="Priority" required error={e.priority}>
          <Select {...fieldAria("audit-priority", e.priority)} name="priority" defaultValue={values.priority} options={toOptions(priorityLabels)} />
        </Field>
        <Field id="audit-type" label="Audit type" required error={e.audit_type}>
          <Select {...fieldAria("audit-type", e.audit_type)} name="audit_type" defaultValue={values.audit_type} options={toOptions(auditTypeLabels)} />
        </Field>
        <Field id="audit-assignee" label="Assigned to" error={e.assigned_to}>
          <Select
            {...fieldAria("audit-assignee", e.assigned_to)}
            name="assigned_to"
            defaultValue={values.assigned_to ?? ""}
            placeholder="Unassigned"
            options={profiles.map((p) => ({ value: p.id, label: p.name }))}
          />
        </Field>
      </div>
      <Field id="audit-summary" label="Recommendations summary" error={e.summary} hint="The top 3–5 things to fix, in plain language. This is what the client reads first.">
        <Textarea {...fieldAria("audit-summary", e.summary, true)} name="summary" rows={5} defaultValue={values.summary ?? ""} />
      </Field>
      <Field id="audit-notes" label="Internal notes" error={e.notes} hint="Only visible to the team.">
        <Textarea {...fieldAria("audit-notes", e.notes, true)} name="notes" rows={4} defaultValue={values.notes ?? ""} />
      </Field>
      <Button type="submit" size="sm" loading={pending} loadingText="Saving…" className="w-full">
        Save Changes
      </Button>
    </form>
  );
}
