import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../../src/contexts/AuthContext';
import { uploadProfilePicture, formatDateOfBirth, calculateAge } from '../../services/userDataService';
import { getUserPosts, CommunityPost, communityPostToMenuItem } from '../../services/communityPostsService';
import MenuItemDetailModal from '../../components/restaurant/modals/MenuItemDetailModal';
import { MenuItem } from '../../types';

interface LegacyUserProfile {
    name: string;
    email: string;
    favoriteCuisines: string[];
    dietaryRestrictions: string[];
    darkMode: boolean;
}

interface AccountDetailsProps {
    profile: LegacyUserProfile;
    isEditingName: boolean;
    tempName: string;
    setTempName: (name: string) => void;
    setIsEditingName: (editing: boolean) => void;
    handleSaveName: () => void;
    isAddingCuisine: boolean;
    customCuisine: string;
    setCustomCuisine: (cuisine: string) => void;
    setIsAddingCuisine: (adding: boolean) => void;
    handleAddCustomCuisine: () => void;
    isAddingDietary: boolean;
    customDietary: string;
    setCustomDietary: (dietary: string) => void;
    setIsAddingDietary: (adding: boolean) => void;
    handleAddCustomDietary: () => void;
    // Debounced update handlers
    onUpdateCuisines: (cuisines: string[]) => void;
    onUpdateDietary: (dietary: string[]) => void;
}

const CUISINE_OPTIONS = ['Italian', 'Japanese', 'Mexican', 'Indian', 'Chinese', 'Thai', 'Greek', 'French', 'Korean', 'Vietnamese'];
const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Halal', 'Kosher', 'Nut-Free'];

const AccountDetails: React.FC<AccountDetailsProps> = ({
    profile,
    isEditingName,
    tempName,
    setTempName,
    setIsEditingName,
    handleSaveName,
    isAddingCuisine,
    customCuisine,
    setCustomCuisine,
    setIsAddingCuisine,
    handleAddCustomCuisine,
    isAddingDietary,
    customDietary,
    setCustomDietary,
    setIsAddingDietary,
    handleAddCustomDietary,
    onUpdateCuisines,
    onUpdateDietary,
}) => {
    const { userProfile, userPreferences, currentUser } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingPicture, setUploadingPicture] = useState(false);
    const [userPosts, setUserPosts] = useState<CommunityPost[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [selectedPost, setSelectedPost] = useState<MenuItem | null>(null);

    // Local state for debouncing
    const [localCuisines, setLocalCuisines] = useState<string[]>(profile.favoriteCuisines);
    const [localDietary, setLocalDietary] = useState<string[]>(profile.dietaryRestrictions);
    const cuisineTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const dietaryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Sync local state with props when props change
    useEffect(() => {
        setLocalCuisines(profile.favoriteCuisines);
    }, [profile.favoriteCuisines]);

    useEffect(() => {
        setLocalDietary(profile.dietaryRestrictions);
    }, [profile.dietaryRestrictions]);

    // Cleanup timeouts
    useEffect(() => {
        return () => {
            if (cuisineTimeoutRef.current) clearTimeout(cuisineTimeoutRef.current);
            if (dietaryTimeoutRef.current) clearTimeout(dietaryTimeoutRef.current);
        };
    }, []);

    const handleToggleCuisine = (cuisine: string) => {
        const newCuisines = localCuisines.includes(cuisine)
            ? localCuisines.filter(c => c !== cuisine)
            : [...localCuisines, cuisine];

        setLocalCuisines(newCuisines);

        if (cuisineTimeoutRef.current) clearTimeout(cuisineTimeoutRef.current);
        cuisineTimeoutRef.current = setTimeout(() => {
            onUpdateCuisines(newCuisines);
        }, 1000); // 1 second debounce
    };

    const handleToggleDietary = (diet: string) => {
        const newDietary = localDietary.includes(diet)
            ? localDietary.filter(d => d !== diet)
            : [...localDietary, diet];

        setLocalDietary(newDietary);

        if (dietaryTimeoutRef.current) clearTimeout(dietaryTimeoutRef.current);
        dietaryTimeoutRef.current = setTimeout(() => {
            onUpdateDietary(newDietary);
        }, 1000); // 1 second debounce
    };

    // Get profile picture URL (custom or Google photo)
    const profilePictureURL = userProfile?.profilePictureURL || currentUser?.photoURL;

    // Fetch user's community posts
    useEffect(() => {
        const fetchUserPosts = async () => {
            if (!currentUser) {
                setLoadingPosts(false);
                return;
            }

            try {
                const posts = await getUserPosts(currentUser.uid, 10); // Limit to 10 posts
                setUserPosts(posts);
            } catch (error) {
                console.error('Error fetching user posts:', error);
            } finally {
                setLoadingPosts(false);
            }
        };

        fetchUserPosts();
    }, [currentUser]);

    const handleProfilePictureClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !currentUser) return;

        try {
            setUploadingPicture(true);
            await uploadProfilePicture(currentUser.uid, file);
            // Profile will be updated automatically via AuthContext
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            alert('Failed to upload profile picture. Please try again.');
        } finally {
            setUploadingPicture(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* User Profile Card */}
            <div className="glass-panel p-6 md:p-8 rounded-3xl shadow-sm">
                <div className="flex items-start gap-6">
                    {/* Avatar */}
                    <div
                        className="relative w-24 h-24 bg-gradient-to-br from-brand-orange/20 to-brand-orange/40 rounded-2xl flex items-center justify-center text-brand-orange text-3xl font-black shadow-inner border border-brand-orange/20 cursor-pointer hover:opacity-80 transition-opacity group"
                        onClick={handleProfilePictureClick}
                    >
                        {profilePictureURL ? (
                            <>
                                <img src={profilePictureURL} alt="Avatar" className="w-full h-full object-cover rounded-2xl" />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-2xl transition-all flex items-center justify-center">
                                    <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                            </>
                        ) : (
                            profile.name.charAt(0).toUpperCase()
                        )}
                        {uploadingPicture && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-2xl flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                            </div>
                        )}
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />

                    {/* User Info */}
                    <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-3">
                            {isEditingName ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={tempName}
                                        onChange={(e) => setTempName(e.target.value)}
                                        className="text-2xl font-bold text-brand-black tracking-tight bg-white/50 border border-brand-slate/20 rounded-lg px-2 py-1 focus:outline-none focus:border-brand-orange"
                                        autoFocus
                                    />
                                    <button onClick={handleSaveName} className="p-1 text-green-500 hover:bg-green-50 rounded-full">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </button>
                                    <button onClick={() => { setIsEditingName(false); setTempName(profile.name); }} className="p-1 text-red-500 hover:bg-red-50 rounded-full">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 group">
                                    <h3 className="text-2xl font-bold text-brand-black tracking-tight">{profile.name}</h3>
                                    <button onClick={() => setIsEditingName(true)} className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-slate/40 hover:text-brand-orange">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                            <span className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-200"></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-brand-slate/60 font-medium">
                                {userPreferences?.dateOfBirth ? formatDateOfBirth(userPreferences.dateOfBirth) : ''}
                            </p>
                            {userPreferences?.dateOfBirth && (
                                <>
                                    <span className="text-brand-slate/30">•</span>
                                    <p className="text-sm font-bold text-brand-orange">
                                        {calculateAge(userPreferences.dateOfBirth)} Years Old
                                    </p>
                                </>
                            )}
                        </div>
                        <div className="mt-3 inline-block px-4 py-2 bg-brand-orange/5 rounded-lg border border-brand-orange/10">
                            <span className="text-sm text-brand-slate/80 font-semibold">{profile.email}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Favourite Cuisine */}
            <div className="glass-panel p-6 md:p-8 rounded-3xl shadow-sm">
                <h3 className="text-xs font-bold text-brand-slate/50 uppercase tracking-widest mb-6">Favourite Cuisine</h3>
                <div className="flex flex-wrap gap-3">
                    {Array.from(new Set([...CUISINE_OPTIONS, ...localCuisines])).map(cuisine => (
                        <button
                            key={cuisine}
                            onClick={() => handleToggleCuisine(cuisine)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border uppercase tracking-wider ${localCuisines.includes(cuisine)
                                ? 'bg-brand-orange border-brand-orange text-white shadow-lg shadow-brand-orange/20'
                                : 'bg-white/50 border-white/40 text-brand-slate/60 hover:border-brand-orange/30 hover:text-brand-orange'
                                }`}
                        >
                            {cuisine}
                        </button>
                    ))}

                    {isAddingCuisine ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-brand-orange/30 bg-white shadow-sm">
                            <input
                                type="text"
                                value={customCuisine}
                                onChange={(e) => setCustomCuisine(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomCuisine()}
                                placeholder="Add..."
                                className="bg-transparent border-none focus:outline-none text-xs font-bold uppercase text-brand-orange w-24 placeholder:text-brand-orange/30"
                                autoFocus
                            />
                            <button onClick={handleAddCustomCuisine} className="p-1 rounded-full hover:bg-brand-orange/10 text-brand-orange">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </button>
                            <button onClick={() => { setIsAddingCuisine(false); setCustomCuisine(''); }} className="p-1 rounded-full hover:bg-brand-orange/10 text-brand-orange/50">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAddingCuisine(true)}
                            className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all border border-dashed border-brand-slate/20 text-brand-slate/40 hover:border-brand-orange hover:text-brand-orange uppercase tracking-wider flex items-center gap-2 group"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Custom
                        </button>
                    )}
                </div>
            </div>

            {/* Dietary */}
            <div className="glass-panel p-6 md:p-8 rounded-3xl shadow-sm">
                <h3 className="text-xs font-bold text-brand-slate/50 uppercase tracking-widest mb-6">Dietary</h3>
                <div className="flex flex-wrap gap-3">
                    {Array.from(new Set([...DIETARY_OPTIONS, ...localDietary])).map(diet => (
                        <button
                            key={diet}
                            onClick={() => handleToggleDietary(diet)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border uppercase tracking-wider ${localDietary.includes(diet)
                                ? 'bg-brand-orange border-brand-orange text-white shadow-lg shadow-brand-orange/20'
                                : 'bg-white/50 border-white/40 text-brand-slate/60 hover:border-brand-orange/30 hover:text-brand-orange'
                                }`}
                        >
                            {diet}
                        </button>
                    ))}

                    {isAddingDietary ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-brand-orange/30 bg-white shadow-sm">
                            <input
                                type="text"
                                value={customDietary}
                                onChange={(e) => setCustomDietary(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomDietary()}
                                placeholder="Add..."
                                className="bg-transparent border-none focus:outline-none text-xs font-bold uppercase text-brand-orange w-24 placeholder:text-brand-orange/30"
                                autoFocus
                            />
                            <button onClick={handleAddCustomDietary} className="p-1 rounded-full hover:bg-brand-orange/10 text-brand-orange">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </button>
                            <button onClick={() => { setIsAddingDietary(false); setCustomDietary(''); }} className="p-1 rounded-full hover:bg-brand-orange/10 text-brand-orange/50">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAddingDietary(true)}
                            className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all border border-dashed border-brand-slate/20 text-brand-slate/40 hover:border-brand-orange hover:text-brand-orange uppercase tracking-wider flex items-center gap-2 group"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Custom
                        </button>
                    )}
                </div>
            </div>

            {/* Your Posts */}
            <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">Your Posts</h3>
                {loadingPosts ? (
                    <div className="text-center py-8">
                        <p className="text-sm text-slate-400 font-medium">Loading posts...</p>
                    </div>
                ) : userPosts.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-sm text-slate-400 font-medium">No posts yet</p>
                        <p className="text-xs text-slate-300 mt-2">Share your food experiences to see them here!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {userPosts.map((post) => (
                            <div
                                key={post.postId}
                                onClick={() => setSelectedPost(communityPostToMenuItem(post))}
                                className="group relative bg-white border-2 border-slate-200 rounded-2xl overflow-hidden hover:border-orange-400 hover:shadow-xl transition-all cursor-pointer"
                            >
                                {/* Image */}
                                {post.image || (post.images && post.images.length > 0) ? (
                                    <div className="aspect-square bg-slate-100 overflow-hidden">
                                        <img
                                            src={post.image || post.images![0]}
                                            alt={post.title || post.name}
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
                                    <h4 className="text-sm font-black text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                                        {post.title || post.name}
                                    </h4>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-slate-500 font-medium">{post.restaurantName}</span>
                                        {/* Likes count */}
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-xs text-slate-600 font-bold">{post.likes}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Post Modal */}
            {selectedPost && (
                <MenuItemDetailModal
                    menuItem={selectedPost}
                    restaurantId={selectedPost.restaurantId}
                    onClose={() => setSelectedPost(null)}
                />
            )}
        </div>
    );
};

export default AccountDetails;
