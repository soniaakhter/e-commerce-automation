import { environment } from '../../config/environment';
import { test, expect } from '../../fixtures/test-fixtures';
import { SignupPage } from '../../pages/SignupPage';
import {
  createRegistrationData,
  generateUniqueEmail,
  invalidSignupData,
} from '../../test-data/registration-data';
import {
  AutomationExerciseApi,
  parseApiBody,
  type ApiMessageBody,
} from '../../utils/api/automation-exercise-api';

test.describe('Registration / Signup', () => {
  let signupPage: SignupPage;

  test.beforeEach(async ({ page }) => {
    signupPage = new SignupPage(page);
    await signupPage.open();
  });

  test('@smoke Signup / Login page opens successfully', async ({ page }) => {
    await expect(page).toHaveURL(/\/login$/);
    await expect(signupPage.signupHeading).toBeVisible();
  });

  test('@smoke Signup form is visible', async () => {
    await expect(signupPage.signupHeading).toHaveText('New User Signup!');
    await expect(signupPage.signupNameInput).toBeVisible();
    await expect(signupPage.signupEmailInput).toBeVisible();
    await expect(signupPage.signupButton).toBeEnabled();
  });

  test('@smoke User can register with valid information and delete the account', async ({
    playwright,
  }, testInfo) => {
    const account = createRegistrationData();
    let registrationFailure: unknown;
    let accountMayExist = false;
    let accountDeleted = false;

    try {
      await signupPage.submitInitialSignup(account.name, account.email);
      await expect(signupPage.accountInformationHeading).toBeVisible();
      await expect(signupPage.accountNameInput).toHaveValue(account.name);
      await expect(signupPage.accountEmailInput).toHaveValue(account.email);

      await signupPage.fillAccountInformation(account);
      await signupPage.createAccount();
      accountMayExist = true;

      await expect(signupPage.accountCreatedHeading).toBeVisible();
      await expect(signupPage.accountCreatedHeading).toHaveText('Account Created!');
      await signupPage.continueAfterConfirmation();
      await expect(signupPage.loggedInUserIndicator).toBeVisible();
      await expect(signupPage.loggedInUserIndicator).toContainText(account.name);
    } catch (error) {
      registrationFailure = error;
    }

    if (await signupPage.deleteAccountLink.isVisible().catch(() => false)) {
      try {
        await signupPage.deleteAccount();
        await expect(signupPage.accountDeletedHeading).toBeVisible();
        await expect(signupPage.accountDeletedHeading).toHaveText('Account Deleted!');
        accountDeleted = true;
      } catch (cleanupError) {
        if (!registrationFailure) {
          registrationFailure = cleanupError;
        } else {
          await testInfo.attach('account-cleanup-error', {
            body: String(cleanupError),
            contentType: 'text/plain',
          });
        }
      }
    }

    if (accountMayExist && !accountDeleted) {
      const apiRequest = await playwright.request.newContext({ baseURL: environment.apiBaseUrl });
      try {
        const cleanup = await parseApiBody<ApiMessageBody>(
          await new AutomationExerciseApi(apiRequest).deleteAccount(account.email, account.password),
        );
        if (cleanup.responseCode !== 200 && cleanup.responseCode !== 404) {
          const cleanupError = new Error(`Registration cleanup failed: ${cleanup.responseCode}`);
          if (!registrationFailure) throw cleanupError;
          await testInfo.attach('registration-api-cleanup-error', {
            body: JSON.stringify(cleanup),
            contentType: 'application/json',
          });
        }
      } finally {
        await apiRequest.dispose();
      }
    }

    if (registrationFailure) throw registrationFailure;
  });

  test('@regression @negative User cannot register with an existing email', async () => {
    test.skip(
      !environment.testUserEmail,
      'Set TEST_USER_EMAIL to run duplicate-email registration coverage.',
    );

    await signupPage.submitInitialSignup(invalidSignupData.name, environment.testUserEmail);

    await expect(signupPage.duplicateEmailError).toBeVisible();
    await expect(signupPage.duplicateEmailError).toHaveText('Email Address already exist!');
    await expect(signupPage.accountInformationHeading).toHaveCount(0);
  });

  test('@negative Signup requires a name', async () => {
    await signupPage.submitInitialSignup('', generateUniqueEmail());

    const validation = await signupPage.getNameValidationState();
    expect(validation.valid).toBe(false);
    expect(validation.valueMissing).toBe(true);
    await expectNativeValidationBlockedSubmission(signupPage);
  });

  test('@negative Signup requires an email address', async () => {
    await signupPage.submitInitialSignup(invalidSignupData.name, '');

    const validation = await signupPage.getEmailValidationState();
    expect(validation.valid).toBe(false);
    expect(validation.valueMissing).toBe(true);
    await expectNativeValidationBlockedSubmission(signupPage);
  });

  test('@negative Signup requires both name and email', async () => {
    await signupPage.submitInitialSignup('', '');

    const nameValidation = await signupPage.getNameValidationState();
    const emailValidation = await signupPage.getEmailValidationState();
    expect(nameValidation.valueMissing).toBe(true);
    expect(emailValidation.valueMissing).toBe(true);
    await expectNativeValidationBlockedSubmission(signupPage);
  });

  test('@negative Signup requires a valid email address', async () => {
    await signupPage.submitInitialSignup(
      invalidSignupData.name,
      invalidSignupData.malformedEmail,
    );

    const validation = await signupPage.getEmailValidationState();
    expect(validation.valid).toBe(false);
    expect(validation.invalidEmailFormat).toBe(true);
    await expectNativeValidationBlockedSubmission(signupPage);
  });
});

async function expectNativeValidationBlockedSubmission(signupPage: SignupPage): Promise<void> {
  await expect(signupPage.page).toHaveURL(/\/login$/);
  await expect(signupPage.accountInformationHeading).toHaveCount(0);
  await expect(signupPage.duplicateEmailError).toHaveCount(0);
}
