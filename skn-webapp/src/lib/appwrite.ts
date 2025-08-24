import { Client, Account, Databases, Storage } from 'appwrite';

// Appwrite configuration
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

// Initialize Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Database ID
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '68a215ea00118e3886fb';

// Collection IDs
export const COLLECTIONS = {
  USERS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS || '68a218990004f64407aa',
  REFERRALS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_REFERRALS || 'referrals',
  TRANSACTIONS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TRANSACTIONS || 'transactions',
  EARNINGS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_EARNINGS || 'earnings',
  PAIR_COMPLETIONS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAIR_COMPLETIONS || 'pair_completions',
  STAR_ACHIEVEMENTS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_STAR_ACHIEVEMENTS || 'star_achievements',
  PAYMENTS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAYMENTS || 'payments',
  USER_SESSIONS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_SESSIONS || 'user_sessions',
  NETWORK_STATS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_NETWORK_STATS || 'network_stats',
  // New collections for payment and withdrawal system
  PAYMENT_REQUESTS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAYMENT_REQUESTS || 'payment_requests',
  WITHDRAWAL_REQUESTS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_WITHDRAWAL_REQUESTS || 'withdrawal_requests',
  ADMIN_USERS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ADMIN_USERS || 'admin_users',
  PINS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PINS || 'pins',
  NOTIFICATIONS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_NOTIFICATIONS || 'notifications',
} as const;

// Storage bucket IDs
export const BUCKETS = {
  PROFILE_IMAGES: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_PROFILE_IMAGES || 'profile_images',
  PAYMENT_PROOFS: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_PAYMENT_PROOFS || 'payment_proofs',
  // Single bucket for all payment and withdrawal files
  FILES: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_FILES || 'files',
} as const;

// Business Logic Configuration
export const BUSINESS_CONFIG = {
  REGISTRATION_FEE: parseInt(process.env.NEXT_PUBLIC_REGISTRATION_FEE || '850'),
  FIRST_PAIR_EARNING: parseInt(process.env.NEXT_PUBLIC_FIRST_PAIR_EARNING || '400'),
  REGULAR_PAIR_EARNING: parseInt(process.env.NEXT_PUBLIC_REGULAR_PAIR_EARNING || '200'),
  HUNDREDTH_PAIR_EARNING: parseInt(process.env.NEXT_PUBLIC_HUNDREDTH_PAIR_EARNING || '100'),
} as const;

// Star Level Configuration
export const STAR_LEVELS = {
  THRESHOLDS: {
    1: parseInt(process.env.NEXT_PUBLIC_STAR_LEVEL_1_PAIRS || '10'),
    2: parseInt(process.env.NEXT_PUBLIC_STAR_LEVEL_2_PAIRS || '30'),
    3: parseInt(process.env.NEXT_PUBLIC_STAR_LEVEL_3_PAIRS || '100'),
    4: parseInt(process.env.NEXT_PUBLIC_STAR_LEVEL_4_PAIRS || '550'),
    5: parseInt(process.env.NEXT_PUBLIC_STAR_LEVEL_5_PAIRS || '1100'),
    6: parseInt(process.env.NEXT_PUBLIC_STAR_LEVEL_6_PAIRS || '2500'),
    7: parseInt(process.env.NEXT_PUBLIC_STAR_LEVEL_7_PAIRS || '5000'),
    8: parseInt(process.env.NEXT_PUBLIC_STAR_LEVEL_8_PAIRS || '10000'),
    9: parseInt(process.env.NEXT_PUBLIC_STAR_LEVEL_9_PAIRS || '20000'),
    10: parseInt(process.env.NEXT_PUBLIC_STAR_LEVEL_10_PAIRS || '30000'),
    11: parseInt(process.env.NEXT_PUBLIC_STAR_LEVEL_11_PAIRS || '40000'),
    12: parseInt(process.env.NEXT_PUBLIC_STAR_LEVEL_12_PAIRS || '50000'),
  },
  REWARDS: {
    1: parseInt(process.env.NEXT_PUBLIC_STAR_REWARD_LEVEL_1 || '500'),
    2: parseInt(process.env.NEXT_PUBLIC_STAR_REWARD_LEVEL_2 || '1500'),
    3: parseInt(process.env.NEXT_PUBLIC_STAR_REWARD_LEVEL_3 || '3000'),
    4: parseInt(process.env.NEXT_PUBLIC_STAR_REWARD_LEVEL_4 || '25000'),
    5: parseInt(process.env.NEXT_PUBLIC_STAR_REWARD_LEVEL_5 || '35000'),
    6: parseInt(process.env.NEXT_PUBLIC_STAR_REWARD_LEVEL_6 || '60000'),
    7: parseInt(process.env.NEXT_PUBLIC_STAR_REWARD_LEVEL_7 || '140000'),
    8: parseInt(process.env.NEXT_PUBLIC_STAR_REWARD_LEVEL_8 || '300000'),
    9: parseInt(process.env.NEXT_PUBLIC_STAR_REWARD_LEVEL_9 || '600000'),
    10: parseInt(process.env.NEXT_PUBLIC_STAR_REWARD_LEVEL_10 || '1000000'),
    11: parseInt(process.env.NEXT_PUBLIC_STAR_REWARD_LEVEL_11 || '1500000'),
    12: parseInt(process.env.NEXT_PUBLIC_STAR_REWARD_LEVEL_12 || '2000000'),
  },
} as const;

// Feature Flags
export const FEATURES = {
  REFERRAL_SYSTEM: process.env.NEXT_PUBLIC_ENABLE_REFERRAL_SYSTEM === 'true',
  STAR_LEVELS: process.env.NEXT_PUBLIC_ENABLE_STAR_LEVELS === 'true',
  PAYMENT_VERIFICATION: process.env.NEXT_PUBLIC_ENABLE_PAYMENT_VERIFICATION === 'true',
  EMAIL_VERIFICATION: process.env.NEXT_PUBLIC_ENABLE_EMAIL_VERIFICATION === 'true',
  SMS_VERIFICATION: process.env.NEXT_PUBLIC_ENABLE_SMS_VERIFICATION === 'true',
} as const;

// Payment Configuration
export const PAYMENT_CONFIG = {
  ENABLED_METHODS: (process.env.NEXT_PUBLIC_ENABLED_PAYMENT_METHODS || 'bank_transfer,easypaisa,jazz_cash').split(','),
  BANK: {
    NAME: process.env.NEXT_PUBLIC_BANK_NAME || 'Your Bank Name',
    ACCOUNT_NUMBER: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || '1234567890',
    ACCOUNT_TITLE: process.env.NEXT_PUBLIC_BANK_ACCOUNT_TITLE || 'SKN Network Marketing',
    BRANCH: process.env.NEXT_PUBLIC_BANK_BRANCH || 'Main Branch',
  },
  EASYPAISA: {
    NUMBER: process.env.NEXT_PUBLIC_EASYPAISA_NUMBER || '03001234567',
    ACCOUNT_TITLE: process.env.NEXT_PUBLIC_EASYPAISA_ACCOUNT_TITLE || 'SKN Network',
  },
  JAZZ_CASH: {
    NUMBER: process.env.NEXT_PUBLIC_JAZZCASH_NUMBER || '03001234567',
    ACCOUNT_TITLE: process.env.NEXT_PUBLIC_JAZZCASH_ACCOUNT_TITLE || 'SKN Network',
  },
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: process.env.NEXT_PUBLIC_APP_NAME || 'SKN',
  DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Digital Network Marketing System',
  VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  CONTACT: {
    EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@skn.com',
    PHONE: process.env.NEXT_PUBLIC_CONTACT_PHONE || '+92-300-1234567',
    ADDRESS: process.env.NEXT_PUBLIC_CONTACT_ADDRESS || 'Your Address Here',
  },
  SOCIAL: {
    FACEBOOK: process.env.NEXT_PUBLIC_FACEBOOK_URL || 'https://facebook.com/skn',
    TWITTER: process.env.NEXT_PUBLIC_TWITTER_URL || 'https://twitter.com/skn',
    INSTAGRAM: process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://instagram.com/skn',
    WHATSAPP: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+923001234567',
  },
  LEGAL: {
    TERMS: process.env.NEXT_PUBLIC_TERMS_URL || 'https://skn.com/terms',
    PRIVACY: process.env.NEXT_PUBLIC_PRIVACY_URL || 'https://skn.com/privacy',
    REFUND_POLICY: process.env.NEXT_PUBLIC_REFUND_POLICY_URL || 'https://skn.com/refund-policy',
  },
  COMPANY: {
    NAME: process.env.NEXT_PUBLIC_COMPANY_NAME || 'SKN Network Marketing',
    REGISTRATION: process.env.NEXT_PUBLIC_COMPANY_REGISTRATION || 'Registration Number Here',
    ADDRESS: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || 'Company Address Here',
  },
} as const;

export default client; 