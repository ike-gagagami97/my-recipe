import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Page Object for /recipes/[id] (detail).
 * @see https://playwright.dev/docs/pom
 */
export class RecipeDetailPage {
  readonly page: Page;
  readonly titleHeading: Locator;
  readonly backToListLink: Locator;
  readonly notFoundHeading: Locator;
  readonly backToListFromNotFoundLink: Locator;
  readonly ingredientsHeading: Locator;
  readonly stepsHeading: Locator;
  readonly notesHeading: Locator;
  readonly emptyIngredientsMessage: Locator;
  readonly emptyStepsMessage: Locator;
  readonly emptyNotesMessage: Locator;
  readonly unsetCookingTime: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titleHeading = page.getByRole("heading", { level: 1 });
    this.backToListLink = page.getByRole("link", { name: /一覧に戻る/ });
    this.notFoundHeading = page.getByRole("heading", {
      name: "レシピが見つかりません",
    });
    this.backToListFromNotFoundLink = page.getByRole("link", {
      name: "レシピ一覧に戻る",
    });
    this.ingredientsHeading = page.getByRole("heading", { name: "材料" });
    this.stepsHeading = page.getByRole("heading", { name: "手順" });
    this.notesHeading = page.getByRole("heading", { name: "メモ" });
    this.emptyIngredientsMessage = page.getByText("材料は登録されていません");
    this.emptyStepsMessage = page.getByText("手順は登録されていません");
    this.emptyNotesMessage = page.getByText("メモはありません");
    this.unsetCookingTime = page.getByText("未設定");
  }

  async goto(id: string, query = "") {
    await this.page.goto(`/recipes/${id}${query}`);
  }

  ingredientsList() {
    return this.page.getByRole("list").first();
  }

  stepsList() {
    return this.page.getByRole("list").nth(1);
  }

  async backToList() {
    await this.backToListLink.click();
  }

  async expectTitle(title: string) {
    await expect(this.titleHeading).toContainText(title);
  }

  async expectNotFound() {
    await expect(this.notFoundHeading).toBeVisible();
  }
}
