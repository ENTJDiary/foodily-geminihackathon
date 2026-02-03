import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../src/firebase/config';

/**
 * Remove invalid cuisine entries from a user's taste profile
 * This is a one-time cleanup utility to remove "Search" and "Local Hunt" entries
 */
export const cleanupInvalidCuisines = async (userId: string): Promise<void> => {
    try {
        const profileRef = doc(db, 'tasteProfiles', userId);
        const profileDoc = await getDoc(profileRef);

        if (!profileDoc.exists()) {
            console.log('No profile found to clean up');
            return;
        }

        const profile = profileDoc.data();
        const cuisineScores = profile.cuisineScores || {};

        // List of invalid cuisine names to remove
        const invalidCuisines = ['Search', 'Local Hunt'];
        let cleaned = false;

        invalidCuisines.forEach(invalidCuisine => {
            if (cuisineScores[invalidCuisine]) {
                delete cuisineScores[invalidCuisine];
                cleaned = true;
                console.log(`🧹 Removed invalid cuisine: ${invalidCuisine}`);
            }
        });

        if (cleaned) {
            // Update the profile with cleaned data
            await updateDoc(profileRef, {
                cuisineScores: cuisineScores
            });
            console.log('✅ Profile cleaned successfully');
        } else {
            console.log('✅ No invalid cuisines found');
        }
    } catch (error) {
        console.error('❌ Error cleaning profile:', error);
        throw error;
    }
};
