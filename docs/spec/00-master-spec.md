# VibeGen Studio — Master Specification

> Source of truth for the VibeGen Studio website + admin dashboard.
> Condensed from the original master development prompt. Every requirement is kept, and section numbers match the original brief (§1–§122) so they can be cross-referenced.
> The execution plan and phase tracker live in [01-implementation-plan.md](./01-implementation-plan.md).

---

## Part A — Business & positioning

### §1 Business
- **Company:** VibeGen Studio. **Domain:** https://vibegen.studio
- **Markets:** United States and United Kingdom.
- **Customers:** startups, SaaS, SMBs, local service businesses, professional services, e-commerce, and businesses already spending on paid ads.
- **Objective:** generate qualified leads and sales conversations. The site is a **client acquisition system**, not a brochure.

### §2 Positioning
- Primary: **Performance Marketing & Conversion**.
- Core message: **"Turn Paid Traffic Into Measurable Growth."**
- Services work together as **one growth system**: Meta Ads, Google Ads, conversion landing pages, CRO, analytics & tracking.
- Not a social media agency. Not a cheap freelancer.
- Banned phrases: "Take your business to the next level", "Unlock your potential", "Transform your business with innovation", and similar empty language.

### §3 Core services (exactly five)
| Service | Focus |
|---|---|
| **Meta Ads** | Facebook/Instagram, prospecting, retargeting, audience testing, campaign structure, budget optimization, conversion optimization, funnel alignment, performance monitoring |
| **Google Ads** | Search ads, keyword research, search intent, negative keywords, structure, bid optimization, conversion tracking, search term analysis, remarketing where appropriate, budget allocation |
| **Landing Pages** | Conversion landing pages, mobile-first, value prop, CTA, lead forms, trust, social proof, offer, tracking, speed. **Scope: campaign/conversion pages, not unlimited full websites.** |
| **CRO** | Page/funnel analysis, CTA, forms, headlines, trust, social proof, friction, UX, experiments, heatmaps/recordings where appropriate, qualitative + quantitative. **No unlimited A/B tests; testing depends on traffic and conversion volume.** |
| **Analytics & Tracking** | GA4, GTM, Meta Pixel, conversion events, UTM, funnel, lead tracking, Google Ads and Meta conversions, CRM integrations where feasible, server-side/CAPI where appropriate, attribution and reporting |

### §4 Brand principle: must not look AI-generated
Avoid: excessive gradients, glowing blobs, glassmorphism, huge meaningless type, over-rounded cards, floating 3D, AI illustrations, generic dashboard mockups, animated counters, particles, cursor effects, heavy parallax, purple/blue gradient overuse, SaaS-template look, stock photos, **fake logos, reviews, case studies or numbers**.
Feel: human, intentional, premium, modern, editorial, strategic, minimal, confident, conversion-focused. Intelligent whitespace, strong type hierarchy, subtle borders, restrained motion.

### §5 Visual direction
- Colors: `#0A84FF` `#1446A0` `#7A3EFF` `#02D3C9` `#1A1C1E` `#F7F9FC` `#5A6470`.
- Primary UI: `#1A1C1E`, `#F7F9FC`, `#0A84FF`. Purple and cyan are **accents only**.
- Fonts: **Sora** for headings, **Inter** for body/UI.

### §6 Technology
TypeScript throughout, with no `any`. Use interfaces, generics and typed API responses. Tailwind CSS. Supabase (Postgres, Auth, RLS, Storage) preferred. **Preserve any existing architecture**; this repo is Next.js 16 App Router + Tailwind v4, so that is what we use (see plan).

### §7 Inspect first
Inspect the repo, package.json, routes, components, styles, assets, env, API, DB and deploy config before coding. Preserve and reuse what exists. Write an internal plan first.

---

## Part B — Public website

### §8 Routes
`/` · `/services` · `/services/{meta-ads,google-ads,landing-pages,cro,analytics}` · `/industries` · `/industries/{saas,home-services,professional-services,ecommerce}` · `/case-studies` · `/pricing` · `/process` · `/about` · `/contact` · `/book-a-call` · `/resources` · `/blog` · `/free-growth-audit` · `/privacy` · `/terms` · `/cookie-policy`

### §9 Header
Logo · Services · Industries · Case Studies · Pricing · Resources · About. Primary CTA **Get a Free Growth Audit**, secondary **Book a Strategy Call**. Clean, sticky where appropriate, professional mobile menu with the CTA easy to reach.

### §10 Homepage order
Header → Hero → Trust/tech strip → Problem → Services → Growth System → Case Studies/Experiments → How We Work → Industries → Metrics/Measurement → Pricing → FAQ → Final CTA → Footer.

### §11 Hero
- H1: **Turn Paid Traffic Into Measurable Growth.**
- Sub: "VibeGen builds and manages conversion-focused acquisition systems using Meta Ads, Google Ads, landing pages, CRO and reliable analytics."
- CTAs: **Get a Free Growth Audit** / **View Our Services**.
- Visual: a realistic internal-interface funnel (Traffic → Landing Page → Leads → Customers → Revenue), labelled **"Illustrative dashboard" / "Sample data"**. Never a fake client dashboard.

### §12 Trust strip
Google Ads, Meta Ads, GA4, Google Tag Manager, Conversion Tracking. **No partner claims or badges unless verified.**

### §13 Problem
H2: **"Your Ads Are Getting Traffic. But Are They Getting Results?"** Problems: high CPC, low CVR, poor landing page experience, weak offers, broken tracking, unclear attribution, poor lead quality, optimizing without reliable data.

### §14 Services section
Five cards (name, short explanation, capabilities, Learn More). **Not visually identical**; use subtle hierarchy.

### §15 Growth system
H2: **"One Growth System. Not Five Disconnected Services."**
ATTRACT (Meta + Google) → CAPTURE (Landing Page) → CONVERT (CRO) → MEASURE (Analytics & Tracking) → OPTIMIZE (Continuous Improvement).

### §16 Case studies
If there are no real case studies, show **"Performance Experiments" / "What We're Building"** with demo examples labelled **"Illustrative Example — Not Client Data"**. CMS must support: client, industry, challenge, strategy, execution, before/after metrics, duration, ad spend, leads, CPL, CVR, ROAS, revenue where permitted, testimonial. **Never invent real results.**

### §17 Free Growth Audit (`/free-growth-audit`), the most important feature
H1 **Get a Free Growth Audit**. Fields: Full Name, Work Email, Company, Website URL, Country, Industry, Monthly Ad Spend, Primary Platform, Current Challenge, Services Needed, Additional Message, Consent checkbox. Submit: **Request My Growth Audit**.
On submit: validate → save lead → create audit request → timestamp → source → UTM → confirmation page → admin notification → optional confirmation email.

### §18 Contact (`/contact`)
Name, Business Email, Company, Website, Country, Business Type, Monthly Ad Spend, Services Interested In, Message. Stored in the DB.

### §19 Book a Call (`/book-a-call`)
H1 **30-Minute Growth Strategy Call**. Not a generic sales call. Covers current acquisition, paid traffic, conversion issues, tracking, opportunities and next steps. Integrate a booking provider if configured. **No fake availability.**

### §20 Pricing
| Plan | Monthly | Setup | Recommended ad spend | Notes |
|---|---|---|---|---|
| **Launch** | $1,250 | $750 | $2,500+/mo | Meta + Google, 2 Meta campaigns, search mgmt, basic retargeting, 1 landing page, basic CRO, GA4, GTM, Pixel, conversion tracking, monthly reporting |
| **Growth** ★ Recommended | $2,250 | $1,250 | $5,000–$15,000/mo | Multiple Meta campaigns, prospecting, retargeting, Google Search, advanced keywords, LP optimization/build, CRO, GA4, GTM, Meta tracking, UTM, funnel reporting, bi-weekly reporting, 2 strategy calls/mo |
| **Performance** | $3,750 | $1,750 | $15,000–$50,000+/mo | Full Meta + Google, advanced audiences, full-funnel, advanced CRO, up to 2 LP builds/optimizations monthly, GA4, GTM, advanced tracking, CAPI where applicable, CRM/offline conversions where feasible, attribution analysis, custom reporting, weekly call |

### §21 Pricing disclaimers
Ad spend is separate and paid directly to the platforms. **No guarantee** of leads, revenue, ROAS, CPA or CVR. Performance depends on market, offer, competition, budget, website, pricing, sales process, lead follow-up, tracking and platform changes.

### §22 Industries
- **SaaS:** demos, trials, lead gen, paid acquisition, funnel optimization.
- **Home Services** (roofing, HVAC, plumbing, cleaning, landscaping, remodeling, pest control): leads, calls, quotes, local acquisition.
- **Professional Services** (consulting, agencies, legal, accounting, B2B): qualified leads, consultations, lead quality.
- **E-commerce:** product acquisition, retargeting, CRO, tracking, revenue attribution.
- No claims of industry expertise or results without real support.

### §23 Process
Discover → Audit → Build → Launch → Optimize → Scale. Each stage covers what happens, what VibeGen does, what the client provides, and deliverables.

### §24 About
What VibeGen is, the problem it solves, how it works, philosophy, founder section (factual, no exaggeration, no implied large portfolio).

### §25 Resources
`/resources` sections: Guides, Blog, Marketing Resources, Growth Audit.

### §26 Blog (CMS-ready)
Fields: title, slug, excerpt, content, featured image, author, category, tags, SEO title/description, OG image, published/updated dates, status (Draft/Published/Scheduled). Admin: create, edit, delete, publish, unpublish, search, filter.

---

## Part C — Admin dashboard

### §27 `/admin`, secure
Real authentication only; no fake frontend-only login.

### §28 Sidebar
Dashboard · Leads · Audit Requests · Contact Messages · Bookings · Case Studies · Blog · Testimonials · Services · Pricing · Industries · Settings · Analytics · Logout.

### §29 Overview KPIs
Total leads, new leads, audit requests, pending audits, contact messages, booked calls, conversion rate, and this month's leads/audits/bookings. Show % change vs the previous period when there is enough data. Label demo data **Demo Data**.

### §30 Charts
Leads over time, audits over time, traffic sources, lead sources, service interest, monthly conversion rate, lead status distribution, audit status distribution. Meaningful, not overloaded.

### §31 Leads (`/admin/leads`)
Columns: Name, Company, Email, Website, Industry, Source, Service, Status, Created, Actions.
Statuses: New, Contacted, Qualified, Proposal, Won, Lost, Archived.
Actions: search, filter, sort, view, update status, notes, assign owner, tags, view source/UTM, delete/archive.

### §32 Lead detail
Lead/company/contact info, requested services, ad spend, source, UTM source/medium/campaign, landing page, created/updated, status, notes, **activity timeline**, audit history, booking history, admin actions.

### §33 Audits (`/admin/audits`)
Columns: Lead, Company, Website, Audit Type, Status, Assigned To, Created, Actions.
Statuses: New, Reviewing, In Progress, Ready, Sent, Completed, Archived.
Actions: open, add findings and recommendations, priority, assign, status, notes, mark completed.

### §34 Audit workspace
Sections: Website Overview, Tracking, Meta Ads, Google Ads, Landing Page, CRO, Analytics, Recommendations, Priority, Notes, Status. Each issue has Issue, Impact, Recommendation, Priority (High/Medium/Low) and Status.

### §35 Messages (`/admin/messages`)
Search, filter, view, mark read/unread, archive, note, **convert to lead**, delete/archive.

### §36 Bookings (`/admin/bookings`)
Name, Company, Email, Meeting Date, Meeting Type, Status, Source, Actions. Statuses: Scheduled, Completed, Cancelled, No-show, Follow-up. Without an integration, provide a clean placeholder/integration layer; never pretend one exists.

### §37 Case study CMS
Title, slug, client, industry, challenge, strategy, execution, results, metrics, images, testimonial, status, published date, **`is_demo`**. If `is_demo` is set, the frontend shows **"Illustrative Example — Demo Data"**.

### §38 Testimonial CMS
Name, role, company, quote, photo, status; create/edit/delete/publish. No fake testimonials; demo content must be clearly labelled.

### §39 Services CMS
Name, description, features, benefits, FAQ, SEO title/description, status. Content is not hardcoded everywhere.

### §40 Pricing CMS
Name, monthly price, setup fee, recommended ad spend, features, CTA, badge, order, active.

### §41 Admin analytics
Total/qualified/won leads, lead CVR, audit requests, audit completion rate, bookings, booking conversion, top sources/services/industries/landing pages, UTM performance, monthly trend. Date filters: 7d, 30d, 90d, 6m, 12m, custom.

### §42 & §83 Source tracking and attribution
utm_source/medium/campaign/term/content, referrer, landing_page, first_visit, last_visit, device, country (where appropriate), source (Google, Meta, LinkedIn, Organic, Referral, Direct, Other), first-touch, last-touch, timestamp. Collect no unnecessary personal data.

### §43 Form security
Validation, sanitization, rate limiting, spam protection, CSRF where applicable, secure writes, error/success/loading states, duplicate-submission protection. Never expose private or service-role keys.

### §44 Email
Admin notified of new leads and audits; lead confirmation where appropriate. Professional templates, credentials in env only, clean service abstraction.

### §45 Admin auth
Email/password or OAuth, protected routes, sessions, logout, password recovery if supported, unauthorized handling, **roles: Admin / Manager / Staff**.

### §46 Tables
users, profiles, leads, lead_notes, lead_activities, audit_requests, audit_findings, contact_messages, bookings, case_studies, testimonials, services, pricing_plans, industries, blog_posts, blog_categories, media, utm_sessions, analytics_events, site_settings, notifications. PKs, FKs, indexes, created_at/updated_at, status fields, soft delete.

### §47 RLS
Public users may **only submit forms and read published content**. Leads, emails, audits, notes and admin data are never public.

### §48 & §70 & §84 Demo data and demo mode
Seed: 25 leads, 12 audits, 8 bookings, 6 messages, 5 demo case studies, 10 blog posts, demo analytics. All flagged `is_demo`, with a **Demo Data / Demo environment** badge in the admin. Easy to remove. Demo mode flag (`NEXT_PUBLIC_DEMO_MODE`, equivalent of `VITE_DEMO_MODE`): show the badge, use demo data, send no real emails, send no fake data to analytics.

### §49–§51 States
Professional empty states ("No leads yet." and so on, with CTAs), skeleton loaders, disabled buttons while submitting, no blank screens, friendly errors ("Something went wrong." with Try again), never raw DB errors.

### §64 Notification center
New lead, new audit, new message, new booking, audit completed, lead status updated. Read/unread, timestamp, link to the record.

### §65 Global search
Leads, audits, messages, case studies, blog. Debounced, with useful empty results.

### §66 Filters
Status, date, source, industry, service, assignee, demo/real. Stored in URL query params.

### §67–§69 Admin UX
Modern internal SaaS feel (CRM + analytics + CMS), not Bootstrap. Fixed sidebar on desktop and a drawer on mobile, active route shown, keyboard accessible. Top bar: title, breadcrumb, search, notifications, profile.

### §85–§87 Dashboard home layout
Title "Overview" + date range + demo badge → 4–6 KPIs → lead trend → sources + service interest → recent leads (Name, Company, Service, Source, Status, Date, Action) → recent audits (Company, Website, Audit Type, Priority, Status, Assigned, Date, Action) → upcoming bookings → quick actions (Add Case Study, Create Blog Post, Review Leads, Review Audits).

### §88–§90 Settings
Sections: General, Profile, Notifications, Integrations, Tracking, Email, Security, Site Settings. Integrations: GA4 ID, GTM ID, Meta Pixel ID, Google Ads conversion ID, Booking URL, email provider, Supabase status. Secrets are never exposed. CMS SEO fields: SEO title, meta description, canonical, OG title/description/image, index/noindex.

---

## Part D — Cross-cutting

### §52 & §95 SEO
Per-page title, description, canonical, OG, Twitter; sitemap; robots; semantic HTML; heading hierarchy; alt text; internal links; clean URLs. JSON-LD: Organization, WebSite, Service, Article, BreadcrumbList. **No fake ratings in schema.**

### §53 Performance
Excellent Lighthouse scores. Optimized images and fonts, code splitting, lazy loading, caching. No heavy animation libraries.

### §54 & §94 Accessibility
WCAG: keyboard navigation, visible focus, labels, minimal ARIA, semantic HTML, contrast, accessible dialogs and navigation, and **status never shown by color alone**.

### §55 & §93 Responsive
Mobile through large desktop, with mobile designed deliberately. Admin works on tablet and mobile; tables become cards or scroll.

### §56 Animation
Fade, slide-up, hover, section reveal, chart animation. No parallax, particles, cursor effects or constant floating.

### §58 Icons
One consistent icon set (Lucide), used sparingly.

### §59 Footer
Name, description, Services, Industries, Company, Resources, Contact, Privacy, Terms, Cookie Policy, social links (verified only), "© 2026 VibeGen Studio. All rights reserved."

### §60–§62 Legal, consent, tracking
Privacy/Terms/Cookie templates with a jurisdiction-review note and no automatic GDPR/CCPA claims. Cookie consent: Accept / Reject / Manage. No marketing trackers before consent. A central tracking utility for GA4, GTM, Pixel, Google Ads, Meta events, UTM and consent.

### §63 Conversion events
`growth_audit_submit`, `contact_submit`, `book_call_click`, `service_view`, `pricing_view`, `case_study_view`, `form_start`, `form_error`, `external_booking_click`.

### §73–§74 Security & API
Env vars, secure auth, RLS, validation, output escaping, rate limits, spam protection, secure cookies, no secrets in the bundle. API: `/api/{leads,audits,messages,bookings,case-studies,blog,services,pricing,analytics}` with auth on admin endpoints, correct status codes, and the envelope `{ success, data, message }` / `{ success:false, message }`.

### §75–§77 Components & design system
Folders: layout, navigation, footer, hero, sections, forms, cards, buttons, charts, tables, modals, admin, dashboard, seo, tracking. UI kit: Button, Input, Textarea, Select, Checkbox, Badge, Card, Modal, Drawer, Table, Tabs, Toast, Alert, Tooltip, Dropdown, Pagination, Skeleton, EmptyState, ErrorState. Button labels: Get a Free Growth Audit, Book a Strategy Call, View Services, View Case Study, Learn More, Submit Request, Save Changes. Never "Click Here" or "Submit Form".

### §79–§81 Honesty rules
No fake logos, testimonials, awards, partnerships, reviews, revenue, ROAS, lead counts, ratings, badges or certifications. No fake urgency. **CTA discipline:** primary *Get a Free Growth Audit*, secondary *Book a Strategy Call*.

### §82 Funnel
Visitor → Service/Industry content → Free Growth Audit → Lead → Admin review → Qualified → Strategy Call → Proposal → Client. The admin can monitor it.

### §91–§92 Errors
404: "Page not found." with Back to Home / Explore Services. Global error: "Something went wrong." with Try Again / Back to Home. No stack traces.

### §96 Internal linking
Service ↔ industry, service → case study, service → pricing, blog → service, industry → service, case study → audit.

### §97 & §121 Footer CTA / final CTA
- "Ready to see where your funnel is leaking?" / "Get a practical growth audit covering acquisition, landing pages, conversion and tracking." / **Get a Free Growth Audit**
- "Turn Your Paid Traffic Into a Measurable Growth System." / "Let's find the gaps in your acquisition funnel before you spend more money sending traffic into it." / **Get a Free Growth Audit** + **Book a Strategy Call**

### §98–§104 Copy style
Clear, specific, short, confident, human; written the way a smart growth consultant talks to a business owner. Banned: unlock, transform, revolutionize, game-changing, cutting-edge, next-generation. Metrics (CTR, CPC, CPA, CPL, CVR, ROAS, CAC, LTV) are never guarantees. CRO is **not** "change the button color". Analytics = "Know what is actually working." Landing pages: Ad → Page → Conversion, matched on intent, offer, message, audience, CTA and tracking.

### §106–§109 Scope & ownership
Meta: creative production **not** included; clients provide images, videos and brand assets. Clients provide images, videos, brand assets, offer details, testimonials, product information and legal information. Clients own Business Manager, ad accounts, GA4, GTM, website, domain and CRM; VibeGen gets access.

### §110 FAQ
Covers: creatives, whether ad spend is included, lead and ROAS guarantees, account ownership, needing a website, landing pages, SaaS, local businesses, ad budget, setup time, first month, broken tracking, working outside the US, UK businesses, minimum contract, cancelling, reports, CRM integration.

### §111 Contact info
No invented phone, address, email, socials or registration. Values come from env/config.

### §114–§116 Process & quality
Build in phases 1–8 (see plan). After each phase: run, type-check, check the console, imports, routes, responsiveness, forms, DB and auth, and fix before continuing. Small components, hooks, a service layer, and centralized validation, tracking and config. No giant components, `any`, dead code, production console logs or fake API calls.

### §117–§119 Env, README, checklist
`.env.example` with public vs secret documented (server secrets never use the public prefix). README covers overview, stack, setup, env, dev, build, deploy, DB, demo mode, admin, tracking, CMS and the production checklist.

### §120 Most important
Optimize for **how clearly a potential client understands VibeGen and takes the next step**: problem → solution → services → process → pricing → trust → audit → call.

### §122 Final deliverable
A working loop: visitor submits an audit → it hits the DB → admin sees it immediately → reviews it, changes status, adds notes → tracks it through the funnel, manages content and views analytics. The handover must include: structure, schema, routes, admin routes, env vars, setup, demo credentials, deployment, implemented features, external integrations left to configure, and the QA checklist.
