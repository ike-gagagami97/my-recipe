---
name: recipe-feature
description: My Recipe のレシピ機能（一覧・詳細・追加・編集）を実装するときに使う。App Router、Supabase CRUD、docs/product のスコープ確認を含む。
---

# Recipe feature

レシピ関連の機能を実装するときの手順です。

## 開始前

1. [`docs/product/vision.md`](../../docs/product/vision.md) でスコープ内か確認する
2. テーブルが無ければ先に [`supabase-migration`](../supabase-migration/SKILL.md) を適用する
3. 既存の `src/lib/supabase/{client,server}.ts` を再利用する（新規クライアントを増やさない）

## 実装方針

- **一覧・詳細**: 可能な限り Server Components + server Supabase client
- **追加・更新・削除**: Server Actions を優先（必要なら Route Handler）
- `"use client"` はフォームのインタラクションなど最小限に留める
- 型は DB の列に合わせる。仮の型を広げすぎない

## 置き場所

| もの | 場所 |
| --- | --- |
| ページ | `src/app/...` |
| 共有 UI | `src/components/`（初めて使うとき作成） |
| データアクセスヘルパ | `src/lib/`（クライアント生成以外のロジック） |

## チェックリスト

- [ ] vision の非スコープを実装していない
- [ ] Supabase 未設定時の扱いが明確（エラー表示 or ガード）
- [ ] RLS 前提で anon から意図した操作だけできる
- [ ] `npm run lint` 通過
- [ ] 必要なら `docs/product/vision.md` の状態列を更新

## やってはいけないこと

- サービスロールキーをクライアントや Server Component の公開経路に置く
- 認証前にユーザー別データを前提にした複雑なモデルを先に作る（P2）
- 無関係なリファクタを同じ PR に混ぜる
