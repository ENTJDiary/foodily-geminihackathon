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
                await fetchUserData(user.uid);

                // Update lastLoginAt
                await updateLastLogin(user.uid);
            } else {
                setUserProfile(null);
                setUserPreferences(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    /**
     * Fetch user profile and preferences from Firestore
     */
    const fetchUserData = async (uid: string) => {
        try {
            // Fetch user profile
            const userDocRef = doc(db, 'users', uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                setUserProfile(userDoc.data() as UserProfile);
            } else {
                // User data doesn't exist - call Cloud Function to create it
                console.log('User data not found, initializing...');
                await initializeUserDataViaFunction();

                // Fetch again after initialization
                const newUserDoc = await getDoc(userDocRef);
                if (newUserDoc.exists()) {
                    setUserProfile(newUserDoc.data() as UserProfile);
                } else {
                    throw new Error("Failed to verify user data creation");
                }
            }

            // Fetch user preferences
            const prefsDocRef = doc(db, 'userPreferences', uid);
            const prefsDoc = await getDoc(prefsDocRef);

            if (prefsDoc.exists()) {
                setUserPreferences(prefsDoc.data() as UserPreferences);
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
     * Sign out current user
     */
    const signOut = async () => {
        try {
            setError(null);
            await authSignOut();
            setCurrentUser(null);
            setUserProfile(null);
            setUserPreferences(null);
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
        error,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
