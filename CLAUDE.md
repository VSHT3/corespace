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

Corespace — SaaS for IB Diploma students. TOK Exhibition helper live; CAS and EE stubs.

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

All Gemini calls go through `app/api/ai/route.ts` (POST). Client components call this endpoint — never import `lib/gemini.ts` on client. Endpoint accepts `{ intent, userMessage, context? }`, returns `{ text }`. Model: `gemini-2.5-flash`, maxOutputTokens 1000.

**Intents:**
- `prompt_explainer` — chat AI in prompt picker. Context: `promptId`, `promptTitle`, `promptDescription`.
- `object_justification` — justification generator in workspace. Context: `prompt`, `objectTitle`, `objectType`, `objectDescription`.

System prompts built server-side only. Reference docs in `lib/ai-docs/` loaded at module init and prepended to every system prompt — never sent from client. To update AI knowledge, edit those `.md` files.

Justification saves go through `app/api/tok/justification/route.ts` (POST) — verifies ownership before writing.

### Design system

Brutalist Pastel theme. CSS vars + reusable `@utility` classes in `app/globals.css`. No component libraries, Tailwind only. No shadows, gradients, blur, or pill shapes.

**Tokens:** `--bg` `--fg` `--border` `--surface` `--yellow` `--pink` `--mint` `--sky` `--radius` (4px) `--border-w` (2px)

**Utility classes** (use, don't reinvent):
- `.card` — white surface, 2px border, 4px radius, 1.5rem padding
- `.card-bump` — card + diagonal hover shadow (`translate(-4px,-4px)` + `box-shadow: 8px 8px 0 0 var(--fg)`)
- `.card-link` — card with hover bg tint, non-bump clickable cards
- `.btn-primary` + `.btn-primary-hover` — black bg, cream text, uppercase 12px
- `.btn-ghost` + `.btn-ghost-hover` — transparent bg, black border
- `.btn-sky` — sky-blue bg, darkens on hover (use for Dashboard nav button)
- `.field-input` — full-width input, 2px border, focus outline
- `.tag` — base badge (add `.tag-yellow` / `.tag-pink` / `.tag-mint` / `.tag-sky` for fill)
- `.eyebrow` — 11px uppercase label, `#888`, letter-spacing 0.08em
- `.heading` — font-weight 700, letter-spacing -0.03em, line-height 1.1
- `.divider` — 2px solid bottom border
- `.page-main` — flex:1, max-width 860px, auto margins, 4rem padding, fadeUp animation. Use on `<main>` for all inner pages.
- `.highlight-yellow` / `.highlight-mint` / `.highlight-pink` — SVG brush-stroke highlight (svgbox.net). `display: inline-block`. Navbar logo: `marginRight: "-0.28em"` to close gap with following text.
- `.back-link` — muted grey link, darkens on hover

**Page enter animation:** `fadeUp` keyframe (opacity + translateY 6px, 280ms) via `page-main`. Home page applies via inline style.

**Font:** system-ui stack (`--font-sans`). No Google Fonts.

### Database

Cloud Supabase (project `pjjupictmrlpxbvhcgxf`). Migration SQL in `supabase/migrations/` — run manually in Supabase SQL Editor, never via CLI. RLS enabled all tables; policies user-scoped via `auth.uid()`.

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

Paddle handles VAT, invoicing, tax compliance. Paddle is merchant of record, not us. No Stripe.

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
- Prompt difficulty ratings (1–5) on all 35 prompts
- Prompt picker AI chat panel (two-panel layout, session-persistent history, markdown rendering)
- Server-side system prompt architecture with `lib/ai-docs/` reference docs
- AI route refactored to intent-based (`prompt_explainer`, `object_justification`)

### P1 — Auth gaps
1. **Email confirmation** — `/auth/confirm` route built. Enable "Confirm email" in Supabase Auth dashboard + set redirect URLs. ✓ code done, manual Supabase config needed.
2. **Password reset** — `/forgot-password` + `/auth/reset` + `/auth/reset/complete` all built. ✓ code done.
3. **Google OAuth** — not yet wired. Needs Google Cloud OAuth credentials + Supabase provider config + login page buttons.

### P2 — Payments
4. **Paddle checkout** — wire upgrade button on `/profile` to `Paddle.Checkout.open()`
5. **Paddle webhook** — verify signature → update `profiles.plan`
6. **Usage gates** — free tier: max 3 exhibitions, 20 AI calls/month (enforce server-side). Needs `profiles` table migration.

### P3 — Polish
7. **Exhibition PDF export** — printable summary for coordinator
8. **CAS tracker** — stub → real feature
9. **Custom SMTP** — configure before launch (Resend recommended). Supabase built-in = 3/hr rate limit.

___

## Plan
1. ✓ Gemini live calls — working, graceful error handling done.
2. ✓ Auth completeness — email confirm + password reset routes built. Manual Supabase config needed.
3. Usage gates — build `profiles` table migration, enforce free tier limits server-side.
4. ✓ TOK workspace polish — loading states, save states, delete confirmations done.
5. Google OAuth — add login buttons + wire Supabase provider.
6. Custom SMTP — configure Resend before launch.
7. Export/share — PDF exhibition export.
8. Payments — Paddle checkout + webhook after usage gates exist.
9. Deploy — Vercel env vars, production smoke test.

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)
