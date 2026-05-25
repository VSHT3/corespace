# TODO

## TOK — Exhibition Workspace (`/dashboard/tok/[id]`)

### Layout & UX
- [ ] **Fullscreen focus write mode** — textarea needs an expand-to-fullscreen button (modal or full viewport) for distraction-free writing, with the prompt and object info pinned at top.
- [ ] **Auto-stretch textarea** — current `useEffect` auto-resize is jumpy. Switch to `useLayoutEffect` or a CSS-based approach (`field-sizing: content` in modern CSS). The textarea also has `overflow: hidden` which clips scrollable content — use `overflow-y: auto` when height exceeds max.
- [ ] **Sliding notes panel** — `ExhibitionNotes` component exists but unfinished. Button+panel on right side, portal-based, fixed positioning. Still needs: proper notes persistence (DB instead of localStorage), better layout integration, possible DB-backed storage.

### AI & Features
- [ ] **Object recommendator** — `ObjectIdeasButton` exists but is generic. Add per-object recommendations tied to the specific prompt + existing objects (avoid duplicates). Show suggestions inline in the add-object form.
- [ ] **AI call counting is inaccurate** — dashboard/profile counts 1 per object with justification + 1 per scores object, but doesn't count actual API calls (generating, improving, scoring, KQs, chat). Build a proper `ai_usage` table or increment a counter per profile.
- [ ] **Justification word count target metadata** — WordCountSummary uses 950 total target. The IB Exhibition limit is 950 words for all 3 justifications combined. Show per-justification target (≈300) in the card.
- [ ] **AI usage gate (server-side)** — free tier limits (20 calls/month) only displayed on profile, not enforced server-side. Reject AI calls when limit exceeded.

### Export
- [ ] **Markdown export** — add `.md` export option with clean markdown formatting (prompt, objects, justifications).

## Prompt Picker (`/dashboard/tok/exhibition`)

- [ ] **Hardcoded 1060px width** — `ExpandedCard` uses `width: "1060px"` which breaks on mobile. Use responsive widths with `min()` / `vw` units.
- [ ] **Escape handler gating** — keyboard Escape inside the chat panel closes the expanded card instead of just the chat. Should check `chatOpen` first.
- [ ] **Hydration safety** — `createPortal(..., document.body)` in `ExpandedCard` is gated with `if (typeof document === "undefined") return null` which is a runtime check. Consider a `useEffect`-based mount guard.
- [ ] **Session chat persistence** — `sessionChat` Map persists per session but doesn't survive tab close (sessionStorage). Consider persisting to sessionStorage so chat survives browser refreshes.

## Dashboard (`/dashboard`)

- [ ] **Empty state** — no "getting started" guide for new users with zero exhibitions. Show a walkthrough or CTA card.

## Profile (`/profile`)

- [ ] **3-column grid mobile breakpoint** — `gridTemplateColumns: "1fr 1fr 1fr"` stacks on narrow screens but columns become too narrow first. Collapse to single column below 800px.
- [ ] **AI usage card** — the progress bar doesn't reset per month (in-memory Map on AI route resets on server restart only). Need persistent monthly tracking.
- [ ] **Delete account flow** — requires `SUPABASE_SERVICE_ROLE_KEY`. Needs verification that it works in production.

## General — Auth

- [ ] **Custom SMTP** — Supabase defaults to 3 emails/hour. Configure Resend (or similar) for production.


## General — Payments & Plans

- [ ] **Paddle checkout** — upgrade button on `/profile` not wired to `Paddle.Checkout.open()`. Add Paddle.js overlay integration.
- [ ] **Paddle webhook** — `app/api/webhooks/paddle/route.ts` doesn't exist. Build it: verify signature → update `profiles.plan`.
- [ ] **Profiles plan column** — add migration for `plan` column (`free | student | school`).
- [ ] **Pricing page polish** — `/pricing` page exists but has no checkout buttons. Wire plan selection → Paddle checkout.

## General — Pages

- [ ] **CAS tracker** — basic structure built (list + detail + reflections). Needs: hours breakdown per category, evidence links, supervisor export, deadline reminders. Migration `003_cas.sql` must be run in Supabase SQL Editor.
- [ ] **EE page** — `/dashboard/ee` is a stub. Build real EE assistant (research question, outline, draft feedback).
- [ ] **Contact page** — `/contact` is static. Wire to a form handler or mail service.

## General — Infrastructure

- [ ] **Rate limit persistence** — resets on every server restart. Move to DB or Redis for production.
- [ ] **Server-side AI usage enforcement** — `ai_calls` column on profiles, increment on each `/api/ai` call, reject when ≥ 20/month for free tier.
- [ ] **Paddle webhook secret** — verify signature before updating plan.

## Polish

- [ ] **IB Exhibition submission checklist** — "At least 2 different object types" could be auto-checked by looking at object types. "Personal connection" could be auto-checked if at least one object type is "Personal".
- [ ] **Exhibition "submitted" state** — no way to mark an exhibition as done/submitted. Add a status field to `tok_exhibitions` table.

## Deferred (after launch)

- [ ] Custom domain for Google OAuth consent screen — currently shows `corespace-dun.vercel.app`. Needs custom domain and Google OAuth verification.
- [ ] Social login — add Apple/Microsoft sign-in for school accounts.
- [ ] Exhibition sharing — shareable link (read-only) for supervisor review.
- [ ] Exhibition gallery — public showcase of exemplary exhibitions (opt-in).
- [ ] Export to IB format — generate the official TOK Exhibition document format.
- [ ] Mobile app — PWA or native wrapper for offline access.
- [ ] Team/school accounts — group management for teachers/coordinators.
