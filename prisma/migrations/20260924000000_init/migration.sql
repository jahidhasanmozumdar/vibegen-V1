-- VibeGen Studio — initial schema (plain PostgreSQL, no Supabase features).
-- Mirrors prisma/schema.prisma; enum-like TEXT columns get CHECK constraints
-- that match the const arrays in lib/data/types.ts.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "full_name" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT 'staff',
    "avatar_url" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "profiles_role_check" CHECK ("role" IN ('admin', 'manager', 'staff'))
);

-- CreateTable
CREATE TABLE "admin_credentials" (
    "profile_id" UUID NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_credentials_pkey" PRIMARY KEY ("profile_id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "profile_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "used_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "website" TEXT,
    "country" TEXT,
    "industry" TEXT,
    "business_type" TEXT,
    "monthly_ad_spend" TEXT,
    "primary_platform" TEXT,
    "services" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "challenge" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "owner_id" UUID,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "source" TEXT NOT NULL DEFAULT 'direct',
    "form" TEXT NOT NULL DEFAULT 'manual',
    "attribution" JSONB,
    "last_activity_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_demo" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "leads_monthly_ad_spend_check" CHECK ("monthly_ad_spend" IN ('under_2500', '2500_5000', '5000_15000', '15000_50000', '50000_plus', 'not_running')),
    CONSTRAINT "leads_primary_platform_check" CHECK ("primary_platform" IN ('meta', 'google', 'both', 'other', 'none')),
    CONSTRAINT "leads_services_check" CHECK ("services" <@ ARRAY['meta-ads', 'google-ads', 'landing-pages', 'cro', 'analytics']::TEXT[]),
    CONSTRAINT "leads_status_check" CHECK ("status" IN ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost', 'archived')),
    CONSTRAINT "leads_source_check" CHECK ("source" IN ('google', 'meta', 'linkedin', 'organic', 'referral', 'direct', 'email', 'other')),
    CONSTRAINT "leads_form_check" CHECK ("form" IN ('growth_audit', 'contact', 'booking', 'manual'))
);

-- CreateTable
CREATE TABLE "lead_notes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "lead_id" UUID NOT NULL,
    "author_id" UUID,
    "author_name" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_activities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "lead_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "actor_name" TEXT,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_activities_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "lead_activities_type_check" CHECK ("type" IN ('submitted', 'status_changed', 'note_added', 'audit_requested', 'call_booked', 'proposal_sent', 'assigned', 'tags_updated', 'message_received', 'converted', 'updated'))
);

-- CreateTable
CREATE TABLE "audit_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "lead_id" UUID,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "website" TEXT,
    "audit_type" TEXT NOT NULL DEFAULT 'full_funnel',
    "status" TEXT NOT NULL DEFAULT 'new',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "assigned_to" UUID,
    "challenge" TEXT,
    "primary_platform" TEXT,
    "monthly_ad_spend" TEXT,
    "services_needed" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "summary" TEXT,
    "notes" TEXT,
    "completed_at" TIMESTAMPTZ(6),
    "is_demo" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_requests_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "audit_requests_audit_type_check" CHECK ("audit_type" IN ('full_funnel', 'paid_ads', 'landing_page', 'tracking')),
    CONSTRAINT "audit_requests_status_check" CHECK ("status" IN ('new', 'reviewing', 'in_progress', 'ready', 'sent', 'completed', 'archived')),
    CONSTRAINT "audit_requests_priority_check" CHECK ("priority" IN ('high', 'medium', 'low')),
    CONSTRAINT "audit_requests_primary_platform_check" CHECK ("primary_platform" IN ('meta', 'google', 'both', 'other', 'none')),
    CONSTRAINT "audit_requests_monthly_ad_spend_check" CHECK ("monthly_ad_spend" IN ('under_2500', '2500_5000', '5000_15000', '15000_50000', '50000_plus', 'not_running')),
    CONSTRAINT "audit_requests_services_needed_check" CHECK ("services_needed" <@ ARRAY['meta-ads', 'google-ads', 'landing-pages', 'cro', 'analytics']::TEXT[])
);

-- CreateTable
CREATE TABLE "audit_findings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "audit_id" UUID NOT NULL,
    "section" TEXT NOT NULL,
    "issue" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_findings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "audit_findings_section_check" CHECK ("section" IN ('website_overview', 'tracking', 'meta_ads', 'google_ads', 'landing_page', 'cro', 'analytics')),
    CONSTRAINT "audit_findings_priority_check" CHECK ("priority" IN ('high', 'medium', 'low')),
    CONSTRAINT "audit_findings_status_check" CHECK ("status" IN ('open', 'in_progress', 'resolved', 'wont_fix'))
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "website" TEXT,
    "country" TEXT,
    "business_type" TEXT,
    "monthly_ad_spend" TEXT,
    "services" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unread',
    "note" TEXT,
    "lead_id" UUID,
    "attribution" JSONB,
    "is_demo" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "contact_messages_monthly_ad_spend_check" CHECK ("monthly_ad_spend" IN ('under_2500', '2500_5000', '5000_15000', '15000_50000', '50000_plus', 'not_running')),
    CONSTRAINT "contact_messages_services_check" CHECK ("services" <@ ARRAY['meta-ads', 'google-ads', 'landing-pages', 'cro', 'analytics']::TEXT[]),
    CONSTRAINT "contact_messages_status_check" CHECK ("status" IN ('unread', 'read', 'archived'))
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "lead_id" UUID,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "meeting_at" TIMESTAMPTZ(6),
    "meeting_type" TEXT NOT NULL DEFAULT 'strategy_call',
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "source" TEXT NOT NULL DEFAULT 'direct',
    "provider" TEXT NOT NULL DEFAULT 'manual',
    "external_id" TEXT,
    "notes" TEXT,
    "is_demo" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "bookings_meeting_type_check" CHECK ("meeting_type" IN ('strategy_call', 'audit_review', 'follow_up')),
    CONSTRAINT "bookings_status_check" CHECK ("status" IN ('scheduled', 'completed', 'cancelled', 'no_show', 'follow_up')),
    CONSTRAINT "bookings_source_check" CHECK ("source" IN ('google', 'meta', 'linkedin', 'organic', 'referral', 'direct', 'email', 'other')),
    CONSTRAINT "bookings_provider_check" CHECK ("provider" IN ('manual', 'calendly', 'cal_com', 'other'))
);

-- CreateTable
CREATE TABLE "testimonials" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "role" TEXT,
    "company" TEXT,
    "quote" TEXT NOT NULL,
    "photo_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "is_demo" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "testimonials_status_check" CHECK ("status" IN ('draft', 'published'))
);

-- CreateTable
CREATE TABLE "case_studies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "industry" TEXT,
    "excerpt" TEXT NOT NULL DEFAULT '',
    "challenge" TEXT NOT NULL DEFAULT '',
    "strategy" TEXT NOT NULL DEFAULT '',
    "execution" TEXT NOT NULL DEFAULT '',
    "results" TEXT NOT NULL DEFAULT '',
    "metrics" JSONB NOT NULL DEFAULT '[]',
    "services" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "duration" TEXT,
    "ad_spend" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "testimonial_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMPTZ(6),
    "seo_title" TEXT,
    "seo_description" TEXT,
    "canonical_url" TEXT,
    "og_title" TEXT,
    "og_description" TEXT,
    "og_image" TEXT,
    "noindex" BOOLEAN NOT NULL DEFAULT false,
    "is_demo" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_studies_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "case_studies_industry_check" CHECK ("industry" IN ('saas', 'home-services', 'professional-services', 'ecommerce')),
    CONSTRAINT "case_studies_services_check" CHECK ("services" <@ ARRAY['meta-ads', 'google-ads', 'landing-pages', 'cro', 'analytics']::TEXT[]),
    CONSTRAINT "case_studies_status_check" CHECK ("status" IN ('draft', 'published'))
);

-- CreateTable
CREATE TABLE "services" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL DEFAULT '',
    "summary" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "capabilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "features" JSONB NOT NULL DEFAULT '[]',
    "benefits" JSONB NOT NULL DEFAULT '[]',
    "included" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "not_included" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "faqs" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "canonical_url" TEXT,
    "og_title" TEXT,
    "og_description" TEXT,
    "og_image" TEXT,
    "noindex" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "services_slug_check" CHECK ("slug" IN ('meta-ads', 'google-ads', 'landing-pages', 'cro', 'analytics')),
    CONSTRAINT "services_status_check" CHECK ("status" IN ('draft', 'published'))
);

-- CreateTable
CREATE TABLE "pricing_plans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "monthly_price" INTEGER NOT NULL DEFAULT 0,
    "setup_fee" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "ad_spend_range" TEXT NOT NULL DEFAULT '',
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cta_label" TEXT NOT NULL DEFAULT '',
    "cta_href" TEXT NOT NULL DEFAULT '',
    "badge" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pricing_plans_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "pricing_plans_monthly_price_check" CHECK ("monthly_price" >= 0),
    CONSTRAINT "pricing_plans_setup_fee_check" CHECK ("setup_fee" >= 0),
    CONSTRAINT "pricing_plans_currency_check" CHECK ("currency" IN ('USD'))
);

-- CreateTable
CREATE TABLE "industries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "headline" TEXT NOT NULL DEFAULT '',
    "summary" TEXT NOT NULL DEFAULT '',
    "examples" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "focus" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "challenges" JSONB NOT NULL DEFAULT '[]',
    "approach" JSONB NOT NULL DEFAULT '[]',
    "services" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "faqs" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "canonical_url" TEXT,
    "og_title" TEXT,
    "og_description" TEXT,
    "og_image" TEXT,
    "noindex" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "industries_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "industries_slug_check" CHECK ("slug" IN ('saas', 'home-services', 'professional-services', 'ecommerce')),
    CONSTRAINT "industries_services_check" CHECK ("services" <@ ARRAY['meta-ads', 'google-ads', 'landing-pages', 'cro', 'analytics']::TEXT[]),
    CONSTRAINT "industries_status_check" CHECK ("status" IN ('draft', 'published'))
);

-- CreateTable
CREATE TABLE "blog_categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "featured_image" TEXT,
    "author" TEXT NOT NULL DEFAULT '',
    "category_id" UUID,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMPTZ(6),
    "reading_minutes" INTEGER NOT NULL DEFAULT 1,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "canonical_url" TEXT,
    "og_title" TEXT,
    "og_description" TEXT,
    "og_image" TEXT,
    "noindex" BOOLEAN NOT NULL DEFAULT false,
    "is_demo" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "blog_posts_status_check" CHECK ("status" IN ('draft', 'published', 'scheduled')),
    CONSTRAINT "blog_posts_reading_minutes_check" CHECK ("reading_minutes" >= 0),
    CONSTRAINT "blog_posts_scheduled_has_date" CHECK ("status" <> 'scheduled' OR "published_at" IS NOT NULL)
);

-- CreateTable
CREATE TABLE "media" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "path" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "media_size_bytes_check" CHECK ("size_bytes" >= 0)
);

-- CreateTable
CREATE TABLE "utm_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_id" TEXT NOT NULL,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "utm_term" TEXT,
    "utm_content" TEXT,
    "referrer" TEXT,
    "landing_page" TEXT,
    "device" TEXT,
    "country" TEXT,
    "is_demo" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "utm_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "path" TEXT,
    "source" TEXT NOT NULL DEFAULT 'direct',
    "session_id" TEXT,
    "properties" JSONB NOT NULL DEFAULT '{}',
    "is_demo" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "analytics_events_source_check" CHECK ("source" IN ('google', 'meta', 'linkedin', 'organic', 'referral', 'direct', 'email', 'other'))
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "link" TEXT,
    "read_at" TIMESTAMPTZ(6),
    "is_demo" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notifications_type_check" CHECK ("type" IN ('new_lead', 'new_audit', 'new_message', 'new_booking', 'audit_completed', 'lead_status_updated'))
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");
CREATE INDEX "password_reset_tokens_profile_id_idx" ON "password_reset_tokens"("profile_id");
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");
CREATE INDEX "leads_status_idx" ON "leads"("status");
CREATE INDEX "leads_created_at_idx" ON "leads"("created_at" DESC);
CREATE INDEX "leads_email_idx" ON "leads"("email");
CREATE INDEX "leads_owner_id_idx" ON "leads"("owner_id");
CREATE INDEX "leads_is_demo_idx" ON "leads"("is_demo");
CREATE INDEX "lead_notes_lead_id_created_at_idx" ON "lead_notes"("lead_id", "created_at" DESC);
CREATE INDEX "lead_activities_lead_id_created_at_idx" ON "lead_activities"("lead_id", "created_at" DESC);
CREATE INDEX "audit_requests_status_idx" ON "audit_requests"("status");
CREATE INDEX "audit_requests_created_at_idx" ON "audit_requests"("created_at" DESC);
CREATE INDEX "audit_requests_email_idx" ON "audit_requests"("email");
CREATE INDEX "audit_requests_lead_id_idx" ON "audit_requests"("lead_id");
CREATE INDEX "audit_requests_assigned_to_idx" ON "audit_requests"("assigned_to");
CREATE INDEX "audit_requests_is_demo_idx" ON "audit_requests"("is_demo");
CREATE INDEX "audit_findings_audit_id_idx" ON "audit_findings"("audit_id");
CREATE INDEX "contact_messages_status_idx" ON "contact_messages"("status");
CREATE INDEX "contact_messages_created_at_idx" ON "contact_messages"("created_at" DESC);
CREATE INDEX "contact_messages_email_idx" ON "contact_messages"("email");
CREATE INDEX "contact_messages_lead_id_idx" ON "contact_messages"("lead_id");
CREATE INDEX "contact_messages_is_demo_idx" ON "contact_messages"("is_demo");
CREATE INDEX "bookings_status_idx" ON "bookings"("status");
CREATE INDEX "bookings_created_at_idx" ON "bookings"("created_at" DESC);
CREATE INDEX "bookings_meeting_at_idx" ON "bookings"("meeting_at");
CREATE INDEX "bookings_email_idx" ON "bookings"("email");
CREATE INDEX "bookings_lead_id_idx" ON "bookings"("lead_id");
CREATE INDEX "bookings_is_demo_idx" ON "bookings"("is_demo");
CREATE UNIQUE INDEX "bookings_provider_external_id_key" ON "bookings"("provider", "external_id");
CREATE INDEX "testimonials_status_idx" ON "testimonials"("status");
CREATE INDEX "testimonials_is_demo_idx" ON "testimonials"("is_demo");
CREATE UNIQUE INDEX "case_studies_slug_key" ON "case_studies"("slug");
CREATE INDEX "case_studies_status_published_at_idx" ON "case_studies"("status", "published_at" DESC);
CREATE INDEX "case_studies_is_demo_idx" ON "case_studies"("is_demo");
CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");
CREATE UNIQUE INDEX "pricing_plans_slug_key" ON "pricing_plans"("slug");
CREATE INDEX "pricing_plans_active_sort_order_idx" ON "pricing_plans"("active", "sort_order");
CREATE UNIQUE INDEX "industries_slug_key" ON "industries"("slug");
CREATE UNIQUE INDEX "blog_categories_slug_key" ON "blog_categories"("slug");
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");
CREATE INDEX "blog_posts_status_published_at_idx" ON "blog_posts"("status", "published_at" DESC);
CREATE INDEX "blog_posts_category_id_idx" ON "blog_posts"("category_id");
CREATE INDEX "blog_posts_is_demo_idx" ON "blog_posts"("is_demo");
CREATE INDEX "media_created_at_idx" ON "media"("created_at" DESC);
CREATE INDEX "utm_sessions_session_id_idx" ON "utm_sessions"("session_id");
CREATE INDEX "utm_sessions_created_at_idx" ON "utm_sessions"("created_at" DESC);
CREATE INDEX "utm_sessions_is_demo_idx" ON "utm_sessions"("is_demo");
CREATE INDEX "analytics_events_created_at_idx" ON "analytics_events"("created_at" DESC);
CREATE INDEX "analytics_events_name_created_at_idx" ON "analytics_events"("name", "created_at" DESC);
CREATE INDEX "analytics_events_is_demo_idx" ON "analytics_events"("is_demo");
CREATE UNIQUE INDEX "site_settings_key_key" ON "site_settings"("key");
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at" DESC);
CREATE INDEX "notifications_is_demo_idx" ON "notifications"("is_demo");

-- AddForeignKey
ALTER TABLE "admin_credentials" ADD CONSTRAINT "admin_credentials_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "leads" ADD CONSTRAINT "leads_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "lead_notes" ADD CONSTRAINT "lead_notes_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lead_notes" ADD CONSTRAINT "lead_notes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "audit_requests" ADD CONSTRAINT "audit_requests_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "audit_requests" ADD CONSTRAINT "audit_requests_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "audit_findings" ADD CONSTRAINT "audit_findings_audit_id_fkey" FOREIGN KEY ("audit_id") REFERENCES "audit_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_testimonial_id_fkey" FOREIGN KEY ("testimonial_id") REFERENCES "testimonials"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "blog_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
