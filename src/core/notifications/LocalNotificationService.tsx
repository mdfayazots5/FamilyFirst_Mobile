import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  AlertCircle, 
  Cake, 
  Heart, 
  FileText, 
  ShieldAlert,
  X,
  ChevronRight
} from 'lucide-react';
import { NotificationPayload, NotificationType, useNotificationNavigation } from './NotificationPayloadHandler';

interface LocalNotification {
  id: string;
  title: string;
  body: string;
  payload: NotificationPayload;
  priority: 'normal' | 'urgent' | 'birthday';
}

interface LocalNotificationContextType {
  showNotification: (notification: Omit<LocalNotification, 'id'>) => void;
}

const LocalNotificationContext = createContext<LocalNotificationContextType | undefined>(undefined);

export const LocalNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<LocalNotification[]>([]);
  const { handleNotificationTap } = useNotificationNavigation();

  const showNotification = useCallback((notification: Omit<LocalNotification, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    if (notification.priority !== 'urgent') {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 5000);
    }
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleTap = (notification: LocalNotification) => {
    handleNotificationTap(notification.payload);
    removeNotification(notification.id);
  };

  return (
    <LocalNotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed top-4 left-4 right-4 z-[100] pointer-events-none flex flex-col items-center gap-3">
        <AnimatePresence>
          {notifications.map(notification => (
            <motion.div
              key={notification.id}
              initial={{ y: -100, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.9 }}
              className="pointer-events-auto w-full max-w-md"
            >
              <div 
                onClick={() => handleTap(notification)}
                className={`
                  relative overflow-hidden rounded-3xl shadow-2xl border border-black/5 p-4 flex items-center gap-4 cursor-pointer
                  ${notification.priority === 'urgent' ? 'bg-alert text-white' : 
                    notification.priority === 'birthday' ? 'bg-amber-400 text-white' : 'bg-white text-primary'}
                `}
              >
                <div className={`
                  w-12 h-12 rounded-2xl flex items-center justify-center shrink-0
                  ${notification.priority === 'urgent' ? 'bg-white/20' : 
                    notification.priority === 'birthday' ? 'bg-white/20' : 'bg-primary/5 text-primary'}
                `}>
                  {getIcon(notification.payload.type, notification.priority)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate">{notification.title}</h4>
                  <p className={`text-xs truncate opacity-80 ${notification.priority === 'normal' ? 'text-gray-500' : 'text-white'}`}>
                    {notification.body}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <ChevronRight size={18} className="opacity-40" />
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                    className="p-1 hover:bg-black/5 rounded-full"
                  >
                    <X size={16} className="opacity-40" />
                  </button>
                </div>

                {/* Progress bar for auto-dismiss */}
                {notification.priority !== 'urgent' && (
                  <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: 5, ease: 'linear' }}
                    className={`absolute bottom-0 left-0 h-1 ${notification.priority === 'birthday' ? 'bg-white/40' : 'bg-primary/20'}`}
                  />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </LocalNotificationContext.Provider>
  );
};

const getIcon = (type: NotificationType, priority: string) => {
  if (priority === 'birthday') return <Cake size={24} />;
  
  switch (type) {
    case NotificationType.SOS:
    case NotificationType.UrgentFeedback:
      return <ShieldAlert size={24} />;
    case NotificationType.Attendance:
      return <AlertCircle size={24} />;
    case NotificationType.Appreciation:
      return <Heart size={24} />;
    case NotificationType.WeeklyDigest:
      return <FileText size={24} />;
    default:
      return <Bell size={24} />;
  }
};

export const useLocalNotifications = () => {
  const context = useContext(LocalNotificationContext);
  if (context === undefined) {
    throw new Error('useLocalNotifications must be used within a LocalNotificationProvider');
  }
  return context;
};
