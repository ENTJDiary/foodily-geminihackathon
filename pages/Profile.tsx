import React, { useState } from 'react';
import { getUserProfile, saveUserProfile } from '../services/storageService';
import { UserProfile } from '../types';
import ProfileSidebar from './profile/ProfileSidebar';
import AccountDetails from './profile/AccountDetails';
import ActivitySection from './profile/ActivitySection';
import SavedSection from './profile/SavedSection';
import ComingSoon from './profile/ComingSoon';

type TabType = 'account' | 'activity' | 'saved' | 'stats';

const Profile: React.FC = () => {
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
        return <ComingSoon title="Your Stats" />;
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
          <ProfileSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

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
