import React from 'react';

interface FFSectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  rightAction?: React.ReactNode;
}

const FFSectionHeader: React.FC<FFSectionHeaderProps> = ({ icon, title, rightAction }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-ff-sm bg-accent/10 flex items-center justify-center flex-shrink-0 text-accent">
        {React.isValidElement(icon)
          ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
              className: 'w-4 h-4 text-accent',
            })
          : icon}
      </div>
      <p className="font-display font-semibold text-xs text-primary uppercase tracking-wider flex-1 min-w-0 truncate">
        {title}
      </p>
      {rightAction && (
        <div className="flex-shrink-0">
          {rightAction}
        </div>
      )}
    </div>
  );
};

export default FFSectionHeader;
