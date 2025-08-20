'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  CreditCardIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { databaseService } from '../../lib/database';

export default function PaymentPage() {
  const { user, loading, updateProfile } = useAuth();
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'jazzcash' | 'easypaisa' | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [showPaymentButton, setShowPaymentButton] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }

    if (user && user.paymentStatus === 'completed') {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleMethodSelect = (method: 'jazzcash' | 'easypaisa') => {
    setSelectedMethod(method);
    setAccountNumber('');
    setShowPaymentButton(false);
  };

  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAccountNumber(value);
    // Show payment button only if account number is entered
    setShowPaymentButton(value.trim().length > 0);
  };

  const handlePayment = async () => {
    if (!user || !selectedMethod || !accountNumber.trim()) return;

    try {
      setIsProcessing(true);
      setPaymentStatus('processing');

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create user document in database if it doesn't exist
      let userDoc = await databaseService.getUserByEmail(user.email);
      if (!userDoc) {
        // Create new user document with MLM fields - use the same ID as auth user
        userDoc = await databaseService.createUserWithId(user.$id, {
          name: user.name,
          email: user.email,
          referralCode: user.referralCode || '',
          isActive: true,
          rightPairs: 0,
          leftPairs: 0,
          totalEarnings: 0,
          starLevel: 0,
          registrationFee: 850,
          paymentStatus: 'completed',
          userId: user.$id,
          depth: 0,
          leftActiveCount: 0,
          rightActiveCount: 0,
          pairsCompleted: 0,
        });
      } else {
        // Update existing user document
        userDoc = await databaseService.updateUser(userDoc.$id, {
          paymentStatus: 'completed',
          isActive: true,
          registrationFee: 850,
        });
      }

      // Create payment record in database
      await databaseService.createPayment({
        userId: user.$id,
        type: 'join_fee',
        amount: 850,
        currency: 'PKR',
        status: 'completed',
        gateway: selectedMethod,
        externalTransactionId: `SKN_${Date.now()}`,
        notes: `Registration fee paid via ${selectedMethod}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Update local user state
      await updateProfile({
        paymentStatus: 'completed',
        isActive: true,
        registrationFee: 850,
      });

      setPaymentStatus('completed');
      
      // Redirect to dashboard after successful payment
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
    } finally {
      setIsProcessing(false);
    }
  };

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

  if (user.paymentStatus === 'completed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Already Completed!</h2>
          <p className="text-gray-600 mb-4">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Registration</h1>
            <p className="text-gray-600">Pay the one-time registration fee to unlock all features</p>
          </div>
        </div>

        {/* Payment Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Payment Method Selection */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Choose Payment Method</h2>
            
            {/* Payment Methods */}
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              <button
                onClick={() => handleMethodSelect('jazzcash')}
                className={`w-full p-3 sm:p-4 border-2 rounded-lg text-left transition-all ${
                  selectedMethod === 'jazzcash'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center text-xl sm:text-2xl">
                    📱
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">JazzCash</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Pay using JazzCash mobile wallet</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleMethodSelect('easypaisa')}
                className={`w-full p-3 sm:p-4 border-2 rounded-lg text-left transition-all ${
                  selectedMethod === 'easypaisa'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center text-xl sm:text-2xl">
                    💳
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">EasyPaisa</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Pay using EasyPaisa mobile wallet</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Account Number Input */}
            {selectedMethod && (
              <div className="mb-4 sm:mb-6">
                <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedMethod === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'} Account Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="accountNumber"
                    value={accountNumber}
                    onChange={handleAccountNumberChange}
                    placeholder={`Enter your ${selectedMethod === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'} account number`}
                    className="w-full pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter the mobile number registered with your {selectedMethod === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'} account
                </p>
              </div>
            )}

            {/* Payment Amount Display */}
            {selectedMethod && (
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">850 PKR</div>
                  <div className="text-xs sm:text-sm text-gray-600">One-time registration fee</div>
                </div>
              </div>
            )}

            {/* Payment Button */}
            {showPaymentButton && (
              <button
                onClick={handlePayment}
                disabled={isProcessing || paymentStatus === 'completed'}
                className={`w-full py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base ${
                  selectedMethod === 'jazzcash' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                    <span className="text-xs sm:text-sm">Processing Payment...</span>
                  </div>
                ) : paymentStatus === 'completed' ? (
                  <div className="flex items-center justify-center">
                    <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    <span className="text-xs sm:text-sm">Payment Completed!</span>
                  </div>
                ) : (
                  `Pay 850 PKR via ${selectedMethod === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'}`
                )}
              </button>
            )}

            {/* Status Messages */}
            {paymentStatus === 'processing' && (
              <div className="mt-3 sm:mt-4 p-3 bg-blue-50 rounded-lg text-center">
                <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mx-auto mb-2" />
                <div className="text-xs sm:text-sm text-blue-800">Processing your payment...</div>
              </div>
            )}

            {paymentStatus === 'completed' && (
              <div className="mt-3 sm:mt-4 p-3 bg-green-50 rounded-lg text-center">
                <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mx-auto mb-2" />
                <div className="text-xs sm:text-sm text-green-800">Payment successful! You can now access your dashboard.</div>
              </div>
            )}

            {paymentStatus === 'failed' && (
              <div className="mt-3 sm:mt-4 p-3 bg-red-50 rounded-lg text-center">
                <ExclamationTriangleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 mx-auto mb-2" />
                <div className="text-xs sm:text-sm text-red-800">Payment failed. Please try again.</div>
                <button
                  onClick={() => setPaymentStatus('pending')}
                  className="mt-2 bg-red-600 text-white px-3 sm:px-4 py-1 sm:py-2 rounded text-xs sm:text-sm hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          {/* What You Get */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">What You&apos;ll Get</h2>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start">
                <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900 text-sm sm:text-base">Full Access to SKN Platform</div>
                  <div className="text-xs sm:text-sm text-gray-600">Unlock all features and start building your network</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900 text-sm sm:text-base">Referral System</div>
                  <div className="text-xs sm:text-sm text-gray-600">Start referring people and earn from your network</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900 text-sm sm:text-base">Binary Tree Placement</div>
                  <div className="text-xs sm:text-sm text-gray-600">Automatic placement in the MLM structure</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900 text-sm sm:text-base">Earning Potential</div>
                  <div className="text-xs sm:text-sm text-gray-600">Earn from pair completions and star level achievements</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900 text-sm sm:text-base">Lifetime Access</div>
                  <div className="text-xs sm:text-sm text-gray-600">One-time payment, no recurring fees</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6 mt-6 sm:mt-8">
          <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-3">Payment Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm text-blue-800">
            <div>
              <strong>Amount:</strong> 850 PKR (One-time registration fee)
            </div>
            <div>
              <strong>Payment Methods:</strong> JazzCash & EasyPaisa
            </div>
            <div>
              <strong>Processing Time:</strong> Instant (for testing)
            </div>
            <div>
              <strong>Security:</strong> Secure payment processing
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 