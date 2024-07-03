import { Page } from "@playwright/test";
import { step } from "@e2e/libs/custom-decorators";
class LeftMenuComponent {
  constructor(private readonly page: Page) {}

  private readonly menu = (menuName: string) => this.page.getByRole("link", { name: menuName });

  @step("This selects the left menuItem")
  async selectLeftMenuItem(menuItem: string) {
    await this.menu(menuItem).click();
  }
}

export default LeftMenuComponent;
