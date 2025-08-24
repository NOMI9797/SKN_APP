import { storage, BUCKETS } from './appwrite';

// Storage bucket IDs
export const STORAGE_BUCKETS = {
  FILES: BUCKETS.FILES
} as const;

export class StorageService {
  // Upload payment screenshot
  static async uploadPaymentScreenshot(
    file: File,
    userId: string
  ): Promise<{ fileId: string; fileUrl: string }> {
    try {
      console.log('Using storage bucket ID:', STORAGE_BUCKETS.FILES);
      console.log('Environment variable value:', process.env.NEXT_PUBLIC_APPWRITE_BUCKET_FILES);
      console.log('BUCKETS.FILES value:', BUCKETS.FILES);
      
      // Use 'unique()' for file ID and set a proper file name
      const uploadedFile = await storage.createFile(
        STORAGE_BUCKETS.FILES,
        'unique()',
        file
      );

      const fileUrl = storage.getFileView(
        STORAGE_BUCKETS.FILES,
        uploadedFile.$id
      );

      return {
        fileId: uploadedFile.$id,
        fileUrl: fileUrl.toString()
      };
    } catch (error) {
      console.error('Error uploading payment screenshot:', error);
      throw new Error('Failed to upload payment screenshot');
    }
  }

  // Upload withdrawal proof (admin)
  static async uploadWithdrawalProof(
    file: File,
    adminUserId: string,
    withdrawalId: string
  ): Promise<{ fileId: string; fileUrl: string }> {
    try {
      // Use 'unique()' for file ID
      const uploadedFile = await storage.createFile(
        STORAGE_BUCKETS.FILES,
        'unique()',
        file
      );

      const fileUrl = storage.getFileView(
        STORAGE_BUCKETS.FILES,
        uploadedFile.$id
      );

      return {
        fileId: uploadedFile.$id,
        fileUrl: fileUrl.toString()
      };
    } catch (error) {
      console.error('Error uploading withdrawal proof:', error);
      throw new Error('Failed to upload withdrawal proof');
    }
  }

  // Delete file
  static async deleteFile(bucketId: string, fileId: string): Promise<void> {
    try {
      await storage.deleteFile(bucketId, fileId);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }

  // Get file URL
  static getFileUrl(bucketId: string, fileId: string): string {
    return storage.getFileView(bucketId, fileId).toString();
  }
}
