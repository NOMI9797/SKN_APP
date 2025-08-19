'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { account, databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, referralCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      if (!userId) {
        console.log('No user ID provided');
        setUser(null);
        return;
      }

      const userDoc = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userId
      );
      
      if (userDoc) {
        setUser(userDoc as unknown as User);
      } else {
        console.log('User document not found');
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Don't crash the app - just set user to null
      setUser(null);
      
      // If it's a document not found error, log it but don't show to user
      if (error instanceof Error && error.message.includes('Document with the requested ID could not be found')) {
        console.log('User document not found - this is normal for new registrations');
      }
    }
  }, []);

  const checkUser = useCallback(async () => {
    try {
      const currentUser = await account.get();
      console.log('checkUser - currentUser:', currentUser);
      
      if (currentUser && currentUser.$id && currentUser.$id.length <= 36) {
        // Only proceed if we have a valid user ID
        console.log('User logged in with valid ID:', currentUser.$id);
        setUser({ 
          $id: currentUser.$id,
          userId: currentUser.$id, // Set userId to match Appwrite auth ID
          email: currentUser.email,
          name: currentUser.name,
          referralCode: '',
          leftPairs: 0,
          rightPairs: 0,
          totalEarnings: 0,
          starLevel: 0,
          isActive: false,
          isVerified: false,
          registrationFee: 0,
          paymentStatus: 'pending',
          leftActiveCount: 0,
          rightActiveCount: 0,
          pairsCompleted: 0,
          depth: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as User);
      } else {
        console.log('Invalid user data:', currentUser);
        setUser(null);
      }
    } catch (error: any) {
      // Handle specific Appwrite permission errors
      if (error?.message?.includes('missing scope (account)') || 
          error?.message?.includes('User (role: guests)') ||
          error?.code === 401) {
        // This is normal - user is not logged in
        console.log('No user session found - user not logged in');
        setUser(null);
      } else {
        // Log other unexpected errors
        console.error('Unexpected error in checkUser:', error);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Attempting login with email:', email);

      // Authenticate against Appwrite auth with email + password
      const session = await account.createEmailPasswordSession(email, password);
      console.log('Session created:', session);

      // Fetch authenticated user from Appwrite
      const currentUser = await account.get();
      console.log('Current user after session creation:', currentUser);

      // Load user profile from your database (using email mapping)
      const userResult = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [Query.equal('email', email)]
      );

      if (userResult.documents.length > 0) {
        const userDoc = userResult.documents[0];
        setUser(userDoc as unknown as User);
      } else {
        console.log('No user document found for this email');
        setUser(null);
      }

    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, referralCode?: string) => {
    try {
      setLoading(true);
      
      console.log('Starting registration...');
      
      // Create Appwrite account
      const newAccount = await account.create(
        ID.unique(),
        email,
        password,
        name
      );
      
      console.log('Appwrite account created:', newAccount);

      // Create user profile in database with minimal attributes
      const userData = {
        email,
        name,
        referralCode: generateReferralCode(),
      };
      
      console.log('User data to create:', userData);
      console.log('Database ID:', DATABASE_ID);
      console.log('Collection ID:', COLLECTIONS.USERS);

      const userDoc = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        ID.unique(), // Use unique ID for document, not user auth ID
        userData
      );
      
      console.log('User document created:', userDoc);

      // User document created successfully
      // Don't auto-login to avoid session issues
      setUser(userDoc as unknown as User);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await account.deleteSessions();
    } catch (error: any) {
      if (
        error?.message?.includes('missing scope (account)') ||
        error?.message?.includes('User (role: guests)') ||
        error?.code === 401
      ) {
        // User already logged out; ignore silently
      } else {
        console.error('Logout error:', error);
      }
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    try {
      // Filter out fields that shouldn't be updated
      const { $id, createdAt, ...updateData } = data;
      const updatedUser = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        user.$id,
        {
          ...updateData,
          updatedAt: new Date().toISOString(),
        }
      );
      setUser(updatedUser as unknown as User);
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const generateReferralCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 