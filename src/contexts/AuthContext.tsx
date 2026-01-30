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
import { AuthContextType, UserProfile } from '../types/auth.types';
import {
    fetchUserProfile,
    updateUserProfile as updateProfile,
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            if (user) {
                // Fetch user profile from Firestore
                await fetchUserData(user.uid);

                // Update lastLoginAt
                await updateLastLogin(user.uid);
            } else {
                setUserProfile(null);
                clearCachedUserProfile();
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    /**
     * Fetch user profile from Firestore
     */
    const fetchUserData = async (uid: string) => {
        try {
            // Fetch user profile using userDataService
            const profile = await fetchUserProfile(uid);

            if (profile) {
                setUserProfile(profile);
            } else {
                // User data doesn't exist - call Cloud Function to create it
                console.log('User data not found, initializing...');
                await initializeUserDataViaFunction();

                // Fetch again after initialization
                const newProfile = await fetchUserProfile(uid);
                if (newProfile) {
                    setUserProfile(newProfile);
                } else {
                    throw new Error("Failed to verify user data creation");
                }
            }

            // Try to migrate data from userPreferences collection if it exists
            try {
                await migrateUserPreferences(uid);
                // Refresh profile after migration
                const updatedProfile = await fetchUserProfile(uid);
                if (updatedProfile) {
                    setUserProfile(updatedProfile);
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
     * Update user profile
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
     * Sign out current user
     */
    const signOut = async () => {
        try {
            setError(null);
            await authSignOut();
            setCurrentUser(null);
            setUserProfile(null);
            clearCachedUserProfile();
        } catch (err: any) {
            setError(err.userMessage || err.message);
            throw err;
        }
    };

    const value: AuthContextType = {
        currentUser,
        userProfile,
        loading,
        signInWithGoogle,
        signInWithEmailOTP,
        verifyOTP,
        signOut,
        updateUserProfile: handleUpdateUserProfile,
        error,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
