/**
 * E2E tests for Feature: レシピ編集
 * Covers docs/product/features/recipe-edit.md §5 Gherkin + §6 acceptance criteria.
 *
 * Runs with storageState from auth.setup.ts (main test user logged in).
 * Some scenarios override to unauthenticated state.
 */
import { test, expect } from "@playwright/test";
import {
  cleanupMainUserRecipes,
  cleanupOtherUserRecipes,
  mainUserClient,
  otherUserClient,
  loadCredentials,
} from "./helpers";
import {
  LoginPage,
  RecipeDetailPage,
  RecipeEditPage,
} from "./pages";

const TITLE_PREFIX = "[E2E-Edit]";

type SeededRecipe = {
  id: string;
  title: string;
  cooking_time_minutes: number | null;
  ingredients: string | null;
  steps: string | null;
  notes: string | null;
};

async function seedOwnRecipe(
  overrides: Partial<Omit<SeededRecipe, "id">> = {},
): Promise<SeededRecipe> {
  const { mainUser } = loadCredentials();
  const client = await mainUserClient();
  const row = {
    title: `${TITLE_PREFIX} 元のタイトル`,
    cooking_time_minutes: 25 as number | null,
    ingredients: "玉ねぎ 1個\nにんじん 1本",
    steps: "切る\n煮る",
    notes: "元のメモ",
    user_id: mainUser.id,
    ...overrides,
  };
  const { data, error } = await client
    .from("recipes")
    .insert(row)
    .select("id, title, cooking_time_minutes, ingredients, steps, notes")
    .single();
  if (error || !data) throw new Error(`Seed own recipe: ${error?.message}`);
  return data;
}

test.describe("レシピ編集 / Recipe Edit", () => {
  test.use({ storageState: "tests/e2e/.auth/user.json" });

  let otherRecipeId = "";

  test.beforeAll(async () => {
    cleanupMainUserRecipes();
    cleanupOtherUserRecipes();

    const { otherUser } = loadCredentials();
    const otherClient = await otherUserClient();
    const { data, error } = await otherClient
      .from("recipes")
      .insert({
        title: `${TITLE_PREFIX} 他ユーザーのレシピ`,
        cooking_time_minutes: 10,
        ingredients: "隠し材料",
        steps: "隠し手順",
        notes: "他ユーザー",
        user_id: otherUser.id,
      })
      .select("id")
      .single();
    if (error || !data) throw new Error(`Seed other recipe: ${error?.message}`);
    otherRecipeId = data.id;
  });

  test.afterAll(() => {
    cleanupMainUserRecipes();
    cleanupOtherUserRecipes();
  });

  test("詳細から編集画面を開ける", async ({ page }) => {
    cleanupMainUserRecipes();
    const recipe = await seedOwnRecipe();
    const detailPage = new RecipeDetailPage(page);
    const editPage = new RecipeEditPage(page);

    await detailPage.goto(recipe.id);
    await detailPage.openEdit();
    await editPage.expectOnEditPage(recipe.id);
    await editPage.expectFormFieldsVisible();
    await editPage.expectPrefill({
      title: recipe.title,
      cookingTimeMinutes: String(recipe.cooking_time_minutes),
      ingredients: recipe.ingredients ?? "",
      steps: recipe.steps ?? "",
      notes: recipe.notes ?? "",
    });
  });

  test("自分のレシピの編集 URL を直接開ける", async ({ page }) => {
    cleanupMainUserRecipes();
    const recipe = await seedOwnRecipe();
    const editPage = new RecipeEditPage(page);

    await editPage.goto(recipe.id);
    await editPage.expectOnEditPage(recipe.id);
    await editPage.expectPrefill({
      title: recipe.title,
      cookingTimeMinutes: String(recipe.cooking_time_minutes),
      ingredients: recipe.ingredients ?? "",
      steps: recipe.steps ?? "",
      notes: recipe.notes ?? "",
    });
  });

  test("変更を保存すると詳細に反映される", async ({ page }) => {
    cleanupMainUserRecipes();
    const recipe = await seedOwnRecipe();
    const editPage = new RecipeEditPage(page);
    const detailPage = new RecipeDetailPage(page);

    await editPage.goto(recipe.id);
    await editPage.fillAndSave({
      title: `${TITLE_PREFIX} 変更後カレー`,
      cookingTimeMinutes: "40",
      ingredients: "鶏肉 300g\nカレールー 1箱",
      steps: "炒める\n煮込む",
      notes: "変更後のメモ",
    });

    await expect(page).toHaveURL(new RegExp(`/recipes/${recipe.id}$`));
    await detailPage.expectTitle(`${TITLE_PREFIX} 変更後カレー`);
    await expect(page.getByText("40分")).toBeVisible();
    await expect(page.getByText("鶏肉 300g")).toBeVisible();
    await expect(page.getByText("カレールー 1箱")).toBeVisible();
    await expect(page.getByText("炒める")).toBeVisible();
    await expect(page.getByText("煮込む")).toBeVisible();
    await expect(page.getByText("変更後のメモ")).toBeVisible();
    // updated_at is auto-refreshed by DB trigger; JST format should still render
    await expect(page.getByText("更新日時")).toBeVisible();
    await expect(page.locator("dd").nth(1)).not.toHaveText("");
  });

  test("タイトル以外を空にして保存できる", async ({ page }) => {
    cleanupMainUserRecipes();
    const recipe = await seedOwnRecipe();
    const editPage = new RecipeEditPage(page);
    const detailPage = new RecipeDetailPage(page);

    await editPage.goto(recipe.id);
    await editPage.fillAndSave({
      title: `${TITLE_PREFIX} タイトルのみ残す`,
      cookingTimeMinutes: "",
      ingredients: "",
      steps: "",
      notes: "",
    });

    await expect(page).toHaveURL(new RegExp(`/recipes/${recipe.id}$`));
    await detailPage.expectTitle(`${TITLE_PREFIX} タイトルのみ残す`);
    await expect(detailPage.emptyIngredientsMessage).toBeVisible();
    await expect(detailPage.emptyStepsMessage).toBeVisible();
    await expect(detailPage.emptyNotesMessage).toBeVisible();
    await expect(detailPage.unsetCookingTime).toBeVisible();
  });

  test("タイトルが空だと保存できない", async ({ page }) => {
    cleanupMainUserRecipes();
    const recipe = await seedOwnRecipe();
    const editPage = new RecipeEditPage(page);
    const detailPage = new RecipeDetailPage(page);

    await editPage.goto(recipe.id);
    await editPage.fillAndSave({ title: "" });

    await editPage.expectOnEditPage(recipe.id);
    await expect(editPage.titleError).toBeVisible();

    await detailPage.goto(recipe.id);
    await detailPage.expectTitle(recipe.title);
  });

  test("タイトルが空白のみだと保存できない", async ({ page }) => {
    cleanupMainUserRecipes();
    const recipe = await seedOwnRecipe();
    const editPage = new RecipeEditPage(page);

    await editPage.goto(recipe.id);
    await editPage.fillAndSave({ title: "   " });

    await editPage.expectOnEditPage(recipe.id);
    await expect(editPage.titleError).toBeVisible();
  });

  test("所要時間が不正だと保存できない", async ({ page }) => {
    cleanupMainUserRecipes();
    const recipe = await seedOwnRecipe();
    const editPage = new RecipeEditPage(page);
    const detailPage = new RecipeDetailPage(page);

    await editPage.goto(recipe.id);
    await editPage.fillAndSave({
      title: `${TITLE_PREFIX} 不正時間`,
      cookingTimeMinutes: "0",
    });

    await editPage.expectOnEditPage(recipe.id);
    await expect(editPage.cookingTimeError).toBeVisible();
    await expect(editPage.titleInput).toHaveValue(`${TITLE_PREFIX} 不正時間`);

    await detailPage.goto(recipe.id);
    await detailPage.expectTitle(recipe.title);
  });

  test("キャンセルで詳細に戻る", async ({ page }) => {
    cleanupMainUserRecipes();
    const recipe = await seedOwnRecipe();
    const editPage = new RecipeEditPage(page);
    const detailPage = new RecipeDetailPage(page);

    await editPage.goto(recipe.id);
    await editPage.fillForm({ title: `${TITLE_PREFIX} キャンセル用` });
    await editPage.cancel();

    await expect(page).toHaveURL(new RegExp(`/recipes/${recipe.id}$`));
    await detailPage.expectTitle(recipe.title);
    await expect(page.getByText(`${TITLE_PREFIX} キャンセル用`)).toHaveCount(0);
  });

  test("他ユーザーのレシピの編集 URL は見つからない", async ({ page }) => {
    const editPage = new RecipeEditPage(page);
    const detailPage = new RecipeDetailPage(page);

    await editPage.goto(otherRecipeId);
    await detailPage.expectNotFound();
    await expect(editPage.titleInput).toHaveCount(0);
  });

  test("存在しないレシピの編集 URL は見つからない", async ({ page }) => {
    const editPage = new RecipeEditPage(page);
    const detailPage = new RecipeDetailPage(page);

    await editPage.goto("00000000-0000-4000-8000-000000000099");
    await detailPage.expectNotFound();
    await expect(detailPage.backToListFromNotFoundLink).toBeVisible();
  });
});

test.describe("レシピ編集 / 未ログイン", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("未ログインで編集画面を直接開くとログインへリダイレクト", async ({
    page,
  }) => {
    const editPage = new RecipeEditPage(page);
    const loginPage = new LoginPage(page);

    await editPage.goto("00000000-0000-4000-8000-000000000001");
    await expect(page).toHaveURL(/\/login/);
    await loginPage.expectOnLoginPage();
    await expect(editPage.titleInput).toHaveCount(0);
  });
});
