import { databases, DATABASE_ID, COLLECTIONS } from './appwrite';
import { ID } from 'appwrite';

export interface CreateAdminParams {
  email: string;
  password: string;
  name: string;
  userType: 'admin' | 'super_admin';
  permissions?: string[];
}

export class AdminUtils {
  /**
   * Create an admin user programmatically
   * This should be run from a secure environment (server-side)
   */
  static async createAdminUser(params: CreateAdminParams) {
    try {
      const { email, password, name, userType, permissions = [] } = params;

      // Step 1: Create the user document in users collection
      const userData = {
        name,
        email,
        password,
        referralCode: this.generateReferralCode(),
        isActive: true,
        rightPairs: 0,
        leftPairs: 0,
        totalEarnings: 0,
        starLevel: 0,
        currentStarLevel: 0,
        registrationFee: 0,
        paymentStatus: 'approved',
        paymentRequestId: null,
        userType,
        phone: '',
        address: '',
        joinDate: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        userId: ID.unique(),
        depth: 0,
        leftActiveCount: 0,
        rightActiveCount: 0,
        pairsCompleted: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const userDoc = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userData.userId,
        userData
      );

      // Step 2: Create admin record in admin_users collection
      const adminData = {
        userId: userData.userId,
        userName: name,
        userEmail: email,
        userType,
        permissions: permissions.length > 0 ? permissions : [
          'manage_users',
          'manage_payments', 
          'manage_withdrawals',
          'manage_pins'
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const adminDoc = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.ADMIN_USERS,
        ID.unique(),
        adminData
      );

      console.log('Admin user created successfully:', {
        userId: userDoc.$id,
        adminId: adminDoc.$id,
        email,
        userType
      });

      return {
        user: userDoc,
        admin: adminDoc
      };

    } catch (error) {
      console.error('Error creating admin user:', error);
      throw error;
    }
  }

  /**
   * Promote an existing user to admin
   */
  static async promoteToAdmin(userId: string, userType: 'admin' | 'super_admin' = 'admin') {
    try {
      // Step 1: Update user document
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userId,
        {
          userType,
          isActive: true,
          paymentStatus: 'approved'
        }
      );

      // Step 2: Get user details
      const userDoc = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userId
      );

      // Step 3: Create admin record
      const adminData = {
        userId,
        userName: userDoc.name,
        userEmail: userDoc.email,
        userType,
        permissions: [
          'manage_users',
          'manage_payments',
          'manage_withdrawals', 
          'manage_pins'
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const adminDoc = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.ADMIN_USERS,
        ID.unique(),
        adminData
      );

      console.log('User promoted to admin successfully:', {
        userId,
        adminId: adminDoc.$id,
        userType
      });

      return adminDoc;

    } catch (error) {
      console.error('Error promoting user to admin:', error);
      throw error;
    }
  }

  /**
   * Check if a user is an admin
   */
  static async isAdmin(userId: string): Promise<boolean> {
    try {
      const adminQuery = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ADMIN_USERS,
        [
          // Query.equal('userId', userId),
          // Query.equal('isActive', true)
        ]
      );

      return adminQuery.documents.some(doc => 
        doc.userId === userId && doc.isActive === true
      );
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  /**
   * Get admin permissions for a user
   */
  static async getAdminPermissions(userId: string): Promise<string[]> {
    try {
      const adminQuery = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ADMIN_USERS,
        [
          // Query.equal('userId', userId),
          // Query.equal('isActive', true)
        ]
      );

      const adminDoc = adminQuery.documents.find(doc => 
        doc.userId === userId && doc.isActive === true
      );

      return adminDoc?.permissions || [];
    } catch (error) {
      console.error('Error getting admin permissions:', error);
      return [];
    }
  }

  private static generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

