import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Page Object for /login.
 * @see https://playwright.dev/docs/pom
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly alert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel("メールアドレス");
    this.passwordInput = page.getByLabel("パスワード");
    this.submitButton = page.getByRole("button", { name: "ログイン" });
    this.alert = page.getByRole("alert");
  }

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectOnLoginPage() {
    await expect(this.page).toHaveURL("/login");
  }
}
