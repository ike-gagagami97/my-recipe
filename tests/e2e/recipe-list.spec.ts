/**
 * E2E tests for Feature: レシピ一覧
 * Covers docs/product/features/recipe-list.md §5 Gherkin + §6 acceptance criteria.
 *
 * Runs with storageState from auth.setup.ts (main test user logged in).
 */
import { test, expect } from "@playwright/test";
import { mainUserClient, cleanupMainUserRecipes, loadCredentials } from "./helpers";
import { RecipeListPage } from "./pages";

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

async function seedListRecipes() {
  const { mainUser } = loadCredentials();
  const client = await mainUserClient();
  for (const recipe of LIST_RECIPES) {
    const { error } = await client
      .from("recipes")
      .insert({ ...recipe, user_id: mainUser.id });
    if (error) throw new Error(`Seed insert failed: ${error.message}`);
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe("レシピ一覧 / Recipe List", () => {
  test.use({ storageState: "tests/e2e/.auth/user.json" });

  test.beforeAll(async () => {
    cleanupMainUserRecipes();
    await seedListRecipes();
  });

  test.afterAll(() => {
    cleanupMainUserRecipes();
  });

  test("レシピが1件以上あるとき一覧に表示される", async ({ page }) => {
    const listPage = new RecipeListPage(page);
    await listPage.goto();
    await listPage.expectColumnHeadersVisible();
    // 1ページ目に10件表示される（12件あるので pagination あり）
    await expect(listPage.rows).toHaveCount(10);
  });

  test("レシピが0件のとき空の案内が出る", async ({ page }) => {
    cleanupMainUserRecipes();
    const listPage = new RecipeListPage(page);
    await listPage.goto();
    await expect(listPage.emptyMessage).toBeVisible();
    await expect(listPage.rows).toHaveCount(0);
    // 再シード（afterAll でまとめて削除するのでここで個別 cleanup は不要）
    await seedListRecipes();
    await page.reload();
  });

  test("タイトルのキーワードで絞り込める", async ({ page }) => {
    const listPage = new RecipeListPage(page);
    await listPage.goto();
    await listPage.searchByKeyword("カルボナーラ");

    await expect(listPage.recipeLink("[E2E-List] パスタカルボナーラ")).toBeVisible();
    await expect(listPage.recipeLink("[E2E-List] チャーハン")).not.toBeVisible();
  });

  test("キーワード検索で0件になる", async ({ page }) => {
    const listPage = new RecipeListPage(page);
    await listPage.goto();
    await listPage.searchByKeyword("存在しないレシピXYZ");

    await expect(listPage.noMatchMessage).toBeVisible();
  });

  test("所要時間プルダウンで絞り込める（即時反映）", async ({ page }) => {
    const listPage = new RecipeListPage(page);
    await listPage.goto();
    await listPage.filterByCookingTime("under10");

    // ボタンを押さずに即時反映 → 10分未満は オムレツ(5分)、みそ汁(9分)
    await expect(listPage.recipeLink("[E2E-List] オムレツ")).toBeVisible();
    await expect(listPage.recipeLink("[E2E-List] みそ汁")).toBeVisible();
    await expect(listPage.recipeLink("[E2E-List] チャーハン")).not.toBeVisible();
    await expect(listPage.recipeLink("[E2E-List] サラダ")).not.toBeVisible();
  });

  test("キーワード検索と所要時間絞り込みを同時に使える", async ({ page }) => {
    const listPage = new RecipeListPage(page);
    await listPage.goto();
    await listPage.searchByKeyword("カルボナーラ");
    await listPage.filterByCookingTime("20to30");

    await expect(listPage.recipeLink("[E2E-List] パスタカルボナーラ")).toBeVisible();
  });

  test("所要時間の列ヘッダーをクリックして昇順/降順ソートできる", async ({ page }) => {
    const listPage = new RecipeListPage(page);
    await listPage.goto();
    // 1回クリック → 短い順 (asc)
    await listPage.sortByCookingTime();
    await expect(page).toHaveURL(/sort=cooking_time_minutes/);

    // 1行目が一番短い時間（null 除外なので 5分のオムレツ）
    await expect(listPage.rows.first()).toContainText("[E2E-List] オムレツ");
    await expect(listPage.recipeLink("[E2E-List] サラダ")).not.toBeVisible();

    // ページ2に移動してサラダ（null）が末尾にあることを確認
    await listPage.goToPage("2");
    await expect(page).toHaveURL(/page=2/);
    const count = await listPage.rows.count();
    await expect(listPage.rows.nth(count - 1)).toContainText("[E2E-List] サラダ");

    // ページ1に戻って2回クリック → 長い順 (desc)
    await listPage.goto();
    await listPage.sortByCookingTime();
    await expect(page).toHaveURL(/sort_dir=asc/);
    await listPage.sortByCookingTime();
    await expect(page).toHaveURL(/sort_dir=desc/);
    await expect(listPage.rows.first()).toContainText("[E2E-List] 肉じゃが");
  });

  test("11件以上あるときページネーションが表示される", async ({ page }) => {
    const listPage = new RecipeListPage(page);
    await listPage.goto();
    await expect(listPage.pagination).toBeVisible();
    await expect(listPage.rows).toHaveCount(10);
  });

  test("ページ番号をクリックしてページを移動できる", async ({ page }) => {
    const listPage = new RecipeListPage(page);
    await listPage.goto();
    await listPage.goToPage("2");

    await expect(page).toHaveURL(/page=2/);
    await expect(listPage.rows).toHaveCount(2);
  });

  test("検索条件を変えると1ページ目に戻る", async ({ page }) => {
    const listPage = new RecipeListPage(page);
    await listPage.goto("?page=2");
    await expect(page).toHaveURL(/page=2/);

    await listPage.searchByKeyword("パスタ");

    await expect(page).not.toHaveURL(/page=2/);
  });

  test("更新日時の列ヘッダーをクリックしてソートできる", async ({ page }) => {
    const listPage = new RecipeListPage(page);
    await listPage.goto();
    // デフォルトは updated_at desc（新しい順）
    // ヘッダークリック → 古い順 (asc)
    await listPage.sortByUpdatedAt();
    await expect(page).toHaveURL(/sort=updated_at.*sort_dir=asc|sort_dir=asc.*sort=updated_at/);

    // もう1回 → 新しい順 (desc) に戻る
    await listPage.sortByUpdatedAt();
    await expect(page).toHaveURL(/sort_dir=desc/);
  });
});
