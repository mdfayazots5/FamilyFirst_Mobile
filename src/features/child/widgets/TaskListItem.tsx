import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Clock, AlertCircle, Camera, ChevronRight, Loader2 } from 'lucide-react';
import { TaskCompletion } from '../repositories/TaskCompletionRepository';
import FFCard from '../../../shared/components/FFCard';

interface TaskListItemProps {
  task: TaskCompletion;
  onClick: () => void;
}

const TaskListItem: React.FC<TaskListItemProps> = ({ task, onClick }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved':
        return { icon: <CheckCircle2 size={20} />, color: 'text-success', bg: 'bg-success/10', label: 'Done!' };
      case 'submitted':
        return { icon: <Loader2 size={20} className="animate-spin" />, color: 'text-accent', bg: 'bg-accent/10', label: 'Reviewing...' };
      case 'flagged':
        return { icon: <AlertCircle size={20} />, color: 'text-alert', bg: 'bg-alert/10', label: 'Try Again' };
      case 'missed':
        return { icon: <AlertCircle size={20} />, color: 'text-gray-400', bg: 'bg-gray-100', label: 'Missed' };
      default:
        return { icon: <Clock size={20} />, color: 'text-gray-300', bg: 'bg-gray-50', label: 'Pending' };
    }
  };

  const config = getStatusConfig(task.status);

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <FFCard className={`group transition-all cursor-pointer ${task.status === 'approved' ? 'opacity-60' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${config.bg} ${config.color}`}>
              {config.icon}
            </div>
            <div>
              <h4 className={`font-bold text-primary ${task.status === 'missed' ? 'line-through opacity-50' : ''}`}>
                {task.taskName}
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{config.label}</span>
                {task.photoUrl && <Camera size={10} className="text-gray-300" />}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-xs font-black text-primary">+{task.coinValue}</div>
              <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Coins</div>
            </div>
            <ChevronRight size={18} className="text-gray-200 group-hover:text-primary transition-colors" />
          </div>
        </div>
      </FFCard>
    </motion.div>
  );
};

export default TaskListItem;
