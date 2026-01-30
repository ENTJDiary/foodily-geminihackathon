import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../src/firebase/config';
import { UserProfile, UserPreferences } from '../src/types/auth.types';

const PROFILE_CACHE_KEY = 'foodily_user_profile_cache';

/**
 * Fetch user profile from Firestore users collection
 * Only fetches core user data - NOT preferences or onboarding data
 */
export const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
        const userDocRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const profile = userDoc.data() as UserProfile;
            // Cache the profile in localStorage
            cacheUserProfile(profile);
            return profile;
        }

        return null;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
};

/**
 * Fetch user preferences from Firestore userPreferences collection
 * Fetches onboarding data and user preferences
 */
export const fetchUserPreferences = async (uid: string): Promise<UserPreferences | null> => {
    try {
        const prefsDocRef = doc(db, 'userPreferences', uid);
        const prefsDoc = await getDoc(prefsDocRef);

        if (prefsDoc.exists()) {
            return prefsDoc.data() as UserPreferences;
        }

        return null;
    } catch (error) {
        console.error('Error fetching user preferences:', error);
        throw error;
    }
};

/**
 * Update user profile in Firestore users collection
 * Only updates core user data fields
 */
export const updateUserProfile = async (
    uid: string,
    updates: Partial<UserProfile>
): Promise<void> => {
    try {
        const userDocRef = doc(db, 'users', uid);

        // Add updatedAt timestamp
        const updateData = {
            ...updates,
            updatedAt: serverTimestamp(),
        };

        await updateDoc(userDocRef, updateData);

        // Update cache
        const cachedProfile = getCachedUserProfile();
        if (cachedProfile) {
            const updatedProfile = { ...cachedProfile, ...updates };
            cacheUserProfile(updatedProfile);
        }
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
};

/**
 * Update user preferences in Firestore userPreferences collection
 * Updates onboarding data and user preferences
 */
export const updateUserPreferences = async (
    uid: string,
    updates: Partial<UserPreferences>
): Promise<void> => {
    try {
        const prefsDocRef = doc(db, 'userPreferences', uid);

        // Add updatedAt timestamp
        const updateData = {
            ...updates,
            updatedAt: serverTimestamp(),
        };

        await updateDoc(prefsDocRef, updateData);
    } catch (error) {
        console.error('Error updating user preferences:', error);
        throw error;
    }
};

/**
 * Upload profile picture to Firebase Storage
 * @returns URL of the uploaded image
 */
export const uploadProfilePicture = async (uid: string, file: File): Promise<string> => {
    try {
        // Create a reference to the storage location
        const storageRef = ref(storage, `users/${uid}/profile/profile-picture.jpg`);

        // Upload the file
        await uploadBytes(storageRef, file);

        // Get the download URL
        const downloadURL = await getDownloadURL(storageRef);

        // Update the user profile with the new picture URL
        await updateUserProfile(uid, { profilePictureURL: downloadURL });

        return downloadURL;
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        throw error;
    }
};

/**
 * Cache user profile in localStorage
 * Only caches core user profile data from users collection
 */
export const cacheUserProfile = (profile: UserProfile): void => {
    try {
        // Convert Timestamps to ISO strings for localStorage
        const cacheData = {
            ...profile,
            createdAt: profile.createdAt?.toDate?.()?.toISOString() || profile.createdAt,
            updatedAt: profile.updatedAt?.toDate?.()?.toISOString() || profile.updatedAt,
            lastLoginAt: profile.lastLoginAt?.toDate?.()?.toISOString() || profile.lastLoginAt,
        };

        localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
        console.error('Error caching user profile:', error);
    }
};

/**
 * Get cached user profile from localStorage
 */
export const getCachedUserProfile = (): UserProfile | null => {
    try {
        const cached = localStorage.getItem(PROFILE_CACHE_KEY);
        if (!cached) return null;

        return JSON.parse(cached) as UserProfile;
    } catch (error) {
        console.error('Error getting cached user profile:', error);
        return null;
    }
};

/**
 * Clear cached user profile from localStorage
 */
export const clearCachedUserProfile = (): void => {
    try {
        localStorage.removeItem(PROFILE_CACHE_KEY);
    } catch (error) {
        console.error('Error clearing cached user profile:', error);
    }
};

/**
 * Format date of birth from ISO string to display format
 * @param isoDate - ISO date string (YYYY-MM-DD)
 * @returns Formatted date string (e.g., "1 January 1980")
 */
export const formatDateOfBirth = (isoDate: string | undefined): string => {
    if (!isoDate) return '';

    try {
        const date = new Date(isoDate);
        const day = date.getDate();
        const month = date.toLocaleString('en-US', { month: 'long' });
        const year = date.getFullYear();

        return `${day} ${month} ${year}`;
    } catch (error) {
        console.error('Error formatting date of birth:', error);
        return isoDate;
    }
};

/**
 * Calculate age from date of birth string
 * @param dob - ISO date string (YYYY-MM-DD)
 * @returns Age in years as a number
 */
export const calculateAge = (dob: string | undefined): number | null => {
    if (!dob) return null;

    try {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    } catch (error) {
        console.error('Error calculating age:', error);
        return null;
    }
};

/**
 * Migrate data from userPreferences collection to users collection
 * DEPRECATED: This migration is no longer needed as we now keep data separate
 * Keeping function for backward compatibility but disabled
 */
export const migrateUserPreferences = async (uid: string): Promise<void> => {
    // Migration disabled - we now keep users and userPreferences separate
    console.log('⚠️ migrateUserPreferences is deprecated and disabled');
    return;

    /* OLD MIGRATION CODE - DISABLED
    try {
        // Check if userPreferences document exists
        const prefsDocRef = doc(db, 'userPreferences', uid);
        const prefsDoc = await getDoc(prefsDocRef);

        if (!prefsDoc.exists()) {
            console.log('No userPreferences to migrate');
            return;
        }

        const prefsData = prefsDoc.data();
        const userDocRef = doc(db, 'users', uid);

        // Merge preferences into user document
        await setDoc(userDocRef, {
            city: prefsData.city,
            dateOfBirth: prefsData.dateOfBirth,
            sex: prefsData.sex,
            termsAccepted: prefsData.termsAccepted,
            onboardingCompletedAt: prefsData.onboardingCompletedAt,
            cuisinePreferences: prefsData.cuisinePreferences || [],
            dietaryRestrictions: prefsData.dietaryRestrictions || [],
            priceRangePreference: prefsData.priceRangePreference,
            distancePreference: prefsData.distancePreference,
            favoriteRestaurants: prefsData.favoriteRestaurants || [],
            blockedRestaurants: prefsData.blockedRestaurants || [],
            wheelOptions: prefsData.wheelOptions || [],
            updatedAt: serverTimestamp(),
        }, { merge: true });

        console.log('✅ Successfully migrated userPreferences to users collection');
    } catch (error) {
        console.error('Error migrating user preferences:', error);
        throw error;
    }
    */
};
