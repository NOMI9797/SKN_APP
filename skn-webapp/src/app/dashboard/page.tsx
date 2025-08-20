'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  StarIcon, 
  ChartBarIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { databaseService } from '../../lib/database';
import Header from '../../components/Header';

interface UserStats {
  totalReferrals: number;
  leftReferrals: number;
  rightReferrals: number;
  totalPairs: number;
  totalEarnings: number;
  currentStarLevel: number;
}

interface ReferralData {
  $id: string;
  name: string;
  email: string;
  paymentStatus: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [referralTree, setReferralTree] = useState<ReferralData[]>([]);
  const [directReferrals, setDirectReferrals] = useState<ReferralData[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    
    try {
      setStatsLoading(true);
      
      // Load user statistics - handle case where user might not exist in database yet
      let stats;
      try {
        stats = await databaseService.getUserStats(user.$id);
      } catch (error) {
        console.log('User not found in database yet, using local user data');
        // Use local user data as fallback
        stats = {
          totalReferrals: 0,
          leftReferrals: 0,
          rightReferrals: 0,
          totalPairs: user.pairsCompleted || 0,
          totalEarnings: user.totalEarnings || 0,
          currentStarLevel: user.starLevel || 0,
        };
      }
      setUserStats(stats);
      
      // Load referral tree (first 3 levels) - handle errors gracefully
      let tree: ReferralData[] = [];
      try {
        tree = await databaseService.getReferralTree(user.$id, 3);
      } catch (error) {
        console.log('Error loading referral tree:', error);
        tree = [];
      }
      setReferralTree(tree);
      
      // Load direct referrals - handle errors gracefully
      let referrals: ReferralData[] = [];
      try {
        referrals = await databaseService.getDirectReferrals(user.$id);
      } catch (error) {
        console.log('Error loading direct referrals:', error);
        referrals = [];
      }
      setDirectReferrals(referrals);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set default stats if everything fails
      setUserStats({
        totalReferrals: 0,
        leftReferrals: 0,
        rightReferrals: 0,
        totalPairs: user.pairsCompleted || 0,
        totalEarnings: user.totalEarnings || 0,
        currentStarLevel: user.starLevel || 0,
      });
      setReferralTree([]);
      setDirectReferrals([]);
    } finally {
      setStatsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      console.log('No user found, redirecting to home');
      router.push('/');
      return;
    }

    if (user && user.paymentStatus !== 'completed') {
      console.log('User payment not completed, redirecting to payment. Status:', user.paymentStatus);
      router.push('/payment');
      return;
    }

    if (user) {
      console.log('User authenticated and payment completed, loading dashboard data');
      loadDashboardData();
    }
  }, [user, loading, router, loadDashboardData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (user.paymentStatus !== 'completed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircleIcon className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Registration First</h2>
          <p className="text-gray-600 mb-4">Please complete your payment to access the dashboard</p>
          <button
            onClick={() => router.push('/payment')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Complete Payment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">Here&apos;s what&apos;s happening with your network today</p>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-sm text-gray-500">Current Star Level</div>
              <div className="text-xl sm:text-2xl font-bold text-yellow-600">{userStats?.currentStarLevel || 0} ⭐</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserGroupIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Referrals</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{userStats?.totalReferrals || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <ChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Pairs Completed</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{userStats?.totalPairs || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <CurrencyDollarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{userStats?.totalEarnings || 0} PKR</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <StarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Star Level</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{userStats?.currentStarLevel || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Network Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Left vs Right Referrals */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Network Balance</h2>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full mr-2 sm:mr-3"></div>
                  <span className="text-sm sm:text-base text-gray-700">Left Referrals</span>
                </div>
                <span className="font-semibold text-gray-900 text-sm sm:text-base">{userStats?.leftReferrals || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full mr-2 sm:mr-3"></div>
                  <span className="text-sm sm:text-base text-gray-700">Right Referrals</span>
                </div>
                <span className="font-semibold text-gray-900 text-sm sm:text-base">{userStats?.rightReferrals || 0}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2 sm:space-y-3">
              <button
                onClick={() => router.push('/referrals')}
                className="w-full flex items-center justify-between p-2 sm:p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm sm:text-base"
              >
                <span>View Referral Network</span>
                <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={() => router.push('/earnings')}
                className="w-full flex items-center justify-between p-2 sm:p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm sm:text-base"
              >
                <span>Check Earnings</span>
                <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={() => router.push('/profile')}
                className="w-full flex items-center justify-between p-2 sm:p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm sm:text-base"
              >
                <span>Edit Profile</span>
                <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          {directReferrals.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {directReferrals.slice(0, 5).map((referral, index) => (
                <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs sm:text-sm font-medium text-blue-600">
                        {referral.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{referral.name || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{referral.email}</p>
                    </div>
                  </div>
                  <div className="text-right ml-2 flex-shrink-0">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      referral.paymentStatus === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {referral.paymentStatus === 'completed' ? 'Active' : 'Pending Payment'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <UserGroupIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <p className="text-gray-500 text-sm sm:text-base">No referrals yet. Start building your network!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 