# Corespace Features

## Theory of Knowledge — Exhibition

### Prompt Picker (`/dashboard/tok/exhibition`)
- All 35 official IB TOK prompts with difficulty ratings (1–5) and descriptions
- Animated tour: cards scatter → sort → ripple into 6 knowledge-area categories
- Category filter (Knowledge, Reliability, Ethics, Communication, Culture, Change)
- Search across prompt titles, descriptions, and categories
- Difficulty filter (Easy / Medium / Hard)
- "Surprise me" random prompt
- Keyboard shortcuts: `/` search, `r` random, `Esc` clear filters
- Expanded prompt modal with:
  - Full description
  - Difficulty dots + label
  - AI chat panel (session-persistent history, markdown rendering)
  - 3 suggestion chips (explain prompt, suggest objects, KQs)
- Exhibition creation with custom title

### Exhibition Workspace (`/dashboard/tok/[id]`)
- Inline title editing
- 3 object slots with accent colors (pink, mint, sky)
- Object editor: title, type (8 IB categories), description (500 char limit)
- Auto-save justification (2s debounced)
- Live word count per justification + color-coded progress (target ~300, max 950)
- Live word count synced across workspace via `CustomEvent`

### AI Features (all via `/api/ai`, `gemini-2.5-flash`)
- **Justification generator** — rubric-trained draft for a specific object + prompt
- **Justification improver** — rewrite to be stronger while keeping the student's ideas
- **Object suitability check** — pre-flight IB readiness (verdict: strong/acceptable/weak)
- **AI scoring** — score/10 with strength, weakness, actionable tip; persisted to DB
- **Score history** — mini bar chart (last 10 scores)
- **Knowledge question generator** — 3 IB-style KQs with rationale + best-fit recommendation
- **Object ideas** — 3 concrete, varied object suggestions per prompt
- **Refinement chat** — multi-turn dialogue to improve justifications

### Workspace Tools
- Submission checklist (8 items: 3 auto-tracked, 5 manual)
- IB marking rubric reference panel
- Object ideas panel (per-prompt AI suggestions)
- Word count summary bar with total/950 target
- Print button + keyboard shortcut (`P`)
- Keyboard shortcuts: `P` print
- Plain text export (`/api/tok/export-text`) — all objects + prompt in one file
- Copy-to-clipboard on justifications
- Accordion-collapsed AI sections (scoring, KQs, chat) — card stays compact by default
- Mobile responsive: workspace grid → single column, 2-col object views → stack

### Exhibition Management
- Single exhibition per user (IB rule: 1 per student)
- Prompt picker on first visit, direct workspace on return
- Delete to start over (redirects to prompt picker)

### Dashboard (`/dashboard`)
- Stats: exhibitions count, object count, justified ratio, words written, AI calls
- "Continue where you left off" card with latest exhibition progress

## Auth & Account

### Authentication
- Email/password sign-up and sign-in
- Google OAuth (direct flow, bypasses Supabase proxy)
- Email confirmation flow (route built, Supabase config pending)
- Password reset flow (request + set new password)
- Session-based auth via Supabase SSR

### Profile (`/profile`)
- Email display with verification status
- Inline username editor
- AI usage stat with progress bar (20 calls/month free tier)
- Notification preferences (email study tips, product updates)
- AI dashboard visibility toggle
- Password change link
- Logout
- Account deletion

## Design System

- Brutalist Pastel: warm cream bg, ink black borders, pastel accents
- Custom CSS utilities: `card`, `btn-primary`, `btn-ghost`, `tag`, `field-input`, `eyebrow`, `heading`
- Card-bump hover effect (diagonal shadow)
- SVG brush-stroke highlights (yellow, mint, pink)
- No shadows/gradients/blur/pill shapes
- System font stack, no Google Fonts
- Responsive: `.objects-grid`, `.workspace-grid`, `.workspace-2col`, `.stats-grid` collapse at 700px; stats collapse to 2-col at 500px; tighter padding at 500px
- Print styles: clean exhibition export via `@media print`

## Pages

### Public
- `/` — Landing with hero + feature cards + TOK highlight
- `/features` — Feature breakdown per module
- `/pricing` — Plans (Free / Student / School)
- `/tok-prompts` — All 35 prompts, SEO-friendly reference
- `/tips` — IB tips
- `/about` — About page
- `/contact` — Contact page
- `/privacy` — Privacy policy (GDPR rights table, children's privacy)
- `/terms` — Terms of service

### Auth
- `/login` — Sign in / sign up + Google OAuth
- `/forgot-password` — Reset password request
- `/auth/callback` — Supabase OAuth code exchange
- `/auth/callback/google` — Google OAuth code → id_token exchange
- `/auth/confirm` — Email confirmation handler
- `/auth/reset` — Password reset redirect
- `/auth/reset/complete` — New password form

### Protected
- `/dashboard` — Module selector + stats + continue card
- `/dashboard/tok` — TOK module selector (Exhibition + Essay stub)
- `/dashboard/tok/exhibition` — Exhibition list / prompt picker
- `/dashboard/tok/[id]` — Exhibition workspace
- `/dashboard/cas` — Stub
- `/dashboard/ee` — Stub
- `/profile` — Account settings

## AI Infrastructure

- Single `/api/ai` endpoint with 8 intents, system prompts built server-side
- Reference docs loaded at module init (`lib/ai-docs/tok-overview.md`, `-guide.md`, `justification-examples.md`)
- In-memory rate limiter: 20 req/min per IP, `Retry-After` header on 429
- `maxOutputTokens` tuned per intent: 400 for JSON, 1200 for multi-item, 1000 default
- Error handling: quota/safety/network fallbacks

## Database (Supabase)

### Tables
- `tok_exhibitions` — id, user_id, prompt_id, title, created_at
- `tok_objects` — id, exhibition_id, title, description, object_type, justification, position, scores (jsonb), created_at
- `profiles` — id, username, email_study_tips, email_product_updates, show_ai_limit_on_dashboard, updated_at

### Security
- RLS enabled on all tables
- User-scoped policies via `auth.uid()`

## Utilities

- Toast notification system (`lib/toast.tsx`) — success/error/info, auto-dismiss
- Rate limiter (`lib/rate-limit.ts`) — per-IP Map with 1-min window, `Retry-After` header
- Scroll to top on route change
- Cookie consent banner (localStorage-persisted, accept/reject/customize)
- Dynamic sitemap + robots.txt
- Open Graph image generation (`/api/og`, edge runtime)
- JSON-LD structured data on landing page
- Metadata templates per page with `noindex` on workspace

## Deployment

- Vercel auto-deploy on git push to `main`
- Environment: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_SITE_URL`, Paddle vars
- Health endpoint: `/api/health`
- 404 page
- Favicon: SVG hexagon+C + ICO fallback

## Coming Soon (stubs exist)

- CAS tracker — hours log, structured reflections, learning outcomes
- Extended Essay assistant — research question, outline, draft feedback
- Paddle payments — checkout + webhook + plan enforcement
