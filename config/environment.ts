import dotenv from 'dotenv';

dotenv.config({ quiet: true });

export const environment = {
  baseUrl: process.env.BASE_URL ?? 'https://automationexercise.com',
  apiBaseUrl: process.env.API_BASE_URL ?? process.env.BASE_URL ?? 'https://automationexercise.com',
  testUserEmail: process.env.TEST_USER_EMAIL ?? '',
  testUserPassword: process.env.TEST_USER_PASSWORD ?? '',
} as const;
