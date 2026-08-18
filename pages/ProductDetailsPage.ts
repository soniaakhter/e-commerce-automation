import type { Locator, Page } from '@playwright/test';

export class ProductDetailsPage {
  readonly page: Page;
  readonly information: Locator;
  readonly productName: Locator;
  readonly category: Locator;
  readonly price: Locator;
  readonly availability: Locator;
  readonly condition: Locator;
  readonly brand: Locator;
  readonly quantityInput: Locator;
  readonly addToCartButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.information = page.locator('.product-information');
    this.productName = this.information.getByRole('heading');
    this.category = this.information.getByText(/^Category:/);
    this.price = this.information.locator('span > span');
    this.availability = this.information.locator('p').filter({ hasText: /^Availability:/ });
    this.condition = this.information.locator('p').filter({ hasText: /^Condition:/ });
    this.brand = this.information.locator('p').filter({ hasText: /^Brand:/ });
    this.quantityInput = this.information.locator('#quantity');
    this.addToCartButton = this.information.getByRole('button', { name: 'Add to cart' });
  }

  async setQuantity(quantity: number): Promise<void> {
    await this.quantityInput.fill(String(quantity));
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }
}
