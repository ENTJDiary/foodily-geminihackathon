import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import { OnboardingFormData } from '../src/types/onboarding.types';
import { saveOnboardingData } from '../services/onboardingService';
import OnboardingPage1 from './onboarding/OnboardingPage1';
import OnboardingPage2 from './onboarding/OnboardingPage2';
import OnboardingPage3 from './onboarding/OnboardingPage3';

const Onboarding: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<OnboardingFormData>({
        city: '',
        dateOfBirth: '',
        sex: '',
        cuisinePreferences: [],
        dietaryRestrictions: [],
        termsAccepted: false,
    });

    const updateFormData = (updates: Partial<OnboardingFormData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    const handleNext = () => {
        if (currentPage < 3) {
            setCurrentPage(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const handleComplete = async () => {
        if (!currentUser) {
            setError('User not authenticated');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await saveOnboardingData(currentUser.uid, formData);
            // Redirect to FoodHunter page
            navigate(`/FoodHunter/${currentUser.uid}`);
        } catch (err: any) {
            console.error('Error completing onboarding:', err);
            setError(err.message || 'Failed to save your preferences. Please try again.');
            setLoading(false);
        }
    };

    const totalPages = 3;
    const progress = (currentPage / totalPages) * 100;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-inter relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute top-[-15%] right-[-10%] w-[50%] h-[50%] bg-orange-500 rounded-full blur-[150px]"></div>
                <div className="absolute bottom-[-15%] left-[-10%] w-[50%] h-[50%] bg-orange-400 rounded-full blur-[150px]"></div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
                <div className="w-full max-w-3xl">
                    {/* Logo */}
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-orange-100">
                            F
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-orange-600">Food.ily</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-black text-slate-700 uppercase tracking-wide">
                                Step {currentPage} of {totalPages}
                            </span>
                            <span className="text-sm font-bold text-orange-600">
                                {Math.round(progress)}% Complete
                            </span>
                        </div>
                        <div className="h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                            <div
                                className="h-full bg-gradient-to-r from-orange-600 to-orange-500 rounded-full transition-all duration-500 ease-out shadow-lg"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Onboarding Card */}
                    <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl border-2 border-orange-100 backdrop-blur-sm">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                                <p className="text-red-600 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
                                <p className="text-slate-600 font-medium">Setting up your profile...</p>
                            </div>
                        ) : (
                            <>
                                {currentPage === 1 && (
                                    <OnboardingPage1
                                        formData={formData}
                                        updateFormData={updateFormData}
                                        onNext={handleNext}
                                    />
                                )}
                                {currentPage === 2 && (
                                    <OnboardingPage2
                                        formData={formData}
                                        updateFormData={updateFormData}
                                        onNext={handleNext}
                                        onBack={handleBack}
                                    />
                                )}
                                {currentPage === 3 && (
                                    <OnboardingPage3
                                        formData={formData}
                                        updateFormData={updateFormData}
                                        onNext={handleNext}
                                        onBack={handleBack}
                                    />
                                )}
                            </>
                        )}
                    </div>

                    {/* Page Indicators */}
                    <div className="flex justify-center gap-2 mt-6">
                        {[1, 2, 3].map(page => (
                            <div
                                key={page}
                                className={`h-2 rounded-full transition-all duration-300 ${page === currentPage
                                        ? 'w-8 bg-orange-600'
                                        : page < currentPage
                                            ? 'w-2 bg-orange-400'
                                            : 'w-2 bg-slate-300'
                                    }`}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
