import "server-only";

import { z } from "zod";

import type { SessionUser } from "@/lib/auth/session";
import { StoreError } from "@/lib/data";
import type { ActionState } from "@/lib/data/types";
import type { Actor } from "@/lib/services/admin/leads";

/** Record ids are UUIDs in both drivers; reject anything else before touching the store. */
export const idSchema = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, "Invalid id.");

export function actorOf(user: SessionUser): Actor {
  return { id: user.id, name: user.name };
}

export function ok<T = undefined>(message: string, data?: T): ActionState<T> {
  return { status: "success", message, data };
}

export function invalid(message = "Check the highlighted fields.", fieldErrors?: Record<string, string[] | undefined>): ActionState<never> {
  return { status: "error", message, fieldErrors };
}

/** Map any thrown error to a friendly message; never leak raw store/DB errors. */
export function failure(error: unknown, fallback = "Something went wrong. Try again."): ActionState<never> {
  if (error instanceof StoreError && error.code === "not_found") return { status: "error", message: "That record no longer exists. Refresh the page." };
  if (error instanceof StoreError && error.code === "forbidden") return { status: "error", message: "You don't have permission to do that." };
  console.error("[admin action]", error instanceof Error ? error.message : error);
  return { status: "error", message: fallback };
}
