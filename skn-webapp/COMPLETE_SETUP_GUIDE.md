# SKN WebApp - Complete Setup Guide

## Overview
This guide provides complete setup instructions for the SKN WebApp with the new manual payment and withdrawal system, admin dashboard, and PIN management features.

## 🚀 Quick Start

### 1. Environment Setup
Create a `.env.local` file in the `skn-webapp` directory with the following variables:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id

# Collection IDs
NEXT_PUBLIC_APPWRITE_COLLECTION_USERS=users
NEXT_PUBLIC_APPWRITE_COLLECTION_REFERRALS=referrals
NEXT_PUBLIC_APPWRITE_COLLECTION_PAIRS=pairs
NEXT_PUBLIC_APPWRITE_COLLECTION_EARNINGS=earnings
NEXT_PUBLIC_APPWRITE_COLLECTION_STAR_LEVELS=star_levels
NEXT_PUBLIC_APPWRITE_COLLECTION_NETWORK_STATS=network_stats
NEXT_PUBLIC_APPWRITE_COLLECTION_PAYMENT_REQUESTS=payment_requests
NEXT_PUBLIC_APPWRITE_COLLECTION_WITHDRAWAL_REQUESTS=withdrawal_requests
NEXT_PUBLIC_APPWRITE_COLLECTION_ADMIN_USERS=admin_users
NEXT_PUBLIC_APPWRITE_COLLECTION_PINS=pins
NEXT_PUBLIC_APPWRITE_COLLECTION_NOTIFICATIONS=notifications

# Storage Bucket IDs
NEXT_PUBLIC_APPWRITE_BUCKET_FILES=files

# Appwrite API Keys (for server-side operations)
APPWRITE_API_KEY=your_api_key
```

### 2. Install Dependencies
```bash
cd skn-webapp
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

## 📋 Appwrite Setup

### Database Collections

#### 1. Users Collection (`users`)
**Attributes:**
- `name` (String, Required)
- `email` (String, Required, Unique)
- `password` (String, Required)
- `referralCode` (String, Required, Unique)
- `referralPin` (String, Optional) - Admin-generated PIN
- `isActive` (Boolean, Required, Default: false)
- `paymentStatus` (String, Required, Default: 'pending') - 'pending' | 'approved' | 'rejected'
- `paymentRequestId` (String, Optional) - Reference to payment_requests
- `userType` (String, Required, Default: 'user') - 'user' | 'admin' | 'super_admin'
- `phone` (String, Optional)
- `address` (String, Optional)
- `joinDate` (String, Required)
- `lastLogin` (String, Required)
- `rightPairs` (Integer, Required, Default: 0)
- `leftPairs` (Integer, Required, Default: 0)
- `totalEarnings` (Integer, Required, Default: 0)
- `starLevel` (Integer, Required, Default: 0)
- `currentStarLevel` (Integer, Required, Default: 0)
- `registrationFee` (Integer, Required, Default: 0)
- `createdAt` (String, Required)
- `updatedAt` (String, Required)
- `userId` (String, Required, Unique)
- `sponsorId` (String, Optional)
- `parentId` (String, Optional)
- `side` (String, Optional) - 'right' | 'left'
- `leftChildId` (String, Optional)
- `rightChildId` (String, Optional)
- `path` (String, Optional)
- `depth` (Integer, Required, Default: 0)
- `leftActiveCount` (Integer, Required, Default: 0)
- `rightActiveCount` (Integer, Required, Default: 0)
- `pairsCompleted` (Integer, Required, Default: 0)

**Indexes:**
- `email` (Unique)
- `referralCode` (Unique)
- `referralPin` (Unique)
- `userId` (Unique)
- `sponsorId`
- `parentId`
- `paymentStatus`
- `isActive`

#### 2. Payment Requests Collection (`payment_requests`)
**Attributes:**
- `userId` (String, Required)
- `userName` (String, Required)
- `userEmail` (String, Required)
- `amount` (Integer, Required)
- `paymentType` (String, Required) - 'easypaisa' | 'jazzcash'
- `transactionId` (String, Required)
- `screenshotUrl` (String, Required)
- `status` (String, Required, Default: 'pending') - 'pending' | 'approved' | 'rejected'
- `adminNotes` (String, Optional)
- `rejectionReason` (String, Optional)
- `approvedBy` (String, Optional)
- `approvedAt` (String, Optional)
- `createdAt` (String, Required)
- `updatedAt` (String, Required)

**Indexes:**
- `userId`
- `status`
- `userEmail`
- `createdAt`

#### 3. Withdrawal Requests Collection (`withdrawal_requests`)
**Attributes:**
- `userId` (String, Required)
- `userName` (String, Required)
- `userEmail` (String, Required)
- `userPin` (String, Required)
- `amount` (Integer, Required)
- `userCurrentBalance` (Integer, Required)
- `status` (String, Required, Default: 'pending') - 'pending' | 'approved' | 'rejected'
- `adminNotes` (String, Optional)
- `rejectionReason` (String, Optional)
- `paymentProofUrl` (String, Optional)
- `approvedBy` (String, Optional)
- `approvedAt` (String, Optional)
- `createdAt` (String, Required)
- `updatedAt` (String, Required)

**Indexes:**
- `userId`
- `status`
- `userEmail`
- `userPin`
- `createdAt`

#### 4. Admin Users Collection (`admin_users`)
**Attributes:**
- `userId` (String, Required, Unique)
- `userName` (String, Required)
- `userEmail` (String, Required, Unique)
- `userType` (String, Required) - 'admin' | 'super_admin'
- `permissions` (String[], Required)
- `isActive` (Boolean, Required, Default: true)
- `createdAt` (String, Required)
- `updatedAt` (String, Required)

**Indexes:**
- `userId` (Unique)
- `userEmail` (Unique)
- `userType`
- `isActive`

#### 5. PINs Collection (`pins`)
**Attributes:**
- `pinCode` (String, Required, Unique)
- `status` (String, Required, Default: 'unused') - 'unused' | 'assigned'
- `assignedTo` (String, Optional)
- `assignedAt` (String, Optional)
- `createdBy` (String, Required)
- `createdAt` (String, Required)
- `updatedAt` (String, Required)

**Indexes:**
- `pinCode` (Unique)
- `status`
- `assignedTo`
- `createdBy`

#### 6. Notifications Collection (`notifications`)
**Attributes:**
- `userId` (String, Required)
- `type` (String, Required) - 'payment_approved' | 'payment_rejected' | 'withdrawal_approved' | 'withdrawal_rejected' | 'pin_assigned' | 'general'
- `title` (String, Required)
- `message` (String, Required)
- `isRead` (Boolean, Required, Default: false)
- `data` (String, Optional) - JSON string for additional data
- `createdAt` (String, Required)

**Indexes:**
- `userId`
- `type`
- `isRead`
- `createdAt`

#### 7. Existing Collections
- `referrals` - Referral tracking
- `pairs` - Pair completion records
- `earnings` - Earnings records
- `star_levels` - Star level definitions
- `network_stats` - System statistics

### Storage Buckets

#### Files Bucket (`files`)
**Purpose:** Store all payment screenshots and withdrawal proof images
**Organization:**
- `payment_screenshots/` - Payment proof images
- `withdrawal_proofs/` - Withdrawal proof images

**Permissions:**
- Read: Authenticated users
- Write: Authenticated users
- Delete: Admin users only

## 🔐 Security Setup

### 1. Appwrite Permissions
Ensure proper permissions are set for each collection:

**Users Collection:**
- Read: Authenticated users (own document)
- Write: Authenticated users (own document)
- Create: Public (for registration)
- Delete: Admin only

**Payment/Withdrawal Collections:**
- Read: Authenticated users (own documents) + Admin
- Write: Authenticated users (own documents) + Admin
- Create: Authenticated users
- Delete: Admin only

**Admin Collections:**
- Read/Write: Admin users only
- Create: Super admin only

### 2. API Key Permissions
Your API key should have permissions for:
- Database operations
- Storage operations
- User management

## 👥 Admin Setup

### 1. Create Admin User
1. Register a normal user account
2. In Appwrite Console, manually update the user document:
   - Set `userType` to `'admin'` or `'super_admin'`
   - Set `isActive` to `true`
   - Set `paymentStatus` to `'approved'`

### 2. Create Admin Record
Create a document in the `admin_users` collection:
```json
{
  "userId": "admin_user_id",
  "userName": "Admin Name",
  "userEmail": "admin@example.com",
  "userType": "super_admin",
  "permissions": ["manage_users", "manage_payments", "manage_withdrawals", "manage_pins"],
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 3. Access Admin Dashboard
Navigate to `/admin/dashboard` to access the admin panel.

## 🔄 System Flow

### User Registration Flow
1. User registers with email/password
2. Account created with `isActive: false` and `paymentStatus: 'pending'`
3. User redirected to dashboard
4. Dashboard shows payment request form
5. User submits payment request with screenshot
6. Admin reviews and approves/rejects
7. If approved, user becomes active and can use the system

### Payment Request Flow
1. User fills payment request form
2. Uploads payment screenshot
3. Request stored in `payment_requests` collection
4. Admin reviews in admin dashboard
5. Admin approves/rejects with notes
6. User receives notification
7. If approved, user account activated

### Withdrawal Request Flow
1. User fills withdrawal request form
2. Enters their PIN for verification
3. Request stored in `withdrawal_requests` collection
4. Admin reviews in admin dashboard
5. Admin processes payment and uploads proof
6. Admin approves withdrawal
7. User receives notification with payment proof
8. User balance updated

### PIN Management Flow
1. Admin generates PINs in admin dashboard
2. Admin assigns PINs to users
3. Users can use PINs for withdrawal requests
4. PINs are validated during withdrawal

## 🎯 Key Features

### For Users
- **Registration:** Simple email/password registration
- **Payment Requests:** Submit payment with screenshot
- **Dashboard:** View earnings, pairs, and network stats
- **Withdrawals:** Request withdrawals using PIN
- **Notifications:** Real-time notifications for all actions
- **Referrals:** Share referral codes and track referrals

### For Admins
- **Payment Management:** Review and approve/reject payment requests
- **Withdrawal Management:** Process withdrawal requests
- **PIN Management:** Generate and assign referral PINs
- **User Management:** View and manage all users
- **Statistics:** View system-wide statistics

## 🐛 Troubleshooting

### Common Issues

1. **Collection Not Found Errors**
   - Ensure all collection IDs match your `.env.local` file
   - Verify collections exist in Appwrite Console

2. **Permission Errors**
   - Check Appwrite collection permissions
   - Verify API key has correct permissions

3. **File Upload Issues**
   - Ensure storage bucket exists and has correct permissions
   - Check file size limits

4. **Admin Access Issues**
   - Verify admin user document exists in `admin_users` collection
   - Check user type and permissions

### Debug Mode
Enable debug logging by checking browser console for detailed error messages.

## 📞 Support

For technical support or questions about the implementation, refer to the codebase documentation or contact the development team.

---

**Note:** This implementation replaces the previous PayFast integration with a manual payment and admin approval system, providing better control and security for the MLM platform.

