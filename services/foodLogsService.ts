import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    Timestamp,
    onSnapshot,
    Unsubscribe
} from 'firebase/firestore';
import { db } from '../src/firebase/config';
import { HistoryEntry, HistoryLogItem } from '../types';

const FOOD_LOGS_COLLECTION = 'foodLogs';

/**
 * Interface for food log data (extends HistoryEntry with Firestore fields)
 */
export interface FoodLog {
    logId: string;                  // Auto-generated document ID
    userId: string;                 // Reference to users/{uid}
    date: string;                   // Date of the food log entry (YYYY-MM-DD)
    cuisine: string;                // Type of cuisine (e.g., "Italian", "Japanese")
    foodType: string;               // Specific food type (e.g., "Pizza", "Sushi")
    mealType?: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'; // Meal type
    restaurantId?: string;          // Reference to restaurants/{restaurantId} if visited
    restaurantName?: string;        // Restaurant name (denormalized for quick access)
    logs?: HistoryLogItem[];        // Array of food items with ratings
    rating?: number;                // Overall rating (1-5 scale)
    notes?: string;                 // Additional notes or comments
    createdAt: Timestamp;           // Entry creation timestamp
    updatedAt: Timestamp;           // Last update timestamp
}

/**
 * Input type for creating a food log
 */
export interface CreateFoodLogInput {
    date: string;
    cuisine: string;
    foodType: string;
    mealType?: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
    restaurantName?: string;
    logs?: HistoryLogItem[];
    rating?: number;
    notes?: string;
}

/**
 * Create a new food log entry
 */
export const createFoodLog = async (
    userId: string,
    logData: CreateFoodLogInput
): Promise<FoodLog> => {
    try {
        const foodLogsRef = collection(db, FOOD_LOGS_COLLECTION);

        const newFoodLog = {
            userId,
            date: logData.date,
            cuisine: logData.cuisine,
            foodType: logData.foodType,
            mealType: logData.mealType || null,
            restaurantId: null,
            restaurantName: logData.restaurantName || '',
            logs: logData.logs || [],
            rating: logData.rating || null,
            notes: logData.notes || '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        const docRef = await addDoc(foodLogsRef, newFoodLog);

        console.log('✅ Food log created successfully:', docRef.id);

        return {
            logId: docRef.id,
            ...newFoodLog,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        } as FoodLog;
    } catch (error) {
        console.error('❌ Error creating food log:', error);
        throw new Error('Failed to create food log');
    }
};

/**
 * Get food logs for a user within a date range
 */
export const getFoodLogs = async (
    userId: string,
    startDate?: string,
    endDate?: string
): Promise<FoodLog[]> => {
    try {
        const foodLogsRef = collection(db, FOOD_LOGS_COLLECTION);
        let q = query(
            foodLogsRef,
            where('userId', '==', userId),
            orderBy('date', 'desc')
        );

        // Add date range filters if provided
        if (startDate) {
            q = query(q, where('date', '>=', startDate));
        }
        if (endDate) {
            q = query(q, where('date', '<=', endDate));
        }

        const querySnapshot = await getDocs(q);
        const foodLogs: FoodLog[] = [];

        querySnapshot.forEach((doc) => {
            foodLogs.push({
                logId: doc.id,
                ...doc.data(),
            } as FoodLog);
        });

        return foodLogs;
    } catch (error) {
        console.error('❌ Error fetching food logs:', error);
        return [];
    }
};

/**
 * Get current week's food logs for calendar view
 */
export const getWeeklyLogs = async (userId: string): Promise<FoodLog[]> => {
    try {
        const today = new Date();
        const start = new Date(today);
        start.setHours(0, 0, 0, 0);
        start.setDate(today.getDate() - today.getDay()); // Sunday

        const toLocalDateString = (d: Date) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const startDate = toLocalDateString(start);

        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        const endDate = toLocalDateString(end);

        return await getFoodLogs(userId, startDate, endDate);
    } catch (error) {
        console.error('❌ Error fetching weekly logs:', error);
        return [];
    }
};

/**
 * Update an existing food log
 */
export const updateFoodLog = async (
    userId: string,
    logId: string,
    updates: Partial<CreateFoodLogInput>
): Promise<void> => {
    try {
        const logRef = doc(db, FOOD_LOGS_COLLECTION, logId);

        await updateDoc(logRef, {
            ...updates,
            updatedAt: serverTimestamp(),
        });

        console.log('✅ Food log updated successfully');
    } catch (error) {
        console.error('❌ Error updating food log:', error);
        throw new Error('Failed to update food log');
    }
};

/**
 * Delete a food log
 */
export const deleteFoodLog = async (logId: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, FOOD_LOGS_COLLECTION, logId));
        console.log('✅ Food log deleted successfully');
    } catch (error) {
        console.error('❌ Error deleting food log:', error);
        throw new Error('Failed to delete food log');
    }
};

/**
 * Subscribe to real-time updates for food logs
 */
export const subscribeFoodLogs = (
    userId: string,
    callback: (logs: FoodLog[]) => void,
    startDate?: string,
    endDate?: string
): Unsubscribe => {
    const foodLogsRef = collection(db, FOOD_LOGS_COLLECTION);
    let q = query(
        foodLogsRef,
        where('userId', '==', userId),
        orderBy('date', 'desc')
    );

    if (startDate) {
        q = query(q, where('date', '>=', startDate));
    }
    if (endDate) {
        q = query(q, where('date', '<=', endDate));
    }

    return onSnapshot(q, (querySnapshot) => {
        const foodLogs: FoodLog[] = [];
        querySnapshot.forEach((doc) => {
            foodLogs.push({
                logId: doc.id,
                ...doc.data(),
            } as FoodLog);
        });
        callback(foodLogs);
    }, (error) => {
        console.error('❌ Error in food logs subscription:', error);
        callback([]);
    });
};

/**
 * Convert FoodLog to HistoryEntry format for backward compatibility
 */
export const foodLogToHistoryEntry = (foodLog: FoodLog): HistoryEntry => {
    return {
        id: foodLog.logId,
        date: foodLog.date,
        cuisine: foodLog.cuisine,
        foodType: foodLog.foodType,
        mealType: foodLog.mealType,
        restaurantName: foodLog.restaurantName,
        logs: foodLog.logs,
        timestamp: foodLog.createdAt?.toMillis() || Date.now(),
    };
};

/**
 * Auto-log a search event as a food log for the current day
 */
export const autoLogFoodSearch = async (
    userId: string,
    cuisine: string,
    foodType: string,
    restaurantName?: string
): Promise<void> => {
    try {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        await createFoodLog(userId, {
            date: dateStr,
            cuisine: cuisine || 'General',
            foodType: foodType || 'Exploring',
            restaurantName: restaurantName || ''
        });
        console.log('✅ Auto-logged search to Weekly Food Hunt');
    } catch (error) {
        console.error('❌ Error auto-logging food search:', error);
    }
};

/**
 * Get unique restaurants from user's food logs
 */
export const getExploredRestaurants = async (userId: string): Promise<{
    id: string;
    name: string;
    cuisine: string;
    timestamp: number;
}[]> => {
    try {
        const foodLogs = await getFoodLogs(userId);

        // Create a map to track unique restaurants
        const restaurantMap = new Map<string, {
            id: string;
            name: string;
            cuisine: string;
            timestamp: number;
        }>();

        foodLogs.forEach((log) => {
            if (log.restaurantName) {
                const key = log.restaurantName.toLowerCase();
                if (!restaurantMap.has(key)) {
                    restaurantMap.set(key, {
                        id: log.restaurantId || log.logId,
                        name: log.restaurantName,
                        cuisine: log.cuisine,
                        timestamp: log.createdAt?.toMillis() || Date.now(),
                    });
                }
            }
        });

        return Array.from(restaurantMap.values());
    } catch (error) {
        console.error('❌ Error getting explored restaurants:', error);
        return [];
    }
};
