import type { Locator, Page } from '@playwright/test';

export type SignupValidationState = {
  valid: boolean;
  valueMissing: boolean;
  invalidEmailFormat: boolean;
};

export type RegistrationDetails = {
  title: 'Mr' | 'Mrs';
  name: string;
  email: string;
  password: string;
  birthDate: { day: string; month: string; year: string };
  newsletter: boolean;
  specialOffers: boolean;
  firstName: string;
  lastName: string;
  company: string;
  address: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
  mobileNumber: string;
};

export class SignupPage {
  readonly page: Page;
  readonly signupHeading: Locator;
  readonly signupNameInput: Locator;
  readonly signupEmailInput: Locator;
  readonly signupButton: Locator;
  readonly duplicateEmailError: Locator;
  readonly accountInformationHeading: Locator;
  readonly accountNameInput: Locator;
  readonly accountEmailInput: Locator;
  readonly accountCreatedHeading: Locator;
  readonly accountDeletedHeading: Locator;
  readonly loggedInUserIndicator: Locator;
  readonly deleteAccountLink: Locator;

  constructor(page: Page) {
    this.page = page;
    const signupForm = page.locator('.signup-form');

    this.signupHeading = signupForm.getByRole('heading', { name: 'New User Signup!' });
    this.signupNameInput = signupForm.getByPlaceholder('Name', { exact: true });
    this.signupEmailInput = signupForm.getByPlaceholder('Email Address', { exact: true });
    this.signupButton = signupForm.getByRole('button', { name: 'Signup' });
    this.duplicateEmailError = signupForm.getByText('Email Address already exist!', { exact: true });
    this.accountInformationHeading = page.getByText('Enter Account Information', { exact: true });
    this.accountNameInput = page.locator('[data-qa="name"]');
    this.accountEmailInput = page.locator('[data-qa="email"]');
    this.accountCreatedHeading = page.locator('[data-qa="account-created"]');
    this.accountDeletedHeading = page.locator('[data-qa="account-deleted"]');
    this.loggedInUserIndicator = page.locator('li').filter({ hasText: 'Logged in as' });
    this.deleteAccountLink = page.getByRole('link', { name: 'Delete Account' });
  }

  async open(): Promise<void> {
    await this.page.goto('/login');
  }

  async submitInitialSignup(name: string, email: string): Promise<void> {
    await this.signupNameInput.fill(name);
    await this.signupEmailInput.fill(email);
    await this.signupButton.click();
  }

  async fillAccountInformation(details: RegistrationDetails): Promise<void> {
    await this.page.getByLabel(details.title === 'Mr' ? 'Mr.' : 'Mrs.').check();
    await this.page.locator('[data-qa="password"]').fill(details.password);
    await this.page.locator('[data-qa="days"]').selectOption(details.birthDate.day);
    await this.page.locator('[data-qa="months"]').selectOption(details.birthDate.month);
    await this.page.locator('[data-qa="years"]').selectOption(details.birthDate.year);

    if (details.newsletter) await this.page.getByLabel('Sign up for our newsletter!').check();
    if (details.specialOffers) await this.page.getByLabel('Receive special offers from our partners!').check();

    await this.page.locator('[data-qa="first_name"]').fill(details.firstName);
    await this.page.locator('[data-qa="last_name"]').fill(details.lastName);
    await this.page.locator('[data-qa="company"]').fill(details.company);
    await this.page.locator('[data-qa="address"]').fill(details.address);
    await this.page.locator('[data-qa="country"]').selectOption({ label: details.country });
    await this.page.locator('[data-qa="state"]').fill(details.state);
    await this.page.locator('[data-qa="city"]').fill(details.city);
    await this.page.locator('[data-qa="zipcode"]').fill(details.zipcode);
    await this.page.locator('[data-qa="mobile_number"]').fill(details.mobileNumber);
  }

  async createAccount(): Promise<void> {
    await this.page.locator('[data-qa="create-account"]').click();
  }

  async continueAfterConfirmation(): Promise<void> {
    await this.page.locator('[data-qa="continue-button"]').click();
  }

  async deleteAccount(): Promise<void> {
    const href = await this.deleteAccountLink.getAttribute('href');
    if (!href) throw new Error('Delete Account link is missing its destination');

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const response = await this.page.goto(href);
      if (!response || response.status() < 500) return;
    }
  }

  async getNameValidationState(): Promise<SignupValidationState> {
    return this.getValidationState(this.signupNameInput);
  }

  async getEmailValidationState(): Promise<SignupValidationState> {
    return this.getValidationState(this.signupEmailInput);
  }

  private async getValidationState(field: Locator): Promise<SignupValidationState> {
    return field.evaluate((input: HTMLInputElement) => ({
      valid: input.checkValidity(),
      valueMissing: input.validity.valueMissing,
      invalidEmailFormat: input.validity.typeMismatch,
    }));
  }
}
