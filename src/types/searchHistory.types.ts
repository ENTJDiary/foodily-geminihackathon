import { Timestamp } from 'firebase/firestore';

/**
 * Search history entry stored in Firestore searchHistory/{searchId} collection
 */
export interface SearchHistory {
    searchId: string;
    userId: string;
    searchQuery: string;
    searchType: 'dish' | 'cuisine' | 'restaurant' | 'location';
    dishName?: string;
    cuisineType?: string;
    locationSearched?: string;
    resultsCount: number;
    timestamp: Timestamp;
    userLocation?: {
        latitude: number;
        longitude: number;
    };
}

/**
 * Form data for creating search history (before saving to Firestore)
 */
export interface SearchHistoryInput {
    searchQuery: string;
    searchType: 'dish' | 'cuisine' | 'restaurant' | 'location';
    dishName?: string;
    cuisineType?: string;
    locationSearched?: string;
    resultsCount: number;
    userLocation?: {
        latitude: number;
        longitude: number;
    };
}
