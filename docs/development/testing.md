# Testing policy

テストの実装方針・層の棲み分け・追加ルール。

テストレベル（L0〜L4）の定義と PR ごとの必須セット: [`test-level-policy.md`](./test-level-policy.md)  
テストの実行コマンドと手順: [`.cursor/skills/run-tests/SKILL.md`](../../.cursor/skills/run-tests/SKILL.md)

---

## 2 層構成

| 層 | ツール | 実行コマンド | 対象 |
| --- | --- | --- | --- |
| **Unit** | Vitest | `npm run test:unit` | `src/lib/` の純粋関数 |
| **E2E** | Playwright | `npm run test:e2e` | ブラウザ操作でフロー全体を検証 |

### なぜこの 2 層か

- **Server Components / Server Actions はユニットで単体テストしにくい**。Supabase クライアント・cookies に依存しており、モックが複雑になる割にカバレッジが薄い。フロー全体を E2E で検証する方が信頼性が高い。
- **`src/lib/` の純粋関数は E2E では検証しにくい境界値**（例: JST 変換、URL パラメータのパース、null の扱い）。ユニットテストで網羅する。
- Integration test（React コンポーネント単体）は現状対象外。ビジネスロジックは lib に、UI は E2E に寄せる設計なので、追加コストに見合わない。

---

## Unit tests（Vitest）

### 対象ファイル

`src/lib/recipes.ts` のすべての公開関数。コロケーション: `src/lib/recipes.test.ts`。

### 対象関数の条件（どちらも満たす）

1. **純粋関数**（外部 I/O なし）
2. **境界値・変換ロジックがある**（null の扱い、タイムゾーン変換、URL 組み立て等）

### 対象外

- Server Components（Supabase + cookies に依存）
- Server Actions（同上 + redirect）
- Client Components（UI 操作は E2E でカバー）
- Supabase クライアント/ssr のラッパー

### 新しいユニットテストを追加するとき

```
変更: src/lib/recipes.ts に新しい純粋関数を追加
→ src/lib/recipes.test.ts に対応する describe ブロックを追加
→ npm run test:unit で全件パスを確認
```

**日時テストの注意**: `formatDate` は `new Date()` で現在年を参照するため、`vi.setSystemTime()` で日時を固定し、`afterEach(() => vi.useRealTimers())` で必ずリセットする。

---

## E2E tests（Playwright）

### カバー範囲

| スペック | 対応 feature doc | Gherkin |
| --- | --- | --- |
| `tests/e2e/auth.spec.ts` | `docs/product/features/auth.md` §5 | 6 scenarios |
| `tests/e2e/recipe-list.spec.ts` | `docs/product/features/recipe-list.md` §5 | 11 scenarios |
| `tests/e2e/recipe-detail.spec.ts` | `docs/product/features/recipe-detail.md` §5 | 11 scenarios |
| `tests/e2e/recipe-create.spec.ts` | `docs/product/features/recipe-create.md` §5 | 10 scenarios |

### 何を検証するか

- **認証フロー**（ログイン・ログアウト・未ログインリダイレクト）
- **データの RLS 分離**（他ユーザーのレシピが見えないこと）
- **UI ロジック**（検索・絞り込み・ソート・ページネーション・戻るリンクの URL 復元）
- **エラー状態**（存在しない ID・不正な UUID・空フィールドのレシピ）

### テストデータの管理

```
global-setup.ts    テストユーザーを Supabase admin API で作成
                   └─ メールは e2e-{timestamp}-{role}@example.com（レート制限回避）
auth.setup.ts      ブラウザでログイン → .auth/user.json に storageState 保存
beforeAll          psql で古いレシピを削除 → JS client でシード INSERT
afterAll           psql でレシピを削除
global-teardown.ts テストユーザーを削除（recipes は ON DELETE CASCADE で連鎖削除）
```

**DELETE は psql を使う理由**: `authenticated` ロールへの DELETE grant は削除機能（#26）で追加予定。それまでは `docker exec ... psql` で直接実行する。

### Page Object Model

セレクタと画面操作は `tests/e2e/pages/` の Page Object に集約する（[Playwright POM](https://playwright.dev/docs/pom)）。

| Page Object | 対象画面 |
| --- | --- |
| `LoginPage` | `/login` |
| `RecipeListPage` | `/recipes` |
| `RecipeDetailPage` | `/recipes/[id]` |
| `RecipeCreatePage` | `/recipes/new` |

スペックはシナリオ記述に徹し、`page.getByRole(...)` などのセレクタ直書きは避ける。

### 新しい機能の E2E を追加するとき

1. 新しい画面なら `tests/e2e/pages/{name}.page.ts` を追加し `pages/index.ts` から export
2. `tests/e2e/{feature-name}.spec.ts` を新規作成
3. 必ずこのテンプレートに従う（スコープ問題を避けるため）:

```ts
import { RecipeListPage } from "./pages";

test.describe("機能名 / Feature Name", () => {
  test.use({ storageState: "tests/e2e/.auth/user.json" }); // 認証が必要な場合

  test.beforeAll(async () => {
    cleanupMainUserRecipes(); // psql クリーンアップ
    // シードデータ INSERT
  });

  test.afterAll(() => {
    cleanupMainUserRecipes();
  });

  test("...", async ({ page }) => {
    const listPage = new RecipeListPage(page);
    await listPage.goto();
    // ...
  });
});
```

> **重要**: `test.use()` と `test.beforeAll` はファイルスコープ（describe 外）に置かない。ファイルスコープに置くと worker が storageState を取得できないケースがある。

4. テストシナリオは feature doc §5 の Gherkin を直接対応させる（1 Scenario ≈ 1 test）
5. 認証不要のシナリオは `test.use({ storageState: { cookies: [], origins: [] } })` を別の describe に分ける

---

## 設計判断の記録

### `workers: 1`（直列実行）

並列実行（workers: 2+）では、`auth.setup.ts` が `user.json` を書き込むタイミングと、recipe スペックが `user.json` を読むタイミングが競合する。`dependencies: ['auth-setup']` で順序は保証されるが、ファイルスコープの `test.use()` が context 作成時（worker 起動時）に解決されるため race condition が起きた。直列実行（workers: 1）で回避している。

### タイムスタンプ付きテストメール

同じメールアドレス（例: `e2e-test@example.com`）を削除・再作成を繰り返すと、Supabase Auth がそのメールをレート制限対象に登録し、その後の `signInWithPassword` が `invalid_credentials` を返す（数分〜数十分続く）。実行のたびに異なるメールを使うことで回避。

### `signOut({ scope: 'local' })`

`src/app/recipes/actions.ts` の logout action。デフォルト（`scope` 未指定）は内部的に global / others の動作をし、同一ユーザーの**全セッション**を無効化する。E2E では auth.spec.ts のログアウトテストが user.json のセッションを破壊し、後続の recipe テストが /login にリダイレクトされる問題が発生した。`'local'` はアプリとしても正しい動作（他デバイスのセッションを維持する）。

### storageState の保存場所

`tests/e2e/.auth/user.json` は `.gitignore` 対象。CI（将来追加時）では `auth.setup.ts` がテスト前に必ず実行されるため問題ない。

---

## 変更タイプ別の対応表

| 変更の種類 | unit | E2E | 備考 |
| --- | --- | --- | --- |
| `src/lib/recipes.ts` の関数変更 | ✅ 必須 | — | `npm run test:unit` |
| 認証フローの変更 | — | ✅ `auth.spec.ts` | L1 必須 |
| レシピ一覧ロジックの変更 | — | ✅ `recipe-list.spec.ts` | L1 必須 |
| レシピ詳細ロジックの変更 | — | ✅ `recipe-detail.spec.ts` | L1 必須 |
| 新規画面の追加 | — | ✅ 新規スペック作成 | L0+L2+L4 必須 |
| UI の文言・スタイルのみ変更 | — | ✅ 既存スペックで回帰確認 | L0+L1（既存スペックで十分） |
| docs / skills のみ変更 | — | — | L0 のみ |
