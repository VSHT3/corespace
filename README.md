# Corespace

**AI-powered study tools for IB Diploma students.**

Built by an IB student for IB students — currently ships a full TOK Exhibition workspace with AI-assisted justification drafting, auto-save, and prompt navigation. CAS recorder and EE assistant are in development.

## Features

- **TOK Exhibition workspace** — browse all 35 official prompts, create objects with justifications, AI-assisted drafting
- **Gemini AI integration** — generates exhibition justification drafts you can edit, accept, or reject
- **User accounts** — Supabase auth with email login
- **Payments** — Paddle for subscriptions, VAT, and invoicing
- **Type-safe** — full TypeScript with strict mode

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth |
| AI | Google Gemini (`gemini-2.5-flash`) |
| Payments | Paddle (Merchant of Record) |

## Architecture

```
app/
├── api/ai/route.ts          Gemini API route (server-only, env-gated)
├── api/tok/justification/   Save/load TOK object justifications
├── dashboard/tok/           TOK Exhibition workspace
├── dashboard/tok/[id]/      Individual exhibition workspace
lib/
├── supabase-client.ts       Browser Supabase client
├── supabase-server.ts       Server Supabase client
├── gemini.ts                Gemini SDK wrapper
├── tok-prompts.ts           All 35 official TOK prompts
types/                       Shared TypeScript interfaces
components/                  Navbar, Footer, CookieBanner, LogoutButton
proxy.ts                     Middleware — protects /dashboard and /profile
```

## Setup

### Requirements

- Node.js >= 18
- Supabase project (cloud-hosted)
- Google Gemini API key

### 1. Clone and install

```bash
git clone https://github.com/VSHT3/corespace.git
cd corespace
npm install
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy `Project URL` and `anon public` key from Settings → API
3. Run migrations from `supabase/migrations/` in order

### 3. Environment

```bash
cp .env.local.example .env.local
# Fill in Supabase credentials + Gemini API key + Paddle token
```

### 4. Run

```bash
npm run dev
# → http://localhost:3000
```
