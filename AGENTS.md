# AGENTS.md

Guidance for Claude Code (claude.ai/code) when working in this repo.

## Caveman mode

Always use `/caveman` (full intensity) for all communication. Commits use `/caveman-commit` format. Do not revert to normal mode unless user says "stop caveman" / "normal mode".

## Critical: This is Next.js 16

**Not Next.js 13/14/15.** Breaking changes apply. Before writing code, read relevant guide in `node_modules/next/dist/docs/`. Heed all deprecation warnings from dev server.

Key renames vs prior versions:
- `middleware.ts` → `proxy.ts`, export function must be named `proxy` (not `middleware`)
- `runtime` config option **not available** in proxy files

## Commands

```bash
npm run dev      # dev server on localhost:3000 (Turbopack)
npm run build    # production build (runs tsc + page generation)
npm run start    # serve production build
```

TypeScript check (no dedicated lint script):
```bash
node node_modules/typescript/bin/tsc --noEmit
```

Available via `opencode.json` commands:
```bash
opencode build     # tsc + build
opencode check     # tsc only
opencode commit    # git add -A + conventional commit
```

Running dev server in background:
```bash
nohup npm run dev > /tmp/dev.log 2>&1 &
```

Kill dev server:
```bash
kill $(lsof -ti:3000)
```

## Available CLIs

| Tool | How to use | Notes |
|---|---|---|
| **Vercel CLI** | `vercel <command>` (aliased globally) | Auto-deploys on git push to `main`. Env vars set via `vercel env add <KEY> production`. Project: `vsht/corespace`. |
| **Supabase CLI** | Not installed | For local DB dev. Use Supabase Dashboard for schema edits. Migrations tracked in `supabase/migrations/`, run in SQL Editor manually. |
| **Supabase MCP** | `supabase-mcp` (via opencode.json) | Installed + configured in opencode.json. SQL execution, migration apply, TS types gen, table listing. Needs `SUPABASE_SERVICE_ROLE_KEY` in env. |
| **Supabase Management API** | `curl -X PATCH "https://api.supabase.com/v1/projects/pjjupictmrlpxbvhcgxf/config/auth" -H "Authorization: Bearer sbp_...`" | Used for auth provider config (Google OAuth, SMTP, etc.). Requires Supabase PAT. Base: `https://api.supabase.com/v1/projects/pjjupictmrlpxbvhcgxf`. |
| **GitHub CLI** | `gh` (available in env) | For PRs, issues, releases. |

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

### Google OAuth (direct flow, bypasses Supabase proxy)

```
/login "Continue with Google" → /api/auth/google (sets CSRF cookie) → accounts.google.com → /auth/callback/google (exchange code via GOOGLE_CLIENT_SECRET) → supabase.auth.signInWithIdToken() → /dashboard
```

Google consent screen shows the **Authorized Domain** from OAuth consent screen (currently `corespace-dun.vercel.app`). Changes to the **app name** ("Corespace") only after passing Google's OAuth verification — requires owning a custom domain. This is cosmetic and doesn't affect functionality.

Routes:
- `app/api/auth/google/route.ts` — GET, redirects to Google with `state` CSRF cookie
- `app/auth/callback/google/route.ts` — GET, exchanges code for id_token, calls `signInWithIdToken`

### Shared components

- `components/Navbar.tsx` — server component, shows auth state. Sticky, 2px border-bottom. 3-col grid layout (logo | nav | actions).
- `components/LogoutButton.tsx` — client component, calls `supabase.auth.signOut()`.
- `components/Footer.tsx` — server component, tucked legal links.
- `components/CookieBanner.tsx` — client component, localStorage-persisted consent (accept/reject/customize), bottom-left corner.

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
- `.eyebrow` — 13px uppercase label, `#000`, letter-spacing 0.08em
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
- `profiles` — `id` (FK auth.users), `username` (unique), `email_study_tips`, `email_product_updates`, `show_ai_limit_on_dashboard`, `updated_at`

### TOK server actions

`app/dashboard/tok/actions.ts` — `"use server"` functions for all DB mutations:
- `createExhibition(formData)` — guards multiple creations (IB rule: 1 per student), inserts or redirects to existing
- `deleteExhibition(id)` — deletes and redirects to prompt picker
- `saveObject(formData)` — upserts tok_object; max 3 objects per exhibition enforced
- `deleteObject(exhibitionId, objectId)`
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
3. **Google OAuth** — `/auth/callback` route + login page button + Supabase provider configured via Management API + direct OAuth flow bypassing Supabase proxy. ✓ done.

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
5. ✓ Google OAuth — direct OAuth flow bypasses Supabase proxy. User domain shown instead of supabase.co on consent screen.
6. Custom SMTP — configure Resend before launch.
7. Export/share — @media print CSS done. PDF export via browser Cmd+P works.
8. Payments — Paddle checkout + webhook after usage gates exist.
9. Deploy — see Deployment section above.

## Recently completed (May 2026)
- Profile/settings 3-column card layout with distributed vertical content and section dividers
- Username on signup, inline edit on profile, Google OAuth email-prefix fallback
- Notification toggle prefs (email_study_tips, email_product_updates) + AI dashboard visibility toggle (show_ai_limit_on_dashboard)
- AI call usage stat on dashboard (gated by profile pref), configurable from profile AI Usage card
- Eyebrow headings: 13px, bold, black — visible again
- Favicon: clean hexagon outline + bold C (app/icon.svg), dark mode via media query, multi-res ICO fallback
- PromptPicker: Escape handler guarded with `expandedId === null` — filter reset only fires when no modal is open
- PromptPicker: Column heading dim now gates with `!selected` — selected column stays highlighted when hovering a different column
- PromptPicker: Card dim formula unions selected + hovered categories instead of replacing active with hovered
- PromptPicker: Hover card-bump uses Framer `whileHover` instead of CSS class (composes correctly with ripple `scale` inline transform). `boxShadow` base in `style` for SSR consistency.
- PromptPicker: Column heading hover tint — subtle background when `active && !selected`
- PromptPicker: Match count moved left of search bar, clear (x) button removed
- PromptPicker: Hydration errors fixed by gating toolbar buttons and category headings with `mounted` — SSR and client first render always match
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

- In-memory rate limiter on AI route (20 req/min per IP)
- Public /tok-prompts reference page (all 35 prompts, SEO-friendly)
- /contact, /about, /tips pages
- GDPR rights table + children's privacy section in privacy policy
- Toast notification system (lib/toast.tsx, ToastProvider in layout)
- ScrollToTop component — scrolls to top on every route change
- Live word count sync via custom DOM event (ObjectCard → WordCountSummary + SubmissionChecklist)
- SubmissionChecklist — auto-checked items use live state, manual checkboxes for soft items
- Plain text export (/api/tok/export-text) on workspace
- Print-ready workspace export via browser Cmd+P
- Dynamic metadata (title = exhibition name + prompt) on workspace page with noindex
- maxOutputTokens tuned per intent (400 for JSON, 1200 for multi-item, 1000 default)
- AI score persistence — `/api/tok/scores` route saves each score entry to `scores` jsonb column (array, max 10 entries), ObjectCard shows score history as mini bar chart
- Score history bar chart in ObjectCard (`initialScores` prop passed from page.tsx, `scoreHistory` state updated optimistically after each score)
- "Tips" link added to Navbar (between Prompts and Pricing)
- Exhibition list progress bars fixed to use position-based object lookup (not array index)
- Login page: `useSearchParams()` wrapped in `<Suspense>` for Next.js 16 static generation compatibility
- Favicon: hexagon+C SVG (`app/icon.svg`) + ICO fallback (`public/favicon.ico`)
- Google OAuth: full flow built — callback route, login button, Supabase provider configured via Management API.
- Google OAuth: direct flow bypasses Supabase proxy — `/api/auth/google` + `/auth/callback/google` with `signInWithIdToken()`. Consent screen shows user Vercel domain instead of supabase.co.
- `.env.local.example` updated with GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXT_PUBLIC_SITE_URL
- Vercel env vars set for production: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXT_PUBLIC_SITE_URL

## New env vars (added May 2026)
| Variable | Purpose |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Required for account deletion (admin.deleteUser). Server-only, never expose to client. |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID for direct OAuth flow (server-only). |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret for token exchange (server-only, never expose to client). |
| `NEXT_PUBLIC_SITE_URL` | Canonical base URL for OAuth redirect URIs (`http://localhost:3000` dev, `https://corespace-dun.vercel.app` prod). |

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
| `GOOGLE_CLIENT_ID` | Google OAuth client ID for direct OAuth flow (server-only) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret (server-only, never expose to client) |
| `NEXT_PUBLIC_SITE_URL` | Canonical base URL for OAuth redirects (`http://localhost:3000` dev) |

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

- `app/icon.svg` — Next.js 16 auto-serves as primary favicon. Clean hexagon outline + bold "C". Dark mode via `@media (prefers-color-scheme: dark)` (black → white).
- `public/favicon.ico` — legacy browser fallback, multi-res (16–256px), dark logo for light tabs.

## TODO

`TODO.md` at repo root — comprehensive audit of everything pending. **Delete items when done** (no checkmarks). Read it before starting any significant work to know what's on deck and avoid duplicating effort.

## FEATURES

`FEATURES.md` at repo root — catalog of everything built. Append to it when finishing significant features. Consult it before answering "does this already exist?" questions.

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)
