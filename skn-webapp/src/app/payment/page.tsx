'use client';

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { 
  CreditCardIcon, 
  ShieldCheckIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { PAYFAST_CONFIG, payfastPayment } from '../../lib/payfast';
import { PaymentFormData, PaymentMethod } from '../../types';
import { MD5 } from 'crypto-js';

// Note: Viewport configuration should be handled in layout.tsx to fix Next.js warning

export default function PaymentPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState<PaymentFormData>({
    paymentMethod: 'jazz_cash',
    amount: PAYFAST_CONFIG.REGISTRATION_FEE,
    agreeToTerms: false,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'jazz_cash',
      name: 'JazzCash',
      description: 'Pay using JazzCash mobile wallet',
      icon: '📱',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'easypaisa',
      name: 'EasyPaisa',
      description: 'Pay using EasyPaisa mobile wallet',
      icon: '💳',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setFormData(prev => ({ ...prev, paymentMethod: method.id }));
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Generate PayFast payment data
      const paymentData = payfastPayment.generatePaymentData({
        amount: formData.amount,
        itemName: 'SKN Registration Fee',
        itemDescription: 'One-time registration fee for SKN network marketing system',
        customStr1: user.$id, // User ID
        customStr2: formData.paymentMethod, // Payment method
        customStr3: user.referralCode || 'SKN_USER', // Referral code (fallback if empty)
        userEmail: user.email || 'test@example.com', // User email
        userName: user.name || 'Customer', // User name
      }) as Record<string, string | number>; // Type assertion to allow field access

      // Type guard to ensure paymentData has the expected structure
      if (!paymentData || typeof paymentData !== 'object') {
        throw new Error('Invalid payment data generated');
      }

      // Create payment record in database
      // This would typically be done via an API endpoint
      console.log('=== COMPLETE PAYMENT DEBUG ===');
      console.log('1. Generated payment data:', paymentData);
      console.log('2. PayFast URL:', PAYFAST_CONFIG.getCurrentConfig().PAYMENT_URL);
      console.log('3. Environment:', PAYFAST_CONFIG.ENVIRONMENT);
      console.log('4. Merchant ID:', PAYFAST_CONFIG.getCurrentConfig().MERCHANT_ID);
      console.log('5. Signature length:', typeof paymentData.signature === 'string' ? paymentData.signature.length : 'N/A');
      console.log('6. Signature value:', paymentData.signature);
      
      // Log the exact data structure being sent
      console.log('=== DATA STRUCTURE ANALYSIS ===');
      Object.entries(paymentData).forEach(([key, value]) => {
        console.log(`${key}: ${value} (type: ${typeof value}, length: ${typeof value === 'string' ? value.length : 'N/A'})`);
      });
      console.log('=====================================');
      
      // Validate required fields
      const requiredFields = ['merchant_id', 'merchant_key', 'amount', 'item_name', 'm_payment_id'];
      const missingFields = requiredFields.filter(field => !paymentData[field]);
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      // Validate signature length
      if (paymentData.signature && typeof paymentData.signature === 'string' && paymentData.signature.length !== 32) {
        throw new Error(`Invalid signature length: ${paymentData.signature.length} (expected 32)`);
      }
      
      // Test signature generation
      console.log('=== Payment Data Validation ===');
      console.log('All payment data:', paymentData);
      console.log('Required fields present:', requiredFields.every(field => !!paymentData[field]));
      console.log('Signature valid length:', paymentData.signature && typeof paymentData.signature === 'string' && paymentData.signature.length === 32);
      
      // Log the exact data structure being sent
      console.log('=== DATA BEING SENT TO PAYFAST ===');
      console.log('Form action:', PAYFAST_CONFIG.getCurrentConfig().PAYMENT_URL);
      console.log('Form method: POST');
      console.log('Form target: _blank');
      console.log('=====================================');
      
      // Manual signature verification for debugging
      console.log('=== MANUAL SIGNATURE VERIFICATION ===');
      console.log('Data without signature:', Object.fromEntries(
        Object.entries(paymentData).filter(([key]) => key !== 'signature')
      ));
      console.log('Our generated signature:', paymentData.signature);
      console.log('=====================================');

      // Redirect to PayFast payment page
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = PAYFAST_CONFIG.getCurrentConfig().PAYMENT_URL;
      form.target = '_blank';

      // Add payment data as hidden fields
      Object.entries(paymentData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(value); // Ensure all values are strings
        form.appendChild(input);
        console.log(`Adding field: ${key} = ${value}`);
      });

      console.log('=== FORM SUBMISSION ===');
      console.log('Form created with', form.children.length, 'hidden fields');
      console.log('Submitting to:', PAYFAST_CONFIG.getCurrentConfig().PAYMENT_URL);
      console.log('=====================================');

      document.body.appendChild(form);
      console.log('Form submitted to PayFast');
      form.submit();
      document.body.removeChild(form);

      // Show success message
      setError(null);
      
    } catch (err) {
      console.error('Payment error:', err);
      setError('Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Complete Registration</h1>
                <p className="text-sm text-gray-500">Pay registration fee to unlock all features</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Payment Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Payment Summary</h2>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{PAYFAST_CONFIG.REGISTRATION_FEE} PKR</div>
              <div className="text-sm text-gray-500">Registration Fee</div>
            </div>
          </div>
          
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Registration Fee:</span>
              <span>{PAYFAST_CONFIG.REGISTRATION_FEE} PKR</span>
            </div>
            <div className="flex justify-between">
              <span>Processing Fee:</span>
              <span>0 PKR</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between font-semibold text-gray-900">
                <span>Total Amount:</span>
                <span>{PAYFAST_CONFIG.REGISTRATION_FEE} PKR</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Choose Payment Method</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                onClick={() => handleMethodSelect(method)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedMethod?.id === method.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 ${method.bgColor} rounded-lg flex items-center justify-center text-2xl`}>
                    {method.icon}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${method.color}`}>{method.name}</h3>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Form */}
        {selectedMethod && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Complete Payment via {selectedMethod.name}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Payment Method Display */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${selectedMethod.bgColor} rounded-lg flex items-center justify-center text-xl`}>
                    {selectedMethod.icon}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${selectedMethod.color}`}>{selectedMethod.name}</h3>
                    <p className="text-sm text-gray-600">Selected payment method</p>
                  </div>
                </div>
              </div>

              {/* Amount Display */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{formData.amount} PKR</div>
                  <div className="text-sm text-blue-600">Amount to be charged</div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
                  I agree to the{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-500 underline">
                    Terms and Conditions
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-500 underline">
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                    <span className="text-sm text-red-800">{error}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing || !formData.agreeToTerms}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
                  isProcessing || !formData.agreeToTerms
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  `Pay ${formData.amount} PKR via ${selectedMethod.name}`
                )}
              </button>
              
              {/* Test Signature Button */}
              <button
                type="button"
                onClick={() => {
                  console.log('=== TESTING SIGNATURE GENERATION ===');
                  
                  // First, verify configuration
                  console.log('=== CONFIGURATION VERIFICATION ===');
                  console.log('Environment:', PAYFAST_CONFIG.ENVIRONMENT);
                  console.log('Merchant ID:', PAYFAST_CONFIG.getCurrentConfig().MERCHANT_ID);
                  console.log('Merchant Key:', PAYFAST_CONFIG.getCurrentConfig().MERCHANT_KEY);
                  console.log('Passphrase:', PAYFAST_CONFIG.getCurrentConfig().PASS_PHRASE ? '***' : 'none');
                  console.log('=====================================');
                  
                  // Test passphrase directly
                  console.log('=== PASSPHRASE TEST ===');
                  console.log('Direct passphrase check:', PAYFAST_CONFIG.getCurrentConfig().PASS_PHRASE);
                  console.log('Passphrase length:', PAYFAST_CONFIG.getCurrentConfig().PASS_PHRASE?.length || 0);
                  console.log('Passphrase === expected:', PAYFAST_CONFIG.getCurrentConfig().PASS_PHRASE === 'jtKNOGTbFmFaUZV');
                  console.log('=====================================');
                  
                  const testData = payfastPayment.generateTestSignature();
                  console.log('Test data with signature:', testData);
                  
                  // Manual verification of signature generation
                  console.log('=== MANUAL SIGNATURE VERIFICATION ===');
                  const testDataWithoutSignature = Object.fromEntries(
                    Object.entries(testData).filter(([key]) => key !== 'signature')
                  );
                  
                  // Sort keys alphabetically
                  const sortedKeys = Object.keys(testDataWithoutSignature).sort();
                  const queryString = sortedKeys
                    .map(key => `${key}=${encodeURIComponent(String((testDataWithoutSignature as any)[key]))}`)
                    .join('&');
                  
                  // Add passphrase
                  const finalString = `${queryString}&passphrase=${encodeURIComponent(PAYFAST_CONFIG.getCurrentConfig().PASS_PHRASE || '')}`;
                  
                  console.log('Query string:', queryString);
                  console.log('Final string with passphrase:', finalString);
                  console.log('Expected signature:', (testData as any).signature);
                  
                  // Direct comparison with generateSignature method
                  console.log('=== DIRECT COMPARISON ===');
                  const methodSignature = payfastPayment.generateSignature(testDataWithoutSignature);
                  console.log('Manual signature (MD5 of final string):', MD5(finalString).toString());
                  console.log('Method signature:', methodSignature);
                  console.log('Signatures match:', MD5(finalString).toString() === methodSignature);
                  console.log('=====================================');
                  
                  // Try submitting test data to see if PayFast accepts it
                  const form = document.createElement('form');
                  form.method = 'POST';
                  form.action = PAYFAST_CONFIG.getCurrentConfig().PAYMENT_URL;
                  form.target = '_blank';
                  
                  Object.entries(testData).forEach(([key, value]) => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = String(value);
                    form.appendChild(input);
                  });
                  
                  document.body.appendChild(form);
                  form.submit();
                  document.body.removeChild(form);
                }}
                className="w-full mt-3 py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
              >
                Test Signature with Known Data
              </button>
            </form>
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ShieldCheckIcon className="h-6 w-6 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">Secure Payment</h3>
              <p className="text-sm text-blue-800 mt-1">
                Your payment is processed securely through PayFast. We never store your payment details.
                {PAYFAST_CONFIG.ENVIRONMENT === 'SANDBOX' && (
                  <span className="block mt-2 font-medium">
                    🧪 <strong>Development Mode:</strong> This is a sandbox environment for testing purposes.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 