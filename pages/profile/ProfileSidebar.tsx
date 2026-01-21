import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearSearchHistory } from '../../services/storageService';

type TabType = 'account' | 'activity' | 'saved' | 'stats';

interface ProfileSidebarProps {
    activeTab: TabType;
    setActiveTab: (tab: TabType) => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ activeTab, setActiveTab }) => {
    const navigate = useNavigate();

    const sidebarItems: { id: TabType; label: string; description: string; icon: React.ReactNode }[] = [
        {
            id: 'account',
            label: 'Account Detail',
            description: 'Account Details & Preference',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
        },
        {
            id: 'activity',
            label: 'Activity',
            description: 'Your Recent Picks',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
        },
        {
            id: 'saved',
            label: 'Saved',
            description: 'To be Discovered',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
            ),
        },
        {
            id: 'stats',
            label: 'Stats',
            description: 'Your Unique Tastebuds',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
            ),
        },
    ];

    return (
        <div className="w-full lg:w-72 flex-shrink-0 space-y-4">
            {/* First Frame: Navigation Items */}
            <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
                {/* Back to Home */}
                <div className="flex pl-5 pt-4">
                    <Link
                        to="/FoodHunter"
                        className="inline-flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-wider"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>

                        <span className="text-[10px]">Back to Home</span>
                    </Link>
                </div>

                <nav className="p-4 space-y-2">
                    {sidebarItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-start gap-3 px-4 py-4 rounded-xl text-left transition-all ${activeTab === item.id
                                ? 'bg-orange-50 text-orange-600 border border-orange-200'
                                : 'text-slate-500 hover:bg-slate-50 border border-transparent'
                                }`}
                        >
                            <span className={`flex-shrink-0 self-center ${activeTab === item.id ? 'text-orange-600' : 'text-slate-400'}`}>{item.icon}</span>
                            <div className="flex-1">
                                <div className="text-xs font-black uppercase tracking-wider">{item.label}</div>
                                <div className="text-[10px] font-medium text-slate-400 mt-0.5">{item.description}</div>
                            </div>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Second Frame: Feedback & Help */}
            <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
                <div className="p-4 space-y-3">
                    <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                        Have a feature request, bug report, or a new idea?
                    </p>

                    <div className="space-y-2">
                        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-slate-500 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-300">
                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            <span className="text-xs font-black uppercase tracking-wider">Send Feedback</span>
                        </button>

                        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-slate-500 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-300">
                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs font-black uppercase tracking-wider">Help</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Standalone Logout CTA */}
            <button
                onClick={() => { if (confirm('Are you sure you want to logout?')) { clearSearchHistory(); navigate('/'); } }}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm hover:shadow-md font-black text-sm uppercase tracking-wider"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
            </button>
        </div>
    );
};

export default ProfileSidebar;
