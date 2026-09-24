import "server-only";

import type { DataStore } from "./store";

/**
 * Store access. With DATABASE_URL set, everything runs on PostgreSQL through
 * Prisma (lib/data/prisma-store.ts). Without it, the local JSON demo store is
 * used so the site still runs out of the box.
 *
 * The three accessors document intent at each call site; authorisation is
 * enforced in the app (requireUser / can, and explicit status filters for
 * public content), not by the database.
 *
 * - publicStore():  public pages — callers filter to published/active content
 * - adminStore():   signed-in admin pages and actions (after requireUser)
 * - serviceStore(): validated public submissions and webhooks
 */
export const dataDriver: "local" | "postgres" = process.env.DATABASE_URL ? "postgres" : "local";

async function store(): Promise<DataStore> {
  if (dataDriver === "postgres") return (await import("./prisma-store")).prismaStore;
  return (await import("./local-store")).localStore;
}

export const publicStore = store;
export const adminStore = store;
export const serviceStore = store;

export { StoreError } from "./store";
export type { DataStore, QueryOptions, Where } from "./store";
