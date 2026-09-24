/*
 * Applies pending SQL migrations from prisma/migrations using plain `pg`, and
 * records them in `_prisma_migrations` exactly like `prisma migrate deploy`
 * (same table, same SHA-256 checksum). Use it where Prisma's schema-engine
 * binary can't run (e.g. Windows Application Control); on a normal server,
 * `pnpm db:deploy` (prisma migrate deploy) does the same and both interoperate.
 *
 *   pnpm db:apply
 */
import "dotenv/config";

import { createHash, randomUUID } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import pg from "pg";

import { pgConfig } from "../lib/db/pg-config";

const dir = path.join(process.cwd(), "prisma", "migrations");

async function main() {
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const client = new pg.Client(pgConfig(url));
  await client.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
        "id"                  VARCHAR(36) PRIMARY KEY NOT NULL,
        "checksum"            VARCHAR(64) NOT NULL,
        "finished_at"         TIMESTAMPTZ,
        "migration_name"      VARCHAR(255) NOT NULL,
        "logs"                TEXT,
        "rolled_back_at"      TIMESTAMPTZ,
        "started_at"          TIMESTAMPTZ NOT NULL DEFAULT now(),
        "applied_steps_count" INTEGER NOT NULL DEFAULT 0
      )`);
    const { rows } = await client.query<{ migration_name: string }>(
      `SELECT migration_name FROM "_prisma_migrations" WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL`,
    );
    const applied = new Set(rows.map((r) => r.migration_name));

    const names = readdirSync(dir)
      .filter((n) => statSync(path.join(dir, n)).isDirectory())
      .sort();

    let count = 0;
    for (const name of names) {
      if (applied.has(name)) continue;
      const sql = readFileSync(path.join(dir, name, "migration.sql"));
      const checksum = createHash("sha256").update(sql).digest("hex");
      const id = randomUUID();
      process.stdout.write(`Applying ${name} … `);
      await client.query("BEGIN");
      try {
        await client.query(`INSERT INTO "_prisma_migrations" (id, checksum, migration_name, started_at) VALUES ($1, $2, $3, now())`, [id, checksum, name]);
        await client.query(sql.toString("utf8"));
        await client.query(`UPDATE "_prisma_migrations" SET finished_at = now(), applied_steps_count = 1 WHERE id = $1`, [id]);
        await client.query("COMMIT");
        count++;
        console.log("done");
      } catch (err) {
        await client.query("ROLLBACK");
        console.log("failed");
        throw err;
      }
    }
    console.log(count ? `${count} migration(s) applied.` : "Database is up to date.");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
