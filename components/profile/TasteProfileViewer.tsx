import React from 'react';
import { TasteProfile } from '../../src/types/auth.types';

interface TasteProfileViewerProps {
    profile: TasteProfile | null;
    loading: boolean;
    onReset: () => void;
}

const TasteProfileViewer: React.FC<TasteProfileViewerProps> = ({ profile, loading, onReset }) => {
    if (loading) {
        return (
            <div className="glass-panel p-6 md:p-8 rounded-3xl shadow-sm">
                <h3 className="text-xs font-bold text-brand-slate/50 uppercase tracking-widest mb-6">
                    Your Taste Profile
                </h3>
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto"></div>
                    <p className="text-sm text-brand-slate/60 mt-4">Loading your taste profile...</p>
                </div>
            </div>
        );
    }

    if (!profile || profile.dataPoints === 0) {
        return (
            <div className="glass-panel p-6 md:p-8 rounded-3xl shadow-sm">
                <h3 className="text-xs font-bold text-brand-slate/50 uppercase tracking-widest mb-6">
                    Your Taste Profile
                </h3>
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-brand-orange/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <p className="text-sm text-brand-slate/60 font-medium">No data yet</p>
                    <p className="text-xs text-brand-slate/40 mt-2">
                        Start exploring restaurants to build your taste profile!
                    </p>
                </div>
            </div>
        );
    }

    // Get top cuisines
    const topCuisines = Object.entries(profile.cuisineScores)
        .sort(([, a], [, b]) => (b as any).score - (a as any).score)
        .slice(0, 5) as [string, { score: number; frequency: number; lastEaten?: Date; avgRating?: number }][];

    // Calculate max score for bar chart scaling
    const maxScore = Math.max(...topCuisines.map(([, data]) => data.score), 1);

    // Get time-based patterns
    const currentHour = new Date().getHours();
    const currentTimePrefs = profile.timePatterns.hourOfDay[currentHour] || [];

    return (
        <div className="glass-panel p-6 md:p-8 rounded-3xl shadow-sm space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xs font-bold text-brand-slate/50 uppercase tracking-widest">
                        Your Taste Profile
                    </h3>
                    <p className="text-xs text-brand-slate/40 mt-1">
                        Based on {profile.dataPoints} interactions
                    </p>
                </div>
                <button
                    onClick={onReset}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-slate/60 hover:text-brand-orange transition-colors border border-brand-slate/20 hover:border-brand-orange/30 rounded-xl"
                >
                    Reset Profile
                </button>
            </div>

            {/* Confidence Score */}
            <div className="bg-white/50 rounded-2xl p-4 border border-white/40">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-brand-slate/60 uppercase tracking-wider">
                        Profile Confidence
                    </span>
                    <span className="text-sm font-black text-brand-orange">
                        {Math.round(profile.confidenceScore)}%
                    </span>
                </div>
                <div className="w-full bg-brand-slate/10 rounded-full h-2 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-brand-orange to-orange-400 rounded-full transition-all duration-500"
                        style={{ width: `${profile.confidenceScore}%` }}
                    ></div>
                </div>
            </div>

            {/* Top Cuisines */}
            {topCuisines.length > 0 && (
                <div>
                    <h4 className="text-xs font-bold text-brand-slate/50 uppercase tracking-widest mb-4">
                        Top Cuisines
                    </h4>
                    <div className="space-y-3">
                        {topCuisines.map(([cuisine, data], index) => (
                            <div key={cuisine} className="group">
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-black text-brand-orange">
                                            #{index + 1}
                                        </span>
                                        <span className="text-sm font-bold text-brand-black">
                                            {cuisine}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-brand-slate/40">
                                            {data.frequency}x eaten
                                        </span>
                                        <span className="text-xs font-bold text-brand-orange">
                                            {Math.round(data.score)}
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full bg-brand-slate/10 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-brand-orange to-orange-400 rounded-full transition-all duration-500 group-hover:scale-105"
                                        style={{ width: `${(data.score / maxScore) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Time-Based Patterns */}
            {currentTimePrefs.length > 0 && (
                <div className="bg-gradient-to-br from-brand-orange/5 to-orange-50 rounded-2xl p-4 border border-brand-orange/10">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-brand-orange/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-xs font-bold text-brand-orange uppercase tracking-wider mb-1">
                                Right Now
                            </h4>
                            <p className="text-sm text-brand-slate/80">
                                You typically enjoy <span className="font-bold text-brand-black">{currentTimePrefs.slice(0, 3).join(', ')}</span> at this time
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Budget Indicator */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/50 rounded-2xl p-4 border border-white/40">
                    <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-brand-slate/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs font-bold text-brand-slate/50 uppercase tracking-wider">
                            Avg Budget
                        </span>
                    </div>
                    <p className="text-2xl font-black text-brand-black">
                        {'$'.repeat(Math.round(profile.budgetPreference.avgPriceRating))}
                        <span className="text-brand-slate/20">
                            {'$'.repeat(4 - Math.round(profile.budgetPreference.avgPriceRating))}
                        </span>
                    </p>
                </div>

                <div className="bg-white/50 rounded-2xl p-4 border border-white/40">
                    <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-brand-slate/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-xs font-bold text-brand-slate/50 uppercase tracking-wider">
                            Max Distance
                        </span>
                    </div>
                    <p className="text-2xl font-black text-brand-black">
                        {profile.locationPreference.maxDistance}
                        <span className="text-sm font-medium text-brand-slate/60 ml-1">km</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TasteProfileViewer;
