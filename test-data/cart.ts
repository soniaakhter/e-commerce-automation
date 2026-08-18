import { productData } from './products';

export const cartData = {
  defaultQuantity: 1,
  increasedQuantity: 3,
  products: [productData.exactProductName, productData.secondProductName],
  emptyCartMessage: 'Cart is empty! Click here to buy products.',
} as const;
