import { expect, type Locator, type Page } from "@playwright/test";
import type { RecipeFormValues } from "./recipe-create.page";

/**
 * Page Object for /recipes/[id]/edit (edit form).
 * @see https://playwright.dev/docs/pom
 */
export class RecipeEditPage {
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
    this.heading = page.getByRole("heading", { name: "レシピを編集" });
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

  async goto(id: string) {
    await this.page.goto(`/recipes/${id}/edit`);
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

  async expectOnEditPage(id?: string) {
    if (id) {
      await expect(this.page).toHaveURL(new RegExp(`/recipes/${id}/edit$`));
    } else {
      await expect(this.page).toHaveURL(/\/recipes\/[0-9a-f-]{36}\/edit$/i);
    }
  }

  async expectFormFieldsVisible() {
    await expect(this.heading).toBeVisible();
    await expect(this.titleInput).toBeVisible();
    await expect(this.cookingTimeInput).toBeVisible();
    await expect(this.ingredientsInput).toBeVisible();
    await expect(this.stepsInput).toBeVisible();
    await expect(this.notesInput).toBeVisible();
  }

  async expectPrefill(values: Required<RecipeFormValues>) {
    await expect(this.titleInput).toHaveValue(values.title);
    await expect(this.cookingTimeInput).toHaveValue(values.cookingTimeMinutes);
    await expect(this.ingredientsInput).toHaveValue(values.ingredients);
    await expect(this.stepsInput).toHaveValue(values.steps);
    await expect(this.notesInput).toHaveValue(values.notes);
  }
}
