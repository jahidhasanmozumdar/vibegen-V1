import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/lib/generated/prisma/client";

import { pgConfig } from "./pg-config";

/*
 * One PrismaClient per server process (kept on globalThis so dev hot-reload
 * doesn't open a new pool on every edit). Runtime traffic uses DATABASE_URL,
 * which may be a transaction pooler (Supabase :6543, PgBouncer, RDS Proxy).
 */
const g = globalThis as unknown as { __vgPrisma?: PrismaClient };

export function prisma(): PrismaClient {
  if (!g.__vgPrisma) {
    const adapter = new PrismaPg(pgConfig(process.env.DATABASE_URL));
    g.__vgPrisma = new PrismaClient({ adapter });
  }
  return g.__vgPrisma;
}

export const isDatabaseConfigured = Boolean(process.env.DATABASE_URL);
