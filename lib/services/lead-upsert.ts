import "server-only";

import type { DataStore } from "@/lib/data";
import type { ActivityType, Lead, LeadForm, LeadSource } from "@/lib/data/types";

/**
 * Minimal "find lead by email or create it" used by integrations (booking
 * webhooks) that don't go through the public form pipeline in
 * lib/services/submissions.ts. Mirrors its behaviour: repeat contacts attach
 * to the same lead, and archived/lost leads re-open when they come back.
 */
export async function findOrCreateLeadByEmail(
  store: DataStore,
  input: { full_name: string; email: string; company?: string | null; message?: string | null },
  opts: { form: LeadForm; source: LeadSource },
): Promise<{ lead: Lead; created: boolean }> {
  const email = input.email.trim().toLowerCase();
  const now = new Date().toISOString();
  const [existing] = await store.list("leads", { where: { email }, orderBy: { column: "created_at", ascending: false }, limit: 1 });

  if (existing) {
    const lead = await store.update("leads", existing.id, {
      full_name: existing.full_name || input.full_name,
      company: existing.company ?? input.company ?? null,
      status: existing.status === "archived" || existing.status === "lost" ? "new" : existing.status,
      last_activity_at: now,
    });
    return { lead, created: false };
  }

  const lead = await store.insert("leads", {
    full_name: input.full_name || email,
    email,
    company: input.company ?? null,
    website: null,
    country: null,
    industry: null,
    business_type: null,
    monthly_ad_spend: null,
    primary_platform: null,
    services: [],
    challenge: null,
    message: input.message ?? null,
    status: "new",
    owner_id: null,
    tags: [],
    source: opts.source,
    form: opts.form,
    attribution: null,
    last_activity_at: now,
    is_demo: false,
    deleted_at: null,
  });
  return { lead, created: true };
}

export async function logLeadActivity(
  store: DataStore,
  leadId: string,
  type: ActivityType,
  description: string,
  meta: Record<string, string | number | boolean | null> = {},
): Promise<void> {
  try {
    await store.insert("lead_activities", { lead_id: leadId, type, description, actor_name: null, meta });
  } catch (error) {
    console.error("[lead-activity] insert failed", error instanceof Error ? error.message : error);
  }
}
