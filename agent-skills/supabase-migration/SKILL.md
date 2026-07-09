---
name: supabase-migration
description: Supabase のテーブル・RLS・grant・シードを追加・変更するときに使う。migrations の書き方とローカル適用手順。
---

# Supabase migration

スキーマ変更の正本は `supabase/migrations/` です。

## 開始前

1. [`docs/architecture/overview.md`](../../docs/architecture/overview.md) のデータアクセスルールを確認
2. 既存マイグレーションを読み、重複や破壊的変更を避ける
3. ローカルで検証するなら Docker + `supabase start` が必要（`AGENTS.md` 参照）

## マイグレーション作成

ファイル名:

```text
supabase/migrations/YYYYMMDDHHMMSS_description.sql
```

必須セット（新テーブル）:

1. `create table ...`
2. `alter table ... enable row level security`
3. RLS policies（誰が select/insert/update/delete できるか）
4. **`grant` for `anon` / `authenticated`**（これがないと REST が `permission denied`）

例（認証なし・全員読み書きの初期案 — 本番前に必ず見直す）:

```sql
create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  created_at timestamptz not null default now()
);

alter table public.recipes enable row level security;

create policy "recipes_select_anon"
  on public.recipes for select
  to anon, authenticated
  using (true);

create policy "recipes_insert_anon"
  on public.recipes for insert
  to anon, authenticated
  with check (true);

grant select, insert on table public.recipes to anon, authenticated;
```

## 適用・検証

```bash
# Cloud VM では docker グループ経由が必要な場合あり
sg docker -c "supabase db reset"
```

- `db reset` は全マイグレーションを最初から適用する
- ホスト済みプロジェクトでは `supabase db push` 等、運用に合わせる

## チェックリスト

- [ ] RLS を有効にした
- [ ] policy と grant の両方がある
- [ ] 破壊的変更がある場合は ADR または PR に移行手順を書いた
- [ ] アプリ側の型・クエリを同じ PR で追従した（またはフォロー Issue を明示）

## やってはいけないこと

- ダッシュボード上だけの手変更を正にしない（必ず SQL ファイル化）
- grant なしで「RLS だけ」で終わらせない
- サービスロールをアプリの通常経路に使わない
