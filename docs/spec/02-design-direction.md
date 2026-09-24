# VibeGen Studio — Design Direction: "Premium Calm" (client-chosen 2026-09-24)

> The client compared real sites and chose **Ramp, Stripe and Mercury** as the bar. The design must be original, not a copy of those sites.
> Every earlier direction was rejected as "AI slop" or "basic": template, editorial, gradient/glass, neo-brutal, bold-field and traffic-lanes. Do not reuse them.
> Reference implementation: the homepage (`app/(marketing)/page.tsx`, `components/home/*`) and `components/site/*`.

## 1. Principles

1. **Calm, premium, obvious.** White canvas, generous whitespace, one idea per section. A visitor should understand each section in 5 seconds.
2. **Argue like a philosopher.** Each section moves from problem, to real cause, to **our solution**, and the solution is visually the most prominent part (dark or brand highlight, bold, or first-read).
3. **Show, don't decorate.** Visuals are high-fidelity product-style UI (reports, search terms, event logs, forms) labelled **"Sample data"**, or the silk ribbon. No stock icons as hero art, no blobs, glows, glass, stickers or tilted cards.
4. **Honest.** No fake logos, testimonials, results or urgency. Sample UI is always labelled.

## 2. Tokens (`app/globals.css` `@theme`)

| Token | Value | Use |
|---|---|---|
| `fg` | `#0a0d14` | Text, primary buttons, dark panels |
| `fg-2` | `#4b5263` | Body copy |
| `fg-3` | `#858c9b` | Meta, captions |
| `hair` | `#e8e8ec` | 1px borders, dividers |
| `soft` / `soft-2` | `#f6f5f2` / `#efeee9` | Alternate bands, stages |
| `brand` / `brand-soft` | `#0a6cff` / `#eaf2ff` | Links, accent word, focus, charts |
| Status | green `#12a150` / `#0f7a3d`, amber `#b54708`, red `#b42318` | Pass, warn and fail only |

- Body is white. There is **no grain**.
- Radius: 12px for inputs, 16–24px for cards, 28–32px for big stages, pill shape for buttons and chips.
- Shadows: soft and long only, e.g. `0 40px 80px -36px rgb(10 13 20/.3)`, and only for floating UI. Cards use a 1px `hair` border and no shadow.

## 3. Type

- **Geist** for display and UI, in sentence case, never all-caps headlines.
  - `.pm-h1`: weight 560, tracking −0.045em
  - `.pm-h2`
  - `.pm-h3`
- **Instrument Serif italic** (`.pm-serif`): **one accent word or phrase per heading**, often in `text-brand`.
- **Geist Mono**, via `.pm-eyebrow`: small uppercase section labels.
- `.pm-lede` for leads. Body copy is 15–17px in `fg-2`.

## 4. Components

- **Global classes:**
  - layout and type: `.pm-wrap` (1240px), `.pm-h1`, `.pm-h2`, `.pm-h3`, `.pm-serif`, `.pm-eyebrow`, `.pm-lede`
  - buttons: `.pm-btn` plus `.pm-btn-dark`, `.pm-btn-light` or `.pm-btn-brand`
  - other: `.pm-card`, `.pm-link`
- **React:** `components/ui/button.tsx`: `Button` and `ButtonLink` are pills (`primary` = dark, `outline`/`secondary` = light, `glass` = brand). Form controls live in `components/ui/field.tsx`.
- **Site:**
  - `components/site/header.tsx` and `footer.tsx`
  - `components/site/page-hero.tsx`: `PageHero` for every inner page, with `{ crumbs, eyebrow, title, accent, lead, children, aside, tone }`; it emits breadcrumb JSON-LD
  - `components/home/section-head.tsx`: `SectionHead` with `{ id, eyebrow, title, lede, align }`
  - `components/sections/cta-bands.tsx`: `FooterCta` for inner pages, `FinalCta`
- **Art:** `components/art/ribbon.tsx`, the `Ribbon` silk-line art (`preset="hero" | "band"`). Use at most once per page.
- **Legacy, do not use:** `components/nb/*`, `components/signal/*`, `components/editorial/*`, `components/lab/*`, `.nb-*`, `.vg-*` and v2/v3 classes. They are being removed.

## 5. Section patterns (pick, don't invent)

- **Problem → cause → fix ledger:** rows or cards. The fix sits in a highlighted column or row and is the thing you read first.
- **Principles:** a numbered list of beliefs, each a heading plus one sentence, with "what it means for you".
- **Bento grid:** 2 wide cards plus 3 narrow ones, each with a mini UI preview and a "Solves:" line.
- **Steps:** 3–5 numbered steps with timing.
- **Split:** copy on one side, product visual on the other, with a soft stage behind the visual.
- **Dark panel** (`bg-fg`, `rounded-[32px]`) for the single most important offer on a page.
- **FAQ:** a `details` accordion between hairlines.

## 6. Motion

Hover shadows, arrow nudges and accordion rotation only. No reveal-on-scroll everywhere. Respect `prefers-reduced-motion`.

## 7. Admin

- Same tokens. White content on a `soft` app canvas.
- Sidebar: white with a hairline right border, active item `bg-soft` with `text-fg`, icons 16px.
- Tables: hairline rows, `fg-3` headers in 12.5px, status pills using the status colours.
- Buttons: size `sm`/`md` pills. Charts: brand blue and violet `#7a3eff`, flat.
