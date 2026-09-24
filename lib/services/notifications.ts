import "server-only";

import type { DataStore } from "@/lib/data";
import type { NotificationType } from "@/lib/data/types";

export async function createNotification(
  store: DataStore,
  input: { type: NotificationType; title: string; body: string; link: string | null; isDemo?: boolean },
): Promise<void> {
  try {
    await store.insert("notifications", {
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link,
      read_at: null,
      is_demo: input.isDemo ?? false,
    });
  } catch (error) {
    // A missing notification must never fail the underlying operation.
    console.error("[notifications] create failed", error instanceof Error ? error.message : error);
  }
}
