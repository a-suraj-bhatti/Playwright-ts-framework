import step from "@e2e/libs/steps";
import { Locator, Page } from "@playwright/test";
class CheckOutPage {
  constructor(private readonly page: Page) {
    this.page = page;
  }

  readonly firstNameTextBox: Locator = this.page.getByPlaceholder("First Name");
  readonly lastNameTextBox: Locator = this.page.getByPlaceholder("Last Name");
  readonly zipCodeTextBox: Locator = this.page.getByPlaceholder("Zip/Postal Code");
  readonly continueButton: Locator = this.page.getByRole("button", { name: "Continue" });
  readonly finishButton: Locator = this.page.getByRole("button", { name: "Finish" });
  readonly itemTotal: Locator = this.page.locator(".summary_subtotal_label");

  @step("Customer details were entered")
  async addCustomerDetails(customerDetails) {
    await this.firstNameTextBox.fill(customerDetails.firstName);
    await this.lastNameTextBox.fill(customerDetails.lastName);
    await this.zipCodeTextBox.fill(customerDetails.zipCode);
  }

  @step("Continue button was clicked on the checkoutpage")
  async clickContinueButton(): Promise<void> {
    await this.continueButton.click();
  }

  async clickFinishButton(): Promise<void> {
    await this.finishButton.click();
  }
  
  async getItemTotal(): Promise<string> {
    return await this.itemTotal.textContent();
  }
}
export default CheckOutPage;
