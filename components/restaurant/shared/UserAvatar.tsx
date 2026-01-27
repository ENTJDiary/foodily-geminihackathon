import React from 'react';

interface UserAvatarProps {
    userName: string;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    showBorder?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ userName, size = 'md', showBorder = true }) => {
    // Generate consistent avatar color based on username
    const colors = ['bg-orange-100', 'bg-blue-100', 'bg-green-100', 'bg-purple-100', 'bg-pink-100'];
    const colorIndex = userName.length % colors.length;
    const avatarColor = colors[colorIndex];
    const textColor = avatarColor.replace('100', '600');

    const sizeClasses = {
        xs: { container: 'w-5 h-5', text: 'text-[8px]' },
        sm: { container: 'w-6 h-6', text: 'text-[9px]' },
        md: { container: 'w-8 h-8', text: 'text-xs' },
        lg: { container: 'w-10 h-10', text: 'text-sm' },
    };

    const { container, text } = sizeClasses[size];
    const borderClass = showBorder ? 'border border-white shadow-sm' : '';

    return (
        <div
            className={`${container} ${avatarColor} ${textColor} ${borderClass} rounded-full flex items-center justify-center font-black uppercase shrink-0`}
        >
            {userName.charAt(0)}
        </div>
    );
};

export default UserAvatar;
