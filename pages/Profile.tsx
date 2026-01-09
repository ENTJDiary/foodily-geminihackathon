
import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getUserProfile, saveUserProfile, clearSearchHistory } from '../services/storageService';
import { UserProfile } from '../types';

const CUISINE_OPTIONS = ['Italian', 'Japanese', 'Mexican', 'Indian', 'Chinese', 'Thai', 'Greek', 'French', 'Korean', 'Vietnamese'];
const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Halal', 'Kosher', 'Nut-Free'];

type TabType = 'account' | 'activity' | 'saved' | 'stats';

// Dummy user data for account details
const DUMMY_USER = {
  name: 'John Doe',
  dateOfBirth: '1 January 1980',
  email: 'johndoe@email.com',
  avatarUrl: null as string | null,
};

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { userid } = useParams<{ userid: string }>();
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [activeTab, setActiveTab] = useState<TabType>('account');

  // Edit Name State
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(profile.name);

  // Add Custom Options State
  const [isAddingCuisine, setIsAddingCuisine] = useState(false);
  const [newCuisine, setNewCuisine] = useState('');
  const [isAddingDietary, setIsAddingDietary] = useState(false);
  const [newDietary, setNewDietary] = useState('');

  const handleUpdate = (updates: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    saveUserProfile(newProfile);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleNameSave = () => {
    if (editedName.trim()) {
      handleUpdate({ name: editedName.trim() });
      setIsEditingName(false);
    }
  };

  const handleAddCuisine = () => {
    if (newCuisine.trim()) {
      const formatted = newCuisine.trim();
      if (!profile.favoriteCuisines.includes(formatted)) {
        handleUpdate({ favoriteCuisines: [...profile.favoriteCuisines, formatted] });
      }
      setNewCuisine('');
      setIsAddingCuisine(false);
    }
  };

  const handleAddDietary = () => {
    if (newDietary.trim()) {
      const formatted = newDietary.trim();
      if (!profile.dietaryRestrictions.includes(formatted)) {
        handleUpdate({ dietaryRestrictions: [...profile.dietaryRestrictions, formatted] });
      }
      setNewDietary('');
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
              DUMMY_USER.name.charAt(0).toUpperCase()
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-3">
              {isEditingName ? (
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="text-2xl font-black text-slate-900 tracking-tight bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500 w-full md:w-64"
                    autoFocus
                  />
                  <button
                    onClick={handleNameSave}
                    className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingName(false);
                      setEditedName(profile.name);
                    }}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 group">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{profile.name}</h3>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-orange-500"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <span className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-200 ml-2"></span>
                </div>
              )}
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
          {/* Combine default options with user's custom added ones, remove duplicates */}
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

          {/* Add New Cuisine Button */}
          {isAddingCuisine ? (
            <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
              <input
                type="text"
                value={newCuisine}
                onChange={(e) => setNewCuisine(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCuisine()}
                placeholder="Add Cuisine..."
                className="px-4 py-2 rounded-full text-[10px] font-bold border border-orange-200 bg-orange-50 text-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-500 w-32 uppercase tracking-wide placeholder:normal-case placeholder:tracking-normal"
                autoFocus
              />
              <button
                onClick={handleAddCuisine}
                className="w-8 h-8 flex items-center justify-center bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                onClick={() => { setIsAddingCuisine(false); setNewCuisine(''); }}
                className="w-8 h-8 flex items-center justify-center bg-slate-200 text-slate-500 rounded-full hover:bg-slate-300 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingCuisine(true)}
              className="px-4 py-2.5 rounded-full text-[10px] font-black transition-all border border-dashed border-slate-300 text-slate-400 hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 uppercase tracking-widest flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          {/* Combine default options with user's custom added ones, remove duplicates */}
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

          {/* Add New Dietary Button */}
          {isAddingDietary ? (
            <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
              <input
                type="text"
                value={newDietary}
                onChange={(e) => setNewDietary(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddDietary()}
                placeholder="Add Dietary..."
                className="px-4 py-2 rounded-full text-[10px] font-bold border border-orange-200 bg-orange-50 text-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-500 w-32 uppercase tracking-wide placeholder:normal-case placeholder:tracking-normal"
                autoFocus
              />
              <button
                onClick={handleAddDietary}
                className="w-8 h-8 flex items-center justify-center bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                onClick={() => { setIsAddingDietary(false); setNewDietary(''); }}
                className="w-8 h-8 flex items-center justify-center bg-slate-200 text-slate-500 rounded-full hover:bg-slate-300 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingDietary(true)}
              className="px-4 py-2.5 rounded-full text-[10px] font-black transition-all border border-dashed border-slate-300 text-slate-400 hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 uppercase tracking-widest flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return renderAccountDetails();
      case 'activity':
        return renderComingSoon('Activity');
      case 'saved':
        return renderComingSoon('Saved Items');
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
                  to={`/FoodHunter/${userid}`}
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
