/**
 * Page Object for the login page.
 */
export class LoginPage {
  constructor(page) {
    this.page = page;
    this.userEmailInput = this.page.getByLabel('Email');
    this.passwordInput = this.page.getByRole('textbox', {
      name: 'Text field for the login password',
    });
    this.loginButton = this.page.getByRole('button', {
      name: 'Login',
      exact: true,
    });
  }

  async fillLoginForm(email, password) {
    await this.userEmailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async clickLogin() {
    await this.loginButton.click();
  }

  async login(email, password) {
    await this.fillLoginForm(email, password);
    await this.clickLogin();
  }

  async isLoginButtonDisabled() {
    return this.loginButton.isDisabled();
  }
}
