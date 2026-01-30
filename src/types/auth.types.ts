import { User as FirebaseUser } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

/**
 * User profile data stored in Firestore users/{uid} collection
 * Merged from users, userPreferences, and onboardingData collections
 */
export interface UserProfile {
    // Core User Info (from Firebase Auth & users collection)
    uid: string;
    email: string;
    displayName: string;
    profilePictureURL?: string;
    bio?: string;
    phoneNumber?: string;
    authProvider: 'google' | 'email' | 'phone';
    emailVerified: boolean;

    // Onboarding Data
    city?: string;
    dateOfBirth?: string; // ISO date string (YYYY-MM-DD)
    sex?: 'Male' | 'Female' | 'Prefer not to say';
    termsAccepted?: boolean;
    onboardingCompletedAt?: Timestamp;

    // Cuisine & Dietary Preferences
    cuisinePreferences: string[];
    dietaryRestrictions: string[];

    // Restaurant Preferences
    priceRangePreference?: number[]; // [min, max] (1-4)
    distancePreference?: number; // in miles/km
    favoriteRestaurants: string[]; // Array of restaurant IDs
    blockedRestaurants: string[]; // Restaurants to avoid

    // Food Wheel Options
    wheelOptions: WheelOption[];

    // Metadata
    createdAt: Timestamp;
    updatedAt: Timestamp;
    lastLoginAt?: Timestamp;
}

/**
 * Wheel option for Food Gacha feature
 */
export interface WheelOption {
    id: string;
    name: string;
    color: string;
    timestamp: number;
}

/**
 * Authentication context value type
 */
export interface AuthContextType {
    currentUser: FirebaseUser | null;
    userProfile: UserProfile | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmailOTP: (email: string) => Promise<string>; // Returns confirmation result
    verifyOTP: (verificationId: string, code: string) => Promise<void>;
    signOut: () => Promise<void>;
    updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
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
