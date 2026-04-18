import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../core/auth/AuthContext';
import { NotificationRepository, AppNotification } from '../repositories/NotificationRepository';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  refresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
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
    refresh();
    // Poll every 1 minute for new notifications in demo/live
    const interval = setInterval(refresh, 60000);
    return () => clearInterval(interval);
  }, [refresh]);

  const markRead = async (id: string) => {
    if (!user?.id) return;
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      await NotificationRepository.markAsRead(user.id, id);
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const markAllRead = async () => {
    if (!user?.id) return;
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      await NotificationRepository.markAllAsRead(user.id);
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      isLoading, 
      refresh, 
      markRead, 
      markAllRead 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
