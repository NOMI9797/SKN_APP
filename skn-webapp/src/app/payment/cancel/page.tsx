'use client';

import { useRouter } from 'next/navigation';
import { XCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function PaymentCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {/* Cancel Icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircleIcon className="h-12 w-12 text-red-600" />
        </div>

        {/* Cancel Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Payment Cancelled
        </h1>
        
        <p className="text-gray-600 mb-6">
          Your payment was cancelled. You can try again anytime to complete your registration.
        </p>

        {/* What Happens Next */}
        <div className="bg-yellow-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-900 mb-2">What Happens Next?</h3>
          <p className="text-sm text-yellow-800">
            Your account remains inactive until payment is completed. No charges were made.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/payment"
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
          >
            Try Payment Again
          </Link>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Note */}
        <p className="text-xs text-gray-500 mt-6">
          Need help? Contact our support team for assistance.
        </p>
      </div>
    </div>
  );
} 