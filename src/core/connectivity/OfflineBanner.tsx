import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, AlertTriangle } from 'lucide-react';
import { useConnectivity } from './useConnectivity';

const OfflineBanner: React.FC = () => {
  const isOnline = useConnectivity();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-amber-500 text-white overflow-hidden sticky top-0 z-[100] shadow-md"
        >
          <div className="px-6 py-2 flex items-center justify-center gap-3">
            <WifiOff size={16} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              You are currently offline. Showing cached data.
            </span>
            <AlertTriangle size={14} className="opacity-50" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineBanner;
