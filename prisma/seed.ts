/*
 * Seeds the PostgreSQL database with everything the site needs.
 *
 *   pnpm db:seed            # safe to re-run: only fills what's missing
 *   pnpm db:seed --reset    # wipes ALL data first (asks for RESET=yes)
 *
 * 1. Admin account: ADMIN_EMAIL / ADMIN_PASSWORD (role admin, active).
 *    If the account exists, its password is left alone unless ADMIN_PASSWORD_RESET=true.
 * 2. Starter content: services, industries, pricing, blog categories + posts,
 *    site settings — into empty tables only (never overwrites edits).
 * 3. Demo data (is_demo = true): leads, notes, activity, audits, findings,
 *    messages, bookings, testimonials, case studies, analytics, notifications
 *    and two demo team members — once. Remove it any time in
 *    Admin → Settings → Data. Skip with SEED_DEMO=false.
 *
 * Runs through the same DataStore the app uses (lib/data/prisma-store.ts).
 */
import "dotenv/config";

import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";
import { prismaStore as store } from "@/lib/data/prisma-store";
import { buildContentRecords, buildDemoRecords } from "@/lib/data/seed";
import type { NewRow, Profile, TableName } from "@/lib/data/types";

const ALL_TABLES: string[] = [
  "notifications",
  "analytics_events",
  "utm_sessions",
  "audit_findings",
  "audit_requests",
  "lead_activities",
  "lead_notes",
  "contact_messages",
  "bookings",
  "leads",
  "case_studies",
  "testimonials",
  "blog_posts",
  "blog_categories",
  "services",
  "industries",
  "pricing_plans",
  "media",
  "site_settings",
  "password_reset_tokens",
  "admin_credentials",
  "profiles",
];

async function insertChunked<K extends TableName>(table: K, rows: NewRow<K>[]): Promise<number> {
  let n = 0;
  for (let i = 0; i < rows.length; i += 200) n += await store.insertMany(table, rows.slice(i, i + 200));
  return n;
}

async function reset() {
  if (process.env.RESET !== "yes") {
    console.error("Refusing to wipe the database. Re-run with RESET=yes pnpm db:seed --reset");
    process.exit(1);
  }
  await prisma().$executeRawUnsafe(`TRUNCATE TABLE ${ALL_TABLES.map((t) => `"${t}"`).join(", ")} CASCADE`);
  console.log("• All tables emptied.");
}

async function seedAdmin(): Promise<string> {
  const email = (process.env.ADMIN_EMAIL || process.env.DEMO_ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  const name = process.env.ADMIN_NAME || "Studio Admin";
  if (!email) throw new Error("Set ADMIN_EMAIL (and ADMIN_PASSWORD) to create the first admin account.");

  const db = prisma();
  const existing = await db.profile.findUnique({ where: { email }, include: { credential: true } });
  if (existing) {
    await db.profile.update({ where: { id: existing.id }, data: { role: "admin", active: true } });
    if (password && (!existing.credential || process.env.ADMIN_PASSWORD_RESET === "true")) {
      const password_hash = await hashPassword(password);
      await db.adminCredential.upsert({ where: { profile_id: existing.id }, create: { profile_id: existing.id, password_hash }, update: { password_hash } });
      console.log(`• Admin ${email}: password set.`);
    } else {
      console.log(`• Admin ${email}: already exists (password unchanged).`);
    }
    return existing.id;
  }

  if (password.length < 10) throw new Error("ADMIN_PASSWORD must be at least 10 characters.");
  const profile = await db.profile.create({ data: { email, full_name: name, role: "admin", active: true } });
  await db.adminCredential.create({ data: { profile_id: profile.id, password_hash: await hashPassword(password) } });
  console.log(`• Admin ${email}: created.`);
  return profile.id;
}

async function seedContent() {
  const content = buildContentRecords();
  const order: TableName[] = ["services", "industries", "pricing_plans", "blog_categories", "blog_posts", "site_settings"];
  for (const table of order) {
    if ((await store.count(table)) > 0) {
      console.log(`• ${table}: has data, skipped.`);
      continue;
    }
    const rows = content[table as keyof typeof content] as NewRow<typeof table>[];
    console.log(`• ${table}: ${await insertChunked(table, rows)} rows.`);
  }
}

async function seedDemo(adminId: string) {
  if (process.env.SEED_DEMO === "false") return console.log("• Demo data: skipped (SEED_DEMO=false).");
  if ((await store.count("leads", { is_demo: true })) > 0) return console.log("• Demo data: already loaded, skipped.");

  // Two clearly-labelled demo team members (no password, so they can't sign in).
  const team: NewRow<"profiles">[] = [
    { email: "strategist@example.com", full_name: "Alex Morgan (Demo)", role: "manager", avatar_url: null, active: true },
    { email: "analyst@example.com", full_name: "Robin Ashby (Demo)", role: "staff", avatar_url: null, active: true },
  ];
  const teamIds: string[] = [adminId];
  for (const p of team) {
    const found = (await store.findOne("profiles", { email: p.email })) as Profile | null;
    teamIds.push(found ? found.id : (await store.insert("profiles", p)).id);
  }

  const demo = buildDemoRecords(teamIds);
  const takenSlugs = new Set((await store.list("case_studies")).map((c) => c.slug));

  // Parents before children so foreign keys resolve.
  const steps: [TableName, NewRow<TableName>[]][] = [
    ["leads", demo.leads],
    ["lead_notes", demo.lead_notes],
    ["lead_activities", demo.lead_activities],
    ["audit_requests", demo.audit_requests],
    ["audit_findings", demo.audit_findings],
    ["contact_messages", demo.contact_messages],
    ["bookings", demo.bookings],
    ["testimonials", demo.testimonials],
    ["case_studies", demo.case_studies.filter((c) => !takenSlugs.has(c.slug))],
    ["analytics_events", demo.analytics_events],
    ["notifications", demo.notifications],
  ];
  for (const [table, rows] of steps) console.log(`• ${table} (demo): ${await insertChunked(table, rows)} rows.`);
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set.");
  if (process.argv.includes("--reset")) await reset();
  const adminId = await seedAdmin();
  await seedContent();
  await seedDemo(adminId);
  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => prisma().$disconnect());
