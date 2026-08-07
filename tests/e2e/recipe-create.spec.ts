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
    await page.goto("/recipes");
    await page.getByRole("link", { name: "レシピを追加" }).first().click();
    await expect(page).toHaveURL(/\/recipes\/new$/);
    await expect(page.getByRole("heading", { name: "レシピを追加" })).toBeVisible();
    await expect(page.getByLabel("タイトル")).toBeVisible();
    await expect(page.getByLabel("所要時間（分）")).toBeVisible();
    await expect(page.getByLabel("材料")).toBeVisible();
    await expect(page.getByLabel("手順")).toBeVisible();
    await expect(page.getByLabel("メモ")).toBeVisible();
  });

  test("0件の一覧からも追加画面へ行ける", async ({ page }) => {
    cleanupMainUserRecipes();
    await page.goto("/recipes");
    await expect(page.getByText("まだレシピがありません")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "レシピを追加" }).first(),
    ).toBeVisible();
    await page.getByRole("link", { name: "レシピを追加" }).first().click();
    await expect(page).toHaveURL(/\/recipes\/new$/);
  });

  test("必須項目を入れて保存できる", async ({ page }) => {
    cleanupMainUserRecipes();
    await page.goto("/recipes/new");
    await page.getByLabel("タイトル").fill(`${TITLE_PREFIX} テストカレー`);
    await page.getByLabel("所要時間（分）").fill("30");
    await page.getByLabel("材料").fill("玉ねぎ 1個\nカレールー 1箱");
    await page.getByLabel("手順").fill("野菜を切る\n煮込む");
    await page.getByLabel("メモ").fill("翌日が美味しい");
    await page.getByRole("button", { name: "保存" }).click();

    await expect(page).toHaveURL(/\/recipes\/[0-9a-f-]{36}$/i);
    await expect(
      page.getByRole("heading", { name: `${TITLE_PREFIX} テストカレー` }),
    ).toBeVisible();
    await expect(page.getByText("30分")).toBeVisible();
    await expect(page.getByText("玉ねぎ 1個")).toBeVisible();
    await expect(page.getByText("カレールー 1箱")).toBeVisible();
    await expect(page.getByText("野菜を切る")).toBeVisible();
    await expect(page.getByText("煮込む")).toBeVisible();
    await expect(page.getByText("翌日が美味しい")).toBeVisible();
  });

  test("タイトル以外が空でも保存できる", async ({ page }) => {
    cleanupMainUserRecipes();
    await page.goto("/recipes/new");
    await page.getByLabel("タイトル").fill(`${TITLE_PREFIX} タイトルのみ`);
    await page.getByRole("button", { name: "保存" }).click();

    await expect(page).toHaveURL(/\/recipes\/[0-9a-f-]{36}$/i);
    await expect(
      page.getByRole("heading", { name: `${TITLE_PREFIX} タイトルのみ` }),
    ).toBeVisible();
    await expect(page.getByText("材料は登録されていません")).toBeVisible();
    await expect(page.getByText("手順は登録されていません")).toBeVisible();
    await expect(page.getByText("メモはありません")).toBeVisible();
    await expect(page.getByText("未設定")).toBeVisible();
  });

  test("タイトルが空だと保存できない", async ({ page }) => {
    cleanupMainUserRecipes();
    await page.goto("/recipes/new");
    await page.getByLabel("所要時間（分）").fill("10");
    await page.getByRole("button", { name: "保存" }).click();

    await expect(page).toHaveURL(/\/recipes\/new$/);
    await expect(page.getByText("タイトルを入力してください")).toBeVisible();
    await expect(page.getByLabel("所要時間（分）")).toHaveValue("10");
  });

  test("タイトルが空白のみだと保存できない", async ({ page }) => {
    cleanupMainUserRecipes();
    await page.goto("/recipes/new");
    await page.getByLabel("タイトル").fill("   ");
    await page.getByRole("button", { name: "保存" }).click();

    await expect(page).toHaveURL(/\/recipes\/new$/);
    await expect(page.getByText("タイトルを入力してください")).toBeVisible();
  });

  test("所要時間が不正だと保存できない", async ({ page }) => {
    cleanupMainUserRecipes();
    await page.goto("/recipes/new");
    await page.getByLabel("タイトル").fill(`${TITLE_PREFIX} 不正時間`);
    await page.getByLabel("所要時間（分）").fill("0");
    await page.getByRole("button", { name: "保存" }).click();

    await expect(page).toHaveURL(/\/recipes\/new$/);
    await expect(
      page.getByText("所要時間は1以上の整数で入力してください"),
    ).toBeVisible();
    await expect(page.getByLabel("タイトル")).toHaveValue(
      `${TITLE_PREFIX} 不正時間`,
    );
  });

  test("キャンセルで一覧に戻る", async ({ page }) => {
    cleanupMainUserRecipes();
    await page.goto("/recipes/new");
    await page.getByLabel("タイトル").fill(`${TITLE_PREFIX} キャンセル用`);
    await page.getByRole("link", { name: "キャンセル" }).click();

    await expect(page).toHaveURL(/\/recipes$/);
    await expect(page.getByText(`${TITLE_PREFIX} キャンセル用`)).toHaveCount(0);
  });

  test("保存したレシピが一覧に出る", async ({ page }) => {
    cleanupMainUserRecipes();
    await page.goto("/recipes/new");
    await page.getByLabel("タイトル").fill(`${TITLE_PREFIX} 一覧確認`);
    await page.getByRole("button", { name: "保存" }).click();
    await expect(page).toHaveURL(/\/recipes\/[0-9a-f-]{36}$/i);

    await page.getByRole("link", { name: "一覧に戻る" }).click();
    await expect(page).toHaveURL(/\/recipes/);
    await expect(page.getByText(`${TITLE_PREFIX} 一覧確認`)).toBeVisible();
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
    await page.goto("/recipes/new");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByLabel("タイトル")).toHaveCount(0);
  });
});
