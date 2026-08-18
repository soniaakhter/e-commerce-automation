let subscriptionSequence = 0;

export function createUniqueSubscriptionEmail(prefix = 'playwright.subscription'): string {
  subscriptionSequence += 1;
  return `${prefix}.${Date.now()}.${subscriptionSequence}@example.com`;
}

export const subscriptionData = {
  malformedEmail: 'not-an-email',
  whitespaceEmail: '   ',
  specialCharacterEmail: '@@@',
  successMessage: 'You have been successfully subscribed!',
} as const;
