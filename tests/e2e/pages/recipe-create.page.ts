import { expect, type Locator, type Page } from "@playwright/test";

export type RecipeFormValues = {
  title?: string;
  cookingTimeMinutes?: string;
  ingredients?: string;
  steps?: string;
  notes?: string;
};

/**
 * Page Object for /recipes/new (create form).
 * @see https://playwright.dev/docs/pom
 */
export class RecipeCreatePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly titleInput: Locator;
  readonly cookingTimeInput: Locator;
  readonly ingredientsInput: Locator;
  readonly stepsInput: Locator;
  readonly notesInput: Locator;
  readonly saveButton: Locator;
  readonly cancelLink: Locator;
  readonly titleError: Locator;
  readonly cookingTimeError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "レシピを追加" });
    this.titleInput = page.getByLabel("タイトル");
    this.cookingTimeInput = page.getByLabel("所要時間（分）");
    this.ingredientsInput = page.getByLabel("材料");
    this.stepsInput = page.getByLabel("手順");
    this.notesInput = page.getByLabel("メモ");
    this.saveButton = page.getByRole("button", { name: "保存" });
    this.cancelLink = page.getByRole("link", { name: "キャンセル" });
    this.titleError = page.getByText("タイトルを入力してください");
    this.cookingTimeError = page.getByText(
      "所要時間は1以上の整数で入力してください",
    );
  }

  async goto() {
    await this.page.goto("/recipes/new");
  }

  async fillForm(values: RecipeFormValues) {
    if (values.title !== undefined) {
      await this.titleInput.fill(values.title);
    }
    if (values.cookingTimeMinutes !== undefined) {
      await this.cookingTimeInput.fill(values.cookingTimeMinutes);
    }
    if (values.ingredients !== undefined) {
      await this.ingredientsInput.fill(values.ingredients);
    }
    if (values.steps !== undefined) {
      await this.stepsInput.fill(values.steps);
    }
    if (values.notes !== undefined) {
      await this.notesInput.fill(values.notes);
    }
  }

  async save() {
    await this.saveButton.click();
  }

  async cancel() {
    await this.cancelLink.click();
  }

  async fillAndSave(values: RecipeFormValues) {
    await this.fillForm(values);
    await this.save();
  }

  async expectOnCreatePage() {
    await expect(this.page).toHaveURL(/\/recipes\/new$/);
  }

  async expectFormFieldsVisible() {
    await expect(this.heading).toBeVisible();
    await expect(this.titleInput).toBeVisible();
    await expect(this.cookingTimeInput).toBeVisible();
    await expect(this.ingredientsInput).toBeVisible();
    await expect(this.stepsInput).toBeVisible();
    await expect(this.notesInput).toBeVisible();
  }
}
