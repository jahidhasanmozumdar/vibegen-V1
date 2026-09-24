# VibeGen

The website and internal admin for **VibeGen**, a performance marketing and conversion studio for startups and growing businesses in the US and UK.

- **Public site:** a client acquisition system (not a brochure) built around one primary action, the **Free Growth Audit**.
- **Admin:** a CRM, analytics and CMS in one. Every audit request, contact message and call request lands in the database and appears in the admin immediately, where the team can qualify it, take notes and track it to "Won".

Specs and conventions:
- [`docs/spec/00-master-spec.md`](docs/spec/00-master-spec.md): requirements (§-numbers match the original brief)
- [`docs/spec/01-implementation-plan.md`](docs/spec/01-implementation-plan.md): architecture and phase tracker
- [`.claude/skills/vibegen-build/SKILL.md`](.claude/skills/vibegen-build/SKILL.md): build conventions for anyone (or any agent) changing the code

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack, Server Actions, `proxy.ts`) |
| UI | React 19.2, TypeScript (strict, no `any`), Tailwind CSS v4 (tokens in `app/globals.css`) |
| Fonts | Geist + Geist Mono + Instrument Serif, self-hosted via `next/font` |
| Icons | lucide-react |
| Data | **PostgreSQL** via **Prisma ORM 7** + `@prisma/adapter-pg` (any host: Supabase, RDS, Neon, VPS), **or** a local JSON store for demos |
| Auth | Self-hosted: accounts in Postgres (scrypt password hashes), signed httpOnly session cookie, email reset links; roles admin / manager / staff |
| Validation | Zod 4, shared by client and server |
| Charts | Hand-built accessible SVG (no chart library) |
| Email | Provider abstraction: console (default) or Resend |

## Getting started

```bash
pnpm install
cp .env.example .env.local     # optional, since everything has safe defaults
pnpm dev                       # http://localhost:3000
```

With no environment variables set, the app runs in **demo mode**:
- It uses a local JSON database at `.data/vibegen-db.json`, created and seeded on first request.
- Seeded content: 5 services, 4 industries, 3 pricing plans, 10 blog guides, 5 illustrative case studies and 3 draft demo testimonials.
- Seeded demo CRM data, all flagged `is_demo`: 25 leads, 12 audit requests, 8 bookings, 6 messages and 180 days of analytics events.

To start from scratch, delete `.data/` and reload.

### Demo admin login

| | |
|---|---|
| URL | `/admin` |
| Email | `admin@vibegen.studio` (`DEMO_ADMIN_EMAIL`) |
| Password | `vibegen-demo-2026` (`DEMO_ADMIN_PASSWORD`) |

The demo login is still real server-side auth: credentials are checked on the server and the session is an HMAC-signed, httpOnly cookie. **Change both values and set `SESSION_SECRET` before deploying anywhere public**, or better, set `DATABASE_URL` (see Database setup).

## Scripts

| Command | Purpose |
|---|---|
| `pnpm dev` | Development server |
| `pnpm build` | Production build (type-checks and prerenders) |
| `pnpm start` | Serve the production build |
| `pnpm lint` | ESLint |
| `pnpm exec tsc --noEmit` | Type-check only |
| `pnpm db:generate` | Generate the Prisma client into `lib/generated/prisma` (also runs on install/build; git-ignored) |
| `pnpm db:deploy` | Apply migrations (`prisma migrate deploy`, uses `DIRECT_URL`) |
| `pnpm db:apply` | Same, with plain `pg`, for machines where Prisma's engine binary can't run |
| `pnpm db:migrate` | Create a new migration after editing `prisma/schema.prisma` (dev) |
| `pnpm db:seed` | Admin account + starter content + demo data (safe to re-run) |
| `pnpm db:studio` | Browse the data in Prisma Studio |
| `pnpm admin:create email "Name" role` | Add or re-activate an admin-panel user |

## Environment variables

See [`.env.example`](.env.example) for the full list with comments.

| Variable | Visibility | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | public | Canonical URLs, sitemap, OG |
| `NEXT_PUBLIC_DEMO_MODE` | public | Demo badges; no real emails; no third-party tags. **Set `false` in production** |
| `DATABASE_URL` | **secret** | PostgreSQL connection used by the app (pooled URL OK) |
| `DIRECT_URL` | **secret** | Non-pooled connection for migrations and seeding |
| `DATABASE_SSL`, `DATABASE_CA_CERT`, `DATABASE_POOL_MAX` | server | TLS mode (`require`/`verify`/`disable`), CA bundle, pool size |
| `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD` | **secret** | First admin account, created by `pnpm db:seed` |
| `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_GOOGLE_ADS_ID`, `NEXT_PUBLIC_GOOGLE_ADS_AUDIT_LABEL` | public | Tracking IDs (loaded only after consent). They can also be set in Admin → Settings; env wins |
| `NEXT_PUBLIC_BOOKING_URL` | public | Calendly/Cal.com link for `/book-a-call` |
| `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_LINKEDIN_URL`, `NEXT_PUBLIC_X_URL` | public | Verified contact details only; hidden when empty |
| `SESSION_SECRET` | **secret** | Signs admin session cookies (both modes) |
| `DEMO_ADMIN_EMAIL`, `DEMO_ADMIN_PASSWORD` | **secret** | Local-mode admin credentials |
| `EMAIL_PROVIDER`, `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_NOTIFICATION_EMAIL` | **secret** | Notification and confirmation emails |
| `BOOKING_WEBHOOK_SECRET` | **secret** | Verifies `/api/bookings/webhook` calls |

Rule: anything secret **never** uses the `NEXT_PUBLIC_` prefix. Server-only modules import `server-only`, so an accidental client import fails the build.

## Project structure

```
app/
  (marketing)/          Public site: home, services, industries, pricing, process, about,
                        contact, book-a-call, free-growth-audit, resources, blog, case-studies, legal
  admin/(auth)/         Login, forgot/reset password
  admin/(panel)/        Protected dashboard (sidebar + top bar)
  api/                  Route handlers: track, search, content, admin lists, booking webhook
  sitemap.ts robots.ts opengraph-image.tsx not-found.tsx global-error.tsx
components/
  ui/                   Design system (Button, Field, Select, Badge, Card, Modal, Drawer, Tabs,
                        Toast, Dropdown, Tooltip, Table, Pagination, Skeleton, EmptyState, ErrorState)
  site/ home/ pages/ art/ sections/ forms/ admin/ charts/ seo/ tracking/
lib/
  config/               env.ts (public) · server-env.ts (secrets) · site.ts (nav, CTAs)
  data/                 types.ts (schema contract) · prisma-store.ts · local-store.ts · seed.ts
  db/                   prisma.ts (client + pg adapter) · pg-config.ts (SSL/pool)
  auth/                 session.ts (requireUser, roles) · token.ts · password.ts (scrypt)
  services/             Business logic (submissions, content, admin/*)
  actions/              Server actions (public forms, auth, admin)
  validation/           Zod schemas
  security/             Rate limiting, spam checks, request context
  email/                Provider abstraction and templates
  tracking/             Consent, track(), attribution
  content/              Starter copy and demo content
prisma/                 schema.prisma · migrations/ · seed.ts
prisma.config.ts        Prisma CLI config (DIRECT_URL, migrations, seed)
scripts/                apply-migrations.ts · create-admin.ts
docs/spec/              Specification and plan
proxy.ts                Optimistic admin gate (signed session cookie)
```

## Database setup (PostgreSQL + Prisma 7)

The app uses **plain PostgreSQL**: no vendor features such as Supabase Auth, RLS, storage or triggers. Supabase, AWS RDS, Neon or Postgres on your own VPS all work, and moving between them is a URL change plus a data restore.

1. Set `DATABASE_URL` (runtime; a pooled URL is fine, e.g. Supabase `:6543`) and `DIRECT_URL` (non-pooled, e.g. `:5432`) in `.env`. Set `DATABASE_SSL` (`require` for Supabase/RDS, `disable` for a same-host database).
2. `pnpm install`. This also generates the Prisma client into `lib/generated/prisma`, which is git-ignored and never committed.
3. `pnpm db:deploy` creates the schema (`prisma/migrations`). Where Prisma's migration engine binary is blocked, e.g. Windows Application Control, use `pnpm db:apply`. Both record migrations in `_prisma_migrations`, so they are interchangeable.
4. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD`, then run `pnpm db:seed`. This creates the admin account, the starter content (services, industries, pricing, blog, settings) and the demo CRM data (`is_demo`, removable in Settings → Data). It is safe to re-run. `SEED_DEMO=false` skips the demo data.
5. Sign in at `/admin`. Add teammates with `pnpm admin:create person@company.com "Full Name" manager`.

**Changing the schema:**
1. Edit `prisma/schema.prisma`.
2. Run `pnpm db:migrate --name <change>` to create a migration, or write the SQL by hand in a new `prisma/migrations/<timestamp>_<name>/migration.sql`.
3. Deploy with `pnpm db:deploy`.
4. Keep `lib/data/types.ts` in sync. Field names are the SQL column names.

**Moving hosts (e.g. Supabase → RDS or a VPS):**
1. `pg_dump --no-owner --no-acl "$DIRECT_URL" > vibegen.sql`
2. Restore it on the new server: `psql "$NEW_DIRECT_URL" < vibegen.sql`
3. Update `DATABASE_URL`, `DIRECT_URL` and `DATABASE_SSL`, then redeploy.

### Security model

- **Public visitors** only see published content. Every public query filters explicitly: `status = 'published'` or active pricing (`lib/services/content.ts`). No lead, email, audit, note or admin record is ever exposed.
- **Form submissions** go through server actions. These check origin (built into Next.js), run a honeypot and time trap, rate-limit per IP, guard against duplicates and validate with Zod before writing.
- **Admin pages and actions** call `requireUser()` on the server, which verifies the signed session cookie and re-checks the profile's `active` flag and role in the database on every request. `proxy.ts` only handles the redirect.
- **Passwords** are scrypt-hashed in `admin_credentials`, separate from `profiles`. Reset links are single-use, expire after 1 hour and are stored only as SHA-256 hashes.
- **Roles**: admin (everything), manager (content and CRM, no settings), staff (CRM only). Permissions live in `lib/auth/session.ts`.

## Demo mode

`NEXT_PUBLIC_DEMO_MODE=true`:
- Shows **Demo environment / Demo Data** badges in the admin.
- Sends no real email (the console provider only logs).
- Loads no third-party tracking tags, so test traffic never reaches real ad accounts.

Demo records carry `is_demo = true`. **Admin → Settings → Data → Remove demo data** deletes all of them in one step. Demo case studies always render publicly with *"Illustrative Example — Demo Data"*.

## Tracking setup

- Cookie consent with Accept / Reject / Manage. Google Consent Mode v2 defaults to *denied*.
- GTM, GA4, Meta Pixel and Google Ads load **only** after the matching consent is given (`components/tracking/tracking-scripts.tsx`).
- Every event goes through `track()` in `lib/tracking/events.ts`: `growth_audit_submit`, `contact_submit`, `booking_request_submit`, `book_call_click`, `external_booking_click`, `service_view`, `pricing_view`, `case_study_view`, `form_start`, `form_error`, `page_view`.
- Attribution: first and last touch (UTM, gclid/fbclid, referrer, landing page) are captured client-side and attached to form submissions. The server adds device and approximate country, and classifies the source (Google / Meta / LinkedIn / Organic / Referral / Direct / Email / Other).
- For Google Ads conversions, set `NEXT_PUBLIC_GOOGLE_ADS_ID` and `NEXT_PUBLIC_GOOGLE_ADS_AUDIT_LABEL`.

## CMS usage

Admin → **Blog**, **Case Studies**, **Testimonials**, **Services**, **Pricing**, **Industries**. Changes go live on save (the affected public pages are revalidated). Blog content uses a small, safe Markdown subset: `##`, `###`, lists, `>`, `**bold**`, `*italic*` and `[links](/path)`. Raw HTML is never rendered. Every CMS item has SEO fields (title, description, canonical, OG and noindex).

Only publish testimonials and case studies you have permission to use. Keep `is_demo` on for anything illustrative.

## Booking integration

- With `NEXT_PUBLIC_BOOKING_URL` set, `/book-a-call` links to (and, for Calendly/Cal.com, embeds) your scheduler.
- Without it, visitors submit a **call request**, which becomes a booking in *Follow-up* with no fake time slot.
- To sync real bookings, point a Calendly or Cal.com webhook at `/api/bookings/webhook` with `BOOKING_WEBHOOK_SECRET`.

## Deployment

Recommended: **Vercel** or any Node host.

1. Set all production env vars. `.env.production` is prepared: in particular `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_DEMO_MODE=false`, `SESSION_SECRET` and the email settings.
   Run `pnpm db:deploy` on every deploy. The build runs `prisma generate` automatically.
2. `pnpm build && pnpm start`, or connect the repo to Vercel.
3. Point `vibegen.studio` DNS at the host and set `NEXT_PUBLIC_SITE_URL=https://vibegen.studio`.

> The local JSON store is for development and demos only. Serverless file systems are ephemeral, so **production must set `DATABASE_URL`**. The in-memory rate limiter is per instance; for multi-instance deployments, back `lib/security/rate-limit.ts` with Redis (e.g. Upstash).

## Production checklist

- [ ] `NEXT_PUBLIC_DEMO_MODE=false`
- [ ] `DATABASE_URL` / `DIRECT_URL` set; `pnpm db:deploy` run; `pnpm db:seed` run (admin created)
- [ ] Starter content installed; demo data removed
- [ ] `SESSION_SECRET` set; demo credentials changed or unused
- [ ] Email provider configured and `ADMIN_NOTIFICATION_EMAIL` set; test submission received
- [ ] Tracking IDs set; consent banner verified; Tag Assistant / Pixel Helper checks pass after consent
- [ ] Booking URL or webhook configured
- [ ] Only verified contact details and social links set
- [ ] Legal pages reviewed by a lawyer for your jurisdiction
- [ ] Founder section on `/about` completed with real details
- [ ] `pnpm build` passes; Lighthouse and accessibility checks run on key pages
- [ ] Sitemap submitted in Google Search Console
# vibegen-V1
