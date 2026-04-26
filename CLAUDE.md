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

SaaS for IB Diploma students. Only TOK Exhibition helper built; CAS and EE are stubs.

### Pages

| Route | Auth | Purpose |
|---|---|---|
| `/` | public | Landing — hero + feature cards |
| `/features` | public | Feature breakdown |
| `/pricing` | public | Plans (Free / Student / School) |
| `/login` | public | Email/password auth |
| `/dashboard` | protected | Module selector |
| `/dashboard/tok` | protected | TOK Exhibition helper |
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
- `components/CookieBanner.tsx` — client component, sessionStorage dismiss.

### Supabase: two clients, never mixed

- `lib/supabase-client.ts` — `createBrowserClient` for `"use client"` components. **Instantiate inside event handlers, never at module scope** — module-level call breaks SSR prerender.
- `lib/supabase-server.ts` — `createServerClient` with cookie wiring for Server Components and Route Handlers.

### AI calls: server-only

All Anthropic calls go through `app/api/ai/route.ts` (POST). Client components call this endpoint — never import `lib/anthropic.ts` on client. Endpoint accepts `{ prompt, systemPrompt? }`, returns `{ text }`. Model: `claude-haiku-3-5-20251001`, max_tokens 1000.

### Design system

Brutalist Pastel theme. CSS vars + reusable `@utility` classes defined in `app/globals.css`. No component libraries, Tailwind only. No shadows, gradients, blur, or pill shapes.

**Tokens:** `--bg` `--fg` `--border` `--surface` `--yellow` `--pink` `--mint` `--sky` `--radius` (4px) `--border-w` (2px)

**Utility classes** (use these, don't reinvent):
- `.card` — white surface, 2px border, 4px radius, 1.5rem padding
- `.btn-primary` + `.btn-primary-hover` — black bg, cream text, uppercase 12px
- `.btn-ghost` + `.btn-ghost-hover` — transparent bg, black border
- `.field-input` — full-width input with 2px border, focus outline
- `.tag` — base badge (add `.tag-yellow` / `.tag-pink` / `.tag-mint` / `.tag-sky` for fill)
- `.eyebrow` — 11px uppercase label, `#888`, letter-spacing 0.08em
- `.heading` — font-weight 700, letter-spacing -0.03em, line-height 1.1
- `.divider` — 2px solid bottom border

**Font:** system-ui stack (`--font-sans`). No Google Fonts loaded.

### Database

Cloud Supabase (project `pjjupictmrlpxbvhcgxf`). Migration SQL in `supabase/migrations/` — run manually in Supabase SQL Editor, never via CLI. RLS enabled on all tables; policies user-scoped via `auth.uid()`.

Tables: `tok_exhibitions` (prompt_id 1–35) → `tok_objects` (title, description, object_type, scores jsonb).

### Payments — Paddle (Merchant of Record)

Paddle handles VAT, invoicing, and tax compliance. We are not the merchant of record — Paddle is. No Stripe.

**Env vars:**
- `PADDLE_API_KEY` — server-only, never expose to client
- `PADDLE_WEBHOOK_SECRET` — for verifying webhook signatures
- `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` — used in Paddle.js overlay (client-safe)
- `NEXT_PUBLIC_PADDLE_STUDENT_PRICE_ID` — price ID for Student plan

**Not yet implemented** — scaffold only. When building:
- Use `@paddle/paddle-node-sdk` server-side
- Use Paddle.js overlay client-side (script tag + `Paddle.Checkout.open()`)
- Webhook route at `app/api/webhooks/paddle/route.ts` — verify signature, update `profiles.plan` in Supabase
- Add `profiles` table to Supabase with `plan` column (`free` | `student` | `school`)

### Database

Cloud Supabase (project `pjjupictmrlpxbvhcgxf`). RLS enabled on all tables; policies user-scoped via `auth.uid()`.

Tables: `tok_exhibitions` (prompt_id 1–35) → `tok_objects` (title, description, object_type, scores jsonb).

### Path alias

`@/*` maps to repo root (e.g. `@/lib/supabase-server`).

---

## Backlog — not yet built

### P0 — Core product (TOK helper is the entire value prop)
1. **Prompt selector** — `/dashboard/tok`: show all 35 official TOK prompts, let user pick one, save `tok_exhibitions` row
2. **Object builder** — add 3 objects per exhibition (title, description, object_type), save `tok_objects` rows
3. **AI justification** — per object: POST to `/api/ai` with prompt + object context, stream/display response
4. **Exhibition overview** — read all 3 objects + justifications together on one page

### P1 — Auth gaps
5. **Email confirmation** — enable in Supabase Auth settings, add `/auth/confirm` callback route
6. **Password reset** — `/forgot-password` page → Supabase `resetPasswordForEmail`, `/auth/reset` callback

### P2 — Payments
7. **Paddle checkout** — wire upgrade button on `/profile` to `Paddle.Checkout.open()`
8. **Paddle webhook** — `app/api/webhooks/paddle/route.ts` → verify signature → update `profiles.plan`
9. **Usage gates** — free tier: max 3 exhibitions, 20 AI calls/month (check server-side before AI route)

### P3 — Polish
10. **Loading/error states** — AI calls need spinner + error display
11. **Exhibition PDF export** — printable summary for coordinator
12. **CAS tracker** — stub → real feature (after TOK ships)
