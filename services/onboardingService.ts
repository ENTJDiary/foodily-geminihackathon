import { saveOnboardingToPreferences, hasCompletedOnboarding as checkOnboardingStatus } from './preferencesService';
import { OnboardingFormData } from '../src/types/onboarding.types';

/**
 * Save onboarding data to Firestore (now saves to userPreferences collection)
 */
export const saveOnboardingData = async (
    userId: string,
    formData: OnboardingFormData
): Promise<void> => {
    try {
        await saveOnboardingToPreferences(userId, {
            city: formData.city,
            dateOfBirth: formData.dateOfBirth,
            sex: formData.sex as 'Male' | 'Female' | 'Prefer not to say',
            cuisinePreferences: formData.cuisinePreferences,
            dietaryRestrictions: formData.dietaryRestrictions,
            termsAccepted: formData.termsAccepted,
        });
        console.log('✅ Onboarding data saved successfully');
    } catch (error) {
        console.error('❌ Error saving onboarding data:', error);
        throw new Error('Failed to save onboarding data. Please try again.');
    }
};

/**
 * Check if user has completed onboarding
 */
export const hasCompletedOnboarding = async (userId: string): Promise<boolean> => {
    try {
        return await checkOnboardingStatus(userId);
    } catch (error) {
        console.error('❌ Error checking onboarding status:', error);
        return false;
    }
};
