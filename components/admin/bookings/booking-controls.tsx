"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { Plus } from "lucide-react";

import { RowMenu } from "@/components/admin/row-menu";
import { submitKeepingValues, useActionRunner, useActionStateToast } from "@/components/admin/use-action";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea, fieldAria } from "@/components/ui/field";
import { ConfirmDialog, Modal } from "@/components/ui/modal";
import { deleteBookingAction, saveBookingAction, setBookingStatusAction } from "@/lib/actions/admin/bookings";
import { bookingStatusLabels, meetingTypeLabels, toOptions } from "@/lib/data/labels";
import { BOOKING_STATUSES, type ActionState, type Booking } from "@/lib/data/types";

const idle: ActionState = { status: "idle" };

/** ISO → value for <input type="datetime-local"> in the viewer's timezone. */
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function BookingForm({ booking, onDone }: { booking: Booking | null; onDone: () => void }) {
  const [state, action, pending] = useActionState(saveBookingAction.bind(null, booking?.id ?? null), idle);
  useActionStateToast(state, onDone);
  const e = state.fieldErrors ?? {};

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={(ev) => {
        // Send the local datetime as an absolute ISO string so the server stores the right instant.
        const input = ev.currentTarget.elements.namedItem("meeting_local") as HTMLInputElement | null;
        const hidden = ev.currentTarget.elements.namedItem("meeting_at") as HTMLInputElement | null;
        if (input && hidden) hidden.value = input.value ? new Date(input.value).toISOString() : "";
        submitKeepingValues(action)(ev);
      }}
    >
      {state.status === "error" && state.message && <Alert tone="danger">{state.message}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="booking-name" label="Name" required error={e.name}>
          <Input {...fieldAria("booking-name", e.name)} name="name" defaultValue={booking?.name} required autoComplete="off" />
        </Field>
        <Field id="booking-email" label="Email" required error={e.email} hint={booking ? undefined : "Matched to an existing lead by email."}>
          <Input {...fieldAria("booking-email", e.email, !booking)} name="email" type="email" defaultValue={booking?.email} required autoComplete="off" />
        </Field>
        <Field id="booking-company" label="Company" error={e.company}>
          <Input {...fieldAria("booking-company", e.company)} name="company" defaultValue={booking?.company ?? ""} />
        </Field>
        <Field id="booking-when" label="Meeting date & time" error={e.meeting_at}>
          <Input {...fieldAria("booking-when", e.meeting_at)} name="meeting_local" type="datetime-local" defaultValue={toLocalInput(booking?.meeting_at ?? null)} />
          <input type="hidden" name="meeting_at" defaultValue={booking?.meeting_at ?? ""} />
        </Field>
        <Field id="booking-type" label="Meeting type" required error={e.meeting_type}>
          <Select {...fieldAria("booking-type", e.meeting_type)} name="meeting_type" defaultValue={booking?.meeting_type ?? "strategy_call"} options={toOptions(meetingTypeLabels)} />
        </Field>
        <Field id="booking-status" label="Status" required error={e.status}>
          <Select {...fieldAria("booking-status", e.status)} name="status" defaultValue={booking?.status ?? "scheduled"} options={toOptions(bookingStatusLabels)} />
        </Field>
      </div>
      <Field id="booking-notes" label="Notes" error={e.notes}>
        <Textarea {...fieldAria("booking-notes", e.notes)} name="notes" rows={3} defaultValue={booking?.notes ?? ""} />
      </Field>
      <div className="flex justify-end gap-2 border-t border-hair pt-4">
        <Button size="sm" type="button" variant="outline" onClick={onDone} disabled={pending}>
          Cancel
        </Button>
        <Button size="sm" type="submit" loading={pending} loadingText="Saving…">
          {booking ? "Save Changes" : "Add booking"}
        </Button>
      </div>
    </form>
  );
}

export function BookingModal({ open, booking, onClose }: { open: boolean; booking: Booking | null; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title={booking ? `Edit booking · ${booking.name}` : "Add a booking"} description={booking ? undefined : "For calls booked by email, phone or in person."} size="lg">
      {open && <BookingForm key={booking?.id ?? "new"} booking={booking} onDone={onClose} />}
    </Modal>
  );
}

export function AddBookingButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" icon={<Plus className="size-4" aria-hidden="true" />} onClick={() => setOpen(true)}>
        Add booking
      </Button>
      <BookingModal open={open} booking={null} onClose={() => setOpen(false)} />
    </>
  );
}

export function BookingRowActions({ booking, canDelete }: { booking: Booking; canDelete: boolean }) {
  const router = useRouter();
  const { pending, run } = useActionRunner();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <RowMenu
        label={`Actions for booking with ${booking.name}`}
        items={[
          { label: "Edit booking", onSelect: () => setEditing(true) },
          booking.lead_id ? { label: "Review Lead", onSelect: () => router.push(`/admin/leads/${booking.lead_id}`) } : null,
          ...BOOKING_STATUSES.filter((s) => s !== booking.status).map((s) => ({
            label: `Mark ${bookingStatusLabels[s].toLowerCase()}`,
            disabled: pending,
            onSelect: () => run(() => setBookingStatusAction(booking.id, s)),
          })),
          canDelete ? { label: "Delete", danger: true, disabled: pending, onSelect: () => setConfirmDelete(true) } : null,
        ]}
      />
      <BookingModal open={editing} booking={booking} onClose={() => setEditing(false)} />
      <ConfirmDialog
        open={confirmDelete}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => run(() => deleteBookingAction(booking.id), () => setConfirmDelete(false))}
        pending={pending}
        title="Delete this booking?"
        description={`The booking with ${booking.name} will be removed from the list. The linked lead is not affected.`}
        confirmLabel="Delete booking"
      />
    </>
  );
}
