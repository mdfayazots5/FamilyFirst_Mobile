import React from 'react';
import { motion } from 'motion/react';
import { Star, Trophy, Shield, Zap, Heart, Target } from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  icon: React.ReactNode;
  isUnlocked: boolean;
  description: string;
  color: string;
}

const badges: Badge[] = [
  { id: 'b1', name: 'Early Bird', icon: <Zap size={24} />, isUnlocked: true, description: 'Complete 5 morning tasks before 8 AM', color: 'bg-amber-500' },
  { id: 'b2', name: 'Study Star', icon: <Star size={24} />, isUnlocked: true, description: 'Maintain a 5-day study streak', color: 'bg-primary' },
  { id: 'b3', name: 'Clean Champ', icon: <Shield size={24} />, isUnlocked: true, description: 'No missed cleaning tasks for a week', color: 'bg-success' },
  { id: 'b4', name: 'Helper Hero', icon: <Heart size={24} />, isUnlocked: false, description: 'Complete 10 chore tasks', color: 'bg-red-500' },
  { id: 'b5', name: 'Goal Getter', icon: <Target size={24} />, isUnlocked: false, description: 'Reach a 30-day streak', color: 'bg-indigo-500' },
  { id: 'b6', name: 'Master Mind', icon: <Trophy size={24} />, isUnlocked: false, description: 'Earn 5000 lifetime coins', color: 'bg-purple-500' },
];

const BadgeGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {badges.map((badge, i) => (
        <motion.div
          key={badge.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex flex-col items-center text-center group"
        >
          <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center transition-all relative ${
            badge.isUnlocked 
              ? `${badge.color} text-white shadow-lg shadow-${badge.color.split('-')[1]}/20` 
              : 'bg-gray-100 text-gray-300'
          }`}>
            {badge.icon}
            {!badge.isUnlocked && (
              <div className="absolute -top-1 -right-1 bg-white p-1 rounded-full shadow-sm">
                <div className="w-2 h-2 rounded-full bg-gray-300" />
              </div>
            )}
          </div>
          <span className={`mt-2 text-[10px] font-bold uppercase tracking-widest ${
            badge.isUnlocked ? 'text-primary' : 'text-gray-300'
          }`}>
            {badge.isUnlocked ? badge.name : '???'}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

export default BadgeGrid;
