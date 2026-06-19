import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import FFButton from './FFButton';

interface FFErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  type?: 'generic' | 'offline' | 'not_found' | 'server';
}

const FFErrorState: React.FC<FFErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an error while loading this data. Please try again.',
  onRetry,
  type = 'generic'
}) => {
  const isOffline =
    type === 'offline' || (typeof navigator !== 'undefined' && !navigator.onLine);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center gap-6 px-6 py-12 text-center sm:px-10"
    >
      <div className={`flex h-24 w-24 items-center justify-center rounded-[32px] ${isOffline ? 'bg-amber-50 text-amber-600' : 'bg-alert/5 text-alert'}`}>
        {isOffline ? <WifiOff size={48} /> : <AlertCircle size={48} />}
      </div>
      
      <div className="max-w-md space-y-3">
        <h3 className="text-2xl font-display font-bold text-primary">
          {isOffline ? 'No Internet Connection' : title}
        </h3>
        <p className="text-sm font-body leading-relaxed text-slate-500 sm:text-base">
          {isOffline ? 'Please check your connection and try again to see the latest updates.' : message}
        </p>
      </div>

      {onRetry && (
        <FFButton 
          variant={isOffline ? 'accent' : 'primary'}
          icon={<RefreshCw size={18} />}
          className="px-6"
          onClick={onRetry}
        >
          Try Again
        </FFButton>
      )}
    </motion.div>
  );
};

export default FFErrorState;
