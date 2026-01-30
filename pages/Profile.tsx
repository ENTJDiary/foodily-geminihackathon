import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import { UserProfile as FirebaseUserProfile } from '../src/types/auth.types';
import ProfileSidebar from './profile/ProfileSidebar';
import AccountDetails from './profile/AccountDetails';
import ActivitySection from './profile/ActivitySection';
import SavedSection from './profile/SavedSection';
import StatsSection from './profile/StatsSection';

type TabType = 'account' | 'activity' | 'saved' | 'stats';

// Legacy UserProfile type for compatibility
interface LegacyUserProfile {
  name: string;
  email: string;
  favoriteCuisines: string[];
  dietaryRestrictions: string[];
  darkMode: boolean;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { userid } = useParams<{ userid: string }>();
  const { userProfile, userPreferences, updateUserProfile, updateUserPreferences, loading } = useAuth();

  // Convert Firebase profile to legacy format for UI compatibility
  const [profile, setProfile] = useState<LegacyUserProfile>({
    name: userProfile?.displayName || 'User',
    email: userProfile?.email || '',
    favoriteCuisines: userPreferences?.cuisinePreferences || [],
    dietaryRestrictions: userPreferences?.dietaryRestrictions || [],
    darkMode: false,
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [activeTab, setActiveTab] = useState<TabType>('account');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationOrigin, setAnimationOrigin] = useState({ x: 0, y: 0 });

  // Username editing state
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(profile.name);

  // Custom addition states
  const [isAddingCuisine, setIsAddingCuisine] = useState(false);
  const [customCuisine, setCustomCuisine] = useState('');
  const [isAddingDietary, setIsAddingDietary] = useState(false);
  const [customDietary, setCustomDietary] = useState('');

  // Update local profile when Firebase profile or preferences change
  useEffect(() => {
    if (userProfile) {
      setProfile({
        name: userProfile.displayName || 'User',
        email: userProfile.email || '',
        favoriteCuisines: userPreferences?.cuisinePreferences || [],
        dietaryRestrictions: userPreferences?.dietaryRestrictions || [],
        darkMode: false,
      });
      setTempName(userProfile.displayName || 'User');
    }
  }, [userProfile, userPreferences]);

  const handleUpdate = async (updates: Partial<LegacyUserProfile>) => {
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);

    try {
      setSaveStatus('saving');

      // Update core profile if name changed
      if (updates.name !== undefined) {
        await updateUserProfile({ displayName: updates.name });
      }

      // Update preferences if cuisines or dietary changed
      const prefUpdates: any = {};
      if (updates.favoriteCuisines !== undefined) {
        prefUpdates.cuisinePreferences = updates.favoriteCuisines;
      }
      if (updates.dietaryRestrictions !== undefined) {
        prefUpdates.dietaryRestrictions = updates.dietaryRestrictions;
      }

      if (Object.keys(prefUpdates).length > 0) {
        await updateUserPreferences(prefUpdates);
      }

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveStatus('idle');
    }
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

  const handleTabChange = (tab: TabType, buttonRect: DOMRect) => {
    // Calculate the center of the button as animation origin
    const originX = buttonRect.left + buttonRect.width / 2;
    const originY = buttonRect.top + buttonRect.height / 2;

    setAnimationOrigin({ x: originX, y: originY });
    setIsAnimating(true);

    // Reset animation state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 650);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <AccountDetails
            profile={profile}
            isEditingName={isEditingName}
            tempName={tempName}
            setTempName={setTempName}
            setIsEditingName={setIsEditingName}
            handleSaveName={handleSaveName}
            isAddingCuisine={isAddingCuisine}
            customCuisine={customCuisine}
            setCustomCuisine={setCustomCuisine}
            setIsAddingCuisine={setIsAddingCuisine}
            handleAddCustomCuisine={handleAddCustomCuisine}
            isAddingDietary={isAddingDietary}
            customDietary={customDietary}
            setCustomDietary={setCustomDietary}
            setIsAddingDietary={setIsAddingDietary}
            handleAddCustomDietary={handleAddCustomDietary}
            toggleCuisine={toggleCuisine}
            toggleDietary={toggleDietary}
          />
        );
      case 'activity':
        return <ActivitySection />;
      case 'saved':
        return <SavedSection />;
      case 'stats':
        return <StatsSection />;
      default:
        return (
          <AccountDetails
            profile={profile}
            isEditingName={isEditingName}
            tempName={tempName}
            setTempName={setTempName}
            setIsEditingName={setIsEditingName}
            handleSaveName={handleSaveName}
            isAddingCuisine={isAddingCuisine}
            customCuisine={customCuisine}
            setCustomCuisine={setCustomCuisine}
            setIsAddingCuisine={setIsAddingCuisine}
            handleAddCustomCuisine={handleAddCustomCuisine}
            isAddingDietary={isAddingDietary}
            customDietary={customDietary}
            setCustomDietary={setCustomDietary}
            setIsAddingDietary={setIsAddingDietary}
            handleAddCustomDietary={handleAddCustomDietary}
            toggleCuisine={toggleCuisine}
            toggleDietary={toggleDietary}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center">
      <div className="bg-white w-full max-w-[2560px] px-6 py-6 space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <ProfileSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onTabChange={handleTabChange}
          />

          {/* Main Content */}
          <div className="flex-1">
            <div
              key={activeTab}
              className={isAnimating ? 'animate-macos-spring-out' : ''}
              style={{
                transformOrigin: `${animationOrigin.x}px ${animationOrigin.y}px`,
              }}
            >
              {renderContent()}
            </div>


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
