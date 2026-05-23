# AGENTS.md

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

All Gemini calls go through `app/api/ai/route.ts` (POST). Client components call this endpoint — never import `lib/gemini.ts` on client. Endpoint accepts `{ intent, userMessage, context?, history? }`, returns `{ text }`. Model: `gemini-2.5-flash`.

**Intents:**
- `prompt_explainer` — chat AI in prompt picker. Context: `promptId`, `promptTitle`, `promptDescription`. Supports `history` for multi-turn.
- `object_justification` — justification generator. Context: `prompt`, `objectTitle`, `objectType`, `objectDescription`.
- `object_check` — IB suitability pre-flight. Returns JSON `{verdict, issue, promptLink, tip}`.
- `object_scoring` — score/10 + feedback. Returns JSON `{score, strength, weakness, tip}`.
- `knowledge_question` — 3 IB-style KQs with rationale. maxOutputTokens 1200.
- `object_ideas` — 3 concrete object suggestions. maxOutputTokens 1200.
- `justification_improve` — rewrite justification to be stronger.
- `justification_chat` — multi-turn refinement chat. Supports `history`.

Justification-related intents (`object_justification`, `justification_improve`, `justification_chat`) receive the full `JUSTIFICATION_CONTEXT` which includes `lib/ai-docs/justification-examples.md` with annotated strong/weak examples and phrase banks.

Rate limiting: `lib/rate-limit.ts` — 20 req/min per IP (in-memory Map, resets on server restart).

System prompts built server-side only. Reference docs in `lib/ai-docs/` loaded at module init and prepended to every system prompt — never sent from client. To update AI knowledge, edit those `.md` files.

Justification saves go through `app/api/tok/justification/route.ts` (POST) — verifies ownership before writing.

Score saves go through `app/api/tok/scores/route.ts` (POST) — appends `ScoreEntry` to `scores` jsonb array (max 10), verifies ownership. Called fire-and-forget after each `object_scoring` AI call.

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

### TOK server actions

`app/dashboard/tok/actions.ts` — `"use server"` functions for all DB mutations:
- `createExhibition(formData)` — inserts exhibition, redirects to workspace
- `deleteExhibition(id)`
- `saveObject(formData)` — upserts tok_object; max 3 objects per exhibition enforced
- `deleteObject(exhibitionId, objectId)`
- `duplicateExhibition(id)` — copies exhibition + all objects with "(copy)" suffix
- `swapObjectPositions(exhibitionId, posA, posB)` — swaps two objects' positions
- `updateExhibitionTitle(id, title)` — updates exhibition title

Justification saves use a dedicated route `app/api/tok/justification/route.ts` (POST) for client components. Also calls `revalidatePath` after write.

### Global utilities
- `lib/toast.tsx` — `ToastProvider` + `useToast()` hook. Wrapped in layout. Non-blocking bottom-right toasts (success/error/info). 3s auto-dismiss.
- `lib/rate-limit.ts` — in-memory per-IP rate limiter for AI route.
- `components/ScrollToTop.tsx` — listens to `usePathname`, scrolls window to top on each route change.

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
3. **Google OAuth** — `/auth/callback` route + login page button built. Needs Google Cloud OAuth credentials + Supabase provider config. ✓ code done, manual Supabase + Google Cloud config needed.

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
2. ✓ Auth completeness — email confirm + password reset + Google OAuth routes built. Manual Supabase config needed.
3. Usage gates — build `profiles` table migration, enforce free tier limits server-side.
4. ✓ TOK workspace polish — loading states, save states, delete confirmations, word count, AI scoring done.
5. ✓ Google OAuth — callback route + login button built. Manual Supabase + Google Cloud config needed.
6. Custom SMTP — configure Resend before launch.
7. Export/share — @media print CSS done. PDF export via browser Cmd+P works.
8. Payments — Paddle checkout + webhook after usage gates exist.
9. Deploy — see Deployment section above.

## Recently completed (May 2026)
- PromptPicker: Escape handler guarded with `expandedId === null` — filter reset only fires when no modal is open
- PromptPicker: Column heading dim now gates with `!selected` — selected column stays highlighted when hovering a different column
- PromptPicker: Card dim formula unions selected + hovered categories instead of replacing active with hovered
- PromptPicker: Hover card-bump uses Framer `whileHover` instead of CSS class (composes correctly with ripple `scale` inline transform). `boxShadow` base in `style` for SSR consistency.
- PromptPicker: Column heading hover tint — subtle background when `active && !selected`
- PromptPicker: Match count moved left of search bar, clear (x) button removed
- PromptPicker: Hydration errors fixed by gating toolbar buttons and category headings with `mounted` — SSR and client first render always match
- Multi-exhibition list with progress indicators
- AI object scoring intent (score/10 + strength/weakness/tip)
- AI knowledge question generator (3 IB-style KQs with rationale)
- AI object_check intent — IB suitability pre-flight (verdict/issue/promptLink/tip)
- AI justification_improve intent — rewrite to be stronger keeping student ideas
- AI justification_chat with multi-turn history support
- AI object_ideas intent (3 concrete suggestions)
- `lib/ai-docs/justification-examples.md` — annotated strong/weak examples + phrase banks
- Inline exhibition title editing
- Debounced 2s auto-save for justification textarea (silent, no toast)
- CAS/EE stub pages with feature lists
- Dashboard stats (4-col: exhibitions, objects, justified ratio, words written) + "Continue" card with per-exhibition progress bars
- Copy-to-clipboard on justifications
- 404 page, /api/health endpoint, sitemap.ts, robots.ts
- SEO: og:image via /api/og (ImageResponse edge), JSON-LD structured data, twitter:card large
- Category filter wired into matchingPromptIds in PromptPicker
- Keyboard shortcuts: / (search), r (random), Esc (clear all filters) in prompt picker
- Keyboard hints bar in prompt picker
- Account deletion flow on profile (DeleteAccountButton + deleteAccount server action, requires SUPABASE_SERVICE_ROLE_KEY)
- Exhibition duplication (duplicateExhibition action)
- In-memory rate limiter on AI route (20 req/min per IP)
- Public /tok-prompts reference page (all 35 prompts, SEO-friendly)
- /contact, /about, /tips pages
- GDPR rights table + children's privacy section in privacy policy
- Toast notification system (lib/toast.tsx, ToastProvider in layout)
- ScrollToTop component — scrolls to top on every route change
- Live word count sync via custom DOM event (ObjectCard → WordCountSummary + SubmissionChecklist)
- SubmissionChecklist — auto-checked items use live state, manual checkboxes for soft items
- Plain text export (/api/tok/export-text) + JSON export (/api/tok/export) on workspace
- Print-ready workspace export via browser Cmd+P
- Dynamic metadata (title = exhibition name + prompt) on workspace page with noindex
- maxOutputTokens tuned per intent (400 for JSON, 1200 for multi-item, 1000 default)
- AI score persistence — `/api/tok/scores` route saves each score entry to `scores` jsonb column (array, max 10 entries), ObjectCard shows score history as mini bar chart
- Score history bar chart in ObjectCard (`initialScores` prop passed from page.tsx, `scoreHistory` state updated optimistically after each score)
- "Tips" link added to Navbar (between Prompts and Pricing)
- Exhibition list progress bars fixed to use position-based object lookup (not array index)
- Login page: `useSearchParams()` wrapped in `<Suspense>` for Next.js 16 static generation compatibility
- Favicon: hexagon+C SVG (`app/icon.svg`) + ICO fallback (`public/favicon.ico`)
- Google OAuth: `/auth/callback` route + "Continue with Google" button on login page. Needs manual Supabase + Google Cloud config.

## New env vars (added May 2026)
| Variable | Purpose |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Required for account deletion (admin.deleteUser). Server-only, never expose to client. |

## Deployment (Vercel)

Primary deploy target. GitHub push → auto-build. Hobby tier free, works for ≤50 active users. Monitor function duration in dashboard.

### Required environment variables

| Variable | Where to get |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project settings → API |
| `GEMINI_API_KEY` | Google AI Studio |
| `PADDLE_API_KEY` | Paddle dashboard (server-only) |
| `PADDLE_WEBHOOK_SECRET` | Paddle webhook settings (server-only) |
| `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | Paddle dashboard |
| `NEXT_PUBLIC_PADDLE_STUDENT_PRICE_ID` | Paddle product catalog |
| `SUPABASE_SERVICE_ROLE_KEY` | Account deletion (server-only, never expose to client) |

### Pre-deploy checklist

1. `npm run build` — must pass with zero TS errors
2. Supabase: enable "Confirm email" + set redirect URL to `https://yourdomain.com/auth/confirm`
3. Supabase: add production domain to allowed redirect URLs
4. Supabase: add `SITE_URL` in Auth settings
5. Paddle: add production webhook endpoint `https://yourdomain.com/api/webhooks/paddle`
6. Run Supabase migrations 001 + 002 on production project
7. Smoke test: register → confirm email → create exhibition → generate justification

### Post-deploy

- Verify `/api/health` returns `{"status":"ok"}`
- Test auth flow end-to-end (sign up, confirm, sign in, sign out)
- Test TOK exhibition creation and AI call

### Favicon

- `app/icon.svg` — Next.js 16 auto-serves as primary favicon (hexagon + C, Excalidraw style)
- `public/favicon.ico` — legacy browser fallback

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)
