'use client';

import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { cn, isValidEmail } from '@/lib/utils';
import { databaseService } from '@/lib/database';

function RegisterForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for referral code in various possible URL parameter formats
    const referralCode = searchParams.get('ref') || 
                        searchParams.get('referral_code') || 
                        searchParams.get('referral') ||
                        searchParams.get('code');
    
    if (referralCode) {
      console.log('Referral code detected from URL:', referralCode);
      setFormData(prev => ({ ...prev, referralCode }));

      // Record a single click per session for this referral code
      const key = `ref_click_${referralCode}`;
      if (typeof window !== 'undefined' && !sessionStorage.getItem(key)) {
        (async () => {
          try {
            const sponsor = await databaseService.getUserByReferralCode(referralCode.trim());
            if (sponsor) {
              await databaseService.createReferral({
                referralCode: referralCode.trim(),
                sponsorId: sponsor.$id,
                prospectEmail: null,
                status: 'clicked',
                registeredUserId: null,
                createdAt: new Date().toISOString(),
              } as any);
              sessionStorage.setItem(key, '1');
              console.log('Referral click recorded');
            } else {
              console.log('No sponsor found for referral code on click');
            }
          } catch (err) {
            console.error('Failed to record referral click:', err);
          }
        })();
      }
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(
        formData.email,
        formData.password,
        formData.email.split('@')[0], // Use email username as name
        formData.referralCode
      );
      
      if (result.success) {
        // Registration successful and user is auto-logged in
        console.log('Registration successful, redirecting to dashboard...');
        setIsSuccess(true);
        // Show success message for 2 seconds then redirect
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        // Registration failed
        setErrors({ general: 'Registration failed. Please try again.' });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">SKN</h1>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Create Account
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Join SKN and start your earning journey
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white py-6 sm:py-8 px-4 sm:px-6 shadow-xl rounded-lg border border-gray-200">
          {isSuccess ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900">Account Created Successfully!</h3>
              <p className="text-gray-600 text-sm sm:text-base">Redirecting you to dashboard...</p>
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <>
              <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
                {errors.general && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3 sm:p-4">
                    <div className="flex">
                      <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 mr-2 flex-shrink-0" />
                      <p className="text-xs sm:text-sm text-red-600">{errors.general}</p>
                    </div>
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className={cn(
                        "block w-full pl-10 pr-3 py-2 sm:py-3 border rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base",
                        errors.email ? "border-red-300" : "border-gray-300"
                      )}
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Referral Code Field */}
                <div>
                  <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Referral Code (Optional)
                  </label>
                  <input
                    id="referralCode"
                    name="referralCode"
                    type="text"
                    value={formData.referralCode}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                    placeholder="Enter referral code if you have one"
                  />
                  {formData.referralCode && (
                    <p className="mt-1 text-xs sm:text-sm text-blue-600">
                      ✓ Using referral code: {formData.referralCode}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={cn(
                        "block w-full pl-10 pr-12 py-2 sm:py-3 border rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base",
                        errors.password ? "border-red-300" : "border-gray-300"
                      )}
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={cn(
                        "block w-full pl-10 pr-12 py-2 sm:py-3 border rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base",
                        errors.confirmPassword ? "border-red-300" : "border-gray-300"
                      )}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    "group relative w-full flex justify-center py-2 sm:py-3 px-4 border border-transparent text-sm sm:text-base font-medium rounded-md text-white transition-colors",
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  )}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2"></div>
                      <span className="text-xs sm:text-sm">Creating Account...</span>
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              {/* Additional Links */}
              <div className="mt-4 sm:mt-6 text-center">
                <p className="text-xs sm:text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                    Sign in here
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
} 