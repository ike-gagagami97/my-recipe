/**
 * E2E tests for Feature: レシピお気に入り（ブックマーク）
 * Covers docs/product/features/recipe-favorite.md §5 core scenarios.
 */
import { test, expect } from "@playwright/test";
import {
  mainUserClient,
  cleanupMainUserRecipes,
  loadCredentials,
} from "./helpers";
import { RecipeListPage, RecipeDetailPage } from "./pages";

const FAV_RECIPES = [
  {
    title: "[E2E-Fav] 定番カレー",
    cooking_time_minutes: 30,
    is_favorite: true,
  },
  {
    title: "[E2E-Fav] いつもパスタ",
    cooking_time_minutes: 15,
    is_favorite: true,
  },
  {
    title: "[E2E-Fav] 普通のサラダ",
    cooking_time_minutes: 5,
    is_favorite: false,
  },
  {
    title: "[E2E-Fav] 検索用みそ汁",
    cooking_time_minutes: 9,
    is_favorite: true,
  },
] as const;

async function seedFavoriteRecipes() {
  const { mainUser } = loadCredentials();
  const client = await mainUserClient();
  for (const recipe of FAV_RECIPES) {
    const { error } = await client
      .from("recipes")
      .insert({ ...recipe, user_id: mainUser.id });
    if (error) throw new Error(`Seed insert failed: ${error.message}`);
  }
}

test.describe("レシピお気に入り / Recipe Favorite", () => {
  test.use({ storageState: "tests/e2e/.auth/user.json" });

  test.beforeAll(async () => {
    cleanupMainUserRecipes();
    await seedFavoriteRecipes();
  });

  test.afterAll(() => {
    cleanupMainUserRecipes();
  });

  test("詳細でお気に入りを ON/OFF でき、リロード後も残る", async ({
    page,
  }) => {
    const listPage = new RecipeListPage(page);
    await listPage.goto();
    await listPage.openRecipe("[E2E-Fav] 普通のサラダ");

    const detailPage = new RecipeDetailPage(page);
    await detailPage.expectTitle("[E2E-Fav] 普通のサラダ");
    await detailPage.expectFavoriteOff();

    await detailPage.toggleFavorite();
    await detailPage.expectFavoriteOn();

    await page.reload();
    await detailPage.expectFavoriteOn();

    await detailPage.toggleFavorite();
    await detailPage.expectFavoriteOff();

    await page.reload();
    await detailPage.expectFavoriteOff();
  });

  test("一覧行でお気に入りを付け外しできる", async ({ page }) => {
    const listPage = new RecipeListPage(page);
    await listPage.goto();

    const toggle = listPage.favoriteToggleForRow("[E2E-Fav] 普通のサラダ");
    await expect(toggle).toHaveAttribute("aria-pressed", "false");

    await listPage.toggleFavoriteForRecipe("[E2E-Fav] 普通のサラダ");
    await expect(
      listPage.favoriteToggleForRow("[E2E-Fav] 普通のサラダ"),
    ).toHaveAttribute("aria-pressed", "true");

    await page.reload();
    await expect(
      listPage.favoriteToggleForRow("[E2E-Fav] 普通のサラダ"),
    ).toHaveAttribute("aria-pressed", "true");

    // Reset for later tests
    await listPage.toggleFavoriteForRecipe("[E2E-Fav] 普通のサラダ");
    await expect(
      listPage.favoriteToggleForRow("[E2E-Fav] 普通のサラダ"),
    ).toHaveAttribute("aria-pressed", "false");
  });

  test("お気に入りのみで絞り込める", async ({ page }) => {
    const listPage = new RecipeListPage(page);
    await listPage.goto();
    await listPage.setFavoriteOnly(true);

    await expect(page).toHaveURL(/favorite=1/);
    await expect(listPage.recipeLink("[E2E-Fav] 定番カレー")).toBeVisible();
    await expect(listPage.recipeLink("[E2E-Fav] いつもパスタ")).toBeVisible();
    await expect(
      listPage.recipeLink("[E2E-Fav] 普通のサラダ"),
    ).toHaveCount(0);
  });

  test("お気に入りのみの選択はリロード後も残る", async ({ page }) => {
    const listPage = new RecipeListPage(page);
    await listPage.goto();
    await listPage.setFavoriteOnly(true);
    await expect(page).toHaveURL(/favorite=1/);

    await page.reload();
    await expect(listPage.favoriteOnlyCheckbox).toBeChecked();
    await expect(
      listPage.recipeLink("[E2E-Fav] 普通のサラダ"),
    ).toHaveCount(0);
  });

  test("お気に入りとキーワード検索を同時に使える", async ({ page }) => {
    const listPage = new RecipeListPage(page);
    await listPage.goto();
    await listPage.setFavoriteOnly(true);
    await listPage.searchByKeyword("みそ汁");

    await expect(listPage.recipeLink("[E2E-Fav] 検索用みそ汁")).toBeVisible();
    await expect(listPage.recipeLink("[E2E-Fav] 定番カレー")).toHaveCount(0);
    await expect(
      listPage.recipeLink("[E2E-Fav] 普通のサラダ"),
    ).toHaveCount(0);
  });

  test("お気に入り0件のとき案内が出る", async ({ page }) => {
    cleanupMainUserRecipes();
    const { mainUser } = loadCredentials();
    const client = await mainUserClient();
    await client.from("recipes").insert({
      user_id: mainUser.id,
      title: "[E2E-Fav] 非お気に入りのみ",
      cooking_time_minutes: 10,
      is_favorite: false,
    });

    const listPage = new RecipeListPage(page);
    await listPage.goto();
    await listPage.setFavoriteOnly(true);

    await expect(listPage.noMatchMessage).toBeVisible();
    await expect(listPage.favoriteOnlyCheckbox).toBeEnabled();

    cleanupMainUserRecipes();
    await seedFavoriteRecipes();
  });
});
