import type { Locator, Page } from '@playwright/test';

export type FieldValidationState = {
  valid: boolean;
  valueMissing: boolean;
  invalidEmailFormat: boolean;
};

export class LoginPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly loginError: Locator;
  readonly loggedInUserIndicator: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    this.page = page;

    const loginForm = page.locator('.login-form');
    this.heading = loginForm.getByRole('heading', { name: 'Login to your account' });
    this.emailInput = loginForm.getByPlaceholder('Email Address', { exact: true });
    this.passwordInput = loginForm.getByPlaceholder('Password', { exact: true });
    this.loginButton = loginForm.getByRole('button', { name: 'Login' });
    this.loginError = loginForm.getByText('Your email or password is incorrect!', { exact: true });
    this.loggedInUserIndicator = page.locator('li').filter({ hasText: 'Logged in as' });
    this.logoutLink = page.getByRole('link', { name: 'Logout' });
  }

  async open(): Promise<void> {
    await this.page.goto('/login');
  }

  async enterEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async enterPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async submit(): Promise<void> {
    await this.loginButton.click();
  }

  async login(email: string, password: string): Promise<void> {
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.submit();
  }

  async logout(): Promise<void> {
    await this.logoutLink.click();
  }

  async getEmailValidationState(): Promise<FieldValidationState> {
    return this.getValidationState(this.emailInput);
  }

  async getPasswordValidationState(): Promise<FieldValidationState> {
    return this.getValidationState(this.passwordInput);
  }

  private async getValidationState(field: Locator): Promise<FieldValidationState> {
    return field.evaluate((input: HTMLInputElement) => ({
      valid: input.checkValidity(),
      valueMissing: input.validity.valueMissing,
      invalidEmailFormat: input.validity.typeMismatch,
    }));
  }
}
