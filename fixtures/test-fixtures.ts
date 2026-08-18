import { test as base, expect } from '@playwright/test';
import { environment } from '../config/environment';
import { LoginPage } from '../pages/LoginPage';
import type { RegistrationDetails } from '../pages/SignupPage';
import { registrationToApiAccount } from '../test-data/api/account-data';
import { createRegistrationData } from '../test-data/registration-data';
import {
  AutomationExerciseApi,
  parseApiBody,
  type ApiMessageBody,
} from '../utils/api/automation-exercise-api';

type TestFixtures = {
  configuredBaseUrl: string;
  registeredAccount: RegistrationDetails;
};

export const test = base.extend<TestFixtures>({
  configuredBaseUrl: async ({}, use) => {
    await use(environment.baseUrl);
  },
  registeredAccount: async ({ page, playwright }, use, testInfo) => {
    const account = createRegistrationData();
    const apiAccount = registrationToApiAccount(account);
    const apiRequest = await playwright.request.newContext({ baseURL: environment.apiBaseUrl });
    const api = new AutomationExerciseApi(apiRequest);
    let accountCreated = false;

    try {
      const created = await parseApiBody<ApiMessageBody>(await api.createAccount(apiAccount));
      if (created.responseCode !== 201) {
        throw new Error(`Unable to create fixture account: ${created.responseCode} ${created.message}`);
      }
      accountCreated = true;

      const loginPage = new LoginPage(page);
      await loginPage.open();
      await loginPage.login(account.email, account.password);
      await loginPage.loggedInUserIndicator.waitFor();

      await use(account);
    } finally {
      if (accountCreated) {
        const cleanup = await api
          .deleteAccount(account.email, account.password)
          .then((response) => parseApiBody<ApiMessageBody>(response))
          .catch((error: unknown) => ({ responseCode: 0, message: String(error) }));

        if (cleanup.responseCode !== 200 && cleanup.responseCode !== 404) {
          await testInfo.attach('fixture-account-cleanup-error', {
            body: JSON.stringify(cleanup),
            contentType: 'application/json',
          });
          if (testInfo.status === testInfo.expectedStatus) {
            throw new Error(`Fixture account cleanup failed: ${cleanup.responseCode}`);
          }
        }
      }
      await apiRequest.dispose();
    }
  },
});

export { expect };
