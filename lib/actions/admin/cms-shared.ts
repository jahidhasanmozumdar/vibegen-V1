import "server-only";

import { revalidatePath } from "next/cache";

import type { ActionState } from "@/lib/data/types";
import { SlugTakenError, cmsErrorMessage } from "@/lib/services/admin/cms";

/**
 * Helpers shared by the CMS server actions. Not a "use server" module, so
 * nothing here is callable from the browser.
 */

export function revalidateAll(paths: (string | null | undefined | false)[]): void {
  for (const path of new Set(paths.filter((p): p is string => Boolean(p)))) revalidatePath(path);
}

export function failure(error: unknown): ActionState<{ id: string }> {
  if (error instanceof SlugTakenError) {
    return { status: "error", message: "Check the highlighted fields.", fieldErrors: { slug: ["That slug is already used. Pick a different one."] } };
  }
  console.error("[cms]", error instanceof Error ? error.message : error);
  return { status: "error", message: cmsErrorMessage(error) };
}

export const invalid = (fieldErrors: Record<string, string[] | undefined>, message = "Check the highlighted fields."): ActionState<{ id: string }> => ({
  status: "error",
  message,
  fieldErrors,
});

export function idFrom(formData: FormData): string | null {
  const id = formData.get("id");
  return typeof id === "string" && id ? id : null;
}

/** Resolve published_at for a status change: keep an explicit date, stamp "now" on first publish. */
export function resolvePublishedAt(status: string, given: string | null, previous: string | null): string | null {
  if (status === "draft") return given ?? previous;
  return given ?? previous ?? new Date().toISOString();
}
