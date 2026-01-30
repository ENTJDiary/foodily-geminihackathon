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
import { incrementReviewLikes } from './reviewsService';

const REVIEW_LIKES_COLLECTION = 'reviewLikes';

/**
 * Interface for review like data
 */
export interface ReviewLike {
    likeId: string;                 // Auto-generated document ID
    userId: string;                 // Reference to users/{uid}
    reviewId: string;               // Reference to reviews/{reviewId}
    restaurantId: string;           // Denormalized for queries
    createdAt: Timestamp;           // When the like was created
}

/**
 * Toggle like on a review (like if not liked, unlike if already liked)
 */
export const toggleReviewLike = async (
    userId: string,
    reviewId: string,
    restaurantId: string
): Promise<boolean> => {
    try {
        const isLiked = await isReviewLiked(userId, reviewId);

        if (isLiked) {
            // Unlike: find and delete the like document
            const reviewLikesRef = collection(db, REVIEW_LIKES_COLLECTION);
            const q = query(
                reviewLikesRef,
                where('userId', '==', userId),
                where('reviewId', '==', reviewId)
            );

            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                await deleteDoc(doc(db, REVIEW_LIKES_COLLECTION, querySnapshot.docs[0].id));
                // Decrement review likes count
                await incrementReviewLikes(reviewId, -1);
                console.log('✅ Review unliked successfully');
            }
            return false; // Now unliked
        } else {
            // Like: create a new like document
            const reviewLikesRef = collection(db, REVIEW_LIKES_COLLECTION);
            const newLike = {
                userId,
                reviewId,
                restaurantId,
                createdAt: serverTimestamp(),
            };

            await addDoc(reviewLikesRef, newLike);
            // Increment review likes count
            await incrementReviewLikes(reviewId, 1);
            console.log('✅ Review liked successfully');
            return true; // Now liked
        }
    } catch (error) {
        console.error('❌ Error toggling review like:', error);
        throw new Error('Failed to toggle review like');
    }
};

/**
 * Check if a user has liked a review
 */
export const isReviewLiked = async (
    userId: string,
    reviewId: string
): Promise<boolean> => {
    try {
        const reviewLikesRef = collection(db, REVIEW_LIKES_COLLECTION);
        const q = query(
            reviewLikesRef,
            where('userId', '==', userId),
            where('reviewId', '==', reviewId)
        );

        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error('❌ Error checking review like:', error);
        return false;
    }
};

/**
 * Get all likes for a review
 */
export const getReviewLikes = async (reviewId: string): Promise<ReviewLike[]> => {
    try {
        const reviewLikesRef = collection(db, REVIEW_LIKES_COLLECTION);
        const q = query(
            reviewLikesRef,
            where('reviewId', '==', reviewId)
        );

        const querySnapshot = await getDocs(q);
        const likes: ReviewLike[] = [];

        querySnapshot.forEach((doc) => {
            likes.push({
                likeId: doc.id,
                ...doc.data(),
            } as ReviewLike);
        });

        return likes;
    } catch (error) {
        console.error('❌ Error fetching review likes:', error);
        return [];
    }
};

/**
 * Get all reviews liked by a user
 */
export const getUserLikedReviews = async (userId: string): Promise<string[]> => {
    try {
        const reviewLikesRef = collection(db, REVIEW_LIKES_COLLECTION);
        const q = query(
            reviewLikesRef,
            where('userId', '==', userId)
        );

        const querySnapshot = await getDocs(q);
        const reviewIds: string[] = [];

        querySnapshot.forEach((doc) => {
            reviewIds.push((doc.data() as ReviewLike).reviewId);
        });

        return reviewIds;
    } catch (error) {
        console.error('❌ Error fetching user liked reviews:', error);
        return [];
    }
};
