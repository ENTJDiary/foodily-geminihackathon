import { Timestamp } from 'firebase/firestore';

/**
 * Sex/Gender options for user profile
 */
export type Sex = 'Male' | 'Female' | 'Prefer not to say';

/**
 * Onboarding data stored in Firestore onboardingData/{uid} collection
 */
export interface OnboardingData {
    userId: string;
    city: string;
    dateOfBirth: string; // ISO date string (YYYY-MM-DD)
    sex: Sex;
    cuisinePreferences: string[];
    dietaryRestrictions: string[];
    termsAccepted: boolean;
    completedAt: Timestamp;
}

/**
 * Form data for onboarding (before saving to Firestore)
 */
export interface OnboardingFormData {
    city: string;
    dateOfBirth: string;
    sex: Sex | '';
    cuisinePreferences: string[];
    dietaryRestrictions: string[];
    termsAccepted: boolean;
}

/**
 * Props for individual onboarding page components
 */
export interface OnboardingPageProps {
    formData: OnboardingFormData;
    updateFormData: (updates: Partial<OnboardingFormData>) => void;
    onNext: () => void;
    onBack?: () => void;
}
