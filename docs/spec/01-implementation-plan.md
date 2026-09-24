# VibeGen Studio — Implementation Plan & Execution Tracker

Companion to [00-master-spec.md](./00-master-spec.md). Update the checkboxes as phases complete.
Conventions for anyone (human or agent) working on the codebase are in the project skill at
[`.claude/skills/vibegen-build/SKILL.md`](../../.claude/skills/vibegen-build/SKILL.md).

## 1. Starting point (inspected 2026-09-24)

- Fresh `create-next-app`: **Next.js 16.3 (App Router, Turbopack)**, React 19.2, TypeScript strict, **Tailwind CSS v4**, pnpm, ESLint 9.
- No existing routes, components, backend or deployment config worth preserving.
- **Decision:** keep Next.js instead of switching to the Vite stack the brief prefers. §6 says to preserve the existing architecture, and Next gives us SSR/SEO, route handlers, server actions and a proxy out of the box.

### Next.js 16 rules that affect this build
- `params`, `searchParams`, `cookies()` and `headers()` are **async**: always `await` them.
- `middleware.ts` is now **`proxy.ts`** (export `proxy`; Node runtime only).
- `revalidateTag(tag, profile)` needs two arguments. Prefer `revalidatePath` in admin actions.
- Turbopack is the default for dev and build.
- Bundled docs: `node_modules/next/dist/docs/`. Read them before using an unfamiliar API.

## 2. Architecture

```
app/
  (marketing)/            public site (header, footer, consent, attribution capture)
  admin/(auth)/           login, forgot/reset password (no sidebar)
  admin/(panel)/          protected dashboard (sidebar + top bar)
  api/                    route handlers (JSON envelope)
  sitemap.ts robots.ts not-found.tsx global-error.tsx
components/
  ui/ layout/ sections/ forms/ charts/ admin/ seo/ tracking/
lib/
  config/     env.ts (public), server-env.ts (server-only), site.ts (nav/CTA)
  data/       types.ts (contract), labels.ts, store.ts (interface),
              local-store.ts (JSON demo driver), supabase-store.ts, index.ts, seed.ts
  auth/       session.ts (requireUser/can/signIn), token.ts (HMAC cookie)
  validation/ schemas.ts (Zod 4, shared client and server)
  security/   rate-limit.ts, spam.ts, request.ts
  services/   domain logic: submissions, leads, audits, messages, bookings, content, analytics, notifications, search
  email/      provider abstraction (console | resend) and templates
  tracking/   consent + track() + attribution (client)
  content/    starter copy: services, industries, pricing, faqs, process, blog, demo
supabase/migrations/      SQL schema + RLS
docs/spec/                this spec
```

### Data layer
- One typed `DataStore` interface (`list/get/findOne/insert/insertMany/update/remove/removeWhere/count`).
- **Driver selection:** if `NEXT_PUBLIC_SUPABASE_URL` and the anon key are set, use Supabase; otherwise use the local JSON file (`.data/vibegen-db.json`, auto-seeded).
- Trust levels: `publicStore()` (anon, published content), `adminStore()` (session, RLS staff), `serviceStore()` (service role, server-only, validated public submissions).
- Pages and components never call a store directly for writes; they go through `lib/services/*`.

### Auth
- Supabase Auth plus a `profiles.role` of admin, manager or staff; permissions come from `can(user, permission)`.
- Local/demo: credentials from `DEMO_ADMIN_EMAIL` / `DEMO_ADMIN_PASSWORD` and an HMAC-signed httpOnly cookie (`SESSION_SECRET`).
- `proxy.ts` makes optimistic redirects; **`requireUser()` runs in every admin layout, page and action**.

### Forms
- Server actions with `useActionState`, Zod validation, honeypot + time trap, a per-IP rate limit, duplicate-submission guard (same email and form within 60s), and attribution JSON carried in a hidden field.
- Success leads to a confirmation page and a tracked conversion event (consent-gated).

### Tracking
- `lib/tracking`: consent state (necessary / analytics / marketing), `track(event, params)` fans out to dataLayer, gtag and fbq **only when consent is given**.
- GTM, GA4 and Pixel scripts load only after consent. Demo mode sends nothing to third parties.

## 3. Phases

### Phase 1 — Foundation
- [x] Inspect repo, read Next 16 upgrade/proxy docs
- [x] Dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `lucide-react`, `server-only` (charts are hand-built SVG)
- [x] Tailwind v4 theme tokens in `app/globals.css` (`@theme`)
- [x] Config: env, server-env, site/nav/CTA
- [x] Type contract, labels, DataStore + local and Supabase drivers, seed
- [x] Auth (session, token, proxy)
- [x] Security helpers, Zod schemas
- [x] Fonts + root layout, UI kit (Button, Input, Textarea, Select, Checkbox, Badge, Card, Modal, Drawer, Table, Tabs, Toast, Alert, Tooltip, Dropdown, Pagination, Skeleton, EmptyState, ErrorState)
- [x] Header (desktop dropdowns + mobile menu), Footer, footer CTA

### Phase 2 — Marketing site
- [x] Home (all 14 sections in order)
- [x] Services index + 5 detail pages
- [x] Industries index + 4 detail pages
- [x] Pricing (+ disclaimers, scope, ownership), Process, About
- [x] Contact, Book a Call, Free Growth Audit (+ thank-you)
- [x] Resources, legal pages, 404, error pages

### Phase 3 — CMS-driven content
- [x] Blog index/category/post, case studies index/detail with demo labelling
- [x] Public content fetchers with static fallbacks

### Phase 4 — Database
- [x] `supabase/migrations/0001_init.sql`: tables, FKs, indexes, `updated_at` triggers, soft delete
- [x] RLS: anon may only read published content; staff may do everything; role helpers
- [x] Demo seed via admin "Load demo data" / "Remove demo data"

### Phase 5 — Admin
- [x] Login, logout, password recovery (Supabase)
- [x] Shell: sidebar/drawer, top bar, breadcrumb, search, notifications, demo badge
- [x] Overview (KPIs, charts, recent tables, quick actions)
- [x] Leads list + detail (timeline, notes, status, owner, tags, UTM)
- [x] Audits list + workspace (findings by section)
- [x] Messages, bookings, notifications, global search
- [x] CMS: blog, case studies, testimonials, services, pricing, industries
- [x] Analytics (date ranges), settings (all sections) (settings done — CMS engineer; analytics pending ops)

### Phase 6 — Tracking
- [x] Consent banner + preferences, script loader, `track()`, attribution capture, `/api/track`

### Phase 7 — SEO
- [x] Metadata helper, sitemap, robots, JSON-LD (Organization, WebSite, Service, Article, BreadcrumbList), OG image

### Phase 8 — Quality
- [x] `tsc --noEmit`, ESLint, `next build` clean (0 errors, 0 warnings, 81 pages)
- [x] Runtime check (vg-tools/e2e.mjs, 18/18): submit an audit, see it in the admin, change status, add a note
- [x] Accessibility pass, responsive pass (screenshots 1440 + 390, no overflow), README, `.env.example`, final QA checklist (spec §119)

## 4. Definition of done (per phase)
1. `pnpm exec tsc --noEmit` passes.
2. `pnpm lint` passes.
3. `pnpm build` succeeds (run once per phase, never in parallel with another build).
4. The touched routes render without console errors.
5. The spec checkboxes above are updated.

### Phase 9 — Final design: "Premium Calm" (2026-09-24) ✅
The client rejected v1–v3 and three later directions, then chose **Ramp, Stripe and Mercury** as the bar. The design contract is `docs/spec/02-design-direction.md`.
- [x] Foundations:
  - Geist, Geist Mono and Instrument Serif fonts
  - `.pm-*` classes, with `globals.css` cut from 1,038 to 337 lines
  - pill `Button`, calm `field.tsx`
  - `components/site/*` (header, footer, `PageHero`), `FooterCta`
  - `Ribbon` art
- [x] Homepage, argued like an essay:
  - a thesis hero with problem, cause and **solution** in the margin
  - the **Instant Funnel Scan**, a real headless-Chrome analysis with a free daily quota and an upgrade prompt
  - diagnosis ledger → principles → the 5-part solution with "Solves" lines → steps → reporting → industries → audit → scope → pricing → FAQ → CTA
- [x] Every public page rebuilt, each section in a problem → cause → fix layout with the fix highlighted.
- [x] Forms restyled with behaviour unchanged; cookie banner; OG image; 404 and error pages.
- [x] Admin restyled (white sidebar, hairline tables, status pills, flat charts).
- [x] Legacy directions deleted: `components/nb|signal|editorial|lab|layout` and `app/lab`.
- [x] Verified: `tsc` and `pnpm lint` clean; `pnpm build` passes with 82 pages and no warnings; E2E 18/18; every public page at 1440 and 390 with no overflow or console errors.
- [ ] Open items:
  - Scanner hosting needs Chrome (`CHROME_EXECUTABLE_PATH`) and a shared quota store if running on more than one instance.
  - The "unlimited scans on any plan" offer should be added to the pricing plans once the client confirms it.
  - The founder bio and legal texts are still placeholders or templates.

### Phase 10 — Database: PostgreSQL via Prisma 7 (2026-09-24) ✅
- [x] Prisma ORM 7.10 with `@prisma/adapter-pg`. The `prisma-client` generator writes to `lib/generated/prisma` (git-ignored, generated on install and build). `prisma.config.ts` holds `DIRECT_URL`, migrations and seed.
- [x] Supabase is now just a Postgres host. Removed `@supabase/*`, RLS and Supabase Auth; auth is self-hosted (scrypt, signed cookie, DB-checked sessions, email reset tokens).
- [x] Schema: `prisma/schema.prisma` plus migration `20260924000000_init` (22 tables, CHECK constraints, FKs, indexes). Applied to the Supabase database.
- [x] `lib/data/prisma-store.ts` implements the existing `DataStore`, so no service code changed.
- [x] Seed: the admin, starter content and all demo data were loaded into the database. Re-runs are idempotent.
- [x] Env: `.env` (dev) and `.env.production` (deploy-ready, with generated secrets), both git-ignored; `.env.example` documents every variable.
- [x] Verified: tsc, lint, build (81 pages), E2E 18/18 on PostgreSQL, and the password-reset flow (single-use link).
