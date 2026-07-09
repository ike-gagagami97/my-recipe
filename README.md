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

Configuring Supabase is **optional right now** — the app currently renders a landing
screen and does not read or write any tables yet. Set the values below when the data
model is added.

#### Option A — Local Supabase (for development)

Requires Docker and the [Supabase CLI](https://supabase.com/docs/guides/cli).

```bash
supabase start        # starts Postgres + API in Docker
```

Copy the printed `API_URL` and `ANON_KEY` into `.env.local`.

#### Option B — Hosted Supabase project

Create a project at [supabase.com](https://supabase.com), then copy the project URL and
anon key from **Project Settings → API** into `.env.local` (or pull them from Vercel with
`vercel env pull .env.local`).

> The database schema (tables, RLS policies) is not defined yet. It will be added under
> `supabase/migrations/` once the recipe features are designed.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing screen.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Project structure

- `src/app` — App Router pages and layout (currently a landing screen).
- `src/lib/supabase` — browser (`client.ts`) and server (`server.ts`) Supabase clients, ready for use once features are built.
- `supabase/` — Supabase CLI config (`config.toml`); migrations will live in `supabase/migrations/`.
- `docs/` — Product vision, architecture, development workflow, and ADRs (source of truth for humans and agents).
- `.cursor/skills/` — Cursor skills (recipe features, migrations, UI, verification).
- `.cursor/rules/` — Always-on and path-scoped Cursor rules.
- `.cursor/agents/` — Cursor subagents (e.g. code review).
- `AGENTS.md` — Cursor agent entrypoint (Cloud + local).

See [`docs/README.md`](docs/README.md) for the documentation map,
[`docs/development/steering.md`](docs/development/steering.md) for Cursor steering,
and [`docs/development/workflow.md`](docs/development/workflow.md) for the development flow.

## Deploying to Vercel

Import the repo into Vercel, set `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` in the project's Environment Variables, and deploy.
