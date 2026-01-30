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

const SAVED_MENU_ITEMS_COLLECTION = 'savedMenuItems';

/**
 * Interface for saved menu item data
 */
export interface SavedMenuItem {
    saveId: string;                 // Auto-generated document ID
    userId: string;                 // Reference to users/{uid}
    menuItemId: string;             // Reference to communityPosts/{postId} (using menuItemId for clarity)
    // Denormalized data for easy display
    restaurantId: string;
    restaurantName: string;
    title: string;
    image?: string;
    price?: string;
    rating?: number;
    savedAt: Timestamp;
}

/**
 * Input type for saving a menu item
 */
export interface SaveMenuItemInput {
    menuItemId: string;
    restaurantId: string;
    restaurantName: string;
    title: string;
    image?: string;
    price?: string;
    rating?: number;
}

/**
 * Save a menu item to user's saved list
 */
export const saveMenuItem = async (
    userId: string,
    itemData: SaveMenuItemInput
): Promise<SavedMenuItem> => {
    try {
        // Check if already saved
        const existing = await isMenuItemSaved(userId, itemData.menuItemId);
        if (existing) {
            throw new Error('Menu item is already saved');
        }

        const savedItemsRef = collection(db, SAVED_MENU_ITEMS_COLLECTION);

        const newSavedItem = {
            userId,
            menuItemId: itemData.menuItemId,
            restaurantId: itemData.restaurantId,
            restaurantName: itemData.restaurantName,
            title: itemData.title,
            image: itemData.image || null,
            price: itemData.price || null,
            rating: itemData.rating || null,
            savedAt: serverTimestamp(),
        };

        const docRef = await addDoc(savedItemsRef, newSavedItem);

        console.log('✅ Menu item saved successfully:', docRef.id);

        return {
            saveId: docRef.id,
            ...newSavedItem,
            savedAt: Timestamp.now(),
        } as SavedMenuItem;
    } catch (error) {
        console.error('❌ Error saving menu item:', error);
        throw new Error('Failed to save menu item');
    }
};

/**
 * Remove a menu item from user's saved list
 */
export const unsaveMenuItem = async (
    userId: string,
    menuItemId: string
): Promise<void> => {
    try {
        const savedItemsRef = collection(db, SAVED_MENU_ITEMS_COLLECTION);
        const q = query(
            savedItemsRef,
            where('userId', '==', userId),
            where('menuItemId', '==', menuItemId)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error('Saved menu item not found');
        }

        await deleteDoc(doc(db, SAVED_MENU_ITEMS_COLLECTION, querySnapshot.docs[0].id));

        console.log('✅ Menu item unsaved successfully');
    } catch (error) {
        console.error('❌ Error unsaving menu item:', error);
        throw new Error('Failed to unsave menu item');
    }
};

/**
 * Check if a menu item is saved by the user
 */
export const isMenuItemSaved = async (
    userId: string,
    menuItemId: string
): Promise<boolean> => {
    try {
        const savedItemsRef = collection(db, SAVED_MENU_ITEMS_COLLECTION);
        const q = query(
            savedItemsRef,
            where('userId', '==', userId),
            where('menuItemId', '==', menuItemId)
        );

        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error('❌ Error checking if menu item is saved:', error);
        return false;
    }
};

/**
 * Get all saved menu items for a user
 */
export const getSavedMenuItems = async (
    userId: string
): Promise<SavedMenuItem[]> => {
    try {
        const savedItemsRef = collection(db, SAVED_MENU_ITEMS_COLLECTION);
        const q = query(
            savedItemsRef,
            where('userId', '==', userId),
            orderBy('savedAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const savedItems: SavedMenuItem[] = [];

        querySnapshot.forEach((doc) => {
            savedItems.push({
                saveId: doc.id,
                ...doc.data(),
            } as SavedMenuItem);
        });

        return savedItems;
    } catch (error) {
        console.error('❌ Error fetching saved menu items:', error);
        return [];
    }
};

/**
 * Subscribe to real-time updates for saved menu items
 */
export const subscribeSavedMenuItems = (
    userId: string,
    callback: (items: SavedMenuItem[]) => void
): Unsubscribe => {
    const savedItemsRef = collection(db, SAVED_MENU_ITEMS_COLLECTION);
    const q = query(
        savedItemsRef,
        where('userId', '==', userId),
        orderBy('savedAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
        const savedItems: SavedMenuItem[] = [];
        querySnapshot.forEach((doc) => {
            savedItems.push({
                saveId: doc.id,
                ...doc.data(),
            } as SavedMenuItem);
        });
        console.log('📥 Received saved menu items:', savedItems);
        callback(savedItems);
    }, (error) => {
        console.error('❌ Error in saved menu items subscription:', error);
        callback([]);
    });
};

/**
 * Toggle save/unsave a menu item
 */
export const toggleSaveMenuItem = async (
    userId: string,
    itemData: SaveMenuItemInput
): Promise<boolean> => {
    try {
        const isSaved = await isMenuItemSaved(userId, itemData.menuItemId);

        if (isSaved) {
            await unsaveMenuItem(userId, itemData.menuItemId);
            return false; // Now unsaved
        } else {
            await saveMenuItem(userId, itemData);
            return true; // Now saved
        }
    } catch (error) {
        console.error('❌ Error toggling save menu item:', error);
        throw error;
    }
};
