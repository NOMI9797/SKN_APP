import { databases, COLLECTIONS } from './appwrite';
import { Query } from 'appwrite';
import { Notification } from '../types';

export class NotificationService {
  // Create notification
  static async createNotification(notification: Omit<Notification, '$id'>): Promise<Notification> {
    try {
      const response = await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        COLLECTIONS.NOTIFICATIONS,
        'unique()',
        notification
      );

      return response as Notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }

  // Get notifications for user
  static async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        COLLECTIONS.NOTIFICATIONS,
        [
          Query.equal('userId', userId),
          Query.orderDesc('createdAt')
        ]
      );

      return response.documents as Notification[];
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return [];
    }
  }

  // Get unread notifications for user
  static async getUnreadNotifications(userId: string): Promise<Notification[]> {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        COLLECTIONS.NOTIFICATIONS,
        [
          Query.equal('userId', userId),
          Query.equal('isRead', false),
          Query.orderDesc('createdAt')
        ]
      );

      return response.documents as Notification[];
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        COLLECTIONS.NOTIFICATIONS,
        notificationId,
        {
          isRead: true
        }
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  // Mark all notifications as read for user
  static async markAllAsRead(userId: string): Promise<void> {
    try {
      const unreadNotifications = await this.getUnreadNotifications(userId);
      
      for (const notification of unreadNotifications) {
        await this.markAsRead(notification.$id);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }

  // Delete notification
  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      await databases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        COLLECTIONS.NOTIFICATIONS,
        notificationId
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new Error('Failed to delete notification');
    }
  }

  // Get notification count for user
  static async getNotificationCount(userId: string): Promise<number> {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        COLLECTIONS.NOTIFICATIONS,
        [
          Query.equal('userId', userId),
          Query.equal('isRead', false)
        ]
      );

      return response.total;
    } catch (error) {
      console.error('Error getting notification count:', error);
      return 0;
    }
  }

  // Get notifications by type
  static async getNotificationsByType(userId: string, type: string): Promise<Notification[]> {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        COLLECTIONS.NOTIFICATIONS,
        [
          Query.equal('userId', userId),
          Query.equal('type', type),
          Query.orderDesc('createdAt')
        ]
      );

      return response.documents as Notification[];
    } catch (error) {
      console.error('Error fetching notifications by type:', error);
      return [];
    }
  }
}

