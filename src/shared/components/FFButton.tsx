import React from 'react';
import { motion } from 'motion/react';

interface FFButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'outline' | 'ghost' | 'alert';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const FFButton: React.FC<FFButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  icon,
  className = '',
  ...props
}) => {
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90 shadow-sm',
    accent: 'bg-accent text-primary hover:bg-accent/90 shadow-sm',
    outline: 'bg-transparent border-2 border-primary/10 text-primary hover:bg-primary/5',
    ghost: 'bg-transparent text-primary hover:bg-primary/5',
    alert: 'bg-alert text-white hover:bg-alert/90 shadow-sm',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs rounded-ff-sm min-h-[40px]',
    md: 'px-5 py-3 text-sm rounded-ff font-bold min-h-[48px]',
    lg: 'px-6 py-4 text-base rounded-ff-lg font-bold min-h-[56px]',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.01, translateY: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`
        inline-flex items-center justify-center gap-2.5 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </motion.button>
  );
};

export default FFButton;
