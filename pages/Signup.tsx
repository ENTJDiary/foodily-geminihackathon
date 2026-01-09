import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import Footer from '../components/layout/Footer';

const Signup: React.FC = () => {
    const navigate = useNavigate();
    const { signInWithGoogle, signInWithEmailOTP, error: authError } = useAuth();
    const [email, setEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [verificationId, setVerificationId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleEmailSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            const verifyId = await signInWithEmailOTP(email);
            setVerificationId(verifyId);
            setSuccess('Code sent! Please check your email.');
        } catch (err: any) {
            setError(err.userMessage || 'Failed to send code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!verificationId) return;

        setError(null);
        setLoading(true);

        try {
            // Note: This will throw an error until Cloud Function is implemented
            // For now, use Google Sign-In
            setError('Email OTP verification requires Cloud Function implementation. Please use Google Sign-In for now.');
        } catch (err: any) {
            setError(err.userMessage || 'Invalid code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        setError(null);
        setLoading(true);

        try {
            await signInWithGoogle();
            // Redirect to initializing page which will wait for user profile
            // and then redirect to /FoodHunter/:userid
            navigate('/initializing');
        } catch (err: any) {
            setError(err.userMessage || 'Failed to sign in with Google. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-inter relative">
            {/* Decorative Background */}
            <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
                <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-orange-500 rounded-full blur-[150px]"></div>
                <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-orange-400 rounded-full blur-[150px]"></div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
                <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-20 items-center">

                    {/* Left Column: Value Prop */}
                    <div className="space-y-10">
                        {/* Logo */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-orange-100">
                                F
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-orange-600">Food.ily</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-slate-900">
                            Start your <span className="text-orange-600">food discovery</span> journey today
                        </h1>

                        <div className="space-y-5">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 bg-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-100">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-lg text-slate-600 font-medium">Hyper-personalized food recommendations</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 bg-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-100">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-lg text-slate-600 font-medium">AI-powered craving analysis</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 bg-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-100">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-lg text-slate-600 font-medium">Community-verified local gems</p>
                            </div>
                        </div>

                        <p className="text-slate-500 text-base font-medium italic">
                            Join thousands of foodies discovering their next favorite dish.
                        </p>
                    </div>

                    {/* Right Column: Signup Card */}
                    <div className="bg-white rounded-3xl p-10 shadow-2xl border-2 border-orange-100 backdrop-blur-sm">
                        <h2 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">Sign Up</h2>
                        <p className="text-slate-500 font-medium mb-8">Begin your culinary adventure</p>

                        {/* Error Message */}
                        {(error || authError) && (
                            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                                <p className="text-red-600 text-sm font-medium">{error || authError}</p>
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                                <p className="text-green-600 text-sm font-medium">{success}</p>
                            </div>
                        )}

                        {/* Google Button */}
                        <button
                            onClick={handleGoogleSignup}
                            disabled={loading}
                            className="w-full bg-white hover:bg-slate-50 text-slate-900 font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 mb-6 border-2 border-slate-200 hover:border-orange-600 hover:shadow-lg hover:shadow-orange-100 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="w-6 h-6 flex items-center justify-center">
                                <svg viewBox="0 0 24 24" className="w-full h-full">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                            </div>
                            <span className="text-sm uppercase tracking-wider">
                                {loading ? 'Signing up...' : 'Continue with Google'}
                            </span>
                        </button>

                        {/* Divider */}
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                                <span className="px-4 bg-white text-slate-400">OR</span>
                            </div>
                        </div>

                        {/* Email OTP Form */}
                        {!verificationId ? (
                            <form onSubmit={handleEmailSignup} className="space-y-6">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent transition-all font-medium hover:border-orange-300"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4 px-6 rounded-xl transition-all duration-300 text-sm uppercase tracking-widest shadow-xl shadow-orange-200 hover:shadow-2xl hover:shadow-orange-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Sending...' : 'Send Code'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOTP} className="space-y-6">
                                <div>
                                    <label htmlFor="code" className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">
                                        Enter 6-Digit Code
                                    </label>
                                    <input
                                        type="text"
                                        id="code"
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value)}
                                        placeholder="000000"
                                        maxLength={6}
                                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent transition-all font-medium hover:border-orange-300 text-center text-2xl tracking-widest"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4 px-6 rounded-xl transition-all duration-300 text-sm uppercase tracking-widest shadow-xl shadow-orange-200 hover:shadow-2xl hover:shadow-orange-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Verifying...' : 'Verify Code'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setVerificationId(null);
                                        setOtpCode('');
                                        setError(null);
                                        setSuccess(null);
                                    }}
                                    className="w-full text-slate-600 hover:text-orange-600 font-medium text-sm transition-colors"
                                >
                                    Use different email
                                </button>
                            </form>
                        )}

                        {/* Footer Links */}
                        <div className="mt-8 space-y-4">
                            <p className="text-slate-400 text-xs text-center leading-relaxed">
                                By signing up, you agree to Food.ily's <a href="#" className="text-orange-600 hover:text-orange-700 font-semibold">Terms of Service</a> and <a href="#" className="text-orange-600 hover:text-orange-700 font-semibold">Privacy Policy</a>.
                            </p>
                            <p className="text-slate-500 text-sm text-center font-medium">
                                Already have an account?{' '}
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-orange-600 font-bold hover:text-orange-700 hover:underline transition-colors"
                                >
                                    Log in
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer positioned at 20% from bottom */}
            <div className="relative z-10">
                <Footer />
            </div>
        </div>
    );
};

export default Signup;
