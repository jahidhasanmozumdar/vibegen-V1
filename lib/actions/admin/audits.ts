"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { auditStatusLabels } from "@/lib/data/labels";
import type { ActionState } from "@/lib/data/types";
import { addFinding, deleteFinding, setAuditStatus, updateAudit, updateFinding } from "@/lib/services/admin/audits";
import { auditStatusSchema, auditUpdateSchema, fieldErrors, findingSchema, formDataToObject } from "@/lib/validation/schemas";
import { actorOf, failure, idSchema, invalid, ok } from "./utils";

function revalidateAudit(id: string) {
  revalidatePath("/admin/audits");
  revalidatePath(`/admin/audits/${id}`);
  revalidatePath("/admin", "layout");
}

export async function updateAuditAction(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsedId = idSchema.safeParse(id);
  const parsed = auditUpdateSchema.safeParse(formDataToObject(formData));
  if (!parsedId.success) return invalid("That audit isn't valid.");
  if (!parsed.success) return invalid("Check the highlighted fields.", fieldErrors(parsed.error));
  if (parsed.data.assigned_to && !idSchema.safeParse(parsed.data.assigned_to).success) return invalid("Choose a valid team member.", { assigned_to: ["Choose a valid team member."] });
  try {
    await updateAudit(parsedId.data, parsed.data, actorOf(user));
  } catch (error) {
    return failure(error);
  }
  revalidateAudit(parsedId.data);
  return ok("Changes saved.");
}

export async function setAuditStatusAction(id: string, status: string): Promise<ActionState> {
  const user = await requireUser();
  const parsedId = idSchema.safeParse(id);
  const parsedStatus = auditStatusSchema.safeParse(status);
  if (!parsedId.success || !parsedStatus.success) return invalid("That status isn't valid.");
  try {
    await setAuditStatus(parsedId.data, parsedStatus.data, actorOf(user));
  } catch (error) {
    return failure(error);
  }
  revalidateAudit(parsedId.data);
  return ok(parsedStatus.data === "completed" ? "Audit marked completed." : parsedStatus.data === "sent" ? "Audit marked as sent." : `Status set to ${auditStatusLabels[parsedStatus.data]}.`);
}

export async function saveFindingAction(auditId: string, findingId: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();
  const parsedAudit = idSchema.safeParse(auditId);
  const parsedFinding = findingId ? idSchema.safeParse(findingId) : ({ success: true, data: null } as const);
  const parsed = findingSchema.safeParse(formDataToObject(formData));
  if (!parsedAudit.success || !parsedFinding.success) return invalid("That finding isn't valid.");
  if (!parsed.success) return invalid("Check the highlighted fields.", fieldErrors(parsed.error));
  try {
    if (parsedFinding.data) await updateFinding(parsedAudit.data, parsedFinding.data, parsed.data);
    else await addFinding(parsedAudit.data, parsed.data);
  } catch (error) {
    return failure(error);
  }
  revalidateAudit(parsedAudit.data);
  return ok(parsedFinding.data ? "Finding updated." : "Finding added.");
}

export async function deleteFindingAction(auditId: string, findingId: string): Promise<ActionState> {
  await requireUser();
  const a = idSchema.safeParse(auditId);
  const f = idSchema.safeParse(findingId);
  if (!a.success || !f.success) return invalid("That finding isn't valid.");
  try {
    await deleteFinding(a.data, f.data);
  } catch (error) {
    return failure(error);
  }
  revalidateAudit(a.data);
  return ok("Finding deleted.");
}
