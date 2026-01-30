import React, { useState, useEffect } from 'react';
import { useAuth } from '../../src/contexts/AuthContext';
import { subscribeClickedRestaurants } from '../../services/restaurantClicksService';
import { getUserReviews } from '../../services/reviewsService';
import { getUserLikedPostsWithDetails } from '../../services/postLikesService';
import WeeklyFoodHunt from '../../components/features/WeeklyFoodHunt';

const ActivitySection: React.FC = () => {
    const { currentUser } = useAuth();
    const [clickedRestaurants, setClickedRestaurants] = useState<{
        id: string;
        name: string;
        photo?: string;
        cuisineTypes?: string[];
        timestamp: number;
        source: string;
    }[]>([]);
    const [userComments, setUserComments] = useState<any[]>([]);
    const [likedPosts, setLikedPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) {
            console.log('⚠️ No user found in ActivitySection');
            setLoading(false);
            return;
        }

        console.log('👤 User found:', currentUser.uid);

        const fetchData = async () => {
            try {
                console.log('🔄 Fetching user reviews...');
                // Fetch user reviews/comments
                const reviews = await getUserReviews(currentUser.uid);
                console.log('📥 User reviews fetched:', reviews.length, reviews);
                setUserComments(reviews);

                console.log('🔄 Fetching liked posts...');
                // Fetch liked posts
                const liked = await getUserLikedPostsWithDetails(currentUser.uid);
                console.log('📥 Liked posts:', liked.length, liked);
                setLikedPosts(liked);
            } catch (error) {
                console.error('❌ Error fetching activity data:', error);
            } finally {
                setLoading(false);
            }
        };

        // Subscribe to clicked restaurants
        console.log('🔄 Subscribing to clicked restaurants...');
        const unsubscribe = subscribeClickedRestaurants(currentUser.uid, (restaurants) => {
            console.log('📥 Clicked restaurants update:', restaurants.length, restaurants);
            setClickedRestaurants(restaurants);
        });

        fetchData();

        return () => {
            console.log('🔌 Unsubscribing from clicked restaurants');
            unsubscribe();
        };
    }, [currentUser]);

    if (loading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm">
                    <p className="text-sm text-slate-400 text-center">Loading activity...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Weekly Food Hunt */}
            <WeeklyFoodHunt />

            {/* Cuisine Explored - Now showing clicked restaurants */}
            <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">Cuisine Explored</h3>
                {clickedRestaurants.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-sm text-slate-400 font-medium">No restaurants explored yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {clickedRestaurants.map((restaurant, idx) => (
                            <div
                                key={`${restaurant.id}-${idx}`}
                                className="group relative bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-5 hover:border-orange-300 hover:shadow-lg transition-all cursor-pointer"
                            >
                                {restaurant.photo && (
                                    <div className="mb-3 aspect-video rounded-xl overflow-hidden bg-slate-100">
                                        <img
                                            src={restaurant.photo}
                                            alt={restaurant.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                )}
                                <div className="flex flex-col gap-2">
                                    <h4 className="text-sm font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                                        {restaurant.name}
                                    </h4>
                                    {restaurant.cuisineTypes && restaurant.cuisineTypes.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {restaurant.cuisineTypes.slice(0, 2).map((cuisine, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-[9px] font-black uppercase tracking-wider"
                                                >
                                                    {cuisine}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {/* Checkmark icon */}
                                <div className="absolute top-4 right-4 w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Insights Provided (formerly Comments) */}
            <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">Insights Provided</h3>
                {userComments.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-sm text-slate-400 font-medium">No insights provided yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {userComments.map((comment, idx) => (
                            <div
                                key={`${comment.reviewId || comment.id}-${idx}`}
                                className="group relative bg-white border-2 border-slate-200 rounded-2xl p-5 hover:border-orange-400 hover:shadow-xl transition-all cursor-pointer overflow-hidden"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <h4 className="text-sm font-black text-slate-900 group-hover:text-orange-600 transition-colors flex-1">
                                            {comment.restaurantName}
                                        </h4>
                                    </div>

                                    {/* Star Rating */}
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <svg
                                                key={i}
                                                className={`w-4 h-4 ${i < comment.rating ? 'text-orange-500' : 'text-slate-200'}`}
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>

                                    {/* Comment Text */}
                                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">
                                        <p className="text-xs text-slate-700 italic">"{comment.comment}"</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Liked Posts */}
            <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">Liked Posts</h3>
                {likedPosts.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-sm text-slate-400 font-medium">No liked posts yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {likedPosts.map((post, idx) => (
                            <div
                                key={`${post.postId || post.id}-${idx}`}
                                className="group relative bg-white border-2 border-slate-200 rounded-2xl overflow-hidden hover:border-orange-400 hover:shadow-xl transition-all cursor-pointer"
                            >
                                {/* Image */}
                                {post.image ? (
                                    <div className="aspect-square bg-slate-100 overflow-hidden">
                                        <img
                                            src={post.image}
                                            alt={post.restaurantName}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    </div>
                                ) : (
                                    <div className="aspect-square bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                                        <svg className="w-16 h-16 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}

                                {/* Content */}
                                <div className="p-4 space-y-2">
                                    <h4 className="text-sm font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                                        {post.restaurantName || post.title}
                                    </h4>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-slate-500 font-medium">{post.userName}</span>
                                        {/* Heart Icon */}
                                        <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivitySection;
