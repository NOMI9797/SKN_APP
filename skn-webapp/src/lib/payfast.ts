import { MD5 } from 'crypto-js';

// PayFast Configuration
export const PAYFAST_CONFIG = {
  // Sandbox (Development) Configuration
  SANDBOX: {
    // First try your custom credentials, then fall back to official PayFast sandbox credentials
    MERCHANT_ID: process.env.NEXT_PUBLIC_PAYFAST_SANDBOX_MERCHANT_ID || '10000100',
    MERCHANT_KEY: process.env.NEXT_PUBLIC_PAYFAST_SANDBOX_MERCHANT_KEY || '46f0cd694581a',
    PASS_PHRASE: process.env.NEXT_PUBLIC_PAYFAST_SANDBOX_PASS_PHRASE || 'jtKNOGTbFmFaUZV',
    // PASS_PHRASE: '', // No passphrase for sandbox testing
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
    userEmail?: string; // User email (optional)
    userName?: string; // User name (optional)
  }) {
    // PayFast required fields for payment processing
    const data: Record<string, string> = {
      merchant_id: this.config.MERCHANT_ID,
      merchant_key: this.config.MERCHANT_KEY,
      return_url: PAYFAST_CONFIG.RETURN_URL,
      cancel_url: PAYFAST_CONFIG.CANCEL_URL,
      notify_url: PAYFAST_CONFIG.NOTIFY_URL,
      
      // Customer details (required by PayFast)
      name_first: paymentData.userName || 'Customer',
      name_last: 'User',
      email_address: paymentData.userEmail || 'test@example.com',
      
      // Payment identification (required)
      m_payment_id: `SKN_${Date.now()}`, // Unique payment ID
      
      // Payment details (required)
      amount: Number(paymentData.amount).toFixed(2), // Ensure exactly 2 decimal places as string
      item_name: paymentData.itemName,
      item_description: paymentData.itemDescription,
      
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
    // PayFast requires SPECIFIC ORDER - NOT alphabetical sorting!
    // Official PayFast parameter order from their documentation:
    const parameterOrder = [
      'merchant_id',
      'merchant_key', 
      'return_url',
      'cancel_url',
      'notify_url',
      'name_first',
      'name_last', 
      'email_address',
      'm_payment_id',
      'amount',
      'item_name',
      'item_description',
      'custom_int1',
      'custom_int2',
      'custom_int3',
      'custom_int4',
      'custom_int5',
      'custom_str1',
      'custom_str2',
      'custom_str3',
      'custom_str4',
      'custom_str5'
    ];
    
    // 1. Filter out signature field and empty values
    const filtered: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (key === 'signature') continue;  // Skip signature field
      if (value === null || value === undefined) continue;  // Skip null/undefined
      
      const stringValue = String(value).trim();  // Convert to string and trim
      if (stringValue === '') continue;  // Skip empty strings
      
      filtered[key] = stringValue;  // Store as string
    }
    
    // 2. Build query string in PayFast's SPECIFIC ORDER (not alphabetical!)
    const queryParts: string[] = [];
    
    for (const key of parameterOrder) {
      if (filtered[key]) {
        // PayFast specific encoding: spaces as +, uppercase hex codes
        const encodedValue = encodeURIComponent(filtered[key])
          .replace(/%20/g, '+')  // Spaces as +
          .replace(/%([0-9A-F]{2})/g, (match, hex) => `%${hex.toUpperCase()}`); // Uppercase hex
        
        queryParts.push(`${key}=${encodedValue}`);
      }
    }
    
    const query = queryParts.join('&');
    
    // 3. Append passphrase if set (don't URL encode the passphrase itself)
    let finalString = query;
    if (this.config.PASS_PHRASE && this.config.PASS_PHRASE.trim().length > 0) {
      finalString = `${query}&passphrase=${this.config.PASS_PHRASE.trim()}`;
      console.log('Passphrase added to final string');
    } else {
      console.log('No passphrase set - using query string as is');
    }
    
    // Debug logging for signature generation
    console.log('=== PayFast Signature Generation (CORRECT ORDER) ===');
    console.log('Filtered fields:', filtered);
    console.log('Parameter order used:', parameterOrder.filter(key => filtered[key]));
    console.log('Query string:', query);
    console.log('Passphrase value:', this.config.PASS_PHRASE);
    console.log('Final string to hash:', finalString);
    console.log('Final string length:', finalString.length);
    
    // 4. Generate MD5 hash of the final string (lowercase)
    const signature = MD5(finalString).toString().toLowerCase();
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