import React, { useState } from 'react';
import { OnboardingPageProps } from '../../src/types/onboarding.types';

const OnboardingPage3: React.FC<OnboardingPageProps> = ({ formData, updateFormData, onNext, onBack }) => {
    const [showTerms, setShowTerms] = useState(false);

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateFormData({ termsAccepted: e.target.checked });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="text-center space-y-3">
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                    Almost there! 🎉
                </h2>
                <p className="text-slate-500 text-lg font-medium">
                    Just one more step to start your culinary journey
                </p>
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border-2 border-orange-200 space-y-4">
                <h3 className="text-sm font-black text-orange-900 uppercase tracking-wide">Your Profile Summary</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Location</p>
                        <p className="text-lg font-black text-slate-900">📍 {formData.city}</p>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Date of Birth</p>
                        <p className="text-lg font-black text-slate-900">🎂 {formData.dateOfBirth}</p>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Sex</p>
                        <p className="text-lg font-black text-slate-900">
                            {formData.sex === 'Male' && '👨'}
                            {formData.sex === 'Female' && '👩'}
                            {formData.sex === 'Prefer not to say' && '🙋'}
                            {' '}{formData.sex}
                        </p>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Cuisines</p>
                        <p className="text-lg font-black text-slate-900">🌍 {formData.cuisinePreferences.length} selected</p>
                    </div>
                </div>

                {formData.cuisinePreferences.length > 0 && (
                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Favorite Cuisines</p>
                        <div className="flex flex-wrap gap-2">
                            {formData.cuisinePreferences.map(cuisine => (
                                <span key={cuisine} className="px-3 py-1 bg-orange-600 text-white rounded-full text-xs font-bold">
                                    {cuisine}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {formData.dietaryRestrictions.length > 0 && (
                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Dietary Restrictions</p>
                        <div className="flex flex-wrap gap-2">
                            {formData.dietaryRestrictions.map(dietary => (
                                <span key={dietary} className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-bold">
                                    {dietary}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Terms & Conditions */}
            <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 space-y-4">
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-wide">Terms & Conditions</h3>

                <div className="flex items-start gap-4">
                    <input
                        type="checkbox"
                        id="terms"
                        checked={formData.termsAccepted}
                        onChange={handleCheckboxChange}
                        className="mt-1 w-5 h-5 rounded border-2 border-slate-300 text-orange-600 focus:ring-2 focus:ring-orange-500 cursor-pointer transition-all"
                    />
                    <label htmlFor="terms" className="text-sm text-slate-600 leading-relaxed cursor-pointer">
                        I agree to Food.ily's{' '}
                        <button
                            type="button"
                            onClick={() => setShowTerms(!showTerms)}
                            className="text-orange-600 font-bold hover:text-orange-700 hover:underline transition-colors"
                        >
                            Terms of Service
                        </button>
                        {' '}and{' '}
                        <button
                            type="button"
                            onClick={() => setShowTerms(!showTerms)}
                            className="text-orange-600 font-bold hover:text-orange-700 hover:underline transition-colors"
                        >
                            Privacy Policy
                        </button>
                        . I understand that my data will be used to personalize my food recommendations and improve the app experience.
                    </label>
                </div>

                {showTerms && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-300">
                        <h4 className="font-bold text-slate-900 mb-2">Terms of Service Summary</h4>
                        <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                            <li>Your data will be stored securely and used only for personalization purposes</li>
                            <li>We will never share your personal information with third parties without consent</li>
                            <li>You can request data deletion at any time from your profile settings</li>
                            <li>We use cookies and analytics to improve your experience</li>
                            <li>You must be 13 years or older to use this service</li>
                        </ul>
                    </div>
                )}
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
                    disabled={!formData.termsAccepted}
                    className={`flex-1 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 ${formData.termsAccepted
                            ? 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white shadow-xl shadow-orange-200 hover:shadow-2xl hover:shadow-orange-300 hover:scale-[1.02] active:scale-95'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                >
                    {formData.termsAccepted ? '🚀 Complete Setup' : 'Accept terms to continue'}
                </button>
            </div>
        </div>
    );
};

export default OnboardingPage3;
