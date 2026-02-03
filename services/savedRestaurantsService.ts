import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    deleteDoc,
    updateDoc,
    onSnapshot,
    orderBy,
    serverTimestamp,
    limit,
    Timestamp,
    Unsubscribe
} from 'firebase/firestore';
import { db } from '../src/firebase/config';

const COLLECTION_NAME = 'savedRestaurants';

/**
 * Interface for saved restaurant data
 */
export interface SavedRestaurant {
    saveId: string;                 // Firestore Doc ID
    userId: string;
    restaurantId: string;
    restaurantName: string;
    restaurantPhoto?: string;
    cuisineTypes: string[];
    notes?: string;
    tags: string[];
    savedAt: any;                   // Firestore Timestamp
    lastVisited?: any;
    visitCount: number;
    rating?: number;
    priceRating?: number;
}

/**
 * Input type for saving a restaurant
 */
export interface SaveRestaurantInput {
    restaurantId: string;
    restaurantName: string;
    restaurantPhoto?: string;
    cuisineTypes?: string[];
    notes?: string;
    tags?: string[];
    rating?: number;
    priceRating?: number;
}

/**
 * Save a restaurant to user's saved list
 */
export const saveRestaurant = async (
    userId: string,
    restaurantData: SaveRestaurantInput
): Promise<SavedRestaurant> => {
    try {
        // Check if already saved
        const isSaved = await isRestaurantSaved(userId, restaurantData.restaurantId);
        if (isSaved) {
            throw new Error('Restaurant is already saved');
        }

        const newRestaurant = {
            userId,
            restaurantId: restaurantData.restaurantId,
            restaurantName: restaurantData.restaurantName,
            restaurantPhoto: restaurantData.restaurantPhoto || null,
            cuisineTypes: restaurantData.cuisineTypes || [],
            notes: restaurantData.notes || '',
            tags: restaurantData.tags || [],
            savedAt: serverTimestamp(),
            lastVisited: null,
            visitCount: 0,
            rating: restaurantData.rating || null,
            priceRating: restaurantData.priceRating || null,
        };

        const docRef = await addDoc(collection(db, COLLECTION_NAME), newRestaurant);
        console.log('✅ Restaurant saved to Firestore:', docRef.id);

        // Return the saved object with the new ID
        // Note: savedAt will be null initially for serverTimestamp, so we mock it for immediate UI feedback
        return {
            ...newRestaurant,
            saveId: docRef.id,
            savedAt: Timestamp.now(),
            restaurantPhoto: newRestaurant.restaurantPhoto || undefined,
            rating: newRestaurant.rating || undefined,
            priceRating: newRestaurant.priceRating || undefined,
        };
    } catch (error) {
        console.error('❌ Error saving restaurant:', error);
        throw error;
    }
};

/**
 * Remove a restaurant from user's saved list
 */
export const unsaveRestaurant = async (
    userId: string,
    restaurantId: string
): Promise<void> => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('userId', '==', userId),
            where('restaurantId', '==', restaurantId)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.warn('⚠️ Restaurant not found to unsave');
            return;
        }

        // Should only be one, but delete all duplicates if any
        const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        console.log('✅ Restaurant removed from Firestore');
    } catch (error) {
        console.error('❌ Error unsaving restaurant:', error);
        throw error;
    }
};

/**
 * Get all saved restaurants for a user
 */
export const getSavedRestaurants = async (
    userId: string
): Promise<SavedRestaurant[]> => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('userId', '==', userId),
            orderBy('savedAt', 'desc')
        );

        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            ...doc.data(),
            saveId: doc.id
        })) as SavedRestaurant[];
    } catch (error) {
        console.error('❌ Error getting saved restaurants:', error);
        return [];
    }
};

/**
 * Check if a restaurant is saved by the user
 */
export const isRestaurantSaved = async (
    userId: string,
    restaurantId: string
): Promise<boolean> => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('userId', '==', userId),
            where('restaurantId', '==', restaurantId),
            limit(1)
        );

        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error('❌ Error checking if restaurant saved:', error);
        return false;
    }
};

/**
 * Subscribe to real-time updates for saved restaurants
 */
export const subscribeSavedRestaurants = (
    userId: string,
    callback: (restaurants: SavedRestaurant[]) => void
): Unsubscribe => {
    const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('savedAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
        const restaurants = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            saveId: doc.id
        })) as SavedRestaurant[];

        callback(restaurants);
    }, (error) => {
        console.error('❌ Error subscribing to saved restaurants:', error);
    });
};

/**
 * Toggle save/unsave a restaurant
 */
export const toggleSaveRestaurant = async (
    userId: string,
    restaurantData: SaveRestaurantInput
): Promise<boolean> => {
    const isSaved = await isRestaurantSaved(userId, restaurantData.restaurantId);

    if (isSaved) {
        await unsaveRestaurant(userId, restaurantData.restaurantId);
        return false;
    } else {
        await saveRestaurant(userId, restaurantData);
        return true;
    }
};

/**
 * Update notes or tags for a saved restaurant
 */
export const updateSavedRestaurant = async (
    userId: string,
    restaurantId: string,
    updates: any
): Promise<void> => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('userId', '==', userId),
            where('restaurantId', '==', restaurantId),
            limit(1)
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const docRef = querySnapshot.docs[0].ref;
            await updateDoc(docRef, updates);
            console.log('✅ Restaurant updated in Firestore');
        } else {
            console.warn('⚠️ Restaurant not found to update');
            throw new Error('Saved restaurant not found');
        }
    } catch (error) {
        console.error('❌ Error updating saved restaurant:', error);
        throw error;
    }
};
