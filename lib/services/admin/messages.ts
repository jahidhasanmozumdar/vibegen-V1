import "server-only";

import { adminStore, StoreError, type DataStore } from "@/lib/data";
import { MESSAGE_STATUSES, type ContactMessage, type Lead, type MessageStatus } from "@/lib/data/types";
import { createManualLead, logLeadActivity, type Actor } from "./leads";
import {
  DEFAULT_PAGE_SIZE,
  DEMO_FILTERS,
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

export interface MessageFilters {
  q?: string;
  status?: MessageStatus;
  demo?: DemoFilter;
  page: number;
  pageSize: number;
}

export function parseMessageFilters(sp: SearchParamsRecord): MessageFilters {
  return {
    q: param(sp, "q"),
    status: enumParam(sp, "status", MESSAGE_STATUSES),
    demo: enumParam(sp, "demo", DEMO_FILTERS),
    page: pageParam(sp),
    pageSize: DEFAULT_PAGE_SIZE,
  };
}

export function hasActiveMessageFilters(f: MessageFilters): boolean {
  return Boolean(f.q || f.status || f.demo);
}

export interface MessageList extends Paged<ContactMessage> {
  counts: Record<MessageStatus | "inbox", number>;
}

/** Without a status filter the inbox shows unread + read (archived is its own view). */
export async function listMessages(filters: MessageFilters): Promise<MessageList> {
  const store = await adminStore();
  const all = await store.list("contact_messages", { orderBy: { column: "created_at", ascending: false } });
  const base = all.filter((m) => matchesQuery(filters.q, m.name, m.email, m.company, m.message)).filter((m) => matchesDemo(m.is_demo, filters.demo));
  const counts = {
    inbox: base.filter((m) => m.status !== "archived").length,
    unread: base.filter((m) => m.status === "unread").length,
    read: base.filter((m) => m.status === "read").length,
    archived: base.filter((m) => m.status === "archived").length,
  };
  const rows = base.filter((m) => (filters.status ? m.status === filters.status : m.status !== "archived"));
  return { ...paginate(rows, filters.page, filters.pageSize), counts };
}

export interface MessageDetail {
  message: ContactMessage;
  lead: Lead | null;
}

export async function getMessage(id: string): Promise<MessageDetail | null> {
  const store = await adminStore();
  const message = await store.get("contact_messages", id);
  if (!message || message.deleted_at) return null;
  const lead = message.lead_id ? await store.get("leads", message.lead_id) : null;
  return { message, lead: lead && !lead.deleted_at ? lead : null };
}

async function requireMessage(store: DataStore, id: string): Promise<ContactMessage> {
  const message = await store.get("contact_messages", id);
  if (!message || message.deleted_at) throw new StoreError("Message not found.", "not_found");
  return message;
}

export async function setMessageStatus(id: string, status: MessageStatus): Promise<ContactMessage> {
  const store = await adminStore();
  await requireMessage(store, id);
  return store.update("contact_messages", id, { status });
}

export const markMessageRead = (id: string) => setMessageStatus(id, "read");
export const markMessageUnread = (id: string) => setMessageStatus(id, "unread");
export const archiveMessage = (id: string) => setMessageStatus(id, "archived");

export async function saveMessageNote(id: string, note: string | null): Promise<ContactMessage> {
  const store = await adminStore();
  await requireMessage(store, id);
  return store.update("contact_messages", id, { note });
}

/** Link to the existing lead if there is one; otherwise create a lead from the message. */
export async function convertMessageToLead(id: string, actor: Actor): Promise<{ lead: Lead; created: boolean }> {
  const store = await adminStore();
  const message = await requireMessage(store, id);

  if (message.lead_id) {
    const existing = await store.get("leads", message.lead_id);
    if (existing && !existing.deleted_at) return { lead: existing, created: false };
  }

  const lead = await createManualLead(
    {
      full_name: message.name,
      email: message.email,
      company: message.company,
      website: message.website,
      country: message.country,
      industry: message.business_type,
      services: message.services,
      message: message.message,
      source: "direct",
    },
    actor,
    "contact",
  );
  const patch: Partial<Lead> = { monthly_ad_spend: message.monthly_ad_spend, attribution: message.attribution, is_demo: message.is_demo };
  const updated = await store.update("leads", lead.id, patch);
  await store.update("contact_messages", id, { lead_id: lead.id, status: message.status === "unread" ? "read" : message.status });
  await logLeadActivity(store, lead.id, "message_received", "Original contact message linked", actor, { message_id: id });
  return { lead: updated, created: true };
}

/** Soft delete. */
export async function deleteMessage(id: string): Promise<void> {
  const store = await adminStore();
  await requireMessage(store, id);
  await store.update("contact_messages", id, { deleted_at: new Date().toISOString() });
}
