import { Locator, Page } from "@playwright/test";
import LeftMenuComponent from "@e2e/pages/Example/components/leftMenuComponent";
import TopMenuComponent from "@e2e/pages/Example/components/topMenuComponent";
import step from "@e2e/libs/steps";

class HomePage {
  //left menu component and top menu component

  private leftMenuComponent: LeftMenuComponent;
  private topMenuComponent: TopMenuComponent;

  constructor(private readonly page: Page) {
    this.leftMenuComponent = new LeftMenuComponent(page);
    this.topMenuComponent = new TopMenuComponent(page);
  }

  readonly addTocartButton = (productName: string): Locator =>
    this.page
      .locator(".inventory_list div")
      .filter({ hasText: productName })
      .getByRole("button", { name: "Add to cart" });

  readonly productLink = (productName: string): Locator =>
    this.page.getByRole("link", { name: productName }).nth(1);

  @step("Product was added to the cart")
  async addProductToCart(productName: string) {
    await this.addTocartButton(productName).click();
  }
}

export default HomePage;
