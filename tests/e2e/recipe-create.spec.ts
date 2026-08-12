/**
 * E2E tests for Feature: レシピ追加
 * Covers docs/product/features/recipe-create.md §5 Gherkin + §6 acceptance criteria.
 *
 * Runs with storageState from auth.setup.ts (main test user logged in).
 * Some scenarios override to unauthenticated state.
 */
import { test, expect } from "@playwright/test";
import {
  cleanupMainUserRecipes,
  cleanupOtherUserRecipes,
  otherUserClient,
  loadCredentials,
} from "./helpers";
import { LoginPage, RecipeCreatePage, RecipeDetailPage, RecipeListPage } from "./pages";

const TITLE_PREFIX = "[E2E-Create]";

test.describe("レシピ追加 / Recipe Create", () => {
  test.use({ storageState: "tests/e2e/.auth/user.json" });

  test.beforeAll(async () => {
    cleanupMainUserRecipes();
    cleanupOtherUserRecipes();

    const { otherUser } = loadCredentials();
    const otherClient = await otherUserClient();
    const { error } = await otherClient.from("recipes").insert({
      title: `${TITLE_PREFIX} 他ユーザーのレシピ`,
      cooking_time_minutes: 10,
      user_id: otherUser.id,
    });
    if (error) throw new Error(`Seed other recipe: ${error.message}`);
  });

  test.afterAll(() => {
    cleanupMainUserRecipes();
    cleanupOtherUserRecipes();
  });

  test("一覧から追加画面を開ける", async ({ page }) => {
    cleanupMainUserRecipes();
    const listPage = new RecipeListPage(page);
    const createPage = new RecipeCreatePage(page);

    await listPage.goto();
    await listPage.openCreateForm();
    await createPage.expectOnCreatePage();
    await createPage.expectFormFieldsVisible();
  });

  test("0件の一覧からも追加画面へ行ける", async ({ page }) => {
    cleanupMainUserRecipes();
    const listPage = new RecipeListPage(page);
    const createPage = new RecipeCreatePage(page);

    await listPage.goto();
    await expect(listPage.emptyMessage).toBeVisible();
    await expect(listPage.addRecipeLink.first()).toBeVisible();
    await listPage.openCreateForm();
    await createPage.expectOnCreatePage();
  });

  test("必須項目を入れて保存できる", async ({ page }) => {
    cleanupMainUserRecipes();
    const createPage = new RecipeCreatePage(page);
    const detailPage = new RecipeDetailPage(page);

    await createPage.goto();
    await createPage.fillAndSave({
      title: `${TITLE_PREFIX} テストカレー`,
      cookingTimeMinutes: "30",
      ingredients: "玉ねぎ 1個\nカレールー 1箱",
      steps: "野菜を切る\n煮込む",
      notes: "翌日が美味しい",
    });

    await expect(page).toHaveURL(/\/recipes\/[0-9a-f-]{36}$/i);
    await detailPage.expectTitle(`${TITLE_PREFIX} テストカレー`);
    await expect(page.getByText("30分")).toBeVisible();
    await expect(page.getByText("玉ねぎ 1個")).toBeVisible();
    await expect(page.getByText("カレールー 1箱")).toBeVisible();
    await expect(page.getByText("野菜を切る")).toBeVisible();
    await expect(page.getByText("煮込む")).toBeVisible();
    await expect(page.getByText("翌日が美味しい")).toBeVisible();
  });

  test("タイトル以外が空でも保存できる", async ({ page }) => {
    cleanupMainUserRecipes();
    const createPage = new RecipeCreatePage(page);
    const detailPage = new RecipeDetailPage(page);

    await createPage.goto();
    await createPage.fillAndSave({ title: `${TITLE_PREFIX} タイトルのみ` });

    await expect(page).toHaveURL(/\/recipes\/[0-9a-f-]{36}$/i);
    await detailPage.expectTitle(`${TITLE_PREFIX} タイトルのみ`);
    await expect(detailPage.emptyIngredientsMessage).toBeVisible();
    await expect(detailPage.emptyStepsMessage).toBeVisible();
    await expect(detailPage.emptyNotesMessage).toBeVisible();
    await expect(detailPage.unsetCookingTime).toBeVisible();
  });

  test("タイトルが空だと保存できない", async ({ page }) => {
    cleanupMainUserRecipes();
    const createPage = new RecipeCreatePage(page);

    await createPage.goto();
    await createPage.fillAndSave({ cookingTimeMinutes: "10" });

    await createPage.expectOnCreatePage();
    await expect(createPage.titleError).toBeVisible();
    await expect(createPage.cookingTimeInput).toHaveValue("10");
  });

  test("タイトルが空白のみだと保存できない", async ({ page }) => {
    cleanupMainUserRecipes();
    const createPage = new RecipeCreatePage(page);

    await createPage.goto();
    await createPage.fillAndSave({ title: "   " });

    await createPage.expectOnCreatePage();
    await expect(createPage.titleError).toBeVisible();
  });

  test("タイトル入力中に Enter では保存されない", async ({ page }) => {
    cleanupMainUserRecipes();
    const createPage = new RecipeCreatePage(page);

    await createPage.goto();
    await createPage.titleInput.fill(`${TITLE_PREFIX} Enter テスト`);
    await createPage.titleInput.press("Enter");

    await createPage.expectOnCreatePage();
    await expect(page).toHaveURL(/\/recipes\/new$/);
  });

  test("所要時間入力中に Enter では保存されない", async ({ page }) => {
    cleanupMainUserRecipes();
    const createPage = new RecipeCreatePage(page);

    await createPage.goto();
    await createPage.titleInput.fill(`${TITLE_PREFIX} 時間 Enter`);
    await createPage.cookingTimeInput.fill("30");
    await createPage.cookingTimeInput.press("Enter");

    await createPage.expectOnCreatePage();
    await expect(page).toHaveURL(/\/recipes\/new$/);
  });

  test("所要時間が不正だと保存できない", async ({ page }) => {
    cleanupMainUserRecipes();
    const createPage = new RecipeCreatePage(page);

    await createPage.goto();
    await createPage.fillAndSave({
      title: `${TITLE_PREFIX} 不正時間`,
      cookingTimeMinutes: "0",
    });

    await createPage.expectOnCreatePage();
    await expect(createPage.cookingTimeError).toBeVisible();
    await expect(createPage.titleInput).toHaveValue(`${TITLE_PREFIX} 不正時間`);
  });

  test("キャンセルで一覧に戻る", async ({ page }) => {
    cleanupMainUserRecipes();
    const createPage = new RecipeCreatePage(page);

    await createPage.goto();
    await createPage.fillForm({ title: `${TITLE_PREFIX} キャンセル用` });
    await createPage.cancel();

    await expect(page).toHaveURL(/\/recipes$/);
    await expect(page.getByText(`${TITLE_PREFIX} キャンセル用`)).toHaveCount(0);
  });

  test("保存したレシピが一覧に出る", async ({ page }) => {
    cleanupMainUserRecipes();
    const createPage = new RecipeCreatePage(page);
    const detailPage = new RecipeDetailPage(page);
    const listPage = new RecipeListPage(page);

    await createPage.goto();
    await createPage.fillAndSave({ title: `${TITLE_PREFIX} 一覧確認` });
    await expect(page).toHaveURL(/\/recipes\/[0-9a-f-]{36}$/i);

    await detailPage.backToList();
    await expect(page).toHaveURL(/\/recipes/);
    await expect(listPage.recipeLink(`${TITLE_PREFIX} 一覧確認`)).toBeVisible();
    await expect(
      page.getByText(`${TITLE_PREFIX} 他ユーザーのレシピ`),
    ).toHaveCount(0);
  });
});

test.describe("レシピ追加 / 未ログイン", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("未ログインで追加画面を直接開くとログインへリダイレクト", async ({
    page,
  }) => {
    const createPage = new RecipeCreatePage(page);
    const loginPage = new LoginPage(page);

    await createPage.goto();
    await expect(page).toHaveURL(/\/login/);
    await loginPage.expectOnLoginPage();
    await expect(createPage.titleInput).toHaveCount(0);
  });
});
