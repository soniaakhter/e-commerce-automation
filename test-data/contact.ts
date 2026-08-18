import type { ContactDetails } from '../pages/ContactUsPage';

export function createContactData(): ContactDetails {
  return {
    name: 'Playwright Contact User',
    email: `playwright.contact.${Date.now()}@example.com`,
    subject: 'Automated contact form test',
    message: 'This is safe, non-sensitive test content submitted by Playwright.',
  };
}

export const contactValidationData = {
  malformedEmail: 'not-an-email',
  confirmationDialog: 'Press OK to proceed!',
  successMessage: 'Success! Your details have been submitted successfully.',
  uploadFileName: 'contact-test.txt',
} as const;
