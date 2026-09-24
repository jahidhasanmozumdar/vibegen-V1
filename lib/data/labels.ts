import type {
  ActivityType,
  AdSpendBand,
  AuditSection,
  AuditStatus,
  AuditType,
  BlogStatus,
  BookingProvider,
  BookingStatus,
  FindingStatus,
  IndustrySlug,
  LeadForm,
  LeadSource,
  LeadStatus,
  MeetingType,
  MessageStatus,
  NotificationType,
  Platform,
  Priority,
  PublishStatus,
  Role,
  ServiceSlug,
} from "./types";

export const serviceLabels: Record<ServiceSlug, string> = {
  "meta-ads": "Meta Ads",
  "google-ads": "Google Ads",
  "landing-pages": "Landing Pages",
  cro: "CRO",
  analytics: "Analytics & Tracking",
};

export const industryLabels: Record<IndustrySlug, string> = {
  saas: "SaaS",
  "home-services": "Home Services",
  "professional-services": "Professional Services",
  ecommerce: "E-commerce",
};

/** Free-text industry options offered on public forms. */
export const industryOptions = [
  "SaaS / Software",
  "Home Services",
  "Professional Services",
  "E-commerce",
  "Healthcare",
  "Education",
  "Real Estate",
  "Finance",
  "Other",
] as const;

export const countryOptions = ["United States", "United Kingdom", "Canada", "Australia", "Ireland", "Other"] as const;

export const leadStatusLabels: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost",
  archived: "Archived",
};

export const auditStatusLabels: Record<AuditStatus, string> = {
  new: "New",
  reviewing: "Reviewing",
  in_progress: "In Progress",
  ready: "Ready",
  sent: "Sent",
  completed: "Completed",
  archived: "Archived",
};

export const auditTypeLabels: Record<AuditType, string> = {
  full_funnel: "Full funnel",
  paid_ads: "Paid ads",
  landing_page: "Landing page",
  tracking: "Tracking",
};

export const auditSectionLabels: Record<AuditSection, string> = {
  website_overview: "Website Overview",
  tracking: "Tracking",
  meta_ads: "Meta Ads",
  google_ads: "Google Ads",
  landing_page: "Landing Page",
  cro: "CRO",
  analytics: "Analytics",
};

export const findingStatusLabels: Record<FindingStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
  wont_fix: "Won't fix",
};

export const priorityLabels: Record<Priority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const messageStatusLabels: Record<MessageStatus, string> = {
  unread: "Unread",
  read: "Read",
  archived: "Archived",
};

export const bookingStatusLabels: Record<BookingStatus, string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show",
  follow_up: "Follow-up",
};

export const meetingTypeLabels: Record<MeetingType, string> = {
  strategy_call: "Strategy call",
  audit_review: "Audit review",
  follow_up: "Follow-up",
};

export const bookingProviderLabels: Record<BookingProvider, string> = {
  manual: "Manual",
  calendly: "Calendly",
  cal_com: "Cal.com",
  other: "Other",
};

export const leadSourceLabels: Record<LeadSource, string> = {
  google: "Google",
  meta: "Meta",
  linkedin: "LinkedIn",
  organic: "Organic",
  referral: "Referral",
  direct: "Direct",
  email: "Email",
  other: "Other",
};

export const leadFormLabels: Record<LeadForm, string> = {
  growth_audit: "Growth audit",
  contact: "Contact form",
  booking: "Booking",
  manual: "Added manually",
};

export const adSpendLabels: Record<AdSpendBand, string> = {
  not_running: "Not running ads yet",
  under_2500: "Under $2,500 / month",
  "2500_5000": "$2,500 – $5,000 / month",
  "5000_15000": "$5,000 – $15,000 / month",
  "15000_50000": "$15,000 – $50,000 / month",
  "50000_plus": "$50,000+ / month",
};

export const platformLabels: Record<Platform, string> = {
  meta: "Meta (Facebook / Instagram)",
  google: "Google Ads",
  both: "Both Meta and Google",
  other: "Other platform",
  none: "Not advertising yet",
};

export const publishStatusLabels: Record<PublishStatus, string> = {
  draft: "Draft",
  published: "Published",
};

export const blogStatusLabels: Record<BlogStatus, string> = {
  draft: "Draft",
  published: "Published",
  scheduled: "Scheduled",
};

export const roleLabels: Record<Role, string> = {
  admin: "Admin",
  manager: "Manager",
  staff: "Staff",
};

export const notificationTypeLabels: Record<NotificationType, string> = {
  new_lead: "New lead",
  new_audit: "New audit request",
  new_message: "New contact message",
  new_booking: "New booking",
  audit_completed: "Audit completed",
  lead_status_updated: "Lead status updated",
};

export const activityTypeLabels: Record<ActivityType, string> = {
  submitted: "Lead submitted",
  status_changed: "Status changed",
  note_added: "Note added",
  audit_requested: "Audit requested",
  call_booked: "Call booked",
  proposal_sent: "Proposal sent",
  assigned: "Owner assigned",
  tags_updated: "Tags updated",
  message_received: "Message received",
  converted: "Converted to lead",
  updated: "Details updated",
};

/** Build <select> options from a label record, preserving declaration order. */
export function toOptions<T extends string>(labels: Record<T, string>): { value: T; label: string }[] {
  return (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }));
}
