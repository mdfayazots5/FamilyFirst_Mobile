import React from 'react';
import { motion } from 'motion/react';

interface AttendanceHeatmapWidgetProps {
  data: { date: string; completionRate: number }[];
}

const AttendanceHeatmapWidget: React.FC<AttendanceHeatmapWidgetProps> = ({ data }) => {
  const getColor = (rate: number) => {
    if (rate >= 0.8) return 'bg-success';
    if (rate >= 0.4) return 'bg-amber-500';
    return 'bg-alert';
  };

  return (
    <div className="grid grid-cols-7 gap-2">
      {data.map((day, idx) => (
        <motion.div
          key={day.date}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: idx * 0.01 }}
          className={`aspect-square rounded-lg ${getColor(day.completionRate)} shadow-sm relative group`}
        >
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-primary text-white text-[8px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
            {new Date(day.date).toLocaleDateString()}: {Math.round(day.completionRate * 100)}%
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default AttendanceHeatmapWidget;
