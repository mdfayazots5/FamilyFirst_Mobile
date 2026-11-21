import apiClient from '../../../core/network/apiClient';
import { MasterApiReference, resolvePath } from '../../../core/api/MasterApiReference';
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
    const response = await apiClient.get<ApiResponse<PaginatedList<NotificationDto>>>(
      resolvePath(MasterApiReference.Notifications.UserNotifications, { userId }),
      { params: { page } },
    );
    return (response.data.data?.items ?? []).map(mapNotificationDto);
  },

  markAsRead: async (userId: string, notificationId: string): Promise<boolean> => {
    const response = await apiClient.put<ApiResponse<boolean>>(
      resolvePath(MasterApiReference.Notifications.UserNotificationRead, { userId, notificationId }),
    );
    return response.data.data ?? false;
  },

  markAllAsRead: async (userId: string): Promise<number> => {
    const response = await apiClient.put<ApiResponse<{ count?: number; Count?: number }>>(
      resolvePath(MasterApiReference.Notifications.UserNotificationsReadAll, { userId }),
    );
    return response.data.data?.count ?? response.data.data?.Count ?? 0;
  },

  getPreferences: async (userId: string): Promise<NotificationPreferences> => {
    const response = await apiClient.get<ApiResponse<NotificationPreferenceDto>>(
      resolvePath(MasterApiReference.Notifications.Preferences, { userId }),
    );
    return mapPreferencesDto(response.data.data as NotificationPreferenceDto);
  },

  updatePreferences: async (userId: string, data: Partial<NotificationPreferences>): Promise<NotificationPreferences> => {
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
