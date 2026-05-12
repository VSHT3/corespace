@CLAUDE.md
<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Commands

- `npm run dev` — dev server (uses `--webpack`, not Turbopack)
- `npm run build` — production build
- Typecheck: `node node_modules/typescript/bin/tsc --noEmit` (not in scripts)
- No lint, no test, no CI — none exist

## Package manager

**npm** only. Do not use pnpm/yarn/bun.

## Next.js 16 quirks

- `middleware.ts` → `proxy.ts`, export `proxy` not `middleware`
- No `runtime` config in proxy files
- Path alias `@/*` maps to repo root

## App structure

- Single-package Next.js app (not a monorepo)
- Supabase: two clients (`lib/supabase-client.ts` for client, `lib/supabase-server.ts` for server). Client-side `createBrowserClient` must be instantiated inside event handlers only (not module scope — breaks SSR prerender)
- AI: server-only, Gemini `gemini-2.5-flash` via `app/api/ai/route.ts`. Client components call this endpoint, never import `lib/gemini.ts`
- Auth gate: `proxy.ts` protects `/dashboard/**` and `/profile/**`

## Database

- Supabase cloud. Migrations in `supabase/migrations/` — run manually via SQL editor, never CLI
- RLS on all tables, policies scoped by `auth.uid()`

## Design

Brutalist Pastel theme — no shadows, no gradients, no blur, no pill shapes. Tokens in `app/globals.css` (`@utility` classes). Full spec in `DESIGN.md` and `STYLE.md`.

## graphify

Knowledge graph at `graphify-out/`. After code changes, run `graphify update .`
