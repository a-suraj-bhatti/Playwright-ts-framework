import { test } from "@e2e/fixtures/customFixtures";

test("User logs in to the Sauce Labs Demo page and adds an item to the cart", async ({
  loginPage,
  homePage,
}) => {
  await loginPage.visit();
  await loginPage.login();
  await homePage.addToCart("Sauce Labs Bolt T-Shirt");
});
