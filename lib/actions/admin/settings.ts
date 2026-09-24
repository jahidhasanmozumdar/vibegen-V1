"use server";

import { revalidatePath } from "next/cache";

import { authDriver, requireUser } from "@/lib/auth/session";
import type { ActionState } from "@/lib/data/types";
import { saveSiteSettings, updateOwnName } from "@/lib/services/admin/settings";
import { fieldErrors, formDataToObject } from "@/lib/validation/schemas";
import { SETTINGS_SECTIONS, profileSchema, type SettingsSection } from "@/lib/validation/settings";

function isSection(value: unknown): value is SettingsSection {
  return typeof value === "string" && value in SETTINGS_SECTIONS;
}

/** Saves one settings tab into site_settings (key "site"). Admin only. */
export async function saveSettingsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser("settings:write");
  const raw = formDataToObject(formData);
  const section = raw.section;
  if (!isSection(section)) return { status: "error", message: "Unknown settings section." };

  const parsed = SETTINGS_SECTIONS[section].safeParse(raw);
  if (!parsed.success) return { status: "error", message: "Check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };

  try {
    await saveSiteSettings(parsed.data);
  } catch (error) {
    console.error("[settings] save failed", error instanceof Error ? error.message : error);
    return { status: "error", message: "Settings couldn't be saved. Try again." };
  }

  // Tracking IDs, contact details and SEO defaults are read by the root layout.
  revalidatePath("/", "layout");
  return { status: "success", message: "Settings saved." };
}

export async function updateProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (authDriver !== "database") {
    return { status: "error", message: "Profile editing needs a database. The demo admin's name is fixed." };
  }
  const parsed = profileSchema.safeParse({ full_name: formData.get("full_name") ?? "" });
  if (!parsed.success) return { status: "error", message: "Check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };

  try {
    await updateOwnName(user.id, parsed.data.full_name);
  } catch (error) {
    console.error("[settings] profile update failed", error instanceof Error ? error.message : error);
    return { status: "error", message: "Your profile couldn't be updated. Try again." };
  }
  revalidatePath("/admin", "layout");
  return { status: "success", message: "Profile updated." };
}
