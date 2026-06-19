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
          className="sticky top-0 z-[100] overflow-hidden border-b border-amber-700/20 bg-amber-500 text-white shadow-md"
        >
          <div className="flex min-h-12 items-center justify-center gap-3 px-4 py-2 text-center sm:px-6">
            <WifiOff size={18} className="shrink-0 animate-pulse" />
            <span className="text-sm font-bold leading-snug">
              You are offline. FamilyFirst is showing cached data until the connection returns.
            </span>
            <AlertTriangle size={16} className="shrink-0 opacity-70" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineBanner;
