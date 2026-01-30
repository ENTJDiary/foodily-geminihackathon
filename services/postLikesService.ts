import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    deleteDoc,
    doc,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../src/firebase/config';

const POST_LIKES_COLLECTION = 'postLikes';

/**
 * Interface for post like data
 */
export interface PostLike {
    likeId: string;                 // Auto-generated document ID
    userId: string;                 // Reference to users/{uid}
    postId: string;                 // Reference to communityPosts/{postId}
    restaurantId: string;           // Denormalized for queries
    createdAt: Timestamp;           // When the like was created
}

/**
 * Toggle like on a post (like if not liked, unlike if already liked)
 */
export const togglePostLike = async (
    userId: string,
    postId: string,
    restaurantId: string
): Promise<boolean> => {
    try {
        const isLiked = await isPostLiked(userId, postId);

        if (isLiked) {
            // Unlike: find and delete the like document
            const postLikesRef = collection(db, POST_LIKES_COLLECTION);
            const q = query(
                postLikesRef,
                where('userId', '==', userId),
                where('postId', '==', postId)
            );

            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                await deleteDoc(doc(db, POST_LIKES_COLLECTION, querySnapshot.docs[0].id));
                console.log('✅ Post unliked successfully');
            }
            return false; // Now unliked
        } else {
            // Like: create a new like document
            const postLikesRef = collection(db, POST_LIKES_COLLECTION);
            const newLike = {
                userId,
                postId,
                restaurantId,
                createdAt: serverTimestamp(),
            };

            await addDoc(postLikesRef, newLike);
            console.log('✅ Post liked successfully');
            return true; // Now liked
        }
    } catch (error) {
        console.error('❌ Error toggling post like:', error);
        throw new Error('Failed to toggle post like');
    }
};

/**
 * Check if a user has liked a post
 */
export const isPostLiked = async (
    userId: string,
    postId: string
): Promise<boolean> => {
    try {
        const postLikesRef = collection(db, POST_LIKES_COLLECTION);
        const q = query(
            postLikesRef,
            where('userId', '==', userId),
            where('postId', '==', postId)
        );

        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error('❌ Error checking post like:', error);
        return false;
    }
};

/**
 * Get all likes for a post
 */
export const getPostLikes = async (postId: string): Promise<PostLike[]> => {
    try {
        const postLikesRef = collection(db, POST_LIKES_COLLECTION);
        const q = query(
            postLikesRef,
            where('postId', '==', postId)
        );

        const querySnapshot = await getDocs(q);
        const likes: PostLike[] = [];

        querySnapshot.forEach((doc) => {
            likes.push({
                likeId: doc.id,
                ...doc.data(),
            } as PostLike);
        });

        return likes;
    } catch (error) {
        console.error('❌ Error fetching post likes:', error);
        return [];
    }
};

/**
 * Get all posts liked by a user
 */
export const getUserLikedPosts = async (userId: string): Promise<string[]> => {
    try {
        const postLikesRef = collection(db, POST_LIKES_COLLECTION);
        const q = query(
            postLikesRef,
            where('userId', '==', userId)
        );

        const querySnapshot = await getDocs(q);
        const postIds: string[] = [];

        querySnapshot.forEach((doc) => {
            postIds.push((doc.data() as PostLike).postId);
        });

        return postIds;
    } catch (error) {
        console.error('❌ Error fetching user liked posts:', error);
        return [];
    }
};

/**
 * Get liked posts with full post details
 */
export const getUserLikedPostsWithDetails = async (userId: string): Promise<any[]> => {
    try {
        const postLikesRef = collection(db, POST_LIKES_COLLECTION);
        const q = query(
            postLikesRef,
            where('userId', '==', userId)
        );

        const querySnapshot = await getDocs(q);
        const likedPostsData: any[] = [];

        // Fetch full post details for each liked post
        for (const likeDoc of querySnapshot.docs) {
            const likeData = likeDoc.data() as PostLike;

            try {
                // Fetch the actual community post
                const postDoc = await getDocs(
                    query(
                        collection(db, 'communityPosts'),
                        where('__name__', '==', likeData.postId)
                    )
                );

                if (!postDoc.empty) {
                    const postData = postDoc.docs[0].data();
                    likedPostsData.push({
                        id: likeData.postId,
                        postId: likeData.postId,
                        restaurantId: likeData.restaurantId,
                        likedAt: likeData.createdAt,
                        // Include full post details
                        ...postData
                    });
                }
            } catch (postError) {
                console.error(`Error fetching post ${likeData.postId}:`, postError);
            }
        }

        console.log('✅ Fetched liked posts with details:', likedPostsData.length);
        return likedPostsData;
    } catch (error) {
        console.error('❌ Error fetching user liked posts with details:', error);
        return [];
    }
};

