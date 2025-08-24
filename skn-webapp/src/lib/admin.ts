import { databases, DATABASE_ID, COLLECTIONS } from './appwrite';
import { Query } from 'appwrite';
import { PaymentRequest, WithdrawalRequest, User, Pin } from '../types';
import { NotificationService } from './notifications';

export class AdminService {
  // Payment Requests
  static async getPaymentRequests(status?: string): Promise<PaymentRequest[]> {
    try {
      let queries = [];
      if (status && status !== 'all') {
        queries.push(Query.equal('status', status));
      }
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PAYMENT_REQUESTS,
        queries
      );
      
      return response.documents as PaymentRequest[];
    } catch (error) {
      console.error('Error fetching payment requests:', error);
      return [];
    }
  }

  static async approvePaymentRequest(
    requestId: string,
    adminUserId: string,
    adminNotes?: string
  ): Promise<void> {
    try {
      // First, get the payment request to get user details
      const paymentRequest = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.PAYMENT_REQUESTS,
        requestId
      ) as any;

      // Get an unused PIN
      const pinsResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PINS,
        [Query.equal('status', 'unused')]
      );

      if (pinsResponse.documents.length === 0) {
        throw new Error('No unused PINs available. Please generate more PINs first.');
      }

      const pinToAssign = pinsResponse.documents[0] as any;
      const pinCode = pinToAssign.pinCode;

      // Update the payment request status
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.PAYMENT_REQUESTS,
        requestId,
        {
          status: 'approved',
          approvedBy: adminUserId,
          approvedAt: new Date().toISOString(),
          adminNotes: adminNotes || ''
        }
      );

      // Update the user's status and assign PIN
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        paymentRequest.userId,
        {
          paymentStatus: 'approved',
          isActive: true,
          referralPin: pinCode,
          updatedAt: new Date().toISOString()
        }
      );

      // Update the PIN status to assigned
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.PINS,
        pinToAssign.$id,
        {
          status: 'assigned',
          assignedTo: paymentRequest.userId,
          assignedAt: new Date().toISOString()
        }
      );

      // Create notification for the user
      await NotificationService.createNotification({
        userId: paymentRequest.userId,
        type: 'payment_approved',
        title: 'Payment Approved',
        message: `Your payment of ${paymentRequest.amount} PKR has been approved. Your referral PIN is: ${pinCode}. You can now start referring users and earning!`,
        isRead: false,
        relatedId: requestId,
        createdAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error approving payment request:', error);
      throw error;
    }
  }

  static async rejectPaymentRequest(
    requestId: string,
    adminUserId: string,
    rejectionReason: string
  ): Promise<void> {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.PAYMENT_REQUESTS,
        requestId,
        {
          status: 'rejected',
          approvedBy: adminUserId,
          approvedAt: new Date().toISOString(),
          rejectionReason
        }
      );
    } catch (error) {
      console.error('Error rejecting payment request:', error);
      throw error;
    }
  }

  // Withdrawal Requests
  static async getWithdrawalRequests(status?: string): Promise<WithdrawalRequest[]> {
    try {
      let queries = [];
      if (status && status !== 'all') {
        queries.push(Query.equal('status', status));
      }
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.WITHDRAWAL_REQUESTS,
        queries
      );
      
      return response.documents as WithdrawalRequest[];
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
      return [];
    }
  }

  static async approveWithdrawalRequest(
    requestId: string,
    adminUserId: string,
    adminNotes?: string
  ): Promise<void> {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.WITHDRAWAL_REQUESTS,
        requestId,
        {
          status: 'approved',
          approvedBy: adminUserId,
          approvedAt: new Date().toISOString(),
          adminNotes: adminNotes || ''
        }
      );
    } catch (error) {
      console.error('Error approving withdrawal request:', error);
      throw error;
    }
  }

  static async rejectWithdrawalRequest(
    requestId: string,
    adminUserId: string,
    rejectionReason: string
  ): Promise<void> {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.WITHDRAWAL_REQUESTS,
        requestId,
        {
          status: 'rejected',
          approvedBy: adminUserId,
          approvedAt: new Date().toISOString(),
          rejectionReason
        }
      );
    } catch (error) {
      console.error('Error rejecting withdrawal request:', error);
      throw error;
    }
  }

  // Users
  static async getAllUsers(): Promise<User[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS
      );
      
      return response.documents as User[];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  // PIN Management
  static async getAllPins(): Promise<Pin[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PINS
      );
      return response.documents as Pin[];
    } catch (error) {
      console.error('Error fetching pins:', error);
      throw new Error('Failed to fetch pins');
    }
  }

  static async generateBulkPins(count: number, adminUserId: string): Promise<string[]> {
    try {
      const pins: string[] = [];
      
      for (let i = 0; i < count; i++) {
        const pinCode = this.generateUniquePin();
        const pinData = {
          pinCode,
          status: 'unused',
          generatedBy: adminUserId,
          createdAt: new Date().toISOString()
        };
        
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.PINS,
          'unique()',
          pinData
        );
        
        pins.push(pinCode);
      }
      
      return pins;
    } catch (error) {
      console.error('Error generating pins:', error);
      throw new Error('Failed to generate pins');
    }
  }

  static async assignPinToUser(pinId: string, userId: string): Promise<void> {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.PINS,
        pinId,
        {
          status: 'assigned',
          assignedTo: userId,
          assignedAt: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Error assigning pin to user:', error);
      throw new Error('Failed to assign pin to user');
    }
  }

  private static generateUniquePin(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
