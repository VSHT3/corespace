# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repo.

## Critical: This is Next.js 16

**Not Next.js 13/14/15.** Breaking changes apply. Before writing code, read relevant guide in `node_modules/next/dist/docs/`. Heed all deprecation warnings from dev server.

Key renames vs prior versions:
- `middleware.ts` → `proxy.ts`, export function must be named `proxy` (not `middleware`)
- `runtime` config option **not available** in proxy files

## Commands

```bash
npm run dev      # dev server on localhost:3000
npm run build    # production build (runs tsc + page generation)
npm run start    # serve production build
```

TypeScript check (no dedicated lint script):
```bash
node node_modules/typescript/bin/tsc --noEmit
```

## Architecture

Corespace — SaaS for IB Diploma students. TOK Exhibition helper is live; CAS and EE are stubs.

### Pages

| Route | Auth | Purpose |
|---|---|---|
| `/` | public | Landing — hero + feature cards |
| `/features` | public | Feature breakdown |
| `/pricing` | public | Plans (Free / Student / School) |
| `/login` | public | Email/password auth |
| `/dashboard` | protected | Module selector |
| `/dashboard/tok` | protected | TOK Exhibition list + create |
| `/dashboard/tok/[id]` | protected | Exhibition workspace (objects + AI justification) |
| `/profile` | protected | Account info, plan, logout |

### Request flow

```
browser → proxy.ts (auth gate) → app/ route → Supabase / AI API
```

`proxy.ts` protects `/dashboard/**` and `/profile/**` — redirects unauthenticated to `/login`, redirects authenticated away from `/login`.

### Shared components

- `components/Navbar.tsx` — server component, shows auth state. Sticky, 2px border-bottom. 3-col grid layout (logo | nav | actions).
- `components/LogoutButton.tsx` — client component, calls `supabase.auth.signOut()`.
- `components/Footer.tsx` — server component, tucked legal links.
- `components/CookieBanner.tsx` — client component, sessionStorage dismiss, bottom-left corner.

### Supabase: two clients, never mixed

- `lib/supabase-client.ts` — `createBrowserClient` for `"use client"` components. **Instantiate inside event handlers, never at module scope** — module-level call breaks SSR prerender.
- `lib/supabase-server.ts` — `createServerClient` with cookie wiring for Server Components and Route Handlers.

### AI calls: server-only

All Anthropic calls go through `app/api/ai/route.ts` (POST). Client components call this endpoint — never import `lib/anthropic.ts` on client. Endpoint accepts `{ prompt, systemPrompt? }`, returns `{ text }`. Model: `claude-haiku-3-5-20251001`, max_tokens 1000.

Justification saves go through `app/api/tok/justification/route.ts` (POST) — verifies ownership before writing.

### Design system

Brutalist Pastel theme. CSS vars + reusable `@utility` classes defined in `app/globals.css`. No component libraries, Tailwind only. No shadows, gradients, blur, or pill shapes.

**Tokens:** `--bg` `--fg` `--border` `--surface` `--yellow` `--pink` `--mint` `--sky` `--radius` (4px) `--border-w` (2px)

**Utility classes** (use these, don't reinvent):
- `.card` — white surface, 2px border, 4px radius, 1.5rem padding
- `.card-bump` — card + diagonal hover shadow (`translate(-4px,-4px)` + `box-shadow: 8px 8px 0 0 var(--fg)`)
- `.card-link` — card with hover bg tint, for non-bump clickable cards
- `.btn-primary` + `.btn-primary-hover` — black bg, cream text, uppercase 12px
- `.btn-ghost` + `.btn-ghost-hover` — transparent bg, black border
- `.btn-sky` — sky-blue bg, darkens on hover (use for Dashboard nav button)
- `.field-input` — full-width input with 2px border, focus outline
- `.tag` — base badge (add `.tag-yellow` / `.tag-pink` / `.tag-mint` / `.tag-sky` for fill)
- `.eyebrow` — 11px uppercase label, `#888`, letter-spacing 0.08em
- `.heading` — font-weight 700, letter-spacing -0.03em, line-height 1.1
- `.divider` — 2px solid bottom border
- `.page-main` — flex:1, max-width 860px, auto margins, 4rem padding, fadeUp animation. Use on `<main>` for all inner pages.
- `.highlight-yellow` / `.highlight-mint` / `.highlight-pink` — SVG brush-stroke highlight (svgbox.net). `display: inline-block`. For navbar logo use `marginRight: "-0.28em"` to close gap with following text.
- `.back-link` — muted grey link, darkens on hover

**Page enter animation:** `fadeUp` keyframe (opacity + translateY 6px, 280ms) applied via `page-main`. Home page applies it via inline style.

**Font:** system-ui stack (`--font-sans`). No Google Fonts loaded.

### Database

Cloud Supabase (project `pjjupictmrlpxbvhcgxf`). Migration SQL in `supabase/migrations/` — run manually in Supabase SQL Editor, never via CLI. RLS enabled on all tables; policies user-scoped via `auth.uid()`.

Tables:
- `tok_exhibitions` — `id`, `user_id`, `prompt_id` (1–35), `title`, `created_at`
- `tok_objects` — `id`, `exhibition_id`, `title`, `description`, `object_type`, `justification`, `position`, `scores` (jsonb), `created_at`

Migrations to run:
1. `supabase/migrations/001_initial.sql`
2. `supabase/migrations/002_tok_additions.sql`

### TOK server actions

`app/dashboard/tok/actions.ts` — `"use server"` functions for all DB mutations:
- `createExhibition(formData)` — inserts exhibition, redirects to workspace
- `deleteExhibition(id)`
- `saveObject(formData)` — upserts tok_object (insert if no object_id, update if present)
- `saveJustification(exhibitionId, objectId, justification)`
- `deleteObject(exhibitionId, objectId)`

### Payments — Paddle (Merchant of Record)

Paddle handles VAT, invoicing, and tax compliance. We are not the merchant of record — Paddle is. No Stripe.

**Env vars:**
- `PADDLE_API_KEY` — server-only
- `PADDLE_WEBHOOK_SECRET` — webhook signature verification
- `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` — Paddle.js overlay (client-safe)
- `NEXT_PUBLIC_PADDLE_STUDENT_PRICE_ID` — Student plan price ID

**Not yet implemented** — scaffold only. When building:
- Use `@paddle/paddle-node-sdk` server-side
- Use Paddle.js overlay client-side (`Paddle.Checkout.open()`)
- Webhook route at `app/api/webhooks/paddle/route.ts` — verify signature, update `profiles.plan`
- Add `profiles` table with `plan` column (`free` | `student` | `school`)

### Path alias

`@/*` maps to repo root (e.g. `@/lib/supabase-server`).

---

## Backlog

### P0 — done
- TOK prompt selector, exhibition list/create
- Object builder (3 slots per exhibition)
- AI justification per object
- Exhibition workspace at `/dashboard/tok/[id]`

### P1 — Auth gaps
1. **Email confirmation** — enable in Supabase Auth, add `/auth/confirm` callback route
2. **Password reset** — `/forgot-password` → `resetPasswordForEmail`, `/auth/reset` callback

### P2 — Payments
3. **Paddle checkout** — wire upgrade button on `/profile` to `Paddle.Checkout.open()`
4. **Paddle webhook** — verify signature → update `profiles.plan`
5. **Usage gates** — free tier: max 3 exhibitions, 20 AI calls/month (enforce server-side)

### P3 — Polish
6. **Loading/error states** — AI calls need spinner + error display
7. **Exhibition PDF export** — printable summary for coordinator
8. **CAS tracker** — stub → real feature
