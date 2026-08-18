import type { Locator, Page } from '@playwright/test';

export class SubscriptionComponent {
  readonly page: Page;
  readonly footer: Locator;
  readonly heading: Locator;
  readonly emailInput: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.footer = page.locator('#footer');
    this.heading = this.footer.getByRole('heading', { name: 'Subscription' });
    this.emailInput = this.footer.getByPlaceholder('Your email address');
    this.submitButton = this.footer.locator('#subscribe');
    this.successMessage = this.footer.locator('#success-subscribe');
  }

  async subscribe(email: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.submitButton.click();
  }

  async getValidationState(): Promise<{
    valid: boolean;
    valueMissing: boolean;
    invalidEmailFormat: boolean;
  }> {
    return this.emailInput.evaluate((input: HTMLInputElement) => ({
      valid: input.checkValidity(),
      valueMissing: input.validity.valueMissing,
      invalidEmailFormat: input.validity.typeMismatch,
    }));
  }
}
