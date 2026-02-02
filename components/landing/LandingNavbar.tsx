import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface LandingNavbarProps {
    isScrolled?: boolean;
}

const LandingNavbar: React.FC<LandingNavbarProps> = ({ isScrolled: externalScrolled }) => {
    const navigate = useNavigate();
    const [internalScrolled, setInternalScrolled] = useState(false);

    // Use external prop if provided, otherwise track window scroll
    const isScrolled = externalScrolled !== undefined ? externalScrolled : internalScrolled;

    // Handle scroll effect for glassmorphism (fallback for window scroll)
    useEffect(() => {
        if (externalScrolled !== undefined) return;

        const handleScroll = () => {
            setInternalScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [externalScrolled]);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-white/80 backdrop-blur-md shadow-sm py-4'
                : 'bg-transparent py-6'
                }`}
        >
            <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">

                {/* Logo */}
                <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => {
                        // Try to find the scroll container first, or fallback to window
                        const hero = document.getElementById('hero');
                        if (hero) hero.scrollIntoView({ behavior: 'smooth' });
                        else window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                >
                    <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-200">
                        F
                    </div>
                    <span className="text-2xl font-black tracking-tight text-slate-900 hidden sm:block font-sans">
                        Food.ily
                    </span>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    <button
                        onClick={() => scrollToSection('why-foodily')}
                        className="text-slate-600 font-bold hover:text-orange-600 transition-colors text-sm uppercase tracking-wide font-inter font-medium"
                    >
                        Why Food.ily
                    </button>
                    <button
                        onClick={() => scrollToSection('features')}
                        className="text-slate-600 font-bold hover:text-orange-600 transition-colors text-sm uppercase tracking-wide font-inter font-medium"
                    >
                        Features
                    </button>
                    <button
                        onClick={() => scrollToSection('community')}
                        className="text-slate-600 font-bold hover:text-orange-600 transition-colors text-sm uppercase tracking-wide font-inter font-medium"
                    >
                        Community Favourites
                    </button>
                    <button
                        onClick={() => scrollToSection('join')}
                        className="text-slate-600 font-bold hover:text-orange-600 transition-colors text-sm uppercase tracking-wide font-inter font-medium"
                    >
                        Waitlist
                    </button>
                </div>

                {/* CTA Button */}
                <div>
                    <button
                        onClick={() => navigate('/signup')}
                        className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-orange-600 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-200 font-inter font-medium"
                    >
                        Join Now
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default LandingNavbar;
