# Architecture overview

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) + React 19 |
| Styling | Tailwind CSS 4 |
| Database / API | Supabase (Postgres + PostgREST) |
| Hosting | Vercel |
| Language | TypeScript |

## Runtime boundaries

```
Browser
  └─ src/lib/supabase/client.ts   (browser Supabase client)
Server Components / Server Actions / Route Handlers
  └─ src/lib/supabase/server.ts   (cookie-aware server client)
Supabase
  └─ Postgres + RLS + grants (anon / authenticated)
```

## Source layout

```
src/
  app/                 # App Router (pages, layouts, route handlers)
  lib/
    supabase/          # Supabase clients only (no business logic yet)
supabase/
  config.toml
  migrations/          # SQL migrations (empty until schema exists)
docs/                  # Human + agent documentation
agent-skills/          # Project-specific agent skills
```

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
