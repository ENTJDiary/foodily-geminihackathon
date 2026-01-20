import React from 'react';

interface UserPostCardProps {
    imageUrl: string;
    dishName: string;
    userName: string;
    likes: number;
}

const UserPostCard: React.FC<UserPostCardProps> = ({ imageUrl, dishName, userName, likes }) => {
    return (
        <div className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer">
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden">
                <img
                    src={imageUrl}
                    alt={dishName}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Likes Badge - Top Right */}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm font-semibold">
                    <span className="text-lg">{likes}</span>
                </div>

                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {/* Card Info */}
            <div className="p-5 space-y-2">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors duration-300">
                    {dishName}
                </h3>

                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-slate-600 font-medium text-sm">{userName}</span>
                </div>

                {/* Like Icon */}
                <div className="flex items-center gap-1 text-slate-400 group-hover:text-red-500 transition-colors duration-300">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    <span className="text-sm font-semibold">{likes}</span>
                </div>
            </div>
        </div>
    );
};

export default UserPostCard;
