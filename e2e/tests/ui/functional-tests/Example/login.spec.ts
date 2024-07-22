import { expect, test } from "@e2e/fixtures/customFixtures";

test.describe(
  "There are two tests",
  {
    annotation: { type: "jira issue", description: "This is a test description" },
    tag: ["@team_test", "@sprint_2024.1.2"],
  },
  () => {
    test(
      "Verify that the user is able to login to the application",
      { tag: ["@positive", "@priority_high", "@functionality_descoverride", "@team_ovvertiode"] },
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
    tag: ["@priority_low", "@functionality_page22", "@team_ace"],
  },
  async ({ page }) => {
    // ...
    page.goto("");
  },
);
