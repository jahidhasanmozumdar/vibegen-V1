import "dotenv/config";

import { defineConfig } from "prisma/config";

/*
 * Prisma CLI config (Prisma ORM 7). The app itself connects with
 * @prisma/adapter-pg (lib/db/prisma.ts) using DATABASE_URL; the CLI
 * (migrate, seed, studio) uses DIRECT_URL, a non-pooled connection, because
 * migrations need session-level features a transaction pooler doesn't offer.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx --conditions=react-server prisma/seed.ts",
  },
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || "",
  },
});
