import { test as base } from "@playwright/test";
// ############ DELETE THESE IMPORTS. ADDED ONLY AS AN EXAMPLE ###############
import LoginPage from "@pages/Example/loginPage";
import HomePage from "@pages/Example/homePage";
import CartPage from "@e2e/pages/Example/cartPage";
import CheckOutPage from "@e2e/pages/Example/checkOutPage";
// ############ DELETE THESE IMPORTS. ADDED ONLY AS AN EXAMPLE ###############

interface PageFixtures {
  // ############ DELETE.ADDED ONLY AS AN EXAMPLE ##############
  loginPage: LoginPage;
  homePage: HomePage;
  cartPage: CartPage;
  checkOutPage: CheckOutPage;
  // ############ DELETE.ADDED ONLY AS AN EXAMPLE ##############
}

export const test = base.extend<PageFixtures>({
  // ############ DELETE.ADDED ONLY AS AN EXAMPLE ##############
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkOutPage: async ({ page }, use) => {
    await use(new CheckOutPage(page));
  },
  // ############ DELETE.ADDED ONLY AS AN EXAMPLE ##############
});

export { expect } from "@playwright/test";
