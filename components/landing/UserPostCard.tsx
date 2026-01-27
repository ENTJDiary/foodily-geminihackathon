import React from 'react';

interface UserPostCardProps {
  imageUrl: string;
  dishName: string;
  userName: string;
  likes: number;
  className?: string;
}


const UserPostCard: React.FC<UserPostCardProps> = ({
                                                     imageUrl,
                                                     dishName,
                                                     userName,
                                                     likes,
                                                     className = "",

                                                   }) => {
  return (
      <div
          className={`relative bg-white rounded-3xl shadow-xl overflow-hidden max-w-[280px] ${className}`}
      >
        {/* Image Container with Badge */}
        <div className="relative h-56 p-3">
          <div className="relative h-full w-full overflow-hidden rounded-2xl bg-slate-100">
            <img
                src={imageUrl}
                alt={dishName}
                onError={(e) => (e.currentTarget.style.display = 'none')}
                className="w-full h-full object-cover"
            />

            {/* Gradient for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

          </div>
        </div>

        {/* Content */}
          <div className={`px-5 pt-1 p-4 pb-5`}>

          <h3 className="font-bold text-slate-900 text-lg leading-tight mb-2">
            {dishName}
          </h3>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                        {userName.charAt(0)}
                    </div>
                    <span className="text-slate-500 text-xs font-medium">
            {userName}
          </span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                    <svg className="w-5 h-5 fill-orange-500" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    <span className="text-sm font-semibold">{likes}</span>
                </div>
            </div>
        </div>
      </div>
  );
};

export default UserPostCard;