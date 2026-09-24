import "server-only";

import { adminStore, StoreError, type DataStore } from "@/lib/data";
import { auditStatusLabels } from "@/lib/data/labels";
import {
  AUDIT_SECTIONS,
  AUDIT_STATUSES,
  AUDIT_TYPES,
  PRIORITIES,
  type AuditFinding,
  type AuditRequest,
  type AuditSection,
  type AuditStatus,
  type AuditType,
  type FindingStatus,
  type Lead,
  type Priority,
  type Profile,
} from "@/lib/data/types";
import { createNotification } from "@/lib/services/notifications";
import { logLeadActivity, type Actor } from "./leads";
import {
  DEFAULT_PAGE_SIZE,
  DEMO_FILTERS,
  compareValues,
  enumParam,
  matchesDemo,
  matchesQuery,
  pageParam,
  paginate,
  param,
  type DemoFilter,
  type Paged,
  type SearchParamsRecord,
} from "./query";

export const AUDIT_SORTS = ["created_at", "company", "status", "priority"] as const;
export type AuditSort = (typeof AUDIT_SORTS)[number];

export interface AuditFilters {
  q?: string;
  status?: AuditStatus;
  priority?: Priority;
  type?: AuditType;
  /** A profile id, or "unassigned". */
  assigned?: string;
  demo?: DemoFilter;
  sort: AuditSort;
  dir: "asc" | "desc";
  page: number;
  pageSize: number;
}

export function parseAuditFilters(sp: SearchParamsRecord): AuditFilters {
  return {
    q: param(sp, "q"),
    status: enumParam(sp, "status", AUDIT_STATUSES),
    priority: enumParam(sp, "priority", PRIORITIES),
    type: enumParam(sp, "type", AUDIT_TYPES),
    assigned: param(sp, "assigned"),
    demo: enumParam(sp, "demo", DEMO_FILTERS),
    sort: enumParam(sp, "sort", AUDIT_SORTS) ?? "created_at",
    dir: enumParam(sp, "dir", ["asc", "desc"] as const) ?? "desc",
    page: pageParam(sp),
    pageSize: DEFAULT_PAGE_SIZE,
  };
}

export function hasActiveAuditFilters(f: AuditFilters): boolean {
  return Boolean(f.q || f.status || f.priority || f.type || f.assigned || f.demo);
}

function filterAudits(rows: AuditRequest[], f: Omit<AuditFilters, "status"> & { status?: AuditStatus }): AuditRequest[] {
  return rows
    .filter((a) => matchesQuery(f.q, a.full_name, a.email, a.company, a.website))
    .filter((a) => !f.status || a.status === f.status)
    .filter((a) => !f.priority || a.priority === f.priority)
    .filter((a) => !f.type || a.audit_type === f.type)
    .filter((a) => !f.assigned || (f.assigned === "unassigned" ? !a.assigned_to : a.assigned_to === f.assigned))
    .filter((a) => matchesDemo(a.is_demo, f.demo));
}

export interface AuditList extends Paged<AuditRequest> {
  /** Counts per status for the current filters (ignoring the status filter itself). */
  statusCounts: Record<AuditStatus | "all", number>;
}

export async function listAudits(filters: AuditFilters): Promise<AuditList> {
  const store = await adminStore();
  const all = await store.list("audit_requests");
  const withoutStatus = filterAudits(all, { ...filters, status: undefined });
  const statusCounts = { all: withoutStatus.length } as Record<AuditStatus | "all", number>;
  for (const s of AUDIT_STATUSES) statusCounts[s] = withoutStatus.filter((a) => a.status === s).length;

  const rows = filterAudits(withoutStatus, filters).sort((a, b) => {
    if (filters.sort === "status" || filters.sort === "priority") {
      const order: readonly string[] = filters.sort === "status" ? AUDIT_STATUSES : PRIORITIES;
      const d = order.indexOf(a[filters.sort]) - order.indexOf(b[filters.sort]);
      return filters.dir === "asc" ? d : -d;
    }
    return compareValues(a[filters.sort], b[filters.sort], filters.dir);
  });
  return { ...paginate(rows, filters.page, filters.pageSize), statusCounts };
}

export interface AuditDetail {
  audit: AuditRequest;
  findings: Record<AuditSection, AuditFinding[]>;
  findingCounts: Record<Priority, number>;
  lead: Lead | null;
  assignee: Profile | null;
}

export async function getAuditDetail(id: string): Promise<AuditDetail | null> {
  const store = await adminStore();
  const audit = await store.get("audit_requests", id);
  if (!audit || audit.deleted_at) return null;
  const [findings, lead, assignee] = await Promise.all([
    store.list("audit_findings", { where: { audit_id: id }, orderBy: { column: "created_at", ascending: true } }),
    audit.lead_id ? store.get("leads", audit.lead_id) : Promise.resolve(null),
    audit.assigned_to ? store.get("profiles", audit.assigned_to) : Promise.resolve(null),
  ]);
  const grouped = Object.fromEntries(AUDIT_SECTIONS.map((s) => [s, [] as AuditFinding[]])) as Record<AuditSection, AuditFinding[]>;
  const priorityRank = (p: Priority) => PRIORITIES.indexOf(p);
  for (const f of findings) grouped[f.section]?.push(f);
  for (const s of AUDIT_SECTIONS) grouped[s].sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority));
  const findingCounts: Record<Priority, number> = { high: 0, medium: 0, low: 0 };
  for (const f of findings) findingCounts[f.priority] += 1;
  return { audit, findings: grouped, findingCounts, lead: lead && !lead.deleted_at ? lead : null, assignee };
}

/* ------------------------------------------------------------------ */
/* Mutations                                                            */
/* ------------------------------------------------------------------ */

async function requireAudit(store: DataStore, id: string): Promise<AuditRequest> {
  const audit = await store.get("audit_requests", id);
  if (!audit || audit.deleted_at) throw new StoreError("Audit not found.", "not_found");
  return audit;
}

export interface AuditUpdateInput {
  status: AuditStatus;
  priority: Priority;
  audit_type: AuditType;
  assigned_to: string | null;
  summary: string | null;
  notes: string | null;
}

export async function updateAudit(id: string, input: Partial<AuditUpdateInput>, actor: Actor): Promise<AuditRequest> {
  const store = await adminStore();
  const audit = await requireAudit(store, id);

  if (input.assigned_to) {
    const profile = await store.get("profiles", input.assigned_to);
    if (!profile) throw new StoreError("That team member doesn't exist.", "not_found");
  }

  const statusChanged = input.status !== undefined && input.status !== audit.status;
  const becameCompleted = statusChanged && input.status === "completed";
  const patch: Partial<AuditRequest> = { ...input };
  if (becameCompleted) patch.completed_at = new Date().toISOString();
  if (statusChanged && input.status !== "completed" && audit.status === "completed") patch.completed_at = null;

  const updated = await store.update("audit_requests", id, patch);

  if (statusChanged && audit.lead_id) {
    const lead = await store.get("leads", audit.lead_id);
    if (lead && !lead.deleted_at) {
      await logLeadActivity(
        store,
        lead.id,
        "updated",
        becameCompleted ? "Growth audit marked completed" : `Audit status changed to ${auditStatusLabels[input.status as AuditStatus]}`,
        actor,
        { audit_id: id },
      );
    }
  }
  if (becameCompleted) {
    await createNotification(store, {
      type: "audit_completed",
      title: "Audit completed",
      body: `${actor.name} completed the audit for ${audit.company || audit.full_name}.`,
      link: `/admin/audits/${id}`,
      isDemo: audit.is_demo,
    });
  }
  return updated;
}

export async function markAuditCompleted(id: string, actor: Actor): Promise<AuditRequest> {
  return updateAudit(id, { status: "completed" }, actor);
}

export async function setAuditStatus(id: string, status: AuditStatus, actor: Actor): Promise<AuditRequest> {
  return updateAudit(id, { status }, actor);
}

export interface FindingInput {
  section: AuditSection;
  issue: string;
  impact: string;
  recommendation: string;
  priority: Priority;
  status: FindingStatus;
}

export async function addFinding(auditId: string, input: FindingInput): Promise<AuditFinding> {
  const store = await adminStore();
  await requireAudit(store, auditId);
  const finding = await store.insert("audit_findings", { audit_id: auditId, ...input });
  await store.update("audit_requests", auditId, {});
  return finding;
}

async function requireFinding(store: DataStore, auditId: string, findingId: string): Promise<AuditFinding> {
  const finding = await store.get("audit_findings", findingId);
  if (!finding || finding.audit_id !== auditId) throw new StoreError("Finding not found.", "not_found");
  return finding;
}

export async function updateFinding(auditId: string, findingId: string, input: FindingInput): Promise<AuditFinding> {
  const store = await adminStore();
  await requireFinding(store, auditId, findingId);
  return store.update("audit_findings", findingId, input);
}

export async function deleteFinding(auditId: string, findingId: string): Promise<void> {
  const store = await adminStore();
  await requireFinding(store, auditId, findingId);
  await store.remove("audit_findings", findingId);
}
