import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  CheckCheck, 
  Settings, 
  BellOff, 
  Filter,
  Inbox
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { NotificationRepository, AppNotification } from '../repositories/NotificationRepository';
import NotificationTile from '../widgets/NotificationTile';
import FFButton from '../../../shared/components/FFButton';

const NotificationHistoryScreen: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Unread'>('All');

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const data = await NotificationRepository.getNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleNotificationClick = async (notification: AppNotification) => {
    if (!user?.id) return;
    
    // Optimistic UI update
    setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
    
    try {
      if (!notification.isRead) {
        await NotificationRepository.markAsRead(user.id, notification.id);
      }
      // Navigate to deep link
      navigate(notification.deepLinkPath);
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    
    // Optimistic UI
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    
    try {
      await NotificationRepository.markAllAsRead(user.id);
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const filteredNotifications = notifications.filter(n => filter === 'All' || !n.isRead);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-bg-cream pb-32">
      <header className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-black text-primary tracking-tight mb-1">Activity</h1>
            <p className="text-sm text-gray-400 font-medium">{unreadCount} New items</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/notifications/preferences')}
              className="p-3 bg-white rounded-2xl border border-black/5 text-gray-400 hover:text-primary transition-all shadow-sm"
            >
              <Settings size={24} />
            </button>
            <button 
              onClick={() => navigate(-1)}
              className="p-3 bg-white rounded-2xl border border-black/5 text-gray-400 hover:text-primary transition-all shadow-sm"
            >
              <ArrowLeft size={24} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-1.5 p-1.5 bg-white/50 backdrop-blur-sm border border-black/[0.03] rounded-2xl shadow-sm flex-1">
            {(['All', 'Unread'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex-1 ${
                  filter === f ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button 
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-black/5 text-[10px] font-black text-primary uppercase tracking-widest disabled:opacity-30 shadow-sm"
          >
            <CheckCheck size={16} />
            <span className="hidden sm:inline">Mark All</span>
          </button>
        </div>
      </header>

      <main className="px-6 pb-20">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-white/50 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center text-gray-200 mb-6 shadow-sm">
              <Inbox size={40} />
            </div>
            <h3 className="text-xl font-display font-bold text-primary">All Caught Up!</h3>
            <p className="text-sm text-gray-400 mt-2 max-w-[200px]">
              You have no {filter === 'Unread' ? 'unread' : ''} notifications at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map(notification => (
                <NotificationTile 
                  key={notification.id} 
                  notification={notification} 
                  onClick={handleNotificationClick}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
};

export default NotificationHistoryScreen;
