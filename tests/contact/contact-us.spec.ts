import path from 'node:path';
import { test, expect } from '../../fixtures/test-fixtures';
import { ContactUsPage } from '../../pages/ContactUsPage';
import { contactValidationData, createContactData } from '../../test-data/contact';

const uploadFilePath = path.resolve(
  __dirname,
  '../../test-data/files',
  contactValidationData.uploadFileName,
);

test.describe('Contact Us', () => {
  let contactPage: ContactUsPage;

  test.beforeEach(async ({ page }) => {
    contactPage = new ContactUsPage(page);
    await contactPage.open();
  });

  test('@smoke User can submit Contact Us with a safe file and return Home', async ({ page }) => {
    const contact = createContactData();
    await expect(page).toHaveURL(/\/contact_us$/);
    await expect(contactPage.heading).toBeVisible();
    await expect(contactPage.form).toBeVisible();
    await expect(contactPage.nameInput).toBeVisible();
    await expect(contactPage.emailInput).toBeVisible();
    await expect(contactPage.subjectInput).toBeVisible();
    await expect(contactPage.messageInput).toBeVisible();
    await expect(contactPage.uploadInput).toBeVisible();

    await contactPage.fillForm(contact);
    await contactPage.uploadFile(uploadFilePath);
    await expect(contactPage.uploadInput).toHaveValue(
      new RegExp(`${contactValidationData.uploadFileName}$`),
    );
    const dialogMessage = await contactPage.submitAndAcceptConfirmation();

    expect(dialogMessage).toBe(contactValidationData.confirmationDialog);
    await expect(contactPage.successMessage).toHaveText(contactValidationData.successMessage);
    await expect(contactPage.successHomeLink).toBeVisible();
    await contactPage.returnHome();
    await expect(page).toHaveURL((url) => url.pathname === '/');
  });

  test('@regression Name, subject, message, and upload are optional', async () => {
    const contact = createContactData();
    await contactPage.emailInput.fill(contact.email);

    const dialogMessage = await contactPage.submitAndAcceptConfirmation();

    expect(dialogMessage).toBe(contactValidationData.confirmationDialog);
    await expect(contactPage.successMessage).toHaveText(contactValidationData.successMessage);
  });

  test('@negative Contact Us requires an email address', async () => {
    const contact = createContactData();
    await contactPage.fillForm({ ...contact, email: '' });
    await contactPage.submit();

    const validation = await contactPage.getEmailValidationState();
    expect(validation.valid).toBe(false);
    expect(validation.valueMissing).toBe(true);
    await expectNativeValidationBlockedSubmission(contactPage);
  });

  test('@negative Empty Contact Us form is blocked by required email validation', async () => {
    await contactPage.submit();

    const validation = await contactPage.getEmailValidationState();
    expect(validation.valueMissing).toBe(true);
    await expectNativeValidationBlockedSubmission(contactPage);
  });

  test('@negative Contact Us rejects a malformed email through native validation', async () => {
    const contact = createContactData();
    await contactPage.fillForm({ ...contact, email: contactValidationData.malformedEmail });
    await contactPage.submit();

    const validation = await contactPage.getEmailValidationState();
    expect(validation.valid).toBe(false);
    expect(validation.invalidEmailFormat).toBe(true);
    await expectNativeValidationBlockedSubmission(contactPage);
  });
});

async function expectNativeValidationBlockedSubmission(contactPage: ContactUsPage): Promise<void> {
  await expect(contactPage.page).toHaveURL(/\/contact_us$/);
  await expect(contactPage.successMessage).not.toBeVisible();
}
