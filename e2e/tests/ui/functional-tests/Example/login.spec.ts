import { expect, test } from "@e2e/fixtures/customFixtures";

test("Verify that the user is able to login to the application", async ({
  loginPage,
  homePage,
}) => {
  await loginPage.visit();
  await loginPage.login();
  await expect(homePage.product("Sauce Labs Backpack")).toBeVisible();
});
