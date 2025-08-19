import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx and tailwind-merge for optimal class handling
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in PKR
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Generate a random referral code
 */
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Calculate star level based on pairs
 */
export function calculateStarLevel(leftPairs: number, rightPairs: number): number {
  const minPairs = Math.min(leftPairs, rightPairs);
  
  if (minPairs >= 50000) return 12;
  if (minPairs >= 40000) return 11;
  if (minPairs >= 30000) return 10;
  if (minPairs >= 20000) return 9;
  if (minPairs >= 10000) return 8;
  if (minPairs >= 5000) return 7;
  if (minPairs >= 2500) return 6;
  if (minPairs >= 1100) return 5;
  if (minPairs >= 550) return 4;
  if (minPairs >= 100) return 3;
  if (minPairs >= 30) return 2;
  if (minPairs >= 10) return 1;
  
  return 0;
}

/**
 * Get star level reward amount
 */
export function getStarLevelReward(level: number): number {
  const rewards = {
    1: 500,
    2: 1500,
    3: 3000,
    4: 25000,
    5: 35000,
    6: 60000,
    7: 140000,
    8: 300000,
    9: 600000,
    10: 1000000,
    11: 1500000,
    12: 2000000,
  };
  
  return rewards[level as keyof typeof rewards] || 0;
} 