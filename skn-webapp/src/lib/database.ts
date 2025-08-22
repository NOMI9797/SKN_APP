import { databases, DATABASE_ID, COLLECTIONS } from './appwrite';
import { ID, Query } from 'appwrite';
import { User, Referral, Payment, Pair, Earning, StarLevel, SystemSettings } from '../types';

export class DatabaseService {
  // Users Collection Operations
  async createUser(userData: Omit<User, '$id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    try {
      const user = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        ID.unique(),
        {
          ...userData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      return user as unknown as User;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async createUserWithId(userId: string, userData: Omit<User, '$id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    try {
      const user = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userId, // Use the provided ID instead of generating a new one
        {
          ...userData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      return user as unknown as User;
    } catch (error) {
      console.error('Error creating user with ID:', error);
      throw error;
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const user = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userId
      );
      return user as unknown as User;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Document with the requested ID could not be found')) {
        return null;
      }
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [Query.equal('email', email)]
      );
      return result.documents.length > 0 ? (result.documents[0] as unknown as User) : null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  async updateUser(userId: string, updateData: Partial<Omit<User, '$id' | 'createdAt'>>): Promise<User> {
    try {
      const user = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userId,
        {
          ...updateData,
          updatedAt: new Date().toISOString(),
        }
      );
      return user as unknown as User;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async getUserByReferralCode(referralCode: string): Promise<User | null> {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [Query.equal('referralCode', referralCode)]
      );
      return result.documents.length > 0 ? (result.documents[0] as unknown as User) : null;
    } catch (error) {
      console.error('Error getting user by referral code:', error);
      return null;
    }
  }

  // Referrals Collection Operations
  async createReferral(referralData: Omit<Referral, '$id'>): Promise<Referral> {
    try {
      const referral = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.REFERRALS,
        ID.unique(),
        {
          ...referralData,
          createdAt: new Date().toISOString(),
        }
      );
      return referral as unknown as Referral;
    } catch (error) {
      console.error('Error creating referral:', error);
      throw error;
    }
  }

  async getReferralsBySponsorId(sponsorId: string): Promise<Referral[]> {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.REFERRALS,
        [Query.equal('sponsorId', sponsorId)]
      );
      return result.documents as unknown as Referral[];
    } catch (error) {
      console.error('Error getting referrals by sponsor:', error);
      return [];
    }
  }

  // Payments Collection Operations
  async createPayment(paymentData: Omit<Payment, '$id'>): Promise<Payment> {
    try {
      const payment = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.PAYMENTS,
        ID.unique(),
        {
          ...paymentData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      return payment as unknown as Payment;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  async getPaymentsByUserId(userId: string): Promise<Payment[]> {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PAYMENTS,
        [Query.equal('userId', userId)]
      );
      return result.documents as unknown as Payment[];
    } catch (error) {
      console.error('Error getting payments by user:', error);
      return [];
    }
  }

  // Pairs Collection Operations
  async createPair(pairData: Omit<Pair, '$id'>): Promise<Pair> {
    try {
      const pair = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.PAIR_COMPLETIONS,
        ID.unique(),
        pairData
      );
      return pair as unknown as Pair;
    } catch (error) {
      console.error('Error creating pair:', error);
      throw error;
    }
  }

  async getPairsByUserId(userId: string): Promise<Pair[]> {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PAIR_COMPLETIONS,
        [Query.equal('userId', userId)]
      );
      return result.documents as unknown as Pair[];
    } catch (error) {
      console.error('Error getting pairs by user:', error);
      return [];
    }
  }

  // Earnings Collection Operations
  async createEarning(earningData: Omit<Earning, '$id'>): Promise<Earning> {
    try {
      const earning = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.EARNINGS,
        ID.unique(),
        earningData
      );
      return earning as unknown as Earning;
    } catch (error) {
      console.error('Error creating earning:', error);
      throw error;
    }
  }

  async getEarningsByUserId(userId: string): Promise<Earning[]> {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.EARNINGS,
        [Query.equal('userId', userId)]
      );
      return result.documents as unknown as Earning[];
    } catch (error) {
      console.error('Error getting earnings by user:', error);
      return [];
    }
  }

  // Star Levels Collection Operations
  async getStarLevels(): Promise<StarLevel[]> {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.STAR_ACHIEVEMENTS,
        [Query.equal('isActive', true)]
      );
      return result.documents as unknown as StarLevel[];
    } catch (error) {
      console.error('Error getting star levels:', error);
      return [];
    }
  }

  async getStarLevelByLevel(level: number): Promise<StarLevel | null> {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.STAR_ACHIEVEMENTS,
        [Query.equal('level', level)]
      );
      return result.documents.length > 0 ? (result.documents[0] as unknown as StarLevel) : null;
    } catch (error) {
      console.error('Error getting star level by level:', error);
      return null;
    }
  }

  // System Settings Operations
  async getSystemSettings(): Promise<SystemSettings | null> {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.NETWORK_STATS,
        []
      );
      return result.documents.length > 0 ? (result.documents[0] as unknown as SystemSettings) : null;
    } catch (error) {
      console.error('Error getting system settings:', error);
      return null;
    }
  }

  // Binary Tree Operations
  async getUsersBySponsorId(sponsorId: string): Promise<User[]> {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [Query.equal('sponsorId', sponsorId)]
      );
      return result.documents as unknown as User[];
    } catch (error) {
      console.error('Error getting users by sponsor:', error);
      return [];
    }
  }

  async getUsersByParentId(parentId: string): Promise<User[]> {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [Query.equal('parentId', parentId)]
      );
      return result.documents as unknown as User[];
    } catch (error) {
      console.error('Error getting users by parent:', error);
      return [];
    }
  }

  async updateUserTreePosition(userId: string, treeData: {
    sponsorId?: string;
    parentId?: string;
    side?: 'left' | 'right';
    path?: string;
    depth?: number;
  }): Promise<User> {
    try {
      const user = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userId,
        {
          ...treeData,
          updatedAt: new Date().toISOString(),
        }
      );
      return user as unknown as User;
    } catch (error) {
      console.error('Error updating user tree position:', error);
      throw error;
    }
  }

  // Additional MLM Operations
  async getReferralTree(userId: string, maxDepth: number = 5): Promise<User[]> {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [
          Query.equal('sponsorId', userId),
          Query.lessThanEqual('depth', maxDepth)
        ]
      );
      return result.documents as unknown as User[];
    } catch (error) {
      console.error('Error getting referral tree:', error);
      return [];
    }
  }

  async getDirectReferrals(userId: string): Promise<User[]> {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [Query.equal('sponsorId', userId)]
      );
      return result.documents as unknown as User[];
    } catch (error) {
      console.error('Error getting direct referrals:', error);
      return [];
    }
  }

  async getUserStats(userId: string): Promise<{
    totalReferrals: number;
    leftReferrals: number;
    rightReferrals: number;
    totalPairs: number;
    totalEarnings: number;
    currentStarLevel: number;
  }> {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        // User doesn't exist in database yet, return default stats
        return {
          totalReferrals: 0,
          leftReferrals: 0,
          rightReferrals: 0,
          totalPairs: 0,
          totalEarnings: 0,
          currentStarLevel: 0,
        };
      }

      const directReferrals = await this.getDirectReferrals(userId);

      return {
        totalReferrals: directReferrals.length,
        leftReferrals: user.leftActiveCount || 0,
        rightReferrals: user.rightActiveCount || 0,
        totalPairs: user.pairsCompleted || 0,
        totalEarnings: user.totalEarnings || 0,
        currentStarLevel: user.starLevel || 0,
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        totalReferrals: 0,
        leftReferrals: 0,
        rightReferrals: 0,
        totalPairs: 0,
        totalEarnings: 0,
        currentStarLevel: 0,
      };
    }
  }

  // Pair placement and propagation
  private async findPlacementSlotBFS(rootUserId: string): Promise<{ parentId: string; side: 'left' | 'right'; depth: number; path: string } | null> {
    const queue: Array<{ id: string; depth: number; path: string }> = [{ id: rootUserId, depth: 0, path: rootUserId }];
    while (queue.length > 0) {
      const current = queue.shift()!;
      const parent = await this.getUserById(current.id);
      if (!parent) continue;

      const leftChildId = (parent as any).leftChildId as string | undefined;
      const rightChildId = (parent as any).rightChildId as string | undefined;

      if (!leftChildId) {
        return { parentId: parent.$id, side: 'left', depth: (parent.depth || 0) + 1, path: `${current.path}/${parent.$id}` };
      }
      if (!rightChildId) {
        return { parentId: parent.$id, side: 'right', depth: (parent.depth || 0) + 1, path: `${current.path}/${parent.$id}` };
      }

      // Enqueue children
      const children = await this.getUsersByParentId(parent.$id);
      for (const child of children) {
        queue.push({ id: child.$id, depth: (child.depth || 0), path: `${current.path}/${parent.$id}` });
      }
    }
    return null;
  }

  private calculatePairEarningAmount(pairIndex: number): number {
    if (pairIndex === 1) return 400;
    if (pairIndex >= 2 && pairIndex <= 99) return 200;
    return 100;
  }

  private async propagateActivationUpwards(startParentId: string, originatingSide: 'left' | 'right'): Promise<void> {
    let currentParent = await this.getUserById(startParentId);
    let childSide: 'left' | 'right' = originatingSide;

    while (currentParent) {
      const beforeLeft = currentParent.leftActiveCount || 0;
      const beforeRight = currentParent.rightActiveCount || 0;
      const beforePairs = currentParent.pairsCompleted || 0;
      const beforeTotal = currentParent.totalEarnings || 0;

      const newLeft = childSide === 'left' ? beforeLeft + 1 : beforeLeft;
      const newRight = childSide === 'right' ? beforeRight + 1 : beforeRight;

      let updates: Partial<User> = {
        leftActiveCount: newLeft,
        rightActiveCount: newRight,
      } as Partial<User>;

      // Determine new pairs formed
      const possiblePairs = Math.min(newLeft, newRight);
      let newPairs = Math.max(0, possiblePairs - beforePairs);

      if (newPairs > 0) {
        // Create pairs and earnings
        for (let i = 1; i <= newPairs; i++) {
          const nextPairIndex = (currentParent.pairsCompleted || 0) + i;
          const amount = this.calculatePairEarningAmount(nextPairIndex);

          try {
            await this.createPair({
              userId: currentParent.$id,
              pairIndex: nextPairIndex,
              leftUserId: (currentParent as any).leftChildId || '',
              rightUserId: (currentParent as any).rightChildId || '',
              completedAt: new Date().toISOString(),
              amount,
            } as unknown as Omit<Pair, '$id'>);
          } catch (e) {
            console.error('Failed to create pair record:', e);
          }

          try {
            await this.createEarning({
              userId: currentParent.$id,
              sourceType: 'pair',
              sourceId: `pair_${nextPairIndex}`,
              amount,
              currency: 'PKR',
              balanceAfter: undefined,
              note: `Pair #${nextPairIndex} completion reward`,
              createdAt: new Date().toISOString(),
            } as unknown as Omit<Earning, '$id'>);
          } catch (e) {
            console.error('Failed to create earning record:', e);
          }
        }

        // Sum earnings added for these new pairs explicitly to avoid typing issues
        let earningsAdded = 0;
        for (let idx = 0; idx < newPairs; idx++) {
          const pairIndex = beforePairs + idx + 1;
          earningsAdded += this.calculatePairEarningAmount(pairIndex);
        }

        updates = {
          ...updates,
          pairsCompleted: beforePairs + newPairs,
          totalEarnings: beforeTotal + earningsAdded,
        } as Partial<User>;
      }

      // Persist updates on current parent
      currentParent = await this.updateUser(currentParent.$id, updates);

      // Move up one level
      const nextParentId = currentParent.parentId;
      if (!nextParentId) break;
      // childSide becomes the side of the current parent relative to its parent
      childSide = (currentParent.side || 'left');
      currentParent = await this.getUserById(nextParentId);
    }
  }

  async placeAndProcessPairsForUser(newUserId: string, sponsorId?: string): Promise<void> {
    try {
      const newUser = await this.getUserById(newUserId);
      if (!newUser) return;

      const rootId = sponsorId || newUser.sponsorId || '';
      if (!rootId) return; // cannot place without a sponsor root

      // Find placement under sponsor using leftmost strategy (BFS)
      const slot = await this.findPlacementSlotBFS(rootId);
      if (!slot) return;

      // Update new user's tree position
      const updatedNewUser = await this.updateUser(newUserId, {
        parentId: slot.parentId,
        side: slot.side,
        depth: slot.depth,
        path: slot.path,
        isActive: true,
      });

      // Update parent child's pointer
      const parent = await this.getUserById(slot.parentId);
      if (parent) {
        const childField = slot.side === 'left' ? 'leftChildId' : 'rightChildId';
        const update: any = {};
        update[childField] = updatedNewUser.$id;
        await this.updateUser(parent.$id, update);
      }

      // Propagate activation upwards to count and pair
      await this.propagateActivationUpwards(slot.parentId, slot.side);
    } catch (error) {
      console.error('placeAndProcessPairsForUser failed:', error);
    }
  }
}

export const databaseService = new DatabaseService(); 