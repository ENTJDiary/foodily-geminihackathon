import React from 'react';

interface LoadingRecommendationsProps {
    message?: string;
}

const LoadingRecommendations: React.FC<LoadingRecommendationsProps> = ({
    message = "Consulting Chefs..."
}) => {
    return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <div className="w-8 h-8 border-2 border-orange-100 border-t-orange-600 rounded-full animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-400">
                {message}
            </span>
        </div>
    );
};

export default LoadingRecommendations;
