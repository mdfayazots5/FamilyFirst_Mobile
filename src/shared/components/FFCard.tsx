import React from 'react';
import { motion } from 'motion/react';

interface FFCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

const FFCard: React.FC<FFCardProps> = ({
  children,
  title,
  subtitle,
  icon,
  footer,
  className = '',
  hoverable = false,
  onClick,
}) => {
  const Component = hoverable ? motion.div : 'div';
  const hoverProps = hoverable ? {
    whileHover: { y: -2, scale: 1.005 },
    transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] }
  } : {};

  return (
    <Component
      {...hoverProps}
      onClick={onClick}
      className={`
        ff-card flex h-full flex-col gap-4 overflow-hidden transition-all duration-300
        ${hoverable ? 'cursor-pointer hover:border-primary/10 hover:shadow-premium-lg' : ''}
        ${className}
      `}
    >
      {(title || icon) && (
        <div className="mb-1 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {icon && (
              <div className="flex min-h-12 min-w-12 items-center justify-center rounded-ff-sm bg-primary/5 text-primary">
                {icon}
              </div>
            )}
            <div>
              {title && <h3 className="text-base font-display font-bold leading-tight">{title}</h3>}
              {subtitle && <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-gray-400">{subtitle}</p>}
            </div>
          </div>
        </div>
      )}
      
      <div className="flex-1">
        {children}
      </div>

      {footer && (
        <div className="mt-auto flex items-center justify-between border-t border-black/5 pt-4">
          {footer}
        </div>
      )}
    </Component>
  );
};

export default FFCard;
