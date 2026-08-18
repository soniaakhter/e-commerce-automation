import { environment } from '../../config/environment';
import { test, expect } from '../../fixtures/test-fixtures';
import { invalidAccountData } from '../../test-data/api/account-data';
import {
  AutomationExerciseApi,
  parseApiBody,
  type ApiMessageBody,
} from '../../utils/api/automation-exercise-api';

test.describe('Login verification API', () => {
  test('@api @smoke Valid configured credentials verify the user', async ({ request }) => {
    test.skip(
      !environment.testUserEmail || !environment.testUserPassword,
      'Set TEST_USER_EMAIL and TEST_USER_PASSWORD to run valid API login verification.',
    );
    const body = await parseApiBody<ApiMessageBody>(
      await new AutomationExerciseApi(request).verifyLogin(
        environment.testUserEmail,
        environment.testUserPassword,
      ),
    );

    expect(body).toEqual({ responseCode: 200, message: 'User exists!' });
  });

  test('@api @negative Valid email with invalid password is rejected', async ({ request }) => {
    test.skip(!environment.testUserEmail, 'Set TEST_USER_EMAIL to run this API scenario.');
    const body = await parseApiBody<ApiMessageBody>(
      await new AutomationExerciseApi(request).verifyLogin(
        environment.testUserEmail,
        invalidAccountData.invalidPassword,
      ),
    );

    expect(body).toEqual({ responseCode: 404, message: 'User not found!' });
  });

  for (const scenario of [
    { name: 'missing email', email: undefined, password: 'dummy-password' },
    { name: 'missing password', email: invalidAccountData.unknownEmail, password: undefined },
    { name: 'both fields missing', email: undefined, password: undefined },
  ]) {
    test(`@api @negative Login verification rejects ${scenario.name}`, async ({ request }) => {
      const body = await parseApiBody<ApiMessageBody>(
        await new AutomationExerciseApi(request).verifyLogin(scenario.email, scenario.password),
      );

      expect(body.responseCode).toBe(400);
      expect(body.message).toBe(
        'Bad request, email or password parameter is missing in POST request.',
      );
    });
  }

  test('@api @negative Unknown email is rejected', async ({ request }) => {
    const body = await parseApiBody<ApiMessageBody>(
      await new AutomationExerciseApi(request).verifyLogin(
        invalidAccountData.unknownEmail,
        invalidAccountData.invalidPassword,
      ),
    );
    expect(body).toEqual({ responseCode: 404, message: 'User not found!' });
  });

  test('@api @negative Malformed email is treated as an unknown user', async ({ request }) => {
    const body = await parseApiBody<ApiMessageBody>(
      await new AutomationExerciseApi(request).verifyLogin(
        invalidAccountData.malformedEmail,
        invalidAccountData.invalidPassword,
      ),
    );
    expect(body).toEqual({ responseCode: 404, message: 'User not found!' });
  });

  test('@api @negative DELETE login verification reports unsupported method', async ({ request }) => {
    const body = await parseApiBody<ApiMessageBody>(
      await new AutomationExerciseApi(request).deleteVerifyLogin(),
    );
    expect(body).toEqual({
      responseCode: 405,
      message: 'This request method is not supported.',
    });
  });
});
