import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EmailSignup: React.FC = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();



    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            navigate('/signup', { state: { email } });
        }
    };

    return (
        <div className="relative w-full h-full flex items-center justify-center p-6">

            {/* Ambient Background Glow (Optional enhancement) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/50 blur-3xl pointer-events-none -z-10" />

            {/* Main Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/50 p-8 md:p-12 max-w-xl w-full text-center relative overflow-hidden">

                {/* Content Container */}
                <div className="space-y-8 relative z-10">

                    {/* Header */}
                    <div className="space-y-3">
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 font-sans tracking-tight">
                            Join the waitlist
                        </h2>
                        <p className="text-slate-500 font-medium font-inter text-sm md:text-base max-w-md mx-auto leading-relaxed">
                            Get early access to Foodily, the intelligent AI food companion built for modern foodies.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@email.com"
                            required
                            className="flex-1 px-5 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all font-inter text-slate-700 placeholder:text-slate-400"
                        />
                        <button
                            type="submit"
                            className="bg-slate-900 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold font-inter text-sm transition-all duration-300 shadow-lg hover:shadow-orange-500/20 active:scale-95 shrink-0"
                        >
                            Sign Up
                        </button>
                    </form>

                    {/* Social Proof */}
                    <div className="flex items-center justify-center gap-3 py-2">
                        <div className="flex -space-x-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                                    <img src={`https://i.pravatar.cc/100?img=${i + 20}`} alt="User" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                        <span className="text-xs font-semibold text-slate-400 font-inter">
                            + 10k Foodies is interested in Food.ily
                        </span>
                    </div>



                </div>
            </div>
        </div>
    );
};

export default EmailSignup;
