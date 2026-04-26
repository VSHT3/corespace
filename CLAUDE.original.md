# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical: This is Next.js 16

**Not Next.js 13/14/15.** Breaking changes apply. Before writing code, read the relevant guide in `node_modules/next/dist/docs/`. Heed all deprecation warnings from the dev server.

Key renames vs prior versions:
- `middleware.ts` → `proxy.ts`, export function must be named `proxy` (not `middleware`)
- The `runtime` config option is **not available** in proxy files

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

SaaS for IB Diploma students. Only TOK Exhibition helper is built; CAS and EE are stubs.

### Request flow

```
browser → proxy.ts (auth gate) → app/ route → Supabase / AI API
```

`proxy.ts` protects `/dashboard/**` — redirects unauthenticated users to `/login`, redirects authenticated users away from `/login`.

### Supabase: two clients, never mixed

- `lib/supabase-client.ts` — `createBrowserClient` for `"use client"` components. **Instantiate inside event handlers, never at module scope** — calling it at module level breaks SSR prerender.
- `lib/supabase-server.ts` — `createServerClient` with cookie wiring for Server Components and Route Handlers.

### AI calls: server-only

All Anthropic calls go through `app/api/ai/route.ts` (POST). Client components call this endpoint — never import `lib/anthropic.ts` on the client. Endpoint accepts `{ prompt, systemPrompt? }`, returns `{ text }`. Model: `claude-haiku-3-5-20251001`, max_tokens 1000.

### Design system

Dark academic theme. CSS custom properties defined in `app/globals.css`:
- `--background` `--surface` `--border` `--accent` `--foreground` `--muted`
- Use `var(--accent)` etc. in Tailwind arbitrary values: `bg-[var(--accent)]`
- Font variables: `--font-inter` (body, via `font-sans`) and `--font-playfair` (headings, apply via `style={{ fontFamily: "var(--font-playfair)" }}`)
- No component libraries — Tailwind only.

### Database

Cloud Supabase (project `pjjupictmrlpxbvhcgxf`). Migration SQL lives in `supabase/migrations/` — run manually in Supabase SQL Editor, never via CLI. RLS is enabled on all tables; policies are user-scoped via `auth.uid()`.

Tables: `tok_exhibitions` (prompt_id 1–35) → `tok_objects` (title, description, object_type, scores jsonb).

### Path alias

`@/*` maps to the repo root (e.g. `@/lib/supabase-server`).
