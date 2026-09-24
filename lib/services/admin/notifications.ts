import "server-only";

import { adminStore } from "@/lib/data";
import type { Notification } from "@/lib/data/types";

export async function listNotifications(limit?: number): Promise<Notification[]> {
  const store = await adminStore();
  return store.list("notifications", { orderBy: { column: "created_at", ascending: false }, limit });
}

export async function unreadNotificationCount(): Promise<number> {
  const store = await adminStore();
  const rows = await store.list("notifications", { where: { read_at: null } });
  return rows.length;
}

export async function markNotificationRead(id: string, read = true): Promise<void> {
  const store = await adminStore();
  await store.update("notifications", id, { read_at: read ? new Date().toISOString() : null });
}

export async function markAllNotificationsRead(): Promise<number> {
  const store = await adminStore();
  const unread = await store.list("notifications", { where: { read_at: null } });
  const now = new Date().toISOString();
  await Promise.all(unread.map((n) => store.update("notifications", n.id, { read_at: now })));
  return unread.length;
}
