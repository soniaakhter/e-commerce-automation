import type { Locator, Page } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly cartRows: Locator;
  readonly emptyCartMessage: Locator;
  readonly addConfirmationModal: Locator;
  readonly addedHeading: Locator;
  readonly addedMessage: Locator;
  readonly continueShoppingButton: Locator;
  readonly viewCartLink: Locator;
  readonly proceedToCheckoutLink: Locator;
  readonly checkoutModal: Locator;
  readonly guestCheckoutMessage: Locator;
  readonly registerLoginLink: Locator;
  readonly continueOnCartButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartRows = page.locator('#cart_info_table tbody tr');
    this.emptyCartMessage = page.locator('#empty_cart');
    this.addConfirmationModal = page.locator('#cartModal');
    this.addedHeading = this.addConfirmationModal.getByRole('heading', { name: 'Added!' });
    this.addedMessage = this.addConfirmationModal.getByText(
      'Your product has been added to cart.',
      { exact: true },
    );
    this.continueShoppingButton = this.addConfirmationModal.getByRole('button', {
      name: 'Continue Shopping',
    });
    this.viewCartLink = this.addConfirmationModal.getByRole('link', { name: 'View Cart' });
    this.proceedToCheckoutLink = page.getByText('Proceed To Checkout', { exact: true });
    this.checkoutModal = page.locator('#checkoutModal');
    this.guestCheckoutMessage = this.checkoutModal.getByText(
      'Register / Login account to proceed on checkout.',
      { exact: true },
    );
    this.registerLoginLink = this.checkoutModal.getByRole('link', { name: 'Register / Login' });
    this.continueOnCartButton = this.checkoutModal.getByRole('button', {
      name: 'Continue On Cart',
    });
  }

  async open(): Promise<void> {
    await this.page.goto('/view_cart');
  }

  cartRow(productName: string): Locator {
    return this.cartRows.filter({
      has: this.page.locator('.cart_description h4 a').filter({ hasText: productName }),
    });
  }

  productName(productName: string): Locator {
    return this.cartRow(productName).locator('.cart_description h4 a');
  }

  unitPrice(productName: string): Locator {
    return this.cartRow(productName).locator('.cart_price p');
  }

  quantity(productName: string): Locator {
    return this.cartRow(productName).locator('.cart_quantity button');
  }

  lineTotal(productName: string): Locator {
    return this.cartRow(productName).locator('.cart_total_price');
  }

  async removeProduct(productName: string): Promise<void> {
    await this.cartRow(productName).locator('.cart_quantity_delete').click();
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }

  async viewCart(): Promise<void> {
    await this.viewCartLink.click();
  }

  async proceedToCheckout(): Promise<void> {
    await this.proceedToCheckoutLink.click();
  }
}
