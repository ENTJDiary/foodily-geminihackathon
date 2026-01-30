import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../src/contexts/AuthContext';
import { MenuItem } from '../../../types';
import { subscribeRestaurantPosts, createCommunityPost, communityPostToMenuItem } from '../../../services/communityPostsService';
import UserAvatar from '../shared/UserAvatar';
import AddMenuItemModal from '../modals/AddMenuItemModal';
import MenuItemDetailModal from '../modals/MenuItemDetailModal';

interface CommunityMenuPageProps {
    restaurantId: string;
    restaurantName: string;
    selectedMenuItem: MenuItem | null;
    showAddDish: boolean;
    searchedDish?: string;
    onAddDishClick: () => void;
    onMenuItemClick: (item: MenuItem) => void;
    onCloseMenuItemDetail: () => void;
    onCloseAddDish: () => void;
}

const CommunityMenuPage: React.FC<CommunityMenuPageProps> = ({
    restaurantId,
    restaurantName,
    selectedMenuItem,
    showAddDish,
    searchedDish,
    onAddDishClick,
    onMenuItemClick,
    onCloseMenuItemDetail,
    onCloseAddDish,
}) => {
    const { currentUser: user, userProfile } = useAuth();
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Subscribe to real-time community posts from Firestore
    useEffect(() => {
        if (!restaurantId) return;

        const unsubscribe = subscribeRestaurantPosts(restaurantId, (fetchedPosts) => {
            // Convert CommunityPost[] to MenuItem[] for compatibility
            const items = fetchedPosts.map(communityPostToMenuItem);
            setMenuItems(items);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [restaurantId]);

    const handleSubmitMenuItem = async (data: {
        title: string;
        images: string[];
        dishes: { name: string; price: string; desc: string; rating: number }[];
        rating: number;
        experience: string;
    }) => {
        if (!user || !userProfile || submitting) return;

        setSubmitting(true);
        try {
            // Use first dish as primary name/description for backward compatibility
            const primaryDish = data.dishes[0] || { name: '', desc: '', price: '' };

            await createCommunityPost(
                user.uid,
                userProfile.displayName || 'Local Explorer',
                userProfile.profilePictureURL,
                {
                    restaurantId,
                    restaurantName,
                    title: data.title,
                    name: primaryDish.name,
                    description: primaryDish.desc,
                    price: primaryDish.price,
                    dishes: data.dishes.map(d => ({
                        name: d.name,
                        description: d.desc,
                        price: d.price,
                    })),
                    image: data.images.length > 0 ? data.images[0] : undefined,
                    images: data.images,
                    rating: data.rating,
                    experience: data.experience,
                }
            );
            onCloseAddDish();
        } catch (error) {
            console.error('Error submitting menu item:', error);
            alert('Failed to submit menu item. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };
    return (
        <>
            <section className="space-y-6">
                <div className="flex justify-between items-center px-2">
                    <div className="space-y-1">
                        <h3 className="font-black text-slate-900 uppercase tracking-widest text-[11px]">COMMUNITY MENU</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            Dishes recommended by local explorers
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            onAddDishClick();
                        }}
                        className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-95 transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                            <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4">
                    {menuItems.length === 0 ? (
                        <div className="p-12 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 text-center flex flex-col items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.082.477 4 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.082.477-4 1.253"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                The menu is empty. Start building it!
                            </p>
                            {searchedDish && (
                                <button
                                    onClick={onAddDishClick}
                                    className="text-[9px] font-black text-orange-600 bg-orange-50 px-4 py-2 rounded-full border border-orange-100 uppercase tracking-widest hover:bg-orange-100"
                                >
                                    Add "{searchedDish}"
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            {menuItems.map((item) => {
                                const displayLikes = item.likes ?? Math.floor(Math.random() * 50) + 1;

                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => onMenuItemClick(item)}
                                        className="flex flex-col gap-3 group cursor-pointer hover:bg-slate-50 p-2 rounded-2xl transition-all"
                                    >
                                        {/* Card Image */}
                                        <div className="w-full aspect-[3/4] bg-slate-100 rounded-2xl overflow-hidden relative shadow-sm border border-slate-100">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                    <span className="text-[10px] font-bold uppercase">No Photo</span>
                                                </div>
                                            )}

                                            {/* Multi-Image Indicator */}
                                            {item.images && item.images.length > 1 && (
                                                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 z-10">
                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                    <span className="text-[9px] font-bold text-white">{item.images.length}</span>
                                                </div>
                                            )}
                                            {/* Price Tag Overlay */}
                                            {item.price && (
                                                <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg">
                                                    <span className="text-[10px] font-bold text-white">{item.price}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Card Content */}
                                        <div className="px-1 space-y-1">
                                            {/* Post Title */}
                                            <h4 className="font-bold text-xs text-slate-900 leading-tight line-clamp-2">
                                                {item.title || item.name}
                                            </h4>

                                            {/* User Info Row */}
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center gap-1.5 overflow-hidden">
                                                    <UserAvatar userName={item.userName || 'U'} size="xs" />
                                                    <span className="text-[9px] font-medium text-slate-400 truncate">
                                                        {item.userName || 'Explorer'}
                                                    </span>
                                                </div>
                                                {item.likes > 0 && (
                                                    <div className="flex items-center gap-1 text-slate-400">
                                                        <svg
                                                            className="w-4 h-4"
                                                            fill="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                                            />
                                                        </svg>
                                                        <span className="text-[9px] font-medium">{displayLikes}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Modals */}
            {showAddDish && (
                <AddMenuItemModal
                    isOpen={true}
                    onClose={onCloseAddDish}
                    onSubmit={handleSubmitMenuItem}
                    searchedDish={searchedDish}
                    isSubmitting={submitting}
                />
            )}

            {selectedMenuItem && (
                <MenuItemDetailModal
                    menuItem={selectedMenuItem}
                    onClose={onCloseMenuItemDetail}
                    restaurantId={restaurantId}
                />
            )}
        </>
    );
};

export default CommunityMenuPage;
