import "server-only";

import { adminStore } from "@/lib/data";
import { auditStatusLabels, leadSourceLabels, leadStatusLabels, serviceLabels } from "@/lib/data/labels";
import {
  AUDIT_STATUSES,
  LEAD_SOURCES,
  LEAD_STATUSES,
  SERVICE_SLUGS,
  type AuditRequest,
  type AuditStatus,
  type Booking,
  type Lead,
  type Profile,
} from "@/lib/data/types";
import { countByBucket, inWindow, monthsCovering, percentChange, type BucketPoint, type DateRange } from "./date-range";

export interface CategoryDatum {
  key: string;
  label: string;
  value: number;
}

export interface Kpi {
  key: string;
  label: string;
  value: number;
  format: "number" | "percent";
  /** Relative change (0.25 = +25%) or, for rates, the difference in points (0.05 = +5 pts). Null = not enough data. */
  change: number | null;
  changeKind: "relative" | "points";
  hint?: string;
}

export interface MonthlyRate {
  key: string;
  label: string;
  leads: number;
  won: number;
  rate: number | null;
}

export interface Overview {
  kpis: Kpi[];
  thisMonth: { leads: number; audits: number; bookings: number; monthLabel: string };
  leadsOverTime: BucketPoint[];
  auditsOverTime: BucketPoint[];
  leadSources: CategoryDatum[];
  serviceInterest: CategoryDatum[];
  leadStatus: CategoryDatum[];
  auditStatus: CategoryDatum[];
  monthlyConversion: MonthlyRate[];
  trafficSources: CategoryDatum[];
  recentLeads: Lead[];
  recentAudits: AuditRequest[];
  upcomingBookings: Booking[];
  profiles: Record<string, Pick<Profile, "id" | "full_name">>;
}

const PENDING_AUDIT: AuditStatus[] = ["new", "reviewing", "in_progress"];

export function countBy<T>(rows: T[], keyOf: (row: T) => string | string[] | null | undefined, keys: readonly string[], labels: Record<string, string>): CategoryDatum[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const k = keyOf(row);
    for (const key of Array.isArray(k) ? k : k ? [k] : []) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return keys.map((key) => ({ key, label: labels[key] ?? key, value: counts.get(key) ?? 0 }));
}

export function sortDesc(data: CategoryDatum[]): CategoryDatum[] {
  return [...data].sort((a, b) => b.value - a.value);
}

const monthLabel = new Intl.DateTimeFormat("en-US", { month: "short" });
const monthYearLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });

export function monthlyWon(leads: Lead[], range: Pick<DateRange, "from" | "to">, minMonths = 6): MonthlyRate[] {
  const months = monthsCovering(range, minMonths);
  return months.map((start) => {
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 1).getTime() - 1;
    const inMonth = leads.filter((l) => inWindow(l.created_at, start, new Date(end)));
    const won = inMonth.filter((l) => l.status === "won").length;
    return {
      key: `${start.getFullYear()}-${start.getMonth() + 1}`,
      label: monthLabel.format(start),
      leads: inMonth.length,
      won,
      rate: inMonth.length ? won / inMonth.length : null,
    };
  });
}

function kpi(key: string, label: string, current: number, previous: number, hint?: string): Kpi {
  return { key, label, value: current, format: "number", change: percentChange(current, previous), changeKind: "relative", hint };
}

export async function getOverview(range: DateRange, now: Date = new Date()): Promise<Overview> {
  const store = await adminStore();
  const [leads, audits, messages, bookings, events, profiles] = await Promise.all([
    store.list("leads", { orderBy: { column: "created_at", ascending: false } }),
    store.list("audit_requests", { orderBy: { column: "created_at", ascending: false } }),
    store.list("contact_messages"),
    store.list("bookings"),
    store.list("analytics_events", { where: { name: "page_view" } }),
    store.list("profiles"),
  ]);

  const cur = <T extends { created_at: string }>(rows: T[]) => rows.filter((r) => inWindow(r.created_at, range.from, range.to));
  const prev = <T extends { created_at: string }>(rows: T[]) => rows.filter((r) => inWindow(r.created_at, range.prevFrom, range.prevTo));

  const leadsCur = cur(leads);
  const leadsPrev = prev(leads);
  const auditsCur = cur(audits);
  const auditsPrev = prev(audits);
  const wonCur = leadsCur.filter((l) => l.status === "won").length;
  const wonPrev = leadsPrev.filter((l) => l.status === "won").length;
  const rateCur = leadsCur.length ? wonCur / leadsCur.length : 0;
  const ratePrev = leadsPrev.length ? wonPrev / leadsPrev.length : 0;
  const pendingCur = auditsCur.filter((a) => PENDING_AUDIT.includes(a.status)).length;

  const kpis: Kpi[] = [
    kpi("leads", "Total leads", leadsCur.length, leadsPrev.length),
    kpi("new_leads", "New leads", leadsCur.filter((l) => l.status === "new").length, leadsPrev.filter((l) => l.status === "new").length, "Still in New status"),
    kpi("audits", "Audit requests", auditsCur.length, auditsPrev.length, `${pendingCur} pending (new, reviewing or in progress)`),
    kpi("messages", "Contact messages", cur(messages).length, prev(messages).length),
    kpi("bookings", "Booked calls", cur(bookings).length, prev(bookings).length),
    {
      key: "conversion",
      label: "Lead → won rate",
      value: rateCur,
      format: "percent",
      change: leadsPrev.length < 3 ? null : rateCur - ratePrev,
      changeKind: "points",
      hint: `${wonCur} won of ${leadsCur.length} leads created in period`,
    },
  ];

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthCount = <T extends { created_at: string }>(rows: T[]) => rows.filter((r) => inWindow(r.created_at, monthStart, now)).length;

  const upcomingBookings = bookings
    .filter((b) => b.status === "scheduled" && b.meeting_at && new Date(b.meeting_at).getTime() >= now.getTime())
    .sort((a, b) => (a.meeting_at ?? "").localeCompare(b.meeting_at ?? ""))
    .slice(0, 6);

  return {
    kpis,
    thisMonth: { leads: monthCount(leads), audits: monthCount(audits), bookings: monthCount(bookings), monthLabel: monthYearLabel.format(now) },
    leadsOverTime: countByBucket(leadsCur.map((l) => l.created_at), range),
    auditsOverTime: countByBucket(auditsCur.map((a) => a.created_at), range),
    leadSources: sortDesc(countBy(leadsCur, (l) => l.source, LEAD_SOURCES, leadSourceLabels)).filter((d) => d.value > 0),
    serviceInterest: sortDesc(countBy(leadsCur, (l) => l.services, SERVICE_SLUGS, serviceLabels)),
    leadStatus: countBy(leadsCur, (l) => l.status, LEAD_STATUSES, leadStatusLabels),
    auditStatus: countBy(auditsCur, (a) => a.status, AUDIT_STATUSES, auditStatusLabels),
    monthlyConversion: monthlyWon(leads, range),
    trafficSources: sortDesc(countBy(cur(events), (e) => e.source, LEAD_SOURCES, leadSourceLabels)).filter((d) => d.value > 0),
    recentLeads: leads.slice(0, 8),
    recentAudits: audits.slice(0, 6),
    upcomingBookings,
    profiles: Object.fromEntries(profiles.map((p) => [p.id, { id: p.id, full_name: p.full_name }])),
  };
}
