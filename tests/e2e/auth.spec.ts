/**
 * E2E tests for Feature: 認証（ログイン・ログアウト）
 * Covers docs/product/features/auth.md §5 Gherkin + §6 acceptance criteria.
 *
 * These tests run without a pre-loaded auth state because they need to verify
 * the full unauthenticated → authenticated flow.
 */
import { test, expect } from "@playwright/test";
import { loadCredentials } from "./helpers";

// All scenarios here start from a logged-out state.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("認証 / Auth", () => {
  test("正しい認証情報でログインするとレシピ一覧に遷移する", async ({ page }) => {
    const { mainUser } = loadCredentials();

    await page.goto("/login");
    await page.getByLabel("メールアドレス").fill(mainUser.email);
    await page.getByLabel("パスワード").fill(mainUser.password);
    await page.getByRole("button", { name: "ログイン" }).click();

    await expect(page).toHaveURL("/recipes");
    // ログアウトボタンが見える = ログイン状態
    await expect(page.getByRole("button", { name: "ログアウト" })).toBeVisible();
  });

  test("誤ったパスワードでログインするとエラーが表示される", async ({ page }) => {
    const { mainUser } = loadCredentials();

    await page.goto("/login");
    await page.getByLabel("メールアドレス").fill(mainUser.email);
    await page.getByLabel("パスワード").fill("wrong-password-999");
    await page.getByRole("button", { name: "ログイン" }).click();

    await expect(page).toHaveURL("/login");
    await expect(page.getByRole("alert")).toBeVisible();
  });

  test("ログアウトするとログイン画面に遷移する", async ({ page }) => {
    const { mainUser } = loadCredentials();

    // ログインしてからログアウト
    await page.goto("/login");
    await page.getByLabel("メールアドレス").fill(mainUser.email);
    await page.getByLabel("パスワード").fill(mainUser.password);
    await page.getByRole("button", { name: "ログイン" }).click();
    await expect(page).toHaveURL("/recipes");

    await page.getByRole("button", { name: "ログアウト" }).click();
    await expect(page).toHaveURL("/login");

    // ログアウト後に /recipes に直接アクセスするとリダイレクトされる
    await page.goto("/recipes");
    await expect(page).toHaveURL("/login");
  });

  test("未ログインで /recipes にアクセスするとログイン画面にリダイレクトされる", async ({
    page,
  }) => {
    await page.goto("/recipes");
    await expect(page).toHaveURL("/login");
    // レシピの中身は表示されない
    await expect(page.getByRole("table")).not.toBeVisible();
    await expect(page.getByText("レシピ一覧")).not.toBeVisible();
  });

  test("未ログインで /recipes/[id] にアクセスするとログイン画面にリダイレクトされる", async ({
    page,
  }) => {
    await page.goto("/recipes/00000000-0000-0000-0000-000000000001");
    await expect(page).toHaveURL("/login");
  });

  test("ログイン済みで /login にアクセスすると /recipes にリダイレクトされる", async ({
    page,
  }) => {
    const { mainUser } = loadCredentials();

    await page.goto("/login");
    await page.getByLabel("メールアドレス").fill(mainUser.email);
    await page.getByLabel("パスワード").fill(mainUser.password);
    await page.getByRole("button", { name: "ログイン" }).click();
    await expect(page).toHaveURL("/recipes");

    // ログイン済みで /login に再アクセス
    await page.goto("/login");
    await expect(page).toHaveURL("/recipes");
  });
});
