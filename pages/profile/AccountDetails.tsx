import React from 'react';
import { UserProfile } from '../../types';

interface AccountDetailsProps {
    profile: UserProfile;
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
    toggleCuisine: (cuisine: string) => void;
    toggleDietary: (diet: string) => void;
}

const CUISINE_OPTIONS = ['Italian', 'Japanese', 'Mexican', 'Indian', 'Chinese', 'Thai', 'Greek', 'French', 'Korean', 'Vietnamese'];
const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Halal', 'Kosher', 'Nut-Free'];

const DUMMY_USER = {
    dateOfBirth: '1 January 1980',
    email: 'johndoe@email.com',
    avatarUrl: null as string | null,
};

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
    toggleCuisine,
    toggleDietary,
}) => {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* User Profile Card */}
            <div className="glass-panel p-6 md:p-8 rounded-3xl shadow-sm">
                <div className="flex items-start gap-6">
                    {/* Avatar */}
                    <div className="w-24 h-24 bg-gradient-to-br from-brand-orange/20 to-brand-orange/40 rounded-2xl flex items-center justify-center text-brand-orange text-3xl font-black shadow-inner border border-brand-orange/20">
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
                        <p className="text-sm text-brand-slate/60 font-medium">{DUMMY_USER.dateOfBirth}</p>
                        <div className="mt-3 inline-block px-4 py-2 bg-brand-orange/5 rounded-lg border border-brand-orange/10">
                            <span className="text-sm text-brand-slate/80 font-semibold">{DUMMY_USER.email}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Favourite Cuisine */}
            <div className="glass-panel p-6 md:p-8 rounded-3xl shadow-sm">
                <h3 className="text-xs font-bold text-brand-slate/50 uppercase tracking-widest mb-6">Favourite Cuisine</h3>
                <div className="flex flex-wrap gap-3">
                    {Array.from(new Set([...CUISINE_OPTIONS, ...profile.favoriteCuisines])).map(cuisine => (
                        <button
                            key={cuisine}
                            onClick={() => toggleCuisine(cuisine)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border uppercase tracking-wider ${profile.favoriteCuisines.includes(cuisine)
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
                    {Array.from(new Set([...DIETARY_OPTIONS, ...profile.dietaryRestrictions])).map(diet => (
                        <button
                            key={diet}
                            onClick={() => toggleDietary(diet)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border uppercase tracking-wider ${profile.dietaryRestrictions.includes(diet)
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
        </div>
    );
};

export default AccountDetails;
