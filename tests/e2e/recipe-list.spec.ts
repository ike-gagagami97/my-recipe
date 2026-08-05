/**
 * E2E tests for Feature: レシピ一覧
 * Covers docs/product/features/recipe-list.md §5 Gherkin + §6 acceptance criteria.
 *
 * Runs with storageState from auth.setup.ts (main test user logged in).
 */
import { test, expect } from "@playwright/test";
import { mainUserClient, cleanupMainUserRecipes, loadCredentials } from "./helpers";


// ---------------------------------------------------------------------------
// Test data: 12 recipes covering pagination, various cooking times and titles
// ---------------------------------------------------------------------------
const LIST_RECIPES = [
  { title: "[E2E-List] パスタカルボナーラ", cooking_time_minutes: 20 },
  { title: "[E2E-List] チャーハン", cooking_time_minutes: 10 },
  { title: "[E2E-List] オムレツ", cooking_time_minutes: 5 },
  { title: "[E2E-List] カレーライス", cooking_time_minutes: 30 },
  { title: "[E2E-List] みそ汁", cooking_time_minutes: 9 },
  { title: "[E2E-List] ハンバーグ", cooking_time_minutes: 25 },
  { title: "[E2E-List] 焼き魚", cooking_time_minutes: 15 },
  { title: "[E2E-List] サラダ", cooking_time_minutes: null },
  { title: "[E2E-List] 肉じゃが", cooking_time_minutes: 60 },
  { title: "[E2E-List] 唐揚げ", cooking_time_minutes: 19 },
  { title: "[E2E-List] チキン南蛮", cooking_time_minutes: 29 },
  { title: "[E2E-List] 親子丼", cooking_time_minutes: 10 },
] as const;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe("レシピ一覧 / Recipe List", () => {
  test.use({ storageState: "tests/e2e/.auth/user.json" });

  test.beforeAll(async () => {
    cleanupMainUserRecipes();
    const { mainUser } = loadCredentials();
    const client = await mainUserClient();
    for (const recipe of LIST_RECIPES) {
      const { error } = await client
        .from("recipes")
        .insert({ ...recipe, user_id: mainUser.id });
      if (error) throw new Error(`Seed insert failed: ${error.message}`);
    }
  });

  test.afterAll(() => {
    cleanupMainUserRecipes();
  });
  test("レシピが1件以上あるとき一覧に表示される", async ({ page }) => {
    await page.goto("/recipes");
    // タイトル・所要時間・更新日時の列ヘッダーが見える
    await expect(page.getByRole("columnheader", { name: "タイトル" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /所要時間/ })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /更新日時/ })).toBeVisible();
    // 1ページ目に10件表示される（12件あるので pagination あり）
    const rows = page.locator("tbody tr");
    await expect(rows).toHaveCount(10);
  });

  test("レシピが0件のとき空の案内が出る", async ({ page }) => {
    cleanupMainUserRecipes();
    await page.goto("/recipes");
    await expect(page.getByText("まだレシピがありません")).toBeVisible();
    await expect(page.locator("tbody tr")).toHaveCount(0);
    // 再シード（afterAll でまとめて削除するのでここで個別 cleanup は不要）
    const { mainUser } = loadCredentials();
    const client = await mainUserClient();
    for (const recipe of LIST_RECIPES) {
      await client.from("recipes").insert({ ...recipe, user_id: mainUser.id });
    }
    await page.reload();
  });

  test("タイトルのキーワードで絞り込める", async ({ page }) => {
    await page.goto("/recipes");
    await page.getByLabel("キーワード検索").fill("カルボナーラ");
    await page.getByRole("button", { name: "検索" }).click();

    // タイトルセルはリンクになっているので getByRole('link') で特定
    await expect(page.getByRole("link", { name: "[E2E-List] パスタカルボナーラ" })).toBeVisible();
    // マッチしないレシピは表示されない
    await expect(page.getByRole("link", { name: "[E2E-List] チャーハン" })).not.toBeVisible();
  });

  test("キーワード検索で0件になる", async ({ page }) => {
    await page.goto("/recipes");
    await page.getByLabel("キーワード検索").fill("存在しないレシピXYZ");
    await page.getByRole("button", { name: "検索" }).click();

    await expect(page.getByText("条件に一致するレシピがありません")).toBeVisible();
  });

  test("所要時間プルダウンで絞り込める（即時反映）", async ({ page }) => {
    await page.goto("/recipes");
    await page.getByRole("combobox", { name: "所要時間で絞り込む" }).selectOption("under10");

    // ボタンを押さずに即時反映 → 10分未満は オムレツ(5分)、みそ汁(9分)
    await expect(page.getByRole("link", { name: "[E2E-List] オムレツ" })).toBeVisible();
    await expect(page.getByRole("link", { name: "[E2E-List] みそ汁" })).toBeVisible();
    // 10分以上のレシピは表示されない
    await expect(page.getByRole("link", { name: "[E2E-List] チャーハン" })).not.toBeVisible();
    // null の サラダ も表示されない
    await expect(page.getByRole("link", { name: "[E2E-List] サラダ" })).not.toBeVisible();
  });

  test("キーワード検索と所要時間絞り込みを同時に使える", async ({ page }) => {
    await page.goto("/recipes");
    await page.getByLabel("キーワード検索").fill("カルボナーラ");
    await page.getByRole("button", { name: "検索" }).click();
    await page.getByRole("combobox", { name: "所要時間で絞り込む" }).selectOption("20to30");

    // パスタカルボナーラは20分 = 20to30 範囲内、かつキーワード一致
    await expect(page.getByRole("link", { name: "[E2E-List] パスタカルボナーラ" })).toBeVisible();
  });

  test("所要時間の列ヘッダーをクリックして昇順/降順ソートできる", async ({ page }) => {
    await page.goto("/recipes");
    // 1回クリック → 短い順 (asc)
    await page.getByRole("columnheader", { name: /所要時間/ }).getByRole("link").click();
    await expect(page).toHaveURL(/sort=cooking_time_minutes/);

    // 1行目が一番短い時間（null 除外なので 5分のオムレツ）
    await expect(page.locator("tbody tr").first()).toContainText("[E2E-List] オムレツ");

    // null のサラダはページ1に表示されない（末尾 = ページ2）
    await expect(page.getByRole("link", { name: "[E2E-List] サラダ" })).not.toBeVisible();

    // ページ2に移動してサラダ（null）が末尾にあることを確認
    await page
      .getByRole("navigation", { name: "ページネーション" })
      .getByRole("link", { name: "2" })
      .click();
    await expect(page).toHaveURL(/page=2/);
    const rows = page.locator("tbody tr");
    const count = await rows.count();
    await expect(rows.nth(count - 1)).toContainText("[E2E-List] サラダ");

    // ページ1に戻って2回クリック → 長い順 (desc)
    await page.goto("/recipes");
    // 1回目クリック → asc
    await page.getByRole("columnheader", { name: /所要時間/ }).getByRole("link").click();
    await expect(page).toHaveURL(/sort_dir=asc/); // 遷移完了を確認してから2回目をクリック
    // 2回目クリック → desc
    await page.getByRole("columnheader", { name: /所要時間/ }).getByRole("link").click();
    await expect(page).toHaveURL(/sort_dir=desc/);
    // 1行目が一番長い時間（60分の肉じゃが）
    await expect(page.locator("tbody tr").first()).toContainText("[E2E-List] 肉じゃが");
  });

  test("11件以上あるときページネーションが表示される", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByRole("navigation", { name: "ページネーション" })).toBeVisible();
    // 1ページ目は10件
    await expect(page.locator("tbody tr")).toHaveCount(10);
  });

  test("ページ番号をクリックしてページを移動できる", async ({ page }) => {
    await page.goto("/recipes");
    // ページ「2」をクリック
    await page
      .getByRole("navigation", { name: "ページネーション" })
      .getByRole("link", { name: "2" })
      .click();

    await expect(page).toHaveURL(/page=2/);
    // 2ページ目には残りの2件が表示される
    await expect(page.locator("tbody tr")).toHaveCount(2);
  });

  test("検索条件を変えると1ページ目に戻る", async ({ page }) => {
    await page.goto("/recipes?page=2");
    await expect(page).toHaveURL(/page=2/);

    await page.getByLabel("キーワード検索").fill("パスタ");
    await page.getByRole("button", { name: "検索" }).click();

    // page パラメータがリセットされる
    await expect(page).not.toHaveURL(/page=2/);
  });

  test("更新日時の列ヘッダーをクリックしてソートできる", async ({ page }) => {
    await page.goto("/recipes");
    // デフォルトは updated_at desc（新しい順）
    // ヘッダークリック → 古い順 (asc)
    await page.getByRole("columnheader", { name: /更新日時/ }).getByRole("link").click();
    await expect(page).toHaveURL(/sort=updated_at.*sort_dir=asc|sort_dir=asc.*sort=updated_at/);

    // もう1回 → 新しい順 (desc) に戻る
    await page.getByRole("columnheader", { name: /更新日時/ }).getByRole("link").click();
    await expect(page).toHaveURL(/sort_dir=desc/);
  });
});
