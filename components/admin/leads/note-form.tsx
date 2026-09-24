"use client";

import { useActionState, useRef } from "react";

import { submitKeepingValues, useActionStateToast } from "@/components/admin/use-action";
import { Button } from "@/components/ui/button";
import { addLeadNoteAction } from "@/lib/actions/admin/leads";
import type { ActionState } from "@/lib/data/types";

const idle: ActionState = { status: "idle" };

export function LeadNoteForm({ leadId }: { leadId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(addLeadNoteAction.bind(null, leadId), idle);
  useActionStateToast(state, () => formRef.current?.reset());
  const error = state.status === "error" ? (state.fieldErrors?.body?.[0] ?? state.message) : null;

  return (
    <form ref={formRef} onSubmit={submitKeepingValues(action)} className="space-y-2">
      <label htmlFor="note-body" className="sr-only">
        New note
      </label>
      <textarea
        id="note-body"
        name="body"
        rows={3}
        maxLength={4000}
        placeholder="Add a note — call summary, next step, budget…"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "note-error" : undefined}
        className="block w-full rounded-[10px] border border-hair bg-white px-3 py-2 text-[13.5px] leading-relaxed placeholder:text-fg-3 focus:outline-none aria-invalid:border-danger"
      />
      <div className="flex items-center justify-between gap-3">
        <p id="note-error" role={error ? "alert" : undefined} className="text-[12.5px] font-medium text-danger">
          {error}
        </p>
        <Button type="submit" size="sm" loading={pending} loadingText="Saving…">
          Add note
        </Button>
      </div>
    </form>
  );
}
