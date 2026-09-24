import { randomUUID } from "node:crypto";

import { defaultBlogCategories, defaultBlogPosts } from "@/lib/content/blog";
import { demoCaseStudies, demoTestimonials } from "@/lib/content/demo";
import { defaultIndustries } from "@/lib/content/industries";
import { defaultPricingPlans } from "@/lib/content/pricing";
import { defaultServices } from "@/lib/content/services";
import { defaultSiteSettings } from "@/lib/content/settings";

import type {
  AdSpendBand,
  AnalyticsEvent,
  Attribution,
  AuditFinding,
  AuditRequest,
  AuditStatus,
  AuditType,
  BlogCategory,
  BlogPost,
  Booking,
  BookingStatus,
  CaseStudy,
  ContactMessage,
  Industry,
  Lead,
  LeadActivity,
  LeadNote,
  LeadSource,
  LeadStatus,
  MeetingType,
  Notification,
  Platform,
  PricingPlan,
  Priority,
  Profile,
  Row,
  Service,
  ServiceSlug,
  SiteSettingRow,
  TableName,
  Testimonial,
} from "./types";

/* Deterministic PRNG so demo data is stable between reseeds. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DAY = 86_400_000;

function withMeta<T extends object>(row: T, createdAt: Date = new Date()): T & { id: string; created_at: string; updated_at: string } {
  const iso = createdAt.toISOString();
  return { id: randomUUID(), created_at: iso, updated_at: iso, ...row };
}

/* ------------------------------------------------------------------ */
/* Content (real starter content, not demo)                             */
/* ------------------------------------------------------------------ */

export function buildContentRecords() {
  const services: Service[] = defaultServices.map((s) => withMeta(s));
  const industries: Industry[] = defaultIndustries.map((i) => withMeta(i));
  const pricing_plans: PricingPlan[] = defaultPricingPlans.map((p) => withMeta(p));
  const blog_categories: BlogCategory[] = defaultBlogCategories.map((c) => withMeta(c));
  const categoryBySlug = new Map(blog_categories.map((c) => [c.slug, c.id]));
  const blog_posts: BlogPost[] = defaultBlogPosts.map(({ category_slug, ...post }) =>
    withMeta({ ...post, category_id: categoryBySlug.get(category_slug) ?? null }, new Date(post.published_at ?? Date.now())),
  );
  const site_settings: SiteSettingRow[] = [withMeta({ key: "site", value: defaultSiteSettings })];
  return { services, industries, pricing_plans, blog_categories, blog_posts, site_settings };
}

/* ------------------------------------------------------------------ */
/* Demo records (is_demo = true)                                        */
/* ------------------------------------------------------------------ */

const FIRST = ["Jordan", "Priya", "Marcus", "Hannah", "Diego", "Olivia", "Sam", "Aisha", "Tom", "Grace", "Ethan", "Chloe", "Ravi", "Megan", "Luke", "Sofia", "Noah", "Fiona", "Ben", "Leah", "Kwame", "Isla", "Owen", "Nina", "Callum"];
const LAST = ["Ellis", "Shah", "Reed", "Clarke", "Alvarez", "Bennett", "Carter", "Khan", "Hughes", "Porter", "Walsh", "Morgan", "Patel", "Doyle", "Foster", "Rossi", "Brooks", "Murray", "Hale", "Turner", "Mensah", "Fraser", "Lloyd", "Kerr", "Byrne"];

interface DemoCompany {
  name: string;
  industry: string;
  country: "United States" | "United Kingdom";
}

const COMPANIES: DemoCompany[] = [
  { name: "Northwind Roofing", industry: "Home Services", country: "United States" },
  { name: "Ledgerline", industry: "SaaS / Software", country: "United States" },
  { name: "Brightwater Plumbing", industry: "Home Services", country: "United Kingdom" },
  { name: "Harbor & Finch Legal", industry: "Professional Services", country: "United States" },
  { name: "Copperleaf Home Goods", industry: "E-commerce", country: "United States" },
  { name: "Stackwise", industry: "SaaS / Software", country: "United Kingdom" },
  { name: "Evergreen HVAC", industry: "Home Services", country: "United States" },
  { name: "Mason Row Accounting", industry: "Professional Services", country: "United Kingdom" },
  { name: "Tallow & Wick", industry: "E-commerce", country: "United Kingdom" },
  { name: "Signalpath Analytics", industry: "SaaS / Software", country: "United States" },
  { name: "Clearview Cleaning Co.", industry: "Home Services", country: "United Kingdom" },
  { name: "Oakridge Remodeling", industry: "Home Services", country: "United States" },
  { name: "Fieldnote Consulting", industry: "Professional Services", country: "United States" },
  { name: "Kinfolk Pet Supply", industry: "E-commerce", country: "United States" },
  { name: "Quillstone HR", industry: "SaaS / Software", country: "United Kingdom" },
];

const CHALLENGES = [
  "We're spending around $6k a month on Meta and the leads are cheap but almost none of them pick up the phone.",
  "Google Ads CPC keeps climbing and we can't tell which keywords actually turn into booked jobs.",
  "Our demo request page converts under 1% from paid traffic. Organic visitors convert much better.",
  "GA4 and Google Ads show completely different conversion numbers. We don't trust either.",
  "We rebuilt the site last year and I think tracking broke — conversions dropped to almost zero overnight.",
  "We want to start paid acquisition in the UK but have no idea what budget is realistic.",
  "Retargeting is eating a third of our budget and I'm not convinced it's incremental.",
  "Lead volume is fine but sales says the quality has dropped since we switched to lead form ads.",
];

function pick<T>(rand: () => number, items: readonly T[]): T {
  return items[Math.floor(rand() * items.length)];
}

function pickSome<T>(rand: () => number, items: readonly T[], min: number, max: number): T[] {
  const count = min + Math.floor(rand() * (max - min + 1));
  const copy = [...items];
  const out: T[] = [];
  while (out.length < count && copy.length) out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0]);
  return out;
}

const SOURCE_UTM: Record<LeadSource, { source: string | null; medium: string | null; referrer: string | null }> = {
  google: { source: "google", medium: "cpc", referrer: "https://www.google.com/" },
  meta: { source: "facebook", medium: "paid_social", referrer: "https://l.facebook.com/" },
  linkedin: { source: "linkedin", medium: "social", referrer: "https://www.linkedin.com/" },
  organic: { source: null, medium: null, referrer: "https://www.google.com/" },
  referral: { source: null, medium: null, referrer: "https://www.example-partner.com/" },
  direct: { source: null, medium: null, referrer: null },
  email: { source: "newsletter", medium: "email", referrer: null },
  other: { source: null, medium: null, referrer: null },
};

const LANDING_PAGES = ["/", "/free-growth-audit", "/services/meta-ads", "/services/google-ads", "/pricing", "/industries/home-services", "/industries/saas", "/blog/ga4-gtm-conversion-tracking-checklist"];

function demoAttribution(rand: () => number, source: LeadSource, at: Date, country: string): Attribution {
  const utm = SOURCE_UTM[source];
  const campaign = utm.source ? pick(rand, ["growth-audit-us", "growth-audit-uk", "retargeting-30d", "brand-search", "guide-promo"]) : null;
  const landing = pick(rand, LANDING_PAGES);
  const firstVisit = new Date(at.getTime() - Math.floor(rand() * 9) * DAY);
  const touch = {
    source: utm.source,
    medium: utm.medium,
    campaign,
    term: null,
    content: null,
    referrer: utm.referrer,
    landing_page: landing,
    at: firstVisit.toISOString(),
  };
  return {
    utm_source: utm.source,
    utm_medium: utm.medium,
    utm_campaign: campaign,
    utm_term: source === "google" ? pick(rand, ["ppc agency", "google ads management", "meta ads agency uk"]) : null,
    utm_content: null,
    referrer: utm.referrer,
    landing_page: landing,
    first_visit: firstVisit.toISOString(),
    last_visit: at.toISOString(),
    device: pick(rand, ["desktop", "desktop", "mobile", "mobile", "tablet"] as const),
    country,
    first_touch: touch,
    last_touch: { ...touch, at: at.toISOString() },
  };
}

export interface DemoRecords {
  profiles: Profile[];
  leads: Lead[];
  lead_notes: LeadNote[];
  lead_activities: LeadActivity[];
  audit_requests: AuditRequest[];
  audit_findings: AuditFinding[];
  contact_messages: ContactMessage[];
  bookings: Booking[];
  case_studies: CaseStudy[];
  testimonials: Testimonial[];
  analytics_events: AnalyticsEvent[];
  notifications: Notification[];
}

import { LOCAL_ADMIN_ID } from "./constants";
export { LOCAL_ADMIN_ID };

export function buildDemoProfiles(adminEmail: string): Profile[] {
  const now = new Date();
  return [
    withMeta({ email: adminEmail, full_name: "Studio Admin", role: "admin" as const, avatar_url: null, active: true }, now),
    withMeta({ email: "strategist@example.com", full_name: "Alex Morgan (Demo)", role: "manager" as const, avatar_url: null, active: true }, now),
    withMeta({ email: "analyst@example.com", full_name: "Robin Ashby (Demo)", role: "staff" as const, avatar_url: null, active: true }, now),
  ].map((p, i) => (i === 0 ? { ...p, id: LOCAL_ADMIN_ID } : p));
}

/**
 * @param assignees profile ids that demo records may be assigned to.
 *                  Pass [] to leave records unassigned.
 */
export function buildDemoRecords(assignees: string[], now: Date = new Date()): DemoRecords {
  const rand = mulberry32(20260924);
  const leads: Lead[] = [];
  const lead_notes: LeadNote[] = [];
  const lead_activities: LeadActivity[] = [];
  const audit_requests: AuditRequest[] = [];
  const audit_findings: AuditFinding[] = [];
  const contact_messages: ContactMessage[] = [];
  const bookings: Booking[] = [];
  const notifications: Notification[] = [];

  const statuses: LeadStatus[] = ["new", "new", "new", "new", "new", "new", "contacted", "contacted", "contacted", "contacted", "qualified", "qualified", "qualified", "qualified", "proposal", "proposal", "proposal", "won", "won", "won", "lost", "lost", "new", "contacted", "archived"];
  const sources: LeadSource[] = ["google", "google", "google", "meta", "meta", "organic", "organic", "linkedin", "referral", "direct"];
  const spends: AdSpendBand[] = ["under_2500", "2500_5000", "5000_15000", "5000_15000", "15000_50000", "not_running"];
  const platforms: Platform[] = ["meta", "google", "both", "both", "none"];
  const serviceSlugs: ServiceSlug[] = ["meta-ads", "google-ads", "landing-pages", "cro", "analytics"];
  const auditStatusCycle: AuditStatus[] = ["new", "new", "reviewing", "in_progress", "in_progress", "ready", "sent", "completed", "completed", "completed", "new", "reviewing"];
  const auditTypes: AuditType[] = ["full_funnel", "full_funnel", "paid_ads", "landing_page", "tracking"];
  const priorities: Priority[] = ["high", "medium", "low"];
  const assignee = (i: number) => (assignees.length ? assignees[i % assignees.length] : null);

  for (let i = 0; i < 25; i++) {
    // Spread leads over ~6 months, weighted toward recent weeks so the trend rises gently.
    const ageDays = Math.floor(Math.pow(rand(), 1.6) * 180);
    const created = new Date(now.getTime() - ageDays * DAY - Math.floor(rand() * DAY));
    const company = COMPANIES[i % COMPANIES.length];
    const first = FIRST[i];
    const last = LAST[(i * 7) % LAST.length];
    const source = sources[Math.floor(rand() * sources.length)];
    const status = statuses[i];
    const form = i < 12 ? "growth_audit" : i < 18 ? "contact" : i < 22 ? "booking" : "manual";
    const services = pickSome(rand, serviceSlugs, 1, 3);
    const domain = company.name.toLowerCase().replace(/[^a-z]+/g, "-").replace(/-+$/, "");
    const lead: Lead = {
      id: randomUUID(),
      created_at: created.toISOString(),
      updated_at: created.toISOString(),
      is_demo: true,
      deleted_at: null,
      full_name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@${domain}.example`,
      company: company.name,
      website: `https://${domain}.example`,
      country: company.country,
      industry: company.industry,
      business_type: company.industry,
      monthly_ad_spend: pick(rand, spends),
      primary_platform: pick(rand, platforms),
      services,
      challenge: pick(rand, CHALLENGES),
      message: null,
      status,
      owner_id: status === "new" ? null : assignee(i),
      tags: pickSome(rand, ["us", "uk", "high-intent", "follow-up", "budget-confirmed", "tracking-issue"], 0, 2),
      source,
      form: form as Lead["form"],
      attribution: demoAttribution(rand, source, created, company.country),
      last_activity_at: created.toISOString(),
    };
    leads.push(lead);

    const act = (type: LeadActivity["type"], description: string, offsetHours: number, actor: string | null = null) => {
      const at = new Date(created.getTime() + offsetHours * 3_600_000);
      if (at > now) return;
      lead_activities.push(withMeta({ lead_id: lead.id, type, description, actor_name: actor, meta: {} }, at));
      lead.last_activity_at = at.toISOString();
    };

    act("submitted", `Submitted the ${form.replace("_", " ")} form`, 0);
    const order: LeadStatus[] = ["contacted", "qualified", "proposal", "won"];
    const reached = status === "lost" ? 2 : status === "archived" ? 1 : order.indexOf(status) + 1;
    for (let s = 0; s < reached; s++) {
      const to = order[s];
      act("status_changed", `Status changed to ${to[0].toUpperCase()}${to.slice(1)}`, 20 + s * 40, "Studio Admin");
      if (to === "proposal") act("proposal_sent", "Proposal sent", 21 + s * 40, "Studio Admin");
    }
    if (status === "lost") act("status_changed", "Status changed to Lost", 200, "Studio Admin");
    if (status === "archived") act("status_changed", "Status changed to Archived", 90, "Studio Admin");

    if (status !== "new" && rand() > 0.35) {
      const noteAt = new Date(created.getTime() + 26 * 3_600_000);
      if (noteAt <= now) {
        lead_notes.push(
          withMeta(
            {
              lead_id: lead.id,
              author_id: assignee(i),
              author_name: "Studio Admin",
              body: pick(rand, [
                "Intro call went well. Main issue is lead quality from Meta lead forms — they want to test sending traffic to a landing page instead.",
                "Tracking is the first priority. GA4 has duplicate purchase events and Google Ads is importing the wrong conversion.",
                "Budget confirmed at roughly $8k/month across both platforms. Decision maker is the founder.",
                "Asked for read access to Google Ads and GA4 before we scope anything.",
                "Not a fit right now — spending under $1k/month. Suggested they revisit in Q1.",
              ]),
            },
            noteAt,
          ),
        );
        act("note_added", "Admin added a note", 26, "Studio Admin");
      }
    }

    if (form === "growth_audit") {
      const aIndex = audit_requests.length;
      const aStatus = auditStatusCycle[aIndex % auditStatusCycle.length];
      const audit: AuditRequest = {
        id: randomUUID(),
        created_at: created.toISOString(),
        updated_at: created.toISOString(),
        is_demo: true,
        deleted_at: null,
        lead_id: lead.id,
        full_name: lead.full_name,
        email: lead.email,
        company: lead.company,
        website: lead.website,
        audit_type: pick(rand, auditTypes),
        status: aStatus,
        priority: pick(rand, priorities),
        assigned_to: aStatus === "new" ? null : assignee(aIndex),
        challenge: lead.challenge,
        primary_platform: lead.primary_platform,
        monthly_ad_spend: lead.monthly_ad_spend,
        services_needed: services,
        summary:
          aStatus === "completed" || aStatus === "sent" || aStatus === "ready"
            ? "Demo summary: tracking gaps are the biggest risk. Paid search structure is reasonable, but the landing page doesn't match ad intent."
            : null,
        notes: null,
        completed_at: aStatus === "completed" ? new Date(created.getTime() + 5 * DAY).toISOString() : null,
      };
      audit_requests.push(audit);
      act("audit_requested", "Requested a growth audit", 0.1);

      if (["in_progress", "ready", "sent", "completed"].includes(aStatus)) {
        const findings: Omit<AuditFinding, "id" | "created_at" | "updated_at" | "audit_id">[] = [
          {
            section: "tracking",
            issue: "Demo finding: the lead form fires the conversion on page load, not on successful submit.",
            impact: "Conversions are over-reported, so Smart Bidding optimises toward visits instead of leads.",
            recommendation: "Trigger the conversion from a GTM custom event pushed after the form's success response.",
            priority: "high",
            status: aStatus === "completed" ? "resolved" : "open",
          },
          {
            section: "landing_page",
            issue: "Demo finding: the ad promises a free quote but the page headline talks about company history.",
            impact: "Message mismatch increases bounce rate from paid traffic.",
            recommendation: "Lead with the quote offer, response time and service area above the fold.",
            priority: "medium",
            status: "open",
          },
          {
            section: "google_ads",
            issue: "Demo finding: broad match keywords without a negative keyword list.",
            impact: "Budget is spent on job-seeker and DIY searches.",
            recommendation: "Build shared negative lists (jobs, free, DIY, how to) and review search terms weekly.",
            priority: "medium",
            status: "in_progress",
          },
        ];
        for (const f of findings) audit_findings.push(withMeta({ ...f, audit_id: audit.id }, created));
      }

      notifications.push(
        withMeta(
          {
            is_demo: true,
            type: "new_audit" as const,
            title: "New audit request",
            body: `${lead.full_name} at ${lead.company} requested a growth audit.`,
            link: `/admin/audits/${audit.id}`,
            read_at: ageDays > 3 ? created.toISOString() : null,
          },
          created,
        ),
      );
    } else {
      notifications.push(
        withMeta(
          {
            is_demo: true,
            type: "new_lead" as const,
            title: "New lead",
            body: `${lead.full_name} (${lead.company}) came in via ${form.replace("_", " ")}.`,
            link: `/admin/leads/${lead.id}`,
            read_at: ageDays > 3 ? created.toISOString() : null,
          },
          created,
        ),
      );
    }

    if (form === "contact") {
      contact_messages.push({
        id: randomUUID(),
        created_at: created.toISOString(),
        updated_at: created.toISOString(),
        is_demo: true,
        deleted_at: null,
        name: lead.full_name,
        email: lead.email,
        company: lead.company,
        website: lead.website,
        country: lead.country,
        business_type: lead.business_type,
        monthly_ad_spend: lead.monthly_ad_spend,
        services,
        message: lead.challenge ?? "Interested in a conversation about paid acquisition.",
        status: ageDays > 10 ? "read" : "unread",
        note: null,
        lead_id: lead.id,
        attribution: lead.attribution,
      });
      act("message_received", "Sent a message via the contact form", 0.1);
    }
  }

  // Bookings: 8 — mix of past (completed/no-show) and upcoming.
  const bookingStatuses: BookingStatus[] = ["completed", "completed", "no_show", "follow_up", "cancelled", "scheduled", "scheduled", "scheduled"];
  const meetingTypes: MeetingType[] = ["strategy_call", "strategy_call", "audit_review", "follow_up"];
  const bookable = leads.filter((l) => l.status !== "new" || l.form === "booking").slice(0, 8);
  bookable.forEach((lead, i) => {
    const status = bookingStatuses[i];
    const upcoming = status === "scheduled";
    const meetingAt = upcoming
      ? new Date(now.getTime() + (i - 4) * DAY + 15 * 3_600_000)
      : new Date(new Date(lead.created_at).getTime() + 3 * DAY);
    const createdAt = new Date(Math.min(new Date(lead.created_at).getTime() + 3_600_000, now.getTime()));
    bookings.push({
      id: randomUUID(),
      created_at: createdAt.toISOString(),
      updated_at: createdAt.toISOString(),
      is_demo: true,
      deleted_at: null,
      lead_id: lead.id,
      name: lead.full_name,
      email: lead.email,
      company: lead.company,
      meeting_at: meetingAt.toISOString(),
      meeting_type: meetingTypes[i % meetingTypes.length],
      status,
      source: lead.source,
      provider: "manual",
      external_id: null,
      notes: null,
    });
    lead_activities.push(withMeta({ lead_id: lead.id, type: "call_booked" as const, description: "Booked a strategy call", actor_name: null, meta: {} }, createdAt));
  });

  // Analytics events: page views + conversion events across 180 days.
  const analytics_events: AnalyticsEvent[] = [];
  const pagePool = ["/", "/", "/", "/pricing", "/services/meta-ads", "/services/google-ads", "/services/landing-pages", "/services/cro", "/services/analytics", "/free-growth-audit", "/industries/saas", "/industries/home-services", "/blog", "/case-studies"];
  const eventSources: LeadSource[] = ["google", "google", "organic", "organic", "organic", "meta", "direct", "direct", "linkedin", "referral"];
  for (let d = 179; d >= 0; d--) {
    const day = new Date(now.getTime() - d * DAY);
    const growth = 1 + (180 - d) / 120;
    const views = Math.round((3 + rand() * 5) * growth);
    for (let v = 0; v < views; v++) {
      const at = new Date(day.getTime() - Math.floor(rand() * DAY));
      const path = pick(rand, pagePool);
      analytics_events.push(
        withMeta({ is_demo: true, name: "page_view", path, source: pick(rand, eventSources), session_id: null, properties: {} }, at),
      );
      if (path === "/free-growth-audit" && rand() > 0.55) {
        analytics_events.push(withMeta({ is_demo: true, name: "form_start", path, source: "direct" as const, session_id: null, properties: { form: "growth_audit" } }, at));
      }
      if (path === "/pricing" && rand() > 0.85) {
        analytics_events.push(withMeta({ is_demo: true, name: "book_call_click", path, source: "direct" as const, session_id: null, properties: {} }, at));
      }
    }
  }

  const testimonials: Testimonial[] = demoTestimonials.map((t) => withMeta(t));
  const case_studies: CaseStudy[] = demoCaseStudies.map((c) => withMeta(c, new Date(c.published_at ?? now)));

  return {
    profiles: [],
    leads,
    lead_notes,
    lead_activities,
    audit_requests,
    audit_findings,
    contact_messages,
    bookings,
    case_studies,
    testimonials,
    analytics_events,
    notifications,
  };
}

/** Complete local database: starter content, settings, demo profiles and demo records. */
export function buildSeedDatabase(adminEmail = process.env.DEMO_ADMIN_EMAIL || "admin@vibegen.studio"): Partial<Record<TableName, Row<TableName>[]>> {
  const content = buildContentRecords();
  const profiles = buildDemoProfiles(adminEmail);
  const demo = buildDemoRecords(profiles.map((p) => p.id));
  return {
    ...content,
    ...demo,
    profiles,
    media: [],
    utm_sessions: [],
  };
}
