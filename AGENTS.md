<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor project map

This repo is developed with **Cursor** (IDE + Cloud Agents). Agent instructions live under `.cursor/`.

| Path | Purpose |
| --- | --- |
| [`docs/product/vision.md`](docs/product/vision.md) | Product scope and MVP |
| [`docs/architecture/overview.md`](docs/architecture/overview.md) | Stack and data boundaries |
| [`docs/development/workflow.md`](docs/development/workflow.md) | Branch / PR / verification flow |
| [`docs/development/steering.md`](docs/development/steering.md) | Where to put rules vs skills vs agents |
| [`docs/development/loops.md`](docs/development/loops.md) | Verification loops and stop criteria |
| [`.cursor/skills/`](.cursor/skills/) | On-demand procedural skills |
| [`.cursor/rules/`](.cursor/rules/) | Always-on and path-scoped rules |
| [`.cursor/agents/`](.cursor/agents/) | Isolated subagents (e.g. code review) |

`CLAUDE.md` only points here for compatibility; **prefer this file and `.cursor/`**.

## Commands

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build
```

## Conventions (short)

- Keep `AGENTS.md` lean; put long procedures in `.cursor/skills/`.
- Path-specific constraints → `.cursor/rules/*.mdc` with `globs`.
- After UI changes, use skill `verify-frontend-change` before declaring done.
- New Supabase tables: RLS **and** `grant` for `anon`/`authenticated`.
- Do not commit secrets (`.env*` except `.env.example`).

## Cursor Cloud specific instructions

This is a Next.js 16 (App Router, React 19, Tailwind 4) recipe app that uses Supabase
as its database, intended to deploy on Vercel. Standard scripts live in `package.json`
(`dev`, `build`, `start`, `lint`).

### Services

- **Web app (Next.js)**: `npm run dev` (http://localhost:3000). Reads Supabase config
  from `.env.local`.
- **Database (Supabase, local stack)**: runs in Docker via the Supabase CLI. Only needed
  when you want the app's data flow (listing/adding recipes) to actually work locally.

### Starting the local Supabase stack (non-obvious)

The update script only runs `npm install`. Docker and the Supabase CLI are provisioned in
the VM image, but the Docker daemon is **not** auto-started and the DB stack is **not**
auto-run. To bring the database up:

1. Start the Docker daemon (it does not run on boot):
   `sudo dockerd > /tmp/dockerd.log 2>&1 &`
   then make the socket usable without sudo:
   `sudo chown root:docker /var/run/docker.sock && sudo chmod 660 /var/run/docker.sock`.
   Run docker/supabase as the `docker` group, e.g. wrap commands with `sg docker -c "..."`.
2. Start Supabase from the repo root: `sg docker -c "supabase start"`. It applies
   `supabase/migrations/` automatically and prints `API_URL` and `ANON_KEY`.
3. Put those into `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`. For the default local stack these are
   `http://127.0.0.1:54321` and the standard demo anon key. `.env*` is git-ignored.
4. `supabase db reset` re-applies all migrations from scratch (use after editing SQL).

Caveats:
- The Supabase CLI is a shim (`supabase`) that forwards to a `supabase-go` binary; both
  must sit together on `PATH` (both are in `/usr/local/bin`).
- No database schema exists yet (no files in `supabase/migrations/`). The app currently
  renders a static landing screen and does not read/write any tables, so it boots fine
  without Supabase configured.
- When tables are added later: new tables need explicit `grant` statements for the
  `anon`/`authenticated` roles in the migration in addition to RLS policies, otherwise the
  REST API returns `permission denied`.

### Next.js 16 gotchas

- `cookies()`/`headers()` are async — `src/lib/supabase/server.ts` awaits `cookies()`.
- Middleware is renamed to `proxy` (use `proxy.ts`), not `middleware.ts`.
