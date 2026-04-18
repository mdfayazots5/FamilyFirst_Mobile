import React from 'react';
import { motion } from 'motion/react';
import { Inbox, Plus } from 'lucide-react';
import FFButton from './FFButton';

interface FFEmptyStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

const FFEmptyState: React.FC<FFEmptyStateProps> = ({
  title = 'NULL STATE',
  message = 'System is awaiting initial data entry.',
  actionLabel,
  onAction,
  icon = <Inbox size={32} />
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-20 text-center space-y-10"
    >
      <div className="w-24 h-24 rounded-[32px] bg-gray-50 flex items-center justify-center text-gray-200 shadow-inner">
        {icon}
      </div>
      
      <div className="space-y-4 max-w-sm">
        <h3 className="text-3xl font-display font-black text-primary uppercase italic tracking-tighter">{title}</h3>
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] leading-loose">{message}</p>
      </div>

      {onAction && actionLabel && (
        <FFButton 
          variant="outline"
          className="rounded-2xl text-[10px] font-black uppercase tracking-widest h-14 px-10"
          onClick={onAction}
        >
          {actionLabel}
        </FFButton>
      )}
    </motion.div>
  );
};

export default FFEmptyState;
