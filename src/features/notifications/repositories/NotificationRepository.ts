import apiClient from '../../../core/network/apiClient';
import { MasterApiReference, resolvePath } from '../../../core/api/MasterApiReference';
import { AppConfig } from '../../../core/config/appConfig';
import type { ApiResponse, MasterDataItem } from '../../../core/network/apiTypes';
import { getMasters } from '../../../core/repositories/MasterDataRepository';

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
  calendarEnabled: boolean;
  weeklyDigestEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string;   // "07:00"
  morningDigestTime: string; // "07:00"
  eveningDigestTime: string; // "20:00"
}

export interface NotificationTypeOption {
  id: string;
  label: string;
  code: string;
}

interface PaginatedList<T> {
  items?: T[];
  totalCount?: number;
}

const mapLookupItems = (items: MasterDataItem[]): NotificationTypeOption[] =>
  items.map((item) => ({
    id: item.id,
    label: item.name,
    code: item.code,
  }));

interface NotificationPreferenceDto {
  AttendanceAlerts?: boolean;
  attendanceAlerts?: boolean;
  FeedbackAlerts?: boolean;
  feedbackAlerts?: boolean;
  TaskVerificationAlerts?: boolean;
  taskVerificationAlerts?: boolean;
  RewardAlerts?: boolean;
  rewardAlerts?: boolean;
  CalendarAlerts?: boolean;
  calendarAlerts?: boolean;
  WeeklyDigest?: boolean;
  weeklyDigest?: boolean;
  QuietHoursEnabled?: boolean;
  quietHoursEnabled?: boolean;
  QuietHoursStartTime?: string;
  quietHoursStartTime?: string;
  QuietHoursEndTime?: string;
  quietHoursEndTime?: string;
  MorningDigestTime?: string;
  morningDigestTime?: string;
  EveningDigestTime?: string;
  eveningDigestTime?: string;
}

interface NotificationDto {
  NotificationId?: string;
  notificationId?: string;
  Title?: string;
  title?: string;
  Body?: string;
  body?: string;
  ReferenceType?: string | null;
  referenceType?: string | null;
  DeepLinkPath?: string | null;
  deepLinkPath?: string | null;
  IsRead?: boolean;
  isRead?: boolean;
  CreatedAt?: string;
  createdAt?: string;
}

const toTimeValue = (value: string | undefined, fallback: string): string => {
  const raw = (value ?? '').trim();
  if (!raw) {
    return fallback;
  }

  return raw.length >= 5 ? raw.slice(0, 5) : raw;
};

const mapPreferencesDto = (dto: NotificationPreferenceDto): NotificationPreferences => ({
  attendanceEnabled: dto.AttendanceAlerts ?? dto.attendanceAlerts ?? true,
  feedbackEnabled: dto.FeedbackAlerts ?? dto.feedbackAlerts ?? true,
  rewardEnabled: dto.RewardAlerts ?? dto.rewardAlerts ?? true,
  taskEnabled: dto.TaskVerificationAlerts ?? dto.taskVerificationAlerts ?? true,
  calendarEnabled: dto.CalendarAlerts ?? dto.calendarAlerts ?? true,
  weeklyDigestEnabled: dto.WeeklyDigest ?? dto.weeklyDigest ?? true,
  quietHoursEnabled: dto.QuietHoursEnabled ?? dto.quietHoursEnabled ?? true,
  quietHoursStart: toTimeValue(dto.QuietHoursStartTime ?? dto.quietHoursStartTime, '22:00'),
  quietHoursEnd: toTimeValue(dto.QuietHoursEndTime ?? dto.quietHoursEndTime, '07:00'),
  morningDigestTime: toTimeValue(dto.MorningDigestTime ?? dto.morningDigestTime, '07:00'),
  eveningDigestTime: toTimeValue(dto.EveningDigestTime ?? dto.eveningDigestTime, '20:00'),
});

const toPreferencesRequest = (prefs: NotificationPreferences) => ({
  AttendanceAlerts: prefs.attendanceEnabled,
  FeedbackAlerts: prefs.feedbackEnabled,
  TaskVerificationAlerts: prefs.taskEnabled,
  RewardAlerts: prefs.rewardEnabled,
  CalendarAlerts: prefs.calendarEnabled,
  WeeklyDigest: prefs.weeklyDigestEnabled,
  QuietHoursEnabled: prefs.quietHoursEnabled,
  QuietHoursStartTime: `${prefs.quietHoursStart}:00`,
  QuietHoursEndTime: `${prefs.quietHoursEnd}:00`,
  MorningDigestTime: `${prefs.morningDigestTime}:00`,
  EveningDigestTime: `${prefs.eveningDigestTime}:00`,
});

const mapNotificationType = (value: string | null | undefined): NotificationType => {
  switch ((value ?? '').trim().toLowerCase()) {
    case 'attendance':
      return 'Attendance';
    case 'feedback':
      return 'Feedback';
    case 'reward':
      return 'Reward';
    case 'task':
      return 'Task';
    case 'appreciation':
      return 'Appreciation';
    default:
      return 'System';
  }
};

const mapNotificationDto = (notification: NotificationDto): AppNotification => ({
  id: notification.NotificationId ?? notification.notificationId ?? '',
  title: notification.Title ?? notification.title ?? '',
  body: notification.Body ?? notification.body ?? '',
  type: mapNotificationType(notification.ReferenceType ?? notification.referenceType),
  isRead: notification.IsRead ?? notification.isRead ?? false,
  createdAt: notification.CreatedAt ?? notification.createdAt ?? new Date().toISOString(),
  deepLinkPath: notification.DeepLinkPath ?? notification.deepLinkPath ?? '/notifications',
});

export const NotificationRepository = {
  supportsLiveHistory: (): boolean => true,

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
    const response = await apiClient.get<ApiResponse<PaginatedList<NotificationDto>>>(
      resolvePath(MasterApiReference.Notifications.UserNotifications, { userId }),
      { params: { page } },
    );
    return (response.data.data?.items ?? []).map(mapNotificationDto);
  },

  markAsRead: async (userId: string, notificationId: string): Promise<boolean> => {
    if (AppConfig.isDemo) return true;
    const response = await apiClient.put<ApiResponse<boolean>>(
      resolvePath(MasterApiReference.Notifications.UserNotificationRead, { userId, notificationId }),
    );
    return response.data.data ?? false;
  },

  markAllAsRead: async (userId: string): Promise<number> => {
    if (AppConfig.isDemo) return 10;
    const response = await apiClient.put<ApiResponse<{ count?: number; Count?: number }>>(
      resolvePath(MasterApiReference.Notifications.UserNotificationsReadAll, { userId }),
    );
    return response.data.data?.count ?? response.data.data?.Count ?? 0;
  },

  getPreferences: async (userId: string): Promise<NotificationPreferences> => {
    if (AppConfig.isDemo) {
      return {
        attendanceEnabled: true,
        feedbackEnabled: true,
        rewardEnabled: true,
        taskEnabled: true,
        calendarEnabled: true,
        weeklyDigestEnabled: true,
        quietHoursEnabled: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
        morningDigestTime: '07:00',
        eveningDigestTime: '20:00'
      };
    }
    const response = await apiClient.get<ApiResponse<NotificationPreferenceDto>>(
      resolvePath(MasterApiReference.Notifications.Preferences, { userId }),
    );
    return mapPreferencesDto(response.data.data as NotificationPreferenceDto);
  },

  updatePreferences: async (userId: string, data: Partial<NotificationPreferences>): Promise<NotificationPreferences> => {
    if (AppConfig.isDemo) return data as NotificationPreferences;
    const response = await apiClient.put<ApiResponse<NotificationPreferenceDto>>(
      resolvePath(MasterApiReference.Notifications.Preferences, { userId }),
      toPreferencesRequest(data as NotificationPreferences),
    );
    return mapPreferencesDto(response.data.data as NotificationPreferenceDto);
  },

  getNotificationTypes: async (): Promise<NotificationTypeOption[]> => {
    return mapLookupItems(await getMasters('NotificationType'));
  },
};
