/**
 * E2E tests for Feature: 認証（ログイン・ログアウト）
 * Covers docs/product/features/auth.md §5 Gherkin + §6 acceptance criteria.
 *
 * These tests run without a pre-loaded auth state because they need to verify
 * the full unauthenticated → authenticated flow.
 */
import { test, expect } from "@playwright/test";
import { loadCredentials } from "./helpers";
import { LoginPage, RecipeListPage } from "./pages";

// All scenarios here start from a logged-out state.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("認証 / Auth", () => {
  test("正しい認証情報でログインするとレシピ一覧に遷移する", async ({ page }) => {
    const { mainUser } = loadCredentials();
    const loginPage = new LoginPage(page);
    const listPage = new RecipeListPage(page);

    await loginPage.goto();
    await loginPage.login(mainUser.email, mainUser.password);

    await listPage.expectOnListPage();
    await expect(listPage.logoutButton).toBeVisible();
  });

  test("誤ったパスワードでログインするとエラーが表示される", async ({ page }) => {
    const { mainUser } = loadCredentials();
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(mainUser.email, "wrong-password-999");

    await loginPage.expectOnLoginPage();
    await expect(loginPage.alert).toBeVisible();
  });

  test("ログアウトするとログイン画面に遷移する", async ({ page }) => {
    const { mainUser } = loadCredentials();
    const loginPage = new LoginPage(page);
    const listPage = new RecipeListPage(page);

    await loginPage.goto();
    await loginPage.login(mainUser.email, mainUser.password);
    await listPage.expectOnListPage();

    await listPage.logout();
    await loginPage.expectOnLoginPage();

    // ログアウト後に /recipes に直接アクセスするとリダイレクトされる
    await listPage.goto();
    await loginPage.expectOnLoginPage();
  });

  test("未ログインで /recipes にアクセスするとログイン画面にリダイレクトされる", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    const listPage = new RecipeListPage(page);

    await listPage.goto();
    await loginPage.expectOnLoginPage();
    await expect(listPage.table).not.toBeVisible();
    await expect(page.getByText("レシピ一覧")).not.toBeVisible();
  });

  test("未ログインで /recipes/[id] にアクセスするとログイン画面にリダイレクトされる", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);

    await page.goto("/recipes/00000000-0000-0000-0000-000000000001");
    await loginPage.expectOnLoginPage();
  });

  test("ログイン済みで /login にアクセスすると /recipes にリダイレクトされる", async ({
    page,
  }) => {
    const { mainUser } = loadCredentials();
    const loginPage = new LoginPage(page);
    const listPage = new RecipeListPage(page);

    await loginPage.goto();
    await loginPage.login(mainUser.email, mainUser.password);
    await listPage.expectOnListPage();

    // ログイン済みで /login に再アクセス
    await loginPage.goto();
    await listPage.expectOnListPage();
  });
});
