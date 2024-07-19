import { expect, test } from "@e2e/fixtures/customFixtures";

test.describe(
  "There are two tests",
  {
    tag: ["@functionality_describe", "@negative"],
    annotation: { type: "jira issue", description: "This is a test description" },
  },
  () => {
    test(
      "Verify that the user is able to login to the application",
      { tag: ["@positive", "@priority_high", "@functionality_descoverride"] },
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
        tag: "@priority_low",
      },
      async ({ page }) => {
        // ...
        page.goto("");
      },
    );
  },
);

test(
  "test login page22",
  {
    annotation: {
      type: "issue",
      description: "https://github.com/microsoft/playwright/issues/23180",
    },
    tag: "@priority_low",
  },
  async ({ page }) => {
    // ...
    page.goto("");
  },
);
