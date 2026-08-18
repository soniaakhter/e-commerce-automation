import { test, expect } from '../fixtures/test-fixtures';

test.describe('Playwright framework foundation', () => {
  test('@smoke Opens the configured base URL', async ({ page, configuredBaseUrl }) => {
    const response = await page.goto('/');

    expect(response, `Expected ${configuredBaseUrl} to return a response`).not.toBeNull();
    expect(response?.ok(), `Expected ${configuredBaseUrl} to return a successful status`).toBe(true);
    await expect(page).toHaveURL(new RegExp(`^${escapeRegExp(configuredBaseUrl)}/?$`));
  });
});

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
