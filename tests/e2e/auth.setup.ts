/**
 * Logs in as the main test user and saves the browser storage state so other
 * specs can reuse it without going through the login flow each time.
 */
import { test as setup, expect } from "@playwright/test";
import path from "path";
import { loadCredentials } from "./helpers";
import { LoginPage } from "./pages";

const AUTH_FILE = path.join(__dirname, ".auth/user.json");

setup("authenticate as main test user", async ({ page }) => {
  const { mainUser } = loadCredentials();
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login(mainUser.email, mainUser.password);

  await expect(page).toHaveURL("/recipes");

  await page.context().storageState({ path: AUTH_FILE });
});
