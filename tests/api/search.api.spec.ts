import { test, expect } from '../../fixtures/test-fixtures';
import { apiSearchData } from '../../test-data/api/search-data';
import {
  AutomationExerciseApi,
  parseApiBody,
  type ApiMessageBody,
} from '../../utils/api/automation-exercise-api';

type SearchBody = {
  responseCode: number;
  products: Array<{ id: number; name: string; price: string; brand: string }>;
};

test.describe('Product search API', () => {
  test('@api @smoke Exact search returns the expected product', async ({ request }) => {
    const response = await new AutomationExerciseApi(request).searchProducts(
      apiSearchData.exactKeyword,
    );
    const body = await parseApiBody<SearchBody>(response);

    expect(response.status()).toBe(200);
    expect(body.responseCode).toBe(200);
    expect(body.products.map(({ name }) => name)).toEqual([apiSearchData.exactKeyword]);
  });

  test('@api @regression Partial search returns only relevant products', async ({ request }) => {
    const response = await new AutomationExerciseApi(request).searchProducts(
      apiSearchData.partialKeyword,
    );
    const body = await parseApiBody<SearchBody>(response);

    expect(body.responseCode).toBe(200);
    expect(body.products.length).toBeGreaterThan(1);
    for (const product of body.products) {
      expect(product.name.toLowerCase()).toContain(apiSearchData.partialKeyword.toLowerCase());
    }
  });

  test('@api @negative Non-existing search returns an empty list', async ({ request }) => {
    const body = await parseApiBody<SearchBody>(
      await new AutomationExerciseApi(request).searchProducts(apiSearchData.nonExistingKeyword),
    );

    expect(body).toEqual({ responseCode: 200, products: [] });
  });

  test('@api @negative Missing search parameter returns application code 400', async ({ request }) => {
    const body = await parseApiBody<ApiMessageBody>(
      await new AutomationExerciseApi(request).searchProducts(),
    );

    expect(body.responseCode).toBe(400);
    expect(body.message).toBe(
      'Bad request, search_product parameter is missing in POST request.',
    );
  });

  test('@api @regression Empty search returns the complete product list', async ({ request }) => {
    const api = new AutomationExerciseApi(request);
    const [searchBody, productsBody] = await Promise.all([
      api.searchProducts('').then((response) => parseApiBody<SearchBody>(response)),
      api.getProducts().then((response) => parseApiBody<SearchBody>(response)),
    ]);

    expect(searchBody.responseCode).toBe(200);
    expect(searchBody.products.map(({ id }) => id)).toEqual(productsBody.products.map(({ id }) => id));
  });

  test('@api @negative Safe special characters return an empty list', async ({ request }) => {
    const body = await parseApiBody<SearchBody>(
      await new AutomationExerciseApi(request).searchProducts(
        apiSearchData.specialCharacterKeyword,
      ),
    );

    expect(body).toEqual({ responseCode: 200, products: [] });
  });
});
