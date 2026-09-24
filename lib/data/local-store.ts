import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { serverEnv } from "@/lib/config/server-env";
import {
  type DataStore,
  type QueryOptions,
  type Where,
  StoreError,
  hasDeletedAt,
  matchesWhere,
  nowIso,
  sortRows,
} from "./store";
import type { NewRow, Row, RowPatch, TableMap, TableName } from "./types";

type Database = { [K in TableName]: Row<K>[] };

const TABLES: TableName[] = [
  "profiles",
  "leads",
  "lead_notes",
  "lead_activities",
  "audit_requests",
  "audit_findings",
  "contact_messages",
  "bookings",
  "case_studies",
  "testimonials",
  "services",
  "pricing_plans",
  "industries",
  "blog_posts",
  "blog_categories",
  "media",
  "utm_sessions",
  "analytics_events",
  "site_settings",
  "notifications",
];

function emptyDatabase(): Database {
  const db = {} as Record<TableName, unknown[]>;
  for (const t of TABLES) db[t] = [];
  return db as Database;
}

/**
 * File-backed JSON store for local development and demos.
 *
 * - Survives restarts (writes to LOCAL_DATA_FILE, default .data/vibegen-db.json)
 * - Seeds itself with starter content + demo records on first run
 * - Writes are serialised through a promise chain so concurrent requests
 *   in one Node process can't interleave.
 *
 * Not for production: serverless platforms have ephemeral file systems.
 * Set DATABASE_URL (PostgreSQL) for any deployed environment.
 */
interface LocalState {
  db: Database | null;
  loading: Promise<Database> | null;
  writeChain: Promise<void>;
}

const globalKey = Symbol.for("vibegen.localStore");
const g = globalThis as unknown as Record<symbol, LocalState | undefined>;
const state: LocalState = (g[globalKey] ??= { db: null, loading: null, writeChain: Promise.resolve() });

function filePath(): string {
  // Statically scoped to .data/ so the bundler doesn't trace the whole project.
  return path.join(process.cwd(), ".data", path.basename(serverEnv().localDataFile));
}

async function load(): Promise<Database> {
  if (state.db) return state.db;
  if (state.loading) return state.loading;

  state.loading = (async () => {
    const file = filePath();
    try {
      const parsed = await readJsonWithRetry(file);
      const db = emptyDatabase();
      for (const t of TABLES) {
        const rows = parsed[t];
        if (Array.isArray(rows)) (db as Record<TableName, unknown[]>)[t] = rows;
      }
      state.db = db;
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== "ENOENT") throw new StoreError("Local data file is unreadable.", "unavailable");
      const { buildSeedDatabase } = await import("./seed");
      state.db = buildSeedDatabase() as Database;
      await persist(state.db);
    }
    return state.db;
  })();

  try {
    return await state.loading;
  } finally {
    state.loading = null;
  }
}

/**
 * Another process (e.g. a dev worker) may be mid-replace of the file; on
 * Windows the rename isn't atomic for readers. Retry briefly on a partial read.
 */
async function readJsonWithRetry(file: string, attempts = 4): Promise<Partial<Database>> {
  for (let i = 1; ; i++) {
    const raw = await fs.readFile(file, "utf8");
    try {
      return JSON.parse(raw) as Partial<Database>;
    } catch (error) {
      if (i >= attempts) throw new StoreError("Local data file is unreadable.", "unavailable");
      void error;
      await new Promise((resolve) => setTimeout(resolve, 40 * i));
    }
  }
}

async function persist(db: Database): Promise<void> {
  const file = filePath();
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db), "utf8");
  await fs.rename(tmp, file);
}

async function mutate<T>(fn: (db: Database) => T): Promise<T> {
  const run = state.writeChain.then(async () => {
    const db = await load();
    const result = fn(db);
    await persist(db);
    return result;
  });
  state.writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function table<K extends TableName>(db: Database, name: K): Row<K>[] {
  return db[name] as Row<K>[];
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

export const localStore: DataStore = {
  driver: "local",

  async list<K extends TableName>(name: K, options: QueryOptions<K> = {}): Promise<Row<K>[]> {
    const db = await load();
    let rows = table(db, name).filter((row) => matchesWhere(row, options.where));
    if (!options.includeDeleted) rows = rows.filter((r) => !hasDeletedAt(r) || r.deleted_at === null);
    rows = sortRows(rows, options.orderBy);
    if (options.limit !== undefined) rows = rows.slice(0, options.limit);
    return clone(rows);
  },

  async get<K extends TableName>(name: K, id: string): Promise<Row<K> | null> {
    const db = await load();
    const row = table(db, name).find((r) => r.id === id);
    return row ? clone(row) : null;
  },

  async findOne<K extends TableName>(name: K, where: Where<K>): Promise<Row<K> | null> {
    const db = await load();
    const row = table(db, name).find((r) => matchesWhere(r, where));
    return row ? clone(row) : null;
  },

  async insert<K extends TableName>(name: K, input: NewRow<K>): Promise<Row<K>> {
    return mutate((db) => {
      const ts = nowIso();
      const row = { id: randomUUID(), created_at: ts, updated_at: ts, ...input } as Row<K>;
      const rows = table(db, name);
      if (rows.some((r) => r.id === row.id)) throw new StoreError("Duplicate id.", "conflict");
      rows.push(row);
      return clone(row);
    });
  },

  async insertMany<K extends TableName>(name: K, inputs: NewRow<K>[]): Promise<number> {
    return mutate((db) => {
      const ts = nowIso();
      const rows = table(db, name);
      for (const input of inputs) rows.push({ id: randomUUID(), created_at: ts, updated_at: ts, ...input } as Row<K>);
      return inputs.length;
    });
  },

  async update<K extends TableName>(name: K, id: string, patch: RowPatch<K>): Promise<Row<K>> {
    return mutate((db) => {
      const rows = table(db, name);
      const index = rows.findIndex((r) => r.id === id);
      if (index === -1) throw new StoreError("Record not found.", "not_found");
      const next = { ...rows[index], ...patch, id, updated_at: nowIso() } as Row<K>;
      rows[index] = next;
      return clone(next);
    });
  },

  async remove<K extends TableName>(name: K, id: string): Promise<void> {
    await mutate((db) => {
      const rows = table(db, name);
      const index = rows.findIndex((r) => r.id === id);
      if (index !== -1) rows.splice(index, 1);
    });
  },

  async removeWhere<K extends TableName>(name: K, where: Where<K>): Promise<number> {
    return mutate((db) => {
      const rows = table(db, name);
      const keep = rows.filter((r) => !matchesWhere(r, where));
      const removed = rows.length - keep.length;
      (db as Record<TableName, unknown[]>)[name] = keep;
      return removed;
    });
  },

  async count<K extends TableName>(name: K, where?: Where<K>): Promise<number> {
    const db = await load();
    return table(db, name).filter((r) => matchesWhere(r, where) && (!hasDeletedAt(r) || r.deleted_at === null)).length;
  },
};

/** Test/dev helper: drop the cached database so the next read reloads from disk. */
export function resetLocalCache(): void {
  state.db = null;
}

export type { TableMap };
