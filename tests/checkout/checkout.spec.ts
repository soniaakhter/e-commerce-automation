import type { Locator, Page } from '@playwright/test';
import { test, expect } from '../../fixtures/test-fixtures';
import { CartPage } from '../../pages/CartPage';
import { CheckoutPage } from '../../pages/CheckoutPage';
import { PaymentPage, type PaymentFieldName } from '../../pages/PaymentPage';
import { ProductsPage } from '../../pages/ProductsPage';
import { checkoutData, malformedPaymentData, paymentData } from '../../test-data/checkout';
import { productData } from '../../test-data/products';
import { parseCurrency } from '../../utils/currency';

test.describe('Checkout and order placement', () => {
  test.describe.configure({ timeout: 60_000 });

  test('@smoke Logged-in user can complete Checkout and place an order', async ({
    page,
    registeredAccount,
  }) => {
    const { checkoutPage, paymentPage, expectedPrice } = await openPreparedCheckout(page);

    await expect(page).toHaveURL(/\/checkout$/);
    await expectAddress(checkoutPage.deliveryAddress, registeredAccount);
    await expectAddress(checkoutPage.billingAddress, registeredAccount);
    await expectOrderSummary(checkoutPage, expectedPrice);
    await checkoutPage.enterOrderComment(checkoutData.orderComment);
    await expect(checkoutPage.orderComment).toHaveValue(checkoutData.orderComment);

    await checkoutPage.placeOrder();
    await expect(page).toHaveURL(/\/payment$/);
    await expect(paymentPage.heading).toBeVisible();
    await paymentPage.fillPayment(paymentData);
    await paymentPage.submitPayment();

    await expect(page).toHaveURL(/\/payment_done\/\d+$/);
    await expect(paymentPage.orderPlacedHeading).toHaveText('Order Placed!');
    await expect(paymentPage.confirmationMessage).toBeVisible();
  });

  test('@negative Guest user is prompted to register or login before Checkout', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);
    await productsPage.open();
    await productsPage.addProductToCart(productData.exactProductName);
    await cartPage.viewCart();

    await cartPage.proceedToCheckout();

    await expect(page).toHaveURL(/\/view_cart$/);
    await expect(cartPage.checkoutModal).toBeVisible();
    await expect(cartPage.guestCheckoutMessage).toBeVisible();
    await expect(cartPage.registerLoginLink).toBeVisible();
    await expect(cartPage.continueOnCartButton).toBeVisible();
  });

  test('@negative Logged-in user cannot proceed to Checkout with an empty cart', async ({
    page,
    registeredAccount: _registeredAccount,
  }) => {
    const cartPage = new CartPage(page);
    await cartPage.open();

    await expect(page).toHaveURL(/\/view_cart$/);
    await expect(cartPage.emptyCartMessage).toBeVisible();
    await expect(cartPage.proceedToCheckoutLink).toHaveCount(0);
  });

  test('@negative Payment fields use browser-native required validation', async ({
    page,
    registeredAccount: _registeredAccount,
  }) => {
    const { checkoutPage, paymentPage } = await openPreparedCheckout(page);
    await checkoutPage.placeOrder();
    await expect(page).toHaveURL(/\/payment$/);

    const fields: PaymentFieldName[] = [
      'cardName',
      'cardNumber',
      'cvc',
      'expiryMonth',
      'expiryYear',
    ];
    for (const missingField of fields) {
      await paymentPage.fillPayment(paymentData);
      await paymentPage.field(missingField).fill('');
      await paymentPage.submitPayment();

      const validation = await paymentPage.getValidationState(missingField);
      expect(validation.valid).toBe(false);
      expect(validation.valueMissing).toBe(true);
      await expect(page).toHaveURL(/\/payment$/);
    }
  });

  test('@regression Demo payment fields do not enforce card-format validation', async ({
    page,
    registeredAccount: _registeredAccount,
  }) => {
    const { checkoutPage, paymentPage } = await openPreparedCheckout(page);
    await checkoutPage.placeOrder();
    await paymentPage.fillPayment(malformedPaymentData);

    for (const fieldName of Object.keys(malformedPaymentData) as PaymentFieldName[]) {
      const validation = await paymentPage.getValidationState(fieldName);
      expect(validation.valid).toBe(true);
      expect(validation.patternMismatch).toBe(false);
    }
    await expect(page).toHaveURL(/\/payment$/);
  });
});

async function openPreparedCheckout(page: Page): Promise<{
  checkoutPage: CheckoutPage;
  paymentPage: PaymentPage;
  expectedPrice: string;
}> {
  const productsPage = new ProductsPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);
  const paymentPage = new PaymentPage(page);
  await productsPage.open();
  const expectedPrice = await productsPage.getProductPrice(productData.exactProductName);
  await productsPage.addProductToCart(productData.exactProductName);
  await cartPage.viewCart();
  await cartPage.proceedToCheckout();

  return { checkoutPage, paymentPage, expectedPrice };
}

async function expectAddress(
  address: Locator,
  account: import('../../pages/SignupPage').RegistrationDetails,
): Promise<void> {
  await expect(address).toBeVisible();
  for (const expectedValue of [
    account.firstName,
    account.lastName,
    account.company,
    account.address,
    account.city,
    account.state,
    account.zipcode,
    account.country,
    account.mobileNumber,
  ]) {
    await expect(address).toContainText(expectedValue);
  }
}

async function expectOrderSummary(checkoutPage: CheckoutPage, expectedPrice: string): Promise<void> {
  const productName = productData.exactProductName;
  await expect(checkoutPage.orderRows).toHaveCount(1);
  await expect(checkoutPage.productName(productName)).toHaveText(productName);
  await expect(checkoutPage.unitPrice(productName)).toHaveText(expectedPrice);
  await expect(checkoutPage.quantity(productName)).toHaveText('1');

  const unitPrice = parseCurrency(await checkoutPage.unitPrice(productName).innerText());
  const lineTotal = parseCurrency(await checkoutPage.lineTotal(productName).innerText());
  const orderTotal = parseCurrency(await checkoutPage.orderTotal.innerText());
  expect(lineTotal).toBe(unitPrice);
  expect(orderTotal).toBe(lineTotal);
}
