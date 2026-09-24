import "server-only";

import { adminStore, StoreError } from "@/lib/data";
import type { NewRow, Row, RowPatch } from "@/lib/data/types";

/**
 * CMS data access for the admin. Callers (server actions / pages) have
 * already run requireUser(); the database has no row-level policies.
 */
export type CmsTable = "blog_posts" | "blog_categories" | "case_studies" | "testimonials" | "services" | "pricing_plans" | "industries";
type SlugTable = "blog_posts" | "case_studies" | "pricing_plans" | "blog_categories";

/** Thrown when a slug is already used by another row of the same table. */
export class SlugTakenError extends Error {
  constructor(readonly slug: string) {
    super(`The slug "${slug}" is already in use.`);
    this.name = "SlugTakenError";
  }
}

export async function cmsList<K extends CmsTable>(table: K, orderBy?: keyof Row<K> & string, ascending = false): Promise<Row<K>[]> {
  const store = await adminStore();
  return store.list(table, orderBy ? { orderBy: { column: orderBy, ascending } } : undefined);
}

export async function cmsGet<K extends CmsTable>(table: K, id: string): Promise<Row<K> | null> {
  // Ids from the URL may be garbage; Postgres would reject a non-uuid with an error.
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const store = await adminStore();
  return store.get(table, id);
}

export async function assertUniqueSlug(table: SlugTable, slug: string, excludeId?: string): Promise<void> {
  const store = await adminStore();
  const rows = await store.list(table);
  if (rows.some((r) => r.slug === slug && r.id !== excludeId)) throw new SlugTakenError(slug);
}

export async function cmsCreate<K extends CmsTable>(table: K, row: NewRow<K>): Promise<Row<K>> {
  const store = await adminStore();
  return store.insert(table, row);
}

export async function cmsUpdate<K extends CmsTable>(table: K, id: string, patch: RowPatch<K>): Promise<Row<K>> {
  const store = await adminStore();
  return store.update(table, id, patch);
}

export async function cmsDelete(table: CmsTable, id: string): Promise<void> {
  const store = await adminStore();
  if (table === "testimonials") {
    // The FK is ON DELETE SET NULL in Postgres; mirror it for the local store.
    const linked = await store.list("case_studies", { where: { testimonial_id: id } });
    await Promise.all(linked.map((c) => store.update("case_studies", c.id, { testimonial_id: null })));
  }
  await store.remove(table, id);
}

/** Friendly message for anything a store might throw. Never leaks DB detail. */
export function cmsErrorMessage(error: unknown): string {
  if (error instanceof SlugTakenError) return error.message;
  if (error instanceof StoreError) {
    if (error.code === "forbidden") return "You don't have permission to change this content.";
    if (error.code === "not_found") return "That item no longer exists. It may have been deleted.";
    if (error.code === "conflict") return "That slug is already in use. Choose another.";
  }
  return "Something went wrong while saving. Try again.";
}
