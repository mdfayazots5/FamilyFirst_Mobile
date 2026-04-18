import apiClient from '../../../core/network/apiClient';
import { AppConfig } from '../../../core/config/appConfig';

export type NotificationType = 'Attendance' | 'Feedback' | 'Reward' | 'Task' | 'System' | 'Appreciation';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  deepLinkPath: string;
  metadata?: Record<string, any>;
}

export interface NotificationPreferences {
  attendanceEnabled: boolean;
  feedbackEnabled: boolean;
  rewardEnabled: boolean;
  taskEnabled: boolean;
  appreciationEnabled: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string;   // "07:00"
  morningDigestTime: string; // "07:00"
  eveningDigestTime: string; // "20:00"
}

export const NotificationRepository = {
  getNotifications: async (userId: string, page = 1): Promise<AppNotification[]> => {
    if (AppConfig.isDemo) {
      const now = new Date();
      return [
        {
          id: 'n1',
          title: 'Attendance Marked',
          body: 'Arjun was marked absent for Math class today.',
          type: 'Attendance',
          isRead: false,
          createdAt: new Date(now.getTime() - 1000 * 60 * 30).toISOString(), // 30 mins ago
          deepLinkPath: '/parent/verification'
        },
        {
          id: 'n2',
          title: 'New Feedback',
          body: 'Mr. Ahmed sent new feedback for Zara.',
          type: 'Feedback',
          isRead: false,
          createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          deepLinkPath: '/parent/feedback'
        },
        {
          id: 'n3',
          title: 'Reward Approved',
          body: 'Your "Movie Night" reward has been approved! Enjoy!',
          type: 'Reward',
          isRead: false,
          createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
          deepLinkPath: '/child/coins'
        },
        {
          id: 'n4',
          title: 'Task Verified',
          body: 'Mom verified your "Clean Room" task. +20 coins!',
          type: 'Task',
          isRead: true,
          createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          deepLinkPath: '/child'
        },
        {
          id: 'n5',
          title: 'New Appreciation',
          body: 'Dadi sent you a blessing! 🙏',
          type: 'Appreciation',
          isRead: true,
          createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
          deepLinkPath: '/child/family'
        },
        {
          id: 'n6',
          title: 'Upcoming Event',
          body: 'Family Outing starts in 1 hour.',
          type: 'System',
          isRead: true,
          createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(),
          deepLinkPath: '/calendar'
        },
        {
          id: 'n7',
          title: 'Tuition Reminder',
          body: 'Math tuition starts at 4:00 PM.',
          type: 'System',
          isRead: true,
          createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 4).toISOString(),
          deepLinkPath: '/calendar'
        },
        {
          id: 'n8',
          title: 'Goal Progress',
          body: 'Family Goal "Water Park" is 70% complete!',
          type: 'System',
          isRead: true,
          createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5).toISOString(),
          deepLinkPath: '/parent/goals'
        },
        {
          id: 'n9',
          title: 'Subscription Update',
          body: 'Your Premium trial ends in 3 days.',
          type: 'System',
          isRead: true,
          createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 6).toISOString(),
          deepLinkPath: '/profile'
        },
        {
          id: 'n10',
          title: 'Welcome to FamilyFirst',
          body: 'Start by setting up your family routine.',
          type: 'System',
          isRead: true,
          createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30).toISOString(),
          deepLinkPath: '/parent'
        }
      ];
    }
    const response = await apiClient.get(`/users/${userId}/notifications`, { params: { page } });
    return response.data;
  },

  markAsRead: async (userId: string, notificationId: string): Promise<boolean> => {
    if (AppConfig.isDemo) return true;
    const response = await apiClient.put(`/users/${userId}/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async (userId: string): Promise<number> => {
    if (AppConfig.isDemo) return 10;
    const response = await apiClient.put(`/users/${userId}/notifications/read-all`);
    return response.data.count;
  },

  getPreferences: async (userId: string): Promise<NotificationPreferences> => {
    if (AppConfig.isDemo) {
      return {
        attendanceEnabled: true,
        feedbackEnabled: true,
        rewardEnabled: true,
        taskEnabled: true,
        appreciationEnabled: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
        morningDigestTime: '07:00',
        eveningDigestTime: '20:00'
      };
    }
    const response = await apiClient.get(`/users/${userId}/notification-preferences`);
    return response.data;
  },

  updatePreferences: async (userId: string, data: Partial<NotificationPreferences>): Promise<NotificationPreferences> => {
    if (AppConfig.isDemo) return data as NotificationPreferences;
    const response = await apiClient.put(`/users/${userId}/notification-preferences`, data);
    return response.data;
  }
};
