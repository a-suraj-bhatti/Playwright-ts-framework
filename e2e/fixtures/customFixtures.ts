import { test as base } from "@playwright/test";
// ############ DELETE THESE IMPORTS. THESE ARE ONLY FOR THE DEMO ###############
import LoginPage from "@pages/Demo/loginPage";
import HomePage from "@pages/Demo/homePage";
import CartPage from "@e2e/pages/Demo/cartPage";
import CheckOutPage from "@e2e/pages/Demo/checkOutPage";
// ############ DELETE THESE IMPORTS. THESE ARE ONLY FOR THE DEMO ###############

interface PageFixtures {
  // ############ DELETE.ADDED ONLY FOR THE DEMO ##############
  loginPage: LoginPage;
  homePage: HomePage;
  cartPage: CartPage;
  checkOutPage: CheckOutPage;
  // ############ DELETE.ADDED ONLY FOR THE DEMO ##############

}

export const test = base.extend<PageFixtures>({

  // ############ DELETE.ADDED ONLY FOR THE DEMO ##############
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
    // ############ DELETE.ADDED ONLY FOR THE DEMO ##############

});

export { expect } from "@playwright/test";
