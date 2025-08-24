import { databases, COLLECTIONS } from './appwrite';
import { Query } from 'appwrite';
import { WithdrawalRequest, User } from '../types';

export class WithdrawalRequestService {

  // Create withdrawal request
  static async createWithdrawalRequest(
    userId: string,
    userName: string,
    userEmail: string,
    userPin: string,
    amount: number,
    userCurrentBalance: number
  ): Promise<WithdrawalRequest> {
    try {
      // Validate amount
      if (amount <= 0) {
        throw new Error('Withdrawal amount must be greater than 0');
      }

      if (amount > userCurrentBalance) {
        throw new Error('Insufficient balance for withdrawal');
      }

      // Create withdrawal request
      const response = await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        COLLECTIONS.WITHDRAWAL_REQUESTS,
        'unique()',
        {
          userId,
          userName,
          userEmail,
          userPin,
          amount,
          userCurrentBalance,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );

      return response as unknown as WithdrawalRequest;
    } catch (error) {
      console.error('Error creating withdrawal request:', error);
      throw new Error('Failed to create withdrawal request');
    }
  }

  // Get withdrawal request by user ID
  static async getWithdrawalRequestByUserId(userId: string): Promise<WithdrawalRequest[]> {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        COLLECTIONS.WITHDRAWAL_REQUESTS,
        [Query.equal('userId', userId)]
      );

      return response.documents as WithdrawalRequest[];
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
      return [];
    }
  }

  // Get withdrawal request by ID
  static async getWithdrawalRequestById(requestId: string): Promise<WithdrawalRequest | null> {
    try {
      const response = await databases.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        COLLECTIONS.WITHDRAWAL_REQUESTS,
        requestId
      );

      return response as unknown as WithdrawalRequest;
    } catch (error) {
      console.error('Error fetching withdrawal request:', error);
      return null;
    }
  }

  // Update withdrawal request
  static async updateWithdrawalRequest(
    requestId: string,
    updates: Partial<WithdrawalRequest>
  ): Promise<WithdrawalRequest> {
    try {
      const response = await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        COLLECTIONS.WITHDRAWAL_REQUESTS,
        requestId,
        {
          ...updates,
          updatedAt: new Date().toISOString()
        }
      );

      return response as WithdrawalRequest;
    } catch (error) {
      console.error('Error updating withdrawal request:', error);
      throw new Error('Failed to update withdrawal request');
    }
  }

  // Delete withdrawal request
  static async deleteWithdrawalRequest(requestId: string): Promise<void> {
    try {
      await databases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        COLLECTIONS.WITHDRAWAL_REQUESTS,
        requestId
      );
    } catch (error) {
      console.error('Error deleting withdrawal request:', error);
      throw new Error('Failed to delete withdrawal request');
    }
  }

  // Get user's withdrawal history
  static async getUserWithdrawalHistory(userId: string): Promise<WithdrawalRequest[]> {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        COLLECTIONS.WITHDRAWAL_REQUESTS,
        [
          Query.equal('userId', userId),
          Query.orderDesc('createdAt')
        ]
      );

      return response.documents as WithdrawalRequest[];
    } catch (error) {
      console.error('Error fetching withdrawal history:', error);
      return [];
    }
  }

  // Validate PIN for withdrawal
  static async validatePinForWithdrawal(userPin: string, userId: string): Promise<boolean> {
    try {
      // Get user by PIN
      const userResponse = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        COLLECTIONS.USERS,
        [Query.equal('referralPin', userPin)]
      );

      const user = userResponse.documents[0] as User;
      
      // Check if PIN matches the requesting user
      return user && user.$id === userId;
    } catch (error) {
      console.error('Error validating PIN:', error);
      return false;
    }
  }
}

