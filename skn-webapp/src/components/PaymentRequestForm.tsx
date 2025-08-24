'use client';

import { useState } from 'react';
import { PaymentRequestService } from '@/lib/paymentRequests';
import { useAuth } from '@/hooks/useAuth';

interface PaymentRequestFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function PaymentRequestForm({ onSuccess, onError }: PaymentRequestFormProps) {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    paymentType: 'easypaisa' as 'easypaisa' | 'jazzcash',
    amount: '',
    transactionId: '',
    screenshot: null as File | null
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || parseFloat(formData.amount) < 850) {
      newErrors.amount = 'Payment amount must be at least 850 PKR';
    }

    if (!formData.transactionId.trim()) {
      newErrors.transactionId = 'Transaction ID is required';
    }

    if (!formData.screenshot) {
      newErrors.screenshot = 'Payment screenshot is required';
    } else if (formData.screenshot.size > 5 * 1024 * 1024) { // 5MB limit
      newErrors.screenshot = 'File size must be less than 5MB';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, screenshot: 'Please select an image file' }));
        return;
      }
      setFormData(prev => ({ ...prev, screenshot: file }));
      setErrors(prev => ({ ...prev, screenshot: '' }));
    }
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
      const paymentRequest = await PaymentRequestService.createPaymentRequest(
        user.$id,
        user.name,
        user.email,
        formData.paymentType,
        parseFloat(formData.amount),
        formData.transactionId,
        formData.screenshot!
      );

      // Update local user state to reflect the new payment status
      if (user) {
        updateProfile({
          paymentStatus: 'pending',
          paymentRequestId: paymentRequest.$id
        });
      }
      
      onSuccess?.();
      setFormData({
        paymentType: 'easypaisa',
        amount: '',
        transactionId: '',
        screenshot: null
      });
    } catch (error) {
      console.error('Payment request error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to submit payment request';
      if (error instanceof Error) {
        if (error.message.includes('upload')) {
          errorMessage = 'Failed to upload screenshot. Please try again with a smaller image.';
        } else if (error.message.includes('amount')) {
          errorMessage = 'Payment amount must be at least 850 PKR.';
        } else {
          errorMessage = error.message;
        }
      }
      
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Request</h2>
        <p className="text-gray-600">
          Submit your payment details for approval. Minimum amount: 850 PKR
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Payment Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="paymentType"
                value="easypaisa"
                checked={formData.paymentType === 'easypaisa'}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentType: e.target.value as 'easypaisa' | 'jazzcash' }))}
                className="mr-2"
              />
              <span className="text-sm font-medium">EasyPaisa</span>
            </label>
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="paymentType"
                value="jazzcash"
                checked={formData.paymentType === 'jazzcash'}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentType: e.target.value as 'easypaisa' | 'jazzcash' }))}
                className="mr-2"
              />
              <span className="text-sm font-medium">JazzCash</span>
            </label>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Amount (PKR)
          </label>
          <input
            type="number"
            id="amount"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500 ${
              errors.amount ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="850"
            min="850"
            step="1"
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
          )}
        </div>

        {/* Transaction ID */}
        <div>
          <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-2">
            Transaction ID
          </label>
          <input
            type="text"
            id="transactionId"
            value={formData.transactionId}
            onChange={(e) => setFormData(prev => ({ ...prev, transactionId: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500 ${
              errors.transactionId ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter transaction ID"
          />
          {errors.transactionId && (
            <p className="mt-1 text-sm text-red-600">{errors.transactionId}</p>
          )}
        </div>

        {/* Screenshot Upload */}
        <div>
          <label htmlFor="screenshot" className="block text-sm font-medium text-gray-700 mb-2">
            Payment Screenshot
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="screenshot"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                >
                  <span>Upload a file</span>
                  <input
                    id="screenshot"
                    name="screenshot"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
            </div>
          </div>
          {formData.screenshot && (
            <div className="mt-2 flex items-center text-sm text-gray-600">
              <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {formData.screenshot.name}
            </div>
          )}
          {errors.screenshot && (
            <p className="mt-1 text-sm text-red-600">{errors.screenshot}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            'Submit Payment Request'
          )}
        </button>
      </form>
    </div>
  );
}

