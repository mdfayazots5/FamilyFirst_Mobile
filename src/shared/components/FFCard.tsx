import React from 'react';

type FFCardVariant = 'default' | 'warm' | 'primary' | 'accent';

interface FFCardProps {
  children: React.ReactNode;
  variant?: FFCardVariant;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

const variantBase: Record<FFCardVariant, string> = {
  default: 'bg-white border border-black/5',
  warm:    'bg-[#FDF9F4] border border-black/5',
  primary: 'bg-gradient-to-br from-[#1A2E4A] to-[#2A4A6A] border-none',
  accent:  'bg-white border border-accent/20',
};

const FFCard: React.FC<FFCardProps> = ({
  children,
  variant = 'default',
  title,
  subtitle,
  icon,
  footer,
  className = '',
  hoverable = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      style={{ boxShadow: variant === 'primary' ? '0 8px 32px rgba(26,46,74,0.12),0 2px 8px rgba(26,46,74,0.06)' : '0 2px 12px rgba(26,46,74,0.08),0 1px 4px rgba(26,46,74,0.04)' }}
      className={`
        rounded-ff overflow-hidden transition-all duration-150
        ${variantBase[variant]}
        ${hoverable ? 'cursor-pointer active:scale-[0.98]' : ''}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {(title || icon) && (
        <div className="flex items-start gap-3 mb-1">
          {icon && (
            <div className="flex min-h-10 min-w-10 items-center justify-center rounded-ff-sm bg-primary/5 text-primary flex-shrink-0">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            {title && (
              <h3 className="font-display font-semibold text-sm text-primary leading-tight truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-0.5 font-body text-xs text-gray-400 uppercase tracking-wider">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}

      {children}

      {footer && (
        <div className="mt-auto flex items-center justify-between border-t border-black/5 pt-3">
          {footer}
        </div>
      )}
    </div>
  );
};

export default FFCard;
