# Product vision

## 一言で

**My Recipe** — 自分だけのレシピを保存・閲覧・追加できるシンプルな Web アプリ。

## 目的

個人または少人数が、日常の料理レシピを素早く記録し、後から探しやすくする。

## 現状（2026-07）

- Next.js 16 + Supabase + Vercel の土台
- 認証（ログイン・ログアウト）実装済み
- レシピ一覧（検索・絞り込み・ソート・ページネーション）実装済み
- レシピ詳細（`/recipes/[id]`）実装済み
- `recipes` テーブル作成済み（RLS + `authenticated` への GRANT）。追加・編集で必要な列は各 feature で追加する
- レシピの追加（`/recipes/new`）・編集（`/recipes/[id]/edit`）・削除（詳細画面）実装済み

## 想定ユーザー

- 自分用にレシピを溜めたい個人（ユーザーごとに自分のレシピのみ見える）
- **認証あり**：ログインしないとレシピの閲覧・操作は不可
- **ユーザー作成は Supabase Dashboard から手動**（セルフサインアップ画面は作らない）
- 将来的な他ユーザーとの共有は非スコープ

## 初期スコープ（MVP 候補）

**MVP スコープは 2026-08-12 時点で完了。** 次の機能は ① で新たに優先度を決める。

実装順（着手順）。

| 実装順 | 優先度 | 機能 | 状態 | feature doc | Issue |
| --- | --- | --- | --- | --- | --- |
| 1 | P0 | 認証（ログイン・ログアウト） | ✅ 完了 | [`features/auth.md`](./features/auth.md) | [#10](https://github.com/ike-gagagami97/my-recipe/issues/10) |
| 2 | P0 | レシピ一覧（検索・絞り込み含む） | ✅ 完了 | [`features/recipe-list.md`](./features/recipe-list.md) | [#4](https://github.com/ike-gagagami97/my-recipe/issues/4) |
| 3 | P0 | レシピ詳細 | ✅ 完了 | [`features/recipe-detail.md`](./features/recipe-detail.md) | [#5](https://github.com/ike-gagagami97/my-recipe/issues/5) |
| 4 | P0 | レシピ追加 | ✅ 完了 | [`features/recipe-create.md`](./features/recipe-create.md) | [#6](https://github.com/ike-gagagami97/my-recipe/issues/6) |
| 5 | P1 | レシピ編集 | ✅ 完了 | [`features/recipe-edit.md`](./features/recipe-edit.md) | [#25](https://github.com/ike-gagagami97/my-recipe/issues/25) |
| 6 | P1 | レシピ削除 | ✅ 完了 | [`features/recipe-delete.md`](./features/recipe-delete.md) | [#26](https://github.com/ike-gagagami97/my-recipe/issues/26) |

## ポスト MVP 候補（Issue 登録済み・実装順は未決定）

①で優先度と着手順を決める。詳細仕様は各 Issue → ② feature doc。

| 優先度 | 種別 | 機能 | 状態 | Issue |
| --- | --- | --- | --- | --- |
| P2 | プロダクト | レシピお気に入り（ブックマーク） | 候補 | [#37](https://github.com/ike-gagagami97/my-recipe/issues/37) |
| P2 | プロダクト | レシピ検索対象の拡張（材料・メモなど） | 候補 | [#38](https://github.com/ike-gagagami97/my-recipe/issues/38) |
| P2 | プロダクト | レシピのタグ／カテゴリ | 候補 | [#39](https://github.com/ike-gagagami97/my-recipe/issues/39) |
| P2 | 開発基盤 | CI 整備（lint / unit / e2e） | 候補 | [#40](https://github.com/ike-gagagami97/my-recipe/issues/40) |

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
- ログイン → 一覧 → 詳細 → 追加 → 編集 → 削除の一連の流れがブラウザで完結する
- RLS により他ユーザーのレシピにはアクセスできない
