'use client';

import { useState } from 'react';
import { WithdrawalRequestService } from '@/lib/withdrawalRequests';
import { useAuth } from '@/hooks/useAuth';

interface WithdrawalRequestFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function WithdrawalRequestForm({ onSuccess, onError }: WithdrawalRequestFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    userPin: '',
    amount: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.userPin.trim()) {
      newErrors.userPin = 'PIN is required';
    } else if (formData.userPin.length !== 8) {
      newErrors.userPin = 'PIN must be 8 characters long';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (user && parseFloat(formData.amount) > user.totalEarnings) {
      newErrors.amount = 'Insufficient balance for withdrawal';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      onError?.('User not authenticated');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Validate PIN matches user
      const isPinValid = await WithdrawalRequestService.validatePinForWithdrawal(
        formData.userPin,
        user.$id
      );

      if (!isPinValid) {
        setErrors(prev => ({ ...prev, userPin: 'Invalid PIN' }));
        return;
      }

      await WithdrawalRequestService.createWithdrawalRequest(
        user.$id,
        user.name,
        user.email,
        formData.userPin,
        parseFloat(formData.amount),
        user.totalEarnings
      );

      onSuccess?.();
      setFormData({
        userPin: '',
        amount: ''
      });
    } catch (error) {
      console.error('Withdrawal request error:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to submit withdrawal request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Withdrawal Request</h2>
        <p className="text-gray-600">
          Request a withdrawal using your referral PIN
        </p>
        {user && (
          <div className="mt-3 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Available Balance:</span> {user.totalEarnings} PKR
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* PIN */}
        <div>
          <label htmlFor="userPin" className="block text-sm font-medium text-gray-700 mb-2">
            Your Referral PIN
          </label>
          <input
            type="text"
            id="userPin"
            value={formData.userPin}
            onChange={(e) => setFormData(prev => ({ ...prev, userPin: e.target.value.toUpperCase() }))}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.userPin ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your 8-digit PIN"
            maxLength={8}
          />
          {errors.userPin && (
            <p className="mt-1 text-sm text-red-600">{errors.userPin}</p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Withdrawal Amount (PKR)
          </label>
          <input
            type="number"
            id="amount"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.amount ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter amount"
            min="1"
            step="1"
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
          )}
        </div>

        {/* Information Box */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Important Information
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Withdrawal requests are reviewed by admin</li>
                  <li>Processing time: 24-48 hours</li>
                  <li>You'll receive notification upon approval</li>
                  <li>Payment proof will be provided by admin</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </div>
          ) : (
            'Submit Withdrawal Request'
          )}
        </button>
      </form>
    </div>
  );
}

