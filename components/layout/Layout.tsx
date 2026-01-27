import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/contexts/AuthContext';
import { getUserProfile } from '../../services/storageService';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const profile = getUserProfile();
  const { currentUser } = useAuth();
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
    if (currentUser) {
      navigate(`/Profile/${currentUser.uid}`);
      setIsDropdownOpen(false);
    }
  };

  // Check if current path matches the base route (e.g., /FoodHunter/:userid matches /FoodHunter)
  const isActive = (basePath: string) => location.pathname.startsWith(basePath);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hide header on Profile page */}
      {!isActive('/Profile') && (
        <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-orange-50 z-50 px-8 py-4 flex items-center justify-between shadow-sm">
          <button
            onClick={() => currentUser && navigate(`/FoodHunter/${currentUser.uid}`)}
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
              onClick={() => currentUser && navigate(`/FoodHunter/${currentUser.uid}`)}
              className={`text-sm font-bold transition-colors ${isActive('/FoodHunter') ? 'text-orange-600' : 'text-gray-400 hover:text-orange-600'}`}
            >
              Foodiscovery
            </button>
            <button
              onClick={() => currentUser && navigate(`/FoodGatcha/${currentUser.uid}`)}
              className={`text-sm font-bold transition-colors ${isActive('/FoodGatcha') ? 'text-orange-600' : 'text-gray-400 hover:text-orange-600'}`}
            >
              Food Gacha
            </button>
            <button
              onClick={() => currentUser && navigate(`/Concierge/${currentUser.uid}`)}
              className={`text-sm font-bold transition-colors ${isActive('/Concierge') ? 'text-orange-600' : 'text-gray-400 hover:text-orange-600'}`}
            >
              Food Planner
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
      )}

      <main className={`flex-1 mx-auto px-6 pb-12 w-full ${isActive('/Profile') ? 'pt-16 max-w-7xl' : 'pt-32 max-w-5xl'}`}>
        {children}
      </main>

      {/* Conditional Footer - Hidden on Profile page */}
      {!isActive('/Profile') && <Footer />}

      {/* Mobile Nav */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-orange-50 flex justify-around items-center h-16 z-50">
        <button
          onClick={() => currentUser && navigate(`/FoodHunter/${currentUser.uid}`)}
          className={`flex flex-col items-center gap-1 ${isActive('/FoodHunter') ? 'text-orange-600' : 'text-gray-400'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <span className="text-[10px] font-bold uppercase tracking-widest">Discovery</span>
        </button>
        <button
          onClick={() => currentUser && navigate(`/FoodGatcha/${currentUser.uid}`)}
          className={`flex flex-col items-center gap-1 ${isActive('/FoodGatcha') ? 'text-orange-600' : 'text-gray-400'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          <span className="text-[10px] font-bold uppercase tracking-widest">Gacha</span>
        </button>
        <button
          onClick={() => currentUser && navigate(`/Concierge/${currentUser.uid}`)}
          className={`flex flex-col items-center gap-1 ${isActive('/Concierge') ? 'text-orange-600' : 'text-gray-400'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
          <span className="text-[10px] font-bold uppercase tracking-widest">Planner</span>
        </button>
        <button
          onClick={() => {
            setIsDropdownOpen(false);
            if (currentUser) navigate(`/Profile/${currentUser.uid}`);
          }}
          className={`flex flex-col items-center gap-1 ${isActive('/Profile') ? 'text-orange-600' : 'text-gray-400'}`}
        >
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold border-2 transition-all ${isActive('/Profile') ? 'border-orange-600 bg-orange-600 text-white' : 'border-gray-200 bg-gray-50 text-gray-400'}`}>
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
