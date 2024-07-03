import { Page } from "@playwright/test";
import { Env } from "@e2e/environments/env";
import { step } from "@e2e/libs/custom-decorators";
import HomePage from "./homePage";

class LoginPage {
  constructor(private readonly page: Page) {}

  private readonly userNameTextBox = this.page.getByPlaceholder("Username");
  private readonly passwordTextBox = this.page.getByPlaceholder("Password");
  private readonly loginButton = this.page.getByRole("button", {
    name: "Login",
  });

  @step("This opens the site")
  async visit() {
    await this.page.goto(Env.BASE_URL);
  }

  @step("This logs into the site")
  async login() {
    await this.userNameTextBox.fill(Env.USERNAME);
    await this.passwordTextBox.fill(Env.PASSWORD);
    await this.loginButton.click();
    return new HomePage(this.page);
  }
}

export default LoginPage;
