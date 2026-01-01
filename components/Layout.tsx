
import React, { useState, useRef, useEffect } from 'react';
import { AppTab } from '../types';
import { getUserProfile } from '../services/storageService';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const profile = getUserProfile();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      window.location.reload();
    }
  };

  const navigateToSettings = () => {
    setActiveTab('profile');
    setIsDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-orange-50 z-50 px-8 py-4 flex items-center justify-between shadow-sm">
        <button
          onClick={() => setActiveTab('search')}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none"
        >
          <div className="w-9 h-9 bg-orange-600 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-md shadow-orange-200">
            F
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-orange-600">
            Food.ily
          </h1>
        </button>

        <nav className="hidden lg:flex items-center gap-10">
          <button
            onClick={() => setActiveTab('search')}
            className={`text-sm font-bold transition-colors ${activeTab === 'search' ? 'text-orange-600' : 'text-gray-400 hover:text-orange-600'}`}
          >
            Find Restaurants
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`text-sm font-bold transition-colors ${activeTab === 'chat' ? 'text-orange-600' : 'text-gray-400 hover:text-orange-600'}`}
          >
            Food Assistant
          </button>
          <button
            onClick={() => setActiveTab('concierge')}
            className={`text-sm font-bold transition-colors ${activeTab === 'concierge' ? 'text-orange-600' : 'text-gray-400 hover:text-orange-600'}`}
          >
            Dining Concierge
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center justify-center w-8 h-8 rounded-full transition-all text-white font-bold text-xs bg-orange-500 hover:scale-105 active:scale-95 shadow-md shadow-orange-100`}
            >
              {profile.name.charAt(0).toUpperCase()}
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-4 w-52 bg-[#121212] rounded-xl shadow-2xl border border-white/5 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[60]">
                <button
                  onClick={navigateToSettings}
                  className="w-full px-4 py-3 flex items-center gap-3 text-white hover:bg-orange-600/20 transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  <span className="font-semibold text-sm">Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 flex items-center gap-3 text-white hover:bg-orange-600/20 transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="font-semibold text-sm">Log Out</span>
                </button>
              </div>
            )}
          </div>
        </nav>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-6 pt-32 pb-24 w-full">
        {children}
      </main>

      {/* Conditional Footer - Hidden on Profile page */}
      {activeTab !== 'profile' && (
        <footer className="bg-white border-t border-orange-50 pt-16 pb-32 lg:pb-16 px-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
          <div className="max-w-5xl mx-auto flex flex-col items-center">
            <div className="flex items-center gap-2 mb-8 grayscale opacity-20">
              <div className="w-5 h-5 bg-slate-900 rounded flex items-center justify-center text-white font-black text-[10px]">F</div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">Food.ily</span>
            </div>

            <div className="flex items-center justify-center gap-8 md:gap-16">
              <a href="#" className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-orange-600 transition-colors">ToS</a>
              <div className="w-px h-3 bg-slate-100 hidden md:block"></div>
              <a href="#" className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-orange-600 transition-colors">Privacy</a>
              <div className="w-px h-3 bg-slate-100 hidden md:block"></div>
              <a href="#" className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-orange-600 transition-colors">Cookies</a>
            </div>

            <div className="mt-12 text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em]">
              &copy; {new Date().getFullYear()} Gourmet Insights
            </div>
          </div>
        </footer>
      )}

      {/* Mobile Nav */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-orange-50 flex justify-around items-center h-16 z-50">
        <button
          onClick={() => setActiveTab('search')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'search' ? 'text-orange-600' : 'text-gray-400'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <span className="text-[10px] font-bold uppercase tracking-widest">Search</span>
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'chat' ? 'text-orange-600' : 'text-gray-400'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          <span className="text-[10px] font-bold uppercase tracking-widest">Assistant</span>
        </button>
        <button
          onClick={() => setActiveTab('concierge')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'concierge' ? 'text-orange-600' : 'text-gray-400'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
          <span className="text-[10px] font-bold uppercase tracking-widest">Concierge</span>
        </button>
        <button
          onClick={() => {
            setIsDropdownOpen(false);
            setActiveTab('profile');
          }}
          className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-orange-600' : 'text-gray-400'}`}
        >
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold border-2 transition-all ${activeTab === 'profile' ? 'border-orange-600 bg-orange-600 text-white' : 'border-gray-200 bg-gray-50 text-gray-400'}`}>
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
