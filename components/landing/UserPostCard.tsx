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
  className = ""
}) => {
  return (
    <div className={`bg-white rounded-3xl shadow-xl overflow-hidden max-w-[280px] ${className}`}>
      {/* Image Container with Badge */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={dishName} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        {/* Likes Badge */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
          <span>{likes}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-slate-900 text-lg leading-tight mb-2">
          {dishName}
        </h3>
        
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
            {userName.charAt(0)}
          </div>
          <span className="text-slate-500 text-xs font-medium">
            {userName}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-slate-400 text-xs">
           <svg className="w-4 h-4 fill-slate-300" viewBox="0 0 24 24">
             <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
           </svg>
           <span>{likes}</span>
        </div>
      </div>
    </div>
  );
};

export default UserPostCard;
