import React from 'react';
import { motion } from 'motion/react';
import FFCard from '../../../shared/components/FFCard';
import FFAvatar from '../../../shared/components/FFAvatar';
import FFBadge from '../../../shared/components/FFBadge';
import { ChildSummary } from '../repositories/DashboardRepository';

interface ChildSummaryCardProps {
  child: ChildSummary;
  onClick: () => void;
}

const ChildSummaryCard: React.FC<ChildSummaryCardProps> = ({ child, onClick }) => {
  const progress = (child.tasksCompleted / child.totalTasks) * 100;
  
  const getStatus = () => {
    if (progress >= 80) return { label: 'On Track', variant: 'success' as const };
    if (progress >= 40) return { label: 'Needs Attention', variant: 'accent' as const };
    return { label: 'Not Started', variant: 'alert' as const };
  };

  const status = getStatus();

  return (
    <FFCard hoverable onClick={onClick} className="relative overflow-hidden">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <FFAvatar name={child.name} size="md" src={child.avatarUrl} className="shadow-sm border-2 border-white" />
          <div>
            <h3 className="font-display font-bold text-base text-primary leading-none mb-1">{child.name}</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.1em]">
              Active {child.lastActive}
            </p>
          </div>
        </div>
        <FFBadge variant={status.variant} size="sm">{status.label}</FFBadge>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-baseline">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Protocol Progress</span>
          <span className="text-xs font-numbers font-medium text-primary tracking-tight">
            {child.tasksCompleted} / {child.totalTasks} <span className="text-[9px] font-bold text-gray-400 uppercase ml-0.5">Tasks</span>
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${
              status.variant === 'success' ? 'bg-success' : 
              status.variant === 'accent' ? 'bg-accent' : 'bg-alert'
            }`}
          />
        </div>
      </div>
    </FFCard>
  );
};

export default ChildSummaryCard;
