import { z } from "zod";

import {
  AD_SPEND_BANDS,
  AUDIT_SECTIONS,
  AUDIT_STATUSES,
  AUDIT_TYPES,
  BLOG_STATUSES,
  BOOKING_STATUSES,
  FINDING_STATUSES,
  INDUSTRY_SLUGS,
  LEAD_STATUSES,
  MEETING_TYPES,
  PLATFORMS,
  PRIORITIES,
  PUBLISH_STATUSES,
  SERVICE_SLUGS,
} from "@/lib/data/types";

/* ------------------------------------------------------------------ */
/* Primitives                                                           */
/* ------------------------------------------------------------------ */

/** Strip control characters and collapse whitespace; output is always escaped by React. */
export function sanitizeText(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
}

const text = (max: number) => z.string().transform(sanitizeText).pipe(z.string().max(max, `Keep this under ${max} characters.`));

const requiredText = (label: string, max: number) =>
  z
    .string({ error: `${label} is required.` })
    .transform(sanitizeText)
    .pipe(z.string().min(1, `${label} is required.`).max(max, `Keep this under ${max} characters.`));

const optionalText = (max: number) =>
  z
    .string()
    .optional()
    .transform((v) => (v ? sanitizeText(v) : ""))
    .pipe(z.string().max(max, `Keep this under ${max} characters.`))
    .transform((v) => (v === "" ? null : v));

export const emailField = z
  .string({ error: "Email is required." })
  .transform((v) => sanitizeText(v).toLowerCase())
  .pipe(z.email("Enter a valid email address, like name@company.com.").max(254));

/** Accepts "acme.com" or "https://acme.com" and normalises to a full URL. */
export const websiteField = z
  .string()
  .optional()
  .transform((v) => (v ? sanitizeText(v) : ""))
  .transform((v) => (v && !/^https?:\/\//i.test(v) ? `https://${v}` : v))
  .refine((v) => {
    if (!v) return true;
    try {
      const url = new URL(v);
      return /\.[a-z]{2,}$/i.test(url.hostname);
    } catch {
      return false;
    }
  }, "Enter a valid website, like acme.com.")
  .transform((v) => (v === "" ? null : v));

const requiredWebsite = websiteField.refine((v) => v !== null, "Website is required so we can review it.");

const serviceList = z.array(z.enum(SERVICE_SLUGS)).max(SERVICE_SLUGS.length).default([]);

const consent = z.literal("on", { error: "Please confirm you're happy for us to contact you about your request." });

/* ------------------------------------------------------------------ */
/* Attribution (hidden JSON field sent with public forms)               */
/* ------------------------------------------------------------------ */

const utmValue = z.string().max(200).nullable().catch(null);

export const touchSchema = z.object({
  source: utmValue,
  medium: utmValue,
  campaign: utmValue,
  term: utmValue,
  content: utmValue,
  referrer: z.string().max(500).nullable().catch(null),
  landing_page: z.string().max(500).nullable().catch(null),
  at: z.string().max(40),
});

export const clientAttributionSchema = z
  .object({
    first_touch: touchSchema.nullable().catch(null),
    last_touch: touchSchema.nullable().catch(null),
  })
  .partial();

export type ClientAttribution = z.infer<typeof clientAttributionSchema>;

export function parseAttributionField(value: FormDataEntryValue | null): ClientAttribution {
  if (typeof value !== "string" || value.length === 0 || value.length > 5000) return {};
  try {
    const result = clientAttributionSchema.safeParse(JSON.parse(value));
    return result.success ? result.data : {};
  } catch {
    return {};
  }
}

/* ------------------------------------------------------------------ */
/* Public forms                                                         */
/* ------------------------------------------------------------------ */

export const growthAuditSchema = z.object({
  full_name: requiredText("Full name", 120),
  email: emailField,
  company: requiredText("Company", 160),
  website: requiredWebsite,
  country: requiredText("Country", 80),
  industry: requiredText("Industry", 80),
  monthly_ad_spend: z.enum(AD_SPEND_BANDS, { error: "Choose your approximate monthly ad spend." }),
  primary_platform: z.enum(PLATFORMS, { error: "Choose the platform you mainly use." }),
  challenge: requiredText("Current challenge", 1500).pipe(z.string().min(10, "Give us a sentence or two so the audit is useful.")),
  services: serviceList.refine((v) => v.length > 0, "Pick at least one area you want us to look at."),
  message: optionalText(2000),
  consent,
});
export type GrowthAuditInput = z.infer<typeof growthAuditSchema>;

export const contactSchema = z.object({
  name: requiredText("Name", 120),
  email: emailField,
  company: optionalText(160),
  website: websiteField,
  country: optionalText(80),
  business_type: optionalText(80),
  monthly_ad_spend: z.enum(AD_SPEND_BANDS).optional().nullable().catch(null),
  services: serviceList,
  message: requiredText("Message", 3000).pipe(z.string().min(10, "Tell us a little more — a sentence or two is fine.")),
});
export type ContactInput = z.infer<typeof contactSchema>;

export const bookingRequestSchema = z.object({
  name: requiredText("Name", 120),
  email: emailField,
  company: optionalText(160),
  website: websiteField,
  preferred_times: optionalText(500),
  topic: optionalText(1500),
  consent,
});
export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;

/* ------------------------------------------------------------------ */
/* Admin                                                                */
/* ------------------------------------------------------------------ */

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Enter your password.").max(200),
});

export const leadStatusSchema = z.enum(LEAD_STATUSES);
export const auditStatusSchema = z.enum(AUDIT_STATUSES);
export const bookingStatusSchema = z.enum(BOOKING_STATUSES);
export const prioritySchema = z.enum(PRIORITIES);

export const noteSchema = z.object({
  body: requiredText("Note", 4000),
});

export const tagsSchema = z
  .string()
  .transform((v) =>
    Array.from(
      new Set(
        v
          .split(",")
          .map((t) => sanitizeText(t).toLowerCase().replace(/\s+/g, "-"))
          .filter(Boolean),
      ),
    ).slice(0, 12),
  )
  .pipe(z.array(z.string().max(32, "Tags must be under 32 characters.")));

export const manualLeadSchema = z.object({
  full_name: requiredText("Full name", 120),
  email: emailField,
  company: optionalText(160),
  website: websiteField,
  country: optionalText(80),
  industry: optionalText(80),
  services: serviceList,
  message: optionalText(2000),
});

export const findingSchema = z.object({
  section: z.enum(AUDIT_SECTIONS),
  issue: requiredText("Issue", 1000),
  impact: requiredText("Impact", 1000),
  recommendation: requiredText("Recommendation", 2000),
  priority: z.enum(PRIORITIES),
  status: z.enum(FINDING_STATUSES).default("open"),
});

export const auditUpdateSchema = z.object({
  status: z.enum(AUDIT_STATUSES),
  priority: z.enum(PRIORITIES),
  audit_type: z.enum(AUDIT_TYPES),
  assigned_to: z
    .string()
    .optional()
    .transform((v) => (v ? v : null)),
  summary: optionalText(5000),
  notes: optionalText(5000),
});

export const bookingSchema = z.object({
  name: requiredText("Name", 120),
  email: emailField,
  company: optionalText(160),
  meeting_at: z
    .string()
    .optional()
    .transform((v) => (v ? new Date(v) : null))
    .refine((d) => d === null || !Number.isNaN(d.getTime()), "Enter a valid date and time.")
    .transform((d) => (d ? d.toISOString() : null)),
  meeting_type: z.enum(MEETING_TYPES),
  status: z.enum(BOOKING_STATUSES),
  notes: optionalText(2000),
});

const slugField = z
  .string()
  .transform((v) =>
    sanitizeText(v)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, ""),
  )
  .pipe(z.string().min(1, "Slug is required.").max(120));

const lines = z
  .string()
  .optional()
  .transform((v) =>
    (v ?? "")
      .split("\n")
      .map(sanitizeText)
      .filter(Boolean),
  );

export const seoSchema = z.object({
  seo_title: optionalText(70),
  seo_description: optionalText(170),
  canonical_url: optionalText(300),
  og_title: optionalText(100),
  og_description: optionalText(200),
  og_image: optionalText(500),
  noindex: z
    .string()
    .optional()
    .transform((v) => v === "on"),
});

export const blogPostSchema = z
  .object({
    title: requiredText("Title", 160),
    slug: slugField,
    excerpt: requiredText("Excerpt", 320),
    content: requiredText("Content", 60_000),
    featured_image: optionalText(500),
    author: requiredText("Author", 120),
    category_id: z
      .string()
      .optional()
      .transform((v) => (v ? v : null)),
    tags: tagsSchema,
    status: z.enum(BLOG_STATUSES),
    published_at: z
      .string()
      .optional()
      .transform((v) => (v ? new Date(v).toISOString() : null)),
  })
  .extend(seoSchema.shape);

export const caseStudySchema = z
  .object({
    title: requiredText("Title", 160),
    slug: slugField,
    client: requiredText("Client", 160),
    industry: z
      .enum(INDUSTRY_SLUGS)
      .optional()
      .nullable()
      .catch(null),
    excerpt: requiredText("Excerpt", 320),
    challenge: requiredText("Challenge", 6000),
    strategy: requiredText("Strategy", 6000),
    execution: requiredText("Execution", 6000),
    results: requiredText("Results", 6000),
    metrics_json: z.string().optional(),
    services: serviceList,
    duration: optionalText(80),
    ad_spend: optionalText(80),
    images: lines,
    testimonial_id: z
      .string()
      .optional()
      .transform((v) => (v ? v : null)),
    status: z.enum(PUBLISH_STATUSES),
    published_at: z
      .string()
      .optional()
      .transform((v) => (v ? new Date(v).toISOString() : null)),
    is_demo: z
      .string()
      .optional()
      .transform((v) => v === "on"),
  })
  .extend(seoSchema.shape);

export const testimonialSchema = z.object({
  name: requiredText("Name", 120),
  role: optionalText(120),
  company: optionalText(160),
  quote: requiredText("Quote", 1200),
  photo_url: optionalText(500),
  status: z.enum(PUBLISH_STATUSES),
  is_demo: z
    .string()
    .optional()
    .transform((v) => v === "on"),
});

export const serviceSchema = z
  .object({
    name: requiredText("Service name", 80),
    tagline: requiredText("Tagline", 200),
    summary: requiredText("Summary", 400),
    description: requiredText("Description", 6000),
    capabilities: lines,
    included: lines,
    not_included: lines,
    features_json: z.string().optional(),
    benefits_json: z.string().optional(),
    faqs_json: z.string().optional(),
    status: z.enum(PUBLISH_STATUSES),
  })
  .extend(seoSchema.shape);

export const pricingPlanSchema = z.object({
  name: requiredText("Package name", 60),
  description: requiredText("Description", 300),
  monthly_price: z.coerce.number().int().min(0).max(1_000_000),
  setup_fee: z.coerce.number().int().min(0).max(1_000_000),
  ad_spend_range: requiredText("Recommended ad spend", 80),
  features: lines,
  cta_label: requiredText("CTA label", 60),
  cta_href: requiredText("CTA link", 200),
  badge: optionalText(40),
  sort_order: z.coerce.number().int().min(0).max(100),
  active: z
    .string()
    .optional()
    .transform((v) => v === "on"),
});

export const industrySchema = z
  .object({
    name: requiredText("Industry name", 80),
    headline: requiredText("Headline", 200),
    summary: requiredText("Summary", 600),
    examples: lines,
    focus: lines,
    services: serviceList,
    challenges_json: z.string().optional(),
    approach_json: z.string().optional(),
    faqs_json: z.string().optional(),
    status: z.enum(PUBLISH_STATUSES),
  })
  .extend(seoSchema.shape);

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

/** Convert FormData into a plain object, collecting repeated keys into arrays. */
export function formDataToObject(formData: FormData, arrayFields: string[] = []): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of arrayFields) out[key] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("$ACTION") || typeof value !== "string") continue;
    if (arrayFields.includes(key)) (out[key] as string[]).push(value);
    else out[key] = value;
  }
  return out;
}

export function fieldErrors(error: z.ZodError): Record<string, string[] | undefined> {
  return z.flattenError(error).fieldErrors as Record<string, string[] | undefined>;
}

/** Parse a JSON textarea used by structured CMS fields; returns fallback on invalid input. */
export function parseJsonField<T>(value: string | undefined, schema: z.ZodType<T>, fallback: T): { ok: boolean; value: T } {
  if (!value || !value.trim()) return { ok: true, value: fallback };
  try {
    const parsed = schema.safeParse(JSON.parse(value));
    return parsed.success ? { ok: true, value: parsed.data } : { ok: false, value: fallback };
  } catch {
    return { ok: false, value: fallback };
  }
}

export const benefitListSchema = z.array(z.object({ title: z.string().max(200), body: z.string().max(2000) })).max(20);
export const faqListSchema = z.array(z.object({ question: z.string().max(300), answer: z.string().max(3000) })).max(30);
export const metricListSchema = z
  .array(
    z.object({
      label: z.string().max(100),
      before: z.string().max(60).nullable(),
      after: z.string().max(60).nullable(),
      note: z.string().max(200).nullable(),
    }),
  )
  .max(12);

export { text as boundedText };
