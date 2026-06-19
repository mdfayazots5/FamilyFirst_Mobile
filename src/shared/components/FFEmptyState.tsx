import React from 'react';
import { motion } from 'motion/react';
import { Inbox } from 'lucide-react';
import FFButton from './FFButton';

interface FFEmptyStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

const FFEmptyState: React.FC<FFEmptyStateProps> = ({
  title = 'Nothing here yet',
  message = 'There is no data to show right now. Try the suggested action to get started.',
  actionLabel,
  onAction,
  icon = <Inbox size={32} />
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-6 px-6 py-12 text-center sm:px-10"
    >
      <div className="flex h-24 w-24 items-center justify-center rounded-[32px] bg-primary/5 text-primary shadow-inner">
        {icon}
      </div>
      
      <div className="max-w-md space-y-3">
        <h3 className="text-2xl font-display font-bold text-primary sm:text-3xl">{title}</h3>
        <p className="text-sm font-body leading-relaxed text-slate-500 sm:text-base">{message}</p>
      </div>

      {onAction && actionLabel && (
        <FFButton 
          variant="outline"
          className="px-6"
          onClick={onAction}
        >
          {actionLabel}
        </FFButton>
      )}
    </motion.div>
  );
};

export default FFEmptyState;
