"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import type { ActionState } from "@/lib/data/types";
import { ensureStarterContent, loadDemoData, removeDemoData, type DemoResult } from "@/lib/services/admin/demo";

function toState(result: DemoResult): ActionState {
  return { status: result.ok ? "success" : "error", message: result.message };
}

async function run(fn: () => Promise<DemoResult>): Promise<ActionState> {
  await requireUser("demo:manage");
  try {
    const result = await fn();
    // Demo records feed every admin screen and the public case studies / blog.
    revalidatePath("/", "layout");
    return toState(result);
  } catch (error) {
    console.error("[demo]", error instanceof Error ? error.message : error);
    return { status: "error", message: "Something went wrong. Part of the operation may have completed — check the counts and try again." };
  }
}

export async function loadDemoDataAction(): Promise<ActionState> {
  return run(loadDemoData);
}

export async function removeDemoDataAction(): Promise<ActionState> {
  return run(removeDemoData);
}

export async function installStarterContentAction(): Promise<ActionState> {
  return run(ensureStarterContent);
}
