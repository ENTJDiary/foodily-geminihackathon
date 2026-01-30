import { collection, addDoc, query, where, orderBy, limit, getDocs, deleteDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../src/firebase/config';
import { SearchHistory, SearchHistoryInput } from '../src/types/searchHistory.types';

const SEARCH_HISTORY_COLLECTION = 'searchHistory';

/**
 * Save search history to Firestore
 */
export const saveSearchHistory = async (
    userId: string,
    searchData: SearchHistoryInput
): Promise<void> => {
    try {
        const searchHistoryRef = collection(db, SEARCH_HISTORY_COLLECTION);

        const searchEntry = {
            userId,
            ...searchData,
            timestamp: serverTimestamp(),
        };

        await addDoc(searchHistoryRef, searchEntry);
        console.log('✅ Search history saved successfully');
    } catch (error) {
        console.error('❌ Error saving search history:', error);
        throw new Error('Failed to save search history');
    }
};

/**
 * Get user's search history
 */
export const getSearchHistory = async (
    userId: string,
    limitCount: number = 50
): Promise<SearchHistory[]> => {
    try {
        const searchHistoryRef = collection(db, SEARCH_HISTORY_COLLECTION);
        const q = query(
            searchHistoryRef,
            where('userId', '==', userId),
            orderBy('timestamp', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        const history: SearchHistory[] = [];

        querySnapshot.forEach((doc) => {
            history.push({
                searchId: doc.id,
                ...doc.data(),
            } as SearchHistory);
        });

        return history;
    } catch (error) {
        console.error('❌ Error fetching search history:', error);
        return [];
    }
};

/**
 * Get search history by type
 */
export const getSearchHistoryByType = async (
    userId: string,
    searchType: 'dish' | 'cuisine' | 'restaurant' | 'location'
): Promise<SearchHistory[]> => {
    try {
        const searchHistoryRef = collection(db, SEARCH_HISTORY_COLLECTION);
        const q = query(
            searchHistoryRef,
            where('userId', '==', userId),
            where('searchType', '==', searchType),
            orderBy('timestamp', 'desc'),
            limit(50)
        );

        const querySnapshot = await getDocs(q);
        const history: SearchHistory[] = [];

        querySnapshot.forEach((doc) => {
            history.push({
                searchId: doc.id,
                ...doc.data(),
            } as SearchHistory);
        });

        return history;
    } catch (error) {
        console.error('❌ Error fetching search history by type:', error);
        return [];
    }
};

/**
 * Clear user's search history
 */
export const clearSearchHistory = async (userId: string): Promise<void> => {
    try {
        const searchHistoryRef = collection(db, SEARCH_HISTORY_COLLECTION);
        const q = query(
            searchHistoryRef,
            where('userId', '==', userId)
        );

        const querySnapshot = await getDocs(q);
        const deletePromises: Promise<void>[] = [];

        querySnapshot.forEach((docSnapshot) => {
            deletePromises.push(deleteDoc(doc(db, SEARCH_HISTORY_COLLECTION, docSnapshot.id)));
        });

        await Promise.all(deletePromises);
        console.log('✅ Search history cleared successfully');
    } catch (error) {
        console.error('❌ Error clearing search history:', error);
        throw new Error('Failed to clear search history');
    }
};

/**
 * Get recent searches (last 7 days)
 */
export const getRecentSearches = async (userId: string): Promise<SearchHistory[]> => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const searchHistoryRef = collection(db, SEARCH_HISTORY_COLLECTION);
        const q = query(
            searchHistoryRef,
            where('userId', '==', userId),
            where('timestamp', '>=', Timestamp.fromDate(sevenDaysAgo)),
            orderBy('timestamp', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const history: SearchHistory[] = [];

        querySnapshot.forEach((doc) => {
            history.push({
                searchId: doc.id,
                ...doc.data(),
            } as SearchHistory);
        });

        return history;
    } catch (error) {
        console.error('❌ Error fetching recent searches:', error);
        return [];
    }
};
