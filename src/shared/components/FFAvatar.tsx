import React from 'react';

interface FFAvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'busy' | 'away';
  className?: string;
}

const FFAvatar: React.FC<FFAvatarProps> = ({
  src,
  name,
  size = 'md',
  status,
  className = '',
}) => {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
  };

  const statusColors = {
    online: 'bg-success',
    offline: 'bg-gray-400',
    busy: 'bg-alert',
    away: 'bg-accent',
  };

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      <div className={`
        ${sizes[size]}
        rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center font-bold text-primary border-2 border-white shadow-sm
      `}>
        {src ? (
          <img 
            src={src} 
            alt={name} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      
      {status && (
        <span className={`
          absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white
          ${statusColors[status]}
        `} />
      )}
    </div>
  );
};

export default FFAvatar;
