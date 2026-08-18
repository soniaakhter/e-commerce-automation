import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { ApiAccountData } from '../../test-data/api/account-data';

export const apiEndpoints = {
  products: '/api/productsList',
  brands: '/api/brandsList',
  search: '/api/searchProduct',
  verifyLogin: '/api/verifyLogin',
  createAccount: '/api/createAccount',
  updateAccount: '/api/updateAccount',
  deleteAccount: '/api/deleteAccount',
  userDetails: '/api/getUserDetailByEmail',
} as const;

export class AutomationExerciseApi {
  constructor(private readonly request: APIRequestContext) {}

  getProducts(): Promise<APIResponse> {
    return this.request.get(apiEndpoints.products);
  }

  postProducts(): Promise<APIResponse> {
    return this.request.post(apiEndpoints.products);
  }

  getBrands(): Promise<APIResponse> {
    return this.request.get(apiEndpoints.brands);
  }

  putBrands(): Promise<APIResponse> {
    return this.request.put(apiEndpoints.brands);
  }

  searchProducts(searchProduct?: string): Promise<APIResponse> {
    return this.request.post(apiEndpoints.search, {
      form: searchProduct === undefined ? {} : { search_product: searchProduct },
    });
  }

  verifyLogin(email?: string, password?: string): Promise<APIResponse> {
    return this.request.post(apiEndpoints.verifyLogin, {
      form: {
        ...(email === undefined ? {} : { email }),
        ...(password === undefined ? {} : { password }),
      },
    });
  }

  deleteVerifyLogin(): Promise<APIResponse> {
    return this.request.delete(apiEndpoints.verifyLogin);
  }

  createAccount(account: Partial<ApiAccountData>): Promise<APIResponse> {
    return this.request.post(apiEndpoints.createAccount, { form: account });
  }

  updateAccount(account: Partial<ApiAccountData>): Promise<APIResponse> {
    return this.request.put(apiEndpoints.updateAccount, { form: account });
  }

  deleteAccount(email?: string, password?: string): Promise<APIResponse> {
    return this.request.delete(apiEndpoints.deleteAccount, {
      form: {
        ...(email === undefined ? {} : { email }),
        ...(password === undefined ? {} : { password }),
      },
    });
  }

  getUserDetails(email?: string): Promise<APIResponse> {
    return this.request.get(apiEndpoints.userDetails, {
      params: email === undefined ? {} : { email },
    });
  }
}

export async function parseApiBody<T>(response: APIResponse): Promise<T> {
  return JSON.parse(await response.text()) as T;
}

export type ApiMessageBody = {
  responseCode: number;
  message: string;
};
