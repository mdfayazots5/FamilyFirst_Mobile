import React from 'react';
import { motion } from 'motion/react';

const WeekMiniCalendar: React.FC = () => {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const scores = [85, 92, 78, 88, 95, 80, 82]; // Mock scores for the week
  const todayIndex = 6; // Sunday

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day, index) => {
        const score = scores[index];
        const isToday = index === todayIndex;
        
        // Color based on score
        const getBgColor = (s: number) => {
          if (s >= 90) return 'bg-success';
          if (s >= 80) return 'bg-primary';
          return 'bg-accent';
        };

        return (
          <div key={index} className="flex flex-col items-center space-y-3">
            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isToday ? 'text-accent' : 'text-gray-400'}`}>
              {day}
            </span>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`
                w-full aspect-square rounded-xl flex items-center justify-center text-[10px] font-numbers font-medium text-white shadow-sm transition-transform hover:scale-105
                ${getBgColor(score)} 
                ${isToday ? 'ring-2 ring-offset-2 ring-accent ring-offset-bg-cream scale-110' : 'opacity-80'}
              `}
            >
              {score}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
};

export default WeekMiniCalendar;
