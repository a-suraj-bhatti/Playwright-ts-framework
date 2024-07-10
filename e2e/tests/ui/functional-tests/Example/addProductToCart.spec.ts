import { expect, test } from "@e2e/fixtures/customFixtures";
import { getRandomCustomerDetails } from "@e2e/testdata/Example/testDataGenerator";

test("User logs in to the Sauce Labs Demo page and adds an item to the cart", async ({
  loginPage,
  cartPage,
  checkOutPage,
  homePage,
}) => {
  await loginPage.visit();
  await loginPage.login();
  await homePage.addProductToCart("Sauce Labs Bolt T-Shirt");
  await cartPage.goToCart();
  await cartPage.checkout();
  await checkOutPage.addCustomerDetails(getRandomCustomerDetails());
  await checkOutPage.continueToCheckOutOverview();
  expect(await checkOutPage.getItemTotal()).toEqual("Item total: $15.99");
});
