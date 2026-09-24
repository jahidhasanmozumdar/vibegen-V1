"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { Archive, ArchiveRestore, Mail, MailOpen, Trash2, UserPlus } from "lucide-react";

import { submitKeepingValues, useActionRunner, useActionStateToast } from "@/components/admin/use-action";
import { Button, ButtonLink } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/modal";
import { convertMessageAction, deleteMessageAction, saveMessageNoteAction, setMessageStatusAction } from "@/lib/actions/admin/messages";
import type { ActionState, MessageStatus } from "@/lib/data/types";

/** Opening an unread message marks it read (once, quietly). */
export function MarkReadOnView({ id, unread }: { id: string; unread: boolean }) {
  const done = useRef(false);
  useEffect(() => {
    if (!unread || done.current) return;
    done.current = true;
    // The action revalidates the inbox, so counts and the dot update without a toast.
    void setMessageStatusAction(id, "read");
  }, [id, unread]);
  return null;
}

export function MessageActions({ id, status, leadId, canDelete }: { id: string; status: MessageStatus; leadId: string | null; canDelete: boolean }) {
  const router = useRouter();
  const { pending, run } = useActionRunner();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="flex flex-wrap gap-2">
      {leadId ? (
        <ButtonLink href={`/admin/leads/${leadId}`} size="sm" variant="outline" icon={<UserPlus className="size-3.5" aria-hidden="true" />}>
          View lead
        </ButtonLink>
      ) : (
        <Button
          size="sm"
          disabled={pending}
          icon={<UserPlus className="size-3.5" aria-hidden="true" />}
          onClick={() => run(() => convertMessageAction(id), (r) => r.data && router.push(`/admin/leads/${r.data.leadId}`))}
        >
          Convert to lead
        </Button>
      )}
      {status === "unread" ? (
        <Button size="sm" variant="outline" disabled={pending} icon={<MailOpen className="size-3.5" aria-hidden="true" />} onClick={() => run(() => setMessageStatusAction(id, "read"))}>
          Mark read
        </Button>
      ) : (
        <Button size="sm" variant="outline" disabled={pending} icon={<Mail className="size-3.5" aria-hidden="true" />} onClick={() => run(() => setMessageStatusAction(id, "unread"))}>
          Mark unread
        </Button>
      )}
      {status === "archived" ? (
        <Button size="sm" variant="outline" disabled={pending} icon={<ArchiveRestore className="size-3.5" aria-hidden="true" />} onClick={() => run(() => setMessageStatusAction(id, "read"))}>
          Move to inbox
        </Button>
      ) : (
        <Button size="sm" variant="outline" disabled={pending} icon={<Archive className="size-3.5" aria-hidden="true" />} onClick={() => run(() => setMessageStatusAction(id, "archived"))}>
          Archive
        </Button>
      )}
      {canDelete && (
        <Button size="sm" variant="danger" disabled={pending} icon={<Trash2 className="size-3.5" aria-hidden="true" />} onClick={() => setConfirmDelete(true)}>
          Delete
        </Button>
      )}
      <ConfirmDialog
        open={confirmDelete}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() =>
          run(
            () => deleteMessageAction(id),
            () => {
              setConfirmDelete(false);
              router.push("/admin/messages");
            },
          )
        }
        pending={pending}
        title="Delete this message?"
        description="It will be removed from the inbox. A linked lead is not affected."
        confirmLabel="Delete message"
      />
    </div>
  );
}

const idle: ActionState = { status: "idle" };

export function MessageNoteForm({ id, note }: { id: string; note: string | null }) {
  const [state, action, pending] = useActionState(saveMessageNoteAction.bind(null, id), idle);
  useActionStateToast(state);
  const error = state.status === "error" ? (state.fieldErrors?.note?.[0] ?? state.message) : null;
  return (
    <form onSubmit={submitKeepingValues(action)} className="space-y-2">
      <label htmlFor="message-note" className="text-[12px] font-medium text-fg-2">
        Internal note
      </label>
      <textarea
        id="message-note"
        name="note"
        rows={4}
        maxLength={4000}
        defaultValue={note ?? ""}
        placeholder="Only visible to the team."
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "message-note-error" : undefined}
        className="block w-full rounded-[10px] border border-hair bg-white px-3 py-2 text-[13.5px] leading-relaxed placeholder:text-fg-3 focus:outline-none aria-invalid:border-danger"
      />
      {error && (
        <p id="message-note-error" role="alert" className="text-[12.5px] font-medium text-danger">
          {error}
        </p>
      )}
      <div className="flex items-center justify-between gap-2">
        <Link href="/admin/messages" className="text-[12.5px] text-fg-2 hover:text-fg">
          Back to inbox
        </Link>
        <Button type="submit" size="sm" loading={pending} loadingText="Saving…">
          Save note
        </Button>
      </div>
    </form>
  );
}
