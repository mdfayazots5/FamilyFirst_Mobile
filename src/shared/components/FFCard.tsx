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
        ff-card flex flex-col gap-4 transition-all duration-300
        ${hoverable ? 'cursor-pointer hover:border-primary/10 hover:shadow-premium-lg' : ''}
        ${className}
      `}
    >
      {(title || icon) && (
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            {icon && <div className="p-2.5 bg-primary/5 rounded-ff-sm text-primary">{icon}</div>}
            <div>
              {title && <h3 className="text-base font-display font-bold leading-tight">{title}</h3>}
              {subtitle && <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{subtitle}</p>}
            </div>
          </div>
        </div>
      )}
      
      <div className="flex-1">
        {children}
      </div>

      {footer && (
        <div className="pt-4 mt-auto border-t border-black/5 flex items-center justify-between">
          {footer}
        </div>
      )}
    </Component>
  );
};

export default FFCard;
