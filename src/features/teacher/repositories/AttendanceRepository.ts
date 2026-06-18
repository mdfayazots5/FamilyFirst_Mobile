import { MasterApiReference, resolvePath } from '../../../core/api/MasterApiReference';
import { AppConfig } from '../../../core/config/appConfig';
import apiClient from '../../../core/network/apiClient';
import type { ApiResponse, MasterDataItem } from '../../../core/network/apiTypes';
import { getMasters } from '../../../core/repositories/MasterDataRepository';

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'LeftEarly';
export type AttendanceStatusOption = MasterDataItem;

export interface AttendanceSession {
  id: string;
  sessionName: string;
  subject: string;
  scheduledDate: string;
  startTime: string;
  studentCount: number;
  isSubmitted: boolean;
  submittedAt?: string;
}

export interface AttendanceRecord {
  id: string;
  childProfileId: string;
  childName: string;
  avatarUrl?: string;
  status: AttendanceStatus;
  comment?: string;
}

export interface CommentTemplate {
  id: string;
  text: string;
  category: string;
}

const DEMO_ATTENDANCE_STATUSES: MasterDataItem[] = [
  { id: 'status-present', name: 'Present', code: 'Present', sortOrder: 1 },
  { id: 'status-absent', name: 'Absent', code: 'Absent', sortOrder: 2 },
  { id: 'status-late', name: 'Late', code: 'Late', sortOrder: 3 },
  { id: 'status-left-early', name: 'LeftEarly', code: 'LeftEarly', sortOrder: 4 },
];

export const AttendanceRepository = {
  getTodaySessions: async (familyId: string): Promise<AttendanceSession[]> => {
    if (AppConfig.isDemo) {
      return [
        { 
          id: 'sess_1', 
          sessionName: 'Batch A', 
          subject: 'Mathematics', 
          scheduledDate: '2024-04-11', 
          startTime: '04:00 PM', 
          studentCount: 6, 
          isSubmitted: false 
        },
        { 
          id: 'sess_2', 
          sessionName: 'Batch B', 
          subject: 'English', 
          scheduledDate: '2024-04-11', 
          startTime: '06:00 PM', 
          studentCount: 4, 
          isSubmitted: false 
        },
        { 
          id: 'sess_3', 
          sessionName: 'Batch C', 
          subject: 'Science', 
          scheduledDate: '2024-04-11', 
          startTime: '10:00 AM', 
          studentCount: 5, 
          isSubmitted: true,
          submittedAt: new Date().toISOString()
        },
      ];
    }
    const response = await apiClient.get<ApiResponse<AttendanceSession[]>>(
      resolvePath(MasterApiReference.Attendance.ListSessions, { familyId }),
      { params: { date: 'today' } }
    );
    return response.data.data ?? [];
  },

  getSessionRecords: async (familyId: string, sessionId: string): Promise<AttendanceRecord[]> => {
    if (AppConfig.isDemo) {
      return [
        { id: 'rec_1', childProfileId: 'c1', childName: 'Rayan', status: 'Present' },
        { id: 'rec_2', childProfileId: 'c2', childName: 'Arjun', status: 'Present' },
        { id: 'rec_3', childProfileId: 'c3', childName: 'Zara', status: 'Present' },
        { id: 'rec_4', childProfileId: 'c4', childName: 'Sana', status: 'Present' },
        { id: 'rec_5', childProfileId: 'c5', childName: 'Omar', status: 'Present' },
        { id: 'rec_6', childProfileId: 'c6', childName: 'Zaid', status: 'Present' },
      ];
    }
    const response = await apiClient.get<ApiResponse<AttendanceRecord[]>>(
      resolvePath(MasterApiReference.Attendance.SessionRecords, { familyId, sessionId })
    );
    return response.data.data ?? [];
  },

  getAttendanceStatuses: async (): Promise<AttendanceStatusOption[]> => {
    if (AppConfig.isDemo) {
      return DEMO_ATTENDANCE_STATUSES;
    }

    return getMasters('AttendanceStatus');
  },

  getCustomAttendanceStatuses: async (): Promise<AttendanceStatusOption[]> => {
    if (AppConfig.isDemo) {
      return [];
    }

    return getMasters('CustomAttendanceStatus');
  },

  submitAttendance: async (familyId: string, sessionId: string, records: Partial<AttendanceRecord>[]): Promise<void> => {
    if (AppConfig.isDemo) return;
    await apiClient.post<ApiResponse<null>>(
      resolvePath(MasterApiReference.Attendance.SubmitSession, { familyId, sessionId }),
      { records }
    );
  },

  getCommentTemplates: async (familyId: string): Promise<CommentTemplate[]> => {
    if (AppConfig.isDemo) {
      return [
        { id: 't1', text: 'Second absence this week', category: 'Attendance' },
        { id: 't2', text: 'Arrived very late', category: 'Attendance' },
        { id: 't3', text: 'Left early for appointment', category: 'Attendance' },
        { id: 't4', text: 'Consistent attendance', category: 'Attendance' },
      ];
    }
    const response = await apiClient.get<ApiResponse<CommentTemplate[]>>(
      resolvePath(MasterApiReference.Attendance.CommentTemplates, { familyId }),
      { params: { category: 'Attendance' } }
    );
    return response.data.data ?? [];
  },

  createSession: async (familyId: string, sessionData: any): Promise<AttendanceSession> => {
    if (AppConfig.isDemo) {
      return {
        id: `sess_${Math.random().toString(36).substr(2, 9)}`,
        ...sessionData,
        studentCount: 0,
        isSubmitted: false
      };
    }
    const response = await apiClient.post<ApiResponse<AttendanceSession>>(
      resolvePath(MasterApiReference.Attendance.CreateSession, { familyId }),
      sessionData
    );
    return response.data.data as AttendanceSession;
  }
};
