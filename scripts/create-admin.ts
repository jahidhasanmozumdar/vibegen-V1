/*
 * Create (or re-activate) an admin-panel user.
 *
 *   pnpm admin:create <email> "<Full Name>" [admin|manager|staff]
 *
 * The password comes from NEW_USER_PASSWORD, or a strong one is generated and
 * printed once. The user can change it later via "Forgot password".
 */
import "dotenv/config";

import { randomBytes } from "node:crypto";

import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";

const ROLES = ["admin", "manager", "staff"] as const;

async function main() {
  const [emailArg, nameArg, roleArg = "staff"] = process.argv.slice(2);
  const email = (emailArg || "").trim().toLowerCase();
  if (!email || !email.includes("@")) throw new Error('Usage: pnpm admin:create <email> "<Full Name>" [admin|manager|staff]');
  if (!ROLES.includes(roleArg as (typeof ROLES)[number])) throw new Error(`Role must be one of: ${ROLES.join(", ")}`);

  const generated = !process.env.NEW_USER_PASSWORD;
  const password = process.env.NEW_USER_PASSWORD || randomBytes(15).toString("base64url");
  if (password.length < 10) throw new Error("NEW_USER_PASSWORD must be at least 10 characters.");

  const db = prisma();
  const profile = await db.profile.upsert({
    where: { email },
    create: { email, full_name: nameArg || email, role: roleArg, active: true },
    update: { role: roleArg, active: true, ...(nameArg ? { full_name: nameArg } : {}) },
  });
  const password_hash = await hashPassword(password);
  await db.adminCredential.upsert({ where: { profile_id: profile.id }, create: { profile_id: profile.id, password_hash }, update: { password_hash } });

  console.log(`✓ ${email} (${roleArg}) can now sign in at /admin/login.`);
  if (generated) console.log(`  Temporary password (shown once): ${password}`);
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => prisma().$disconnect());
