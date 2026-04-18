import React from 'react';
import { motion } from 'motion/react';

interface ProgressRingProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  subLabel?: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 200,
  strokeWidth = 16,
  label,
  subLabel
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const getColor = (p: number) => {
    if (p < 40) return '#ef4444'; // red-500
    if (p < 80) return '#f59e0b'; // amber-500
    return '#22c55e'; // green-500
  };

  const color = getColor(progress);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-100"
        />
        {/* Progress Circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
        {label && <span className="text-3xl font-display font-bold text-primary leading-none">{label}</span>}
        {subLabel && <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">{subLabel}</span>}
      </div>
    </div>
  );
};

export default ProgressRing;
