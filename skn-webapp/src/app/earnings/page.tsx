'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  CurrencyDollarIcon, 
  StarIcon, 
  ChartBarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { databaseService } from '../../lib/database';
import Header from '../../components/Header';

interface EarningData {
  $id: string;
  sourceType: 'pair' | 'star_reward' | 'manual';
  sourceId: string;
  amount: number;
  currency: string;
  balanceAfter?: number;
  note?: string;
  createdAt: string;
}

interface StarLevelData {
  $id: string;
  level: number;
  requiredPairs: number;
  rewardAmount: number;
  title: string;
  isActive: boolean;
}

export default function EarningsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [earnings, setEarnings] = useState<EarningData[]>([]);
  const [starLevels, setStarLevels] = useState<StarLevelData[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);

  const loadEarningsData = useCallback(async () => {
    if (!user) return;
    
    try {
      setDataLoading(true);
      
      // Load user earnings
      const userEarnings = await databaseService.getEarningsByUserId(user.$id);
      setEarnings(userEarnings);
      
      // Calculate total earnings
      const total = userEarnings.reduce((sum, earning) => sum + earning.amount, 0);
      setTotalEarnings(total);
      
      // Load star levels
      const levels = await databaseService.getStarLevels();
      setStarLevels(levels);
      
    } catch (error) {
      console.error('Error loading earnings data:', error);
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }

    if (user && user.paymentStatus !== 'completed') {
      router.push('/payment');
      return;
    }

    if (user) {
      loadEarningsData();
    }
  }, [user, loading, router, loadEarningsData]);

  const getSourceTypeLabel = (sourceType: string) => {
    switch (sourceType) {
      case 'pair': return 'Pair Completion';
      case 'star_reward': return 'Star Level Reward';
      case 'manual': return 'Manual Adjustment';
      default: return sourceType;
    }
  };

  const getSourceTypeColor = (sourceType: string) => {
    switch (sourceType) {
      case 'pair': return 'bg-blue-100 text-blue-800';
      case 'star_reward': return 'bg-yellow-100 text-yellow-800';
      case 'manual': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your earnings...</p>
        </div>
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading earnings data...</p>
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
          <p className="text-gray-600 mb-4">Please complete your payment to view earnings</p>
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Earnings & Rewards</h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">Track your income from pair completions and star level achievements</p>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-sm text-gray-500">Total Earnings</div>
              <div className="text-2xl sm:text-3xl font-bold text-green-600">{totalEarnings} PKR</div>
            </div>
          </div>
        </div>

        {/* Earnings Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Pairs Completed</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{user.pairsCompleted || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <StarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Current Star Level</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{user.starLevel || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CurrencyDollarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">This Month</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {earnings
                    .filter(e => new Date(e.createdAt).getMonth() === new Date().getMonth())
                    .reduce((sum, e) => sum + e.amount, 0)} PKR
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Star Level Progress */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Star Level Progress</h2>
          <div className="space-y-3 sm:space-y-4">
            {starLevels.slice(0, 5).map((level) => (
              <div key={level.$id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs sm:text-sm font-bold text-yellow-600">{level.level}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base">{level.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-500">{level.requiredPairs} pairs required</p>
                    </div>
                  </div>
                  <div className="text-center sm:text-right">
                    <div className="text-base sm:text-lg font-bold text-green-600">{level.rewardAmount} PKR</div>
                    <div className="text-xs sm:text-sm text-gray-500">Reward</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      (user.pairsCompleted || 0) >= level.requiredPairs 
                        ? 'bg-green-500' 
                        : 'bg-blue-500'
                    }`}
                    style={{ 
                      width: `${Math.min(((user.pairsCompleted || 0) / level.requiredPairs) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs sm:text-sm text-gray-500 mt-2">
                  <span>{user.pairsCompleted || 0} / {level.requiredPairs} pairs</span>
                  <span>
                    {Math.max(0, level.requiredPairs - (user.pairsCompleted || 0))} more needed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Earnings Breakdown */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Earnings Breakdown</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4 bg-blue-50 rounded-lg">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">400 PKR</div>
                <div className="text-xs sm:text-sm text-blue-700">1st Pair</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">200 PKR</div>
                <div className="text-xs sm:text-sm text-blue-700">2nd-99th Pairs</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">100 PKR</div>
                <div className="text-xs sm:text-sm text-blue-700">100th+ Pairs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Earnings */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Recent Earnings</h2>
          {earnings.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {earnings.slice(0, 10).map((earning) => (
                <div key={earning.$id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CurrencyDollarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 text-sm sm:text-base truncate">
                        {getSourceTypeLabel(earning.sourceType)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        {new Date(earning.createdAt).toLocaleDateString()}
                      </div>
                      {earning.note && (
                        <div className="text-xs text-gray-400 truncate">{earning.note}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSourceTypeColor(earning.sourceType)}`}>
                      {earning.sourceType}
                    </span>
                    <div className="text-right">
                      <div className="font-bold text-green-600 text-sm sm:text-base">+{earning.amount} PKR</div>
                      <div className="text-xs text-gray-500">{earning.currency}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <CurrencyDollarIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Earnings Yet</h3>
              <p className="text-gray-500 text-sm sm:text-base">Start building your network to earn from pair completions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 