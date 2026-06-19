import React from 'react';
import { ChevronLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FFPageHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  variant?: 'home' | 'detail';
  roleLabel?: string;
}

const FFPageHeader: React.FC<FFPageHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  variant = 'detail',
  roleLabel,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <header
      className="sticky top-0 z-40 h-16 bg-primary flex items-center justify-between px-4 shadow-header"
      style={{ boxShadow: '0 1px 8px rgba(26, 46, 74, 0.10)' }}
    >
      {/* Left slot */}
      {variant === 'home' ? (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-accent/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Home className="w-4 h-4 text-accent" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display font-bold text-base text-white">FamilyFirst</span>
            {roleLabel && (
              <span className="text-[9px] font-body font-semibold tracking-wider text-accent uppercase mt-0.5">
                {roleLabel}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-1 min-w-0">
          {showBack && (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center justify-center w-11 h-11 -ml-2 text-white/80 hover:text-white transition-colors flex-shrink-0"
              aria-label="Go back"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <div className="min-w-0">
            {title && (
              <p className="font-display font-semibold text-base text-white truncate max-w-[200px]">
                {title}
              </p>
            )}
            {subtitle && (
              <p className="font-body text-[10px] text-white/60 truncate mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
      )}

      {/* Right slot */}
      {rightAction && (
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          {rightAction}
        </div>
      )}
    </header>
  );
};

export default FFPageHeader;
