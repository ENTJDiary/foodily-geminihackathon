import { Unsubscribe } from 'firebase/firestore';

const SAVED_RESTAURANTS_KEY = 'foodily_saved_restaurants_v2';

/**
 * Interface for saved restaurant data
 */
export interface SavedRestaurant {
    saveId: string;                 // Generated locally
    userId: string;                 // kept for compatibility
    restaurantId: string;
    restaurantName: string;
    restaurantPhoto?: string;
    cuisineTypes: string[];
    notes?: string;
    tags: string[];
    savedAt: any;                   // Mocked for compatibility
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

// Local event for synchronization
const listeners: ((restaurants: SavedRestaurant[]) => void)[] = [];

const notifyListeners = () => {
    const restaurants = getSavedRestaurantsSync();
    listeners.forEach(cb => cb(restaurants));
};

const getSavedRestaurantsSync = (): SavedRestaurant[] => {
    const data = localStorage.getItem(SAVED_RESTAURANTS_KEY);
    if (!data) return [];
    try {
        const parsed = JSON.parse(data);
        return parsed.sort((a: any, b: any) => b.timestamp - a.timestamp);
    } catch (e) {
        console.error('Error parsing saved restaurants from localStorage', e);
        return [];
    }
};

/**
 * Save a restaurant to user's saved list
 */
export const saveRestaurant = async (
    userId: string,
    restaurantData: SaveRestaurantInput
): Promise<SavedRestaurant> => {
    const restaurants = getSavedRestaurantsSync();

    // Check if already saved
    if (restaurants.some(r => r.restaurantId === restaurantData.restaurantId)) {
        throw new Error('Restaurant is already saved');
    }

    const timestamp = Date.now();
    const newSavedRestaurant: SavedRestaurant = {
        saveId: Math.random().toString(36).substr(2, 9),
        userId,
        restaurantId: restaurantData.restaurantId,
        restaurantName: restaurantData.restaurantName,
        restaurantPhoto: restaurantData.restaurantPhoto || undefined,
        cuisineTypes: restaurantData.cuisineTypes || [],
        notes: restaurantData.notes || '',
        tags: restaurantData.tags || [],
        savedAt: { seconds: Math.floor(timestamp / 1000), nanoseconds: 0 },
        lastVisited: null,
        visitCount: 0,
        rating: restaurantData.rating || undefined,
        priceRating: restaurantData.priceRating || undefined,
    };

    const updated = [newSavedRestaurant, ...restaurants];
    localStorage.setItem(SAVED_RESTAURANTS_KEY, JSON.stringify(updated.map(r => ({
        ...r,
        timestamp: r.savedAt.seconds * 1000 // Store timestamp for sorting
    }))));

    console.log('✅ Restaurant saved to localStorage');
    notifyListeners();
    return newSavedRestaurant;
};

/**
 * Remove a restaurant from user's saved list
 */
export const unsaveRestaurant = async (
    userId: string,
    restaurantId: string
): Promise<void> => {
    const restaurants = getSavedRestaurantsSync();
    const updated = restaurants.filter(r => r.restaurantId !== restaurantId);

    if (updated.length === restaurants.length) {
        throw new Error('Saved restaurant not found');
    }

    localStorage.setItem(SAVED_RESTAURANTS_KEY, JSON.stringify(updated.map(r => ({
        ...r,
        timestamp: (r as any).timestamp || Date.now()
    }))));

    console.log('✅ Restaurant removed from localStorage');
    notifyListeners();
};

/**
 * Get all saved restaurants for a user
 */
export const getSavedRestaurants = async (
    userId: string
): Promise<SavedRestaurant[]> => {
    return getSavedRestaurantsSync();
};

/**
 * Check if a restaurant is saved by the user
 */
export const isRestaurantSaved = async (
    userId: string,
    restaurantId: string
): Promise<boolean> => {
    const restaurants = getSavedRestaurantsSync();
    return restaurants.some(r => r.restaurantId === restaurantId);
};

/**
 * Subscribe to real-time updates for saved restaurants
 */
export const subscribeSavedRestaurants = (
    userId: string,
    callback: (restaurants: SavedRestaurant[]) => void
): Unsubscribe => {
    listeners.push(callback);

    // Initial call
    callback(getSavedRestaurantsSync());

    const unsubscribe = () => {
        const index = listeners.indexOf(callback);
        if (index !== -1) {
            listeners.splice(index, 1);
        }
    };

    return unsubscribe as Unsubscribe;
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
 * Update notes or tags for a saved restaurant (Legacy support)
 */
export const updateSavedRestaurant = async (
    userId: string,
    restaurantId: string,
    updates: any
): Promise<void> => {
    const restaurants = getSavedRestaurantsSync();
    const index = restaurants.findIndex(r => r.restaurantId === restaurantId);

    if (index === -1) {
        throw new Error('Saved restaurant not found');
    }

    restaurants[index] = { ...restaurants[index], ...updates };
    localStorage.setItem(SAVED_RESTAURANTS_KEY, JSON.stringify(restaurants));
    notifyListeners();
};
