import type { PoolConfig } from "pg";

/*
 * node-postgres connection settings shared by the app (lib/db/prisma.ts) and
 * the CLI scripts. Works for any Postgres host: Supabase, RDS, Neon, a VPS.
 *
 * DATABASE_SSL:
 *   require (default) — encrypted, certificate not verified (Supabase/RDS pooled)
 *   verify            — encrypted and verified; set DATABASE_CA_CERT (PEM) if the
 *                       server uses a private CA (e.g. the RDS bundle)
 *   disable           — plain TCP, e.g. Postgres on the same VPS/private network
 */
export type SslMode = "require" | "verify" | "disable";

export function sslMode(): SslMode {
  const v = (process.env.DATABASE_SSL || "require").toLowerCase();
  return v === "disable" || v === "verify" ? v : "require";
}

/** Strips Prisma-engine-only URL params (pgbouncer, connection_limit…) that `pg` doesn't understand. */
export function cleanConnectionString(url: string): string {
  const u = new URL(url);
  for (const p of ["pgbouncer", "connection_limit", "pool_timeout", "schema", "sslmode", "sslaccept"]) u.searchParams.delete(p);
  return u.toString();
}

export function pgConfig(url: string | undefined, overrides: PoolConfig = {}): PoolConfig {
  if (!url) throw new Error("DATABASE_URL is not set.");
  const mode = sslMode();
  const ca = process.env.DATABASE_CA_CERT?.replace(/\\n/g, "\n");
  return {
    connectionString: cleanConnectionString(url),
    ssl: mode === "disable" ? false : mode === "verify" ? { rejectUnauthorized: true, ...(ca ? { ca } : {}) } : { rejectUnauthorized: false },
    max: Number(process.env.DATABASE_POOL_MAX) || 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    ...overrides,
  };
}
