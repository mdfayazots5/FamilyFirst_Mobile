import React from 'react';
import { motion } from 'motion/react';
import { 
  Bell, 
  MessageSquare, 
  Trophy, 
  CheckCircle2, 
  Heart, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { AppNotification, NotificationType } from '../repositories/NotificationRepository';
import FFCard from '../../../shared/components/FFCard';

interface NotificationTileProps {
  notification: AppNotification;
  onClick: (notification: AppNotification) => void;
}

const NotificationTile: React.FC<NotificationTileProps> = ({ notification, onClick }) => {
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'Attendance': return <AlertCircle size={20} className="text-alert" />;
      case 'Feedback': return <MessageSquare size={20} className="text-primary" />;
      case 'Reward': return <Trophy size={20} className="text-amber-500" />;
      case 'Task': return <CheckCircle2 size={20} className="text-success" />;
      case 'Appreciation': return <Heart size={20} className="text-accent" />;
      default: return <Bell size={20} className="text-gray-400" />;
    }
  };

  const getBgColor = (type: NotificationType) => {
    switch (type) {
      case 'Attendance': return 'bg-alert/5';
      case 'Feedback': return 'bg-primary/5';
      case 'Reward': return 'bg-amber-50';
      case 'Task': return 'bg-success/5';
      case 'Appreciation': return 'bg-accent/5';
      default: return 'bg-gray-50';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(notification)}
      className="cursor-pointer"
    >
      <FFCard className={`p-4 flex items-start gap-4 transition-all ${!notification.isRead ? 'border-l-4 border-amber-500 bg-white' : 'bg-white/60 opacity-80'}`}>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${getBgColor(notification.type)}`}>
          {getIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <h4 className={`text-sm font-bold text-primary truncate ${!notification.isRead ? '' : 'font-medium'}`}>
              {notification.title}
            </h4>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
              {formatTime(notification.createdAt)}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
            {notification.body}
          </p>
        </div>

        {!notification.isRead && (
          <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 shrink-0 shadow-sm shadow-amber-500/50" />
        )}
      </FFCard>
    </motion.div>
  );
};

export default NotificationTile;
