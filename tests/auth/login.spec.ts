import { environment } from '../../config/environment';
import { test, expect } from '../../fixtures/test-fixtures';
import { LoginPage } from '../../pages/LoginPage';
import { loginData } from '../../test-data/login-data';

const invalidCredentialsMessage = 'Your email or password is incorrect!';
const hasValidUserCredentials = Boolean(
  environment.testUserEmail && environment.testUserPassword,
);

test.describe('Login and Logout', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.open();

    await expect(loginPage.heading).toBeVisible();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeEnabled();
  });

  test.describe('Successful authentication', () => {
    test('@smoke User can login with valid credentials', async ({ page }) => {
      test.skip(
        !hasValidUserCredentials,
        'Set TEST_USER_EMAIL and TEST_USER_PASSWORD to run valid-login coverage.',
      );

      await loginPage.login(environment.testUserEmail, environment.testUserPassword);

      await expect(loginPage.loggedInUserIndicator).toBeVisible();
      await expect(loginPage.loggedInUserIndicator).toContainText('Logged in as');
      await expect(loginPage.logoutLink).toBeVisible();
      await expect(page.getByRole('link', { name: 'Signup / Login' })).toHaveCount(0);
    });

    test('@smoke User can logout after a successful login', async ({ page }) => {
      test.skip(
        !hasValidUserCredentials,
        'Set TEST_USER_EMAIL and TEST_USER_PASSWORD to run logout coverage.',
      );

      await loginPage.login(environment.testUserEmail, environment.testUserPassword);
      await expect(loginPage.loggedInUserIndicator).toBeVisible();

      await loginPage.logout();

      await expect(page).toHaveURL(/\/login$/);
      await expect(loginPage.heading).toBeVisible();
      await expect(loginPage.loggedInUserIndicator).toHaveCount(0);
      await expect(loginPage.logoutLink).toHaveCount(0);
      await expect(page.getByRole('link', { name: 'Signup / Login' })).toBeVisible();
    });
  });

  test.describe('Invalid credentials', () => {
    test('@regression @negative User cannot login with a valid email and invalid password', async () => {
      test.skip(
        !environment.testUserEmail,
        'Set TEST_USER_EMAIL to run the valid-email/invalid-password scenario.',
      );

      await loginPage.login(environment.testUserEmail, loginData.invalidPassword);

      await expectInvalidCredentials(loginPage);
    });

    test('@regression @negative User cannot login with an invalid email and valid-looking password', async () => {
      await loginPage.login(loginData.unknownEmail, loginData.validLookingPassword);

      await expectInvalidCredentials(loginPage);
    });

    test('@regression @negative User cannot login with an invalid email and invalid password', async () => {
      await loginPage.login(loginData.unknownEmail, loginData.invalidPassword);

      await expectInvalidCredentials(loginPage);
    });
  });

  test.describe('Required field validation', () => {
    test('@negative User cannot submit login with an empty email', async () => {
      await loginPage.enterPassword(loginData.validLookingPassword);
      await loginPage.submit();

      const emailValidation = await loginPage.getEmailValidationState();
      expect(emailValidation.valid).toBe(false);
      expect(emailValidation.valueMissing).toBe(true);
      await expectNativeValidationBlockedSubmission(loginPage);
    });

    test('@negative User cannot submit login with an empty password', async () => {
      await loginPage.enterEmail(loginData.unknownEmail);
      await loginPage.submit();

      const passwordValidation = await loginPage.getPasswordValidationState();
      expect(passwordValidation.valid).toBe(false);
      expect(passwordValidation.valueMissing).toBe(true);
      await expectNativeValidationBlockedSubmission(loginPage);
    });

    test('@negative User cannot submit login with both email and password empty', async () => {
      await loginPage.submit();

      const emailValidation = await loginPage.getEmailValidationState();
      const passwordValidation = await loginPage.getPasswordValidationState();
      expect(emailValidation.valueMissing).toBe(true);
      expect(passwordValidation.valueMissing).toBe(true);
      await expectNativeValidationBlockedSubmission(loginPage);
    });

    test('@negative User cannot submit login with a malformed email', async () => {
      await loginPage.enterEmail(loginData.malformedEmail);
      await loginPage.enterPassword(loginData.validLookingPassword);
      await loginPage.submit();

      const emailValidation = await loginPage.getEmailValidationState();
      expect(emailValidation.valid).toBe(false);
      expect(emailValidation.invalidEmailFormat).toBe(true);
      await expectNativeValidationBlockedSubmission(loginPage);
    });
  });
});

async function expectInvalidCredentials(loginPage: LoginPage): Promise<void> {
  await expect(loginPage.loginError).toBeVisible();
  await expect(loginPage.loginError).toHaveText(invalidCredentialsMessage);
  await expect(loginPage.loggedInUserIndicator).toHaveCount(0);
}

async function expectNativeValidationBlockedSubmission(loginPage: LoginPage): Promise<void> {
  await expect(loginPage.page).toHaveURL(/\/login$/);
  await expect(loginPage.loginError).toHaveCount(0);
}
