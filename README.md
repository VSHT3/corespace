# Corespace

AI-powered tools for IB Diploma students. Currently: **TOK Exhibition helper**. CAS and EE coming soon.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase (auth + database)
- Anthropic API (claude-haiku-3-5)
- Paddle (Merchant of Record — payments, VAT, invoicing)

## Setup

### 1. Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. In the **SQL Editor**, run the contents of `supabase/migrations/001_initial.sql`.
4. In **Authentication → Providers**, ensure Email is enabled.

### 2. Anthropic

Get an API key from [console.anthropic.com](https://console.anthropic.com) → `ANTHROPIC_API_KEY`.

### 3. Environment variables

```bash
cp .env.local.example .env.local
# Fill in the values
```

### 4. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Folder structure

```
app/                  Next.js App Router pages
  api/ai/route.ts     Server-side Anthropic API route
  dashboard/          Protected app pages
  login/              Auth page
lib/
  supabase-client.ts  Browser Supabase client
  supabase-server.ts  Server Supabase client (RSC + API routes)
  anthropic.ts        Anthropic SDK instance
types/
  index.ts            Shared TypeScript types
supabase/migrations/  SQL migration files (run manually in Supabase SQL editor)
middleware.ts         Auth middleware — protects /dashboard, redirects /login
```
