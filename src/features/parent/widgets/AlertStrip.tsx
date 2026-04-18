import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Bell, GraduationCap, FileText } from 'lucide-react';
import { Alert } from '../repositories/DashboardRepository';

interface AlertStripProps {
  alerts: Alert[];
}

const AlertStrip: React.FC<AlertStripProps> = ({ alerts }) => {
  if (alerts.length === 0) return null;

  const getIcon = (type: Alert['type']) => {
    switch (type) {
      case 'FEEDBACK': return <GraduationCap size={16} />;
      case 'EXAM': return <Bell size={16} />;
      case 'DOC_EXPIRY': return <FileText size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {alerts.slice(0, 3).map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.1 }}
            className={`
              flex items-center gap-4 p-4 rounded-xl border text-[13px] font-medium transition-all hover:translate-x-1 duration-300
              ${alert.type === 'URGENT' 
                ? 'bg-alert/5 border-alert/20 text-alert shadow-sm' 
                : 'bg-white border-black/[0.03] text-primary shadow-sm'}
            `}
          >
            <div className={`
              w-10 h-10 rounded-lg flex items-center justify-center shrink-0
              ${alert.type === 'URGENT' ? 'bg-alert/10 text-alert' : 'bg-primary/5 text-primary'}
            `}>
              {React.cloneElement(getIcon(alert.type) as React.ReactElement, { size: 20, strokeWidth: 1.5 })}
            </div>
            <div className="flex-1">
              <span className="leading-relaxed">{alert.message}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AlertStrip;
