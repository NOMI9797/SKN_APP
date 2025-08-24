'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import Header from '../../components/Header';
import { WithdrawalRequestService } from '../../lib/withdrawalRequests';
import { WithdrawalRequest } from '../../types';

export default function WithdrawalPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    pin: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadWithdrawalRequests = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const requests = await WithdrawalRequestService.getWithdrawalRequestByUserId(user.$id);
      setWithdrawalRequests(requests);
    } catch (error) {
      console.error('Error loading withdrawal requests:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }

    if (user && (!user.isActive || user.paymentStatus !== 'approved')) {
      router.push('/dashboard');
      return;
    }

    if (user) {
      loadWithdrawalRequests();
    }
  }, [user, loading, router, loadWithdrawalRequests]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amount > (user.totalEarnings || 0)) {
      setError('Withdrawal amount cannot exceed your total earnings');
      return;
    }

    if (!formData.pin.trim()) {
      setError('Please enter your PIN');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      await WithdrawalRequestService.createWithdrawalRequest(
        user.$id,
        user.name,
        user.email,
        formData.pin,
        amount,
        user.totalEarnings || 0
      );

      setSuccess('Withdrawal request submitted successfully!');
      setFormData({ amount: '', pin: '' });
      loadWithdrawalRequests(); // Refresh the list
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to submit withdrawal request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon className="h-4 w-4" />;
      case 'rejected': return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'pending': return <ClockIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading withdrawal information...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Withdraw Earnings</h1>
            <p className="text-gray-600 text-lg">
              Request withdrawals using your unique PIN
            </p>
          </div>
        </div>

        {/* Earnings Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CurrencyDollarIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{user.totalEarnings || 0} PKR</div>
              <div className="text-sm text-gray-600">Total Earnings</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <KeyIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-blue-600">{user.referralPin || 'Not Set'}</div>
              <div className="text-sm text-gray-600">Your PIN</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{withdrawalRequests.length}</div>
              <div className="text-sm text-gray-600">Total Requests</div>
            </div>
          </div>
        </div>

        {/* Withdrawal Form */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Request Withdrawal</h2>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-800">{success}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Withdrawal Amount (PKR)
              </label>
              <input
                type="number"
                id="amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                placeholder="Enter amount"
                min="1"
                max={user.totalEarnings || 0}
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Maximum withdrawal: {user.totalEarnings || 0} PKR
              </p>
            </div>

            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
                Your PIN
              </label>
              <input
                type="text"
                id="pin"
                value={formData.pin}
                onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                placeholder="Enter your unique PIN"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Use the PIN provided to you after payment approval
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Withdrawal Request'}
            </button>
          </form>
        </div>

        {/* Withdrawal History */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Withdrawal History</h2>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading withdrawal history...</p>
            </div>
          ) : withdrawalRequests.length === 0 ? (
            <div className="text-center py-8">
              <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No withdrawal requests yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {withdrawalRequests.map((request) => (
                <div key={request.$id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(request.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{request.amount} PKR</p>
                      {request.adminNotes && (
                        <p className="text-sm text-gray-600 mt-1">Note: {request.adminNotes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Request ID</p>
                      <p className="text-xs text-gray-400 font-mono">{request.$id.slice(-8)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

