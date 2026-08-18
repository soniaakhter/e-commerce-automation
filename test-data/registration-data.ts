import type { RegistrationDetails } from '../pages/SignupPage';

let accountSequence = 0;

export function generateUniqueEmail(): string {
  accountSequence += 1;
  return `playwright.user.${Date.now()}.${accountSequence}@example.com`;
}

export function createRegistrationData(): RegistrationDetails {
  const uniqueSuffix = `${Date.now()}-${++accountSequence}`;

  return {
    title: 'Mrs',
    name: `Playwright User ${uniqueSuffix}`,
    email: `playwright.user.${uniqueSuffix}@example.com`,
    password: `AutomationExercise!${uniqueSuffix}`,
    birthDate: { day: '15', month: '6', year: '1992' },
    newsletter: true,
    specialOffers: true,
    firstName: 'Playwright',
    lastName: `User${accountSequence}`,
    company: 'Example Test Company',
    address: '123 Test Automation Street',
    country: 'Canada',
    state: 'Ontario',
    city: 'Toronto',
    zipcode: 'M5V2T6',
    mobileNumber: '14165550123',
  };
}

export const invalidSignupData = {
  name: 'Playwright User',
  malformedEmail: 'not-an-email',
} as const;
