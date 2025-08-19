// User related types
export interface User {
  $id: string;
  userId: string; // Appwrite auth user ID
  email: string;
  name: string;
  phone?: string;
  profileImage?: string;
  referralCode: string;
  referredBy?: string;
  position?: 'left' | 'right';
  sponsorId?: string;
  leftUserId?: string;
  rightUserId?: string;
  leftPairs: number;
  rightPairs: number;
  totalEarnings: number;
  starLevel: number;
  isActive: boolean;
  isVerified: boolean;
  registrationFee: number; // Starts at 0, updated to 850 after payment
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed';
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Binary tree structure fields
  parentId?: string;
  side?: 'left' | 'right';
  leftChildId?: string;
  rightChildId?: string;
  path?: string;
  depth?: number;
  leftActiveCount?: number;
  rightActiveCount?: number;
  pairsCompleted?: number;
}

// Referral tree structure
export interface ReferralNode {
  userId: string;
  name: string;
  email: string;
  profileImage?: string;
  leftChild?: ReferralNode;
  rightChild?: ReferralNode;
  level: number;
  position: 'left' | 'right';
  isActive: boolean;
}

// Transaction types
export interface Transaction {
  $id: string;
  userId: string;
  type: 'pair_earning' | 'star_reward' | 'referral_bonus' | 'withdrawal';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  reference?: string;
  createdAt: string;
}

// Payment types
export interface Payment {
  $id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: 'bank_transfer' | 'easypaisa' | 'jazz_cash' | 'other';
  transactionId?: string;
  proofImage?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Pair completion tracking
export interface PairCompletion {
  $id: string;
  userId: string;
  leftUserId: string;
  rightUserId: string;
  pairNumber: number;
  earnings: number;
  isProcessed: boolean;
  completedAt: string;
}

// Star level achievement
export interface StarAchievement {
  $id: string;
  userId: string;
  level: number;
  reward: number;
  leftPairs: number;
  rightPairs: number;
  achievedAt: string;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  referralCode?: string;
  agreeToTerms: boolean;
}

export interface ProfileFormData {
  name: string;
  phone?: string;
  profileImage?: File;
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Dashboard stats
export interface DashboardStats {
  totalReferrals: number;
  leftReferrals: number;
  rightReferrals: number;
  totalPairs: number;
  totalEarnings: number;
  currentStarLevel: number;
  nextStarLevel: number;
  nextStarLevelProgress: number;
  pendingWithdrawals: number;
} 