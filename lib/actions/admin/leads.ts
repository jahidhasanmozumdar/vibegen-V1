"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { leadStatusLabels } from "@/lib/data/labels";
import type { ActionState } from "@/lib/data/types";
import {
  addLeadNote,
  archiveLead,
  assignOwner,
  createManualLead,
  deleteLead,
  updateLeadStatus,
  updateTags,
} from "@/lib/services/admin/leads";
import { fieldErrors, formDataToObject, leadStatusSchema, manualLeadSchema, noteSchema, tagsSchema } from "@/lib/validation/schemas";
import { actorOf, failure, idSchema, invalid, ok } from "./utils";

function revalidateLead(id?: string) {
  revalidatePath("/admin/leads");
  revalidatePath("/admin", "layout");
  if (id) revalidatePath(`/admin/leads/${id}`);
}

export async function updateLeadStatusAction(id: string, status: string): Promise<ActionState> {
  const user = await requireUser();
  const parsedId = idSchema.safeParse(id);
  const parsedStatus = leadStatusSchema.safeParse(status);
  if (!parsedId.success || !parsedStatus.success) return invalid("That status isn't valid.");
  try {
    await updateLeadStatus(parsedId.data, parsedStatus.data, actorOf(user));
  } catch (error) {
    return failure(error);
  }
  revalidateLead(parsedId.data);
  return ok(`Marked as ${leadStatusLabels[parsedStatus.data]}.`);
}

export async function addLeadNoteAction(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsedId = idSchema.safeParse(id);
  const parsed = noteSchema.safeParse({ body: formData.get("body") ?? "" });
  if (!parsedId.success) return invalid("That lead isn't valid.");
  if (!parsed.success) return invalid("Write a note first.", fieldErrors(parsed.error));
  try {
    await addLeadNote(parsedId.data, parsed.data.body, actorOf(user));
  } catch (error) {
    return failure(error);
  }
  revalidateLead(parsedId.data);
  return ok("Note added.");
}

export async function assignOwnerAction(id: string, ownerId: string): Promise<ActionState> {
  const user = await requireUser();
  const parsedId = idSchema.safeParse(id);
  const parsedOwner = ownerId ? idSchema.safeParse(ownerId) : ({ success: true, data: null } as const);
  if (!parsedId.success || !parsedOwner.success) return invalid("Choose a valid team member.");
  try {
    await assignOwner(parsedId.data, parsedOwner.data, actorOf(user));
  } catch (error) {
    return failure(error);
  }
  revalidateLead(parsedId.data);
  return ok(parsedOwner.data ? "Owner assigned." : "Owner removed.");
}

export async function updateTagsAction(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsedId = idSchema.safeParse(id);
  const parsed = tagsSchema.safeParse(String(formData.get("tags") ?? ""));
  if (!parsedId.success) return invalid("That lead isn't valid.");
  if (!parsed.success) return invalid("Tags must be under 32 characters.", { tags: parsed.error.issues.map((i) => i.message) });
  try {
    await updateTags(parsedId.data, parsed.data, actorOf(user));
  } catch (error) {
    return failure(error);
  }
  revalidateLead(parsedId.data);
  return ok("Tags saved.");
}

export async function archiveLeadAction(id: string): Promise<ActionState> {
  const user = await requireUser();
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return invalid("That lead isn't valid.");
  try {
    await archiveLead(parsedId.data, actorOf(user));
  } catch (error) {
    return failure(error);
  }
  revalidateLead(parsedId.data);
  return ok("Lead archived.");
}

export async function deleteLeadAction(id: string): Promise<ActionState> {
  await requireUser("leads:delete");
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return invalid("That lead isn't valid.");
  try {
    await deleteLead(parsedId.data);
  } catch (error) {
    return failure(error);
  }
  revalidateLead(parsedId.data);
  return ok("Lead deleted.");
}

export async function createLeadAction(_prev: ActionState<{ id: string }>, formData: FormData): Promise<ActionState<{ id: string }>> {
  const user = await requireUser();
  const parsed = manualLeadSchema.safeParse(formDataToObject(formData, ["services"]));
  if (!parsed.success) return invalid("Check the highlighted fields.", fieldErrors(parsed.error));
  try {
    const lead = await createManualLead(parsed.data, actorOf(user));
    revalidateLead();
    return ok("Lead added.", { id: lead.id });
  } catch (error) {
    return failure(error);
  }
}
