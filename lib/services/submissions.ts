import "server-only";

import { publicEnv } from "@/lib/config/env";
import { serviceStore, type DataStore } from "@/lib/data";
import { adSpendLabels, platformLabels, serviceLabels } from "@/lib/data/labels";
import type { Attribution, Lead, LeadForm, LeadSource, ServiceSlug } from "@/lib/data/types";
import { adminRecipient, sendEmail } from "@/lib/email";
import { adminNotificationEmail, leadConfirmationEmail } from "@/lib/email/templates";
import type { BookingRequestInput, ContactInput, GrowthAuditInput } from "@/lib/validation/schemas";
import { createNotification } from "./notifications";
import { getSiteSettings } from "./settings";

export interface SubmissionMeta {
  attribution: Attribution;
  source: LeadSource;
}

export class DuplicateSubmissionError extends Error {
  constructor() {
    super("duplicate");
    this.name = "DuplicateSubmissionError";
  }
}

const DUPLICATE_WINDOW_MS = 60_000;

/**
 * Find an existing lead by email or create one. Repeat enquiries attach to the
 * same lead so the admin sees one timeline per person.
 */
async function upsertLead(
  store: DataStore,
  input: {
    full_name: string;
    email: string;
    company: string | null;
    website: string | null;
    country: string | null;
    industry: string | null;
    business_type: string | null;
    monthly_ad_spend: Lead["monthly_ad_spend"];
    primary_platform: Lead["primary_platform"];
    services: ServiceSlug[];
    challenge: string | null;
    message: string | null;
  },
  form: LeadForm,
  meta: SubmissionMeta,
): Promise<{ lead: Lead; created: boolean }> {
  const now = new Date().toISOString();
  const [existing] = await store.list("leads", {
    where: { email: input.email },
    orderBy: { column: "created_at", ascending: false },
    limit: 1,
  });

  if (existing) {
    if (Date.now() - new Date(existing.last_activity_at).getTime() < DUPLICATE_WINDOW_MS && existing.form === form) {
      throw new DuplicateSubmissionError();
    }
    const merged = Array.from(new Set([...existing.services, ...input.services]));
    const lead = await store.update("leads", existing.id, {
      full_name: input.full_name || existing.full_name,
      company: input.company ?? existing.company,
      website: input.website ?? existing.website,
      country: input.country ?? existing.country,
      industry: input.industry ?? existing.industry,
      business_type: input.business_type ?? existing.business_type,
      monthly_ad_spend: input.monthly_ad_spend ?? existing.monthly_ad_spend,
      primary_platform: input.primary_platform ?? existing.primary_platform,
      services: merged,
      challenge: input.challenge ?? existing.challenge,
      // Re-open archived/lost leads when they come back.
      status: existing.status === "archived" || existing.status === "lost" ? "new" : existing.status,
      attribution: existing.attribution
        ? { ...existing.attribution, last_touch: meta.attribution.last_touch, last_visit: meta.attribution.last_visit }
        : meta.attribution,
      last_activity_at: now,
    });
    return { lead, created: false };
  }

  const lead = await store.insert("leads", {
    ...input,
    status: "new",
    owner_id: null,
    tags: [],
    source: meta.source,
    form,
    attribution: meta.attribution,
    last_activity_at: now,
    is_demo: false,
    deleted_at: null,
  });
  return { lead, created: true };
}

async function logActivity(store: DataStore, leadId: string, type: "submitted" | "audit_requested" | "message_received" | "call_booked", description: string) {
  await store.insert("lead_activities", { lead_id: leadId, type, description, actor_name: null, meta: {} });
}

function firstName(fullName: string): string {
  return fullName.split(/\s+/)[0] || fullName;
}

async function notifyByEmail(opts: {
  kind: "audit" | "contact" | "booking";
  name: string;
  email: string;
  fields: [string, string | null | undefined][];
  adminPath: string;
  adminEnabled: boolean;
  confirmEnabled: boolean;
}) {
  const to = adminRecipient();
  const jobs: Promise<unknown>[] = [];
  if (opts.adminEnabled && to) {
    jobs.push(sendEmail(adminNotificationEmail({ to, kind: opts.kind, name: opts.name, email: opts.email, fields: opts.fields, adminPath: opts.adminPath })));
  }
  if (opts.confirmEnabled && !publicEnv.demoMode) {
    jobs.push(sendEmail(leadConfirmationEmail({ to: opts.email, firstName: firstName(opts.name), kind: opts.kind })));
  }
  await Promise.allSettled(jobs);
}

/* ------------------------------------------------------------------ */

export async function submitGrowthAudit(input: GrowthAuditInput, meta: SubmissionMeta): Promise<{ auditId: string; leadId: string }> {
  const store = await serviceStore();
  const settings = await getSiteSettings(store);

  const { lead, created } = await upsertLead(
    store,
    {
      full_name: input.full_name,
      email: input.email,
      company: input.company,
      website: input.website,
      country: input.country,
      industry: input.industry,
      business_type: input.industry,
      monthly_ad_spend: input.monthly_ad_spend,
      primary_platform: input.primary_platform,
      services: input.services,
      challenge: input.challenge,
      message: input.message,
    },
    "growth_audit",
    meta,
  );

  const audit = await store.insert("audit_requests", {
    lead_id: lead.id,
    full_name: input.full_name,
    email: input.email,
    company: input.company,
    website: input.website,
    audit_type: input.services.length >= 3 ? "full_funnel" : input.services.includes("analytics") && input.services.length === 1 ? "tracking" : input.services.includes("landing-pages") || input.services.includes("cro") ? "landing_page" : "paid_ads",
    status: "new",
    priority: input.monthly_ad_spend === "15000_50000" || input.monthly_ad_spend === "50000_plus" ? "high" : "medium",
    assigned_to: null,
    challenge: input.challenge,
    primary_platform: input.primary_platform,
    monthly_ad_spend: input.monthly_ad_spend,
    services_needed: input.services,
    summary: null,
    notes: input.message,
    completed_at: null,
    is_demo: false,
    deleted_at: null,
  });

  if (created) await logActivity(store, lead.id, "submitted", "Submitted the growth audit form");
  await logActivity(store, lead.id, "audit_requested", "Requested a growth audit");

  await createNotification(store, {
    type: "new_audit",
    title: "New audit request",
    body: `${input.full_name}${input.company ? ` at ${input.company}` : ""} requested a growth audit.`,
    link: `/admin/audits/${audit.id}`,
  });

  await notifyByEmail({
    kind: "audit",
    name: input.full_name,
    email: input.email,
    adminPath: `/admin/audits/${audit.id}`,
    adminEnabled: settings.notify_new_audit,
    confirmEnabled: settings.send_lead_confirmation,
    fields: [
      ["Company", input.company],
      ["Website", input.website],
      ["Country", input.country],
      ["Industry", input.industry],
      ["Monthly ad spend", adSpendLabels[input.monthly_ad_spend]],
      ["Primary platform", platformLabels[input.primary_platform]],
      ["Services", input.services.map((s) => serviceLabels[s]).join(", ")],
      ["Challenge", input.challenge],
      ["Source", meta.source],
    ],
  });

  return { auditId: audit.id, leadId: lead.id };
}

export async function submitContactMessage(input: ContactInput, meta: SubmissionMeta): Promise<{ messageId: string }> {
  const store = await serviceStore();
  const settings = await getSiteSettings(store);

  const { lead, created } = await upsertLead(
    store,
    {
      full_name: input.name,
      email: input.email,
      company: input.company,
      website: input.website,
      country: input.country,
      industry: input.business_type,
      business_type: input.business_type,
      monthly_ad_spend: input.monthly_ad_spend ?? null,
      primary_platform: null,
      services: input.services,
      challenge: null,
      message: input.message,
    },
    "contact",
    meta,
  );

  const message = await store.insert("contact_messages", {
    name: input.name,
    email: input.email,
    company: input.company,
    website: input.website,
    country: input.country,
    business_type: input.business_type,
    monthly_ad_spend: input.monthly_ad_spend ?? null,
    services: input.services,
    message: input.message,
    status: "unread",
    note: null,
    lead_id: lead.id,
    attribution: meta.attribution,
    is_demo: false,
    deleted_at: null,
  });

  if (created) await logActivity(store, lead.id, "submitted", "Submitted the contact form");
  await logActivity(store, lead.id, "message_received", "Sent a message via the contact form");

  await createNotification(store, {
    type: "new_message",
    title: "New contact message",
    body: `${input.name}${input.company ? ` (${input.company})` : ""} sent a message.`,
    link: `/admin/messages/${message.id}`,
  });

  await notifyByEmail({
    kind: "contact",
    name: input.name,
    email: input.email,
    adminPath: `/admin/messages/${message.id}`,
    adminEnabled: settings.notify_new_message,
    confirmEnabled: settings.send_lead_confirmation,
    fields: [
      ["Company", input.company],
      ["Website", input.website],
      ["Business type", input.business_type],
      ["Monthly ad spend", input.monthly_ad_spend ? adSpendLabels[input.monthly_ad_spend] : null],
      ["Services", input.services.map((s) => serviceLabels[s]).join(", ")],
      ["Message", input.message],
    ],
  });

  return { messageId: message.id };
}

/**
 * Used when no external booking provider is configured: we record a call
 * *request* (status "follow_up", no meeting time) rather than pretending a
 * slot has been booked.
 */
export async function submitBookingRequest(input: BookingRequestInput, meta: SubmissionMeta): Promise<{ bookingId: string }> {
  const store = await serviceStore();
  const settings = await getSiteSettings(store);

  const { lead, created } = await upsertLead(
    store,
    {
      full_name: input.name,
      email: input.email,
      company: input.company,
      website: input.website,
      country: null,
      industry: null,
      business_type: null,
      monthly_ad_spend: null,
      primary_platform: null,
      services: [],
      challenge: input.topic,
      message: input.preferred_times ? `Preferred times: ${input.preferred_times}` : null,
    },
    "booking",
    meta,
  );

  const booking = await store.insert("bookings", {
    lead_id: lead.id,
    name: input.name,
    email: input.email,
    company: input.company,
    meeting_at: null,
    meeting_type: "strategy_call",
    status: "follow_up",
    source: meta.source,
    provider: "manual",
    external_id: null,
    notes: [input.topic && `Topic: ${input.topic}`, input.preferred_times && `Preferred times: ${input.preferred_times}`].filter(Boolean).join("\n") || null,
    is_demo: false,
    deleted_at: null,
  });

  if (created) await logActivity(store, lead.id, "submitted", "Requested a strategy call");
  await logActivity(store, lead.id, "call_booked", "Requested a strategy call (time to be confirmed)");

  await createNotification(store, {
    type: "new_booking",
    title: "New strategy call request",
    body: `${input.name}${input.company ? ` (${input.company})` : ""} asked for a strategy call.`,
    link: `/admin/bookings?highlight=${booking.id}`,
  });

  await notifyByEmail({
    kind: "booking",
    name: input.name,
    email: input.email,
    adminPath: `/admin/bookings`,
    adminEnabled: settings.notify_new_booking,
    confirmEnabled: settings.send_lead_confirmation,
    fields: [
      ["Company", input.company],
      ["Website", input.website],
      ["Preferred times", input.preferred_times],
      ["Topic", input.topic],
    ],
  });

  return { bookingId: booking.id };
}
