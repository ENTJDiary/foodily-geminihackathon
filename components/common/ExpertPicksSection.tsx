import React, { useMemo, useState } from 'react';

interface ExpertPicksSectionProps {
    text: string;
    maxInitialPicks?: number;
    onPicksExtracted?: (restaurantNames: string[]) => void;
}

interface ParsedRestaurant {
    name: string;
    rating?: string;
    description: string;
}

interface ParsedExpertPicks {
    intro: string;
    picks: ParsedRestaurant[];
}

const ExpertPicksSection: React.FC<ExpertPicksSectionProps & { onRestaurantClick?: (name: string) => void }> = ({ text, maxInitialPicks = 5, onRestaurantClick, onPicksExtracted }) => {
    const [visibleCount, setVisibleCount] = useState(maxInitialPicks);
    const parsedContent = useMemo((): ParsedExpertPicks => {
        if (!text) return { intro: '', picks: [] };

        const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
        const introLines: string[] = [];
        const picks: ParsedRestaurant[] = [];

        let parsingPicks = false;

        lines.forEach(line => {
            // Check if line is a list item (starts with * or -)
            const isListItem = /^[\*\-]\s+/.test(line);

            if (isListItem) {
                parsingPicks = true;
                // Parse bullet point
                // Expected format: "* **Name** description..." or "* **Name**: description"
                const match = line.match(/^[\*\-]\s+(?:\*\*(.*?)\*\*|\+\+(.*?)\+\+)(.*)/);

                if (match) {
                    const name = match[1] || match[2];
                    let description = match[3] || '';

                    // Clean up description
                    description = description.replace(/^[:\-\s]+/, '').trim();

                    // Try to extract rating
                    const ratingMatch = description.match(/(\d+(\.\d+)?)-star/);
                    const rating = ratingMatch ? ratingMatch[1] : undefined;

                    picks.push({
                        name: name.trim(),
                        rating,
                        description
                    });
                } else {
                    // Fallback for list items without bold name
                    picks.push({
                        name: 'Restaurant Recommendation',
                        description: line.replace(/^[\*\-]\s+/, '')
                    });
                }
            } else if (!parsingPicks) {
                introLines.push(line);
            }
        });

        return {
            intro: introLines.join('\n\n'),
            picks
        };
    }, [text]);

    // Notify parent component of the restaurant names in the picks
    React.useEffect(() => {
        if (onPicksExtracted && parsedContent.picks.length > 0) {
            const displayedPicks = parsedContent.picks.slice(0, visibleCount);
            const restaurantNames = displayedPicks.map(pick => pick.name);
            onPicksExtracted(restaurantNames);
        }
    }, [parsedContent, visibleCount, onPicksExtracted]);

    if (!parsedContent.intro && parsedContent.picks.length === 0) {
        return (
            <div className="bg-white p-8 rounded-[2rem] border border-orange-50 shadow-sm">
                <div className="whitespace-pre-wrap text-slate-800 font-medium leading-relaxed">
                    {text}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Intro / Mission Brief */}
            {parsedContent.intro && (
                <div className="bg-gradient-to-br from-orange-600 to-orange-700 p-8 rounded-[2rem] shadow-lg relative overflow-hidden text-white group">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
                    </div>

                    <div className="relative z-10">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-orange-200 flex items-center gap-2">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            Mission Intel
                        </h3>
                        <div className="prose prose-invert prose-lg max-w-none font-medium leading-relaxed opacity-95">
                            <p>{parsedContent.intro}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Picks / Target List */}
            {parsedContent.picks.length > 0 && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        {parsedContent.picks.slice(0, visibleCount).map((pick, i) => (
                            <button
                                key={i}
                                onClick={() => onRestaurantClick?.(pick.name)}
                                className="w-full text-left bg-white p-6 rounded-[1.5rem] border border-orange-50 shadow-sm hover:shadow-md transition-all group relative overflow-hidden cursor-pointer active:scale-[0.99]"
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-orange-400 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="flex gap-4 items-start relative z-10">
                                    {/* Rank Badge */}
                                    <div className={`
                                     flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border-2
                                     ${i === 0 ? 'bg-yellow-50 border-yellow-200 text-yellow-600' :
                                            i === 1 ? 'bg-slate-100 border-slate-300 text-slate-500' :
                                                i === 2 ? 'bg-orange-50 border-orange-200 text-orange-700' :
                                                    'bg-slate-50 border-slate-100 text-slate-400'}
                                 `}>
                                        #{i + 1}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                                            <h4 className="text-lg font-black text-slate-900 leading-tight group-hover:text-orange-600 transition-colors">
                                                {pick.name}
                                            </h4>
                                            {pick.rating && (
                                                <div className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-lg border border-green-100">
                                                    <span className="text-xs font-bold text-green-700">{pick.rating}</span>
                                                    <svg className="w-3 h-3 text-green-600 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-slate-500 text-sm leading-relaxed">
                                            {pick.description}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Show More Button */}
                    {visibleCount < parsedContent.picks.length && (
                        <div className="flex justify-center pt-2">
                            <button
                                onClick={() => setVisibleCount(prev => Math.min(prev + 5, parsedContent.picks.length))}
                                className="bg-white hover:bg-orange-600 text-orange-700 hover:text-white font-bold px-8 py-4 rounded-xl transition-all uppercase tracking-widest border-2 border-orange-600 shadow-sm hover:shadow-md active:scale-[0.99] flex items-center gap-2 text-xs"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                                Show More
                                <span className="text-xs font-black bg-orange-100 text-orange-700 px-2 py-1 rounded-lg">
                                    +{Math.min(5, parsedContent.picks.length - visibleCount)}
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ExpertPicksSection;
