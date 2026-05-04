# Corespace

AI-powered study tools for IB Diploma students. Currently: **TOK Exhibition helper**. CAS and EE coming soon.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Supabase (auth + database, cloud-hosted)
- Google Gemini API (`gemini-2.5-flash`)
- Paddle (Merchant of Record — payments, VAT, invoicing)

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. In the **SQL Editor**, run migrations in order:
   - `supabase/migrations/001_initial.sql`
   - `supabase/migrations/002_tok_additions.sql`
4. In **Authentication → Providers**, ensure Email is enabled.

### 2. Google Gemini

Get an API key from Google AI Studio, then set it as `GEMINI_API_KEY`.

### 3. Environment variables

```bash
cp .env.local.example .env.local
# Fill in values
```

### 4. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Folder structure

```
app/                        Next.js App Router pages
  api/ai/route.ts           Gemini API route (server-only)
  api/tok/justification/    Save TOK object justification
  dashboard/tok/            TOK Exhibition helper
  dashboard/tok/[id]/       Exhibition workspace
lib/
  supabase-client.ts        Browser Supabase client
  supabase-server.ts        Server Supabase client (RSC + API routes)
  gemini.ts                 Gemini SDK instance
  tok-prompts.ts            All 35 official TOK prompts
types/
  index.ts                  Shared TypeScript types
components/                 Navbar, Footer, CookieBanner, LogoutButton
supabase/migrations/        SQL files — run manually in Supabase SQL Editor
proxy.ts                    Auth gate — protects /dashboard and /profile
```
