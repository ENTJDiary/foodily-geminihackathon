import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import { hasCompletedOnboarding } from '../services/onboardingService';

const InitializingUser: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser, userProfile, loading, error, signOut } = useAuth();
    const [checkingOnboarding, setCheckingOnboarding] = useState(true);

    useEffect(() => {
        const checkAndRedirect = async () => {
            // Wait for auth to finish loading
            if (loading) return;

            // If no user or profile, don't proceed
            if (!currentUser || !userProfile) {
                setCheckingOnboarding(false);
                return;
            }

            // Check if user has completed onboarding
            const completed = await hasCompletedOnboarding(currentUser.uid);

            if (completed) {
                // Existing user - go to FoodHunter
                navigate(`/FoodHunter/${currentUser.uid}`);
            } else {
                // New user - go to onboarding
                navigate('/onboarding');
            }

            setCheckingOnboarding(false);
        };

        checkAndRedirect();
    }, [loading, currentUser, userProfile, navigate]);

    // Handle stuck state or error
    if (!loading && !checkingOnboarding && (!currentUser || !userProfile)) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Initialization Failed</h2>
                <p className="text-slate-600 mb-8 max-w-sm">
                    {error || "We couldn't set up your profile. This might be a connection issue."}
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors"
                    >
                        Retry
                    </button>
                    <button
                        onClick={() => signOut().then(() => navigate('/login'))}
                        className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center relative overflow-hidden">
            {/* Animated Background Blobs */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-orange-400 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-orange-300 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 text-center px-6">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-orange-200 animate-bounce">
                        F
                    </div>
                    <span className="text-3xl font-black tracking-tighter text-orange-600">Food.ily</span>
                </div>

                {/* Loading Animation */}
                <div className="mb-8">
                    <div className="relative w-24 h-24 mx-auto">
                        {/* Outer Ring */}
                        <div className="absolute inset-0 border-4 border-orange-200 rounded-full"></div>

                        {/* Spinning Ring */}
                        <div className="absolute inset-0 border-4 border-transparent border-t-orange-600 rounded-full animate-spin"></div>

                        {/* Inner Pulsing Circle */}
                        <div className="absolute inset-3 bg-orange-600 rounded-full animate-pulse opacity-20"></div>
                    </div>
                </div>

                {/* Status Text */}
                <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
                    Setting up your culinary profile...
                </h2>
                <p className="text-lg text-slate-600 font-medium max-w-md mx-auto">
                    We're preparing your personalized food discovery experience
                </p>

                {/* Loading Dots */}
                <div className="flex items-center justify-center gap-2 mt-8">
                    <div className="w-3 h-3 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-3 h-3 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-3 h-3 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
            </div>
        </div>
    );
};

export default InitializingUser;
