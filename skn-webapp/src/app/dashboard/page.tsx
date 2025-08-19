'use client';

import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { 
  UserIcon, 
  CurrencyDollarIcon, 
  StarIcon, 
  UsersIcon, 
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'processing':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case 'failed':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStarLevelInfo = (level: number) => {
    const starLevels = [
      { level: 1, pairs: '10/10', reward: '500 PKR' },
      { level: 2, pairs: '30/30', reward: '1,500 PKR' },
      { level: 3, pairs: '100/100', reward: '3,000 PKR' },
      { level: 4, pairs: '550/550', reward: '25,000 PKR' },
      { level: 5, pairs: '1,100/1,100', reward: '35,000 PKR' },
      { level: 6, pairs: '2,500/2,500', reward: '60,000 PKR' },
      { level: 7, pairs: '5,000/5,000', reward: '1,40,000 PKR' },
      { level: 8, pairs: '10,000/10,000', reward: '3,00,000 PKR' },
      { level: 9, pairs: '20,000/20,000', reward: '6,00,000 PKR' },
      { level: 10, pairs: '30,000/30,000', reward: '10,00,000 PKR' },
      { level: 11, pairs: '40,000/40,000', reward: '15,00,000 PKR' },
      { level: 12, pairs: '50,000/50,000', reward: '20,00,000 PKR' }
    ];
    return starLevels[level - 1] || { level: 0, pairs: '0/0', reward: '0 PKR' };
  };

  const currentStarInfo = getStarLevelInfo(user.starLevel);
  const nextStarInfo = getStarLevelInfo(user.starLevel + 1);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">SKN Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {user.name}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* First Step - Payment Banner */}
        {user.paymentStatus !== 'completed' && (
          <div className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <CurrencyDollarIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">🚀 Start Your SKN Journey!</h2>
                  <p className="text-blue-100 text-lg mt-1">
                    Complete your registration by paying the one-time joining fee of <span className="font-bold text-white">850 PKR</span>
                  </p>
                  <p className="text-blue-100 text-sm mt-2">
                    After payment, you&apos;ll unlock all features and start earning from your network!
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">850 PKR</div>
                <div className="text-blue-100 text-sm">One-time fee</div>
                <button 
                  onClick={() => router.push('/payment')}
                  className="mt-3 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Pay Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Earnings */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">{user.totalEarnings} PKR</p>
              </div>
            </div>
          </div>

          {/* Star Level */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <StarIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Star Level</p>
                <p className="text-2xl font-bold text-gray-900">{user.starLevel}</p>
                {user.starLevel > 0 && (
                  <p className="text-xs text-gray-500">{currentStarInfo.pairs} pairs</p>
                )}
              </div>
            </div>
          </div>

          {/* Left Pairs */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <UsersIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Left Pairs</p>
                <p className="text-2xl font-bold text-gray-900">{user.leftPairs}</p>
              </div>
            </div>
          </div>

          {/* Right Pairs */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <UsersIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Right Pairs</p>
                <p className="text-2xl font-bold text-gray-900">{user.rightPairs}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - User Info & Status */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Profile Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-900">{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-gray-900">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Referral Code:</span>
                  <span className="font-medium text-gray-900 font-mono">{user.referralCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Status Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(user.paymentStatus)}`}>
                    {getPaymentStatusIcon(user.paymentStatus)}
                    <span className="ml-2 capitalize">{user.paymentStatus}</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Registration Fee:</span>
                  <span className="font-medium text-gray-900">{user.registrationFee} PKR</span>
                </div>
                {user.paymentStatus === 'completed' && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-sm text-green-800">Payment completed! You can now start building your network.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Network & Earnings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Network Overview */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{user.leftPairs}</div>
                  <div className="text-sm text-blue-600 font-medium">Left Side Pairs</div>
                  <div className="text-xs text-blue-500 mt-1">Complete pairs for earnings</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{user.rightPairs}</div>
                  <div className="text-sm text-purple-600 font-medium">Right Side Pairs</div>
                  <div className="text-xs text-purple-500 mt-1">Complete pairs for earnings</div>
                </div>
              </div>
            </div>

            {/* Star Level Progress */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Star Level Progress</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Current Level:</span>
                  <span className="text-lg font-bold text-yellow-600">⭐ {user.starLevel}</span>
                </div>
                {user.starLevel > 0 && (
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-sm text-yellow-800">
                      <strong>Current Achievement:</strong> {currentStarInfo.pairs} pairs = {currentStarInfo.reward}
                    </div>
                  </div>
                )}
                {user.starLevel < 12 && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm text-blue-800">
                      <strong>Next Level:</strong> {nextStarInfo.pairs} pairs = {nextStarInfo.reward}
                    </div>
                    <div className="mt-2 text-xs text-blue-600">
                      You need {nextStarInfo.pairs} more pairs to reach Star Level {user.starLevel + 1}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center">
                  <UsersIcon className="h-6 w-6 mx-auto mb-2" />
                  <div className="font-medium">Invite Friends</div>
                  <div className="text-sm text-blue-100">Share your referral code</div>
                </button>
                <button className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center">
                  <ChartBarIcon className="h-6 w-6 mx-auto mb-2" />
                  <div className="font-medium">View Network</div>
                  <div className="text-sm text-green-100">See your team structure</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 