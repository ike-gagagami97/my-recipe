/**
 * E2E tests for Feature: レシピ詳細
 * Covers docs/product/features/recipe-detail.md §5 Gherkin + §6 acceptance criteria.
 *
 * Runs with storageState from auth.setup.ts (main test user logged in).
 * Some scenarios override to unauthenticated state.
 */
import { test, expect } from "@playwright/test";
import {
  mainUserClient,
  otherUserClient,
  cleanupMainUserRecipes,
  cleanupOtherUserRecipes,
  loadCredentials,
} from "./helpers";
import { LoginPage, RecipeDetailPage, RecipeListPage } from "./pages";

// ---------------------------------------------------------------------------
// Fixture data
// ---------------------------------------------------------------------------
const FULL_RECIPE = {
  title: "[E2E-Detail] フルレシピ",
  cooking_time_minutes: 30,
  ingredients: "鶏もも肉 300g\n醤油 大さじ2\nみりん 大さじ2",
  steps: "鶏肉を一口大に切る\nタレに漬ける\nフライパンで焼く",
  notes: "漬け込み時間を30分以上取ると美味しい",
};

const EMPTY_RECIPE = {
  title: "[E2E-Detail] 空レシピ",
  cooking_time_minutes: 15,
  ingredients: null as null | string,
  steps: null as null | string,
  notes: null as null | string,
};

const NO_TIME_RECIPE = {
  title: "[E2E-Detail] 時間なしレシピ",
  cooking_time_minutes: null as null | number,
};

let fullRecipeId: string;
let emptyRecipeId: string;
let noTimeRecipeId: string;
let otherRecipeId: string;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe("レシピ詳細 / Recipe Detail", () => {
  test.use({ storageState: "tests/e2e/.auth/user.json" });

  test.beforeAll(async () => {
    cleanupMainUserRecipes();
    cleanupOtherUserRecipes();

    const { mainUser, otherUser } = loadCredentials();
    const client = await mainUserClient();

    const { data: full, error: fullErr } = await client
      .from("recipes")
      .insert({ ...FULL_RECIPE, user_id: mainUser.id })
      .select("id")
      .single();
    if (fullErr) throw new Error(`Insert full recipe: ${fullErr.message}`);
    fullRecipeId = full!.id;

    const { data: empty, error: emptyErr } = await client
      .from("recipes")
      .insert({ ...EMPTY_RECIPE, user_id: mainUser.id })
      .select("id")
      .single();
    if (emptyErr) throw new Error(`Insert empty recipe: ${emptyErr.message}`);
    emptyRecipeId = empty!.id;

    const { data: noTime, error: noTimeErr } = await client
      .from("recipes")
      .insert({ ...NO_TIME_RECIPE, user_id: mainUser.id })
      .select("id")
      .single();
    if (noTimeErr) throw new Error(`Insert no-time recipe: ${noTimeErr.message}`);
    noTimeRecipeId = noTime!.id;

    const otherClient = await otherUserClient();
    const { data: other, error: otherErr } = await otherClient
      .from("recipes")
      .insert({
        title: "[E2E-Other] 他ユーザーのレシピ",
        cooking_time_minutes: 10,
        user_id: otherUser.id,
      })
      .select("id")
      .single();
    if (otherErr) throw new Error(`Insert other user recipe: ${otherErr.message}`);
    otherRecipeId = other!.id;
  });

  test.afterAll(() => {
    cleanupMainUserRecipes();
    cleanupOtherUserRecipes();
  });

  test("一覧からレシピタイトルをクリックすると詳細画面が開く", async ({ page }) => {
    const listPage = new RecipeListPage(page);
    const detailPage = new RecipeDetailPage(page);

    await listPage.goto();
    await listPage.openRecipe("[E2E-Detail] フルレシピ");

    await expect(page).toHaveURL(new RegExp(`/recipes/${fullRecipeId}`));
    await detailPage.expectTitle("[E2E-Detail] フルレシピ");
  });

  test("全項目が入力されたレシピの詳細が正しく表示される", async ({ page }) => {
    const detailPage = new RecipeDetailPage(page);
    await detailPage.goto(fullRecipeId);

    await detailPage.expectTitle("[E2E-Detail] フルレシピ");
    // 所要時間 (exact: true でノーツ内の「30分以上」と区別)
    await expect(page.getByText("30分", { exact: true })).toBeVisible();
    // 更新日時 (MM/DD HH:mm か YYYY/MM/DD HH:mm の形式)
    await expect(page.getByText(/\d{2}\/\d{2}.*\d{2}:\d{2}/)).toBeVisible();

    const ingredients = detailPage.ingredientsList();
    await expect(ingredients.getByRole("listitem").first()).toContainText("鶏もも肉 300g");
    await expect(ingredients.getByRole("listitem").nth(1)).toContainText("醤油 大さじ2");
    await expect(ingredients.getByRole("listitem").nth(2)).toContainText("みりん 大さじ2");

    const steps = detailPage.stepsList();
    await expect(steps.getByRole("listitem").first()).toContainText("鶏肉を一口大に切る");
    await expect(steps.getByRole("listitem").nth(2)).toContainText("フライパンで焼く");

    await expect(page.getByText("漬け込み時間を30分以上取ると美味しい")).toBeVisible();
  });

  test("材料・手順・メモが未入力のレシピで空の案内が出る", async ({ page }) => {
    const detailPage = new RecipeDetailPage(page);
    await detailPage.goto(emptyRecipeId);

    await detailPage.expectTitle("[E2E-Detail] 空レシピ");
    await expect(detailPage.emptyIngredientsMessage).toBeVisible();
    await expect(detailPage.emptyStepsMessage).toBeVisible();
    await expect(detailPage.emptyNotesMessage).toBeVisible();
    await expect(detailPage.ingredientsHeading).toBeVisible();
    await expect(detailPage.stepsHeading).toBeVisible();
    await expect(detailPage.notesHeading).toBeVisible();
  });

  test("所要時間が未設定のレシピで「未設定」と表示される", async ({ page }) => {
    const detailPage = new RecipeDetailPage(page);
    await detailPage.goto(noTimeRecipeId);

    await expect(detailPage.unsetCookingTime).toBeVisible();
  });

  test("「一覧に戻る」リンクで検索・絞り込み・ソートが復元される", async ({ page }) => {
    const detailPage = new RecipeDetailPage(page);
    await detailPage.goto(
      fullRecipeId,
      "?keyword=%E3%83%95%E3%83%AB&cooking_time=under10&sort=cooking_time_minutes&sort_dir=asc",
    );

    await detailPage.backToList();
    await expect(page).toHaveURL(/\/recipes\?/);

    const url = new URL(page.url());
    expect(url.pathname).toBe("/recipes");
    expect(url.searchParams.get("keyword")).toBe("フル");
    expect(url.searchParams.get("cooking_time")).toBe("under10");
    expect(url.searchParams.get("sort")).toBe("cooking_time_minutes");
    expect(url.searchParams.get("sort_dir")).toBe("asc");
  });

  test("「一覧に戻る」リンクはデフォルトで /recipes に戻る", async ({ page }) => {
    const detailPage = new RecipeDetailPage(page);
    await detailPage.goto(fullRecipeId);
    await detailPage.backToList();
    await expect(page).toHaveURL("/recipes");
  });

  test("他ユーザーのレシピIDを直接開くと「見つかりません」になる（RLS）", async ({
    page,
  }) => {
    const detailPage = new RecipeDetailPage(page);
    await detailPage.goto(otherRecipeId);

    await detailPage.expectNotFound();
    await expect(page.getByText("[E2E-Other] 他ユーザーのレシピ")).not.toBeVisible();
    await expect(detailPage.backToListFromNotFoundLink).toBeVisible();
  });

  test("存在しないIDを開くと「見つかりません」になる", async ({ page }) => {
    const detailPage = new RecipeDetailPage(page);
    await detailPage.goto("00000000-0000-0000-0000-000000000000");

    await detailPage.expectNotFound();
    await expect(detailPage.backToListFromNotFoundLink).toBeVisible();
  });

  test("不正な形式のIDを開くと「見つかりません」になる", async ({ page }) => {
    const detailPage = new RecipeDetailPage(page);
    await detailPage.goto("not-a-valid-uuid");

    await detailPage.expectNotFound();
  });
});

test.describe("レシピ詳細 / 未ログイン", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("未ログインで詳細URLを直接開くとログイン画面にリダイレクトされる", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    // fullRecipeId is set in beforeAll of the sibling describe block above.
    await page.goto(`/recipes/${fullRecipeId}`);
    await loginPage.expectOnLoginPage();
  });
});
