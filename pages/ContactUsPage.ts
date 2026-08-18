import type { Locator, Page } from '@playwright/test';

export type ContactDetails = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export class ContactUsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly form: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly subjectInput: Locator;
  readonly messageInput: Locator;
  readonly uploadInput: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;
  readonly successHomeLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.form = page.locator('#contact-us-form');
    this.heading = page.getByRole('heading', { name: 'Get In Touch' });
    this.nameInput = this.form.locator('[data-qa="name"]');
    this.emailInput = this.form.locator('[data-qa="email"]');
    this.subjectInput = this.form.locator('[data-qa="subject"]');
    this.messageInput = this.form.locator('[data-qa="message"]');
    this.uploadInput = this.form.locator('input[name="upload_file"]');
    this.submitButton = this.form.locator('[data-qa="submit-button"]');
    this.successMessage = page.locator('.status.alert-success');
    this.successHomeLink = page.locator('.contact-form a.btn-success[href="/"]');
  }

  async open(): Promise<void> {
    await this.page.goto('/contact_us');
  }

  async fillForm(details: ContactDetails): Promise<void> {
    await this.nameInput.fill(details.name);
    await this.emailInput.fill(details.email);
    await this.subjectInput.fill(details.subject);
    await this.messageInput.fill(details.message);
  }

  async uploadFile(filePath: string): Promise<void> {
    await this.uploadInput.setInputFiles(filePath);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async submitAndAcceptConfirmation(): Promise<string> {
    const dialogPromise = this.page.waitForEvent('dialog');
    const clickPromise = this.submitButton.click();
    const dialog = await dialogPromise;
    const message = dialog.message();
    await dialog.accept();
    await clickPromise;
    return message;
  }

  async returnHome(): Promise<void> {
    await this.successHomeLink.click();
  }

  async getEmailValidationState(): Promise<{
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
