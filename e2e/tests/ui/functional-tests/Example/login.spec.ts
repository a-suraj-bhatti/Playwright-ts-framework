import { expect, test } from "@e2e/fixtures/customFixtures";

test.describe("There are two tests",{ tag: "@functionality_describe" }, () => {
  test(
    "Verify that the user is able to login to the application",
    { tag: ["@functionality_login_test", "@positive", "@priority_high"] },
    async ({ loginPage, homePage }) => {
      await loginPage.visit();
      await loginPage.login();
      await expect(homePage.product("Sauce Labs Backpack")).toBeVisible();
    },
  );

  test(
    "test login page",
    {
      annotation: {
        type: "issue",
        description: "https://github.com/microsoft/playwright/issues/23180",
      },
      tag: '@functionality_singleTag',
    },
    async ({ page }) => {
      // ...
      page.goto("");
    },
  );
});

