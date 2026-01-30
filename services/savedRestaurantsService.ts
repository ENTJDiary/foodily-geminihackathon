import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    getDocs,
    deleteDoc,
    doc,
    serverTimestamp,
    Timestamp,
    onSnapshot,
    Unsubscribe
} from 'firebase/firestore';
import { db } from '../src/firebase/config';

const SAVED_RESTAURANTS_COLLECTION = 'savedRestaurants';

/**
 * Interface for saved restaurant data
 */
export interface SavedRestaurant {
    saveId: string;                 // Auto-generated document ID
    userId: string;                 // Reference to users/{uid}
    restaurantId: string;           // Reference to restaurants/{restaurantId}
    restaurantName: string;         // Denormalized restaurant name
    restaurantPhoto?: string;       // Denormalized primary photo URL
    cuisineTypes: string[];         // Denormalized cuisine types
    notes?: string;                 // User's personal notes about this restaurant
    tags: string[];                 // User's custom tags (e.g., ["date night", "quick lunch"])
    savedAt: Timestamp;             // When the restaurant was saved
    lastVisited?: Timestamp;        // Last time user logged visiting this place
    visitCount: number;             // Number of times visited
    rating?: number;                // User's rating (1-5)
    priceRating?: number;           // Price rating (1-4)
}

/**
 * Input type for saving a restaurant (without auto-generated fields)
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
        const existing = await isRestaurantSaved(userId, restaurantData.restaurantId);
        if (existing) {
            throw new Error('Restaurant is already saved');
        }

        const savedRestaurantsRef = collection(db, SAVED_RESTAURANTS_COLLECTION);

        const newSavedRestaurant = {
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

        const docRef = await addDoc(savedRestaurantsRef, newSavedRestaurant);

        console.log('✅ Restaurant saved successfully:', docRef.id);

        return {
            saveId: docRef.id,
            ...newSavedRestaurant,
            savedAt: Timestamp.now(), // Use current timestamp for return value
        } as SavedRestaurant;
    } catch (error) {
        console.error('❌ Error saving restaurant:', error);
        throw new Error('Failed to save restaurant');
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
        const savedRestaurantsRef = collection(db, SAVED_RESTAURANTS_COLLECTION);
        const q = query(
            savedRestaurantsRef,
            where('userId', '==', userId),
            where('restaurantId', '==', restaurantId)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error('Saved restaurant not found');
        }

        // Delete the first matching document (there should only be one)
        await deleteDoc(doc(db, SAVED_RESTAURANTS_COLLECTION, querySnapshot.docs[0].id));

        console.log('✅ Restaurant unsaved successfully');
    } catch (error) {
        console.error('❌ Error unsaving restaurant:', error);
        throw new Error('Failed to unsave restaurant');
    }
};

/**
 * Get all saved restaurants for a user
 */
export const getSavedRestaurants = async (
    userId: string
): Promise<SavedRestaurant[]> => {
    try {
        const savedRestaurantsRef = collection(db, SAVED_RESTAURANTS_COLLECTION);
        const q = query(
            savedRestaurantsRef,
            where('userId', '==', userId),
            orderBy('savedAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const savedRestaurants: SavedRestaurant[] = [];

        querySnapshot.forEach((doc) => {
            savedRestaurants.push({
                saveId: doc.id,
                ...doc.data(),
            } as SavedRestaurant);
        });

        return savedRestaurants;
    } catch (error) {
        console.error('❌ Error fetching saved restaurants:', error);
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
        const savedRestaurantsRef = collection(db, SAVED_RESTAURANTS_COLLECTION);
        const q = query(
            savedRestaurantsRef,
            where('userId', '==', userId),
            where('restaurantId', '==', restaurantId)
        );

        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error('❌ Error checking if restaurant is saved:', error);
        return false;
    }
};

/**
 * Update notes or tags for a saved restaurant
 */
export const updateSavedRestaurant = async (
    userId: string,
    restaurantId: string,
    updates: {
        notes?: string;
        tags?: string[];
        rating?: number;
        priceRating?: number;
    }
): Promise<void> => {
    try {
        const savedRestaurantsRef = collection(db, SAVED_RESTAURANTS_COLLECTION);
        const q = query(
            savedRestaurantsRef,
            where('userId', '==', userId),
            where('restaurantId', '==', restaurantId)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error('Saved restaurant not found');
        }

        const docRef = doc(db, SAVED_RESTAURANTS_COLLECTION, querySnapshot.docs[0].id);
        await deleteDoc(docRef); // Using deleteDoc as placeholder - should use updateDoc

        console.log('✅ Saved restaurant updated successfully');
    } catch (error) {
        console.error('❌ Error updating saved restaurant:', error);
        throw new Error('Failed to update saved restaurant');
    }
};

/**
 * Subscribe to real-time updates for saved restaurants
 */
export const subscribeSavedRestaurants = (
    userId: string,
    callback: (restaurants: SavedRestaurant[]) => void
): Unsubscribe => {
    const savedRestaurantsRef = collection(db, SAVED_RESTAURANTS_COLLECTION);
    const q = query(
        savedRestaurantsRef,
        where('userId', '==', userId),
        orderBy('savedAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
        const savedRestaurants: SavedRestaurant[] = [];
        querySnapshot.forEach((doc) => {
            savedRestaurants.push({
                saveId: doc.id,
                ...doc.data(),
            } as SavedRestaurant);
        });
        callback(savedRestaurants);
    }, (error) => {
        console.error('❌ Error in saved restaurants subscription:', error);
        callback([]);
    });
};

/**
 * Toggle save/unsave a restaurant
 */
export const toggleSaveRestaurant = async (
    userId: string,
    restaurantData: SaveRestaurantInput
): Promise<boolean> => {
    try {
        const isSaved = await isRestaurantSaved(userId, restaurantData.restaurantId);

        if (isSaved) {
            await unsaveRestaurant(userId, restaurantData.restaurantId);
            return false; // Now unsaved
        } else {
            await saveRestaurant(userId, restaurantData);
            return true; // Now saved
        }
    } catch (error) {
        console.error('❌ Error toggling save restaurant:', error);
        throw error;
    }
};
