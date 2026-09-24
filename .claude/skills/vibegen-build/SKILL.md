---
name: vibegen-build
description: Conventions for building or changing anything in the VibeGen Studio codebase (Next.js 16 marketing site + admin dashboard). Load before adding pages, sections, admin screens, forms, data/services code, SQL, tracking or copy in this repo, so the work matches the spec, the design system, the data layer and the honesty rules.
---

# VibeGen Studio build conventions

The spec is the source of truth: `docs/spec/00-master-spec.md` (requirements, with §-numbers matching the original brief) and `docs/spec/01-implementation-plan.md` (architecture + phase tracker). Read the relevant § before building a feature, and tick the tracker when you finish one.

## 1. Stack rules (Next.js 16, not the one you remember)

- App Router, React 19.2, TypeScript strict, Tailwind v4, pnpm. Docs are bundled at `node_modules/next/dist/docs/`; read them for any API you're unsure of.
- `params`, `searchParams`, `cookies()` and `headers()` are **Promises**. Type pages with `PageProps<"/route/[slug]">` and `await props.params`.
- Middleware is `proxy.ts` (export `proxy`). Only it runs before `/admin`, and it is **optimistic**; real auth is `requireUser()`.
- Mutations go through **server actions** (`"use server"`) used with `useActionState`. Return `ActionState` from `lib/data/types.ts`. Revalidate with `revalidatePath(...)`.
- Route handlers return the envelope `{ success: true, data }` / `{ success: false, message }` (`ApiResponse<T>`). Never return raw DB errors.
- Never use `any`. Never import `lib/data/index.ts`, `lib/auth/session.ts`, `lib/db/prisma.ts` or `lib/config/server-env.ts` from a client component (they are `server-only`).

## 2. Where things go

| Need | Put it in |
|---|---|
| Design tokens | `app/globals.css` `@theme` (Tailwind v4, **no tailwind.config.js**) |
| Nav, CTAs, site name | `lib/config/site.ts` (`cta.primary`, `cta.secondary`, `mainNav`, `footerNav`) |
| Env | `lib/config/env.ts` (public `NEXT_PUBLIC_*`), `lib/config/server-env.ts` (secrets) |
| Types / enums / labels | `lib/data/types.ts`, `lib/data/labels.ts` (use `toOptions()` for selects) |
| DB access | `publicStore()` / `adminStore()` / `serviceStore()` from `lib/data`, called **only** from `lib/services/*` |
| Business logic | `lib/services/<domain>.ts` |
| Validation | `lib/validation/schemas.ts` (Zod 4); reuse, don't redefine |
| Copy / starter content | `lib/content/*` |
| UI primitives | `components/ui/*` (reuse; don't hand-roll a second Button) |
| Site chrome | `components/layout/*` |
| Page sections | `components/sections/*` |
| Admin UI | `components/admin/*` |
| Charts | `components/charts/*` (hand-built SVG; load the `dataviz` skill first) |
| Tracking | `lib/tracking/*` + `components/tracking/*`, only through `track()` |
| DB schema | `prisma/schema.prisma` + a new `prisma/migrations/<ts>_<name>/migration.sql`; field names = SQL columns = `types.ts`. Plain Postgres only (no Supabase Auth/RLS/storage). |

## 3. Design system — "Premium Calm" (mandatory, client-chosen)

Read `docs/spec/02-design-direction.md` first. In short:
- **Look:** white canvas, Geist in sentence case with one Instrument Serif italic accent per heading, brand blue `#0a6cff`, 1px `hair` borders, pill buttons.
- **Visuals:** high-fidelity sample UI labelled "Sample data".
- **Sections:** each one argues problem → cause → **solution**, with the solution highlighted.
- **Build with:**
  - `PageHero` from `components/site/page-hero.tsx`
  - `SectionHead` from `components/home/section-head.tsx`
  - `FooterCta` from `components/sections/cta-bands.tsx`
  - `.pm-*` classes and `components/ui/*`
- **Never use** `components/nb|signal|editorial|lab`, `.nb-*` or `.vg-*`.

**Visual review:**
- Screenshot: `MSYS_NO_PATHCONV=1 node R:/MRS/Vibegen/vg-tools/shot.mjs <path> <name> 1440 6000` (and `390`). Output goes to `.data/shots/`, and the script prints any horizontal overflow.
- End-to-end test: `MSYS_NO_PATHCONV=1 node R:/MRS/Vibegen/vg-tools/e2e.mjs` must stay 18/18.

## 4. Copy rules

- Write like a sharp growth consultant talking to a business owner: specific, short, practical.
- Banned: unlock, transform, revolutionize, game-changing, cutting-edge, next-generation, leverage, empower, seamless, elevate, supercharge, skyrocket, "next level".
- CTA discipline: the primary is **Get a Free Growth Audit** (`/free-growth-audit`); the secondary is **Book a Strategy Call** (`/book-a-call`). Other allowed labels: View Services, View Case Study, Learn More, Submit Request, Save Changes. Never "Click here" or "Submit form".
- Microcopy is human: "Review Lead", "Mark as Qualified", "Nothing here yet", "Try again".

## 5. Honesty rules (non-negotiable)

- **No** fake clients, logos, testimonials, reviews, ratings, awards, partner badges, certifications, results, revenue/ROAS/lead counts, or urgency.
- Any sample numbers are labelled: "Illustrative dashboard · Sample data" on marketing visuals, and "Illustrative Example — Demo Data" on any case study with `is_demo = true`.
- Admin demo records carry `is_demo` and show a **Demo Data** badge. Demo emails use `.example` domains.
- No invented contact details. Email, booking URL and socials come from env or settings and are hidden when empty.
- Legal pages are templates and say they need jurisdiction review.

## 6. Forms checklist

Every public form must have:
1. Visible `<Label>` for each field, with required fields marked.
2. `<SpamGuard />` (honeypot + time trap) and the hidden attribution field.
3. A server action that runs `checkSpam`, then `rateLimit`, then Zod `safeParse`, then a service call, and returns `ActionState` with `fieldErrors`.
4. Inline errors, a disabled/loading submit button, success and error states.
5. `track("form_start")` on first interaction, the conversion event on success, and `form_error` on validation failure.

## 7. Admin checklist

- Start every page and action with `await requireUser()` (plus a permission for destructive/CMS actions: `requireUser("content:write")`).
- Every list has search, filters in **URL params**, sorting, pagination, an empty state, a skeleton `loading.tsx`, and a card layout under `md`.
- Statuses use `<StatusBadge>`, which pairs text with color (never color alone).
- Destructive actions go through a confirmation dialog; show a toast on success.
- Log activity (`lead_activities`) and notifications through the services layer, not in the page.

## 8. Definition of done

Run and fix before you report back:
```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm build        # once per phase; never two builds at the same time
```
Then load the touched routes (`pnpm dev`) and check for console/server errors. Update `docs/spec/01-implementation-plan.md`.
