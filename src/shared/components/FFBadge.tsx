import React from 'react';

interface FFBadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'accent' | 'success' | 'alert' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
}

const FFBadge: React.FC<FFBadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
}) => {
  const variants = {
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    success: 'bg-success/10 text-success',
    alert: 'bg-alert/10 text-alert',
    gray: 'bg-gray-100 text-gray-500',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] tracking-wide',
    md: 'px-2.5 py-1 text-xs tracking-wide',
  };

  return (
    <span className={`
      inline-flex items-center justify-center font-bold uppercase rounded-lg
      ${variants[variant]}
      ${sizes[size]}
      ${className}
    `}>
      {children}
    </span>
  );
};

export default FFBadge;
