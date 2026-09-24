"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import type { ActionState } from "@/lib/data/types";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/services/admin/notifications";
import { failure, idSchema, invalid, ok } from "./utils";

export async function markNotificationAction(id: string, read: boolean): Promise<ActionState> {
  await requireUser();
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return invalid("That notification isn't valid.");
  try {
    await markNotificationRead(parsedId.data, read);
  } catch (error) {
    return failure(error);
  }
  revalidatePath("/admin", "layout");
  return ok(read ? "Marked as read." : "Marked as unread.");
}

export async function markAllNotificationsAction(): Promise<ActionState> {
  await requireUser();
  try {
    const count = await markAllNotificationsRead();
    revalidatePath("/admin", "layout");
    return ok(count ? `Marked ${count} notification${count === 1 ? "" : "s"} as read.` : "You're all caught up.");
  } catch (error) {
    return failure(error);
  }
}
