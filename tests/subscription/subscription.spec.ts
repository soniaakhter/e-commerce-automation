import { test, expect } from '../../fixtures/test-fixtures';
import { SubscriptionComponent } from '../../pages/components/SubscriptionComponent';
import {
  createUniqueSubscriptionEmail,
  subscriptionData,
} from '../../test-data/subscription';

test.describe('Newsletter subscription', () => {
  test('@smoke User can subscribe from the Home page', async ({ page }) => {
    const subscription = new SubscriptionComponent(page);
    await page.goto('/');

    await expect(subscription.heading).toBeVisible();
    await expect(subscription.emailInput).toBeVisible();
    await subscription.subscribe(createUniqueSubscriptionEmail());
    await expect(subscription.successMessage).toBeVisible();
    await expect(subscription.successMessage).toContainText(subscriptionData.successMessage);
  });

  test('@smoke User can subscribe from the Cart page footer', async ({ page }) => {
    const subscription = new SubscriptionComponent(page);
    await page.goto('/view_cart');

    await expect(subscription.heading).toBeVisible();
    await subscription.subscribe(createUniqueSubscriptionEmail('playwright.cart.subscription'));
    await expect(subscription.successMessage).toContainText(subscriptionData.successMessage);
  });

  test('@negative Subscription requires an email address', async ({ page }) => {
    const subscription = new SubscriptionComponent(page);
    await page.goto('/');
    await subscription.subscribe('');

    const validation = await subscription.getValidationState();
    expect(validation.valid).toBe(false);
    expect(validation.valueMissing).toBe(true);
    await expect(subscription.successMessage).not.toBeVisible();
  });

  test('@negative Subscription rejects malformed email through native validation', async ({ page }) => {
    const subscription = new SubscriptionComponent(page);
    await page.goto('/');
    await subscription.subscribe(subscriptionData.malformedEmail);

    const validation = await subscription.getValidationState();
    expect(validation.invalidEmailFormat).toBe(true);
    await expect(subscription.successMessage).not.toBeVisible();
  });

  test('@negative Whitespace-only subscription is rejected by native validation', async ({ page }) => {
    const subscription = new SubscriptionComponent(page);
    await page.goto('/');
    await subscription.subscribe(subscriptionData.whitespaceEmail);

    const validation = await subscription.getValidationState();
    expect(validation.valid).toBe(false);
    expect(validation.valueMissing || validation.invalidEmailFormat).toBe(true);
    await expect(subscription.emailInput).toHaveValue(/^\s*$/);
    await expect(subscription.successMessage).not.toBeVisible();
  });

  test('@negative Safe special characters are rejected without crashing the page', async ({ page }) => {
    const subscription = new SubscriptionComponent(page);
    await page.goto('/');
    await subscription.subscribe(subscriptionData.specialCharacterEmail);

    const validation = await subscription.getValidationState();
    expect(validation.invalidEmailFormat).toBe(true);
    await expect(page).toHaveURL((url) => url.pathname === '/');
    await expect(subscription.heading).toBeVisible();
  });

  test('@regression Duplicate subscription receives the same success response', async ({ page }) => {
    const email = createUniqueSubscriptionEmail('playwright.duplicate.subscription');
    const subscription = new SubscriptionComponent(page);

    for (let submission = 0; submission < 2; submission += 1) {
      await page.goto('/');
      await subscription.subscribe(email);
      await expect(subscription.successMessage).toContainText(subscriptionData.successMessage);
    }
  });
});
