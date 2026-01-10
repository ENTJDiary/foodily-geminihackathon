import React from 'react';

interface StarRatingProps {
    rating: number;
    maxRating?: number;
    size?: 'sm' | 'md' | 'lg';
    interactive?: boolean;
    onRatingChange?: (rating: number) => void;
    onHover?: (rating: number) => void;
    hoverRating?: number;
    showHalfStars?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
    rating,
    maxRating = 5,
    size = 'md',
    interactive = false,
    onRatingChange,
    onHover,
    hoverRating = 0,
    showHalfStars = false,
}) => {
    const sizeClasses = {
        sm: 'w-3 h-3',
        md: 'w-5 h-5',
        lg: 'w-8 h-8',
    };

    const starSize = sizeClasses[size];

    const renderStar = (index: number) => {
        const starValue = index + 1;
        const displayRating = hoverRating || rating;
        const isFull = displayRating >= starValue;
        const isHalf = showHalfStars && displayRating >= starValue - 0.5 && displayRating < starValue;

        if (interactive && showHalfStars) {
            return (
                <div key={index} className="relative cursor-pointer" style={{ width: '24px', height: '24px' }}>
                    {/* Left half clickable area */}
                    <div
                        className="absolute left-0 top-0 w-1/2 h-full z-10"
                        onClick={() => onRatingChange?.(starValue - 0.5)}
                        onMouseEnter={() => onHover?.(starValue - 0.5)}
                    />
                    {/* Right half clickable area */}
                    <div
                        className="absolute right-0 top-0 w-1/2 h-full z-10"
                        onClick={() => onRatingChange?.(starValue)}
                        onMouseEnter={() => onHover?.(starValue)}
                    />
                    {/* Star visual */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24">
                        {/* Background (empty) star */}
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#e2e8f0" />
                        {/* Filled portion */}
                        <defs>
                            <clipPath id={`clip-star-${index}`}>
                                <rect x="0" y="0" width={isFull ? '24' : isHalf ? '12' : '0'} height="24" />
                            </clipPath>
                        </defs>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#f97316" clipPath={`url(#clip-star-${index})`} />
                    </svg>
                </div>
            );
        }

        return (
            <button
                key={index}
                type="button"
                onClick={() => interactive && onRatingChange?.(starValue)}
                onMouseEnter={() => interactive && onHover?.(starValue)}
                className={`focus:outline-none transition-transform ${interactive ? 'cursor-pointer active:scale-90' : 'cursor-default'}`}
                disabled={!interactive}
            >
                <svg
                    className={`${starSize} transition-all duration-200 ${displayRating >= starValue ? 'text-orange-500 fill-current' : 'text-slate-200 fill-current'
                        }`}
                    viewBox="0 0 24 24"
                >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            </button>
        );
    };

    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: maxRating }, (_, i) => renderStar(i))}
        </div>
    );
};

export default StarRating;
