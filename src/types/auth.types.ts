import { User as FirebaseUser } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

/**
 * User profile data stored in Firestore users/{uid} collection
 * Contains core user authentication and profile information only
 * Schema reference: firestore-schema.md lines 24-37
 */
export interface UserProfile {
    // Core User Info (from Firebase Auth & users collection)
    uid: string;
    email: string;
    displayName: string;
    profilePictureURL?: string;
    dietaryPreferences: string[]; // Array of dietary preferences (e.g., ["vegetarian", "gluten-free"])
    bio?: string;
    phoneNumber?: string;
    authProvider: 'google' | 'email' | 'phone';
    emailVerified: boolean;

    // Metadata
    createdAt: Timestamp;
    updatedAt: Timestamp;
    lastLoginAt?: Timestamp;
}

/**
 * User preferences and onboarding data stored in Firestore userPreferences/{uid} collection
 * Schema reference: firestore-schema.md lines 299-325
 */
export interface UserPreferences {
    userId: string; // Firebase Auth UID (document ID)

    // Onboarding Data
    city: string;
    dateOfBirth: string; // ISO date string (YYYY-MM-DD)
    sex: 'Male' | 'Female' | 'Prefer not to say';
    termsAccepted: boolean;
    onboardingCompletedAt?: Timestamp;

    // Cuisine & Dietary Preferences
    cuisinePreferences: string[];
    dietaryRestrictions: string[];

    // Restaurant Preferences
    priceRangePreference?: number[]; // [min, max] (1-4)
    distancePreference?: number; // in miles/km
    favoriteRestaurants: string[];
    blockedRestaurants: string[];

    // Food Wheel Options
    wheelOptions: WheelOption[];

    // Metadata
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

/**
 * User statistics stored in Firestore userStats/{uid} collection
 * Schema reference: firestore-schema.md lines 447-499
 */
export interface UserStats {
    userId: string; // Firebase Auth UID (document ID)

    // Hexagon Stats (0-100 scale for visualization)
    healthLevel: number;
    exp: number;
    coinsSpent: number;
    satisfactory: number;
    balance: number;
    intensity: number;

    // Top Rankings
    topCuisine: {
        name: string;
        count: number;
        trend: 'up' | 'down' | 'stable';
        trendValue: number;
    };
    topRestaurant: {
        restaurantId: string;
        name: string;
        rating: number;
        visitCount: number;
        trend: 'up' | 'down' | 'stable';
    };

    // Eating Out Statistics
    eatingOutStats: {
        timesEaten: number;
        coinsSpent: number;
        avgPerVisit: number;
        trend: 'up' | 'down' | 'stable';
        trendValue: number;
    };

    // Nutrient Analysis
    nutrientAnalysis: {
        protein: { grams: number; percentage: number; };
        fat: { grams: number; percentage: number; };
        sugar: { grams: number; percentage: number; };
    };

    // Activity Counts
    totalRestaurantsExplored: number;
    totalReviewsWritten: number;
    totalMenuItemsPosted: number;
    totalLikesReceived: number;

    // Metadata
    lastCalculatedAt: Timestamp;
    calculationMethod: 'realtime' | 'aggregated';
    updatedAt: Timestamp;
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
    userPreferences: UserPreferences | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmailOTP: (email: string) => Promise<string>; // Returns confirmation result
    verifyOTP: (verificationId: string, code: string) => Promise<void>;
    signOut: () => Promise<void>;
    updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
    updateUserPreferences: (updates: Partial<UserPreferences>) => Promise<void>;
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
