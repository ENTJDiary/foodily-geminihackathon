


import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserProfile, saveUserProfile, clearSearchHistory, getWeeklyHistory, getExploredRestaurants, getUserComments, getLikedPosts, getSavedPosts, toggleSavePost } from '../services/storageService';
import { UserProfile } from '../types';
import WeeklyFoodHunt from '../components/features/WeeklyFoodHunt';

const CUISINE_OPTIONS = ['Italian', 'Japanese', 'Mexican', 'Indian', 'Chinese', 'Thai', 'Greek', 'French', 'Korean', 'Vietnamese'];
const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Halal', 'Kosher', 'Nut-Free'];

type TabType = 'account' | 'activity' | 'saved' | 'stats';

// Dummy user data for account details
const DUMMY_USER = {
  dateOfBirth: '1 January 1980',
  email: 'johndoe@email.com',
  avatarUrl: null as string | null,
};

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [activeTab, setActiveTab] = useState<TabType>('account');

  // Username editing state
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(profile.name);

  // Custom addition states
  const [isAddingCuisine, setIsAddingCuisine] = useState(false);
  const [customCuisine, setCustomCuisine] = useState('');
  const [isAddingDietary, setIsAddingDietary] = useState(false);
  const [customDietary, setCustomDietary] = useState('');

  // Saved posts state
  const [savedPosts, setSavedPosts] = useState(getSavedPosts());

  const handleUpdate = (updates: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    saveUserProfile(newProfile);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      handleUpdate({ name: tempName.trim() });
      setIsEditingName(false);
    }
  };

  const handleAddCustomCuisine = () => {
    if (customCuisine.trim()) {
      const newCuisine = customCuisine.trim();
      if (!profile.favoriteCuisines.includes(newCuisine)) {
        handleUpdate({ favoriteCuisines: [...profile.favoriteCuisines, newCuisine] });
      }
      setCustomCuisine('');
      setIsAddingCuisine(false);
    }
  };

  const handleAddCustomDietary = () => {
    if (customDietary.trim()) {
      const newDiet = customDietary.trim();
      if (!profile.dietaryRestrictions.includes(newDiet)) {
        handleUpdate({ dietaryRestrictions: [...profile.dietaryRestrictions, newDiet] });
      }
      setCustomDietary('');
      setIsAddingDietary(false);
    }
  };

  const toggleCuisine = (cuisine: string) => {
    const newCuisines = profile.favoriteCuisines.includes(cuisine)
      ? profile.favoriteCuisines.filter(c => c !== cuisine)
      : [...profile.favoriteCuisines, cuisine];
    handleUpdate({ favoriteCuisines: newCuisines });
  };

  const toggleDietary = (diet: string) => {
    const newDietary = profile.dietaryRestrictions.includes(diet)
      ? profile.dietaryRestrictions.filter(d => d !== diet)
      : [...profile.dietaryRestrictions, diet];
    handleUpdate({ dietaryRestrictions: newDietary });
  };

  const sidebarItems: { id: TabType; label: string; description: string; icon: React.ReactNode }[] = [
    {
      id: 'account',
      label: 'Account Detail',
      description: 'Account Details & Preference',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: 'activity',
      label: 'Activity',
      description: 'Your Recent Picks',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: 'saved',
      label: 'Saved',
      description: 'To be Discovered',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      ),
    },
    {
      id: 'stats',
      label: 'Stats',
      description: 'Your Unique Tastebuds',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      ),
    },
  ];

  const renderAccountDetails = () => (
    <div className="space-y-6 animate-in fade-in duration-300 max-h-[700px]">
      {/* User Profile Card */}
      <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center text-orange-600 text-3xl font-black shadow-inner border-2 border-orange-200">
            {DUMMY_USER.avatarUrl ? (
              <img src={DUMMY_USER.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-2xl" />
            ) : (
              profile.name.charAt(0).toUpperCase()
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-3">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="text-2xl font-black text-slate-900 tracking-tight bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-orange-500"
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
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{profile.name}</h3>
                  <button onClick={() => setIsEditingName(true)} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-orange-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              )}
              <span className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-200"></span>
            </div>
            <p className="text-sm text-slate-400 font-medium">{DUMMY_USER.dateOfBirth}</p>
            <div className="mt-3 inline-block px-4 py-2 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-sm text-slate-600 font-semibold">{DUMMY_USER.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Favourite Cuisine */}
      <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">Favourite Cuisine</h3>
        <div className="flex flex-wrap gap-2">
          {Array.from(new Set([...CUISINE_OPTIONS, ...profile.favoriteCuisines])).map(cuisine => (
            <button
              key={cuisine}
              onClick={() => toggleCuisine(cuisine)}
              className={`px-5 py-2.5 rounded-full text-[10px] font-black transition-all border uppercase tracking-widest ${profile.favoriteCuisines.includes(cuisine)
                ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-100'
                : 'bg-white border-slate-200 text-slate-400 hover:border-orange-500 hover:text-orange-600'
                }`}
            >
              {cuisine}
            </button>
          ))}

          {isAddingCuisine ? (
            <div className="flex items-center gap-2 px-2 py-1 rounded-full border border-orange-200 bg-orange-50 pl-4">
              <input
                type="text"
                value={customCuisine}
                onChange={(e) => setCustomCuisine(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomCuisine()}
                placeholder="Add custom..."
                className="bg-transparent border-none focus:outline-none text-[10px] font-black uppercase text-orange-800 w-24"
                autoFocus
              />
              <button onClick={handleAddCustomCuisine} className="p-1 rounded-full hover:bg-orange-200 text-orange-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </button>
              <button onClick={() => { setIsAddingCuisine(false); setCustomCuisine(''); }} className="p-1 rounded-full hover:bg-orange-200 text-orange-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingCuisine(true)}
              className="px-5 py-2.5 rounded-full text-[10px] font-black transition-all border border-dashed border-slate-300 text-slate-400 hover:border-orange-400 hover:text-orange-500 uppercase tracking-widest flex items-center gap-2 group"
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
      <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">Dietary</h3>
        <div className="flex flex-wrap gap-2">
          {Array.from(new Set([...DIETARY_OPTIONS, ...profile.dietaryRestrictions])).map(diet => (
            <button
              key={diet}
              onClick={() => toggleDietary(diet)}
              className={`px-5 py-2.5 rounded-full text-[10px] font-black transition-all border uppercase tracking-widest ${profile.dietaryRestrictions.includes(diet)
                ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-100'
                : 'bg-white border-slate-200 text-slate-400 hover:border-orange-500 hover:text-orange-600'
                }`}
            >
              {diet}
            </button>
          ))}

          {isAddingDietary ? (
            <div className="flex items-center gap-2 px-2 py-1 rounded-full border border-orange-200 bg-orange-50 pl-4">
              <input
                type="text"
                value={customDietary}
                onChange={(e) => setCustomDietary(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomDietary()}
                placeholder="Add custom..."
                className="bg-transparent border-none focus:outline-none text-[10px] font-black uppercase text-orange-800 w-24"
                autoFocus
              />
              <button onClick={handleAddCustomDietary} className="p-1 rounded-full hover:bg-orange-200 text-orange-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </button>
              <button onClick={() => { setIsAddingDietary(false); setCustomDietary(''); }} className="p-1 rounded-full hover:bg-orange-200 text-orange-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingDietary(true)}
              className="px-5 py-2.5 rounded-full text-[10px] font-black transition-all border border-dashed border-slate-300 text-slate-400 hover:border-orange-400 hover:text-orange-500 uppercase tracking-widest flex items-center gap-2 group"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Custom
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderComingSoon = (title: string) => (
    <div className="flex items-center justify-center h-96">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 mx-auto bg-orange-50 rounded-2xl flex items-center justify-center">
          <svg className="w-10 h-10 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">{title}</h3>
        <p className="text-sm text-slate-400 font-medium">Coming Soon</p>
      </div>
    </div>
  );

  const renderActivitySection = () => {
    const exploredRestaurants = getExploredRestaurants();
    const userComments = getUserComments();
    const likedPosts = getLikedPosts();
    const weeklyHistory = getWeeklyHistory();

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Weekly Food Hunt */}
        <WeeklyFoodHunt history={weeklyHistory} />

        {/* Cuisine Explored */}
        <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">Cuisine Explored</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {exploredRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="group relative bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-5 hover:border-orange-300 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex flex-col gap-2">
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                    {restaurant.name}
                  </h4>
                  <div className="inline-flex items-center gap-2">
                    <span className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-[9px] font-black uppercase tracking-wider">
                      {restaurant.cuisine}
                    </span>
                  </div>
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
        </div>

        {/* Comments Made */}
        <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">Comments</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {userComments.map((comment) => (
              <div
                key={comment.id}
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
        </div>

        {/* Liked Posts */}
        <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">Liked Posts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {likedPosts.map((post) => (
              <div
                key={post.id}
                className="group relative bg-white border-2 border-slate-200 rounded-2xl overflow-hidden hover:border-orange-400 hover:shadow-xl transition-all cursor-pointer"
              >
                {/* Image */}
                {post.image && (
                  <div className="aspect-square bg-slate-100 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.restaurantName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-4 space-y-2">
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                    {post.restaurantName}
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
        </div>
      </div>
    );
  };

  const renderSavedSection = () => {
    const handleUnsavePost = (postId: string) => {
      const updatedPosts = toggleSavePost(postId);
      setSavedPosts(updatedPosts);
    };

    if (savedPosts.length === 0) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-orange-50 rounded-2xl flex items-center justify-center">
              <svg className="w-10 h-10 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">No Saved Posts</h3>
            <p className="text-sm text-slate-400 font-medium">Start exploring and save your favorite posts!</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">Saved Posts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedPosts.map((post) => (
              <div
                key={post.id}
                className="group relative bg-white border-2 border-slate-200 rounded-2xl overflow-hidden hover:border-orange-400 hover:shadow-xl transition-all cursor-pointer"
              >
                {/* Image */}
                <div className="aspect-square bg-slate-100 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.dishName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                    {post.restaurantName}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium">{post.dishName}</p>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={`w-3 h-3 ${i < post.rating ? 'text-orange-500' : 'text-slate-200'}`}
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
                        handleUnsavePost(post.id);
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
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return renderAccountDetails();
      case 'activity':
        return renderActivitySection();
      case 'saved':
        return renderSavedSection();
      case 'stats':
        return renderComingSoon('Your Stats');
      default:
        return renderAccountDetails();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center">
      <div className="bg-white w-full max-w-[2560px] px-6 py-6 space-y-6 animate-in fade-in duration-500">

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-72 flex-shrink-0 space-y-4">
            {/* First Frame: Navigation Items */}
            <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
              {/* Back to Home */}
              <div className="flex pl-5 pt-4">
                <Link
                  to="/FoodHunter"
                  className="inline-flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-wider"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>

                  <span className="text-[10px]">Back to Home</span>
                </Link>
              </div>

              <nav className="p-4 space-y-2">
                {sidebarItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-start gap-3 px-4 py-4 rounded-xl text-left transition-all ${activeTab === item.id
                      ? 'bg-orange-50 text-orange-600 border border-orange-200'
                      : 'text-slate-500 hover:bg-slate-50 border border-transparent'
                      }`}
                  >
                    <span className={`flex-shrink-0 self-center ${activeTab === item.id ? 'text-orange-600' : 'text-slate-400'}`}>{item.icon}</span>
                    <div className="flex-1">
                      <div className="text-xs font-black uppercase tracking-wider">{item.label}</div>
                      <div className="text-[10px] font-medium text-slate-400 mt-0.5">{item.description}</div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>

            {/* Second Frame: Feedback & Help */}
            <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
              <div className="p-4 space-y-3">
                <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                  Have a feature request, bug report, or a new idea?
                </p>

                <div className="space-y-2">
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-slate-500 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-300">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <span className="text-xs font-black uppercase tracking-wider">Send Feedback</span>
                  </button>

                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-slate-500 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-300">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs font-black uppercase tracking-wider">Help</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Standalone Logout CTA */}
            <button
              onClick={() => { if (confirm('Are you sure you want to logout?')) { clearSearchHistory(); navigate('/'); } }}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm hover:shadow-md font-black text-sm uppercase tracking-wider"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>

          {/* Save Status Notification */}
          {saveStatus === 'saved' && (
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-orange-600 text-white px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest shadow-2xl animate-in fade-in slide-in-from-bottom-4 z-[100]">
              Profile Updated
            </div>
          )}
        </div>
      </div>
    </div>

  );
};

export default Profile;
