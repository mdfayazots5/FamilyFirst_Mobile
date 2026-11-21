import { MasterApiReference, resolvePath } from '../../../core/api/MasterApiReference';
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

/** Input for createSession — what CreateSessionScreen sends. */
export interface CreateSessionInput {
  subject: string;
  sessionName: string;
  scheduledDate: string;
  startTime: string;
  endTime?: string;
  isRecurring: boolean;
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

export const AttendanceRepository = {
  getTodaySessions: async (familyId: string): Promise<AttendanceSession[]> => {
    const response = await apiClient.get<ApiResponse<AttendanceSession[]>>(
      resolvePath(MasterApiReference.Attendance.ListSessions, { familyId }),
      { params: { date: 'today' } }
    );
    return response.data.data ?? [];
  },

  getSessionRecords: async (familyId: string, sessionId: string): Promise<AttendanceRecord[]> => {
    const response = await apiClient.get<ApiResponse<AttendanceRecord[]>>(
      resolvePath(MasterApiReference.Attendance.SessionRecords, { familyId, sessionId })
    );
    return response.data.data ?? [];
  },

  getAttendanceStatuses: async (): Promise<AttendanceStatusOption[]> => {
    return getMasters('AttendanceStatus');
  },

  getCustomAttendanceStatuses: async (): Promise<AttendanceStatusOption[]> => {
    return getMasters('CustomAttendanceStatus');
  },

  submitAttendance: async (familyId: string, sessionId: string, records: Partial<AttendanceRecord>[]): Promise<void> => {
    await apiClient.post<ApiResponse<null>>(
      resolvePath(MasterApiReference.Attendance.SubmitSession, { familyId, sessionId }),
      { records }
    );
  },

  getCommentTemplates: async (familyId: string): Promise<CommentTemplate[]> => {
    const response = await apiClient.get<ApiResponse<CommentTemplate[]>>(
      resolvePath(MasterApiReference.Attendance.CommentTemplates, { familyId }),
      { params: { category: 'Attendance' } }
    );
    return response.data.data ?? [];
  },

  createSession: async (familyId: string, sessionData: CreateSessionInput): Promise<AttendanceSession> => {
    const response = await apiClient.post<ApiResponse<AttendanceSession>>(
      resolvePath(MasterApiReference.Attendance.CreateSession, { familyId }),
      sessionData
    );
    return response.data.data as AttendanceSession;
  }
};
