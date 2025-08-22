'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { account, databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { User } from '@/types';
import { databaseService } from '@/lib/database';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, referralCode?: string) => Promise<{ success: boolean; user: User | null }>;
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
      
      if (currentUser && currentUser.$id) {
        try {
          // First try to find user by email (more reliable for existing users)
          console.log('Trying to find user by email:', currentUser.email);
          try {
            const userQuery = await databases.listDocuments(
              DATABASE_ID,
              COLLECTIONS.USERS,
              [
                // Query for user by email
                Query.equal('email', currentUser.email)
              ]
            );
            
            console.log('Email search results:', {
              total: userQuery.total,
              documents: userQuery.documents?.length || 0,
              found: userQuery.documents && userQuery.documents.length > 0
            });
            
            if (userQuery.documents && userQuery.documents.length > 0) {
              // User found by email
              const userDoc = userQuery.documents[0];
              console.log('User found by email:', userDoc);
              setUser(userDoc as unknown as User);
            } else {
              // User not found by email, try by ID
              console.log('User not found by email, trying by ID...');
              try {
                const userDoc = await databases.getDocument(
                  DATABASE_ID,
                  COLLECTIONS.USERS,
                  currentUser.$id
                );
                
                if (userDoc) {
                  console.log('User found by ID:', userDoc);
                  setUser(userDoc as unknown as User);
                } else {
                  // User document doesn't exist, create one
                  console.log('User document not found, creating new one...');
                  console.log('Creating document with ID:', currentUser.$id);
                  console.log('Using collection:', COLLECTIONS.USERS);
                  console.log('Using database:', DATABASE_ID);
                  
                  try {
                    const newUserDoc = await databases.createDocument(
                      DATABASE_ID,
                      COLLECTIONS.USERS,
                      currentUser.$id, // Use the same ID as auth user
                      {
                        name: currentUser.name || 'User',
                        email: currentUser.email || '',
                        referralCode: generateReferralCode(),
                        isActive: false,
                        rightPairs: 0,
                        leftPairs: 0,
                        totalEarnings: 0,
                        starLevel: 0,
                        registrationFee: 0,
                        paymentStatus: 'pending',
                        userId: currentUser.$id,
                        depth: 0,
                        leftActiveCount: 0,
                        rightActiveCount: 0,
                        pairsCompleted: 0,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                      }
                    );
                    
                    console.log('Document creation successful:', newUserDoc);
                    setUser(newUserDoc as unknown as User);
                    console.log('New user document created:', newUserDoc);
                  } catch (createError: any) {
                    console.error('Failed to create user document in first attempt:', createError);
                    console.log('Create error details:', {
                      message: createError?.message,
                      code: createError?.code,
                      type: createError?.constructor?.name,
                      fullError: createError
                    });
                    
                    // Fallback to basic user object
                    setUser({ 
                      $id: currentUser.$id,
                      userId: currentUser.$id,
                      email: currentUser.email || '',
                      name: currentUser.name || 'User',
                      referralCode: '',
                      isActive: false,
                      leftPairs: 0,
                      rightPairs: 0,
                      totalEarnings: 0,
                      starLevel: 0,
                      registrationFee: 0,
                      paymentStatus: 'pending',
                      leftActiveCount: 0,
                      rightActiveCount: 0,
                      pairsCompleted: 0,
                      depth: 0,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    } as User);
                  }
                }
              } catch (idError: any) {
                console.log('Error fetching by ID:', idError);
                // Continue with document creation
              }
            }
          } catch (emailSearchError: any) {
            console.error('Error searching by email:', emailSearchError);
            console.log('Email search error details:', {
              message: emailSearchError?.message,
              code: emailSearchError?.code,
              type: emailSearchError?.constructor?.name,
              fullError: emailSearchError
            });
            
            // If email search fails, try ID search as fallback
            console.log('Email search failed, trying ID search as fallback...');
            try {
              const userDoc = await databases.getDocument(
                DATABASE_ID,
                COLLECTIONS.USERS,
                currentUser.$id
              );
              
              if (userDoc) {
                console.log('User found by ID (fallback):', userDoc);
                setUser(userDoc as unknown as User);
              } else {
                // User document doesn't exist, create one
                console.log('User document not found, creating new one...');
                console.log('Creating document with ID:', currentUser.$id);
                console.log('Using collection:', COLLECTIONS.USERS);
                console.log('Using database:', DATABASE_ID);
                
                try {
                  const newUserDoc = await databases.createDocument(
                    DATABASE_ID,
                    COLLECTIONS.USERS,
                    currentUser.$id, // Use the same ID as auth user
                    {
                      name: currentUser.name || 'User',
                      email: currentUser.email || '',
                      referralCode: generateReferralCode(),
                      isActive: false,
                      rightPairs: 0,
                      leftPairs: 0,
                      totalEarnings: 0,
                      starLevel: 0,
                      registrationFee: 0,
                      paymentStatus: 'pending',
                      userId: currentUser.$id,
                      depth: 0,
                      leftActiveCount: 0,
                      rightActiveCount: 0,
                      pairsCompleted: 0,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    }
                  );
                  
                  console.log('Document creation successful:', newUserDoc);
                  setUser(newUserDoc as unknown as User);
                  console.log('New user document created:', newUserDoc);
                } catch (createError: any) {
                  console.error('Failed to create user document in first attempt:', createError);
                  console.log('Create error details:', {
                    message: createError?.message,
                    code: createError?.code,
                    type: createError?.constructor?.name,
                    fullError: createError
                  });
                  
                  // Fallback to basic user object
                  setUser({ 
                    $id: currentUser.$id,
                    userId: currentUser.$id,
                    email: currentUser.email || '',
                    name: currentUser.name || 'User',
                    referralCode: '',
                    isActive: false,
                    leftPairs: 0,
                    rightPairs: 0,
                    totalEarnings: 0,
                    starLevel: 0,
                    registrationFee: 0,
                    paymentStatus: 'pending',
                    leftActiveCount: 0,
                    rightActiveCount: 0,
                    pairsCompleted: 0,
                    depth: 0,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  } as User);
                }
              }
            } catch (idError: any) {
              console.log('Error fetching by ID (fallback):', idError);
              // Continue with document creation
            }
          }
        } catch (dbError: any) {
          console.log('Database error details:', {
            message: dbError?.message,
            code: dbError?.code,
            type: dbError?.constructor?.name,
            fullError: dbError
          });
          
          if (dbError?.message?.includes('Document with the requested ID could not be found')) {
            // User document doesn't exist, create one
            try {
              console.log('User document not found, creating new one...');
              console.log('Creating document with ID:', currentUser.$id);
              console.log('Using collection:', COLLECTIONS.USERS);
              console.log('Using database:', DATABASE_ID);
              
              const newUserDoc = await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.USERS,
                currentUser.$id, // Use the same ID as auth user
                {
                  name: currentUser.name || 'User',
                  email: currentUser.email || '',
                  referralCode: generateReferralCode(),
                  isActive: false,
                  rightPairs: 0,
                  leftPairs: 0,
                  totalEarnings: 0,
                  starLevel: 0,
                  registrationFee: 0,
                  paymentStatus: 'pending',
                  userId: currentUser.$id,
                  depth: 0,
                  leftActiveCount: 0,
                  rightActiveCount: 0,
                  pairsCompleted: 0,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              );
              
              console.log('Document creation successful after error:', newUserDoc);
              setUser(newUserDoc as unknown as User);
              console.log('New user document created after error:', newUserDoc);
            } catch (createError: any) {
              console.error('Failed to create user document after error:', createError);
              console.log('Create error details:', {
                message: createError?.message,
                code: createError?.code,
                type: createError?.constructor?.name,
                fullError: createError
              });
              
              // Fallback to basic user object
              setUser({ 
                $id: currentUser.$id,
                userId: currentUser.$id,
                email: currentUser.email || '',
                name: currentUser.name || 'User',
                referralCode: '',
                isActive: false,
                leftPairs: 0,
                rightPairs: 0,
                totalEarnings: 0,
                starLevel: 0,
                registrationFee: 0,
                paymentStatus: 'pending',
                leftActiveCount: 0,
                rightActiveCount: 0,
                pairsCompleted: 0,
                depth: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              } as User);
            }
          } else {
            console.log('Database fetch failed for other reason, using basic user object:', dbError);
            // If database fetch fails for other reasons, use basic user object
            setUser({ 
              $id: currentUser.$id,
              userId: currentUser.$id,
              email: currentUser.email || '',
              name: currentUser.name || 'User',
              referralCode: '',
              isActive: false,
              leftPairs: 0,
              rightPairs: 0,
              totalEarnings: 0,
              starLevel: 0,
              registrationFee: 0,
              paymentStatus: 'pending',
              leftActiveCount: 0,
              rightActiveCount: 0,
              pairsCompleted: 0,
              depth: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            } as User);
          }
        }
      } else {
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

      try {
        // Try to fetch the actual user profile from database
        console.log('Trying to find user by email after login:', currentUser.email);
        console.log('Current user ID:', currentUser.$id);
        
        try {
          const userQuery = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.USERS,
            [
              // Query for user by email
              Query.equal('email', currentUser.email)
            ]
          );
          
          console.log('Email search results:', {
            total: userQuery.total,
            documents: userQuery.documents?.length || 0,
            found: userQuery.documents && userQuery.documents.length > 0
          });
          
          if (userQuery.documents && userQuery.documents.length > 0) {
            // User found by email
            const userDoc = userQuery.documents[0];
            console.log('User found by email after login:', userDoc);
            setUser(userDoc as unknown as User);
          } else {
            // User not found by email, try by ID
            console.log('User not found by email after login, trying by ID...');
            try {
              const userDoc = await databases.getDocument(
                DATABASE_ID,
                COLLECTIONS.USERS,
                currentUser.$id
              );
              
              if (userDoc) {
                console.log('User found by ID after login:', userDoc);
                setUser(userDoc as unknown as User);
              } else {
                // User document doesn't exist, create one
                console.log('User document not found after login, creating new one...');
                console.log('Creating document with ID:', currentUser.$id);
                console.log('Using collection:', COLLECTIONS.USERS);
                console.log('Using database:', DATABASE_ID);
                
                try {
                  const newUserDoc = await databases.createDocument(
                    DATABASE_ID,
                    COLLECTIONS.USERS,
                    currentUser.$id, // Use the same ID as auth user
                    {
                      name: currentUser.name || 'User',
                      email: currentUser.email || '',
                      referralCode: generateReferralCode(),
                      isActive: false,
                      rightPairs: 0,
                      leftPairs: 0,
                      totalEarnings: 0,
                      starLevel: 0,
                      registrationFee: 0,
                      paymentStatus: 'pending',
                      userId: currentUser.$id,
                      depth: 0,
                      leftActiveCount: 0,
                      rightActiveCount: 0,
                      pairsCompleted: 0,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    }
                  );
                  
                  console.log('Document creation successful after login:', newUserDoc);
                  setUser(newUserDoc as unknown as User);
                  console.log('New user document created after login:', newUserDoc);
                } catch (createError: any) {
                  console.error('Failed to create user document after login:', createError);
                  console.log('Create error details:', {
                    message: createError?.message,
                    code: createError?.code,
                    type: createError?.constructor?.name,
                    fullError: createError
                  });
                  
                  // Fallback to basic user object
                  setUser({ 
                    $id: currentUser.$id,
                    userId: currentUser.$id,
                    email: currentUser.email || '',
                    name: currentUser.name || 'User',
                    referralCode: '',
                    isActive: false,
                    leftPairs: 0,
                    rightPairs: 0,
                    totalEarnings: 0,
                    starLevel: 0,
                    registrationFee: 0,
                    paymentStatus: 'pending',
                    leftActiveCount: 0,
                    rightActiveCount: 0,
                    pairsCompleted: 0,
                    depth: 0,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  } as User);
                }
              }
            } catch (idError: any) {
              console.log('Error fetching by ID after login:', idError);
              console.log('ID error details:', {
                message: idError?.message,
                code: idError?.code,
                type: idError?.constructor?.name,
                fullError: idError
              });
              // Continue with document creation
            }
          }
        } catch (emailSearchError: any) {
          console.error('Error searching by email after login:', emailSearchError);
          console.log('Email search error details:', {
            message: emailSearchError?.message,
            code: emailSearchError?.code,
            type: emailSearchError?.constructor?.name,
            fullError: emailSearchError
          });
          
          // If email search fails, try ID search as fallback
          console.log('Email search failed after login, trying ID search as fallback...');
          try {
            const userDoc = await databases.getDocument(
              DATABASE_ID,
              COLLECTIONS.USERS,
              currentUser.$id
            );
            
            if (userDoc) {
              console.log('User found by ID after login (fallback):', userDoc);
              setUser(userDoc as unknown as User);
            } else {
              // User document doesn't exist, create one
              console.log('User document not found after login, creating new one...');
              console.log('Creating document with ID:', currentUser.$id);
              console.log('Using collection:', COLLECTIONS.USERS);
              console.log('Using database:', DATABASE_ID);
              
              try {
                const newUserDoc = await databases.createDocument(
                  DATABASE_ID,
                  COLLECTIONS.USERS,
                  currentUser.$id, // Use the same ID as auth user
                  {
                    name: currentUser.name || 'User',
                    email: currentUser.email || '',
                    referralCode: generateReferralCode(),
                    isActive: false,
                    rightPairs: 0,
                    leftPairs: 0,
                    totalEarnings: 0,
                    starLevel: 0,
                    registrationFee: 0,
                    paymentStatus: 'pending',
                    userId: currentUser.$id,
                    depth: 0,
                    leftActiveCount: 0,
                    rightActiveCount: 0,
                    pairsCompleted: 0,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  }
                );
                
                console.log('Document creation successful after login (fallback):', newUserDoc);
                setUser(newUserDoc as unknown as User);
                console.log('New user document created after login (fallback):', newUserDoc);
              } catch (createError: any) {
                console.error('Failed to create user document after login (fallback):', createError);
                console.log('Create error details:', {
                  message: createError?.message,
                  code: createError?.code,
                  type: createError?.constructor?.name,
                  fullError: createError
                });
                
                // Fallback to basic user object
                setUser({ 
                  $id: currentUser.$id,
                  userId: currentUser.$id,
                  email: currentUser.email || '',
                  name: currentUser.name || 'User',
                  referralCode: '',
                  isActive: false,
                  leftPairs: 0,
                  rightPairs: 0,
                  totalEarnings: 0,
                  starLevel: 0,
                  registrationFee: 0,
                  paymentStatus: 'pending',
                  leftActiveCount: 0,
                  rightActiveCount: 0,
                  pairsCompleted: 0,
                  depth: 0,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                } as User);
              }
            }
          } catch (idError: any) {
            console.log('Error fetching by ID after login (fallback):', idError);
            // Continue with document creation
          }
        }
      } catch (dbError: any) {
        if (dbError?.message?.includes('Document with the requested ID could not be found')) {
          // User document doesn't exist, create one
          try {
            console.log('User document not found after login, creating new one...');
            console.log('Creating document with ID:', currentUser.$id);
            console.log('Using collection:', COLLECTIONS.USERS);
            console.log('Using database:', DATABASE_ID);
            
            const newUserDoc = await databases.createDocument(
              DATABASE_ID,
              COLLECTIONS.USERS,
              currentUser.$id, // Use the same ID as auth user
              {
                name: currentUser.name || 'User',
                email: currentUser.email || '',
                referralCode: generateReferralCode(),
                isActive: false,
                rightPairs: 0,
                leftPairs: 0,
                totalEarnings: 0,
                starLevel: 0,
                registrationFee: 0,
                paymentStatus: 'pending',
                userId: currentUser.$id,
                depth: 0,
                leftActiveCount: 0,
                rightActiveCount: 0,
                pairsCompleted: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            );
            
            console.log('Document creation successful after login error:', newUserDoc);
            setUser(newUserDoc as unknown as User);
            console.log('New user document created after login error:', newUserDoc);
          } catch (createError: any) {
            console.error('Failed to create user document after login:', createError);
            console.log('Create error details:', {
              message: createError?.message,
              code: createError?.code,
              type: createError?.constructor?.name,
              fullError: createError
            });
            
            // Fallback to basic user object
            setUser({ 
              $id: currentUser.$id,
              userId: currentUser.$id,
              email: currentUser.email || '',
              name: currentUser.name || 'User',
              referralCode: '',
              isActive: false,
              leftPairs: 0,
              rightPairs: 0,
              totalEarnings: 0,
              starLevel: 0,
              registrationFee: 0,
              paymentStatus: 'pending',
              leftActiveCount: 0,
              rightActiveCount: 0,
              pairsCompleted: 0,
              depth: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            } as User);
          }
        } else {
          console.log('Database fetch failed after login, using basic user object:', dbError);
          // If database fetch fails for other reasons, use basic user object
          setUser({ 
            $id: currentUser.$id,
            userId: currentUser.$id,
            email: currentUser.email || '',
            name: currentUser.name || 'User',
            referralCode: '',
            isActive: false,
            leftPairs: 0,
            rightPairs: 0,
            totalEarnings: 0,
            starLevel: 0,
            registrationFee: 0,
            paymentStatus: 'pending',
            leftActiveCount: 0,
            rightActiveCount: 0,
            pairsCompleted: 0,
            depth: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as User);
        }
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

      // Resolve sponsor by referral code if provided
      let resolvedSponsorId: string | undefined = undefined;
      if (referralCode && referralCode.trim().length > 0) {
        try {
          const sponsor = await databaseService.getUserByReferralCode(referralCode.trim());
          if (sponsor) {
            resolvedSponsorId = sponsor.$id;
            console.log('Resolved sponsor from referral code:', { referralCode, sponsorId: resolvedSponsorId });
          } else {
            console.log('No sponsor found for referral code. Proceeding without sponsor link.');
          }
        } catch (e) {
          console.log('Failed to resolve sponsor by referral code, proceeding without:', e);
        }
      }
      
      // Create user profile in database with minimal attributes
      const userData = {
        name,
        email,
        referralCode: generateReferralCode(),
        isActive: false,
        rightPairs: 0,
        leftPairs: 0,
        totalEarnings: 0,
        starLevel: 0,
        registrationFee: 0,
        paymentStatus: 'pending',
        userId: newAccount.$id,
        depth: 0,
        leftActiveCount: 0,
        rightActiveCount: 0,
        pairsCompleted: 0,
        sponsorId: resolvedSponsorId,
      };
      
      // Create the user document in the database
      try {
        console.log('Creating user document in database...');
        console.log('Using collection:', COLLECTIONS.USERS);
        console.log('Using database:', DATABASE_ID);
        console.log('User data:', userData);
        
        const newUserDoc = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.USERS,
          newAccount.$id, // Use the same ID as the Appwrite account
          userData
        );
        
        console.log('User document created successfully:', newUserDoc);

        // If referred, create a referral record marking registration
        if (resolvedSponsorId) {
          try {
            await databaseService.createReferral({
              referralCode: referralCode!.trim(),
              sponsorId: resolvedSponsorId,
              prospectEmail: email,
              status: 'registered',
              registeredUserId: newAccount.$id,
              createdAt: new Date().toISOString(),
            });
            console.log('Referral record created for registration');
          } catch (refErr) {
            console.error('Failed to create referral record:', refErr);
          }
        }
        
        console.log('Registration successful - user document created in database');
        
        // Now automatically log the user in
        try {
          console.log('Auto-logging in user after registration...');
          
          // Create a session for the newly registered user
          await account.createEmailPasswordSession(email, password);
          console.log('Session created for new user');
          
          // Set the user state with the created document
          setUser(newUserDoc as unknown as User);
          console.log('User state set after auto-login:', newUserDoc);
          
          // Return success - the calling component can handle redirect to payment
          return { success: true, user: newUserDoc as unknown as User };
          
        } catch (loginError: any) {
          console.error('Auto-login failed after registration:', loginError);
          console.log('Login error details:', {
            message: loginError?.message,
            code: loginError?.code,
            type: loginError?.constructor?.name,
            fullError: loginError
          });
          
          console.log('Auto-login failed but registration successful - user can login manually');
          return { success: true, user: null };
        }
        
      } catch (dbError: any) {
        console.error('Failed to create user document during registration:', dbError);
        console.log('Database error details:', {
          message: dbError?.message,
          code: dbError?.code,
          type: dbError?.constructor?.name,
          fullError: dbError
        });
        
        console.log('User account created but database document failed - will be created on first login');
        
        try {
          console.log('Attempting auto-login despite database failure...');
          await account.createEmailPasswordSession(email, password);
          console.log('Session created for new user (despite DB failure)');
          
          // Set basic user state
          const basicUser = {
            $id: newAccount.$id,
            userId: newAccount.$id,
            email,
            name,
            referralCode: userData.referralCode,
            isActive: false,
            leftPairs: 0,
            rightPairs: 0,
            totalEarnings: 0,
            starLevel: 0,
            registrationFee: 0,
            paymentStatus: 'pending',
            leftActiveCount: 0,
            rightActiveCount: 0,
            pairsCompleted: 0,
            depth: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as User;
          
          setUser(basicUser);
          console.log('Basic user state set after auto-login:', basicUser);
          
          return { success: true, user: basicUser };
          
        } catch (loginError: any) {
          console.error('Auto-login failed after registration (DB failure):', loginError);
          return { success: true, user: null };
        }
      }

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
      // Just update local state - no database complexity for now
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
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