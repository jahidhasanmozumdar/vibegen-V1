"use client";

import { useRouter } from "next/navigation";
import { useActionState, useOptimistic, useState } from "react";
import { Archive, Trash2 } from "lucide-react";

import { StatusBadge } from "@/components/admin/status-badge";
import { submitKeepingValues, useActionRunner, useActionStateToast } from "@/components/admin/use-action";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/modal";
import { archiveLeadAction, assignOwnerAction, deleteLeadAction, updateLeadStatusAction, updateTagsAction } from "@/lib/actions/admin/leads";
import { leadStatusLabels, toOptions } from "@/lib/data/labels";
import type { ActionState, LeadStatus } from "@/lib/data/types";
import { cn } from "@/lib/utils/cn";

const smallSelect =
  "h-9 w-full appearance-none rounded-[10px] border border-hair bg-white pr-8 pl-3 text-[13.5px] text-fg  focus:outline-none disabled:opacity-60";

function Chevron() {
  return (
    <svg className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-fg-2" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Next sensible step(s) in the funnel for the quick buttons. */
const NEXT_STEPS: Record<LeadStatus, LeadStatus[]> = {
  new: ["contacted", "qualified"],
  contacted: ["qualified", "lost"],
  qualified: ["proposal", "lost"],
  proposal: ["won", "lost"],
  won: [],
  lost: ["contacted"],
  archived: ["new"],
};

const quickLabel = (s: LeadStatus) => (s === "new" ? "Restore to New" : s === "proposal" ? "Mark Proposal Sent" : `Mark as ${leadStatusLabels[s]}`);

/** Status badge + quick next-step buttons + full status select, with optimistic UI. */
export function LeadStatusControl({ leadId, status }: { leadId: string; status: LeadStatus }) {
  const [optimistic, setOptimistic] = useOptimistic(status);
  const { pending, run } = useActionRunner();

  function change(next: LeadStatus) {
    if (next === optimistic) return;
    run(() => updateLeadStatusAction(leadId, next), undefined, () => setOptimistic(next));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <StatusBadge kind="lead" value={optimistic} />
        {pending && <span className="text-[12px] text-fg-2">Saving…</span>}
      </div>
      {NEXT_STEPS[optimistic].length > 0 && (
        <div className="flex flex-wrap gap-2">
          {NEXT_STEPS[optimistic].map((s, i) => (
            <Button key={s} size="sm" variant={i === 0 && s !== "lost" ? "primary" : "outline"} disabled={pending} onClick={() => change(s)}>
              {quickLabel(s)}
            </Button>
          ))}
        </div>
      )}
      <div>
        <label htmlFor="lead-status" className="mb-1 block text-[12px] font-medium text-fg-2">
          Status
        </label>
        <div className="relative">
          <select id="lead-status" value={optimistic} disabled={pending} onChange={(e) => change(e.target.value as LeadStatus)} className={smallSelect}>
            {toOptions(leadStatusLabels).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <Chevron />
        </div>
      </div>
    </div>
  );
}

export function OwnerSelect({ leadId, ownerId, profiles }: { leadId: string; ownerId: string | null; profiles: { id: string; name: string }[] }) {
  const [optimistic, setOptimistic] = useOptimistic(ownerId ?? "");
  const { pending, run } = useActionRunner();
  return (
    <div>
      <label htmlFor="lead-owner" className="mb-1 block text-[12px] font-medium text-fg-2">
        Owner
      </label>
      <div className="relative">
        <select
          id="lead-owner"
          value={optimistic}
          disabled={pending}
          onChange={(e) => {
            const next = e.target.value;
            run(() => assignOwnerAction(leadId, next), undefined, () => setOptimistic(next));
          }}
          className={smallSelect}
        >
          <option value="">Unassigned</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <Chevron />
      </div>
    </div>
  );
}

const idle: ActionState = { status: "idle" };

export function TagsEditor({ leadId, tags }: { leadId: string; tags: string[] }) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(updateTagsAction.bind(null, leadId), idle);
  useActionStateToast(state, () => setEditing(false));
  const error = state.status === "error" ? (state.fieldErrors?.tags?.[0] ?? state.message) : null;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span id="tags-label" className="text-[12px] font-medium text-fg-2">
          Tags
        </span>
        {!editing && (
          <button type="button" onClick={() => setEditing(true)} className="text-[12px] font-medium text-brand underline-offset-4 hover:underline">
            Edit<span className="sr-only"> tags</span>
          </button>
        )}
      </div>
      {editing ? (
        <form onSubmit={submitKeepingValues(action)} className="space-y-2">
          <input
            name="tags"
            aria-labelledby="tags-label"
            aria-describedby="tags-hint"
            aria-invalid={error ? true : undefined}
            defaultValue={tags.join(", ")}
            autoFocus
            className="h-9 w-full rounded-[10px] border border-hair bg-white px-3 text-[13.5px] focus:outline-none aria-invalid:border-danger"
          />
          <p id="tags-hint" className={cn("text-[12px]", error ? "font-medium text-danger" : "text-fg-2")}>
            {error ?? "Comma-separated, e.g. high-intent, uk"}
          </p>
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={pending}>
              Save Changes
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)} disabled={pending}>
              Cancel
            </Button>
          </div>
        </form>
      ) : tags.length ? (
        <ul className="flex flex-wrap gap-1.5" aria-labelledby="tags-label">
          {tags.map((t) => (
            <li key={t} className="rounded-[5px] border border-hair bg-soft px-1.5 py-0.5 text-[12px] text-fg-2">
              {t}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[13px] text-fg-3">No tags yet</p>
      )}
    </div>
  );
}

export function LeadDangerZone({ leadId, name, archived, canDelete }: { leadId: string; name: string; archived: boolean; canDelete: boolean }) {
  const router = useRouter();
  const { pending, run } = useActionRunner();
  const [confirm, setConfirm] = useState<"archive" | "delete" | null>(null);

  return (
    <div className="flex flex-wrap gap-2">
      {!archived && (
        <Button size="sm" variant="outline" icon={<Archive className="size-3.5" aria-hidden="true" />} onClick={() => setConfirm("archive")}>
          Archive
        </Button>
      )}
      {canDelete && (
        <Button size="sm" variant="danger" icon={<Trash2 className="size-3.5" aria-hidden="true" />} onClick={() => setConfirm("delete")}>
          Delete
        </Button>
      )}
      <ConfirmDialog
        open={confirm === "archive"}
        onCancel={() => setConfirm(null)}
        onConfirm={() => run(() => archiveLeadAction(leadId), () => setConfirm(null))}
        pending={pending}
        title="Archive this lead?"
        description={`${name} will move to Archived and drop out of your active pipeline. You can restore it later.`}
        confirmLabel="Archive lead"
      />
      <ConfirmDialog
        open={confirm === "delete"}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          run(
            () => deleteLeadAction(leadId),
            () => {
              setConfirm(null);
              router.push("/admin/leads");
            },
          );
        }}
        pending={pending}
        title="Delete this lead?"
        description={`${name} will be removed from the dashboard along with its place in reports. This is a soft delete, so an admin can recover it from the database if needed.`}
        confirmLabel="Delete lead"
      />
    </div>
  );
}
