import { test, expect } from '../../fixtures/test-fixtures';
import { ProductsPage } from '../../pages/ProductsPage';
import { productData } from '../../test-data/products';

test.describe('Product search', () => {
  let productsPage: ProductsPage;

  test.beforeEach(async ({ page }) => {
    productsPage = new ProductsPage(page);
    await productsPage.open();
    await expect(productsPage.heading).toHaveText('All Products');
  });

  test('@smoke User can search for an existing product using its exact name', async () => {
    await productsPage.search(productData.exactSearchKeyword);

    await expect(productsPage.heading).toHaveText('Searched Products');
    await expect(productsPage.productNames).toHaveCount(1);
    await expect(productsPage.productNames).toHaveText([productData.exactProductName]);
  });

  test('@regression Partial product keyword returns relevant results', async () => {
    await productsPage.search(productData.partialSearchKeyword);

    const names = await productsPage.getProductNames();
    expect(names.length).toBeGreaterThan(1);
    expectEveryNameToContain(names, productData.partialSearchKeyword);
  });

  test('@regression Lowercase search is case-insensitive', async () => {
    await productsPage.search(productData.lowercaseSearchKeyword);

    await expect(productsPage.productNames).toHaveText([productData.exactProductName]);
  });

  test('@regression Uppercase search is case-insensitive', async () => {
    await productsPage.search(productData.uppercaseSearchKeyword);

    await expect(productsPage.productNames).toHaveText([productData.exactProductName]);
  });

  test('@regression Product search supports keywords containing spaces', async () => {
    await productsPage.search(productData.spacedSearchKeyword);

    const names = await productsPage.getProductNames();
    expect(names).toEqual([productData.spacedSearchKeyword]);
  });

  test('@negative Leading and trailing spaces are not normalized by product search', async () => {
    await productsPage.search(productData.whitespaceSearchKeyword);

    await expect(productsPage.heading).toHaveText('Searched Products');
    await expect(productsPage.productCards).toHaveCount(0);
  });

  test('@negative Empty search displays the complete product catalog', async () => {
    const initialProductCount = await productsPage.productCards.count();

    await productsPage.search('');

    await expect(productsPage.heading).toHaveText('All Products');
    await expect(productsPage.productCards).toHaveCount(initialProductCount);
  });

  test('@negative Non-existing product search returns an empty product list', async () => {
    await productsPage.search(productData.nonExistingSearchKeyword);

    await expectEmptySearchResults(productsPage);
  });

  test('@negative Special characters are handled safely with an empty product list', async ({ page }) => {
    await productsPage.search(productData.specialCharacterKeyword);

    await expect(page).toHaveURL(/\/products\?search=/);
    await expectEmptySearchResults(productsPage);
  });
});

function expectEveryNameToContain(names: string[], keyword: string): void {
  for (const name of names) {
    expect(name.toLocaleLowerCase()).toContain(keyword.toLocaleLowerCase());
  }
}

async function expectEmptySearchResults(productsPage: ProductsPage): Promise<void> {
  await expect(productsPage.heading).toHaveText('Searched Products');
  await expect(productsPage.productCards).toHaveCount(0);
  await expect(productsPage.page.getByText(/no products found/i)).toHaveCount(0);
}
