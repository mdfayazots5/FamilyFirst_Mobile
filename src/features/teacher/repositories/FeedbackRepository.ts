import apiClient from '../../../core/network/apiClient';
import { MasterApiReference, resolvePath } from '../../../core/api/MasterApiReference';
import { AppConfig } from '../../../core/config/appConfig';
import type { ApiResponse } from '../../../core/network/apiTypes';

export type FeedbackType = 'Appreciation' | 'Complaint' | 'Observation' | 'Homework' | 'Urgent' | 'WeeklySummary';
export type Severity = 'Low' | 'Medium' | 'Urgent';

export interface Feedback {
  id: string;
  childProfileId: string;
  childName: string;
  teacherId: string;
  teacherName: string;
  type: FeedbackType;
  severity: Severity;
  message: string;
  date: string;
  isRead: boolean;
  parentResponse?: string;
  acknowledgedAt?: string;
  weeklyData?: {
    attendanceRate: string;
    homeworkRate: string;
    standout: string;
    focusArea: string;
  };
}

export const FeedbackRepository = {
  submitFeedback: async (familyId: string, data: any): Promise<Feedback> => {
    if (AppConfig.isDemo) {
      return {
        id: `fb_${Math.random().toString(36).substr(2, 9)}`,
        teacherId: 't1',
        teacherName: 'Mr. Sharma',
        date: new Date().toISOString(),
        isRead: false,
        ...data
      };
    }
    const response = await apiClient.post<ApiResponse<Feedback>>(
      resolvePath(MasterApiReference.Feedback.FamilyFeedback, { familyId }),
      data,
    );
    return response.data.data as Feedback;
  },

  getFeedbackHistory: async (familyId: string, teacherId: string): Promise<Feedback[]> => {
    if (AppConfig.isDemo) {
      return [
        {
          id: 'fb_1',
          childProfileId: 'c1',
          childName: 'Priya',
          teacherId: 't1',
          teacherName: 'Mr. Sharma',
          type: 'Appreciation',
          severity: 'Low',
          message: 'Outstanding algebra today! Priya solved the complex equations with ease.',
          date: new Date().toISOString(),
          isRead: true,
          acknowledgedAt: new Date().toISOString()
        },
        {
          id: 'fb_2',
          childProfileId: 'c2',
          childName: 'Arjun',
          teacherId: 't1',
          teacherName: 'Mr. Sharma',
          type: 'Complaint',
          severity: 'Medium',
          message: 'Arjun was distracted during the geometry lesson.',
          date: new Date(Date.now() - 3600000).toISOString(),
          isRead: false
        }
      ];
    }
    const response = await apiClient.get<ApiResponse<Feedback[]>>(
      resolvePath(MasterApiReference.Feedback.FamilyFeedback, { familyId }),
      { params: { teacherId } },
    );
    return response.data.data ?? [];
  },

  getFeedbackInbox: async (familyId: string, childId?: string): Promise<Feedback[]> => {
    if (AppConfig.isDemo) {
      return [
        {
          id: 'fb_1',
          childProfileId: 'c1',
          childName: 'Priya',
          teacherId: 't1',
          teacherName: 'Mr. Sharma',
          type: 'Appreciation',
          severity: 'Low',
          message: 'Outstanding algebra today!',
          date: '2024-04-11T10:00:00Z',
          isRead: true
        },
        {
          id: 'fb_2',
          childProfileId: 'c2',
          childName: 'Arjun',
          teacherId: 't2',
          teacherName: 'Ms. Gupta',
          type: 'Complaint',
          severity: 'Urgent',
          message: 'Missed the final project deadline.',
          date: '2024-04-11T11:00:00Z',
          isRead: false
        },
        {
          id: 'fb_3',
          childProfileId: 'c1',
          childName: 'Priya',
          teacherId: 't1',
          teacherName: 'Mr. Sharma',
          type: 'WeeklySummary',
          severity: 'Low',
          message: 'Great week overall.',
          date: '2024-04-12T09:00:00Z',
          isRead: true,
          weeklyData: {
            attendanceRate: '100%',
            homeworkRate: '90%',
            standout: 'Active participation in science fair.',
            focusArea: 'Handwriting neatness.'
          }
        }
      ];
    }
    const response = await apiClient.get<ApiResponse<Feedback[]>>(
      resolvePath(MasterApiReference.Feedback.FamilyFeedback, { familyId }),
      { params: { childId } },
    );
    return response.data.data ?? [];
  },

  acknowledgeFeedback: async (feedbackId: string, parentResponseText: string): Promise<Feedback> => {
    if (AppConfig.isDemo) {
      return {
        id: feedbackId,
        isRead: true,
        parentResponse: parentResponseText,
        acknowledgedAt: new Date().toISOString()
      } as Feedback;
    }
    const response = await apiClient.post<ApiResponse<Feedback>>(
      resolvePath(MasterApiReference.Feedback.Acknowledge, { feedbackId }),
      { parentResponseText },
    );
    return response.data.data as Feedback;
  },

  updateFeedback: async (familyId: string, feedbackId: string, data: any): Promise<Feedback> => {
    if (AppConfig.isDemo) return { id: feedbackId, ...data } as Feedback;
    const response = await apiClient.put<ApiResponse<Feedback>>(
      resolvePath(MasterApiReference.Feedback.FamilyFeedbackItem, { familyId, feedbackId }),
      data,
    );
    return response.data.data as Feedback;
  },

  deleteFeedback: async (familyId: string, feedbackId: string): Promise<boolean> => {
    if (AppConfig.isDemo) return true;
    const response = await apiClient.delete<ApiResponse<boolean>>(
      resolvePath(MasterApiReference.Feedback.FamilyFeedbackItem, { familyId, feedbackId }),
    );
    return response.data.data ?? false;
  }
};
