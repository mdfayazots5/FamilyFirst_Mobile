import React from 'react';
import { motion } from 'motion/react';
import { Coins } from 'lucide-react';
import { TaskItem } from '../repositories/TaskRepository';

interface TaskChipProps {
  task: TaskItem;
  onClick: () => void;
  onLongPress: () => void;
}

const TaskChip: React.FC<TaskChipProps> = ({ task, onClick, onLongPress }) => {
  // Simple long press implementation
  let timer: any;
  const handleTouchStart = () => {
    timer = setTimeout(onLongPress, 600);
  };
  const handleTouchEnd = () => {
    clearTimeout(timer);
  };

  const getPillarColor = (pillar: string) => {
    switch (pillar) {
      case 'Study': return 'bg-primary/10 text-primary border-primary/20';
      case 'Cleanliness': return 'bg-success/10 text-success border-success/20';
      case 'Discipline': return 'bg-accent/10 text-accent border-accent/20';
      case 'ScreenControl': return 'bg-alert/10 text-alert border-alert/20';
      case 'Responsibility': return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20';
      default: return 'bg-gray-100 text-gray-500 border-gray-200';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      onContextMenu={(e) => {
        e.preventDefault();
        onLongPress();
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={onClick}
      className={`p-2 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all ${getPillarColor(task.pillarTag)}`}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="text-[10px] font-bold truncate max-w-[60px]">{task.name}</span>
        <div className="flex items-center gap-0.5 bg-white/50 px-1 rounded-md">
          <Coins size={8} className="text-amber-500" />
          <span className="text-[8px] font-black">{task.coinValue}</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[8px] opacity-60 font-bold">{task.duration}m</span>
        {task.isPhotoRequired && (
          <div className="w-1 h-1 rounded-full bg-current opacity-40" />
        )}
      </div>
    </motion.div>
  );
};

export default TaskChip;
