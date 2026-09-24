import type { NewRow, Row, RowPatch, TableName } from "./types";

export type Where<K extends TableName> = Partial<{ [C in keyof Row<K>]: Row<K>[C] }>;

export interface QueryOptions<K extends TableName> {
  where?: Where<K>;
  orderBy?: { column: keyof Row<K> & string; ascending?: boolean };
  limit?: number;
  /** Rows with a non-null deleted_at are excluded unless this is true. */
  includeDeleted?: boolean;
}

/**
 * Minimal, typed table gateway. Both drivers implement exactly this surface,
 * so services never know which backend they run on.
 *
 * Search/aggregation is done in the service layer on top of `list`, which is
 * fine for agency-scale data (thousands of rows). Push filters down to SQL
 * in the Prisma driver if volumes grow well beyond that.
 */
export interface DataStore {
  readonly driver: "local" | "postgres";
  list<K extends TableName>(table: K, options?: QueryOptions<K>): Promise<Row<K>[]>;
  get<K extends TableName>(table: K, id: string): Promise<Row<K> | null>;
  findOne<K extends TableName>(table: K, where: Where<K>): Promise<Row<K> | null>;
  insert<K extends TableName>(table: K, row: NewRow<K>): Promise<Row<K>>;
  insertMany<K extends TableName>(table: K, rows: NewRow<K>[]): Promise<number>;
  update<K extends TableName>(table: K, id: string, patch: RowPatch<K>): Promise<Row<K>>;
  remove<K extends TableName>(table: K, id: string): Promise<void>;
  removeWhere<K extends TableName>(table: K, where: Where<K>): Promise<number>;
  count<K extends TableName>(table: K, where?: Where<K>): Promise<number>;
}

export class StoreError extends Error {
  constructor(
    message: string,
    readonly code: "not_found" | "conflict" | "unavailable" | "forbidden" | "unknown" = "unknown",
  ) {
    super(message);
    this.name = "StoreError";
  }
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function matchesWhere<K extends TableName>(row: Row<K>, where: Where<K> | undefined): boolean {
  if (!where) return true;
  for (const key of Object.keys(where) as (keyof Row<K>)[]) {
    if (row[key] !== where[key]) return false;
  }
  return true;
}

export function hasDeletedAt(row: object): row is { deleted_at: string | null } {
  return "deleted_at" in row;
}

export function sortRows<K extends TableName>(rows: Row<K>[], orderBy: QueryOptions<K>["orderBy"]): Row<K>[] {
  if (!orderBy) return rows;
  const { column, ascending = true } = orderBy;
  const dir = ascending ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = a[column] as unknown;
    const bv = b[column] as unknown;
    if (av === bv) return 0;
    if (av === null || av === undefined) return 1;
    if (bv === null || bv === undefined) return -1;
    if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
    return String(av).localeCompare(String(bv)) * dir;
  });
}
