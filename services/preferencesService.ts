import { doc, getDoc, setDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../src/firebase/config';
import { UserPreferences, WheelOption } from '../src/types/auth.types';

const PREFERENCES_COLLECTION = 'userPreferences';

/**
 * Get user preferences from Firestore
 */
export const getUserPreferences = async (userId: string): Promise<UserPreferences | null> => {
    try {
        const prefsRef = doc(db, PREFERENCES_COLLECTION, userId);
        const prefsDoc = await getDoc(prefsRef);

        if (prefsDoc.exists()) {
            return prefsDoc.data() as UserPreferences;
        }
        return null;
    } catch (error) {
        console.error('❌ Error fetching user preferences:', error);
        throw new Error('Failed to fetch user preferences');
    }
};

/**
 * Create initial user preferences document
 */
export const createUserPreferences = async (
    userId: string,
    initialData: Partial<UserPreferences>
): Promise<void> => {
    try {
        const prefsRef = doc(db, PREFERENCES_COLLECTION, userId);

        const defaultPreferences: Partial<UserPreferences> = {
            userId,
            cuisinePreferences: [],
            dietaryRestrictions: [],
            favoriteRestaurants: [],
            blockedRestaurants: [],
            wheelOptions: [],
            createdAt: serverTimestamp() as Timestamp,
            updatedAt: serverTimestamp() as Timestamp,
            ...initialData,
        };

        await setDoc(prefsRef, defaultPreferences);
        console.log('✅ User preferences created successfully');
    } catch (error) {
        console.error('❌ Error creating user preferences:', error);
        throw new Error('Failed to create user preferences');
    }
};

/**
 * Update user preferences
 */
export const updateUserPreferences = async (
    userId: string,
    updates: Partial<UserPreferences>
): Promise<void> => {
    try {
        const prefsRef = doc(db, PREFERENCES_COLLECTION, userId);

        await updateDoc(prefsRef, {
            ...updates,
            updatedAt: serverTimestamp(),
        });

        console.log('✅ User preferences updated successfully');
    } catch (error) {
        console.error('❌ Error updating user preferences:', error);
        throw new Error('Failed to update user preferences');
    }
};

/**
 * Save onboarding data to user preferences
 */
export const saveOnboardingToPreferences = async (
    userId: string,
    onboardingData: {
        city: string;
        dateOfBirth: string;
        sex: 'Male' | 'Female' | 'Prefer not to say';
        cuisinePreferences: string[];
        dietaryRestrictions: string[];
        termsAccepted: boolean;
    }
): Promise<void> => {
    try {
        const prefsRef = doc(db, PREFERENCES_COLLECTION, userId);
        const existingPrefs = await getDoc(prefsRef);

        if (existingPrefs.exists()) {
            // Update existing preferences with onboarding data
            await updateDoc(prefsRef, {
                city: onboardingData.city,
                dateOfBirth: onboardingData.dateOfBirth,
                sex: onboardingData.sex,
                cuisinePreferences: onboardingData.cuisinePreferences,
                dietaryRestrictions: onboardingData.dietaryRestrictions,
                termsAccepted: onboardingData.termsAccepted,
                onboardingCompletedAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        } else {
            // Create new preferences with onboarding data
            await createUserPreferences(userId, {
                city: onboardingData.city,
                dateOfBirth: onboardingData.dateOfBirth,
                sex: onboardingData.sex,
                cuisinePreferences: onboardingData.cuisinePreferences,
                dietaryRestrictions: onboardingData.dietaryRestrictions,
                termsAccepted: onboardingData.termsAccepted,
                onboardingCompletedAt: serverTimestamp() as Timestamp,
            });
        }

        console.log('✅ Onboarding data saved to preferences successfully');
    } catch (error) {
        console.error('❌ Error saving onboarding data:', error);
        throw new Error('Failed to save onboarding data');
    }
};

/**
 * Check if user has completed onboarding
 */
export const hasCompletedOnboarding = async (userId: string): Promise<boolean> => {
    try {
        const preferences = await getUserPreferences(userId);
        return preferences !== null &&
            preferences.termsAccepted === true &&
            preferences.onboardingCompletedAt !== undefined;
    } catch (error) {
        console.error('❌ Error checking onboarding status:', error);
        return false;
    }
};

/**
 * Add wheel option to user preferences
 */
export const addWheelOption = async (
    userId: string,
    option: Omit<WheelOption, 'id' | 'timestamp'>
): Promise<void> => {
    try {
        const preferences = await getUserPreferences(userId);
        if (!preferences) {
            throw new Error('User preferences not found');
        }

        const newOption: WheelOption = {
            ...option,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
        };

        const updatedOptions = [...preferences.wheelOptions, newOption];
        await updateUserPreferences(userId, { wheelOptions: updatedOptions });

        console.log('✅ Wheel option added successfully');
    } catch (error) {
        console.error('❌ Error adding wheel option:', error);
        throw new Error('Failed to add wheel option');
    }
};

/**
 * Remove wheel option from user preferences
 */
export const removeWheelOption = async (
    userId: string,
    optionId: string
): Promise<void> => {
    try {
        const preferences = await getUserPreferences(userId);
        if (!preferences) {
            throw new Error('User preferences not found');
        }

        const updatedOptions = preferences.wheelOptions.filter(opt => opt.id !== optionId);
        await updateUserPreferences(userId, { wheelOptions: updatedOptions });

        console.log('✅ Wheel option removed successfully');
    } catch (error) {
        console.error('❌ Error removing wheel option:', error);
        throw new Error('Failed to remove wheel option');
    }
};

/**
 * Get wheel options for user
 */
export const getWheelOptions = async (userId: string): Promise<WheelOption[]> => {
    try {
        const preferences = await getUserPreferences(userId);
        return preferences?.wheelOptions || [];
    } catch (error) {
        console.error('❌ Error fetching wheel options:', error);
        return [];
    }
};
