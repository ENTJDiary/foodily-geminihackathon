import React from 'react';
import { OnboardingPageProps, Sex } from '../../src/types/onboarding.types';

const OnboardingPage1: React.FC<OnboardingPageProps> = ({ formData, updateFormData, onNext }) => {
    const isValid = formData.city.trim() !== '' && formData.dateOfBirth !== '' && formData.sex !== '';

    const handleSexSelect = (sex: Sex) => {
        updateFormData({ sex });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="text-center space-y-3">
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                    Let's get to know you! 👋
                </h2>
                <p className="text-slate-500 text-lg font-medium">
                    Tell us a bit about yourself to personalize your experience
                </p>
            </div>

            {/* City Input */}
            <div className="space-y-3">
                <label htmlFor="city" className="block text-sm font-black text-slate-700 uppercase tracking-wide">
                    🏙️ Home City
                </label>
                <div className="relative group">
                    <input
                        type="text"
                        id="city"
                        value={formData.city}
                        onChange={(e) => updateFormData({ city: e.target.value })}
                        placeholder="e.g., New York, London, Tokyo"
                        className="w-full px-6 py-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all font-medium hover:border-orange-300 shadow-sm hover:shadow-md"
                        required
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl opacity-50 group-focus-within:opacity-100 transition-opacity">
                        📍
                    </div>
                </div>
            </div>

            {/* Date of Birth */}
            <div className="space-y-3">
                <label htmlFor="dob" className="block text-sm font-black text-slate-700 uppercase tracking-wide">
                    🎂 Date of Birth
                </label>
                <input
                    type="date"
                    id="dob"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
                    className="w-full px-6 py-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all font-medium hover:border-orange-300 shadow-sm hover:shadow-md"
                    required
                />
            </div>

            {/* Sex Selection */}
            <div className="space-y-3">
                <label className="block text-sm font-black text-slate-700 uppercase tracking-wide">
                    👤 Sex
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {(['Male', 'Female', 'Prefer not to say'] as Sex[]).map((sex) => (
                        <button
                            key={sex}
                            type="button"
                            onClick={() => handleSexSelect(sex)}
                            className={`px-6 py-4 rounded-2xl font-bold text-sm uppercase tracking-wide transition-all border-2 ${formData.sex === sex
                                    ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-200 scale-105'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-orange-400 hover:text-orange-600 hover:shadow-md'
                                }`}
                        >
                            {sex === 'Male' && '👨'}
                            {sex === 'Female' && '👩'}
                            {sex === 'Prefer not to say' && '🙋'}
                            <span className="ml-2">{sex}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Next Button */}
            <button
                onClick={onNext}
                disabled={!isValid}
                className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 ${isValid
                        ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-xl shadow-orange-200 hover:shadow-2xl hover:shadow-orange-300 hover:scale-[1.02] active:scale-95'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
            >
                {isValid ? 'Next Step →' : 'Please fill all fields'}
            </button>
        </div>
    );
};

export default OnboardingPage1;
