# SKN WebApp - Admin Setup Guide

## 👥 **Admin System Overview**

The SKN WebApp uses a dual-layer admin system:
1. **User Document**: Contains `userType` field (`'admin'` or `'super_admin'`)
2. **Admin Record**: Separate document in `admin_users` collection with permissions

## 🚀 **Quick Admin Creation Methods**

### **Method 1: Command Line Script (Recommended)**

1. **Install Dependencies**
   ```bash
   cd skn-webapp
   npm install node-appwrite dotenv
   ```

2. **Create Admin User**
   ```bash
   npm run create-admin admin@skn.com admin123 "Admin User" super_admin
   ```

   **Parameters:**
   - `email`: Admin email address
   - `password`: Admin password  
   - `name`: Admin display name
   - `userType`: `admin` or `super_admin` (optional, defaults to `super_admin`)

3. **Login and Access**
   - Go to: `http://localhost:3000/login`
   - Use the email and password you created
   - Access admin dashboard: `http://localhost:3000/admin/dashboard`

### **Method 2: Manual Database Update**

1. **Register Normal User**
   - Go to your app and register: `admin@skn.com` / `admin123`

2. **Update User Document in Appwrite Console**
   - Go to: Appwrite Console → Database → Users Collection
   - Find your user document
   - Edit and update:
   ```json
   {
     "userType": "super_admin",
     "isActive": true,
     "paymentStatus": "approved"
   }
   ```

3. **Create Admin Record**
   - Go to: Appwrite Console → Database → Admin Users Collection
   - Create new document:
   ```json
   {
     "userId": "your_user_id_from_step_1",
     "userName": "Admin User",
     "userEmail": "admin@skn.com",
     "userType": "super_admin",
     "permissions": ["manage_users", "manage_payments", "manage_withdrawals", "manage_pins"],
     "isActive": true,
     "createdAt": "2024-01-01T00:00:00.000Z",
     "updatedAt": "2024-01-01T00:00:00.000Z"
   }
   ```

### **Method 3: Programmatic Creation**

Use the `AdminUtils` class in your code:

```typescript
import { AdminUtils } from '@/lib/adminUtils';

// Create new admin
await AdminUtils.createAdminUser({
  email: 'admin@skn.com',
  password: 'admin123',
  name: 'Admin User',
  userType: 'super_admin'
});

// Promote existing user
await AdminUtils.promoteToAdmin('user_id_here', 'admin');
```

## 🔐 **Admin Types & Permissions**

### **Super Admin**
- **User Type**: `super_admin`
- **Permissions**: All permissions
- **Can**: Create other admins, manage everything

### **Regular Admin**
- **User Type**: `admin`
- **Permissions**: Limited permissions
- **Can**: Manage payments, withdrawals, PINs

### **Default Permissions**
```typescript
[
  'manage_users',        // View and manage users
  'manage_payments',     // Approve/reject payment requests
  'manage_withdrawals',  // Process withdrawal requests
  'manage_pins'          // Generate and assign PINs
]
```

## 📊 **Admin Dashboard Features**

### **Overview Tab**
- Pending payment requests count
- Pending withdrawal requests count
- Total users count
- Active users count
- Quick action buttons

### **Payment Requests Tab**
- View all payment requests
- Filter by status (pending/approved/rejected)
- Review payment screenshots
- Approve/reject with notes
- Send notifications to users

### **Withdrawal Requests Tab**
- View all withdrawal requests
- Filter by status
- Process payments and upload proof
- Approve/reject with reasons
- Update user balances

### **PIN Management Tab**
- Generate new PINs
- Assign PINs to users
- View PIN status and assignments
- Search and filter PINs
- Statistics dashboard

### **Users Tab**
- View all users
- Manage user status
- View user details and statistics

## 🔍 **Admin Detection Logic**

The system checks admin access in multiple places:

### **1. Route Protection**
```typescript
// In AdminDashboardPage
if (!user || (user.userType !== 'admin' && user.userType !== 'super_admin')) {
  router.push('/dashboard');
  return null;
}
```

### **2. Component Level**
```typescript
// In AdminDashboard component
interface AdminDashboardProps {
  adminUser: User; // Must have userType: 'admin' | 'super_admin'
}
```

### **3. API Level**
```typescript
// In admin services
static async isAdmin(userId: string): Promise<boolean> {
  // Check admin_users collection
}
```

## 🛠️ **Troubleshooting**

### **Common Issues**

1. **"Access Denied" Error**
   - Check if user document has correct `userType`
   - Verify admin record exists in `admin_users` collection
   - Ensure `isActive: true` in both documents

2. **Admin Dashboard Not Loading**
   - Check browser console for errors
   - Verify all collections exist in Appwrite
   - Ensure environment variables are correct

3. **Permission Errors**
   - Check admin permissions array
   - Verify API key has correct permissions
   - Ensure collection permissions are set correctly

### **Debug Steps**

1. **Check User Document**
   ```javascript
   // In browser console
   console.log(user);
   // Should show: userType: 'admin' or 'super_admin'
   ```

2. **Check Admin Record**
   ```javascript
   // In Appwrite Console
   // Go to admin_users collection
   // Verify record exists for your user
   ```

3. **Check Environment Variables**
   ```bash
   # Verify .env.local has all required variables
   cat .env.local
   ```

## 📝 **Admin Workflow Examples**

### **Payment Approval Workflow**
1. User submits payment request with screenshot
2. Admin sees pending request in dashboard
3. Admin clicks "Review" to see details
4. Admin approves/rejects with notes
5. User receives notification
6. If approved, user account becomes active

### **Withdrawal Processing Workflow**
1. User submits withdrawal request with PIN
2. Admin sees pending withdrawal in dashboard
3. Admin processes payment manually
4. Admin uploads payment proof
5. Admin approves withdrawal
6. User receives notification with proof
7. User balance is updated

### **PIN Management Workflow**
1. Admin generates PINs in bulk
2. Admin assigns PINs to specific users
3. Users can use PINs for withdrawals
4. System validates PINs during withdrawal requests

## 🔒 **Security Best Practices**

1. **Use Strong Passwords**
   - Minimum 8 characters
   - Mix of letters, numbers, symbols

2. **Limit Admin Access**
   - Only give admin access to trusted users
   - Use regular admin instead of super admin when possible

3. **Monitor Admin Actions**
   - Check admin dashboard regularly
   - Review payment and withdrawal logs

4. **Secure API Keys**
   - Keep API keys secure
   - Use environment variables
   - Don't commit keys to version control

## 📞 **Support**

If you encounter issues with admin setup:

1. Check the troubleshooting section above
2. Verify all collections exist in Appwrite
3. Ensure environment variables are correct
4. Check browser console for error messages
5. Review the complete setup guide in `COMPLETE_SETUP_GUIDE.md`

---

**Note**: The admin system is designed to be secure and flexible. Always test thoroughly in development before deploying to production.

