import { Page } from "@playwright/test";
import HomePage from "./homePage";
import { Env } from "@e2e/frameworkConfig/env";
import step from "@e2e/libs/steps";

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
  async login(username: string, password: string) {
    await this.userNameTextBox.fill(username);
    await this.passwordTextBox.fill(password);
    await this.loginButton.click();
    return new HomePage(this.page);
  }
}

export default LoginPage;
