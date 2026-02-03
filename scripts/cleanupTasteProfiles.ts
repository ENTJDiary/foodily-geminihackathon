/**
 * Cleanup script to remove polluted taste profile data
 * 
 * This script deletes all existing taste profiles that contain
 * restaurant names as keys instead of proper IDs.
 * 
 * Run this ONCE in the Firebase Emulator to clean up existing data.
 * After running, fresh taste profiles will be generated with correct IDs.
 */

import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../src/firebase/config';

const TASTE_PROFILES_COLLECTION = 'tasteProfiles';

async function cleanupTasteProfiles() {
    console.log('🧹 Starting taste profile cleanup...');

    try {
        const profilesRef = collection(db, TASTE_PROFILES_COLLECTION);
        const snapshot = await getDocs(profilesRef);

        console.log(`📊 Found ${snapshot.size} taste profile(s) to delete`);

        let deletedCount = 0;

        for (const profileDoc of snapshot.docs) {
            try {
                await deleteDoc(doc(db, TASTE_PROFILES_COLLECTION, profileDoc.id));
                deletedCount++;
                console.log(`✅ Deleted taste profile for user: ${profileDoc.id}`);
            } catch (error) {
                console.error(`❌ Failed to delete profile ${profileDoc.id}:`, error);
            }
        }

        console.log(`\n✨ Cleanup complete! Deleted ${deletedCount} taste profile(s)`);
        console.log('💡 Fresh profiles will be generated on next user activity');

    } catch (error) {
        console.error('❌ Cleanup failed:', error);
        throw error;
    }
}

// Run cleanup if this script is executed directly
if (typeof window !== 'undefined') {
    console.log('⚠️ This script should be run in a Node.js environment or browser console');
    console.log('📝 To run in browser console:');
    console.log('   1. Open Firebase Emulator UI');
    console.log('   2. Open browser console');
    console.log('   3. Import and call cleanupTasteProfiles()');
}

export { cleanupTasteProfiles };
