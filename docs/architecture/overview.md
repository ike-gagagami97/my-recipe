# Architecture overview

QA 向けの入口（プロダクトと構成の解説）: [`../product/product-and-stack-for-qa.md`](../product/product-and-stack-for-qa.md)

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) + React 19 |
| Styling | Tailwind CSS 4 |
| Database / API | Supabase (Postgres + PostgREST) |
| Auth | Supabase Auth (email + password), session in cookies |
| Hosting | Vercel |
| Language | TypeScript |
| Tests | Vitest (unit, `src/lib/`) + Playwright (E2E) |

## Runtime boundaries

```
Browser
  └─ src/lib/supabase/client.ts   (browser Supabase client)
src/proxy.ts                      (runs before every request; auth redirects)
Server Components / Server Actions
  └─ src/lib/supabase/server.ts   (cookie-aware server client)
Supabase
  └─ Postgres + RLS + grants (anon / authenticated)
```

Auth redirects live in `src/proxy.ts`: unauthenticated hits on `/` or `/recipes*` go to
`/login`; authenticated hits on `/` or `/login` go to `/recipes`. Data isolation itself is
enforced by RLS, not by these redirects.

## Source layout

```
src/
  proxy.ts             # Auth redirects (Next.js 16 replacement for middleware.ts)
  app/                 # App Router (pages, layouts, server actions)
    login/             # Login screen + login action
    recipes/           # List, create, detail, edit, delete + actions.ts
  lib/
    recipes.ts         # Display formatting, list URL state, input parsing (unit tested)
    supabase/          # Supabase client factories (server / client)
supabase/
  config.toml
  migrations/          # SQL migrations (append-only; table + RLS + grants)
tests/e2e/             # Playwright specs + page objects
docs/                  # Human + agent documentation
.cursor/
  skills/              # On-demand procedural skills
  rules/               # Always-on and path-scoped rules
  agents/              # Isolated subagents
```

## Data model

Single table `public.recipes`, owned per user:

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | pk, `gen_random_uuid()` |
| `user_id` | uuid | fk → `auth.users(id)` on delete cascade |
| `title` | text | required |
| `cooking_time_minutes` | integer | nullable |
| `ingredients` / `steps` / `notes` | text | nullable; newline separated for the first two |
| `created_at` / `updated_at` | timestamptz | `updated_at` maintained by trigger |

RLS policies (`select` / `insert` / `update` / `delete`) all match `auth.uid() = user_id`,
with the matching `grant` to `authenticated`. `pg_trgm` lives in the `extensions` schema
(not `public`, which the Data API exposes).

## Next.js 16 notes (must follow)

- Read `node_modules/next/dist/docs/` before using unfamiliar APIs
- `cookies()` / `headers()` are **async**
- Request middleware file is `proxy.ts`, **not** `middleware.ts`
- Prefer Server Components by default; add `"use client"` only when needed

## Data access rules

1. UI から直接 SQL を書かない。Supabase client + RLS 経由
2. 新テーブルには **RLS policy + `grant`（anon/authenticated）** を必ず付ける
3. スキーマ変更は必ず `supabase/migrations/` のマイグレーションで行う
4. サービスロールキーをフロントや公開リポジトリに置かない

## Env

| Variable | Where used |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | browser + server clients |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser + server clients |

`.env.example` を正とし、実値は `.env.local`（gitignored）。

## Deploy

Vercel に import し、上記 2 変数を Environment Variables に設定してデプロイ。

Preview デプロイは `supabase/migrations/` をホスト DB に**適用しない**。新しい policy / grant を
含む PR は、L4 の前に人間がホスト DB へ適用する必要がある（適用漏れの症状は「画面は開くが
保存だけ失敗する」）。
