// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// TODO: Add your Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// Connect to emulators if in development mode
// IMPORTANT: This must happen BEFORE any auth operations
const useEmulators = import.meta.env.VITE_USE_EMULATORS === 'true';

if (useEmulators) {
    console.log('🔧 Connecting to Firebase Emulators...');

    try {
        // Connect to Auth Emulator
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        console.log('✅ Auth Emulator connected (localhost:9099)');

        // Connect to Firestore Emulator
        connectFirestoreEmulator(db, 'localhost', 8080);
        console.log('✅ Firestore Emulator connected (localhost:8080)');

        // Connect to Functions Emulator
        connectFunctionsEmulator(functions, 'localhost', 5001);
        console.log('✅ Functions Emulator connected (localhost:5001)');

        // Connect to Storage Emulator
        connectStorageEmulator(storage, 'localhost', 9199);
        console.log('✅ Storage Emulator connected (localhost:9199)');

        console.log('🎉 All emulators connected successfully!');
        console.log('📝 Note: Use test accounts from the Auth Emulator UI for Google Sign-In');
    } catch (error) {
        console.error('❌ Error connecting to emulators:', error);
        console.log('⚠️ Make sure emulators are running: npm run emulators');
    }
}

// Export services
export { auth, db, storage, functions };
export default app;
