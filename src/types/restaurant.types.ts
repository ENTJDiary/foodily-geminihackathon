import { Timestamp } from 'firebase/firestore';

/**
 * Restaurant data stored in Firestore restaurants/{restaurantId} collection
 * Caches data from external APIs and supports user-generated restaurants
 */
export interface Restaurant {
    restaurantId: string;
    name: string;
    address: string;
    location: {
        latitude: number;
        longitude: number;
    };
    cuisineTypes: string[];
    priceRange: number; // 1-4 ($ to $$$$)
    rating?: number;
    totalReviews: number;
    photos: string[];
    phoneNumber?: string;
    website?: string;
    hours?: {
        [day: string]: string; // e.g., "monday": "9:00 AM - 10:00 PM"
    };
    tags: string[];

    // Data Source & Caching
    dataSource: 'google_places' | 'gemini_ai' | 'user_generated';
    externalId?: string; // ID from external API
    placeId?: string; // Google Places ID
    lastSyncedAt?: Timestamp;
    cacheExpiresAt?: Timestamp;

    // User-Generated Restaurant Fields
    addedByUserId?: string;
    isVerified: boolean;

    // Metadata
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

/**
 * Input data for caching restaurant from Google Places API
 */
export interface GooglePlacesRestaurantInput {
    placeId: string;
    name: string;
    address: string;
    location: {
        latitude: number;
        longitude: number;
    };
    cuisineTypes?: string[];
    priceRange?: number;
    rating?: number;
    totalReviews?: number;
    photos?: string[];
    phoneNumber?: string;
    website?: string;
    hours?: {
        [day: string]: string;
    };
}

/**
 * Input data for caching restaurant from Gemini AI
 */
export interface GeminiRestaurantInput {
    name: string;
    address: string;
    location?: {
        latitude: number;
        longitude: number;
    };
    cuisineTypes?: string[];
    priceRange?: number;
    rating?: number;
    description?: string;
}

/**
 * Input data for user-generated restaurant
 */
export interface UserGeneratedRestaurantInput {
    name: string;
    address: string;
    location: {
        latitude: number;
        longitude: number;
    };
    cuisineTypes: string[];
    priceRange?: number;
    phoneNumber?: string;
    website?: string;
    tags?: string[];
}
