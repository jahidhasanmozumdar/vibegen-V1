import "server-only";

import { adminStore } from "@/lib/data";
import { leadSourceLabels, serviceLabels } from "@/lib/data/labels";
import { LEAD_SOURCES, SERVICE_SLUGS, type Lead, type LeadStatus } from "@/lib/data/types";
import { countBy, monthlyWon, sortDesc, type CategoryDatum, type Kpi } from "./dashboard";
import { inWindow, percentChange, type DateRange } from "./date-range";

const QUALIFIED: LeadStatus[] = ["qualified", "proposal", "won"];
const isQualified = (l: Pick<Lead, "status">) => QUALIFIED.includes(l.status);

export interface UtmRow {
  source: string;
  medium: string;
  campaign: string;
  leads: number;
  qualified: number;
  won: number;
  /** won / leads */
  cvr: number;
}

export interface MonthlyTrendRow {
  key: string;
  label: string;
  leads: number;
  qualified: number;
  won: number;
}

export interface AnalyticsSummary {
  range: { key: string; label: string; from: string; to: string };
  kpis: Kpi[];
  totals: {
    leads: number;
    qualified: number;
    won: number;
    leadConversion: number | null;
    audits: number;
    auditsCompleted: number;
    auditCompletion: number | null;
    bookings: number;
    bookingsQualified: number;
    bookingConversion: number | null;
  };
  topSources: CategoryDatum[];
  topServices: CategoryDatum[];
  topIndustries: CategoryDatum[];
  topLandingPages: CategoryDatum[];
  utm: UtmRow[];
  monthly: MonthlyTrendRow[];
}

const ratio = (a: number, b: number) => (b > 0 ? a / b : null);

function topBy(rows: Lead[], keyOf: (l: Lead) => string | null | undefined, limit = 8): CategoryDatum[] {
  const counts = new Map<string, number>();
  for (const l of rows) {
    const key = keyOf(l);
    if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([key, value]) => ({ key, label: key, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
    .slice(0, limit);
}

function normalizePath(path: string | null | undefined): string | null {
  if (!path) return null;
  try {
    return new URL(path, "https://x.invalid").pathname || "/";
  } catch {
    return path.split("?")[0] || "/";
  }
}

export async function getAnalyticsSummary(range: DateRange): Promise<AnalyticsSummary> {
  const store = await adminStore();
  const [leads, audits, bookings] = await Promise.all([store.list("leads"), store.list("audit_requests"), store.list("bookings")]);
  const leadById = new Map(leads.map((l) => [l.id, l]));

  const cur = <T extends { created_at: string }>(rows: T[]) => rows.filter((r) => inWindow(r.created_at, range.from, range.to));
  const prev = <T extends { created_at: string }>(rows: T[]) => rows.filter((r) => inWindow(r.created_at, range.prevFrom, range.prevTo));

  const leadsCur = cur(leads);
  const leadsPrev = prev(leads);
  const auditsCur = cur(audits);
  const auditsPrev = prev(audits);
  const bookingsCur = cur(bookings);
  const bookingsPrev = prev(bookings);

  const qualified = leadsCur.filter(isQualified).length;
  const won = leadsCur.filter((l) => l.status === "won").length;
  const auditsCompleted = auditsCur.filter((a) => a.status === "completed").length;
  const bookingQualified = (rows: typeof bookings) =>
    rows.filter((b) => {
      const lead = b.lead_id ? leadById.get(b.lead_id) : undefined;
      return lead ? isQualified(lead) : false;
    }).length;
  const bookingsQualified = bookingQualified(bookingsCur);

  const leadConversion = ratio(won, leadsCur.length);
  const prevLeadConversion = ratio(leadsPrev.filter((l) => l.status === "won").length, leadsPrev.length);
  const auditCompletion = ratio(auditsCompleted, auditsCur.length);
  const prevAuditCompletion = ratio(auditsPrev.filter((a) => a.status === "completed").length, auditsPrev.length);
  const bookingConversion = ratio(bookingsQualified, bookingsCur.length);
  const prevBookingConversion = ratio(bookingQualified(bookingsPrev), bookingsPrev.length);

  const count = (key: string, label: string, c: number, p: number, hint?: string): Kpi => ({
    key,
    label,
    value: c,
    format: "number",
    change: percentChange(c, p),
    changeKind: "relative",
    hint,
  });
  const rate = (key: string, label: string, c: number | null, p: number | null, prevBase: number, hint: string): Kpi => ({
    key,
    label,
    value: c ?? 0,
    format: "percent",
    change: c === null || p === null || prevBase < 3 ? null : c - p,
    changeKind: "points",
    hint,
  });

  const kpis: Kpi[] = [
    count("leads", "Total leads", leadsCur.length, leadsPrev.length),
    count("qualified", "Qualified leads", qualified, leadsPrev.filter(isQualified).length, "Qualified, proposal or won"),
    count("won", "Won", won, leadsPrev.filter((l) => l.status === "won").length),
    rate("lead_cvr", "Lead conversion", leadConversion, prevLeadConversion, leadsPrev.length, "Won ÷ leads created in period"),
    count("audits", "Audit requests", auditsCur.length, auditsPrev.length),
    rate("audit_completion", "Audit completion", auditCompletion, prevAuditCompletion, auditsPrev.length, `${auditsCompleted} of ${auditsCur.length} completed`),
    count("bookings", "Bookings", bookingsCur.length, bookingsPrev.length),
    rate("booking_cvr", "Booking conversion", bookingConversion, prevBookingConversion, bookingsPrev.length, "Bookings whose lead reached Qualified or later"),
  ];

  const utmMap = new Map<string, UtmRow>();
  for (const l of leadsCur) {
    const a = l.attribution;
    const source = a?.utm_source || "(none)";
    const medium = a?.utm_medium || "(none)";
    const campaign = a?.utm_campaign || "(none)";
    const key = `${source}\u0000${medium}\u0000${campaign}`;
    const row = utmMap.get(key) ?? { source, medium, campaign, leads: 0, qualified: 0, won: 0, cvr: 0 };
    row.leads += 1;
    if (isQualified(l)) row.qualified += 1;
    if (l.status === "won") row.won += 1;
    utmMap.set(key, row);
  }
  const utm = [...utmMap.values()].map((r) => ({ ...r, cvr: r.leads ? r.won / r.leads : 0 })).sort((a, b) => b.leads - a.leads || b.won - a.won);

  const monthly = monthlyWon(leads, range).map((m) => {
    const [y, mo] = m.key.split("-").map(Number);
    const start = new Date(y, mo - 1, 1);
    const end = new Date(y, mo, 1).getTime() - 1;
    const inMonth = leads.filter((l) => inWindow(l.created_at, start, new Date(end)));
    return { key: m.key, label: m.label, leads: m.leads, won: m.won, qualified: inMonth.filter(isQualified).length };
  });

  return {
    range: { key: range.key, label: range.label, from: range.from.toISOString(), to: range.to.toISOString() },
    kpis,
    totals: {
      leads: leadsCur.length,
      qualified,
      won,
      leadConversion,
      audits: auditsCur.length,
      auditsCompleted,
      auditCompletion,
      bookings: bookingsCur.length,
      bookingsQualified,
      bookingConversion,
    },
    topSources: sortDesc(countBy(leadsCur, (l) => l.source, LEAD_SOURCES, leadSourceLabels)).filter((d) => d.value > 0),
    topServices: sortDesc(countBy(leadsCur, (l) => l.services, SERVICE_SLUGS, serviceLabels)).filter((d) => d.value > 0),
    topIndustries: topBy(leadsCur, (l) => l.industry),
    topLandingPages: topBy(leadsCur, (l) => normalizePath(l.attribution?.landing_page ?? l.attribution?.first_touch?.landing_page)),
    utm,
    monthly,
  };
}
