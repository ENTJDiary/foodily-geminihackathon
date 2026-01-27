import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EmailSignup: React.FC = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            // Redirect to signup page with email pre-filled
            navigate('/signup', { state: { email } });
        }
    };

    return (
        <div className="w-full py-24 px-6 bg-white">
            <div className="max-w-4xl mx-auto text-center space-y-8">

                {/* Heading */}
                <div className="space-y-4">
                    <h2 className="text-5xl lg:text-6xl font-black text-slate-900 leading-tight">
                        Join the Food Revolution
                    </h2>
                    <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto">
                        Get early access to personalized food recommendations powered by AI.
                        Start discovering your next favorite dish today.
                    </p>
                </div>

                {/* Email Form */}
                <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            className="flex-1 px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none text-lg font-medium transition-colors duration-300"
                        />
                        <button
                            type="submit"
                            className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl whitespace-nowrap"
                        >
                            Get Started
                        </button>
                    </div>
                </form>

                {/* Trust indicators */}
                <div className="flex flex-wrap justify-center items-center gap-8 pt-8 text-slate-500">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-semibold">Free to join</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-semibold">No credit card required</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-semibold">Cancel anytime</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default EmailSignup;
