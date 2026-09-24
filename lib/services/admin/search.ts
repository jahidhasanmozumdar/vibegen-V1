import "server-only";

import { adminStore } from "@/lib/data";

export interface SearchResult {
  type: "lead" | "audit" | "message" | "case_study" | "blog";
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

export const searchTypeLabels: Record<SearchResult["type"], string> = {
  lead: "Leads",
  audit: "Audits",
  message: "Messages",
  case_study: "Case studies",
  blog: "Blog",
};

function matches(q: string, ...fields: (string | null | undefined)[]): boolean {
  return fields.some((f) => f?.toLowerCase().includes(q));
}

/** Global admin search across the main record types. Caller must be authenticated. */
export async function globalSearch(query: string, perType = 5): Promise<SearchResult[]> {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const store = await adminStore();

  const [leads, audits, messages, cases, posts] = await Promise.all([
    store.list("leads", { orderBy: { column: "created_at", ascending: false } }),
    store.list("audit_requests", { orderBy: { column: "created_at", ascending: false } }),
    store.list("contact_messages", { orderBy: { column: "created_at", ascending: false } }),
    store.list("case_studies", { orderBy: { column: "created_at", ascending: false } }),
    store.list("blog_posts", { orderBy: { column: "created_at", ascending: false } }),
  ]);

  return [
    ...leads
      .filter((l) => matches(q, l.full_name, l.email, l.company, l.website))
      .slice(0, perType)
      .map((l) => ({ type: "lead" as const, id: l.id, title: l.full_name, subtitle: [l.company, l.email].filter(Boolean).join(" · "), href: `/admin/leads/${l.id}` })),
    ...audits
      .filter((a) => matches(q, a.full_name, a.email, a.company, a.website))
      .slice(0, perType)
      .map((a) => ({ type: "audit" as const, id: a.id, title: a.company || a.full_name, subtitle: a.website || a.email, href: `/admin/audits/${a.id}` })),
    ...messages
      .filter((m) => matches(q, m.name, m.email, m.company, m.message))
      .slice(0, perType)
      .map((m) => ({ type: "message" as const, id: m.id, title: m.name, subtitle: m.message.slice(0, 80), href: `/admin/messages/${m.id}` })),
    ...cases
      .filter((c) => matches(q, c.title, c.client, c.slug))
      .slice(0, perType)
      .map((c) => ({ type: "case_study" as const, id: c.id, title: c.title, subtitle: c.client, href: `/admin/case-studies/${c.id}` })),
    ...posts
      .filter((p) => matches(q, p.title, p.slug, p.excerpt))
      .slice(0, perType)
      .map((p) => ({ type: "blog" as const, id: p.id, title: p.title, subtitle: p.status, href: `/admin/blog/${p.id}` })),
  ];
}
