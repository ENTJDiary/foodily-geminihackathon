import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../src/contexts/AuthContext';
import { MenuItem } from '../../../types';
import { togglePostLike, isPostLiked } from '../../../services/postLikesService';
import { toggleSaveMenuItem, isMenuItemSaved } from '../../../services/savedMenuItemsService';
import PriceTag from '../shared/PriceTag';
import UserAvatar from '../shared/UserAvatar';

interface MenuItemDetailModalProps {
    menuItem: MenuItem | null;
    onClose: () => void;
    restaurantId?: string;
}

const MenuItemDetailModal: React.FC<MenuItemDetailModalProps> = ({ menuItem, onClose, restaurantId }) => {
    const { currentUser: user } = useAuth();
    const [activeImage, setActiveImage] = useState<string | null>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [isLiking, setIsLiking] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (menuItem) {
            setActiveImage(menuItem.image || (menuItem.images && menuItem.images[0]) || null);
            setLikeCount(menuItem.likes || 0);

            // Check if user has liked this post
            if (user && menuItem.id) {
                isPostLiked(user.uid, menuItem.id).then(setIsLiked);
                isMenuItemSaved(user.uid, menuItem.id).then(setIsSaved);
            }
        }
    }, [menuItem, user]);

    const handleToggleLike = async () => {
        if (!user || !menuItem || !restaurantId || isLiking) return;

        setIsLiking(true);
        try {
            const nowLiked = await togglePostLike(user.uid, menuItem.id, restaurantId);
            setIsLiked(nowLiked);
            setLikeCount(prev => nowLiked ? prev + 1 : prev - 1);
        } catch (error) {
            console.error('Error toggling like:', error);
        } finally {
            setIsLiking(false);
        }
    };

    const handleToggleSave = async () => {
        if (!user || !menuItem || isSaving) return;

        setIsSaving(true);
        try {
            if (!restaurantId) {
                console.error("❌ Missing restaurantId for saving");
                return;
            }

            const nowSaved = await toggleSaveMenuItem(user.uid, {
                menuItemId: menuItem.id,
                restaurantId: restaurantId,
                restaurantName: menuItem.userName || 'Unknown Restaurant',
                title: menuItem.title || menuItem.name,
                image: menuItem.image || (menuItem.images && menuItem.images[0]),
                price: menuItem.price,
                rating: menuItem.rating
            });
            setIsSaved(nowSaved);
        } catch (error) {
            console.error('❌ Error toggling save:', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!menuItem) return null;

    return (
        <div
            className="fixed inset-0 z-[130] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-5xl h-[600px] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-orange-50 flex flex-col md:flex-row"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Left Column: Image Gallery */}
                <div className="w-full md:w-1/2 bg-slate-100 relative group flex flex-col h-full">
                    <div className="relative flex-1 overflow-hidden h-full">
                        {activeImage ? (
                            <img src={activeImage} alt={menuItem.name} className="w-full h-full object-cover transition-all duration-300" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span className="text-xs font-bold uppercase">No Photo</span>
                            </div>
                        )}
                        <button
                            onClick={onClose}
                            className="absolute top-6 left-6 p-3 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-colors md:hidden"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                                <path d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Thumbnails Strip */}
                    {menuItem.images && menuItem.images.length > 1 && (
                        <div className="h-24 bg-white border-t border-slate-100 p-3 overflow-x-auto flex gap-2 snap-x shrink-0">
                            {menuItem.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(img)}
                                    className={`flex-shrink-0 h-full aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImage === img ? 'border-orange-500 scale-95' : 'border-transparent hover:border-orange-200'
                                        }`}
                                >
                                    <img src={img} className="w-full h-full object-cover" alt={`Thumbnail ${idx + 1}`} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Details */}
                <div className="w-full md:w-1/2 flex flex-col h-full bg-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-colors hidden md:block z-10"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                            <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <div className="p-8 md:p-10 flex-1 overflow-y-auto space-y-6">
                        {/* Post Title */}
                        <div className="space-y-2 pt-2">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                                    {menuItem.title || menuItem.name}
                                </h2>
                                {/* Share Button */}
                                <button className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-all">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* User Profile Header */}
                        <div className="flex items-center gap-2">
                            <UserAvatar userName={menuItem.userName || 'U'} size="sm" />
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[9px]">
                                    {menuItem.userName || 'Local Explorer'}
                                </h4>
                                <span className="text-slate-300">•</span>
                                <span className="text-[8px] font-medium text-slate-400 uppercase tracking-wide">Just Now</span>
                            </div>
                        </div>

                        {/* Star Rating Display */}
                        {menuItem.rating && (
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <svg
                                            key={star}
                                            className={`w-4 h-4 ${menuItem.rating! >= star ? 'text-orange-500 fill-current' : 'text-slate-200 fill-current'}`}
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                    ))}
                                </div>
                                <span className="text-xs font-bold text-slate-600">{menuItem.rating}/5</span>
                            </div>
                        )}

                        {/* Experience/Captions Section */}
                        {menuItem.experience && (
                            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                                <h3 className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2">Experience</h3>
                                <p className="text-sm text-slate-700 leading-relaxed font-medium">{menuItem.experience}</p>
                            </div>
                        )}

                        <div className="w-full h-px bg-slate-100"></div>

                        {/* Dishes List */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ordered Items</h3>

                            {/* Multi-Dish Rendering */}
                            {menuItem.dishes && menuItem.dishes.length > 0 ? (
                                menuItem.dishes.map((dish, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-slate-50 rounded-2xl p-5 border border-slate-100 group hover:border-orange-200 transition-colors"
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="text-base font-black text-slate-900">{dish.name}</h3>
                                            {dish.price && <PriceTag price={dish.price} />}
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed font-medium">{dish.description}</p>
                                    </div>
                                ))
                            ) : (
                                // Legacy Single Dish Rendering
                                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="text-base font-black text-slate-900">{menuItem.name}</h3>
                                        {menuItem.price && <PriceTag price={menuItem.price} />}
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{menuItem.description}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4 mt-auto">
                            <button
                                onClick={handleToggleLike}
                                disabled={!user || isLiking}
                                className={`flex-1 border-2 font-bold py-4 rounded-xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 group ${isLiked
                                    ? 'bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600'
                                    : 'bg-white border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                <svg
                                    className={`w-4 h-4 group-hover:scale-110 transition-transform ${isLiked ? 'fill-current' : ''}`}
                                    fill={isLiked ? 'currentColor' : 'none'}
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                {isLiked ? 'Liked' : 'Like'}
                                {likeCount > 0 && (
                                    <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs font-black">
                                        {likeCount}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={handleToggleSave}
                                disabled={!user || isSaving}
                                className={`flex-1 font-bold py-4 rounded-xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 group ${isSaved
                                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                                    : 'bg-orange-50 text-orange-600 hover:bg-orange-100 border-2 border-orange-200'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                <svg
                                    className={`w-4 h-4 group-hover:scale-110 transition-transform ${isSaved ? 'fill-current' : ''}`}
                                    fill={isSaved ? 'currentColor' : 'none'}
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                                {isSaved ? 'Saved' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MenuItemDetailModal;
