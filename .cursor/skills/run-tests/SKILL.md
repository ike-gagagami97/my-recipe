---
name: run-tests
description: Run unit tests (Vitest) and/or E2E tests (Playwright) for this project. Use when verifying changes against the automated test suite, or when adding new tests.
---

# Running tests

## Quick reference

| コマンド | 内容 |
| --- | --- |
| `npm run test:unit` | Vitest ユニットテスト（`src/**/*.test.ts`）を1回実行 |
| `npm run test:unit:watch` | Vitest ウォッチモード（TDD 用） |
| `npm run test:e2e` | Playwright E2E テスト全件実行（`tests/e2e/`） |
| `npm run test:e2e:ui` | Playwright UI モードで実行（デバッグ用） |

テストレベルの定義: [`docs/development/test-level-policy.md`](../../../docs/development/test-level-policy.md)

---

## ユニットテスト（Vitest）

### 対象

`src/lib/recipes.ts` のすべての純粋関数。`src/lib/recipes.test.ts` に記述。

### 前提

追加 setup 不要。Node.js の標準環境で動く。

### 実行

```bash
npm run test:unit
```

### 新しいユニットテストを書くとき

- テスト対象は `src/lib/` の純粋関数（Supabase や Next.js に依存しない）
- コロケーション: `src/lib/foo.ts` のテストは `src/lib/foo.test.ts`
- `vi.setSystemTime` で日時固定が必要なら `afterEach(() => vi.useRealTimers())`
- Server Components や Server Actions は E2E でカバーする（unit 対象外）

---

## E2E テスト（Playwright）

### 前提（必須）

1. Supabase local stack が起動していること（`dockerd` + `supabase start`）
2. `.env.local` に以下の環境変数があること:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`（start.sh が自動書き込み）
3. `npm run dev` が `http://localhost:3000` で動いていること

### 実行

```bash
npm run test:e2e
```

Playwright は `reuseExistingServer: true` なので、`npm run dev` が起動済みならそれを使用する。

### テスト構造

```
tests/e2e/
  global-setup.ts        # テスト用ユーザーを Supabase admin API で作成
  global-teardown.ts     # テスト用ユーザーを削除（recipes は CASCADE で連鎖削除）
  auth.setup.ts          # ブラウザでログインして .auth/user.json を保存
  helpers.ts             # 認証済みクライアント / psql ベースのクリーンアップ
  auth.spec.ts           # 認証フロー（ログイン・ログアウト・リダイレクト）
  recipe-list.spec.ts    # レシピ一覧（検索・絞り込み・ソート・ページネーション）
  recipe-detail.spec.ts  # レシピ詳細（表示・戻るリンク・RLS）
  recipe-create.spec.ts  # レシピ追加（フォーム・バリデーション・保存後遷移）
  .auth/                 # gitignore済み。user.json と credentials.json
```

### テストデータの扱い

- `beforeAll`: psql でレシピを削除 → JS client でレシピをシード（INSERT grant あり）
- `afterAll`: psql で全件削除
- **DELETE grant** は edit/delete 機能 PR (#7) でマイグレーションに追加予定。それまで psql を使用

### 既知の設計上の注意

- テスト用ユーザーのメールアドレスは `e2e-{timestamp}-{role}@example.com` 形式（同一メールの繰り返し作成を避けるため）
- `signOut()` は `scope: 'local'` で呼ぶ（`src/app/recipes/actions.ts`）。デフォルト (`'global'`) では全セッションが無効化され後続テストが破綻する
- `test.use({ storageState })` と `test.beforeAll` は同じ `test.describe` ブロック内に置く（ファイルスコープに置くと worker が storageState を取得できない）
- `workers: 1`（直列実行）が必要。並列実行は storageState の共有タイミング問題を引き起こす

### 新しい E2E テストを書くとき

1. `tests/e2e/*.spec.ts` に新しいファイルを作成
2. `test.describe("...", () => { test.use({ storageState: "tests/e2e/.auth/user.json" }); ... })` パターンに従う
3. `beforeAll` でデータシード、`afterAll` で `cleanupMainUserRecipes()` を呼ぶ
4. 機能 doc の §5 Gherkin / §6 受け入れ条件をそのままテストシナリオに変換する

---

## Done when（テスト追加時）

- [ ] 新しいユニットテスト / E2E テストが全件パスする
- [ ] `npm run lint` がクリーン
- [ ] テストレベルポリシー (`test-level-policy.md`) に沿っている
