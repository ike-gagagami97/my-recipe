/**
 * E2E tests for Feature: レシピ削除
 * Covers docs/product/features/recipe-delete.md §5 Gherkin + §6 acceptance criteria.
 */
import { test, expect } from "@playwright/test";
import {
  cleanupMainUserRecipes,
  cleanupOtherUserRecipes,
  mainUserClient,
  otherUserClient,
  loadCredentials,
} from "./helpers";
import { LoginPage, RecipeDetailPage, RecipeListPage, RecipeEditPage } from "./pages";

const TITLE_PREFIX = "[E2E-Delete]";

type SeededRecipe = {
  id: string;
  title: string;
};

async function seedOwnRecipe(
  overrides: Partial<{ title: string }> = {},
): Promise<SeededRecipe> {
  const { mainUser } = loadCredentials();
  const client = await mainUserClient();
  const title = overrides.title ?? `${TITLE_PREFIX} 削除対象`;
  const { data, error } = await client
    .from("recipes")
    .insert({
      title,
      cooking_time_minutes: 20,
      ingredients: "材料A",
      steps: "手順A",
      notes: "メモA",
      user_id: mainUser.id,
    })
    .select("id, title")
    .single();
  if (error || !data) throw new Error(`Seed own recipe: ${error?.message}`);
  return data;
}

test.describe("レシピ削除 / Recipe Delete", () => {
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

  test("詳細からレシピを削除すると一覧から消える", async ({ page }) => {
    cleanupMainUserRecipes();
    const recipe = await seedOwnRecipe();
    const detailPage = new RecipeDetailPage(page);
    const listPage = new RecipeListPage(page);

    await detailPage.goto(recipe.id);
    await detailPage.openDeleteDialog();
    await detailPage.confirmDelete();

    await expect(page).toHaveURL(/\/recipes$/);
    await listPage.expectRecipeAbsent(recipe.title);
  });

  test("確認ダイアログでキャンセルすると詳細に留まる", async ({ page }) => {
    cleanupMainUserRecipes();
    const recipe = await seedOwnRecipe({
      title: `${TITLE_PREFIX} キャンセル対象`,
    });
    const detailPage = new RecipeDetailPage(page);

    await detailPage.goto(recipe.id);
    await detailPage.openDeleteDialog();
    await detailPage.cancelDelete();

    await expect(page).toHaveURL(new RegExp(`/recipes/${recipe.id}$`));
    await detailPage.expectTitle(recipe.title);
    await expect(detailPage.deleteButton).toBeVisible();
  });

  test("削除後に詳細 URL を開くと見つからない", async ({ page }) => {
    cleanupMainUserRecipes();
    const recipe = await seedOwnRecipe({
      title: `${TITLE_PREFIX} 削除後確認`,
    });
    const detailPage = new RecipeDetailPage(page);

    await detailPage.goto(recipe.id);
    await detailPage.openDeleteDialog();
    await detailPage.confirmDelete();
    await expect(page).toHaveURL(/\/recipes$/);

    await detailPage.goto(recipe.id);
    await detailPage.expectNotFound();
    await expect(detailPage.deleteButton).toHaveCount(0);
  });

  test("他ユーザーのレシピは見つからず削除ボタンも出ない", async ({ page }) => {
    const detailPage = new RecipeDetailPage(page);

    await detailPage.goto(otherRecipeId);
    await detailPage.expectNotFound();
    await expect(detailPage.deleteButton).toHaveCount(0);
  });

  test("存在しないレシピは見つからず削除ボタンも出ない", async ({ page }) => {
    const detailPage = new RecipeDetailPage(page);

    await detailPage.goto("00000000-0000-4000-8000-000000000099");
    await detailPage.expectNotFound();
    await expect(detailPage.deleteButton).toHaveCount(0);
  });

  test("不正な形式の ID は見つからず削除ボタンも出ない", async ({ page }) => {
    const detailPage = new RecipeDetailPage(page);

    await page.goto("/recipes/not-a-valid-uuid");
    await detailPage.expectNotFound();
    await expect(detailPage.deleteButton).toHaveCount(0);
  });

  test("削除後にブラウザバックしても削除済み詳細は表示されない", async ({
    page,
  }) => {
    cleanupMainUserRecipes();
    const recipe = await seedOwnRecipe({
      title: `${TITLE_PREFIX} バック確認`,
    });
    const detailPage = new RecipeDetailPage(page);
    const listPage = new RecipeListPage(page);

    // Client-side navigation (Link click) — matches typical user flow.
    await listPage.goto();
    await listPage.openRecipe(recipe.title);
    await expect(page).toHaveURL(new RegExp(`/recipes/${recipe.id}$`));
    await detailPage.openDeleteDialog();
    await detailPage.confirmDelete();
    await expect(page).toHaveURL(/\/recipes$/);

    await page.goBack();
    await expect(
      page.getByRole("heading", { level: 1, name: recipe.title }),
    ).toHaveCount(0);
    if (page.url().match(/\/recipes\/[0-9a-f-]+$/i)) {
      await detailPage.expectNotFound();
    }
  });

  test("削除後に詳細 URL へ戻っても Router Cache で内容が復活しない", async ({
    page,
  }) => {
    cleanupMainUserRecipes();
    const recipe = await seedOwnRecipe({
      title: `${TITLE_PREFIX} キャッシュ確認`,
    });
    const detailPage = new RecipeDetailPage(page);

    await page.goto("/recipes");
    await page.goto(`/recipes/${recipe.id}`);
    await detailPage.openDeleteDialog();
    await detailPage.confirmDelete();
    await expect(page).toHaveURL(/\/recipes$/);

    // Revisit the deleted detail URL (simulates back when detail remains in history).
    await page.goto(`/recipes/${recipe.id}`);
    await detailPage.expectNotFound();
    await expect(detailPage.deleteButton).toHaveCount(0);
  });

  test("削除後に「見つかりません」画面が一瞬も出ない", async ({ page }) => {
    cleanupMainUserRecipes();
    const recipe = await seedOwnRecipe({
      title: `${TITLE_PREFIX} 遷移確認`,
    });
    const detailPage = new RecipeDetailPage(page);

    await page.goto(`/recipes/${recipe.id}`);
    await detailPage.openDeleteDialog();
    await detailPage.confirmDelete();

    await expect(detailPage.notFoundHeading).not.toBeVisible();
    await expect(page).toHaveURL(/\/recipes$/);
  });

  test("編集画面に削除ボタンは無い", async ({ page }) => {
    cleanupMainUserRecipes();
    const recipe = await seedOwnRecipe({
      title: `${TITLE_PREFIX} 編集画面確認`,
    });
    const editPage = new RecipeEditPage(page);

    await editPage.goto(recipe.id);
    await editPage.expectOnEditPage(recipe.id);
    await expect(page.getByRole("button", { name: "削除", exact: true })).toHaveCount(
      0,
    );
  });

  test("一覧行に削除ボタンは無い", async ({ page }) => {
    cleanupMainUserRecipes();
    await seedOwnRecipe({ title: `${TITLE_PREFIX} 一覧確認` });
    const listPage = new RecipeListPage(page);

    await listPage.goto();
    await expect(page.getByRole("button", { name: "削除", exact: true })).toHaveCount(
      0,
    );
  });
});

test.describe("レシピ削除 / 未ログイン", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("未ログインで詳細を開くとログインへリダイレクト", async ({ page }) => {
    const detailPage = new RecipeDetailPage(page);
    const loginPage = new LoginPage(page);

    await detailPage.goto("00000000-0000-4000-8000-000000000001");
    await expect(page).toHaveURL(/\/login/);
    await loginPage.expectOnLoginPage();
    await expect(detailPage.deleteButton).toHaveCount(0);
  });
});
