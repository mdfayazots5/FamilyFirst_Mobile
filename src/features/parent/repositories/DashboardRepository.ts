import apiClient from '../../../core/network/apiClient';
import { MasterApiReference, resolvePath } from '../../../core/api/MasterApiReference';
import type { ApiResponse } from '../../../core/network/apiTypes';

export interface ChildSummary {
  id: string;
  name: string;
  avatarUrl?: string;
  tasksCompleted: number;
  totalTasks: number;
  lastActive: string;
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
  type: 'MEDICAL' | 'EDUCATION' | 'SOCIAL' | 'OTHER';
}

export interface DashboardData {
  children: ChildSummary[];
  alerts: Alert[];
  upcomingEvents: CalendarEvent[];
  pendingCount: number;
  familyScore: number;
  streak: number;
}

export const DashboardRepository = {
  getDashboard: async (familyId: string): Promise<DashboardData> => {
    
    const response = await apiClient.get<ApiResponse<DashboardData>>(
      resolvePath(MasterApiReference.Families.Dashboard, { familyId }),
    );
    return response.data.data as DashboardData;
  }
};
