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

const REVIEWS_COLLECTION = 'reviews';

/**
 * Interface for review data
 */
export interface Review {
    reviewId: string;               // Auto-generated document ID
    userId: string;                 // Reference to users/{uid}
    restaurantId: string;           // Reference to restaurants/{restaurantId}
    restaurantName: string;         // Denormalized restaurant name
    rating: number;                 // Rating (1-5 scale)
    comment: string;                // Review text
    userName: string;               // Denormalized user display name
    userPhoto?: string;             // Denormalized user profile picture
    photos?: string[];              // Review photos (up to 5)
    visitDate?: string;             // Date of visit (YYYY-MM-DD)
    likes: number;                  // Total likes count
    createdAt: Timestamp;           // Review creation timestamp
    updatedAt: Timestamp;           // Last update timestamp
}

/**
 * Input type for creating a review
 */
export interface CreateReviewInput {
    restaurantId: string;
    restaurantName: string;
    rating: number;
    comment: string;
    photos?: string[];
    visitDate?: string;
}

/**
 * Create a new review
 */
export const createReview = async (
    userId: string,
    userName: string,
    userPhoto: string | undefined,
    reviewData: CreateReviewInput
): Promise<Review> => {
    try {
        const reviewsRef = collection(db, REVIEWS_COLLECTION);

        const newReview = {
            userId,
            restaurantId: reviewData.restaurantId,
            restaurantName: reviewData.restaurantName,
            rating: reviewData.rating,
            comment: reviewData.comment,
            userName,
            userPhoto: userPhoto || null,
            photos: reviewData.photos || [],
            visitDate: reviewData.visitDate || null,
            likes: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        const docRef = await addDoc(reviewsRef, newReview);

        console.log('✅ Review created successfully:', docRef.id);

        return {
            reviewId: docRef.id,
            ...newReview,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        } as Review;
    } catch (error) {
        console.error('❌ Error creating review:', error);
        throw new Error('Failed to create review');
    }
};

/**
 * Get all reviews for a restaurant
 */
export const getRestaurantReviews = async (
    restaurantId: string,
    limitCount: number = 50
): Promise<Review[]> => {
    try {
        const reviewsRef = collection(db, REVIEWS_COLLECTION);
        const q = query(
            reviewsRef,
            where('restaurantId', '==', restaurantId),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        const reviews: Review[] = [];

        querySnapshot.forEach((doc) => {
            reviews.push({
                reviewId: doc.id,
                ...doc.data(),
            } as Review);
        });

        return reviews;
    } catch (error) {
        console.error('❌ Error fetching restaurant reviews:', error);
        return [];
    }
};

/**
 * Get all reviews by a user
 */
export const getUserReviews = async (
    userId: string,
    limitCount: number = 50
): Promise<Review[]> => {
    try {
        const reviewsRef = collection(db, REVIEWS_COLLECTION);
        const q = query(
            reviewsRef,
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        const reviews: Review[] = [];

        querySnapshot.forEach((doc) => {
            reviews.push({
                reviewId: doc.id,
                ...doc.data(),
            } as Review);
        });

        return reviews;
    } catch (error) {
        console.error('❌ Error fetching user reviews:', error);
        return [];
    }
};

/**
 * Update a review
 */
export const updateReview = async (
    reviewId: string,
    updates: {
        rating?: number;
        comment?: string;
        photos?: string[];
    }
): Promise<void> => {
    try {
        const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);

        await updateDoc(reviewRef, {
            ...updates,
            updatedAt: serverTimestamp(),
        });

        console.log('✅ Review updated successfully');
    } catch (error) {
        console.error('❌ Error updating review:', error);
        throw new Error('Failed to update review');
    }
};

/**
 * Delete a review
 */
export const deleteReview = async (reviewId: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, REVIEWS_COLLECTION, reviewId));
        console.log('✅ Review deleted successfully');
    } catch (error) {
        console.error('❌ Error deleting review:', error);
        throw new Error('Failed to delete review');
    }
};

/**
 * Subscribe to real-time updates for restaurant reviews
 */
export const subscribeRestaurantReviews = (
    restaurantId: string,
    callback: (reviews: Review[]) => void,
    limitCount: number = 50
): Unsubscribe => {
    const reviewsRef = collection(db, REVIEWS_COLLECTION);
    const q = query(
        reviewsRef,
        where('restaurantId', '==', restaurantId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
    );

    return onSnapshot(q, (querySnapshot) => {
        const reviews: Review[] = [];
        querySnapshot.forEach((doc) => {
            reviews.push({
                reviewId: doc.id,
                ...doc.data(),
            } as Review);
        });
        callback(reviews);
    }, (error) => {
        console.error('❌ Error in reviews subscription:', error);
        callback([]);
    });
};

/**
 * Increment likes count for a review (internal use - Cloud Function should handle this)
 * This is a helper function, actual like counting should be done via Cloud Functions
 */
export const incrementReviewLikes = async (reviewId: string, increment: number): Promise<void> => {
    try {
        const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
        const reviewDoc = await getDocs(query(collection(db, REVIEWS_COLLECTION), where('__name__', '==', reviewId)));

        if (!reviewDoc.empty) {
            const currentLikes = (reviewDoc.docs[0].data() as Review).likes || 0;
            const newLikes = currentLikes + increment;

            await updateDoc(reviewRef, {
                likes: newLikes < 0 ? 0 : newLikes,
            });
            console.log(`✅ Updated review likes: ${newLikes}`);
        } else {
            console.error('❌ Review not found for incrementing likes:', reviewId);
        }
    } catch (error) {
        console.error('❌ Error updating review likes:', error);
    }
};
