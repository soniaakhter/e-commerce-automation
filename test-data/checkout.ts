import type { PaymentDetails } from '../pages/PaymentPage';

export const checkoutData = {
  orderComment: 'Playwright checkout test order',
} as const;

export const paymentData: PaymentDetails = {
  cardName: 'Playwright Test User',
  cardNumber: '4111111111111111',
  cvc: '123',
  expiryMonth: '12',
  expiryYear: '2030',
};

export const malformedPaymentData: PaymentDetails = {
  cardName: 'x',
  cardNumber: 'not-a-card',
  cvc: 'x',
  expiryMonth: 'xx',
  expiryYear: 'year',
};
