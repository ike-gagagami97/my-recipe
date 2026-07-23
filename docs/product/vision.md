# Product vision

## 一言で

**My Recipe** — 自分だけのレシピを保存・閲覧・追加できるシンプルな Web アプリ。

## 目的

個人または少人数が、日常の料理レシピを素早く記録し、後から探しやすくする。

## 現状（2026-07）

- Next.js 16 + Supabase + Vercel の土台のみ
- ランディング画面のみ表示（CRUD 未実装）
- DB スキーマ未定義（`supabase/migrations/` は空）

## 想定ユーザー

- 自分用にレシピを溜めたい個人（ユーザーごとに自分のレシピのみ見える）
- **認証あり**：ログインしないとレシピの閲覧・操作は不可
- **ユーザー作成は Supabase Dashboard から手動**（セルフサインアップ画面は作らない）
- 将来的な他ユーザーとの共有は非スコープ

## 初期スコープ（MVP 候補）

未実装。①で着手を決めたら状態を更新し、②で `docs/product/features/` に feature doc を作る。

実装順に並べる（上から順に着手）。

実装順に並べる（上から順に着手）。

| 実装順 | 優先度 | 機能 | 状態 | feature doc | Issue |
| --- | --- | --- | --- | --- | --- |
| 1 | P0 | 認証（ログイン・ログアウト） | 未着手 | [`features/auth.md`](./features/auth.md) | [#10](https://github.com/ike-gagagami97/my-recipe/issues/10) |
| 2 | P0 | レシピ一覧（検索・絞り込み含む） | 下書き（要改訂） | [`features/recipe-list.md`](./features/recipe-list.md) | [#4](https://github.com/ike-gagagami97/my-recipe/issues/4) |
| 3 | P0 | レシピ詳細 | 未着手 | | [#5](https://github.com/ike-gagagami97/my-recipe/issues/5) |
| 4 | P0 | レシピ追加 | 未着手 | | [#6](https://github.com/ike-gagagami97/my-recipe/issues/6) |
| 5 | P1 | 編集・削除 | 未着手 | | [#7](https://github.com/ike-gagagami97/my-recipe/issues/7) |

## 非スコープ（当面やらない）

- 画像アップロード
- SNS 連携・ソーシャルフィード
- 他ユーザーとのレシピ共有
- 栄養計算・カロリー管理
- ネイティブアプリ
- 多言語対応（UI は日本語または英語のどちらかに寄せる）

## 成功の定義（MVP）

- ログインしないとレシピを閲覧・操作できない（サインアップ画面はなし、ユーザーはSupabase Dashboardで手動作成）
- ログイン後、自分のレシピだけが一覧に表示される
- 検索・絞り込みでレシピを絞り込める
- ログイン → 一覧 → 詳細 → 追加の一連の流れがブラウザで完結する
- RLS により他ユーザーのレシピにはアクセスできない
