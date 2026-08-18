import { test, expect } from '../../fixtures/test-fixtures';
import { createApiAccountData, invalidAccountData } from '../../test-data/api/account-data';
import {
  AutomationExerciseApi,
  parseApiBody,
  type ApiMessageBody,
} from '../../utils/api/automation-exercise-api';

type UserDetailsBody = {
  responseCode: number;
  user: {
    id: number;
    name: string;
    email: string;
    first_name: string;
    last_name: string;
    address1: string;
    country: string;
  };
};

test.describe('Account API', () => {
  test('@api @smoke Account can be created, retrieved, updated, and deleted', async ({
    request,
  }, testInfo) => {
    const api = new AutomationExerciseApi(request);
    const account = createApiAccountData();
    let deleted = false;

    try {
      const created = await parseApiBody<ApiMessageBody>(await api.createAccount(account));
      expect(created).toEqual({ responseCode: 201, message: 'User created!' });

      const initial = await parseApiBody<UserDetailsBody>(await api.getUserDetails(account.email));
      expect(initial.responseCode).toBe(200);
      expect(initial.user.id).toEqual(expect.any(Number));
      expect(initial.user.email).toBe(account.email);
      expect(initial.user.first_name).toBe(account.firstname);
      expect(initial.user.address1).toBe(account.address1);

      const updatedAccount = { ...account, firstname: 'UpdatedPlaywright' };
      const updated = await parseApiBody<ApiMessageBody>(await api.updateAccount(updatedAccount));
      expect(updated).toEqual({ responseCode: 200, message: 'User updated!' });
      const updatedDetails = await parseApiBody<UserDetailsBody>(
        await api.getUserDetails(account.email),
      );
      expect(updatedDetails.user.first_name).toBe(updatedAccount.firstname);

      const removed = await parseApiBody<ApiMessageBody>(
        await api.deleteAccount(account.email, account.password),
      );
      expect(removed).toEqual({ responseCode: 200, message: 'Account deleted!' });
      deleted = true;
    } finally {
      if (!deleted) {
        const cleanup = await api
          .deleteAccount(account.email, account.password)
          .then((response) => parseApiBody<ApiMessageBody>(response))
          .catch((error: unknown) => ({ responseCode: 0, message: String(error) }));
        if (cleanup.responseCode !== 200 && cleanup.responseCode !== 404) {
          await testInfo.attach('api-account-cleanup-error', {
            body: JSON.stringify(cleanup),
            contentType: 'application/json',
          });
        }
      }
    }
  });

  test('@api @negative Duplicate account email is rejected', async ({ request }, testInfo) => {
    const api = new AutomationExerciseApi(request);
    const account = createApiAccountData();
    let accountCreated = false;
    let testFailure: unknown;

    try {
      const created = await parseApiBody<ApiMessageBody>(await api.createAccount(account));
      accountCreated = created.responseCode === 201;
      expect(created).toEqual({
        responseCode: 201,
        message: 'User created!',
      });
      expect(await parseApiBody<ApiMessageBody>(await api.createAccount(account))).toEqual({
        responseCode: 400,
        message: 'Email already exists!',
      });
    } catch (error) {
      testFailure = error;
    }

    if (accountCreated) {
      const cleanup = await api
        .deleteAccount(account.email, account.password)
        .then((response) => parseApiBody<ApiMessageBody>(response))
        .catch((error: unknown) => ({ responseCode: 0, message: String(error) }));
      if (cleanup.responseCode !== 200 && cleanup.responseCode !== 404) {
        if (!testFailure) throw new Error(`Duplicate-account cleanup failed: ${cleanup.responseCode}`);
        await testInfo.attach('duplicate-account-cleanup-error', {
          body: JSON.stringify(cleanup),
          contentType: 'application/json',
        });
      }
    }

    if (testFailure) throw testFailure;
  });

  test('@api @negative Account creation reports the first missing required parameter', async ({ request }) => {
    const body = await parseApiBody<ApiMessageBody>(
      await new AutomationExerciseApi(request).createAccount({}),
    );
    expect(body).toEqual({
      responseCode: 400,
      message: 'Bad request, name parameter is missing in POST request.',
    });
  });

  test('@api @negative Missing and unknown account detail requests are distinguished', async ({ request }) => {
    const api = new AutomationExerciseApi(request);
    const missing = await parseApiBody<ApiMessageBody>(await api.getUserDetails());
    const unknown = await parseApiBody<ApiMessageBody>(
      await api.getUserDetails(invalidAccountData.unknownEmail),
    );

    expect(missing.responseCode).toBe(400);
    expect(missing.message).toBe('Bad request, email parameter is missing in GET request.');
    expect(unknown.responseCode).toBe(404);
    expect(unknown.message).toBe('Account not found with this email, try another email!');
  });

  test('@api @negative Account deletion rejects missing and unknown accounts', async ({ request }) => {
    const api = new AutomationExerciseApi(request);
    const missing = await parseApiBody<ApiMessageBody>(await api.deleteAccount());
    const unknown = await parseApiBody<ApiMessageBody>(
      await api.deleteAccount(invalidAccountData.unknownEmail, invalidAccountData.invalidPassword),
    );

    expect(missing.responseCode).toBe(400);
    expect(missing.message).toBe('Bad request, email parameter is missing in DELETE request.');
    expect(unknown).toEqual({ responseCode: 404, message: 'Account not found!' });
  });

  test('@api @negative Account update rejects an unknown account', async ({ request }) => {
    const account = {
      ...createApiAccountData(),
      email: invalidAccountData.unknownEmail,
      password: invalidAccountData.invalidPassword,
    };
    const body = await parseApiBody<ApiMessageBody>(
      await new AutomationExerciseApi(request).updateAccount(account),
    );

    expect(body).toEqual({ responseCode: 404, message: 'Account not found!' });
  });
});
