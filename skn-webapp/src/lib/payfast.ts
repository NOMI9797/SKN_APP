import { MD5 } from 'crypto-js';

// PayFast Configuration
export const PAYFAST_CONFIG = {
  // Sandbox (Development) Configuration
  SANDBOX: {
    MERCHANT_ID: process.env.NEXT_PUBLIC_PAYFAST_SANDBOX_MERCHANT_ID || '10000100',
    MERCHANT_KEY: process.env.NEXT_PUBLIC_PAYFAST_SANDBOX_MERCHANT_KEY || '46f0cd694581a',
    PASS_PHRASE: '', // No passphrase for sandbox testing
    BASE_URL: 'https://sandbox.payfast.co.za',
    PAYMENT_URL: 'https://sandbox.payfast.co.za/eng/process',
    VALIDATION_URL: 'https://sandbox.payfast.co.za/eng/query/validate',
  },
  
  // Production Configuration
  PRODUCTION: {
    MERCHANT_ID: process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID || '',
    MERCHANT_KEY: process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_KEY || '',
    PASS_PHRASE: process.env.NEXT_PUBLIC_PAYFAST_PASS_PHRASE || '',
    BASE_URL: 'https://www.payfast.co.za',
    PAYMENT_URL: 'https://www.payfast.co.za/eng/process',
    VALIDATION_URL: 'https://www.payfast.co.za/eng/query/validate',
  },
  
  // Current environment
  ENVIRONMENT: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'SANDBOX',
  
  // Get current config
  getCurrentConfig() {
    return this[this.ENVIRONMENT as keyof typeof PAYFAST_CONFIG] as typeof PAYFAST_CONFIG.SANDBOX;
  },
  
  // Payment methods
  PAYMENT_METHODS: {
    JAZZ_CASH: {
      id: 'jazz_cash',
      name: 'JazzCash',
      description: 'Pay using JazzCash mobile wallet',
      icon: '📱',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    EASYPAISA: {
      id: 'easypaisa',
      name: 'EasyPaisa',
      description: 'Pay using EasyPaisa mobile wallet',
      icon: '💳',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  },
  
  // Registration fee
  REGISTRATION_FEE: 850,
  
  // Currency
  CURRENCY: 'PKR',
  
  // Return URLs
  RETURN_URL: process.env.NEXT_PUBLIC_PAYFAST_RETURN_URL || 'http://localhost:3000/payment/success',
  CANCEL_URL: process.env.NEXT_PUBLIC_PAYFAST_CANCEL_URL || 'http://localhost:3000/payment/cancel',
  NOTIFY_URL: process.env.NEXT_PUBLIC_PAYFAST_NOTIFY_URL || 'http://localhost:3000/api/payment/webhook',
};

// PayFast Payment Helper Functions
export class PayFastPayment {
  private config: typeof PAYFAST_CONFIG.SANDBOX;
  
  constructor() {
    this.config = PAYFAST_CONFIG.getCurrentConfig();
    console.log('=== PayFast Configuration ===');
    console.log('Merchant ID:', this.config.MERCHANT_ID);
    console.log('Merchant Key:', this.config.MERCHANT_KEY);
    console.log('Passphrase:', this.config.PASS_PHRASE ? '***' : 'none');
    console.log('Passphrase length:', this.config.PASS_PHRASE?.length || 0);
    console.log('Passphrase loaded:', !!this.config.PASS_PHRASE);
    console.log('Environment:', PAYFAST_CONFIG.ENVIRONMENT);
    console.log('=====================================');
  }
  
  // Generate payment data for PayFast
  generatePaymentData(paymentData: {
    amount: number;
    itemName: string;
    itemDescription: string;
    customStr1: string; // User ID
    customStr2: string; // Payment method
    customStr3: string; // Referral code
  }) {
    // Minimal data for once-off payment - only essential fields
    const data: Record<string, string> = {
      merchant_id: this.config.MERCHANT_ID,
      merchant_key: this.config.MERCHANT_KEY,
      return_url: PAYFAST_CONFIG.RETURN_URL,
      cancel_url: PAYFAST_CONFIG.CANCEL_URL,
      notify_url: PAYFAST_CONFIG.NOTIFY_URL,
      
      // Payment details
      amount: Number(paymentData.amount).toFixed(2), // Ensure exactly 2 decimal places as string
      item_name: paymentData.itemName,
      
      // Payment identification
      m_payment_id: `SKN_${Date.now()}`, // Unique payment ID
      
      // Custom fields for tracking (only if they have values)
      ...(paymentData.customStr1 && paymentData.customStr1.trim() !== '' && { custom_str1: paymentData.customStr1 }),
      ...(paymentData.customStr2 && paymentData.customStr2.trim() !== '' && { custom_str2: paymentData.customStr2 }),
      ...(paymentData.customStr3 && paymentData.customStr3.trim() !== '' && { custom_str3: paymentData.customStr3 }),
    };
    
    // Generate signature BEFORE adding it to the data
    const signature = this.generateSignature(data);
    
    // Add signature to the final data
    const finalData = { ...data, signature };
    
    return finalData;
  }
  
  // Test signature generation with known data
  generateTestSignature() {
    // Use current environment variables for testing - minimal data for once-off payment
    const testData = {
      merchant_id: this.config.MERCHANT_ID,  // Use current config
      merchant_key: this.config.MERCHANT_KEY,  // Use current config
      return_url: PAYFAST_CONFIG.RETURN_URL,
      cancel_url: PAYFAST_CONFIG.CANCEL_URL,
      notify_url: PAYFAST_CONFIG.NOTIFY_URL,
      amount: '100.00',
      item_name: 'Test Item',
      m_payment_id: 'TEST_123'
    };
    
    console.log('=== TEST SIGNATURE GENERATION ===');
    console.log('Test data:', testData);
    console.log('Current passphrase:', this.config.PASS_PHRASE);
    console.log('Using merchant ID:', this.config.MERCHANT_ID);
    console.log('Using merchant key:', this.config.MERCHANT_KEY);
    console.log('Passphrase length:', this.config.PASS_PHRASE?.length || 0);
    
    const signature = this.generateSignature(testData);
    console.log('Test signature:', signature);
    console.log('=====================================');
    
    return { ...testData, signature };
  }
  
  // Generate signature for payment data
  generateSignature(data: Record<string, string | number>) {
    // 1. Remove signature field and filter out empty/null/undefined values
    const filtered: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (key === 'signature') continue;  // Skip signature field
      if (value === null || value === undefined) continue;  // Skip null/undefined
      
      const stringValue = String(value);  // Convert to string
      if (stringValue === '') continue;  // Skip empty strings
      
      filtered[key] = stringValue;  // Store as string
    }
    
    // 2. Sort keys alphabetically
    const sortedKeys = Object.keys(filtered).sort();
    
    // 3. Build query string with URL encoding (keep spaces as %20)
    const query = sortedKeys
      .map(key => `${key}=${encodeURIComponent(filtered[key]).replace(/%20/g, '%20')}`)
      .join('&');
    
    // 4. Append passphrase if set
    let finalString = query;
    if (this.config.PASS_PHRASE && this.config.PASS_PHRASE.length > 0) {
      finalString = `${query}&passphrase=${encodeURIComponent(this.config.PASS_PHRASE).replace(/%20/g, '%20')}`;
      console.log('Passphrase added to final string');
    } else {
      console.log('No passphrase set - using query string as is');
    }
    
    // Debug logging for signature generation
    console.log('=== PayFast Signature Generation (Exact Rules) ===');
    console.log('Filtered fields:', filtered);
    console.log('Sorted keys:', sortedKeys);
    console.log('Query string:', query);
    console.log('Passphrase value:', this.config.PASS_PHRASE);
    console.log('Final string to hash:', finalString);
    console.log('Final string length:', finalString.length);
    
    // 5. Generate MD5 hash of the final string
    const signature = MD5(finalString).toString();
    console.log('Generated signature:', signature);
    console.log('Signature length:', signature.length);
    console.log('=====================================');
    
    return signature;
  }
  
  // Validate payment response
  validatePaymentResponse(responseData: Record<string, string>) {
    // Basic validation - you should implement proper signature validation
    const requiredFields = ['payment_status', 'pf_payment_id', 'amount_gross'];
    
    for (const field of requiredFields) {
      if (!responseData[field]) {
        return false;
      }
    }
    
    return true;
  }
  
  // Get payment status
  getPaymentStatus(status: string) {
    switch (status.toLowerCase()) {
      case 'complete':
        return 'completed';
      case 'pending':
        return 'pending';
      case 'failed':
        return 'failed';
      default:
        return 'processing';
    }
  }
}

// Export singleton instance
export const payfastPayment = new PayFastPayment(); 