import React from 'react';
import { motion } from 'motion/react';

interface FFShimmerProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
}

const FFShimmer: React.FC<FFShimmerProps> = ({ 
  className = '', 
  width = '100%', 
  height = '1rem',
  borderRadius = '0.5rem'
}) => {
  return (
    <div 
      className={`relative overflow-hidden bg-gray-200 ${className}`}
      style={{ width, height, borderRadius }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: 'linear',
        }}
      />
    </div>
  );
};

export default FFShimmer;

/**
 * Pre-defined Skeletons
 */
export const FFCardSkeleton: React.FC = () => (
  <div className="bg-white p-6 rounded-[32px] border border-black/5 space-y-4">
    <div className="flex items-center gap-4">
      <FFShimmer width={48} height={48} borderRadius="1rem" />
      <div className="flex-1 space-y-2">
        <FFShimmer width="60%" height="0.75rem" />
        <FFShimmer width="40%" height="0.5rem" />
      </div>
    </div>
    <FFShimmer width="100%" height="4rem" borderRadius="1rem" />
  </div>
);

export const FFListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <FFCardSkeleton key={i} />
    ))}
  </div>
);
