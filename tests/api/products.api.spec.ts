import { test, expect } from '../../fixtures/test-fixtures';
import {
  AutomationExerciseApi,
  parseApiBody,
  type ApiMessageBody,
} from '../../utils/api/automation-exercise-api';

type Product = {
  id: number;
  name: string;
  price: string;
  brand: string;
  category: { usertype: { usertype: string }; category: string };
};

type ProductsBody = { responseCode: number; products: Product[] };

test.describe('Products API', () => {
  test('@api @smoke GET products returns structured product data', async ({ request }) => {
    const api = new AutomationExerciseApi(request);
    const response = await api.getProducts();
    const body = await parseApiBody<ProductsBody>(response);

    expect(response.status()).toBe(200);
    expect(body.responseCode).toBe(200);
    expect(Array.isArray(body.products)).toBe(true);
    expect(body.products.length).toBeGreaterThan(0);
    for (const product of body.products) {
      expect(typeof product.id).toBe('number');
      expect(typeof product.name).toBe('string');
      expect(product.name.length).toBeGreaterThan(0);
      expect(product.price).toMatch(/^Rs\.\s*\d+/);
      expect(typeof product.brand).toBe('string');
      expect(typeof product.category.category).toBe('string');
      expect(typeof product.category.usertype.usertype).toBe('string');
    }
  });

  test('@api @negative POST products reports unsupported method', async ({ request }) => {
    const response = await new AutomationExerciseApi(request).postProducts();
    const body = await parseApiBody<ApiMessageBody>(response);

    expect(response.status()).toBe(200);
    expect(body).toEqual({
      responseCode: 405,
      message: 'This request method is not supported.',
    });
  });
});
