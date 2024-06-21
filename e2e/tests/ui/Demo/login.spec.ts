import { expect, test } from "@e2e/fixtures/customFixtures";

test("Verify that the user is able to login to the application", async ({
  loginPage,
  homePage,
}) => {
  loginPage.visit();
  loginPage.login();
  await expect(homePage.productLink("Sauce Labs Backpack").nth(1)).toBeVisible();
});
