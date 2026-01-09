import { User as FirebaseUser } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

/**
 * User profile data stored in Firestore users/{uid} collection
 */
export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    profilePictureURL?: string;
    bio?: string;
    dietaryPreferences: string[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
    lastLoginAt?: Timestamp;
}

/**
 * User preferences stored in Firestore userPreferences/{uid} collection
 */
export interface UserPreferences {
    userId: string;
    cuisinePreferences: string[];
    dietaryRestrictions: string[];
    priceRangePreference?: number[];
    distancePreference?: number;
    favoriteRestaurants: string[];
    blockedRestaurants: string[];
    updatedAt: Timestamp;
}

/**
 * Authentication context value type
 */
export interface AuthContextType {
    currentUser: FirebaseUser | null;
    userProfile: UserProfile | null;
    userPreferences: UserPreferences | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmailOTP: (email: string) => Promise<string>; // Returns confirmation result
    verifyOTP: (verificationId: string, code: string) => Promise<void>;
    signOut: () => Promise<void>;
    error: string | null;
}

/**
 * Custom auth error with user-friendly messages
 */
export interface AuthError {
    code: string;
    message: string;
    userMessage: string;
}

/**
 * OTP verification state
 */
export interface OTPState {
    verificationId: string | null;
    email: string | null;
    codeSent: boolean;
    resendAvailable: boolean;
}
