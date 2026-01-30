import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import {
    signInWithGoogle as googleSignIn,
    sendEmailOTP as sendOTP,
    verifyEmailOTP as verifyOTP,
    signOut as authSignOut
} from '../firebase/authService';
import { AuthContextType, UserProfile, UserPreferences } from '../types/auth.types';
import {
    fetchUserProfile,
    fetchUserPreferences,
    updateUserProfile as updateProfile,
    updateUserPreferences as updatePrefs,
    migrateUserPreferences,
    cacheUserProfile,
    clearCachedUserProfile
} from '../../services/userDataService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            if (user) {
                // Fetch user profile and preferences from Firestore
                const wasJustInitialized = await fetchUserData(user.uid);

                // Only update lastLoginAt if user was NOT just initialized
                // (Cloud Function already sets it for new users)
                if (!wasJustInitialized) {
                    await updateLastLogin(user.uid);
                }
            } else {
                setUserProfile(null);
                setUserPreferences(null);
                clearCachedUserProfile();
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    /**
     * Fetch user data from Firestore (profile and preferences)
     * @returns true if user was just initialized, false otherwise
     */
    const fetchUserData = async (uid: string): Promise<boolean> => {
        let wasJustInitialized = false;

        try {
            // Fetch user profile from users collection
            const profile = await fetchUserProfile(uid);

            if (profile) {
                setUserProfile(profile);
            } else {
                // User data doesn't exist - call Cloud Function to create it
                console.log('User data not found, initializing...');
                await initializeUserDataViaFunction();
                wasJustInitialized = true;

                // Wait a bit for Cloud Function to complete
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Fetch again after initialization
                const newProfile = await fetchUserProfile(uid);
                if (newProfile) {
                    setUserProfile(newProfile);
                } else {
                    throw new Error("Failed to verify user data creation");
                }
            }

            // Fetch user preferences from userPreferences collection
            const preferences = await fetchUserPreferences(uid);
            if (preferences) {
                setUserPreferences(preferences);
            }

            // Try to migrate data from old userPreferences collection if it exists
            // This is for backward compatibility - can be removed later
            try {
                await migrateUserPreferences(uid);
                // Refresh preferences after migration
                const updatedPreferences = await fetchUserPreferences(uid);
                if (updatedPreferences) {
                    setUserPreferences(updatedPreferences);
                }
            } catch (migrationError) {
                console.warn('⚠️ User preferences migration skipped or failed:', migrationError);
                // Don't block user login if migration fails
            }

            // Run data migration from localStorage (if not already done)
            try {
                const { runMigration } = await import('../../services/migrationService');
                await runMigration(uid);
            } catch (migrationError) {
                console.warn('⚠️ Data migration failed, but continuing:', migrationError);
                // Don't block user login if migration fails
            }
        } catch (err: any) {
            console.error('Error fetching user data:', err);
            setError('Failed to load user profile. Please try again.');
        }

        return wasJustInitialized;
    };

    /**
     * Initialize user data via Cloud Function
     */
    const initializeUserDataViaFunction = async () => {
        try {
            const { functions } = await import('../firebase/config');
            const { httpsCallable } = await import('firebase/functions');

            const initializeUserData = httpsCallable(functions, 'initializeUserData');
            const result = await initializeUserData();

            console.log('User data initialized:', result.data);
            return result.data;
        } catch (err: any) {
            console.error('Error initializing user data:', err);
            throw err; // Propagate error so fetchUserData knows it failed
        }
    };

    /**
     * Update user's last login timestamp
     */
    const updateLastLogin = async (uid: string) => {
        try {
            const userDocRef = doc(db, 'users', uid);
            await setDoc(userDocRef, {
                lastLoginAt: serverTimestamp(),
            }, { merge: true });
        } catch (err: any) {
            console.error('Error updating last login:', err);
            // Don't throw error - this is not critical
        }
    };

    /**
     * Sign in with Google
     */
    const signInWithGoogle = async () => {
        try {
            setError(null);
            setLoading(true);
            await googleSignIn();
            // User state will be updated by onAuthStateChanged listener
        } catch (err: any) {
            setError(err.userMessage || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Send OTP code to email
     */
    const signInWithEmailOTP = async (email: string): Promise<string> => {
        try {
            setError(null);
            const verificationId = await sendOTP(email);
            return verificationId;
        } catch (err: any) {
            setError(err.userMessage || err.message);
            throw err;
        }
    };

    /**
     * Verify OTP code and complete sign in
     */
    const verifyOTP = async (verificationId: string, code: string) => {
        try {
            setError(null);
            setLoading(true);
            await verifyOTP(verificationId, code);
            // User state will be updated by onAuthStateChanged listener
        } catch (err: any) {
            setError(err.userMessage || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Update user profile (core user data)
     */
    const handleUpdateUserProfile = async (updates: Partial<UserProfile>) => {
        if (!currentUser) {
            throw new Error('No user logged in');
        }

        try {
            setError(null);
            await updateProfile(currentUser.uid, updates);

            // Update local state
            if (userProfile) {
                const updatedProfile = { ...userProfile, ...updates };
                setUserProfile(updatedProfile);
                cacheUserProfile(updatedProfile);
            }
        } catch (err: any) {
            setError(err.userMessage || err.message);
            throw err;
        }
    };

    /**
     * Update user preferences (onboarding data and preferences)
     */
    const handleUpdateUserPreferences = async (updates: Partial<UserPreferences>) => {
        if (!currentUser) {
            throw new Error('No user logged in');
        }

        try {
            setError(null);
            await updatePrefs(currentUser.uid, updates);

            // Update local state
            if (userPreferences) {
                const updatedPreferences = { ...userPreferences, ...updates };
                setUserPreferences(updatedPreferences);
            }
        } catch (err: any) {
            setError(err.userMessage || err.message);
            throw err;
        }
    };

    /**
     * Sign out current user
     */
    const signOut = async () => {
        try {
            setError(null);
            await authSignOut();
            setCurrentUser(null);
            setUserProfile(null);
            setUserPreferences(null);
            clearCachedUserProfile();
        } catch (err: any) {
            setError(err.userMessage || err.message);
            throw err;
        }
    };

    const value: AuthContextType = {
        currentUser,
        userProfile,
        userPreferences,
        loading,
        signInWithGoogle,
        signInWithEmailOTP,
        verifyOTP,
        signOut,
        updateUserProfile: handleUpdateUserProfile,
        updateUserPreferences: handleUpdateUserPreferences,
        error,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
