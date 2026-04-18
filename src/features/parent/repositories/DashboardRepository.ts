import apiClient from '../../../core/network/apiClient';
import { AppConfig } from '../../../core/config/appConfig';

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
    if (AppConfig.isDemo) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return {
        children: [
          {
            id: 'child_arjun',
            name: 'Arjun',
            tasksCompleted: 8,
            totalTasks: 10,
            lastActive: '10 mins ago'
          },
          {
            id: 'child_zara',
            name: 'Zara',
            tasksCompleted: 4,
            totalTasks: 10,
            lastActive: '1 hour ago'
          }
        ],
        alerts: [
          {
            id: 'alert_1',
            type: 'FEEDBACK',
            message: '1 unread teacher observation for Arjun',
            priority: 2
          },
          {
            id: 'alert_2',
            type: 'EXAM',
            message: 'Zara has a Math exam tomorrow',
            priority: 1
          }
        ],
        upcomingEvents: [
          {
            id: 'event_1',
            title: 'Doctor Appointment',
            time: '10:00 AM',
            type: 'MEDICAL'
          },
          {
            id: 'event_2',
            title: 'Math Tuition',
            time: '04:00 PM',
            type: 'EDUCATION'
          },
          {
            id: 'event_3',
            title: 'Birthday Party',
            time: 'Tomorrow',
            type: 'SOCIAL'
          }
        ],
        pendingCount: 3,
        familyScore: 85,
        streak: 12
      };
    }
    
    const response = await apiClient.get(`/families/${familyId}/dashboard`);
    return response.data;
  }
};
