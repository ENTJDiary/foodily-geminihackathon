import React from 'react';

interface PriceTagProps {
    price: string;
    variant?: 'badge' | 'inline';
    size?: 'sm' | 'md' | 'lg';
}

const PriceTag: React.FC<PriceTagProps> = ({ price, variant = 'badge', size = 'md' }) => {
    const sizeClasses = {
        sm: { icon: 'w-3 h-3.5', text: 'text-[9px]' },
        md: { icon: 'w-3.5 h-4', text: 'text-xs' },
        lg: { icon: 'w-4 h-5', text: 'text-sm' },
    };

    const { icon: iconSize, text: textSize } = sizeClasses[size];

    const MoneyIcon = () => (
        <svg className={`${iconSize} text-green-700`} viewBox="0 0 24 30" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="5" y="3" width="14" height="24" rx="3" stroke="currentColor" fill="white" />
            <circle cx="12" cy="15" r="4" stroke="currentColor" />
            <path d="M8 8L6 10M16 8L18 10M8 22L6 20M16 22L18 20" strokeLinecap="round" />
        </svg>
    );

    if (variant === 'inline') {
        return (
            <div className="flex items-center gap-1.5">
                <MoneyIcon />
                <span className={`${textSize} font-black text-green-700`}>{price}</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-lg border border-green-100">
            <MoneyIcon />
            <span className={`${textSize} font-black text-green-700`}>{price}</span>
        </div>
    );
};

export default PriceTag;
