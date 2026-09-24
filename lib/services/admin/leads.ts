import "server-only";

import { adminStore, StoreError, type DataStore } from "@/lib/data";
import { leadStatusLabels } from "@/lib/data/labels";
import {
  LEAD_SOURCES,
  LEAD_STATUSES,
  SERVICE_SLUGS,
  type ActivityType,
  type AuditRequest,
  type Booking,
  type ContactMessage,
  type Lead,
  type LeadActivity,
  type LeadNote,
  type LeadSource,
  type LeadStatus,
  type Profile,
  type ServiceSlug,
} from "@/lib/data/types";
import { createNotification } from "@/lib/services/notifications";
import {
  DEFAULT_PAGE_SIZE,
  DEMO_FILTERS,
  compareValues,
  dateParam,
  enumParam,
  matchesDemo,
  matchesQuery,
  pageParam,
  paginate,
  param,
  withinDates,
  type DemoFilter,
  type Paged,
  type SearchParamsRecord,
} from "./query";

export interface Actor {
  id: string;
  name: string;
}

export const LEAD_SORTS = ["created_at", "full_name", "company", "status"] as const;
export type LeadSort = (typeof LEAD_SORTS)[number];

export interface LeadFilters {
  q?: string;
  status?: LeadStatus;
  source?: LeadSource;
  industry?: string;
  service?: ServiceSlug;
  /** A profile id, or "unassigned". */
  owner?: string;
  demo?: DemoFilter;
  from?: string;
  to?: string;
  sort: LeadSort;
  dir: "asc" | "desc";
  page: number;
  pageSize: number;
}

export function parseLeadFilters(sp: SearchParamsRecord): LeadFilters {
  return {
    q: param(sp, "q"),
    status: enumParam(sp, "status", LEAD_STATUSES),
    source: enumParam(sp, "source", LEAD_SOURCES),
    industry: param(sp, "industry"),
    service: enumParam(sp, "service", SERVICE_SLUGS),
    owner: param(sp, "owner"),
    demo: enumParam(sp, "demo", DEMO_FILTERS),
    from: dateParam(sp, "from"),
    to: dateParam(sp, "to"),
    sort: enumParam(sp, "sort", LEAD_SORTS) ?? "created_at",
    dir: enumParam(sp, "dir", ["asc", "desc"] as const) ?? "desc",
    page: pageParam(sp),
    pageSize: DEFAULT_PAGE_SIZE,
  };
}

export function hasActiveLeadFilters(f: LeadFilters): boolean {
  return Boolean(f.q || f.status || f.source || f.industry || f.service || f.owner || f.demo || f.from || f.to);
}

export async function listLeads(filters: LeadFilters): Promise<Paged<Lead>> {
  const store = await adminStore();
  const all = await store.list("leads");
  const rows = all
    .filter((l) => matchesQuery(filters.q, l.full_name, l.email, l.company, l.website))
    .filter((l) => !filters.status || l.status === filters.status)
    .filter((l) => !filters.source || l.source === filters.source)
    .filter((l) => !filters.industry || l.industry === filters.industry)
    .filter((l) => !filters.service || l.services.includes(filters.service))
    .filter((l) => !filters.owner || (filters.owner === "unassigned" ? !l.owner_id : l.owner_id === filters.owner))
    .filter((l) => matchesDemo(l.is_demo, filters.demo))
    .filter((l) => withinDates(l.created_at, filters.from, filters.to))
    .sort((a, b) => {
      if (filters.sort === "status") {
        const d = LEAD_STATUSES.indexOf(a.status) - LEAD_STATUSES.indexOf(b.status);
        return filters.dir === "asc" ? d : -d;
      }
      return compareValues(a[filters.sort], b[filters.sort], filters.dir);
    });
  return paginate(rows, filters.page, filters.pageSize);
}

/** Distinct industries across leads, for the filter select. */
export async function listLeadIndustries(): Promise<string[]> {
  const store = await adminStore();
  const leads = await store.list("leads");
  return Array.from(new Set(leads.map((l) => l.industry).filter((v): v is string => Boolean(v)))).sort();
}

export async function listProfiles(): Promise<Profile[]> {
  const store = await adminStore();
  const rows = await store.list("profiles", { orderBy: { column: "full_name", ascending: true } });
  return rows.filter((p) => p.active);
}

export interface LeadDetail {
  lead: Lead;
  notes: LeadNote[];
  activities: LeadActivity[];
  audits: AuditRequest[];
  bookings: Booking[];
  messages: ContactMessage[];
  owner: Profile | null;
}

export async function getLeadDetail(id: string): Promise<LeadDetail | null> {
  const store = await adminStore();
  const lead = await store.get("leads", id);
  if (!lead || lead.deleted_at) return null;

  const desc = { column: "created_at", ascending: false } as const;
  const [notes, activities, audits, bookings, messages, owner] = await Promise.all([
    store.list("lead_notes", { where: { lead_id: id }, orderBy: desc }),
    store.list("lead_activities", { where: { lead_id: id }, orderBy: desc }),
    store.list("audit_requests", { where: { lead_id: id }, orderBy: desc }),
    store.list("bookings", { where: { lead_id: id }, orderBy: { column: "meeting_at", ascending: false } }),
    store.list("contact_messages", { where: { lead_id: id }, orderBy: desc }),
    lead.owner_id ? store.get("profiles", lead.owner_id) : Promise.resolve(null),
  ]);
  return { lead, notes, activities, audits, bookings, messages, owner };
}

/* ------------------------------------------------------------------ */
/* Mutations                                                            */
/* ------------------------------------------------------------------ */

export async function logLeadActivity(
  store: DataStore,
  leadId: string,
  type: ActivityType,
  description: string,
  actor: Actor | null,
  meta: LeadActivity["meta"] = {},
): Promise<void> {
  const now = new Date().toISOString();
  await store.insert("lead_activities", { lead_id: leadId, type, description, actor_name: actor?.name ?? null, meta });
  await store.update("leads", leadId, { last_activity_at: now });
}

async function requireLead(store: DataStore, id: string): Promise<Lead> {
  const lead = await store.get("leads", id);
  if (!lead || lead.deleted_at) throw new StoreError("Lead not found.", "not_found");
  return lead;
}

export async function updateLeadStatus(id: string, status: LeadStatus, actor: Actor): Promise<Lead> {
  const store = await adminStore();
  const lead = await requireLead(store, id);
  if (lead.status === status) return lead;

  const updated = await store.update("leads", id, { status });
  await logLeadActivity(store, id, "status_changed", `Status changed to ${leadStatusLabels[status]}`, actor, {
    from: lead.status,
    to: status,
  });
  if (status === "proposal") await logLeadActivity(store, id, "proposal_sent", "Proposal sent", actor);
  await createNotification(store, {
    type: "lead_status_updated",
    title: "Lead status updated",
    body: `${lead.full_name}${lead.company ? ` (${lead.company})` : ""} moved to ${leadStatusLabels[status]} by ${actor.name}.`,
    link: `/admin/leads/${id}`,
    isDemo: lead.is_demo,
  });
  return updated;
}

export async function addLeadNote(id: string, body: string, actor: Actor): Promise<LeadNote> {
  const store = await adminStore();
  await requireLead(store, id);
  const note = await store.insert("lead_notes", { lead_id: id, author_id: actor.id, author_name: actor.name, body });
  await logLeadActivity(store, id, "note_added", `${actor.name} added a note`, actor);
  return note;
}

export async function assignOwner(id: string, ownerId: string | null, actor: Actor): Promise<Lead> {
  const store = await adminStore();
  const lead = await requireLead(store, id);
  if (lead.owner_id === ownerId) return lead;
  let ownerName = "Unassigned";
  if (ownerId) {
    const profile = await store.get("profiles", ownerId);
    if (!profile) throw new StoreError("That team member doesn't exist.", "not_found");
    ownerName = profile.full_name;
  }
  const updated = await store.update("leads", id, { owner_id: ownerId });
  await logLeadActivity(store, id, "assigned", ownerId ? `Assigned to ${ownerName}` : "Owner removed", actor);
  return updated;
}

export async function updateTags(id: string, tags: string[], actor: Actor): Promise<Lead> {
  const store = await adminStore();
  await requireLead(store, id);
  const updated = await store.update("leads", id, { tags });
  await logLeadActivity(store, id, "tags_updated", tags.length ? `Tags set to ${tags.join(", ")}` : "Tags cleared", actor);
  return updated;
}

export async function archiveLead(id: string, actor: Actor): Promise<Lead> {
  return updateLeadStatus(id, "archived", actor);
}

/** Soft delete. Permission (`leads:delete`) is enforced by the calling action. */
export async function deleteLead(id: string): Promise<void> {
  const store = await adminStore();
  await requireLead(store, id);
  await store.update("leads", id, { deleted_at: new Date().toISOString() });
}

export interface ManualLeadInput {
  full_name: string;
  email: string;
  company: string | null;
  website: string | null;
  country: string | null;
  industry: string | null;
  services: ServiceSlug[];
  message: string | null;
  source?: LeadSource;
}

export async function createManualLead(input: ManualLeadInput, actor: Actor, form: Lead["form"] = "manual"): Promise<Lead> {
  const store = await adminStore();
  const now = new Date().toISOString();
  const lead = await store.insert("leads", {
    full_name: input.full_name,
    email: input.email,
    company: input.company,
    website: input.website,
    country: input.country,
    industry: input.industry,
    business_type: input.industry,
    monthly_ad_spend: null,
    primary_platform: null,
    services: input.services,
    challenge: null,
    message: input.message,
    status: "new",
    owner_id: null,
    tags: [],
    source: input.source ?? "direct",
    form,
    attribution: null,
    last_activity_at: now,
    is_demo: false,
    deleted_at: null,
  });
  await logLeadActivity(store, lead.id, form === "manual" ? "submitted" : "converted", form === "manual" ? `Added manually by ${actor.name}` : `Converted from a contact message by ${actor.name}`, actor);
  return lead;
}
