import "server-only";

import { requireUser } from "@/lib/auth/session";
import { adminStore, type DataStore, type Where } from "@/lib/data";
import { buildContentRecords, buildDemoRecords } from "@/lib/data/seed";
import { DEMO_TABLES, type NewRow, type TableName } from "@/lib/data/types";

/**
 * Demo data management (§48/§84). Every demo row carries is_demo = true so it
 * can be removed in one action without touching real records.
 */

export type DemoTable = (typeof DEMO_TABLES)[number];
export type DemoCounts = Record<DemoTable, number>;

export interface DemoResult {
  ok: boolean;
  message: string;
  counts?: Partial<Record<TableName, number>>;
}

const CHUNK = 500;

async function insertChunked<K extends TableName>(store: DataStore, table: K, rows: NewRow<K>[]): Promise<number> {
  let n = 0;
  for (let i = 0; i < rows.length; i += CHUNK) n += await store.insertMany(table, rows.slice(i, i + CHUNK));
  return n;
}

function demoWhere<K extends DemoTable>(): Where<K> {
  // Every DEMO_TABLES row type has is_demo: boolean.
  return { is_demo: true } as Where<K>;
}

export async function demoCounts(): Promise<DemoCounts> {
  const store = await adminStore();
  const entries = await Promise.all(
    DEMO_TABLES.map(async (t) => {
      // includeDeleted so soft-deleted demo rows are counted (and removed) too.
      const rows = await store.list(t, { where: demoWhere<typeof t>(), includeDeleted: true });
      return [t, rows.length] as const;
    }),
  );
  return Object.fromEntries(entries) as DemoCounts;
}

export async function loadDemoData(): Promise<DemoResult> {
  await requireUser("demo:manage");
  const store = await adminStore();

  const existing = await store.list("leads", { where: { is_demo: true }, includeDeleted: true, limit: 1 });
  if (existing.length > 0) return { ok: false, message: "Demo data is already loaded." };

  // Spread demo records across the active team so owners/assignees look realistic.
  const assignees = (await store.list("profiles", { where: { active: true } })).map((p) => p.id);
  const demo = buildDemoRecords(assignees);

  // Case study slugs are unique; skip any that already exist (e.g. re-created by hand).
  const takenSlugs = new Set((await store.list("case_studies")).map((c) => c.slug));
  const caseStudies = demo.case_studies.filter((c) => !takenSlugs.has(c.slug));

  // Parents before children so foreign keys resolve.
  const counts: Partial<Record<TableName, number>> = {};
  counts.leads = await insertChunked(store, "leads", demo.leads);
  counts.lead_notes = await insertChunked(store, "lead_notes", demo.lead_notes);
  counts.lead_activities = await insertChunked(store, "lead_activities", demo.lead_activities);
  counts.audit_requests = await insertChunked(store, "audit_requests", demo.audit_requests);
  counts.audit_findings = await insertChunked(store, "audit_findings", demo.audit_findings);
  counts.contact_messages = await insertChunked(store, "contact_messages", demo.contact_messages);
  counts.bookings = await insertChunked(store, "bookings", demo.bookings);
  counts.testimonials = await insertChunked(store, "testimonials", demo.testimonials);
  counts.case_studies = await insertChunked(store, "case_studies", caseStudies);
  counts.analytics_events = await insertChunked(store, "analytics_events", demo.analytics_events);
  counts.notifications = await insertChunked(store, "notifications", demo.notifications);

  const total = Object.values(counts).reduce((a, b) => a + (b ?? 0), 0);
  return { ok: true, message: `Loaded ${total.toLocaleString("en-US")} demo records.`, counts };
}

export async function removeDemoData(): Promise<DemoResult> {
  await requireUser("demo:manage");
  const store = await adminStore();

  const [demoLeads, demoAudits] = await Promise.all([
    store.list("leads", { where: { is_demo: true }, includeDeleted: true }),
    store.list("audit_requests", { where: { is_demo: true }, includeDeleted: true }),
  ]);
  const leadIds = new Set(demoLeads.map((l) => l.id));
  const counts: Partial<Record<TableName, number>> = {};
  const add = (t: TableName, n: number) => (counts[t] = (counts[t] ?? 0) + n);

  // Children of demo parents (these tables have no is_demo flag of their own).
  for (const audit of demoAudits) add("audit_findings", await store.removeWhere("audit_findings", { audit_id: audit.id }));
  for (const lead of demoLeads) {
    add("lead_notes", await store.removeWhere("lead_notes", { lead_id: lead.id }));
    add("lead_activities", await store.removeWhere("lead_activities", { lead_id: lead.id }));
  }

  // Real rows that point at demo leads keep existing; Postgres sets lead_id null
  // (ON DELETE SET NULL). Mirror that for the local store.
  if (store.driver === "local" && leadIds.size) {
    for (const table of ["audit_requests", "contact_messages", "bookings"] as const) {
      const rows = await store.list(table, { where: { is_demo: false }, includeDeleted: true });
      for (const row of rows) if (row.lead_id && leadIds.has(row.lead_id)) await store.update(table, row.id, { lead_id: null });
    }
  }

  // Flagged rows, children before parents.
  const order: DemoTable[] = [
    "notifications",
    "analytics_events",
    "utm_sessions",
    "bookings",
    "contact_messages",
    "audit_requests",
    "case_studies",
    "testimonials",
    "blog_posts",
    "leads",
  ];
  for (const table of order) {
    if (table === "testimonials" && store.driver === "local") {
      // Unlink demo testimonials from any real case study (FK is SET NULL in Postgres).
      const demoTestimonials = new Set((await store.list("testimonials", { where: { is_demo: true } })).map((t) => t.id));
      const linked = (await store.list("case_studies")).filter((c) => c.testimonial_id && demoTestimonials.has(c.testimonial_id));
      for (const c of linked) await store.update("case_studies", c.id, { testimonial_id: null });
    }
    add(table, await store.removeWhere(table, demoWhere<typeof table>()));
  }

  const total = Object.values(counts).reduce((a, b) => a + (b ?? 0), 0);
  return {
    ok: true,
    message: total ? `Removed ${total.toLocaleString("en-US")} demo records.` : "There was no demo data to remove.",
    counts,
  };
}

/**
 * Install starter content (services, industries, pricing, blog categories and
 * posts, site settings) into tables that are still empty. Used once on a
 * fresh database; never overwrites edited content.
 */
export async function ensureStarterContent(): Promise<DemoResult> {
  await requireUser("demo:manage");
  const store = await adminStore();
  const content = buildContentRecords();
  const counts: Partial<Record<TableName, number>> = {};

  const isEmpty = async (t: TableName) => (await store.count(t)) === 0;

  if (await isEmpty("services")) counts.services = await store.insertMany("services", content.services);
  if (await isEmpty("industries")) counts.industries = await store.insertMany("industries", content.industries);
  if (await isEmpty("pricing_plans")) counts.pricing_plans = await store.insertMany("pricing_plans", content.pricing_plans);
  if (await isEmpty("blog_categories")) counts.blog_categories = await store.insertMany("blog_categories", content.blog_categories);

  if (await isEmpty("blog_posts")) {
    // Map starter category ids onto whatever categories exist now (matched by slug).
    const existing = await store.list("blog_categories");
    const bySlug = new Map(existing.map((c) => [c.slug, c.id]));
    const starterSlug = new Map(content.blog_categories.map((c) => [c.id, c.slug]));
    const posts = content.blog_posts.map((p) => ({
      ...p,
      category_id: p.category_id ? (bySlug.get(starterSlug.get(p.category_id) ?? "") ?? null) : null,
    }));
    counts.blog_posts = await store.insertMany("blog_posts", posts);
  }

  if (!(await store.findOne("site_settings", { key: "site" }))) counts.site_settings = await store.insertMany("site_settings", content.site_settings);

  const total = Object.values(counts).reduce((a, b) => a + (b ?? 0), 0);
  return {
    ok: true,
    message: total ? `Installed ${total} starter records.` : "Starter content is already installed. Nothing was changed.",
    counts,
  };
}
