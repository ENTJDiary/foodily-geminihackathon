import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    limit,
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
import { MenuItem, DishDetail } from '../types';

const COMMUNITY_POSTS_COLLECTION = 'communityPosts';

/**
 * Interface for community post (menu item) data
 */
export interface CommunityPost {
    postId: string;                 // Auto-generated document ID
    userId: string;                 // Reference to users/{uid}
    restaurantId: string;           // Reference to restaurants/{restaurantId}
    restaurantName: string;         // Denormalized restaurant name
    title?: string;                 // Social post title
    userName: string;               // Denormalized user display name
    userPhoto?: string;             // Denormalized user profile picture

    // Menu item details
    name: string;                   // Primary dish name (legacy)
    description: string;            // Primary dish description (legacy)
    price?: string;                 // Primary dish price (legacy)

    // Multi-dish support
    dishes?: DishDetail[];          // Array of dishes in this post

    // Media
    image?: string;                 // Primary image URL
    images?: string[];              // Up to 12 images

    // Metadata
    rating?: number;                // Overall rating (1-5)
    experience?: string;            // User's experience/caption
    likes: number;                  // Total likes count

    createdAt: Timestamp;           // Post creation timestamp
    updatedAt: Timestamp;           // Last update timestamp
}

/**
 * Input type for creating a community post
 */
export interface CreateCommunityPostInput {
    restaurantId: string;
    restaurantName: string;
    title?: string;
    name: string;
    description: string;
    price?: string;
    dishes?: DishDetail[];
    image?: string;
    images?: string[];
    rating?: number;
    experience?: string;
}

/**
 * Create a new community post (menu item)
 */
export const createCommunityPost = async (
    userId: string,
    userName: string,
    userPhoto: string | undefined,
    postData: CreateCommunityPostInput
): Promise<CommunityPost> => {
    try {
        const communityPostsRef = collection(db, COMMUNITY_POSTS_COLLECTION);

        const newPost = {
            userId,
            restaurantId: postData.restaurantId,
            restaurantName: postData.restaurantName,
            title: postData.title || '',
            userName,
            userPhoto: userPhoto || null,
            name: postData.name,
            description: postData.description,
            price: postData.price || null,
            dishes: postData.dishes || [],
            image: postData.image || null,
            images: postData.images || [],
            rating: postData.rating || null,
            experience: postData.experience || '',
            likes: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        const docRef = await addDoc(communityPostsRef, newPost);

        console.log('✅ Community post created successfully:', docRef.id);

        return {
            postId: docRef.id,
            ...newPost,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        } as CommunityPost;
    } catch (error) {
        console.error('❌ Error creating community post:', error);
        throw new Error('Failed to create community post');
    }
};

/**
 * Get all community posts for a restaurant
 */
export const getRestaurantPosts = async (
    restaurantId: string,
    limitCount: number = 50
): Promise<CommunityPost[]> => {
    try {
        const communityPostsRef = collection(db, COMMUNITY_POSTS_COLLECTION);
        const q = query(
            communityPostsRef,
            where('restaurantId', '==', restaurantId),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        const posts: CommunityPost[] = [];

        querySnapshot.forEach((doc) => {
            posts.push({
                postId: doc.id,
                ...doc.data(),
            } as CommunityPost);
        });

        return posts;
    } catch (error) {
        console.error('❌ Error fetching restaurant posts:', error);
        return [];
    }
};

/**
 * Get all posts by a user
 */
export const getUserPosts = async (
    userId: string,
    limitCount: number = 50
): Promise<CommunityPost[]> => {
    try {
        const communityPostsRef = collection(db, COMMUNITY_POSTS_COLLECTION);
        const q = query(
            communityPostsRef,
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        const posts: CommunityPost[] = [];

        querySnapshot.forEach((doc) => {
            posts.push({
                postId: doc.id,
                ...doc.data(),
            } as CommunityPost);
        });

        return posts;
    } catch (error) {
        console.error('❌ Error fetching user posts:', error);
        return [];
    }
};

/**
 * Update a community post
 */
export const updateCommunityPost = async (
    postId: string,
    updates: {
        title?: string;
        description?: string;
        experience?: string;
        rating?: number;
    }
): Promise<void> => {
    try {
        const postRef = doc(db, COMMUNITY_POSTS_COLLECTION, postId);

        await updateDoc(postRef, {
            ...updates,
            updatedAt: serverTimestamp(),
        });

        console.log('✅ Community post updated successfully');
    } catch (error) {
        console.error('❌ Error updating community post:', error);
        throw new Error('Failed to update community post');
    }
};

/**
 * Delete a community post
 */
export const deleteCommunityPost = async (postId: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, COMMUNITY_POSTS_COLLECTION, postId));
        console.log('✅ Community post deleted successfully');
    } catch (error) {
        console.error('❌ Error deleting community post:', error);
        throw new Error('Failed to delete community post');
    }
};

/**
 * Subscribe to real-time updates for restaurant posts
 */
export const subscribeRestaurantPosts = (
    restaurantId: string,
    callback: (posts: CommunityPost[]) => void,
    limitCount: number = 50
): Unsubscribe => {
    const communityPostsRef = collection(db, COMMUNITY_POSTS_COLLECTION);
    const q = query(
        communityPostsRef,
        where('restaurantId', '==', restaurantId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
    );

    return onSnapshot(q, (querySnapshot) => {
        const posts: CommunityPost[] = [];
        querySnapshot.forEach((doc) => {
            posts.push({
                postId: doc.id,
                ...doc.data(),
            } as CommunityPost);
        });
        callback(posts);
    }, (error) => {
        console.error('❌ Error in community posts subscription:', error);
        callback([]);
    });
};

/**
 * Convert CommunityPost to MenuItem format for backward compatibility
 */
export const communityPostToMenuItem = (post: CommunityPost): MenuItem => {
    return {
        id: post.postId,
        title: post.title,
        name: post.name,
        description: post.description,
        price: post.price,
        image: post.image || (post.images && post.images.length > 0 ? post.images[0] : undefined),
        images: post.images,
        dishes: post.dishes,
        userName: post.userName,
        timestamp: post.createdAt?.toMillis() || Date.now(),
        likes: post.likes,
        isLiked: false, // This will be determined by checking postLikes collection
        rating: post.rating,
        experience: post.experience,
    };
};
