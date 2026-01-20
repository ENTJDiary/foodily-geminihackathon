import React, { useMemo } from 'react';
import { SearchResult } from '../../../types';

interface GourmetBriefPageProps {
    details: SearchResult | null;
    loadingDetails: boolean;
    error?: string | null;
    onRetry?: () => void;
}

interface ParsedBrief {
    description: string;
    hours: string[];
    popularDishes: { name: string; description: string }[];
    priceRating: number;
}

const GourmetBriefPage: React.FC<GourmetBriefPageProps> = ({ details, loadingDetails, error, onRetry }) => {
    // Helper to clean Markdown-like syntax for display
    const cleanText = (text: string) => {
        return text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\+\+(.*?)\+\+/g, '$1');
    };

    const parsedContent = useMemo((): ParsedBrief | null => {
        if (!details?.text) return null;

        const text = details.text;
        const result: ParsedBrief = {
            description: '',
            hours: [],
            popularDishes: [],
            priceRating: 0
        };

        // Extract Description (usually the first block before any headers)
        const descriptionMatch = text.split('###')[0].trim();
        result.description = descriptionMatch;

        // Extract Opening Hours
        const hoursSection = text.match(/### Current Opening Hours([\s\S]*?)(?=###|\*\*Price|$)/);
        if (hoursSection) {
            result.hours = hoursSection[1]
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.startsWith('*') || line.startsWith('+')) // Keep bullets and notes
                .map(line => line.replace(/^[\*\+]\s*/, '')); // Remove bullet char
        }

        // Extract Popular Dishes
        const dishesSection = text.match(/### Top 3 Popular Dishes([\s\S]*?)(?=###|\*\*Price|$)/);
        if (dishesSection) {
            const dishLines = dishesSection[1]
                .split('\n')
                .map(line => line.trim())
                .filter(line => /^\d+\./.test(line)); // Look for numbered list 1. 2. 3.

            result.popularDishes = dishLines.map(line => {
                // Try to split by first colon or bold end if possible
                // Format: "1. **Name:** Description" or "1. **Name**: Description"
                const parts = line.replace(/^\d+\.\s*/, '').split(/[:?]\s+/);
                return {
                    name: cleanText(parts[0]),
                    description: cleanText(parts.slice(1).join(': '))
                };
            });
        }

        // Extract Price Rating
        const priceMatch = text.match(/\*\*Price Rating:\s*([0-4])\/4\*\*/);
        if (priceMatch) {
            result.priceRating = parseInt(priceMatch[1]);
        }

        return result;
    }, [details?.text]);

    const sourceLinks = details?.groundingChunks
        ?.map(chunk => chunk.web?.uri)
        .filter((uri): uri is string => !!uri) || [];

    if (loadingDetails) {
        return (
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 space-y-4 animate-pulse">
                <div className="h-6 bg-slate-800 rounded w-1/3"></div>
                <div className="h-24 bg-slate-800 rounded w-full"></div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-20 bg-slate-800 rounded"></div>
                    <div className="h-20 bg-slate-800 rounded"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-red-900/20 rounded-3xl border border-red-500/30 space-y-4">
                <div className="flex items-center justify-center gap-2 text-red-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="font-bold">Failed to load Gourmet Brief</p>
                </div>
                <p className="text-sm text-red-300">{error}</p>
                <p className="text-xs text-red-400/70 italic">Please try again or check your connection</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/30 flex items-center gap-2 mx-auto"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Retry
                    </button>
                )}
            </div>
        );
    }

    if (!parsedContent) {
        return (
            <div className="p-8 text-center text-slate-500 bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed">
                <p className="italic">Scouting for intel...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header / Brief Card - Translucent Glassmorphism */}
            <div className="bg-gradient-to-br from-orange-500/10 via-orange-600/5 to-amber-500/10 backdrop-blur-md p-6 rounded-[2rem] border border-orange-500/20 relative overflow-hidden group shadow-xl hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500">
                {/* Animated Background Pattern */}
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-700 text-orange-400">
                    <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" /></svg>
                </div>

                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500/30 to-orange-600/30 backdrop-blur-sm flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform duration-300 border border-orange-400/20">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </div>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-orange-400">Gourmet Brief</h3>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-full">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                            <span className="text-[9px] font-bold text-green-400 uppercase tracking-widest">Live</span>
                        </div>
                    </div>

                    <div className="prose prose-invert prose-sm max-w-none">
                        <p className="text-slate-200 text-sm leading-relaxed font-medium">
                            {cleanText(parsedContent.description)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Popular Dishes / Loot Crate - Translucent */}
                {parsedContent.popularDishes.length > 0 && (
                    <div className="bg-gradient-to-br from-purple-500/10 via-purple-600/5 to-pink-500/10 backdrop-blur-md p-5 rounded-[1.5rem] border border-purple-500/20 hover:border-purple-400/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                        <div className="flex items-center gap-2 mb-4">
                            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-purple-300">Signature Loot</h4>
                        </div>
                        <div className="space-y-3">
                            {parsedContent.popularDishes.map((dish, i) => (
                                <div key={i} className="bg-slate-800/30 backdrop-blur-sm p-3 rounded-xl border border-slate-600/30 flex gap-3 items-start group hover:border-purple-500/40 hover:bg-purple-500/10 transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                                    <div className={`
                                        w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-black border backdrop-blur-sm transition-all duration-300
                                        ${i === 0 ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400 group-hover:bg-yellow-500/30 group-hover:border-yellow-400/60 group-hover:shadow-lg group-hover:shadow-yellow-500/20' :
                                            i === 1 ? 'bg-slate-400/20 border-slate-400/40 text-slate-300 group-hover:bg-slate-400/30 group-hover:border-slate-300/60 group-hover:shadow-lg group-hover:shadow-slate-400/20' :
                                                'bg-orange-600/20 border-orange-600/40 text-orange-400 group-hover:bg-orange-600/30 group-hover:border-orange-400/60 group-hover:shadow-lg group-hover:shadow-orange-500/20'}
                                    `}>
                                        #{i + 1}
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-100 group-hover:text-purple-200 transition-colors">{dish.name}</div>
                                        {dish.description && (
                                            <p className="text-[10px] text-slate-300 leading-snug mt-1 line-clamp-2">{dish.description}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Hours / Mission Timer - Translucent */}
                {parsedContent.hours.length > 0 && (
                    <div className="bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-cyan-500/10 backdrop-blur-md p-5 rounded-[1.5rem] border border-blue-500/20 hover:border-blue-400/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
                        <div className="flex items-center gap-2 mb-4">
                            <svg className="w-4 h-4 text-blue-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-300">Operation Hours</h4>
                        </div>
                        <div className="space-y-2">
                            {parsedContent.hours.slice(0, 5).map((hour, i) => (
                                <div key={i} className="flex items-start gap-2 text-[11px] group hover:translate-x-1 transition-transform duration-200">
                                    <div className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 flex-shrink-0 group-hover:scale-150 group-hover:shadow-lg group-hover:shadow-blue-400/50 transition-all duration-200"></div>
                                    <span className="text-slate-200 group-hover:text-blue-200 transition-colors">{cleanText(hour)}</span>
                                </div>
                            ))}
                            {parsedContent.hours.length > 5 && (
                                <div className="text-[10px] text-slate-400 italic pl-3">+ {parsedContent.hours.length - 5} more schedules</div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Sources Footer with Enhanced Hover Effects - Translucent */}
            {sourceLinks.length > 0 && (
                <div className="flex flex-wrap gap-2 px-2">
                    {sourceLinks.map((link, i) => (
                        <a
                            key={i}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-slate-700/20 backdrop-blur-sm hover:bg-gradient-to-r hover:from-orange-500/30 hover:to-orange-600/30 border border-slate-600/30 hover:border-orange-500/50 px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-300 hover:text-orange-300 transition-all duration-300 flex items-center gap-1.5 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/20"
                        >
                            <span>SOURCE {i + 1}</span>
                            <svg className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GourmetBriefPage;
