// Cashfree Configuration
export const CASHFREE_CONFIG = {
  // Sandbox Environment
  sandbox: {
    appId: 'YOUR_SANDBOX_APP_ID', // Your actual Cashfree Sandbox App ID
    secretKey: 'YOUR_SANDBOX_SECRET_KEY', // Your actual Cashfree Sandbox Secret Key
    baseUrl: 'https://sandbox.cashfree.com/pg/orders',
    apiVersion: '2022-09-01'
  },
  
  // Production Environment (when ready to go live)
  production: {
    appId: 'PROD_APP_ID', // Replace with your Cashfree Production App ID
    secretKey: 'PROD_SECRET_KEY', // Replace with your Cashfree Production Secret Key
    baseUrl: 'https://api.cashfree.com/pg/orders',
    apiVersion: '2022-09-01'
  },
  
  // Current environment (change to 'production' when going live)
  currentEnvironment: 'sandbox' as 'sandbox' | 'production',
  
  // Get current config based on environment
  getCurrentConfig() {
    return this[this.currentEnvironment];
  },
  
  // Get base URL for current environment
  getBaseUrl() {
    return this.getCurrentConfig().baseUrl;
  },
  
  // Get API version
  getApiVersion() {
    return this.getCurrentConfig().apiVersion;
  },
  
  // Get App ID for current environment
  getAppId() {
    return this.getCurrentConfig().appId;
  },
  
  // Get Secret Key for current environment
  getSecretKey() {
    return this.getCurrentConfig().secretKey;
  }
}

export interface CashfreePayment {
  orderId: string
  orderAmount: number
  orderCurrency: string
  customerDetails: {
    customerId: string
    customerEmail: string
    customerPhone?: string
    customerName?: string
  }
  orderMeta?: {
    returnUrl?: string
    notifyUrl?: string
    paymentMethods?: string
  }
}

export interface CashfreeResponse {
  cftoken: string
  orderId: string
  orderAmount: number
  orderCurrency: string
  orderStatus: string
  paymentLink?: string
}
