import {
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    User,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    ConfirmationResult,
    PhoneAuthProvider,
    signInWithCredential,
} from 'firebase/auth';
import { auth } from './config';
import { AuthError } from '../types/auth.types';

/**
 * Google Sign-In Provider
 */
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account',
});

/**
 * Sign in with Google popup
 */
export const signInWithGoogle = async (): Promise<User> => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error: any) {
        throw handleAuthError(error);
    }
};

/**
 * Initialize reCAPTCHA verifier for email OTP
 * Note: Firebase doesn't have native email OTP, so we use a workaround
 * with a hidden reCAPTCHA for email-based authentication
 */
let recaptchaVerifier: RecaptchaVerifier | null = null;

export const initializeRecaptcha = (containerId: string): RecaptchaVerifier => {
    if (recaptchaVerifier) {
        recaptchaVerifier.clear();
    }

    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {
            // reCAPTCHA solved
        },
        'expired-callback': () => {
            // Reset reCAPTCHA
            if (recaptchaVerifier) {
                recaptchaVerifier.clear();
            }
        },
    });

    return recaptchaVerifier;
};

/**
 * Send OTP code to email
 * Note: This is a simplified implementation. In production, you should:
 * 1. Use a Cloud Function to send email with OTP
 * 2. Store the OTP securely in Firestore with expiration
 * 3. Verify the OTP on the backend
 * 
 * For now, we'll use phone auth as a placeholder for the OTP mechanism
 */
export const sendEmailOTP = async (email: string): Promise<string> => {
    try {
        // This is a placeholder implementation
        // In production, call a Cloud Function that:
        // 1. Generates a 6-digit OTP
        // 2. Sends it via email (SendGrid, etc.)
        // 3. Returns a verification ID

        // For development with emulator, we'll use a mock verification ID
        const verificationId = `email-otp-${email}-${Date.now()}`;

        // Store email in sessionStorage for verification
        sessionStorage.setItem('pendingEmail', email);
        sessionStorage.setItem('verificationId', verificationId);

        console.log('📧 Email OTP would be sent to:', email);
        console.log('🔐 Verification ID:', verificationId);

        return verificationId;
    } catch (error: any) {
        throw handleAuthError(error);
    }
};

/**
 * Verify OTP code and sign in
 * This is a placeholder - in production, verify via Cloud Function
 */
export const verifyEmailOTP = async (
    verificationId: string,
    code: string
): Promise<User> => {
    try {
        const pendingEmail = sessionStorage.getItem('pendingEmail');
        const storedVerificationId = sessionStorage.getItem('verificationId');

        if (!pendingEmail || storedVerificationId !== verificationId) {
            throw new Error('Invalid verification session');
        }

        // In production, this would call a Cloud Function to:
        // 1. Verify the OTP code
        // 2. Create a custom token
        // 3. Sign in with the custom token

        // For development, we'll create a mock user
        // You'll need to implement the actual Cloud Function
        console.log('✅ OTP verified for:', pendingEmail);
        console.log('🔐 Code:', code);

        // Clean up session storage
        sessionStorage.removeItem('pendingEmail');
        sessionStorage.removeItem('verificationId');

        // This will need to be replaced with actual Cloud Function call
        throw new Error('Email OTP verification requires Cloud Function implementation. Please use Google Sign-In for now.');
    } catch (error: any) {
        throw handleAuthError(error);
    }
};

/**
 * Sign out current user
 */
export const signOut = async (): Promise<void> => {
    try {
        await firebaseSignOut(auth);

        // Clear any stored verification data
        sessionStorage.removeItem('pendingEmail');
        sessionStorage.removeItem('verificationId');

        // Clear recaptcha
        if (recaptchaVerifier) {
            recaptchaVerifier.clear();
            recaptchaVerifier = null;
        }
    } catch (error: any) {
        throw handleAuthError(error);
    }
};

/**
 * Handle Firebase auth errors and convert to user-friendly messages
 */
const handleAuthError = (error: any): AuthError => {
    const errorCode = error.code || 'unknown';
    let userMessage = 'An unexpected error occurred. Please try again.';

    switch (errorCode) {
        case 'auth/popup-closed-by-user':
            userMessage = 'Sign-in cancelled. Please try again.';
            break;
        case 'auth/popup-blocked':
            userMessage = 'Pop-up blocked by browser. Please allow pop-ups and try again.';
            break;
        case 'auth/cancelled-popup-request':
            userMessage = 'Sign-in cancelled. Please try again.';
            break;
        case 'auth/network-request-failed':
            userMessage = 'Network error. Please check your connection and try again.';
            break;
        case 'auth/too-many-requests':
            userMessage = 'Too many attempts. Please try again later.';
            break;
        case 'auth/user-disabled':
            userMessage = 'This account has been disabled. Please contact support.';
            break;
        case 'auth/invalid-verification-code':
            userMessage = 'Invalid code. Please check and try again.';
            break;
        case 'auth/code-expired':
            userMessage = 'Code expired. Please request a new one.';
            break;
        case 'auth/invalid-phone-number':
            userMessage = 'Invalid email format. Please check and try again.';
            break;
        default:
            userMessage = error.message || userMessage;
    }

    return {
        code: errorCode,
        message: error.message,
        userMessage,
    };
};

/**
 * Get current user
 */
export const getCurrentUser = (): User | null => {
    return auth.currentUser;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
    return auth.currentUser !== null;
};
