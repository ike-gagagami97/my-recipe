# my-recipe

A recipe app built with [Next.js 16](https://nextjs.org) (App Router), React 19 and
Tailwind CSS 4, using [Supabase](https://supabase.com) for the database and intended to
deploy on [Vercel](https://vercel.com).

## Tech stack

- **Framework:** Next.js 16 (App Router, Turbopack) + React 19
- **Styling:** Tailwind CSS 4
- **Database:** Supabase (Postgres) via `@supabase/supabase-js` + `@supabase/ssr`
- **Hosting:** Vercel

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

Copy the example env file and fill in your Supabase project values:

```bash
cp .env.example .env.local
```

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project (or local) API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/publishable key |

#### Option A — Local Supabase (recommended for development)

Requires Docker and the [Supabase CLI](https://supabase.com/docs/guides/cli).

```bash
supabase start        # starts Postgres + API in Docker, applies supabase/migrations
```

Copy the printed `API_URL` and `ANON_KEY` into `.env.local`.

#### Option B — Hosted Supabase project

Create a project at [supabase.com](https://supabase.com), run the SQL in
`supabase/migrations/` against it, and copy the project URL and anon key from
**Project Settings → API** into `.env.local` (or pull them from Vercel with
`vercel env pull .env.local`).

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Add a recipe using the form; it is
stored in Supabase and shown in the list.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Project structure

- `src/app` — App Router pages, layout, server action (`actions.ts`) and the client form.
- `src/lib/supabase` — browser (`client.ts`) and server (`server.ts`) Supabase clients + types.
- `supabase/migrations` — SQL migrations (the `recipes` table).

## Deploying to Vercel

Import the repo into Vercel, set `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` in the project's Environment Variables, and deploy.
