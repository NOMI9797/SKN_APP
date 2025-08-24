'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import Header from '../../components/Header';
import PaymentRequestForm from '../../components/PaymentRequestForm';

export default function PaymentPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment information...</p>
        </div>
      </div>
    );
  }



  if (!user) {
    return null;
  }

  // Show loading while redirecting
  if (user.isActive && user.paymentStatus === 'approved') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Complete Your Registration</h1>
            <p className="text-gray-600 text-lg">
              Complete your payment to activate your account and start earning
            </p>
          </div>
        </div>

        {/* Payment Status Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="text-center">
            {user.paymentStatus === 'pending' && user.paymentRequestId ? (
              <>
                <ClockIcon className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Under Review</h2>
                <p className="text-gray-600 mb-6">
                  Your payment request has been submitted and is currently under review. 
                  You will be notified once it's approved.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                    <span className="text-blue-800">Payment request submitted and under review</span>
                  </div>
                </div>
              </>
            ) : user.paymentStatus === 'rejected' ? (
              <>
                <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Request Rejected</h2>
                <p className="text-gray-600 mb-6">
                  Your previous payment request was rejected. Please submit a new payment request with correct information.
                </p>
                <PaymentRequestForm 
                  onSuccess={() => {
                    window.location.reload();
                  }}
                  onError={(error: string) => {
                    console.error('Payment request error:', error);
                  }}
                />
              </>
            ) : (
              <>
                <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Required</h2>
                <p className="text-gray-600 mb-6">
                  To activate your account and start earning, please complete your payment below.
                </p>
                <PaymentRequestForm 
                  onSuccess={() => {
                    window.location.reload();
                  }}
                  onError={(error: string) => {
                    console.error('Payment request error:', error);
                  }}
                />
              </>
            )}
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Payment Information</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Registration Fee</h4>
                <p className="text-sm text-gray-600">One-time payment to activate your account</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">850 PKR</div>
                <div className="text-sm text-gray-500">Required</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Payment Methods</h4>
                <p className="text-sm text-gray-600">EasyPaisa or JazzCash</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-blue-600">Accepted</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Processing Time</h4>
                <p className="text-sm text-gray-600">Manual review by admin</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-orange-600">24-48 hours</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
