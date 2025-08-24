'use client';

import { useState, useEffect } from 'react';
import { AdminService } from '../lib/admin';
import { User } from '../types';
import PaymentRequestsTable from '@/components/PaymentRequestsTable';
import WithdrawalRequestsTable from './WithdrawalRequestsTable';
import PinManagement from './PinManagement';

interface AdminDashboardProps {
  adminUser: User;
}

export default function AdminDashboard({ adminUser }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'withdrawals' | 'pins' | 'users'>('overview');
  const [stats, setStats] = useState({
    pendingPayments: 0,
    pendingWithdrawals: 0,
    totalUsers: 0,
    activeUsers: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);
      
      // Load payment requests
      const paymentRequests = await AdminService.getPaymentRequests('pending');
      
      // Load withdrawal requests
      const withdrawalRequests = await AdminService.getWithdrawalRequests('pending');
      
      // Load users
      const allUsers = await AdminService.getAllUsers();
      const activeUsers = allUsers.filter(user => user.isActive);

      setStats({
        pendingPayments: paymentRequests.length,
        pendingWithdrawals: withdrawalRequests.length,
        totalUsers: allUsers.length,
        activeUsers: activeUsers.length
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 text-gray-400">
            {icon}
          </div>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  const TabButton = ({ id, label, count }: { id: string; label: string; count?: number }) => (
    <button
      onClick={() => setActiveTab(id as any)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        activeTab === id
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
      }`}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          {count}
        </span>
      )}
    </button>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <div className="text-sm text-gray-500">
                Welcome, {adminUser.name || adminUser.email}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                adminUser.userType === 'super_admin' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {adminUser.userType === 'super_admin' ? 'Super Admin' : 'Admin'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <TabButton id="overview" label="Overview" />
            <TabButton id="payments" label="Payment Requests" count={stats.pendingPayments} />
            <TabButton id="withdrawals" label="Withdrawal Requests" count={stats.pendingWithdrawals} />
            <TabButton id="pins" label="PIN Management" />
            <TabButton id="users" label="User Management" />
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Pending Payments"
                value={stats.pendingPayments}
                color="border-yellow-500"
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                }
              />
              <StatCard
                title="Pending Withdrawals"
                value={stats.pendingWithdrawals}
                color="border-red-500"
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
              />
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                color="border-blue-500"
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                }
              />
              <StatCard
                title="Active Users"
                value={stats.activeUsers}
                color="border-green-500"
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('payments')}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-6 h-6 text-yellow-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Review Payments</p>
                    <p className="text-sm text-gray-500">{stats.pendingPayments} pending</p>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('withdrawals')}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Review Withdrawals</p>
                    <p className="text-sm text-gray-500">{stats.pendingWithdrawals} pending</p>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-6 h-6 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Manage Users</p>
                    <p className="text-sm text-gray-500">{stats.totalUsers} total</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Payment Requests</h3>
            </div>
            <div className="p-6">
              <PaymentRequestsTable onRefresh={loadDashboardStats} />
            </div>
          </div>
        )}

        {activeTab === 'withdrawals' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Withdrawal Requests</h3>
            </div>
            <div className="p-6">
              <WithdrawalRequestsTable onRefresh={loadDashboardStats} />
            </div>
          </div>
        )}

        {activeTab === 'pins' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">PIN Management</h3>
            </div>
            <div className="p-6">
              <PinManagement onRefresh={loadDashboardStats} adminUser={adminUser} />
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">User Management</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-500">User management component will be implemented here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
