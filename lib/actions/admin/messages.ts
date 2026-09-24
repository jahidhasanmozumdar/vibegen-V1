"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth/session";
import { MESSAGE_STATUSES, type ActionState } from "@/lib/data/types";
import { convertMessageToLead, deleteMessage, saveMessageNote, setMessageStatus } from "@/lib/services/admin/messages";
import { boundedText, fieldErrors } from "@/lib/validation/schemas";
import { actorOf, failure, idSchema, invalid, ok } from "./utils";

function revalidateMessage(id: string) {
  revalidatePath("/admin/messages");
  revalidatePath(`/admin/messages/${id}`);
  revalidatePath("/admin", "layout");
}

const statusMessages = { unread: "Marked as unread.", read: "Marked as read.", archived: "Message archived." } as const;

export async function setMessageStatusAction(id: string, status: string): Promise<ActionState> {
  await requireUser();
  const parsedId = idSchema.safeParse(id);
  const parsedStatus = z.enum(MESSAGE_STATUSES).safeParse(status);
  if (!parsedId.success || !parsedStatus.success) return invalid("That status isn't valid.");
  try {
    await setMessageStatus(parsedId.data, parsedStatus.data);
  } catch (error) {
    return failure(error);
  }
  revalidateMessage(parsedId.data);
  return ok(statusMessages[parsedStatus.data]);
}

export async function saveMessageNoteAction(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();
  const parsedId = idSchema.safeParse(id);
  const parsed = z.object({ note: boundedText(4000) }).safeParse({ note: formData.get("note") ?? "" });
  if (!parsedId.success) return invalid("That message isn't valid.");
  if (!parsed.success) return invalid("Check the note.", fieldErrors(parsed.error));
  try {
    await saveMessageNote(parsedId.data, parsed.data.note || null);
  } catch (error) {
    return failure(error);
  }
  revalidateMessage(parsedId.data);
  return ok("Note saved.");
}

export async function convertMessageAction(id: string): Promise<ActionState<{ leadId: string }>> {
  const user = await requireUser();
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return invalid("That message isn't valid.");
  try {
    const { lead, created } = await convertMessageToLead(parsedId.data, actorOf(user));
    revalidateMessage(parsedId.data);
    revalidatePath("/admin/leads");
    return ok(created ? "Lead created from this message." : "This message is already linked to a lead.", { leadId: lead.id });
  } catch (error) {
    return failure(error);
  }
}

export async function deleteMessageAction(id: string): Promise<ActionState> {
  await requireUser("leads:delete");
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return invalid("That message isn't valid.");
  try {
    await deleteMessage(parsedId.data);
  } catch (error) {
    return failure(error);
  }
  revalidateMessage(parsedId.data);
  return ok("Message deleted.");
}
