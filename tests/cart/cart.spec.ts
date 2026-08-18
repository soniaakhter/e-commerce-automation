import { test, expect } from '../../fixtures/test-fixtures';
import { CartPage } from '../../pages/CartPage';
import { ProductDetailsPage } from '../../pages/ProductDetailsPage';
import { ProductsPage } from '../../pages/ProductsPage';
import { cartData } from '../../test-data/cart';
import { productData } from '../../test-data/products';
import { parseCurrency } from '../../utils/currency';

test.describe('Shopping cart', () => {
  test('@smoke User can add one product from Products and validate the cart row', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);
    await productsPage.open();
    const expectedPrice = await productsPage.getProductPrice(productData.exactProductName);

    await productsPage.addProductToCart(productData.exactProductName);
    await expectAddConfirmation(cartPage);
    await cartPage.viewCart();

    await expect(page).toHaveURL(/\/view_cart$/);
    await expectCartLine(
      cartPage,
      productData.exactProductName,
      expectedPrice,
      cartData.defaultQuantity,
    );
  });

  test('@smoke User can add one product from Product Details', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    const detailsPage = new ProductDetailsPage(page);
    const cartPage = new CartPage(page);
    await productsPage.open();
    await productsPage.openProductDetails(productData.exactProductName);
    const expectedPrice = (await detailsPage.price.innerText()).trim();

    await detailsPage.addToCart();
    await expectAddConfirmation(cartPage);
    await cartPage.viewCart();

    await expectCartLine(
      cartPage,
      productData.exactProductName,
      expectedPrice,
      cartData.defaultQuantity,
    );
  });

  test('@regression User can add and validate multiple different products', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);
    await productsPage.open();
    const expectedPrices = new Map<string, string>();

    for (const productName of cartData.products) {
      expectedPrices.set(productName, await productsPage.getProductPrice(productName));
      await productsPage.addProductToCart(productName);
      await expectAddConfirmation(cartPage);
      await cartPage.continueShopping();
    }
    await cartPage.open();

    await expect(cartPage.cartRows).toHaveCount(cartData.products.length);
    for (const productName of cartData.products) {
      await expectCartLine(
        cartPage,
        productName,
        expectedPrices.get(productName)!,
        cartData.defaultQuantity,
      );
    }
  });

  test('@regression Product Details quantity controls cart quantity and line total', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    const detailsPage = new ProductDetailsPage(page);
    const cartPage = new CartPage(page);
    await productsPage.open();
    await productsPage.openProductDetails(productData.exactProductName);
    const expectedPrice = (await detailsPage.price.innerText()).trim();

    await detailsPage.setQuantity(cartData.increasedQuantity);
    await detailsPage.addToCart();
    await expectAddConfirmation(cartPage);
    await cartPage.viewCart();

    await expectCartLine(
      cartPage,
      productData.exactProductName,
      expectedPrice,
      cartData.increasedQuantity,
    );
  });

  test('@regression Removing one product does not affect the remaining product', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);
    await productsPage.open();
    for (const productName of cartData.products) {
      await productsPage.addProductToCart(productName);
      await expectAddConfirmation(cartPage);
      await cartPage.continueShopping();
    }
    await cartPage.open();

    await cartPage.removeProduct(productData.exactProductName);

    await expect(cartPage.cartRow(productData.exactProductName)).toHaveCount(0);
    await expect(cartPage.cartRow(productData.secondProductName)).toBeVisible();
    await expect(cartPage.cartRows).toHaveCount(1);
  });

  test('@negative Removing all products displays the actual empty-cart state', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);
    await productsPage.open();
    for (const productName of cartData.products) {
      await productsPage.addProductToCart(productName);
      await expectAddConfirmation(cartPage);
      await cartPage.continueShopping();
    }
    await cartPage.open();

    for (const productName of cartData.products) {
      await cartPage.removeProduct(productName);
      await expect(cartPage.cartRow(productName)).toHaveCount(0);
    }

    await expect(cartPage.cartRows).toHaveCount(0);
    await expect(cartPage.emptyCartMessage).toBeVisible();
    await expect(cartPage.emptyCartMessage).toContainText(cartData.emptyCartMessage);
  });

  test('@regression Guest cart persists after refresh and navigation', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);
    await productsPage.open();
    await productsPage.addProductToCart(productData.exactProductName);
    await expectAddConfirmation(cartPage);
    await cartPage.viewCart();
    await expect(cartPage.cartRow(productData.exactProductName)).toBeVisible();

    await page.reload();
    await expect(cartPage.cartRow(productData.exactProductName)).toBeVisible();
    await productsPage.open();
    await cartPage.open();

    await expect(cartPage.cartRow(productData.exactProductName)).toBeVisible();
    await expect(cartPage.cartRows).toHaveCount(1);
  });
});

async function expectAddConfirmation(cartPage: CartPage): Promise<void> {
  await expect(cartPage.addConfirmationModal).toBeVisible();
  await expect(cartPage.addedHeading).toBeVisible();
  await expect(cartPage.addedMessage).toBeVisible();
  await expect(cartPage.continueShoppingButton).toBeVisible();
  await expect(cartPage.viewCartLink).toBeVisible();
}

async function expectCartLine(
  cartPage: CartPage,
  productName: string,
  expectedPrice: string,
  expectedQuantity: number,
): Promise<void> {
  await expect(cartPage.cartRow(productName)).toBeVisible();
  await expect(cartPage.productName(productName)).toHaveText(productName);
  await expect(cartPage.unitPrice(productName)).toHaveText(expectedPrice);
  await expect(cartPage.quantity(productName)).toHaveText(String(expectedQuantity));

  const unitPrice = parseCurrency(await cartPage.unitPrice(productName).innerText());
  const lineTotal = parseCurrency(await cartPage.lineTotal(productName).innerText());
  expect(lineTotal).toBe(unitPrice * expectedQuantity);
}
