import React from 'react';
import { SearchResult } from '../../../types';

interface GourmetBriefPageProps {
    details: SearchResult | null;
    loadingDetails: boolean;
}

const GourmetBriefPage: React.FC<GourmetBriefPageProps> = ({ details, loadingDetails }) => {
    const sourceLinks = details?.groundingChunks
        ?.map(chunk => chunk.web?.uri)
        .filter((uri): uri is string => !!uri) || [];

    return (
        <section className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
            <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-400">Gourmet Brief</h3>
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Live Grounding</span>
                    </div>
                </div>

                {loadingDetails ? (
                    <div className="py-6 space-y-4">
                        <div className="h-4 bg-slate-800 rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-slate-800 rounded w-1/2 animate-pulse"></div>
                    </div>
                ) : details ? (
                    <div className="space-y-6">
                        <div className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-slate-200">
                            {details.text}
                        </div>
                        {sourceLinks.length > 0 && (
                            <div className="pt-4 border-t border-slate-800 flex flex-wrap gap-3">
                                {sourceLinks.map((link, i) => (
                                    <a
                                        key={i}
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] text-orange-400 font-bold hover:text-white flex items-center gap-1 underline underline-offset-4"
                                    >
                                        Source {i + 1}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-slate-500 text-xs italic">Searching for deeper insights...</p>
                )}
            </div>
        </section>
    );
};

export default GourmetBriefPage;
