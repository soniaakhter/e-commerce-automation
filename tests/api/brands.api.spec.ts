import { test, expect } from '../../fixtures/test-fixtures';
import {
  AutomationExerciseApi,
  parseApiBody,
  type ApiMessageBody,
} from '../../utils/api/automation-exercise-api';

type BrandsBody = {
  responseCode: number;
  brands: Array<{ id: number; brand: string }>;
};

test.describe('Brands API', () => {
  test('@api @smoke GET brands returns structured brand data', async ({ request }) => {
    const response = await new AutomationExerciseApi(request).getBrands();
    const body = await parseApiBody<BrandsBody>(response);

    expect(response.status()).toBe(200);
    expect(body.responseCode).toBe(200);
    expect(body.brands.length).toBeGreaterThan(0);
    for (const brand of body.brands) {
      expect(typeof brand.id).toBe('number');
      expect(typeof brand.brand).toBe('string');
      expect(brand.brand.length).toBeGreaterThan(0);
    }
  });

  test('@api @negative PUT brands reports unsupported method', async ({ request }) => {
    const response = await new AutomationExerciseApi(request).putBrands();
    const body = await parseApiBody<ApiMessageBody>(response);

    expect(response.status()).toBe(200);
    expect(body.responseCode).toBe(405);
    expect(body.message).toBe('This request method is not supported.');
  });
});
