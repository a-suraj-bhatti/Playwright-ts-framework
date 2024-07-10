import { Locator, Page } from "@playwright/test";
import { step } from "@e2e/libs/custom-decorators";

class HomePage {
  constructor(private readonly page: Page) {}

  readonly addTocartButton = (productName: string): Locator =>
    this.page
      .locator(".inventory_list div")
      .filter({ hasText: productName })
      .getByRole("button", { name: "Add to cart" });

  readonly product = (productName: string): Locator =>
    this.page.getByRole("link", { name: productName }).nth(1);

  @step("Product was added to the cart")
  async addProductToCart(productName: string) {
    await this.addTocartButton(productName).click();
  }
}

export default HomePage;
