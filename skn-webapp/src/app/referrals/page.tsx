'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  UserGroupIcon, 
  UserPlusIcon, 
  ShareIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { databaseService } from '../../lib/database';
import Header from '../../components/Header';

interface ReferralData {
  $id: string;
  name: string;
  email: string;
  paymentStatus: string;
  createdAt: string;
  side?: 'left' | 'right';
}

export default function ReferralsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'direct' | 'network'>('overview');
  const [directReferrals, setDirectReferrals] = useState<ReferralData[]>([]);
  const [referralTree, setReferralTree] = useState<ReferralData[]>([]);
  const [referralCode, setReferralCode] = useState('');
  const [dataLoading, setDataLoading] = useState(true);
  const [clickCount, setClickCount] = useState(0);
  const [registrationCount, setRegistrationCount] = useState(0);

  const loadReferralData = useCallback(async () => {
    if (!user) return;
    
    try {
      setDataLoading(true);
      
      // Load direct referrals
      const referrals = await databaseService.getDirectReferrals(user.$id);
      setDirectReferrals(referrals);
      
      // Load referral tree (first 5 levels)
      const tree = await databaseService.getReferralTree(user.$id, 5);
      setReferralTree(tree);

      // Load referral events (clicks and registrations) for funnel metrics
      const events = await databaseService.getReferralsBySponsorId(user.$id);
      const clicks = events.filter((e: any) => e.status === 'clicked').length;
      const regs = events.filter((e: any) => e.status === 'registered').length;
      setClickCount(clicks);
      setRegistrationCount(regs);
      
    } catch (error) {
      console.error('Error loading referral data:', error);
    } finally {
      setDataLoading(false);
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
      console.log('User authenticated and payment completed, loading referral data');
      loadReferralData();
      setReferralCode(user.referralCode || '');
    }
  }, [user, loading, router, loadReferralData]);

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      // You could add a toast notification here
      alert('Referral code copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy referral code:', error);
    }
  };

  const shareReferralLink = () => {
    const referralLink = `${window.location.origin}/register?ref=${referralCode}`;
    if (navigator.share) {
      navigator.share({
        title: 'Join SKN Network Marketing',
        text: 'Join my network and start earning! Use my referral code: ' + referralCode,
        url: referralLink,
      });
    } else {
      // Fallback to copying link
      navigator.clipboard.writeText(referralLink);
      alert('Referral link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your referrals...</p>
        </div>
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading referral data...</p>
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
          <p className="text-gray-600 mb-4">Please complete your payment to access referrals</p>
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Referral Network</h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">Build your team and start earning from your network</p>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-sm text-gray-500">Total Referrals</div>
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{directReferrals.length}</div>
            </div>
          </div>
        </div>

        {/* Referral Code Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-semibold mb-2">Your Referral Code</h2>
              <p className="text-blue-100 mb-4 text-sm sm:text-base">Share this code with friends to start building your network</p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="bg-white bg-opacity-20 rounded-lg px-3 sm:px-4 py-2 w-full sm:w-auto">
                  <span className="font-mono text-base sm:text-lg font-bold break-all">{referralCode}</span>
                </div>
                <div className="flex space-x-2 w-full sm:w-auto">
                  <button
                    onClick={copyReferralCode}
                    className="flex-1 sm:flex-none bg-white text-blue-600 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
                  >
                    Copy Code
                  </button>
                  <button
                    onClick={shareReferralLink}
                    className="flex-1 sm:flex-none bg-white text-blue-600 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
                  >
                    Share Link
                  </button>
                </div>
              </div>
            </div>
            <div className="hidden lg:block text-right">
              <UserGroupIcon className="h-16 w-16 text-white opacity-80" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6 sm:mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto">
              {[
                { id: 'overview', name: 'Overview', icon: UserGroupIcon },
                { id: 'direct', name: 'Direct Referrals', icon: UserPlusIcon },
                { id: 'network', name: 'Network Tree', icon: ShareIcon },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'overview' | 'direct' | 'network')}
                  className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 sm:p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
                  <div className="text-center p-4 sm:p-6 bg-blue-50 rounded-lg">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">{directReferrals.length}</div>
                    <div className="text-blue-800 font-medium text-sm sm:text-base">Total Referrals</div>
                    <div className="text-blue-600 text-xs sm:text-sm">People you&apos;ve invited</div>
                  </div>
                  <div className="text-center p-4 sm:p-6 bg-green-50 rounded-lg">
                    <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">
                      {directReferrals.filter(r => r.paymentStatus === 'completed').length}
                    </div>
                    <div className="text-green-800 font-medium text-sm sm:text-base">Active Members</div>
                    <div className="text-green-600 text-xs sm:text-sm">Completed payments</div>
                  </div>
                  <div className="text-center p-4 sm:p-6 bg-yellow-50 rounded-lg">
                    <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-2">
                      {directReferrals.filter(r => r.paymentStatus !== 'completed').length}
                    </div>
                    <div className="text-yellow-800 font-medium text-sm sm:text-base">Pending</div>
                    <div className="text-yellow-600 text-xs sm:text-sm">Awaiting payment</div>
                  </div>
                </div>

                {/* Referral Funnel */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                  <div className="text-center p-4 sm:p-6 bg-white border border-gray-200 rounded-lg">
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{clickCount}</div>
                    <div className="text-gray-700 font-medium text-sm sm:text-base">Referral Link Clicks</div>
                    <div className="text-gray-500 text-xs sm:text-sm">Unique clicks recorded</div>
                  </div>
                  <div className="text-center p-4 sm:p-6 bg-white border border-gray-200 rounded-lg">
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{registrationCount}</div>
                    <div className="text-gray-700 font-medium text-sm sm:text-base">Registrations from Referrals</div>
                    <div className="text-gray-500 text-xs sm:text-sm">Signed up using your code</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">How It Works</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    <div className="text-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-lg sm:text-xl font-bold text-blue-600">1</span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Share Your Code</h4>
                      <p className="text-xs sm:text-sm text-gray-600">Share your referral code with friends and family</p>
                    </div>
                    <div className="text-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-lg sm:text-xl font-bold text-green-600">2</span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">They Join</h4>
                      <p className="text-xs sm:text-sm text-gray-600">They register using your referral code</p>
                    </div>
                    <div className="text-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-lg sm:text-xl font-bold text-purple-600">3</span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Start Earning</h4>
                      <p className="text-xs sm:text-sm text-gray-600">Earn from their network growth and pair completions</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Direct Referrals Tab */}
            {activeTab === 'direct' && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Direct Referrals</h3>
                {directReferrals.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3">
                    {directReferrals.slice(0, 5).map((referral) => (
                      <div key={referral.$id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs sm:text-sm font-medium text-blue-600">
                              {referral.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 text-sm sm:text-base truncate">{referral.name || 'User'}</div>
                            <div className="text-xs sm:text-sm text-gray-500 truncate">{referral.email}</div>
                            <div className="text-xs text-gray-400">
                              Joined {new Date(referral.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap">
                          {referral.side && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              referral.side === 'left' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {referral.side === 'left' ? 'Left' : 'Right'}
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            referral.paymentStatus === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {referral.paymentStatus === 'completed' ? (
                              <>
                                <CheckCircleIcon className="h-3 w-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <ClockIcon className="h-3 w-3 mr-1" />
                                Pending Payment
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <UserGroupIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Referrals Yet</h3>
                    <p className="text-gray-500 text-sm sm:text-base mb-4">Start building your network by sharing your referral code</p>
                    <button
                      onClick={shareReferralLink}
                      className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                    >
                      Share Referral Code
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Network Tree Tab */}
            {activeTab === 'network' && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Network Tree (First 5 Levels)</h3>
                {referralTree.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3">
                    {referralTree.map((member, index) => (
                      <div key={member.$id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs sm:text-sm font-medium text-purple-600">
                              {member.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 text-sm sm:text-base truncate">{member.name || 'User'}</div>
                            <div className="text-xs sm:text-sm text-gray-500 truncate">{member.email}</div>
                            <div className="text-xs text-gray-400">
                              Level {Math.floor(index / 2) + 1} • {member.side || 'Unknown'} side
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            member.paymentStatus === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {member.paymentStatus === 'completed' ? 'Active' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <ShareIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Network Tree Empty</h3>
                    <p className="text-gray-500 text-sm sm:text-base">Your network tree will appear here as you build your team</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 