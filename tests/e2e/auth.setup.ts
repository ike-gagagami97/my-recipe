/**
 * Logs in as the main test user and saves the browser storage state so other
 * specs can reuse it without going through the login flow each time.
 */
import { test as setup, expect } from "@playwright/test";
import path from "path";
import { loadCredentials } from "./helpers";

const AUTH_FILE = path.join(__dirname, ".auth/user.json");

setup("authenticate as main test user", async ({ page }) => {
  const { mainUser } = loadCredentials();

  await page.goto("/login");
  await page.getByLabel("メールアドレス").fill(mainUser.email);
  await page.getByLabel("パスワード").fill(mainUser.password);
  await page.getByRole("button", { name: "ログイン" }).click();

  await expect(page).toHaveURL("/recipes");

  await page.context().storageState({ path: AUTH_FILE });
});
