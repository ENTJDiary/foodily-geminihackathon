
import React, { useState } from 'react';
import { getUserProfile, saveUserProfile, clearSearchHistory } from '../services/storageService';
import { UserProfile } from '../types';

const CUISINE_OPTIONS = ['Italian', 'Japanese', 'Mexican', 'Indian', 'Chinese', 'Thai', 'Greek', 'French', 'Korean', 'Vietnamese'];
const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Halal', 'Kosher', 'Nut-Free'];

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleUpdate = (updates: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    saveUserProfile(newProfile);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const toggleCuisine = (cuisine: string) => {
    const newCuisines = profile.favoriteCuisines.includes(cuisine)
      ? profile.favoriteCuisines.filter(c => c !== cuisine)
      : [...profile.favoriteCuisines, cuisine];
    // Fixed typo: changed newCuisisnes to newCuisines
    handleUpdate({ favoriteCuisines: newCuisines });
  };

  const toggleDietary = (diet: string) => {
    const newDietary = profile.dietaryRestrictions.includes(diet)
      ? profile.dietaryRestrictions.filter(d => d !== diet)
      : [...profile.dietaryRestrictions, diet];
    handleUpdate({ dietaryRestrictions: newDietary });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-extrabold text-slate-900 uppercase tracking-tight">Profile</h2>
        <p className="text-slate-400 font-medium">Manage your settings and gourmet preferences.</p>
      </div>

      <div className="bg-white p-10 rounded-3xl border border-orange-50 shadow-sm space-y-10">
        <div className="flex items-center gap-8 pb-10 border-b border-orange-50">
          <div className="w-24 h-24 bg-orange-600 rounded-3xl flex items-center justify-center text-white text-4xl font-black shadow-lg">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{profile.name}</h3>
            <p className="text-sm text-orange-600 font-bold uppercase tracking-widest">{profile.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => handleUpdate({ name: e.target.value })}
              className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-transparent focus:border-orange-500 focus:bg-white transition-all font-bold outline-none"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => handleUpdate({ email: e.target.value })}
              className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-transparent focus:border-orange-500 focus:bg-white transition-all font-bold outline-none"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Favorite Cuisines</h3>
          <div className="flex flex-wrap gap-2">
            {CUISINE_OPTIONS.map(cuisine => (
              <button
                key={cuisine}
                onClick={() => toggleCuisine(cuisine)}
                className={`px-6 py-2.5 rounded-full text-[10px] font-black transition-all border uppercase tracking-widest ${profile.favoriteCuisines.includes(cuisine)
                  ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-100'
                  : 'bg-white border-slate-200 text-slate-400 hover:border-orange-500 hover:text-orange-600'
                  }`}
              >
                {cuisine}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-6">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Dietary Restrictions</h3>
          <div className="flex flex-wrap gap-2">
            {DIETARY_OPTIONS.map(diet => (
              <button
                key={diet}
                onClick={() => toggleDietary(diet)}
                className={`px-6 py-2.5 rounded-full text-[10px] font-black transition-all border uppercase tracking-widest ${profile.dietaryRestrictions.includes(diet)
                  ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-100'
                  : 'bg-white border-slate-200 text-slate-400 hover:border-orange-500 hover:text-orange-600'
                  }`}
              >
                {diet}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-10 border-t border-orange-50">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Data Management</h3>
          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-orange-50">
            <div>
              <p className="font-black text-slate-900 text-sm uppercase tracking-tight">Clear History</p>
              <p className="text-xs text-slate-400 font-bold mt-1">Reset your weekly hunting progress</p>
            </div>
            <button
              onClick={() => { if (confirm('Wipe your data?')) { clearSearchHistory(); window.location.reload(); } }}
              className="px-6 py-3 bg-white border border-slate-200 text-red-500 text-[10px] font-black rounded-xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-all uppercase tracking-widest"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {saveStatus === 'saved' && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-orange-600 text-white px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest shadow-2xl animate-in fade-in slide-in-from-bottom-4 z-[100]">
          Profile Updated
        </div>
      )}
    </div>
  );
};

export default Profile;
