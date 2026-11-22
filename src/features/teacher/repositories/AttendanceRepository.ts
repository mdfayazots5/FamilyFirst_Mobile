import { MasterApiReference, resolvePath } from '../../../core/api/MasterApiReference';
import apiClient from '../../../core/network/apiClient';
import type { ApiResponse, MasterDataItem } from '../../../core/network/apiTypes';
import { requireApiData } from '../../../core/network/apiTypes';
import { toLocalIsoDate } from '../../../core/utils/format';
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

/** API AttendanceSessionDto (camelCase JSON). */
interface AttendanceSessionDto {
  sessionId: string;
  sessionName: string;
  subjectName: string;
  scheduledDate: string;
  startTime: string;
  isSubmitted: boolean;
  submittedAt?: string | null;
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
  /**
   * GET …/attendance/sessions?date=YYYY-MM-DD (DateOnly — the literal "today" returns 400).
   * Maps AttendanceSessionDto (sessionId, subjectName, …). The DTO has no student count, so it is the
   * number of attendance records in each session.
   */
  getTodaySessions: async (familyId: string): Promise<AttendanceSession[]> => {
    const response = await apiClient.get<ApiResponse<AttendanceSessionDto[]>>(
      resolvePath(MasterApiReference.Attendance.ListSessions, { familyId }),
      { params: { date: toLocalIsoDate() } }
    );
    const sessions = requireApiData(response.data, 'AttendanceRepository.getTodaySessions');
    return Promise.all(sessions.map(async (dto) => {
      const records = await AttendanceRepository.getSessionRecords(familyId, dto.sessionId).catch(() => []);
      return {
        id: dto.sessionId,
        sessionName: dto.sessionName,
        subject: dto.subjectName,
        scheduledDate: dto.scheduledDate,
        startTime: dto.startTime,
        studentCount: records.length,
        isSubmitted: dto.isSubmitted,
        submittedAt: dto.submittedAt ?? undefined,
      };
    }));
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

  /**
   * POST …/attendance/sessions — API CreateSessionRequest uses SubjectName (not subject) and TimeOnly
   * values, so the screen input is mapped explicitly (audit finding F-P5-3).
   */
  createSession: async (familyId: string, sessionData: CreateSessionInput): Promise<AttendanceSession> => {
    const toTimeOnly = (value?: string) => (value && /^\d{2}:\d{2}$/.test(value) ? `${value}:00` : value || undefined);
    const response = await apiClient.post<ApiResponse<AttendanceSessionDto>>(
      resolvePath(MasterApiReference.Attendance.CreateSession, { familyId }),
      {
        sessionName: sessionData.sessionName,
        subjectName: sessionData.subject,
        scheduledDate: sessionData.scheduledDate,
        startTime: toTimeOnly(sessionData.startTime),
        endTime: toTimeOnly(sessionData.endTime),
        isRecurring: sessionData.isRecurring,
      },
    );
    const dto = requireApiData(response.data, 'AttendanceRepository.createSession');
    return {
      id: dto.sessionId,
      sessionName: dto.sessionName,
      subject: dto.subjectName,
      scheduledDate: dto.scheduledDate,
      startTime: dto.startTime,
      studentCount: 0,
      isSubmitted: dto.isSubmitted,
      submittedAt: dto.submittedAt ?? undefined,
    };
  }
};
