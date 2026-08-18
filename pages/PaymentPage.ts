import type { Locator, Page } from '@playwright/test';

export type PaymentDetails = {
  cardName: string;
  cardNumber: string;
  cvc: string;
  expiryMonth: string;
  expiryYear: string;
};

export type PaymentFieldName = keyof PaymentDetails;

export class PaymentPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly cardNameInput: Locator;
  readonly cardNumberInput: Locator;
  readonly cvcInput: Locator;
  readonly expiryMonthInput: Locator;
  readonly expiryYearInput: Locator;
  readonly payButton: Locator;
  readonly orderPlacedHeading: Locator;
  readonly confirmationMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Payment' });
    this.cardNameInput = page.locator('[data-qa="name-on-card"]');
    this.cardNumberInput = page.locator('[data-qa="card-number"]');
    this.cvcInput = page.locator('[data-qa="cvc"]');
    this.expiryMonthInput = page.locator('[data-qa="expiry-month"]');
    this.expiryYearInput = page.locator('[data-qa="expiry-year"]');
    this.payButton = page.locator('[data-qa="pay-button"]');
    this.orderPlacedHeading = page.locator('[data-qa="order-placed"]');
    this.confirmationMessage = page.getByText(
      'Congratulations! Your order has been confirmed!',
      { exact: true },
    );
  }

  field(fieldName: PaymentFieldName): Locator {
    return {
      cardName: this.cardNameInput,
      cardNumber: this.cardNumberInput,
      cvc: this.cvcInput,
      expiryMonth: this.expiryMonthInput,
      expiryYear: this.expiryYearInput,
    }[fieldName];
  }

  async fillPayment(details: PaymentDetails): Promise<void> {
    await this.cardNameInput.fill(details.cardName);
    await this.cardNumberInput.fill(details.cardNumber);
    await this.cvcInput.fill(details.cvc);
    await this.expiryMonthInput.fill(details.expiryMonth);
    await this.expiryYearInput.fill(details.expiryYear);
  }

  async submitPayment(): Promise<void> {
    await this.payButton.click();
  }

  async getValidationState(fieldName: PaymentFieldName): Promise<{
    valid: boolean;
    valueMissing: boolean;
    patternMismatch: boolean;
  }> {
    return this.field(fieldName).evaluate((input: HTMLInputElement) => ({
      valid: input.checkValidity(),
      valueMissing: input.validity.valueMissing,
      patternMismatch: input.validity.patternMismatch,
    }));
  }
}
