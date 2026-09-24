/**
 * Domain types shared by the public site, admin dashboard and both data
 * drivers (PostgreSQL via Prisma + local demo store). Column names mirror
 * prisma/schema.prisma so rows round-trip without mapping.
 */

export type ID = string;
export type ISODate = string;

export interface BaseRow {
  id: ID;
  created_at: ISODate;
  updated_at: ISODate;
}

/** Rows that can be flagged as demo content and wiped in one action. */
export interface DemoFlag {
  is_demo: boolean;
}

export interface SoftDelete {
  deleted_at: ISODate | null;
}

/* ------------------------------------------------------------------ */
/* Enumerations                                                         */
/* ------------------------------------------------------------------ */

export const SERVICE_SLUGS = ["meta-ads", "google-ads", "landing-pages", "cro", "analytics"] as const;
export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

export const INDUSTRY_SLUGS = ["saas", "home-services", "professional-services", "ecommerce"] as const;
export type IndustrySlug = (typeof INDUSTRY_SLUGS)[number];

export const LEAD_STATUSES = ["new", "contacted", "qualified", "proposal", "won", "lost", "archived"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const AUDIT_STATUSES = ["new", "reviewing", "in_progress", "ready", "sent", "completed", "archived"] as const;
export type AuditStatus = (typeof AUDIT_STATUSES)[number];

export const PRIORITIES = ["high", "medium", "low"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const AUDIT_SECTIONS = [
  "website_overview",
  "tracking",
  "meta_ads",
  "google_ads",
  "landing_page",
  "cro",
  "analytics",
] as const;
export type AuditSection = (typeof AUDIT_SECTIONS)[number];

export const FINDING_STATUSES = ["open", "in_progress", "resolved", "wont_fix"] as const;
export type FindingStatus = (typeof FINDING_STATUSES)[number];

export const AUDIT_TYPES = ["full_funnel", "paid_ads", "landing_page", "tracking"] as const;
export type AuditType = (typeof AUDIT_TYPES)[number];

export const MESSAGE_STATUSES = ["unread", "read", "archived"] as const;
export type MessageStatus = (typeof MESSAGE_STATUSES)[number];

export const BOOKING_STATUSES = ["scheduled", "completed", "cancelled", "no_show", "follow_up"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const MEETING_TYPES = ["strategy_call", "audit_review", "follow_up"] as const;
export type MeetingType = (typeof MEETING_TYPES)[number];

export const BOOKING_PROVIDERS = ["manual", "calendly", "cal_com", "other"] as const;
export type BookingProvider = (typeof BOOKING_PROVIDERS)[number];

export const LEAD_SOURCES = ["google", "meta", "linkedin", "organic", "referral", "direct", "email", "other"] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LEAD_FORMS = ["growth_audit", "contact", "booking", "manual"] as const;
export type LeadForm = (typeof LEAD_FORMS)[number];

export const PUBLISH_STATUSES = ["draft", "published"] as const;
export type PublishStatus = (typeof PUBLISH_STATUSES)[number];

export const BLOG_STATUSES = ["draft", "published", "scheduled"] as const;
export type BlogStatus = (typeof BLOG_STATUSES)[number];

export const ROLES = ["admin", "manager", "staff"] as const;
export type Role = (typeof ROLES)[number];

export const AD_SPEND_BANDS = [
  "under_2500",
  "2500_5000",
  "5000_15000",
  "15000_50000",
  "50000_plus",
  "not_running",
] as const;
export type AdSpendBand = (typeof AD_SPEND_BANDS)[number];

export const PLATFORMS = ["meta", "google", "both", "other", "none"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const NOTIFICATION_TYPES = [
  "new_lead",
  "new_audit",
  "new_message",
  "new_booking",
  "audit_completed",
  "lead_status_updated",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const ACTIVITY_TYPES = [
  "submitted",
  "status_changed",
  "note_added",
  "audit_requested",
  "call_booked",
  "proposal_sent",
  "assigned",
  "tags_updated",
  "message_received",
  "converted",
  "updated",
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

/* ------------------------------------------------------------------ */
/* Attribution                                                          */
/* ------------------------------------------------------------------ */

export interface TouchPoint {
  source: string | null;
  medium: string | null;
  campaign: string | null;
  term: string | null;
  content: string | null;
  referrer: string | null;
  landing_page: string | null;
  at: ISODate;
}

export interface Attribution {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  referrer: string | null;
  landing_page: string | null;
  first_visit: ISODate | null;
  last_visit: ISODate | null;
  device: "mobile" | "tablet" | "desktop" | null;
  country: string | null;
  first_touch: TouchPoint | null;
  last_touch: TouchPoint | null;
}

/* ------------------------------------------------------------------ */
/* SEO                                                                  */
/* ------------------------------------------------------------------ */

export interface SeoFields {
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  noindex: boolean;
}

/* ------------------------------------------------------------------ */
/* Users                                                                */
/* ------------------------------------------------------------------ */

export interface Profile extends BaseRow {
  email: string;
  full_name: string;
  role: Role;
  avatar_url: string | null;
  active: boolean;
}

/* ------------------------------------------------------------------ */
/* CRM                                                                  */
/* ------------------------------------------------------------------ */

export interface Lead extends BaseRow, DemoFlag, SoftDelete {
  full_name: string;
  email: string;
  company: string | null;
  website: string | null;
  country: string | null;
  industry: string | null;
  business_type: string | null;
  monthly_ad_spend: AdSpendBand | null;
  primary_platform: Platform | null;
  services: ServiceSlug[];
  challenge: string | null;
  message: string | null;
  status: LeadStatus;
  owner_id: ID | null;
  tags: string[];
  source: LeadSource;
  form: LeadForm;
  attribution: Attribution | null;
  last_activity_at: ISODate;
}

export interface LeadNote extends BaseRow {
  lead_id: ID;
  author_id: ID | null;
  author_name: string;
  body: string;
}

export interface LeadActivity extends BaseRow {
  lead_id: ID;
  type: ActivityType;
  description: string;
  actor_name: string | null;
  meta: Record<string, string | number | boolean | null>;
}

export interface AuditRequest extends BaseRow, DemoFlag, SoftDelete {
  lead_id: ID | null;
  full_name: string;
  email: string;
  company: string | null;
  website: string | null;
  audit_type: AuditType;
  status: AuditStatus;
  priority: Priority;
  assigned_to: ID | null;
  challenge: string | null;
  primary_platform: Platform | null;
  monthly_ad_spend: AdSpendBand | null;
  services_needed: ServiceSlug[];
  summary: string | null;
  notes: string | null;
  completed_at: ISODate | null;
}

export interface AuditFinding extends BaseRow {
  audit_id: ID;
  section: AuditSection;
  issue: string;
  impact: string;
  recommendation: string;
  priority: Priority;
  status: FindingStatus;
}

export interface ContactMessage extends BaseRow, DemoFlag, SoftDelete {
  name: string;
  email: string;
  company: string | null;
  website: string | null;
  country: string | null;
  business_type: string | null;
  monthly_ad_spend: AdSpendBand | null;
  services: ServiceSlug[];
  message: string;
  status: MessageStatus;
  note: string | null;
  lead_id: ID | null;
  attribution: Attribution | null;
}

export interface Booking extends BaseRow, DemoFlag, SoftDelete {
  lead_id: ID | null;
  name: string;
  email: string;
  company: string | null;
  meeting_at: ISODate | null;
  meeting_type: MeetingType;
  status: BookingStatus;
  source: LeadSource;
  provider: BookingProvider;
  external_id: string | null;
  notes: string | null;
}

/* ------------------------------------------------------------------ */
/* CMS                                                                  */
/* ------------------------------------------------------------------ */

export interface CaseMetric {
  label: string;
  before: string | null;
  after: string | null;
  note: string | null;
}

export interface CaseStudy extends BaseRow, DemoFlag, SeoFields {
  title: string;
  slug: string;
  client: string;
  industry: IndustrySlug | null;
  excerpt: string;
  challenge: string;
  strategy: string;
  execution: string;
  results: string;
  metrics: CaseMetric[];
  services: ServiceSlug[];
  duration: string | null;
  ad_spend: string | null;
  images: string[];
  testimonial_id: ID | null;
  status: PublishStatus;
  published_at: ISODate | null;
}

export interface Testimonial extends BaseRow, DemoFlag {
  name: string;
  role: string | null;
  company: string | null;
  quote: string;
  photo_url: string | null;
  status: PublishStatus;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Benefit {
  title: string;
  body: string;
}

export interface Service extends BaseRow, SeoFields {
  slug: ServiceSlug;
  name: string;
  tagline: string;
  summary: string;
  description: string;
  capabilities: string[];
  features: Benefit[];
  benefits: Benefit[];
  included: string[];
  not_included: string[];
  faqs: FaqItem[];
  status: PublishStatus;
  sort_order: number;
}

export interface PricingPlan extends BaseRow {
  name: string;
  slug: string;
  description: string;
  monthly_price: number;
  setup_fee: number;
  currency: "USD";
  ad_spend_range: string;
  features: string[];
  cta_label: string;
  cta_href: string;
  badge: string | null;
  sort_order: number;
  active: boolean;
}

export interface Industry extends BaseRow, SeoFields {
  slug: IndustrySlug;
  name: string;
  headline: string;
  summary: string;
  examples: string[];
  focus: string[];
  challenges: Benefit[];
  approach: Benefit[];
  services: ServiceSlug[];
  faqs: FaqItem[];
  status: PublishStatus;
  sort_order: number;
}

export interface BlogCategory extends BaseRow {
  name: string;
  slug: string;
  description: string | null;
}

export interface BlogPost extends BaseRow, DemoFlag, SeoFields {
  title: string;
  slug: string;
  excerpt: string;
  /** Markdown subset — rendered by lib/utils/markdown.ts (escaped, no raw HTML). */
  content: string;
  featured_image: string | null;
  author: string;
  category_id: ID | null;
  tags: string[];
  status: BlogStatus;
  published_at: ISODate | null;
  reading_minutes: number;
}

export interface Media extends BaseRow {
  path: string;
  url: string;
  alt: string | null;
  mime_type: string;
  size_bytes: number;
}

/* ------------------------------------------------------------------ */
/* Tracking, settings, notifications                                    */
/* ------------------------------------------------------------------ */

export interface UtmSession extends BaseRow, DemoFlag {
  session_id: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  referrer: string | null;
  landing_page: string | null;
  device: string | null;
  country: string | null;
}

export interface AnalyticsEvent extends BaseRow, DemoFlag {
  name: string;
  path: string | null;
  source: LeadSource;
  session_id: string | null;
  properties: Record<string, string | number | boolean | null>;
}

export interface Notification extends BaseRow, DemoFlag {
  type: NotificationType;
  title: string;
  body: string;
  link: string | null;
  read_at: ISODate | null;
}

export interface SiteSettings {
  company_name: string;
  contact_email: string;
  booking_url: string;
  booking_provider: BookingProvider;
  ga4_id: string;
  gtm_id: string;
  meta_pixel_id: string;
  google_ads_id: string;
  notify_new_lead: boolean;
  notify_new_audit: boolean;
  notify_new_message: boolean;
  notify_new_booking: boolean;
  send_lead_confirmation: boolean;
  linkedin_url: string;
  x_url: string;
  default_seo_title: string;
  default_seo_description: string;
}

export interface SiteSettingRow extends BaseRow {
  key: string;
  value: SiteSettings;
}

/* ------------------------------------------------------------------ */
/* Table map (used by the generic DataStore)                            */
/* ------------------------------------------------------------------ */

export interface TableMap {
  profiles: Profile;
  leads: Lead;
  lead_notes: LeadNote;
  lead_activities: LeadActivity;
  audit_requests: AuditRequest;
  audit_findings: AuditFinding;
  contact_messages: ContactMessage;
  bookings: Booking;
  case_studies: CaseStudy;
  testimonials: Testimonial;
  services: Service;
  pricing_plans: PricingPlan;
  industries: Industry;
  blog_posts: BlogPost;
  blog_categories: BlogCategory;
  media: Media;
  utm_sessions: UtmSession;
  analytics_events: AnalyticsEvent;
  site_settings: SiteSettingRow;
  notifications: Notification;
}

export type TableName = keyof TableMap;
export type Row<K extends TableName> = TableMap[K];

/** Insert payload: id/timestamps are generated by the store when omitted. */
export type NewRow<K extends TableName> = Omit<Row<K>, "id" | "created_at" | "updated_at"> &
  Partial<Pick<Row<K>, "id" | "created_at" | "updated_at">>;

export type RowPatch<K extends TableName> = Partial<Omit<Row<K>, "id" | "created_at">>;

/** Tables that carry the is_demo flag and are cleared by "Remove demo data". */
export const DEMO_TABLES = [
  "leads",
  "audit_requests",
  "contact_messages",
  "bookings",
  "case_studies",
  "testimonials",
  "blog_posts",
  "utm_sessions",
  "analytics_events",
  "notifications",
] as const satisfies readonly TableName[];

/* ------------------------------------------------------------------ */
/* API envelope                                                         */
/* ------------------------------------------------------------------ */

export type ApiResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; message: string; errors?: Record<string, string[]> };

/** Return type used by every server action backing a form. */
export interface ActionState<T = undefined> {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  data?: T;
}
