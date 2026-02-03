import React from 'react';
import { TasteProfile } from '../../src/types/auth.types';

interface TasteProfileViewerProps {
    profile: TasteProfile | null;
    loading: boolean;
    onReset: () => void;
    onRefresh?: () => void;
    userId?: string; // NEW: For validation
}

const TasteProfileViewer: React.FC<TasteProfileViewerProps> = ({ profile, loading, onReset, onRefresh, userId }) => {
    // SECURITY: Validate profile belongs to current user
    if (profile && userId && profile.userId !== userId) {
        console.error('❌ [TasteProfileViewer] SECURITY: Profile userId mismatch!');
        console.error('Expected:', userId);
        console.error('Got:', profile.userId);
        // Treat as no profile
        profile = null;
    }

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
        .slice(0, 3) as [string, { score: number; frequency: number; lastEaten?: Date; avgRating?: number }][];

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
                <div className="flex items-center gap-2">
                    {/* Manual Refresh Button (only show when profile is complete) */}
                    {profile.confidenceScore >= 100 && onRefresh && (
                        <button
                            onClick={onRefresh}
                            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-orange hover:text-orange-600 transition-colors border border-brand-orange/30 hover:border-brand-orange/50 rounded-xl flex items-center gap-2"
                            title="Manually refresh your taste profile"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                        </button>
                    )}
                </div>
            </div>

            {/* Confidence Score - Hide when 100% */}
            {profile.confidenceScore < 100 && (
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
            )}

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
        </div>
    );
};

export default TasteProfileViewer;
