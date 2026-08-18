import { test, expect } from '../../fixtures/test-fixtures';
import { ProductDetailsPage } from '../../pages/ProductDetailsPage';
import { ProductsPage } from '../../pages/ProductsPage';
import { productData } from '../../test-data/products';

test.describe('Products and product details', () => {
  test('@smoke User can open the Products page and view its product list', async ({ page }) => {
    const productsPage = new ProductsPage(page);

    await productsPage.open();

    await expect(page).toHaveURL(/\/products$/);
    await expect(productsPage.heading).toHaveText('All Products');
    await expect(productsPage.searchInput).toBeVisible();
    expect(await productsPage.productCards.count()).toBeGreaterThan(0);
    await expect(productsPage.productCard(productData.exactProductName)).toBeVisible();
    expect((await productsPage.getProductNames()).length).toBeGreaterThan(0);
  });

  test('@smoke User can view complete product details', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    const productDetailsPage = new ProductDetailsPage(page);

    await productsPage.open();
    await expect(productsPage.productCard(productData.exactProductName)).toBeVisible();
    await productsPage.openProductDetails(productData.exactProductName);

    await expect(page).toHaveURL(/\/product_details\/\d+$/);
    await expect(productDetailsPage.information).toBeVisible();
    await expect(productDetailsPage.productName).toHaveText(productData.exactProductName);
    await expect(productDetailsPage.category).toHaveText(/^Category:\s*\S.+/);
    await expect(productDetailsPage.price).toHaveText(/^Rs\.\s*\d+/);
    await expect(productDetailsPage.availability).toHaveText(/^Availability:\s*\S.+/);
    await expect(productDetailsPage.condition).toHaveText(/^Condition:\s*\S.+/);
    await expect(productDetailsPage.brand).toHaveText(/^Brand:\s*\S.+/);
    await expect(productDetailsPage.quantityInput).toBeVisible();
    await expect(productDetailsPage.quantityInput).toHaveValue('1');
    await expect(productDetailsPage.addToCartButton).toBeVisible();
    await expect(productDetailsPage.addToCartButton).toBeEnabled();
  });
});
