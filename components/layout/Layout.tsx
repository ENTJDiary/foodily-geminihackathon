import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getUserProfile } from '../../services/storageService';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const profile = getUserProfile();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      localStorage.clear();
      navigate('/');
    }
  };

  const navigateToSettings = () => {
    navigate('/Profile');
    setIsDropdownOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col font-sans text-brand-black bg-brand-cream/50 selection:bg-brand-orange/20 selection:text-brand-orange">
      {/* Hide header on Profile page */}
      {!isActive('/Profile') && (
        <header className="fixed top-4 left-4 right-4 z-50 transition-all duration-300">
          <div className="max-w-7xl mx-auto glass-panel rounded-2xl px-6 py-3 flex items-center justify-between">
            <button
              onClick={() => navigate('/FoodHunter')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none group"
            >
              <div className="w-10 h-10 bg-brand-orange rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-brand-orange/30 group-hover:scale-105 transition-transform duration-300">
                F
              </div>
              <h1 className="text-xl font-bold tracking-tight text-brand-slate hidden sm:block">
                Food<span className="text-brand-orange">.ily</span>
              </h1>
            </button>

            <nav className="hidden lg:flex items-center gap-2 bg-white/50 p-1 rounded-xl border border-white/40">
              {[
                { path: '/FoodHunter', label: 'Discovery' },
                { path: '/FoodGatcha', label: 'Food Gacha' },
                { path: '/Concierge', label: 'Planner' },
              ].map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive(item.path)
                      ? 'bg-white text-brand-orange shadow-sm'
                      : 'text-gray-500 hover:text-brand-slate hover:bg-white/40'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-white/40 transition-colors border border-transparent hover:border-white/40"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-orange to-orange-400 text-white flex items-center justify-center font-bold text-sm shadow-md">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-brand-slate hidden sm:block">{profile.name}</span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 glass-panel rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right p-1">
                    <button
                      onClick={navigateToSettings}
                      className="w-full px-4 py-2.5 flex items-center gap-3 text-brand-slate hover:bg-brand-orange/10 hover:text-brand-orange rounded-lg transition-colors text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2.5 flex items-center gap-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      <main className={`flex-1 mx-auto px-4 w-full transition-all duration-300 ${isActive('/Profile') ? 'pt-8 max-w-7xl' : 'pt-28 pb-24 lg:pb-12 max-w-7xl'}`}>
        {children}
      </main>

      {/* Conditional Footer - Hidden on Profile page */}
      {!isActive('/Profile') && <div className="hidden lg:block"><Footer /></div>}

      {/* Mobile Nav */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden glass-panel border-t border-white/20 flex justify-around items-center h-20 z-50 pb-2">
        <button
          onClick={() => navigate('/FoodHunter')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive('/FoodHunter') ? 'text-brand-orange bg-brand-orange/10' : 'text-gray-400'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <span className="text-[10px] font-bold">Discover</span>
        </button>
        <button
          onClick={() => navigate('/FoodGatcha')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive('/FoodGatcha') ? 'text-brand-orange bg-brand-orange/10' : 'text-gray-400'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="text-[10px] font-bold">Gacha</span>
        </button>
        <button
          onClick={() => navigate('/Concierge')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive('/Concierge') ? 'text-brand-orange bg-brand-orange/10' : 'text-gray-400'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          <span className="text-[10px] font-bold">Plan</span>
        </button>
        <button
          onClick={() => {
            setIsDropdownOpen(false);
            navigate('/Profile');
          }}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive('/Profile') ? 'text-brand-orange bg-brand-orange/10' : 'text-gray-400'}`}
        >
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${isActive('/Profile') ? 'border-brand-orange bg-brand-orange text-white' : 'border-gray-300 bg-gray-100 text-gray-500'}`}>
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
