import apiClient from '../../../core/network/apiClient';
import { MasterApiReference, resolvePath } from '../../../core/api/MasterApiReference';
import { UserRole } from '../../../core/auth/UserRole';
import type { ApiResponse } from '../../../core/network/apiTypes';
import { logger } from '../../../core/services/logger';
import { CalendarRepository } from '../../calendar/repositories/CalendarRepository';
import { APP_LOCALE } from '../../../core/utils/format';

export interface ChildSummary {
  id: string;            // ChildProfileId — used by /parent/children/:childId
  name: string;
  avatarUrl?: string;
  tasksCompleted: number;
  totalTasks: number;
  lastActive: string;    // display label (streak) — API exposes no last-activity timestamp
}

export interface Alert {
  id: string;
  type: 'FEEDBACK' | 'EXAM' | 'DOC_EXPIRY' | 'URGENT';
  message: string;
  priority: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  type: string;
}

export interface DashboardData {
  children: ChildSummary[];
  alerts: Alert[];
  upcomingEvents: CalendarEvent[];
  pendingCount: number;
  familyScore: number;
  streak: number;
}

/** GET /api/families/{familyId}/dashboard → ApiResponse<FamilyDashboardDto> */
interface FamilyDashboardDto {
  familyId: string;
  familyName: string;
  date: string;
  familyScore: number;
  currentStreakDays: number;
  bestStreakDays: number;
  unacknowledgedFeedbackCount: number;
  totalMembers: number;
  parentCount: number;
  childCount: number;
  teacherCount: number;
  elderCount: number;
}

/** GET /api/families/{familyId}/children → ApiResponse<ChildSummaryDto[]> */
interface ChildSummaryDto {
  childProfileId: string;
  fullName: string;
  currentStreakDays: number;
}

/** GET /api/families/{familyId}/tasks/completions?date= → ApiResponse<TaskCompletionDto[]> (Status is int TaskStatus) */
interface TaskCompletionDto {
  childProfileId: string;
  status: number;
}

const TASK_STATUS_APPROVED = 4;

const todayIso = (): string => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const formatEventTime = (iso: string, isAllDay: boolean): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const day = date.toLocaleDateString(APP_LOCALE, { day: 'numeric', month: 'short' });
  return isAllDay ? day : `${day}, ${date.toLocaleTimeString(APP_LOCALE, { hour: 'numeric', minute: '2-digit' })}`;
};

/** A failure in a secondary section should leave the rest of the dashboard available. */
const settled = <T,>(result: PromiseSettledResult<T>, fallback: T, label: string): T => {
  if (result.status === 'fulfilled') return result.value;
  logger.warn(`Parent dashboard: ${label} unavailable`, result.reason);
  return fallback;
};

export const DashboardRepository = {
  getDashboard: async (familyId: string, role: UserRole): Promise<DashboardData> => {
    const dashboardResponse = await apiClient.get<ApiResponse<FamilyDashboardDto>>(
      resolvePath(MasterApiReference.Families.Dashboard, { familyId }),
    );
    const summary = dashboardResponse.data.data;
    if (!summary) throw new Error('Family dashboard returned no data.');

    const [childrenResult, completionsResult, queueResult, eventsResult] = await Promise.allSettled([
      apiClient.get<ApiResponse<ChildSummaryDto[]>>(resolvePath(MasterApiReference.Children.List, { familyId })),
      apiClient.get<ApiResponse<TaskCompletionDto[]>>(
        resolvePath(MasterApiReference.Tasks.FamilyTaskCompletions, { familyId }),
        { params: { date: todayIso() } },
      ),
      role === UserRole.PARENT || role === UserRole.FAMILY_ADMIN
        ? apiClient.get<ApiResponse<unknown[]>>(resolvePath(MasterApiReference.Tasks.VerificationQueue, { familyId }))
        : null,
      CalendarRepository.getUpcomingEvents(familyId, 7),
    ]);

    const childDtos = settled(childrenResult, null, 'children')?.data.data ?? [];
    const completions = settled(completionsResult, null, 'task completions')?.data.data ?? [];
    const pendingCount = settled(queueResult, null, 'verification queue')?.data.data?.length ?? 0;
    const events = settled(eventsResult, [], 'upcoming events');

    const children: ChildSummary[] = childDtos.map((child) => {
      const mine = completions.filter((c) => c.childProfileId === child.childProfileId);
      return {
        id: child.childProfileId,
        name: child.fullName,
        tasksCompleted: mine.filter((c) => c.status === TASK_STATUS_APPROVED).length,
        totalTasks: mine.length,
        lastActive: `${child.currentStreakDays ?? 0}-day streak`,
      };
    });

    const alerts: Alert[] = summary.unacknowledgedFeedbackCount > 0
      ? [{
          id: 'unacknowledged-feedback',
          type: 'FEEDBACK',
          message: `${summary.unacknowledgedFeedbackCount} teacher feedback ${summary.unacknowledgedFeedbackCount === 1 ? 'item needs' : 'items need'} your acknowledgement.`,
          priority: 1,
        }]
      : [];

    const upcomingEvents: CalendarEvent[] = events.slice(0, 5).map((event) => ({
      id: event.id,
      title: event.title,
      type: String(event.type),
      time: formatEventTime(event.startDateTime, event.isAllDay),
    }));

    return {
      children,
      alerts,
      upcomingEvents,
      pendingCount,
      familyScore: summary.familyScore ?? 0,
      streak: summary.currentStreakDays ?? 0,
    };
  },
};
