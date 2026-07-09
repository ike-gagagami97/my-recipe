# 0001. Stack: Next.js + Supabase + Vercel

- Status: accepted
- Date: 2026-07-09

## Context

レシピアプリの初期土台として、フロント・DB・ホスティングを素早く揃え、後から認証や RLS を足せる構成が必要だった。

## Decision

- **Next.js 16** (App Router, React 19, Tailwind 4) を Web アプリに使う
- **Supabase** を Postgres + API + 将来の Auth 基盤に使う
- **Vercel** にデプロイする

## Consequences

- ローカルでは Docker + Supabase CLI が必要（データ機能を触る場合）
- スキーマは `supabase/migrations/` で管理し、RLS と grant をセットで書く
- Next.js 16 固有の API 変更（async `cookies()`, `proxy.ts` など）に追従する必要がある
- 初期は静的ランディングのみでもアプリは起動可能（Supabase 未設定でも可）
