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
      .insert({ title: "[E2E-Other] 他ユーザーのレシピ", cooking_time_minutes: 10, user_id: otherUser.id })
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
    await page.goto("/recipes");
    await page.getByRole("link", { name: "[E2E-Detail] フルレシピ" }).click();

    await expect(page).toHaveURL(new RegExp(`/recipes/${fullRecipeId}`));
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "[E2E-Detail] フルレシピ",
    );
  });

  test("全項目が入力されたレシピの詳細が正しく表示される", async ({ page }) => {
    await page.goto(`/recipes/${fullRecipeId}`);

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "[E2E-Detail] フルレシピ",
    );
    // 所要時間 (exact: true でノーツ内の「30分以上」と区別)
    await expect(page.getByText("30分", { exact: true })).toBeVisible();
    // 更新日時 (MM/DD HH:mm か YYYY/MM/DD HH:mm の形式)
    await expect(page.getByText(/\d{2}\/\d{2}.*\d{2}:\d{2}/)).toBeVisible();

    // 材料が箇条書きで表示される
    const ingredients = page.getByRole("list").first();
    await expect(ingredients.getByRole("listitem").first()).toContainText("鶏もも肉 300g");
    await expect(ingredients.getByRole("listitem").nth(1)).toContainText("醤油 大さじ2");
    await expect(ingredients.getByRole("listitem").nth(2)).toContainText("みりん 大さじ2");

    // 手順が番号付きリストで表示される
    const steps = page.getByRole("list").nth(1);
    await expect(steps.getByRole("listitem").first()).toContainText("鶏肉を一口大に切る");
    await expect(steps.getByRole("listitem").nth(2)).toContainText("フライパンで焼く");

    // メモ
    await expect(page.getByText("漬け込み時間を30分以上取ると美味しい")).toBeVisible();
  });

  test("材料・手順・メモが未入力のレシピで空の案内が出る", async ({ page }) => {
    await page.goto(`/recipes/${emptyRecipeId}`);

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "[E2E-Detail] 空レシピ",
    );
    await expect(page.getByText("材料は登録されていません")).toBeVisible();
    await expect(page.getByText("手順は登録されていません")).toBeVisible();
    await expect(page.getByText("メモはありません")).toBeVisible();
    // 画面が崩れていないことを確認（見出しが残っている）
    await expect(page.getByRole("heading", { name: "材料" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "手順" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "メモ" })).toBeVisible();
  });

  test("所要時間が未設定のレシピで「未設定」と表示される", async ({ page }) => {
    await page.goto(`/recipes/${noTimeRecipeId}`);

    await expect(page.getByText("未設定")).toBeVisible();
  });

  test("「一覧に戻る」リンクで検索・絞り込み・ソートが復元される", async ({ page }) => {
    await page.goto(`/recipes/${fullRecipeId}?keyword=%E3%83%95%E3%83%AB&cooking_time=under10&sort=cooking_time_minutes&sort_dir=asc`);

    await page.getByRole("link", { name: /一覧に戻る/ }).click();
    // クライアントサイドナビゲーション完了まで待機
    await expect(page).toHaveURL(/\/recipes\?/);

    const url = new URL(page.url());
    expect(url.pathname).toBe("/recipes");
    expect(url.searchParams.get("keyword")).toBe("フル");
    expect(url.searchParams.get("cooking_time")).toBe("under10");
    expect(url.searchParams.get("sort")).toBe("cooking_time_minutes");
    expect(url.searchParams.get("sort_dir")).toBe("asc");
  });

  test("「一覧に戻る」リンクはデフォルトで /recipes に戻る", async ({ page }) => {
    await page.goto(`/recipes/${fullRecipeId}`);
    await page.getByRole("link", { name: /一覧に戻る/ }).click();
    await expect(page).toHaveURL("/recipes");
  });

  test("他ユーザーのレシピIDを直接開くと「見つかりません」になる（RLS）", async ({
    page,
  }) => {
    await page.goto(`/recipes/${otherRecipeId}`);
    await expect(page.getByRole("heading", { name: "レシピが見つかりません" })).toBeVisible();
    // 他ユーザーのレシピ内容は表示されない
    await expect(page.getByText("[E2E-Other] 他ユーザーのレシピ")).not.toBeVisible();
    // 一覧に戻る導線がある
    await expect(page.getByRole("link", { name: "レシピ一覧に戻る" })).toBeVisible();
  });

  test("存在しないIDを開くと「見つかりません」になる", async ({ page }) => {
    await page.goto("/recipes/00000000-0000-0000-0000-000000000000");
    await expect(page.getByRole("heading", { name: "レシピが見つかりません" })).toBeVisible();
    await expect(page.getByRole("link", { name: "レシピ一覧に戻る" })).toBeVisible();
  });

  test("不正な形式のIDを開くと「見つかりません」になる", async ({ page }) => {
    await page.goto("/recipes/not-a-valid-uuid");
    await expect(page.getByRole("heading", { name: "レシピが見つかりません" })).toBeVisible();
  });

});

test.describe("レシピ詳細 / 未ログイン", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("未ログインで詳細URLを直接開くとログイン画面にリダイレクトされる", async ({
    page,
  }) => {
    // fullRecipeId is set in beforeAll of the sibling describe block above.
    // We access the same variable from module scope.
    await page.goto(`/recipes/${fullRecipeId}`);
    await expect(page).toHaveURL("/login");
  });
});
