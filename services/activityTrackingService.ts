import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    getDocs,
    deleteDoc,
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../src/firebase/config';
import { UserActivity } from '../src/types/auth.types';
import { Location } from '../types';

const USER_ACTIVITY_COLLECTION = 'userActivity';

/**
 * Get time of day category based on hour
 */
const getTimeOfDay = (hour: number): 'breakfast' | 'lunch' | 'dinner' | 'snack' => {
    if (hour >= 6 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 15) return 'lunch';
    if (hour >= 17 && hour < 22) return 'dinner';
    return 'snack';
};

/**
 * Track restaurant view/interaction
 */
export const trackRestaurantView = async (
    userId: string,
    restaurantId: string,
    restaurantName: string,
    cuisineTypes: string[],
    timeSpent: number,
    location?: Location
): Promise<void> => {
    try {
        const now = new Date();
        const activityRef = collection(db, USER_ACTIVITY_COLLECTION);

        const activity = {
            userId,
            activityType: 'restaurant_view' as const,
            restaurantId,
            restaurantName,
            cuisineTypes,
            timeSpent,
            timestamp: serverTimestamp(),
            context: {
                timeOfDay: getTimeOfDay(now.getHours()),
                dayOfWeek: now.getDay(),
                location: location || null,
            },
        };

        await addDoc(activityRef, activity);
        console.log('✅ Restaurant view tracked:', restaurantName);
    } catch (error) {
        console.error('❌ Error tracking restaurant view:', error);
        // Don't throw - tracking failures shouldn't break user experience
    }
};

/**
 * Track quick exit (negative signal)
 */
export const trackQuickExit = async (
    userId: string,
    restaurantId: string,
    restaurantName: string,
    timeSpent: number,
    location?: Location
): Promise<void> => {
    try {
        const now = new Date();
        const activityRef = collection(db, USER_ACTIVITY_COLLECTION);

        const activity = {
            userId,
            activityType: 'quick_exit' as const,
            restaurantId,
            restaurantName,
            timeSpent,
            timestamp: serverTimestamp(),
            context: {
                timeOfDay: getTimeOfDay(now.getHours()),
                dayOfWeek: now.getDay(),
                location: location || null,
            },
        };

        await addDoc(activityRef, activity);
        console.log('⚠️ Quick exit tracked:', restaurantName, `(${timeSpent}ms)`);
    } catch (error) {
        console.error('❌ Error tracking quick exit:', error);
    }
};

/**
 * Track search with no clicks (negative signal)
 */
export const trackSearchNoClick = async (
    userId: string,
    searchQuery: string,
    location?: Location
): Promise<void> => {
    try {
        const now = new Date();
        const activityRef = collection(db, USER_ACTIVITY_COLLECTION);

        const activity = {
            userId,
            activityType: 'search_no_click' as const,
            searchQuery,
            timestamp: serverTimestamp(),
            context: {
                timeOfDay: getTimeOfDay(now.getHours()),
                dayOfWeek: now.getDay(),
                location: location || null,
            },
        };

        await addDoc(activityRef, activity);
        console.log('⚠️ Search with no click tracked:', searchQuery);
    } catch (error) {
        console.error('❌ Error tracking search no click:', error);
    }
};

/**
 * Get user activity history
 */
export const getUserActivity = async (
    userId: string,
    limitCount: number = 100
): Promise<UserActivity[]> => {
    try {
        const activityRef = collection(db, USER_ACTIVITY_COLLECTION);
        const q = query(
            activityRef,
            where('userId', '==', userId),
            orderBy('timestamp', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const activities: UserActivity[] = [];

        querySnapshot.forEach((doc) => {
            activities.push({
                activityId: doc.id,
                ...doc.data(),
            } as UserActivity);
        });

        return activities.slice(0, limitCount);
    } catch (error) {
        console.error('❌ Error fetching user activity:', error);
        return [];
    }
};

/**
 * Get activity by type
 */
export const getActivityByType = async (
    userId: string,
    activityType: 'restaurant_view' | 'quick_exit' | 'search_no_click'
): Promise<UserActivity[]> => {
    try {
        const activityRef = collection(db, USER_ACTIVITY_COLLECTION);
        const q = query(
            activityRef,
            where('userId', '==', userId),
            where('activityType', '==', activityType),
            orderBy('timestamp', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const activities: UserActivity[] = [];

        querySnapshot.forEach((doc) => {
            activities.push({
                activityId: doc.id,
                ...doc.data(),
            } as UserActivity);
        });

        return activities;
    } catch (error) {
        console.error('❌ Error fetching activity by type:', error);
        return [];
    }
};

/**
 * Clear user activity (for profile reset)
 */
export const clearUserActivity = async (userId: string): Promise<void> => {
    try {
        const activityRef = collection(db, USER_ACTIVITY_COLLECTION);
        const q = query(activityRef, where('userId', '==', userId));

        const querySnapshot = await getDocs(q);
        const deletePromises = querySnapshot.docs.map((docSnapshot) =>
            deleteDoc(doc(db, USER_ACTIVITY_COLLECTION, docSnapshot.id))
        );

        await Promise.all(deletePromises);
        console.log('✅ User activity cleared');
    } catch (error) {
        console.error('❌ Error clearing user activity:', error);
        throw new Error('Failed to clear user activity');
    }
};
