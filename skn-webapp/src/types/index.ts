// User related types
export interface User {
  $id: string;
  name: string;
  email: string;
  referralCode: string;
  isActive: boolean;
  rightPairs: number;
  leftPairs: number;
  totalEarnings: number;
  starLevel: number;
  registrationFee: number;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  sponsorId?: string;
  parentId?: string;
  side?: 'right' | 'left';
  leftChildId?: string;
  rightChildId?: string;
  path?: string;
  depth: number;
  leftActiveCount: number;
  rightActiveCount: number;
  pairsCompleted: number;
}

export interface Referral {
  $id: string;
  referralCode: string;
  sponsorId: string;
  prospectEmail?: string;
  status: 'clicked' | 'registered';
  registeredUserId?: string;
  createdAt: string;
}

export interface Payment {
  $id: string;
  userId: string;
  type: 'join_fee' | 'payout' | 'adjustment';
  amount: number;
  currency: string; // default 'PKR'
  status: 'pending' | 'completed' | 'failed' | 'verified';
  gateway: string; // e.g., 'jazzcash', 'easypaisa', 'manual'
  externalTransactionId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pair {
  $id: string;
  userId: string; // beneficiary
  pairNumber: number; // unique per user
  leftUserId: string;
  rightUserId: string;
  completedAt: string;
  amount: number; // PKR at time of credit
}

export interface Earning {
  $id: string;
  userId: string;
  sourceType: 'pair' | 'star_reward' | 'sponsor_bonus' | 'manual';
  sourceId: string; // pairId or starLevelId
  amount: number;
  currency: string; // default 'PKR'
  balanceAfter?: number;
  note?: string;
  createdAt: string;
}

export interface StarLevel {
  $id: string;
  level: number; // unique
  requiredPairs: number;
  rewardAmount: number;
  title: string;
  isActive: boolean; // default true
}

export interface SystemSettings {
  $id: string;
  joiningFee: number; // default 850
  currency: string; // default 'PKR'
  pairEarning: number;
  firstPairEarning: number;
  regularPairEarning: number;
  after100PairEarning: number;
  placementStrategy: 'leftmost' | 'balanced'; // default 'leftmost'
}

export interface PaymentFormData {
  paymentMethod: string;
  amount: number;
  agreeToTerms: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
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

// PayFast payment types
export interface PayFastPayment {
  $id: string;
  userId: string;
  amount: number;
  paymentMethod: 'jazz_cash' | 'easypaisa';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  payfastPaymentId?: string;
  merchantId?: string;
  merchantTransactionId?: string;
  transactionId?: string;
  paymentStatus?: string;
  paymentDate?: string;
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