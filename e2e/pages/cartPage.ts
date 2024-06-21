import step from "@e2e/libs/steps";
import { Locator, Page } from "@playwright/test";
class CartPage {
  constructor(private readonly page: Page) {
    this.page = page;
  }

  readonly cartButton: Locator = this.page.locator(".shopping_cart_link");
  readonly checkOutButton: Locator = this.page.getByRole("button", { name: "Checkout" });

  @step("Cart button is clicked")
  async goToCart() {
    await this.cartButton.click();
  }

  @step("Checkout button was clicked")
  async checkout() {
    await this.checkOutButton.click();
  }
}

export default CartPage;
