import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Page Object for /recipes (list).
 * @see https://playwright.dev/docs/pom
 */
export class RecipeListPage {
  readonly page: Page;
  readonly table: Locator;
  readonly rows: Locator;
  readonly keywordInput: Locator;
  readonly searchButton: Locator;
  readonly cookingTimeFilter: Locator;
  readonly titleColumnHeader: Locator;
  readonly cookingTimeColumnHeader: Locator;
  readonly updatedAtColumnHeader: Locator;
  readonly pagination: Locator;
  readonly logoutButton: Locator;
  readonly addRecipeLink: Locator;
  readonly emptyMessage: Locator;
  readonly noMatchMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.table = page.getByRole("table");
    this.rows = page.locator("tbody tr");
    this.keywordInput = page.getByLabel("キーワード検索");
    this.searchButton = page.getByRole("button", { name: "検索" });
    this.cookingTimeFilter = page.getByRole("combobox", {
      name: "所要時間で絞り込む",
    });
    this.titleColumnHeader = page.getByRole("columnheader", { name: "タイトル" });
    this.cookingTimeColumnHeader = page.getByRole("columnheader", {
      name: /所要時間/,
    });
    this.updatedAtColumnHeader = page.getByRole("columnheader", {
      name: /更新日時/,
    });
    this.pagination = page.getByRole("navigation", { name: "ページネーション" });
    this.logoutButton = page.getByRole("button", { name: "ログアウト" });
    this.addRecipeLink = page.getByRole("link", { name: "レシピを追加" });
    this.emptyMessage = page.getByText("まだレシピがありません");
    this.noMatchMessage = page.getByText("条件に一致するレシピがありません");
  }

  async goto(query = "") {
    await this.page.goto(`/recipes${query}`);
  }

  recipeLink(title: string) {
    return this.page.getByRole("link", { name: title });
  }

  async searchByKeyword(keyword: string) {
    await this.keywordInput.fill(keyword);
    await this.searchButton.click();
  }

  async filterByCookingTime(value: string) {
    await this.cookingTimeFilter.selectOption(value);
  }

  async sortByCookingTime() {
    await this.cookingTimeColumnHeader.getByRole("link").click();
  }

  async sortByUpdatedAt() {
    await this.updatedAtColumnHeader.getByRole("link").click();
  }

  async goToPage(pageNumber: string) {
    await this.pagination.getByRole("link", { name: pageNumber }).click();
  }

  async openRecipe(title: string) {
    await this.recipeLink(title).click();
  }

  async openCreateForm() {
    await this.addRecipeLink.first().click();
  }

  async logout() {
    await this.logoutButton.click();
  }

  async expectOnListPage() {
    await expect(this.page).toHaveURL("/recipes");
  }

  async expectRecipeAbsent(title: string) {
    await expect(this.recipeLink(title)).toHaveCount(0);
  }

  async expectColumnHeadersVisible() {
    await expect(this.titleColumnHeader).toBeVisible();
    await expect(this.cookingTimeColumnHeader).toBeVisible();
    await expect(this.updatedAtColumnHeader).toBeVisible();
  }
}
