import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../src/firebase/config';
import { OnboardingData, OnboardingFormData } from '../src/types/onboarding.types';

const ONBOARDING_COLLECTION = 'onboardingData';

/**
 * Save onboarding data to Firestore
 */
export const saveOnboardingData = async (
    userId: string,
    formData: OnboardingFormData
): Promise<void> => {
    try {
        const onboardingRef = doc(db, ONBOARDING_COLLECTION, userId);

        const onboardingData: Omit<OnboardingData, 'completedAt'> & { completedAt: any } = {
            userId,
            city: formData.city,
            dateOfBirth: formData.dateOfBirth,
            sex: formData.sex as 'Male' | 'Female' | 'Prefer not to say',
            cuisinePreferences: formData.cuisinePreferences,
            dietaryRestrictions: formData.dietaryRestrictions,
            termsAccepted: formData.termsAccepted,
            completedAt: serverTimestamp(),
        };

        await setDoc(onboardingRef, onboardingData);
        console.log('✅ Onboarding data saved successfully');
    } catch (error) {
        console.error('❌ Error saving onboarding data:', error);
        throw new Error('Failed to save onboarding data. Please try again.');
    }
};

/**
 * Get onboarding data from Firestore
 */
export const getOnboardingData = async (userId: string): Promise<OnboardingData | null> => {
    try {
        const onboardingRef = doc(db, ONBOARDING_COLLECTION, userId);
        const onboardingDoc = await getDoc(onboardingRef);

        if (onboardingDoc.exists()) {
            return onboardingDoc.data() as OnboardingData;
        }
        return null;
    } catch (error) {
        console.error('❌ Error fetching onboarding data:', error);
        return null;
    }
};

/**
 * Check if user has completed onboarding
 */
export const hasCompletedOnboarding = async (userId: string): Promise<boolean> => {
    try {
        const onboardingData = await getOnboardingData(userId);
        return onboardingData !== null && onboardingData.termsAccepted === true;
    } catch (error) {
        console.error('❌ Error checking onboarding status:', error);
        return false;
    }
};
