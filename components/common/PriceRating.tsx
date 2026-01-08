import React from 'react';

interface PriceRatingProps {
    rating: number; // 1 to 4
}

const PriceRating: React.FC<PriceRatingProps> = ({ rating }) => {
    // Clamp rating between 1 and 4
    const displayRating = Math.max(1, Math.min(4, Math.round(rating)));

    const MoneyBill = ({ isActive }: { isActive: boolean }) => (
        <svg
            className={`w-5 h-8 transition-all duration-300`}
            viewBox="0 0 20 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Simple rounded rectangle bill */}
            <rect
                x="1"
                y="1"
                width="18"
                height="30"
                rx="2"
                className={isActive
                    ? 'fill-white stroke-slate-900 drop-shadow-sm' // Active: Light/White with crisp outline
                    : 'fill-slate-800/20 stroke-slate-400/50'     // Inactive: Darker/Shaded
                }
                strokeWidth={isActive ? "1.5" : "1"}
            />

            {/* Center circle/oval */}
            <ellipse
                cx="10"
                cy="16"
                rx="3"
                ry="4.5"
                className={isActive ? 'stroke-slate-900' : 'stroke-slate-500/50'}
                strokeWidth="1.2"
                fill="none"
            />

            {/* Diagonal stripes for active bills only */}
            {isActive && (
                <g className="stroke-slate-900" strokeWidth="0.8">
                    <line x1="5" y1="8" x2="7" y2="10" />
                    <line x1="13" y1="8" x2="15" y2="10" />
                    <line x1="5" y1="22" x2="7" y2="24" />
                    <line x1="13" y1="22" x2="15" y2="24" />
                </g>
            )}
        </svg>
    );

    const Wing = ({ side }: { side: 'left' | 'right' }) => (
        <svg
            className={`w-5 h-5 ${side === 'left' ? '-scale-x-100' : ''} text-slate-900`}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Simple wing shape */}
            <path
                d="M2 16C2 16 6 4 18 6C20 6.5 22 9 20 12C18 15 14 16 14 16"
                className="fill-white stroke-current"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Wing detail lines */}
            <path d="M16 8C16 8 18 8 20 9" className="stroke-current" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M15 11C15 11 17 11.5 19 12.5" className="stroke-current" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
    );

    const getPriceRangeLabel = (tier: number) => {
        switch (tier) {
            case 1: return '$0 - $10';
            case 2: return '$10 - $20';
            case 3: return '$20 - $40';
            case 4: return '$40+';
            default: return '';
        }
    };

    return (
        <div className="flex items-center gap-2" title={`Price Range: ${getPriceRangeLabel(displayRating)}`}>
            {/* Show all 4 bills with spacing */}
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4].map((tier) => (
                    <div key={tier} className="relative transition-transform duration-300 hover:scale-105">
                        <MoneyBill isActive={tier <= displayRating} />
                    </div>
                ))}
            </div>

            {/* Wings for tier 4 */}
            {displayRating >= 4 && (
                <div className="flex items-center -space-x-1 ml-1 animate-pulse">
                    <Wing side="left" />
                    <Wing side="right" />
                </div>
            )}
        </div>
    );
};

export default PriceRating;
