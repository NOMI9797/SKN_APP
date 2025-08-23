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
      const beforeStarLevel = currentParent.starLevel || 0;

      const newLeft = childSide === 'left' ? beforeLeft + 1 : beforeLeft;
      const newRight = childSide === 'right' ? beforeRight + 1 : beforeRight;

      let updates: Partial<User> = {
        leftActiveCount: newLeft,
        rightActiveCount: newRight,
      } as Partial<User>;

      // Determine new pairs formed based on direct referrals, not tree placement
      const directReferrals = await this.getDirectReferrals(currentParent.$id);
      const directReferralCount = directReferrals.length;
      const possiblePairs = Math.floor(directReferralCount / 2);
      let newPairs = Math.max(0, possiblePairs - beforePairs);

      if (newPairs > 0) {
        // For each new pair, both sides get 1 pair
        const newLeftPairs = newPairs;
        const newRightPairs = newPairs;

        // Create pairs and earnings
        for (let i = 1; i <= newPairs; i++) {
          const nextPairIndex = (currentParent.pairsCompleted || 0) + i;
          const amount = this.calculatePairEarningAmount(nextPairIndex);

          try {
            await this.createPair({
              userId: currentParent.$id,
              pairNumber: nextPairIndex,
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

        const finalLeftPairs = (currentParent.leftPairs || 0) + newLeftPairs;
        const finalRightPairs = (currentParent.rightPairs || 0) + newRightPairs;

        updates = {
          ...updates,
          leftPairs: finalLeftPairs,
          rightPairs: finalRightPairs,
          pairsCompleted: Math.min(finalLeftPairs, finalRightPairs),
          totalEarnings: beforeTotal + earningsAdded,
        } as Partial<User>;

        // Give sponsor bonus to upper levels (MLM structure)
        if (newPairs > 0 && currentParent.sponsorId) {
          try {
            await this.createEarning({
              userId: currentParent.sponsorId,
              sourceType: 'sponsor_bonus',
              sourceId: `sponsor_bonus_${currentParent.$id}_pair_${beforePairs + 1}`,
              amount: 100, // Sponsor bonus amount
              currency: 'PKR',
              balanceAfter: undefined,
              note: `Sponsor bonus from ${currentParent.name}'s pair completion`,
              createdAt: new Date().toISOString(),
            } as unknown as Omit<Earning, '$id'>);

            // Update sponsor's total earnings
            const sponsor = await this.getUserById(currentParent.sponsorId);
            if (sponsor) {
              await this.updateUser(sponsor.$id, {
                totalEarnings: (sponsor.totalEarnings || 0) + 100,
              });
            }
          } catch (e) {
            console.error('Failed to create sponsor bonus earning record:', e);
          }
        }
      }

      // Check for star level progression based on left/right pair counts
      const newLeftPairs = updates.leftPairs || (currentParent.leftPairs || 0);
      const newRightPairs = updates.rightPairs || (currentParent.rightPairs || 0);
      const newStarLevel = this.calculateStarLevel(newLeftPairs, newRightPairs);
      
      if (newStarLevel > beforeStarLevel) {
        // User has achieved a new star level
        const starReward = this.calculateStarLevelReward(newStarLevel);
        
        try {
          await this.createEarning({
            userId: currentParent.$id,
            sourceType: 'star_reward',
            sourceId: `star_${newStarLevel}`,
            amount: starReward,
            currency: 'PKR',
            balanceAfter: undefined,
            note: `Star Level ${newStarLevel} achievement reward`,
            createdAt: new Date().toISOString(),
          } as unknown as Omit<Earning, '$id'>);
        } catch (e) {
          console.error('Failed to create star level earning record:', e);
        }

        updates = {
          ...updates,
          starLevel: newStarLevel,
          totalEarnings: (updates.totalEarnings || beforeTotal) + starReward,
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

  // Star level calculation based on left/right pair counts (not total pairs)
  private calculateStarLevel(leftPairs: number, rightPairs: number): number {
    const minPairs = Math.min(leftPairs, rightPairs);
    
    if (minPairs >= 50000) return 12; // Diamond
    if (minPairs >= 40000) return 11; // Platinum
    if (minPairs >= 30000) return 10; // Gold
    if (minPairs >= 20000) return 9;  // Silver
    if (minPairs >= 10000) return 8;  // Bronze
    if (minPairs >= 5000) return 7;   // Ruby
    if (minPairs >= 2500) return 6;   // Emerald
    if (minPairs >= 1100) return 5;   // Sapphire
    if (minPairs >= 550) return 4;    // Amethyst
    if (minPairs >= 100) return 3;    // Topaz
    if (minPairs >= 30) return 2;     // Pearl
    if (minPairs >= 10) return 1;     // Crystal
    return 0; // No star level
  }

  // Star level reward calculation (corrected amounts)
  private calculateStarLevelReward(starLevel: number): number {
    const rewards = {
      1: 500,       // Crystal (10/10 pairs)
      2: 1500,      // Pearl (30/30 pairs)
      3: 3000,      // Topaz (100/100 pairs)
      4: 25000,     // Amethyst (550/550 pairs)
      5: 35000,     // Sapphire (1100/1100 pairs)
      6: 60000,     // Emerald (2500/2500 pairs)
      7: 140000,    // Ruby (5000/5000 pairs)
      8: 300000,    // Bronze (10000/10000 pairs)
      9: 600000,    // Silver (20000/20000 pairs)
      10: 1000000,  // Gold (30000/30000 pairs)
      11: 1500000,  // Platinum (40000/40000 pairs)
      12: 2000000,  // Diamond (50000/50000 pairs)
    };
    return rewards[starLevel as keyof typeof rewards] || 0;
  }

  // Initialize star levels in database
  async initializeStarLevels(): Promise<void> {
    try {
      const starLevels = [
        { level: 1, requiredPairs: 10, rewardAmount: 500, title: 'Crystal', isActive: true },
        { level: 2, requiredPairs: 30, rewardAmount: 1500, title: 'Pearl', isActive: true },
        { level: 3, requiredPairs: 100, rewardAmount: 3000, title: 'Topaz', isActive: true },
        { level: 4, requiredPairs: 550, rewardAmount: 25000, title: 'Amethyst', isActive: true },
        { level: 5, requiredPairs: 1100, rewardAmount: 35000, title: 'Sapphire', isActive: true },
        { level: 6, requiredPairs: 2500, rewardAmount: 60000, title: 'Emerald', isActive: true },
        { level: 7, requiredPairs: 5000, rewardAmount: 140000, title: 'Ruby', isActive: true },
        { level: 8, requiredPairs: 10000, rewardAmount: 300000, title: 'Bronze', isActive: true },
        { level: 9, requiredPairs: 20000, rewardAmount: 600000, title: 'Silver', isActive: true },
        { level: 10, requiredPairs: 30000, rewardAmount: 1000000, title: 'Gold', isActive: true },
        { level: 11, requiredPairs: 40000, rewardAmount: 1500000, title: 'Platinum', isActive: true },
        { level: 12, requiredPairs: 50000, rewardAmount: 2000000, title: 'Diamond', isActive: true },
      ];

      for (const starLevel of starLevels) {
        try {
          await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.STAR_ACHIEVEMENTS,
            ID.unique(),
            {
              ...starLevel,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          );
        } catch (error: any) {
          // Ignore if star level already exists
          if (!error.message.includes('already exists')) {
            console.error('Error creating star level:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error initializing star levels:', error);
    }
  }

  // Get placement strategy from system settings
  private async getPlacementStrategy(): Promise<'leftmost' | 'balanced'> {
    try {
      const settings = await this.getSystemSettings();
      return settings?.placementStrategy || 'leftmost';
    } catch (error) {
      console.error('Error getting placement strategy:', error);
      return 'leftmost'; // Default fallback
    }
  }

  async placeAndProcessPairsForUser(newUserId: string, sponsorId?: string): Promise<void> {
    try {
      const newUser = await this.getUserById(newUserId);
      if (!newUser) return;

      const rootId = sponsorId || newUser.sponsorId || '';
      if (!rootId) return; // cannot place without a sponsor root

      // Find placement directly under the sponsor (flat structure)
      const slot = await this.findPlacementSlotUnderSponsor(rootId);
      
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

  // Find placement slot directly under sponsor (flat structure)
  private async findPlacementSlotUnderSponsor(sponsorId: string): Promise<{ parentId: string; side: 'left' | 'right'; depth: number; path: string } | null> {
    try {
      const sponsor = await this.getUserById(sponsorId);
      if (!sponsor) return null;

      // Use BFS to find the next available slot, but prioritize direct placement under sponsor
      const leftChildId = (sponsor as any).leftChildId as string | undefined;
      const rightChildId = (sponsor as any).rightChildId as string | undefined;

      // If left side is empty, place there
      if (!leftChildId) {
        return { 
          parentId: sponsor.$id, 
          side: 'left', 
          depth: (sponsor.depth || 0) + 1, 
          path: `${sponsorId}/${sponsor.$id}` 
        };
      }

      // If right side is empty, place there
      if (!rightChildId) {
        return { 
          parentId: sponsor.$id, 
          side: 'right', 
          depth: (sponsor.depth || 0) + 1, 
          path: `${sponsorId}/${sponsor.$id}` 
        };
      }

      // Both sides are full, continue with BFS placement
      return await this.findPlacementSlotBFS(sponsorId);
    } catch (error) {
      console.error('Error finding placement slot under sponsor:', error);
      return null;
    }
  }

  // Balanced placement strategy - places users to maintain tree balance
  private async findPlacementSlotBalanced(rootUserId: string): Promise<{ parentId: string; side: 'left' | 'right'; depth: number; path: string } | null> {
    const queue: Array<{ id: string; depth: number; path: string }> = [{ id: rootUserId, depth: 0, path: rootUserId }];
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      const parent = await this.getUserById(current.id);
      if (!parent) continue;

      const leftChildId = (parent as any).leftChildId as string | undefined;
      const rightChildId = (parent as any).rightChildId as string | undefined;

      // If either side is empty, place there
      if (!leftChildId) {
        return { parentId: parent.$id, side: 'left', depth: (parent.depth || 0) + 1, path: `${current.path}/${parent.$id}` };
      }
      if (!rightChildId) {
        return { parentId: parent.$id, side: 'right', depth: (parent.depth || 0) + 1, path: `${current.path}/${parent.$id}` };
      }

      // Both sides have children, choose the side with fewer total descendants
      const leftDescendants = await this.countDescendants(leftChildId);
      const rightDescendants = await this.countDescendants(rightChildId);

      // Enqueue the side with fewer descendants first (for balanced placement)
      if (leftDescendants <= rightDescendants) {
        queue.unshift({ id: leftChildId, depth: (parent.depth || 0) + 1, path: `${current.path}/${parent.$id}` });
        queue.push({ id: rightChildId, depth: (parent.depth || 0) + 1, path: `${current.path}/${parent.$id}` });
      } else {
        queue.unshift({ id: rightChildId, depth: (parent.depth || 0) + 1, path: `${current.path}/${parent.$id}` });
        queue.push({ id: leftChildId, depth: (parent.depth || 0) + 1, path: `${current.path}/${parent.$id}` });
      }
    }
    return null;
  }

  // Count total descendants of a user (recursive)
  private async countDescendants(userId: string): Promise<number> {
    try {
      const user = await this.getUserById(userId);
      if (!user) return 0;

      const leftChildId = (user as any).leftChildId as string | undefined;
      const rightChildId = (user as any).rightChildId as string | undefined;

      let count = 1; // Count self
      if (leftChildId) {
        count += await this.countDescendants(leftChildId);
      }
      if (rightChildId) {
        count += await this.countDescendants(rightChildId);
      }
      return count;
    } catch (error) {
      console.error('Error counting descendants:', error);
      return 0;
    }
  }

  // Initialize system settings
  async initializeSystemSettings(): Promise<void> {
    try {
      const settings = {
        joiningFee: 850,
        currency: 'PKR',
        pairEarning: 200,
        firstPairEarning: 400,
        regularPairEarning: 200,
        after100PairEarning: 100,
        placementStrategy: 'leftmost' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.NETWORK_STATS,
        ID.unique(),
        settings
      );
    } catch (error: any) {
      // Ignore if settings already exist
      if (!error.message.includes('already exists')) {
        console.error('Error creating system settings:', error);
      }
    }
  }

  // Comprehensive tree analysis for monitoring
  async analyzeTreeHealth(userId: string): Promise<{
    totalMembers: number;
    activeMembers: number;
    leftSideMembers: number;
    rightSideMembers: number;
    treeDepth: number;
    balanceRatio: number; // 0-1, 1 being perfectly balanced
    pairsCompleted: number;
    totalEarnings: number;
    averageEarningsPerMember: number;
    starLevelDistribution: Record<number, number>;
  }> {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get all descendants
      const descendants = await this.getAllDescendants(userId);
      const activeDescendants = descendants.filter(d => d.isActive);

      // Calculate tree depth
      const treeDepth = Math.max(...descendants.map(d => d.depth || 0));

      // Calculate balance ratio
      const leftSideMembers = user.leftActiveCount || 0;
      const rightSideMembers = user.rightActiveCount || 0;
      const totalActive = leftSideMembers + rightSideMembers;
      const balanceRatio = totalActive > 0 ? Math.min(leftSideMembers, rightSideMembers) / Math.max(leftSideMembers, rightSideMembers) : 1;

      // Calculate star level distribution
      const starLevelDistribution: Record<number, number> = {};
      for (const descendant of activeDescendants) {
        const level = descendant.starLevel || 0;
        starLevelDistribution[level] = (starLevelDistribution[level] || 0) + 1;
      }

      // Calculate average earnings
      const totalEarnings = activeDescendants.reduce((sum, d) => sum + (d.totalEarnings || 0), 0);
      const averageEarningsPerMember = activeDescendants.length > 0 ? totalEarnings / activeDescendants.length : 0;

      return {
        totalMembers: descendants.length,
        activeMembers: activeDescendants.length,
        leftSideMembers,
        rightSideMembers,
        treeDepth,
        balanceRatio,
        pairsCompleted: user.pairsCompleted || 0,
        totalEarnings: user.totalEarnings || 0,
        averageEarningsPerMember,
        starLevelDistribution,
      };
    } catch (error) {
      console.error('Error analyzing tree health:', error);
      throw error;
    }
  }

  // Get all descendants of a user (recursive)
  private async getAllDescendants(userId: string): Promise<User[]> {
    try {
      const user = await this.getUserById(userId);
      if (!user) return [];

      const leftChildId = (user as any).leftChildId as string | undefined;
      const rightChildId = (user as any).rightChildId as string | undefined;

      let descendants: User[] = [];
      
      if (leftChildId) {
        const leftChild = await this.getUserById(leftChildId);
        if (leftChild) {
          descendants.push(leftChild);
          descendants = descendants.concat(await this.getAllDescendants(leftChildId));
        }
      }
      
      if (rightChildId) {
        const rightChild = await this.getUserById(rightChildId);
        if (rightChild) {
          descendants.push(rightChild);
          descendants = descendants.concat(await this.getAllDescendants(rightChildId));
        }
      }

      return descendants;
    } catch (error) {
      console.error('Error getting descendants:', error);
      return [];
    }
  }
}

export const databaseService = new DatabaseService(); 