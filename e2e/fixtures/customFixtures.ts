import { test as base } from "@playwright/test";
import LoginPage from "@pages/loginPage";
import HomePage from "@pages/homePage";
import AddEmployeePage from "@pages/addEmployeePage";
import CartPage from "@e2e/pages/cartPage";
import CheckOutPage from "@e2e/pages/checkOutPage";

interface PageFixtures {
  loginPage: LoginPage;
  homePage: HomePage;
  addEmployeePage: AddEmployeePage;
  cartPage: CartPage;
  checkOutPage: CheckOutPage;
}

export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  addEmployeePage: async ({ page }, use) => {
    await use(new AddEmployeePage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkOutPage: async ({ page }, use) => {
    await use(new CheckOutPage(page));
  },
});

export { expect } from "@playwright/test";
