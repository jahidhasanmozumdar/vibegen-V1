"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { bookingStatusLabels } from "@/lib/data/labels";
import type { ActionState } from "@/lib/data/types";
import { createBooking, deleteBooking, updateBooking, updateBookingStatus } from "@/lib/services/admin/bookings";
import { bookingSchema, bookingStatusSchema, fieldErrors, formDataToObject } from "@/lib/validation/schemas";
import { actorOf, failure, idSchema, invalid, ok } from "./utils";

function revalidateBookings() {
  revalidatePath("/admin/bookings");
  revalidatePath("/admin", "layout");
}

export async function saveBookingAction(id: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsedId = id ? idSchema.safeParse(id) : ({ success: true, data: null } as const);
  const parsed = bookingSchema.safeParse(formDataToObject(formData));
  if (!parsedId.success) return invalid("That booking isn't valid.");
  if (!parsed.success) return invalid("Check the highlighted fields.", fieldErrors(parsed.error));
  try {
    if (parsedId.data) await updateBooking(parsedId.data, parsed.data);
    else {
      const booking = await createBooking(parsed.data, actorOf(user));
      if (booking.lead_id) revalidatePath(`/admin/leads/${booking.lead_id}`);
    }
  } catch (error) {
    return failure(error);
  }
  revalidateBookings();
  return ok(parsedId.data ? "Booking updated." : "Booking added.");
}

export async function setBookingStatusAction(id: string, status: string): Promise<ActionState> {
  await requireUser();
  const parsedId = idSchema.safeParse(id);
  const parsedStatus = bookingStatusSchema.safeParse(status);
  if (!parsedId.success || !parsedStatus.success) return invalid("That status isn't valid.");
  try {
    await updateBookingStatus(parsedId.data, parsedStatus.data);
  } catch (error) {
    return failure(error);
  }
  revalidateBookings();
  return ok(`Booking marked ${bookingStatusLabels[parsedStatus.data].toLowerCase()}.`);
}

export async function deleteBookingAction(id: string): Promise<ActionState> {
  await requireUser("leads:delete");
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return invalid("That booking isn't valid.");
  try {
    await deleteBooking(parsedId.data);
  } catch (error) {
    return failure(error);
  }
  revalidateBookings();
  return ok("Booking deleted.");
}
