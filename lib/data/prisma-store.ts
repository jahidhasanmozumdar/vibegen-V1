import "server-only";

import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

import { type DataStore, type QueryOptions, type Where, StoreError } from "./store";
import type { NewRow, Row, RowPatch, TableName } from "./types";

/*
 * PostgreSQL driver (Prisma ORM 7 + @prisma/adapter-pg).
 *
 * Prisma model fields are the SQL column names, so rows map 1:1 to
 * lib/data/types.ts. The only conversions are at the edges:
 *   reads:  Date → ISO string (types.ts uses ISO strings everywhere)
 *   writes: null in a nullable JSON column → Prisma.DbNull
 * Authorisation lives in the app (requireUser / can) — there is no RLS.
 */

const SOFT_DELETE_TABLES = new Set<TableName>(["leads", "audit_requests", "contact_messages", "bookings"]);

/** Table name → Prisma client delegate property. */
const DELEGATES: Record<TableName, string> = {
  profiles: "profile",
  leads: "lead",
  lead_notes: "leadNote",
  lead_activities: "leadActivity",
  audit_requests: "auditRequest",
  audit_findings: "auditFinding",
  contact_messages: "contactMessage",
  bookings: "booking",
  case_studies: "caseStudy",
  testimonials: "testimonial",
  services: "service",
  pricing_plans: "pricingPlan",
  industries: "industry",
  blog_posts: "blogPost",
  blog_categories: "blogCategory",
  media: "media",
  utm_sessions: "utmSession",
  analytics_events: "analyticsEvent",
  site_settings: "siteSetting",
  notifications: "notification",
};

/** Nullable JSON columns: a plain `null` must be sent as Prisma.DbNull. */
const NULLABLE_JSON: Partial<Record<TableName, string[]>> = {
  leads: ["attribution"],
  contact_messages: ["attribution"],
};

type Args = Record<string, unknown>;
interface Delegate {
  findMany(args?: Args): Promise<Args[]>;
  findFirst(args?: Args): Promise<Args | null>;
  findUnique(args: Args): Promise<Args | null>;
  create(args: Args): Promise<Args>;
  createMany(args: Args): Promise<{ count: number }>;
  update(args: Args): Promise<Args>;
  deleteMany(args?: Args): Promise<{ count: number }>;
  count(args?: Args): Promise<number>;
}

function delegate(table: TableName): Delegate {
  return (prisma() as unknown as Record<string, Delegate>)[DELEGATES[table]];
}

function fromDb<K extends TableName>(row: Args): Row<K> {
  const out: Args = {};
  for (const [k, v] of Object.entries(row)) out[k] = v instanceof Date ? v.toISOString() : v;
  return out as unknown as Row<K>;
}

function toDb(table: TableName, data: object): Args {
  const out: Args = {};
  const jsonNullable = NULLABLE_JSON[table] ?? [];
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined) continue;
    out[k] = v === null && jsonNullable.includes(k) ? Prisma.DbNull : v;
  }
  return out;
}

function whereOf(table: TableName, where: object | undefined, includeDeleted = false): Args {
  const w: Args = {};
  for (const [k, v] of Object.entries(where ?? {})) if (v !== undefined) w[k] = v;
  if (!includeDeleted && SOFT_DELETE_TABLES.has(table) && !("deleted_at" in w)) w.deleted_at = null;
  return w;
}

function fail(context: string, err: unknown): never {
  if (err instanceof StoreError) throw err;
  const code = err instanceof Prisma.PrismaClientKnownRequestError ? err.code : undefined;
  console.error(`[db] ${context}:`, code ?? "", err instanceof Error ? err.message.split("\n").slice(-1)[0] : err);
  if (code === "P2002") throw new StoreError("That record already exists.", "conflict");
  if (code === "P2025") throw new StoreError("Record not found.", "not_found");
  if (code === "P2003") throw new StoreError("That record is linked to something that doesn't exist.", "conflict");
  throw new StoreError("The database request failed.", "unavailable");
}

export const prismaStore: DataStore = {
  driver: "postgres",

  async list<K extends TableName>(table: K, options: QueryOptions<K> = {}): Promise<Row<K>[]> {
    try {
      const rows = await delegate(table).findMany({
        where: whereOf(table, options.where, options.includeDeleted),
        ...(options.orderBy ? { orderBy: { [options.orderBy.column]: options.orderBy.ascending === false ? "desc" : "asc" } } : {}),
        ...(options.limit !== undefined ? { take: options.limit } : {}),
      });
      return rows.map((r) => fromDb<K>(r));
    } catch (err) {
      fail(`list ${table}`, err);
    }
  },

  async get<K extends TableName>(table: K, id: string): Promise<Row<K> | null> {
    try {
      const row = await delegate(table).findUnique({ where: { id } });
      return row ? fromDb<K>(row) : null;
    } catch (err) {
      // A malformed UUID is simply "not found", not a server error.
      if (err instanceof Prisma.PrismaClientKnownRequestError && /uuid/i.test(err.message)) return null;
      fail(`get ${table}`, err);
    }
  },

  async findOne<K extends TableName>(table: K, where: Where<K>): Promise<Row<K> | null> {
    try {
      const row = await delegate(table).findFirst({ where: whereOf(table, where, true) });
      return row ? fromDb<K>(row) : null;
    } catch (err) {
      fail(`findOne ${table}`, err);
    }
  },

  async insert<K extends TableName>(table: K, row: NewRow<K>): Promise<Row<K>> {
    try {
      return fromDb<K>(await delegate(table).create({ data: toDb(table, row) }));
    } catch (err) {
      fail(`insert ${table}`, err);
    }
  },

  async insertMany<K extends TableName>(table: K, rows: NewRow<K>[]): Promise<number> {
    if (rows.length === 0) return 0;
    try {
      const { count } = await delegate(table).createMany({ data: rows.map((r) => toDb(table, r)) });
      return count;
    } catch (err) {
      fail(`insertMany ${table}`, err);
    }
  },

  async update<K extends TableName>(table: K, id: string, patch: RowPatch<K>): Promise<Row<K>> {
    try {
      return fromDb<K>(await delegate(table).update({ where: { id }, data: { ...toDb(table, patch), updated_at: new Date() } }));
    } catch (err) {
      fail(`update ${table}`, err);
    }
  },

  async remove<K extends TableName>(table: K, id: string): Promise<void> {
    try {
      await delegate(table).deleteMany({ where: { id } });
    } catch (err) {
      fail(`remove ${table}`, err);
    }
  },

  async removeWhere<K extends TableName>(table: K, where: Where<K>): Promise<number> {
    try {
      const { count } = await delegate(table).deleteMany({ where: whereOf(table, where, true) });
      return count;
    } catch (err) {
      fail(`removeWhere ${table}`, err);
    }
  },

  async count<K extends TableName>(table: K, where?: Where<K>): Promise<number> {
    try {
      return await delegate(table).count({ where: whereOf(table, where) });
    } catch (err) {
      fail(`count ${table}`, err);
    }
  },
};
