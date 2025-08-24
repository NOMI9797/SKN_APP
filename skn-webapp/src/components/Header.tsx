'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { NotificationService } from '../lib/notifications';
import NotificationCenter from './NotificationCenter';
import { 
  Bars3Icon, 
  XMarkIcon, 
  HomeIcon, 
  ArrowRightOnRectangleIcon,
  BellIcon
} from '@heroicons/react/24/outline';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Load notification count
  useEffect(() => {
    if (user) {
      const loadNotificationCount = async () => {
        try {
          const count = await NotificationService.getNotificationCount(user.$id);
          setNotificationCount(count);
        } catch (error) {
          console.error('Error loading notification count:', error);
        }
      };
      loadNotificationCount();
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  if (!user) return null;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-blue-600 hidden sm:block">SKN</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/dashboard" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              href="/referrals" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Referrals
            </Link>
            <Link 
              href="/earnings" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Earnings
            </Link>
            <Link 
              href="/profile" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Profile
            </Link>
            {(!user.isActive || user.paymentStatus !== 'approved') && (
              <Link 
                href="/payment" 
                className="text-red-600 hover:text-red-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Payment
              </Link>
            )}

            {/* Show withdrawal link for approved users */}
            {(user.isActive === true && user.paymentStatus === 'approved') && (
              <Link 
                href="/withdrawal" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Withdrawals
              </Link>
            )}
            
            {/* Show admin dashboard link for admin users */}
            {(user.userType === 'admin' || user.userType === 'super_admin') && (
              <Link 
                href="/admin/dashboard" 
                className="text-purple-600 hover:text-purple-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Admin Dashboard
              </Link>
            )}
          </nav>

          {/* User Info and Actions */}
          <div className="flex items-center space-x-4">
            {/* User Info - Hidden on small screens */}
            <div className="hidden sm:flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{user.name || user.email}</div>
                <div className="text-xs text-gray-500">
                  {(user.userType === 'admin' || user.userType === 'super_admin') 
                    ? (user.userType === 'super_admin' ? 'Super Admin' : 'Admin')
                    : (user.isActive === true && user.paymentStatus === 'approved') 
                      ? 'Active Member' 
                      : 'Pending Approval'
                  }
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {/* Notification Bell */}
              <button
                onClick={() => setIsNotificationOpen(true)}
                className="relative bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center space-x-1"
              >
                <BellIcon className="h-4 w-4" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>

              <Link
                href="/"
                className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center space-x-1"
              >
                <HomeIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Link>
              
              <button
                onClick={handleLogout}
                className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors flex items-center space-x-1"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-5 w-5" />
              ) : (
                <Bars3Icon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-3 space-y-1">
            {/* User Info in Mobile Menu */}
            <div className="px-3 py-2 border-b border-gray-100 mb-3">
              <div className="text-sm font-medium text-gray-900">{user.name || user.email}</div>
              <div className="text-xs text-gray-500">
                {(user.userType === 'admin' || user.userType === 'super_admin') 
                  ? (user.userType === 'super_admin' ? 'Super Admin' : 'Admin')
                  : (user.isActive === true && user.paymentStatus === 'approved') 
                    ? 'Active Member' 
                    : 'Pending Approval'
                }
              </div>
            </div>

            {/* Mobile Navigation Links */}
            <Link
              href="/dashboard"
              onClick={closeMobileMenu}
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/referrals"
              onClick={closeMobileMenu}
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              Referrals
            </Link>
            <Link
              href="/earnings"
              onClick={closeMobileMenu}
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              Earnings
            </Link>
            <Link
              href="/profile"
              onClick={closeMobileMenu}
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              Profile
            </Link>
            {(!user.isActive || user.paymentStatus !== 'approved') && (
              <Link
                href="/payment"
                onClick={closeMobileMenu}
                className="block px-3 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              >
                Payment
              </Link>
            )}
            {/* Show withdrawal link for approved users */}
            {(user.isActive === true && user.paymentStatus === 'approved') && (
              <Link
                href="/withdrawal"
                onClick={closeMobileMenu}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              >
                Withdrawals
              </Link>
            )}
            
            {/* Show admin dashboard link for admin users */}
            {(user.userType === 'admin' || user.userType === 'super_admin') && (
              <Link
                href="/admin/dashboard"
                onClick={closeMobileMenu}
                className="block px-3 py-2 text-base font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
              >
                Admin Dashboard
              </Link>
            )}
          </div>
        </div>
              )}

      {/* Notification Center */}
      <NotificationCenter 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)} 
      />
    </header>
  );
} 