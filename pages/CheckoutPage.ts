import type { Locator, Page } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;
  readonly deliveryAddress: Locator;
  readonly billingAddress: Locator;
  readonly orderRows: Locator;
  readonly orderTotal: Locator;
  readonly orderComment: Locator;
  readonly placeOrderLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.deliveryAddress = page.locator('#address_delivery');
    this.billingAddress = page.locator('#address_invoice');
    this.orderRows = page.locator('#cart_info tbody tr[id^="product-"]');
    this.orderTotal = page
      .locator('#cart_info tbody tr')
      .filter({ hasText: 'Total Amount' })
      .locator('.cart_total_price');
    this.orderComment = page.locator('#ordermsg textarea');
    this.placeOrderLink = page.getByRole('link', { name: 'Place Order' });
  }

  orderRow(productName: string): Locator {
    return this.orderRows.filter({
      has: this.page.locator('.cart_description h4 a').filter({ hasText: productName }),
    });
  }

  productName(productName: string): Locator {
    return this.orderRow(productName).locator('.cart_description h4 a');
  }

  unitPrice(productName: string): Locator {
    return this.orderRow(productName).locator('.cart_price p');
  }

  quantity(productName: string): Locator {
    return this.orderRow(productName).locator('.cart_quantity button');
  }

  lineTotal(productName: string): Locator {
    return this.orderRow(productName).locator('.cart_total_price');
  }

  async enterOrderComment(comment: string): Promise<void> {
    await this.orderComment.fill(comment);
  }

  async placeOrder(): Promise<void> {
    await this.placeOrderLink.click();
  }
}
