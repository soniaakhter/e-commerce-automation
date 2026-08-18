export type ApiAccountData = {
  name: string;
  email: string;
  password: string;
  title: string;
  birth_date: string;
  birth_month: string;
  birth_year: string;
  firstname: string;
  lastname: string;
  company: string;
  address1: string;
  address2: string;
  country: string;
  zipcode: string;
  state: string;
  city: string;
  mobile_number: string;
};

let apiAccountSequence = 0;

export function createApiAccountData(): ApiAccountData {
  const suffix = `${Date.now()}-${++apiAccountSequence}`;

  return {
    name: `Playwright API User ${suffix}`,
    email: `playwright.api.${suffix}@example.com`,
    password: `PlaywrightApi!${suffix}`,
    title: 'Mrs',
    birth_date: '15',
    birth_month: '6',
    birth_year: '1992',
    firstname: 'Playwright',
    lastname: `ApiUser${apiAccountSequence}`,
    company: 'Example Test Company',
    address1: '123 API Test Street',
    address2: 'Suite 1',
    country: 'Canada',
    zipcode: 'M5V2T6',
    state: 'Ontario',
    city: 'Toronto',
    mobile_number: '14165550123',
  };
}

export function registrationToApiAccount(details: RegistrationDetails): ApiAccountData {
  return {
    name: details.name,
    email: details.email,
    password: details.password,
    title: details.title,
    birth_date: details.birthDate.day,
    birth_month: details.birthDate.month,
    birth_year: details.birthDate.year,
    firstname: details.firstName,
    lastname: details.lastName,
    company: details.company,
    address1: details.address,
    address2: '',
    country: details.country,
    zipcode: details.zipcode,
    state: details.state,
    city: details.city,
    mobile_number: details.mobileNumber,
  };
}

export const invalidAccountData = {
  unknownEmail: 'missing.api.user@example.invalid',
  invalidPassword: 'invalid-api-password',
  malformedEmail: 'not-an-email',
} as const;
import type { RegistrationDetails } from '../../pages/SignupPage';
