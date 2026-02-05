import React, { useState, useEffect } from 'react';
import { useAuth } from '../../src/contexts/AuthContext';
import {
    subscribeSavedRestaurants,
    unsaveRestaurant,
    SavedRestaurant
} from '../../services/savedRestaurantsService';
import {
    subscribeSavedMenuItems,
    unsaveMenuItem,
    SavedMenuItem
} from '../../services/savedMenuItemsService';
import RestaurantModal from '../../components/common/RestaurantModal';

const SavedSection: React.FC = () => {
    const { currentUser: user } = useAuth();
    const [savedRestaurants, setSavedRestaurants] = useState<SavedRestaurant[]>([]);
    const [savedMenuItems, setSavedMenuItems] = useState<SavedMenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRestaurant, setSelectedRestaurant] = useState<{ id: string; name: string; postId?: string } | null>(null);

    // Subscribe to saved restaurants from Firestore
    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const unsubscribeRestaurants = subscribeSavedRestaurants(user.uid, (restaurants) => {
            console.log('📥 Received saved restaurants:', restaurants);
            setSavedRestaurants(restaurants);
            setLoading(false);
        });

        const unsubscribeMenuItems = subscribeSavedMenuItems(user.uid, (items) => {
            console.log('📥 Received saved menu items:', items);
            setSavedMenuItems(items);
        });

        return () => {
            unsubscribeRestaurants();
            unsubscribeMenuItems();
        };
    }, [user]);

    const handleUnsaveRestaurant = async (restaurantId: string) => {
        if (!user) return;

        try {
            await unsaveRestaurant(user.uid, restaurantId);
            // No need to update state - the subscription will handle it
        } catch (error) {
            console.error('Error unsaving restaurant:', error);
            alert('Failed to unsave restaurant. Please try again.');
        }
    };

    const handleUnsaveMenuItem = async (menuItemId: string) => {
        if (!user) return;

        try {
            await unsaveMenuItem(user.uid, menuItemId);
            // No need to update state - the subscription will handle it
        } catch (error) {
            console.error('Error unsaving menu item:', error);
            alert('Failed to unsave menu item. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 mx-auto border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
                    <p className="text-sm text-slate-400 font-medium">Loading saved items...</p>
                </div>
            </div>
        );
    }

    if (savedRestaurants.length === 0 && savedMenuItems.length === 0) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto bg-orange-50 rounded-2xl flex items-center justify-center">
                        <svg className="w-10 h-10 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">No Saved Items</h3>
                    <p className="text-sm text-slate-400 font-medium">Start exploring and save your favorites!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Saved Restaurants Section */}
            <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">Saved Restaurants</h3>
                {savedRestaurants.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-sm text-slate-400 font-medium">No saved restaurants yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {savedRestaurants.map((restaurant) => (
                            <div
                                key={restaurant.saveId}
                                onClick={() => setSelectedRestaurant({
                                    id: restaurant.restaurantId,
                                    name: restaurant.restaurantName
                                })}
                                className="group relative bg-white border-2 border-slate-200 rounded-2xl overflow-hidden hover:border-orange-400 hover:shadow-xl transition-all cursor-pointer"
                            >
                                {/* Image */}
                                {restaurant.restaurantPhoto ? (
                                    <div className="aspect-square bg-slate-100 overflow-hidden">
                                        <img
                                            src={restaurant.restaurantPhoto}
                                            alt={restaurant.restaurantName}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    </div>
                                ) : (
                                    <div className="aspect-square bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                                        <svg className="w-16 h-16 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                )}

                                {/* Content */}
                                <div className="p-4 flex flex-col h-[120px]">
                                    <h4 className="text-sm font-black text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                                        {restaurant.restaurantName}
                                    </h4>
                                    {restaurant.cuisineTypes && restaurant.cuisineTypes.length > 0 && (
                                        <p className="text-xs text-slate-600 font-medium">{restaurant.cuisineTypes.join(', ')}</p>
                                    )}
                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <svg
                                                    key={i}
                                                    className={`w-3 h-3 ${restaurant.rating && i < restaurant.rating ? 'text-orange-500' : 'text-slate-200'}`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>

                                        {/* Bookmark/Save Icon - Click to unsave */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleUnsaveRestaurant(restaurant.restaurantId);
                                            }}
                                            className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center hover:bg-orange-100 transition-colors"
                                            title="Unsave restaurant"
                                        >
                                            <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Saved Menu Items Section */}
            <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">Saved Posts</h3>
                {savedMenuItems.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-sm text-slate-400 font-medium">No saved posts yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {savedMenuItems.map((item) => (
                            <div
                                key={item.saveId}
                                onClick={() => setSelectedRestaurant({
                                    id: item.restaurantId,
                                    name: item.restaurantName,
                                    postId: item.menuItemId
                                })}
                                className="group relative bg-white border-2 border-slate-200 rounded-2xl overflow-hidden hover:border-orange-400 hover:shadow-xl transition-all cursor-pointer"
                            >
                                {/* Image */}
                                {item.image ? (
                                    <div className="aspect-square bg-slate-100 overflow-hidden">
                                        <img
                                            src={item.image}
                                            alt={item.title}
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
                                        {item.title}
                                    </h4>
                                    <p className="text-xs text-slate-600 font-medium">{item.restaurantName}</p>

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center gap-2">
                                            {item.rating && (
                                                <div className="flex items-center gap-1">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <svg
                                                            key={i}
                                                            className={`w-3 h-3 ${i < item.rating! ? 'text-orange-500' : 'text-slate-200'}`}
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    ))}
                                                </div>
                                            )}
                                            {item.price && (
                                                <span className="text-xs font-bold text-orange-600">{item.price}</span>
                                            )}
                                        </div>

                                        {/* Bookmark/Save Icon - Click to unsave */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleUnsaveMenuItem(item.menuItemId);
                                            }}
                                            className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center hover:bg-orange-100 transition-colors"
                                            title="Unsave post"
                                        >
                                            <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Restaurant Modal */}
            {selectedRestaurant && (
                <RestaurantModal
                    restaurantId={selectedRestaurant.id}
                    restaurantName={selectedRestaurant.name}
                    initialPostId={selectedRestaurant.postId}
                    onClose={() => setSelectedRestaurant(null)}
                />
            )}
        </div>
    );
};

export default SavedSection;
