import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    getDocs,
    doc,
    serverTimestamp,
    Timestamp,
    onSnapshot,
    Unsubscribe,
    limit
} from 'firebase/firestore';
import { db } from '../src/firebase/config';

const RESTAURANT_CLICKS_COLLECTION = 'restaurantClicks';

/**
 * Interface for restaurant click data
 */
export interface RestaurantClick {
    clickId: string;                // Auto-generated document ID
    userId: string;                 // Reference to users/{uid}
    restaurantId: string;           // Restaurant identifier (placeId or custom ID)
    restaurantName: string;         // Restaurant name
    restaurantPhoto?: string;       // Restaurant photo URL
    cuisineTypes?: string[];        // Cuisine types
    clickedAt: Timestamp;           // Click timestamp
    source: 'food_hunter' | 'food_gacha' | 'concierge' | 'search' | 'other';
}

/**
 * Input type for tracking a restaurant click
 */
export interface TrackRestaurantClickInput {
    restaurantId: string;
    restaurantName: string;
    restaurantPhoto?: string;
    cuisineTypes?: string[];
    source: 'food_hunter' | 'food_gacha' | 'concierge' | 'search' | 'other';
}

/**
 * Track a restaurant click
 */
export const trackRestaurantClick = async (
    userId: string,
    clickData: TrackRestaurantClickInput
): Promise<RestaurantClick> => {
    try {
        const clicksRef = collection(db, RESTAURANT_CLICKS_COLLECTION);

        const newClick = {
            userId,
            restaurantId: clickData.restaurantId,
            restaurantName: clickData.restaurantName,
            restaurantPhoto: clickData.restaurantPhoto || null,
            cuisineTypes: clickData.cuisineTypes || [],
            source: clickData.source,
            clickedAt: serverTimestamp(),
        };

        const docRef = await addDoc(clicksRef, newClick);

        console.log('✅ Restaurant click tracked:', docRef.id);

        return {
            clickId: docRef.id,
            ...newClick,
            clickedAt: Timestamp.now(),
        } as RestaurantClick;
    } catch (error) {
        console.error('❌ Error tracking restaurant click:', error);
        throw new Error('Failed to track restaurant click');
    }
};

/**
 * Get unique clicked restaurants for a user
 * Returns only the most recent click for each unique restaurant
 */
export const getClickedRestaurants = async (userId: string): Promise<{
    id: string;
    name: string;
    photo?: string;
    cuisineTypes?: string[];
    timestamp: number;
    source: string;
}[]> => {
    try {
        const clicksRef = collection(db, RESTAURANT_CLICKS_COLLECTION);
        const q = query(
            clicksRef,
            where('userId', '==', userId),
            orderBy('clickedAt', 'desc')
        );

        const querySnapshot = await getDocs(q);

        // Use a map to track unique restaurants (keep only most recent click)
        const restaurantMap = new Map<string, {
            id: string;
            name: string;
            photo?: string;
            cuisineTypes?: string[];
            timestamp: number;
            source: string;
        }>();

        querySnapshot.forEach((doc) => {
            const data = doc.data() as RestaurantClick;
            const key = data.restaurantId;

            // Only add if not already in map (since we're ordered by most recent)
            if (!restaurantMap.has(key)) {
                restaurantMap.set(key, {
                    id: data.restaurantId,
                    name: data.restaurantName,
                    photo: data.restaurantPhoto,
                    cuisineTypes: data.cuisineTypes,
                    timestamp: data.clickedAt?.toMillis() || Date.now(),
                    source: data.source,
                });
            }
        });

        return Array.from(restaurantMap.values());
    } catch (error) {
        console.error('❌ Error fetching clicked restaurants:', error);
        return [];
    }
};

/**
 * Subscribe to real-time updates for clicked restaurants
 */
export const subscribeClickedRestaurants = (
    userId: string,
    callback: (restaurants: {
        id: string;
        name: string;
        photo?: string;
        cuisineTypes?: string[];
        timestamp: number;
        source: string;
    }[]) => void
): Unsubscribe => {
    const clicksRef = collection(db, RESTAURANT_CLICKS_COLLECTION);
    const q = query(
        clicksRef,
        where('userId', '==', userId),
        orderBy('clickedAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
        // Use a map to track unique restaurants (keep only most recent click)
        const restaurantMap = new Map<string, {
            id: string;
            name: string;
            photo?: string;
            cuisineTypes?: string[];
            timestamp: number;
            source: string;
        }>();

        querySnapshot.forEach((doc) => {
            const data = doc.data() as RestaurantClick;
            const key = data.restaurantId;

            // Only add if not already in map (since we're ordered by most recent)
            if (!restaurantMap.has(key)) {
                restaurantMap.set(key, {
                    id: data.restaurantId,
                    name: data.restaurantName,
                    photo: data.restaurantPhoto,
                    cuisineTypes: data.cuisineTypes,
                    timestamp: data.clickedAt?.toMillis() || Date.now(),
                    source: data.source,
                });
            }
        });

        const restaurants = Array.from(restaurantMap.values());
        console.log('📥 Received clicked restaurants:', restaurants);
        callback(restaurants);
    }, (error) => {
        console.error('❌ Error in clicked restaurants subscription:', error);
        callback([]);
    });
};

/**
 * Check if user has clicked on a specific restaurant
 */
export const hasClickedRestaurant = async (
    userId: string,
    restaurantId: string
): Promise<boolean> => {
    try {
        const clicksRef = collection(db, RESTAURANT_CLICKS_COLLECTION);
        const q = query(
            clicksRef,
            where('userId', '==', userId),
            where('restaurantId', '==', restaurantId),
            limit(1)
        );

        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error('❌ Error checking restaurant click:', error);
        return false;
    }
};
