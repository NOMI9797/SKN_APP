import { databases, COLLECTIONS } from './appwrite';
import { Query } from 'appwrite';
import { StorageService } from './storage';
import { PaymentRequest } from '../types';

export class PaymentRequestService {
  // Create payment request
  static async createPaymentRequest(
    userId: string,
    userName: string,
    userEmail: string,
    paymentType: 'easypaisa' | 'jazzcash',
    amount: number,
    transactionId: string,
    screenshot: File
  ): Promise<PaymentRequest> {
    try {
      // Validate minimum amount
      if (amount < 850) {
        throw new Error('Payment amount must be at least 850 PKR');
      }

      // Upload screenshot
      const { fileId, fileUrl } = await StorageService.uploadPaymentScreenshot(
        screenshot,
        userId
      );

      // Create payment request
      const response = await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        COLLECTIONS.PAYMENT_REQUESTS,
        'unique()',
        {
          userId,
          userName,
          userEmail,
          paymentType,
          amount,
          transactionId,
          screenshotFileId: fileId,
          screenshotUrl: fileUrl,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );

      // Update user's payment status and payment request ID
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        COLLECTIONS.USERS,
        userId,
        {
          paymentStatus: 'pending',
          paymentRequestId: response.$id
        }
      );

      return response as PaymentRequest;
    } catch (error) {
      console.error('Error creating payment request:', error);
      throw new Error('Failed to create payment request');
    }
  }

  // Get payment request by user ID
  static async getPaymentRequestByUserId(userId: string): Promise<PaymentRequest | null> {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        COLLECTIONS.PAYMENT_REQUESTS,
        [Query.equal('userId', userId)]
      );

      return response.documents[0] as PaymentRequest || null;
    } catch (error) {
      console.error('Error fetching payment request:', error);
      return null;
    }
  }

  // Get payment request by ID
  static async getPaymentRequestById(requestId: string): Promise<PaymentRequest | null> {
    try {
      const response = await databases.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        COLLECTIONS.PAYMENT_REQUESTS,
        requestId
      );

      return response as PaymentRequest;
    } catch (error) {
      console.error('Error fetching payment request:', error);
      return null;
    }
  }

  // Update payment request
  static async updatePaymentRequest(
    requestId: string,
    updates: Partial<PaymentRequest>
  ): Promise<PaymentRequest> {
    try {
      const response = await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        COLLECTIONS.PAYMENT_REQUESTS,
        requestId,
        {
          ...updates,
          updatedAt: new Date().toISOString()
        }
      );

      return response as PaymentRequest;
    } catch (error) {
      console.error('Error updating payment request:', error);
      throw new Error('Failed to update payment request');
    }
  }

  // Delete payment request
  static async deletePaymentRequest(requestId: string): Promise<void> {
    try {
      await databases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        COLLECTIONS.PAYMENT_REQUESTS,
        requestId
      );
    } catch (error) {
      console.error('Error deleting payment request:', error);
      throw new Error('Failed to delete payment request');
    }
  }
}

