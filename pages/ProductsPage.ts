import type { Locator, Page } from '@playwright/test';

export class ProductsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly productCards: Locator;
  readonly productNames: Locator;

  constructor(page: Page) {
    this.page = page;
    const productsSection = page.locator('.features_items');

    this.heading = productsSection.locator('> h2.title');
    this.searchInput = page.getByPlaceholder('Search Product');
    this.searchButton = page.locator('#submit_search');
    this.productCards = productsSection.locator('.product-image-wrapper');
    this.productNames = productsSection.locator('.productinfo p');
  }

  async open(): Promise<void> {
    await this.page.goto('/products');
  }

  async search(keyword: string): Promise<void> {
    await this.searchInput.fill(keyword);
    await this.searchButton.click();
  }

  async getProductNames(): Promise<string[]> {
    return (await this.productNames.allTextContents()).map((name) => name.trim());
  }

  async getProductPrice(productName: string): Promise<string> {
    return (await this.productCard(productName).locator('.productinfo h2').innerText()).trim();
  }

  async addProductToCart(productName: string): Promise<void> {
    await this.productCard(productName).locator('.productinfo .add-to-cart').click();
  }

  productCard(productName: string): Locator {
    return this.productCards.filter({
      has: this.page.locator('.productinfo').getByText(productName, { exact: true }),
    });
  }

  async openProductDetails(productName: string): Promise<void> {
    const detailsLink = this.productCard(productName).getByRole('link', { name: 'View Product' });
    const href = await detailsLink.getAttribute('href');

    if (!href) throw new Error(`Product details link is missing for ${productName}`);
    await this.page.goto(href);
  }
}
