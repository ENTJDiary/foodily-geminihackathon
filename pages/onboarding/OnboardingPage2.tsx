import React, { useState } from 'react';
import { OnboardingPageProps } from '../../src/types/onboarding.types';

const CUISINE_OPTIONS = ['Italian', 'Japanese', 'Mexican', 'Indian', 'Chinese', 'Thai', 'Greek', 'French', 'Korean', 'Vietnamese'];
const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Halal', 'Kosher', 'Nut-Free'];

const OnboardingPage2: React.FC<OnboardingPageProps> = ({ formData, updateFormData, onNext, onBack }) => {
    const [isAddingCuisine, setIsAddingCuisine] = useState(false);
    const [customCuisine, setCustomCuisine] = useState('');
    const [isAddingDietary, setIsAddingDietary] = useState(false);
    const [customDietary, setCustomDietary] = useState('');

    const isValid = formData.cuisinePreferences.length > 0;

    const toggleCuisine = (cuisine: string) => {
        const updated = formData.cuisinePreferences.includes(cuisine)
            ? formData.cuisinePreferences.filter(c => c !== cuisine)
            : [...formData.cuisinePreferences, cuisine];
        updateFormData({ cuisinePreferences: updated });
    };

    const toggleDietary = (dietary: string) => {
        const updated = formData.dietaryRestrictions.includes(dietary)
            ? formData.dietaryRestrictions.filter(d => d !== dietary)
            : [...formData.dietaryRestrictions, dietary];
        updateFormData({ dietaryRestrictions: updated });
    };

    const handleAddCustomCuisine = () => {
        if (customCuisine.trim() && !formData.cuisinePreferences.includes(customCuisine.trim())) {
            updateFormData({ cuisinePreferences: [...formData.cuisinePreferences, customCuisine.trim()] });
            setCustomCuisine('');
            setIsAddingCuisine(false);
        }
    };

    const handleAddCustomDietary = () => {
        if (customDietary.trim() && !formData.dietaryRestrictions.includes(customDietary.trim())) {
            updateFormData({ dietaryRestrictions: [...formData.dietaryRestrictions, customDietary.trim()] });
            setCustomDietary('');
            setIsAddingDietary(false);
        }
    };

    // Combine predefined and custom options
    const allCuisines = Array.from(new Set([...CUISINE_OPTIONS, ...formData.cuisinePreferences]));
    const allDietary = Array.from(new Set([...DIETARY_OPTIONS, ...formData.dietaryRestrictions]));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="text-center space-y-3">
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                    What's your taste? 🍽️
                </h2>
                <p className="text-slate-500 text-lg font-medium">
                    Help us recommend the perfect dishes for you
                </p>
            </div>

            {/* Cuisine Preferences */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="block text-sm font-black text-slate-700 uppercase tracking-wide">
                        🌍 Favorite Cuisines <span className="text-orange-600">*</span>
                    </label>
                    <span className="text-xs font-bold text-slate-400 uppercase">
                        {formData.cuisinePreferences.length} selected
                    </span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {allCuisines.map(cuisine => (
                        <button
                            key={cuisine}
                            type="button"
                            onClick={() => toggleCuisine(cuisine)}
                            className={`px-5 py-2.5 rounded-full text-[10px] font-black transition-all border uppercase tracking-widest hover:scale-105 active:scale-95 ${formData.cuisinePreferences.includes(cuisine)
                                    ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-100'
                                    : 'bg-white border-slate-200 text-slate-400 hover:border-orange-500 hover:text-orange-600'
                                }`}
                        >
                            {cuisine}
                        </button>
                    ))}

                    {isAddingCuisine ? (
                        <div className="flex items-center gap-2 px-2 py-1 rounded-full border border-orange-200 bg-orange-50 pl-4 animate-in fade-in zoom-in-95 duration-200">
                            <input
                                type="text"
                                value={customCuisine}
                                onChange={(e) => setCustomCuisine(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomCuisine()}
                                placeholder="Add custom..."
                                className="bg-transparent border-none focus:outline-none text-[10px] font-black uppercase text-orange-800 w-24"
                                autoFocus
                            />
                            <button onClick={handleAddCustomCuisine} className="p-1 rounded-full hover:bg-orange-200 text-orange-600 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </button>
                            <button onClick={() => { setIsAddingCuisine(false); setCustomCuisine(''); }} className="p-1 rounded-full hover:bg-orange-200 text-orange-400 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAddingCuisine(true)}
                            className="px-5 py-2.5 rounded-full text-[10px] font-black transition-all border border-dashed border-slate-300 text-slate-400 hover:border-orange-400 hover:text-orange-500 uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add More
                        </button>
                    )}
                </div>
            </div>

            {/* Dietary Restrictions */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="block text-sm font-black text-slate-700 uppercase tracking-wide">
                        🥗 Dietary Restrictions
                    </label>
                    <span className="text-xs font-bold text-slate-400 uppercase">
                        {formData.dietaryRestrictions.length} selected
                    </span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {allDietary.map(dietary => (
                        <button
                            key={dietary}
                            type="button"
                            onClick={() => toggleDietary(dietary)}
                            className={`px-5 py-2.5 rounded-full text-[10px] font-black transition-all border uppercase tracking-widest hover:scale-105 active:scale-95 ${formData.dietaryRestrictions.includes(dietary)
                                    ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-100'
                                    : 'bg-white border-slate-200 text-slate-400 hover:border-orange-500 hover:text-orange-600'
                                }`}
                        >
                            {dietary}
                        </button>
                    ))}

                    {isAddingDietary ? (
                        <div className="flex items-center gap-2 px-2 py-1 rounded-full border border-orange-200 bg-orange-50 pl-4 animate-in fade-in zoom-in-95 duration-200">
                            <input
                                type="text"
                                value={customDietary}
                                onChange={(e) => setCustomDietary(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomDietary()}
                                placeholder="Add custom..."
                                className="bg-transparent border-none focus:outline-none text-[10px] font-black uppercase text-orange-800 w-24"
                                autoFocus
                            />
                            <button onClick={handleAddCustomDietary} className="p-1 rounded-full hover:bg-orange-200 text-orange-600 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </button>
                            <button onClick={() => { setIsAddingDietary(false); setCustomDietary(''); }} className="p-1 rounded-full hover:bg-orange-200 text-orange-400 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAddingDietary(true)}
                            className="px-5 py-2.5 rounded-full text-[10px] font-black transition-all border border-dashed border-slate-300 text-slate-400 hover:border-orange-400 hover:text-orange-500 uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add More
                        </button>
                    )}
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4">
                <button
                    onClick={onBack}
                    className="flex-1 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 bg-white border-2 border-slate-200 text-slate-600 hover:border-orange-400 hover:text-orange-600 hover:shadow-md"
                >
                    ← Back
                </button>
                <button
                    onClick={onNext}
                    disabled={!isValid}
                    className={`flex-1 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 ${isValid
                            ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-xl shadow-orange-200 hover:shadow-2xl hover:shadow-orange-300 hover:scale-[1.02] active:scale-95'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                >
                    {isValid ? 'Next Step →' : 'Select at least 1 cuisine'}
                </button>
            </div>
        </div>
    );
};

export default OnboardingPage2;
