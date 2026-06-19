import apiClient from '../../../core/network/apiClient';
import { MasterApiReference, resolvePath } from '../../../core/api/MasterApiReference';
import { AppConfig } from '../../../core/config/appConfig';
import type { ApiResponse, MasterDataItem } from '../../../core/network/apiTypes';
import { getMasters } from '../../../core/repositories/MasterDataRepository';

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

export interface FeedbackRatingOption {
  id: string;
  label: string;
  code: string;
}

interface FeedbackDto {
  FeedbackId?: string;
  feedbackId?: string;
  ChildProfileId?: string;
  childProfileId?: string;
  ChildName?: string;
  childName?: string;
  TeacherProfileId?: string;
  teacherProfileId?: string;
  TeacherName?: string;
  teacherName?: string;
  FeedbackType?: number | string;
  feedbackType?: number | string;
  Severity?: number | string;
  severity?: number | string;
  Message?: string;
  message?: string;
  SubmittedAt?: string;
  submittedAt?: string;
  IsAcknowledged?: boolean;
  isAcknowledged?: boolean;
  ParentResponseText?: string;
  parentResponseText?: string;
  AcknowledgedAt?: string;
  acknowledgedAt?: string;
  WeeklySummaryJson?: string | null;
  weeklySummaryJson?: string | null;
}

const FEEDBACK_TYPE_TO_ENUM: Record<FeedbackType, number> = {
  Appreciation: 1,
  Complaint: 2,
  Observation: 3,
  Homework: 4,
  Urgent: 5,
  WeeklySummary: 6,
};

const SEVERITY_TO_ENUM: Record<Severity, number> = {
  Low: 1,
  Medium: 2,
  Urgent: 3,
};

const mapFeedbackType = (value: number | string | undefined): FeedbackType => {
  if (typeof value === 'number') {
    switch (value) {
      case 1:
        return 'Appreciation';
      case 2:
        return 'Complaint';
      case 3:
        return 'Observation';
      case 4:
        return 'Homework';
      case 5:
        return 'Urgent';
      case 6:
        return 'WeeklySummary';
      default:
        return 'Observation';
    }
  }

  switch ((value ?? '').toString().toLowerCase()) {
    case 'appreciation':
      return 'Appreciation';
    case 'complaint':
      return 'Complaint';
    case 'homework':
      return 'Homework';
    case 'urgent':
    case 'urgentescalation':
      return 'Urgent';
    case 'weeklysummary':
      return 'WeeklySummary';
    default:
      return 'Observation';
  }
};

const mapSeverity = (value: number | string | undefined): Severity => {
  if (typeof value === 'number') {
    switch (value) {
      case 1:
        return 'Low';
      case 2:
        return 'Medium';
      case 3:
        return 'Urgent';
      default:
        return 'Low';
    }
  }

  switch ((value ?? '').toString().toLowerCase()) {
    case 'medium':
      return 'Medium';
    case 'urgent':
      return 'Urgent';
    default:
      return 'Low';
  }
};

const parseWeeklySummary = (raw: string | null | undefined) => {
  if (!raw) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, string | number>;
    return {
      attendanceRate: String(parsed.attendanceRate ?? ''),
      homeworkRate: String(parsed.homeworkRate ?? ''),
      standout: String(parsed.standout ?? parsed.standoutMoment ?? ''),
      focusArea: String(parsed.focusArea ?? ''),
    };
  } catch {
    return undefined;
  }
};

const mapFeedbackDto = (feedback: FeedbackDto): Feedback => ({
  id: feedback.FeedbackId ?? feedback.feedbackId ?? '',
  childProfileId: feedback.ChildProfileId ?? feedback.childProfileId ?? '',
  childName: feedback.ChildName ?? feedback.childName ?? '',
  teacherId: feedback.TeacherProfileId ?? feedback.teacherProfileId ?? '',
  teacherName: feedback.TeacherName ?? feedback.teacherName ?? '',
  type: mapFeedbackType(feedback.FeedbackType ?? feedback.feedbackType),
  severity: mapSeverity(feedback.Severity ?? feedback.severity),
  message: feedback.Message ?? feedback.message ?? '',
  date: feedback.SubmittedAt ?? feedback.submittedAt ?? '',
  isRead: feedback.IsAcknowledged ?? feedback.isAcknowledged ?? false,
  parentResponse: feedback.ParentResponseText ?? feedback.parentResponseText ?? undefined,
  acknowledgedAt: feedback.AcknowledgedAt ?? feedback.acknowledgedAt ?? undefined,
  weeklyData: parseWeeklySummary(feedback.WeeklySummaryJson ?? feedback.weeklySummaryJson),
});

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
    const response = await apiClient.post<ApiResponse<FeedbackDto>>(
      resolvePath(MasterApiReference.Feedback.FamilyFeedback, { familyId }),
      {
        ChildProfileId: data.childProfileId,
        FeedbackType: FEEDBACK_TYPE_TO_ENUM[data.type as FeedbackType] ?? FEEDBACK_TYPE_TO_ENUM.Observation,
        Severity: SEVERITY_TO_ENUM[data.severity as Severity] ?? SEVERITY_TO_ENUM.Low,
        Message: data.message,
        WeeklySummaryJson: data.weeklyData
          ? JSON.stringify({
              attendanceRate: Number(data.weeklyData.attendanceRate),
              homeworkRate: Number(data.weeklyData.homeworkRate),
              standoutMoment: data.weeklyData.standout,
              focusArea: data.weeklyData.focusArea,
            })
          : null,
      },
    );
    return mapFeedbackDto(response.data.data as FeedbackDto);
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
    const response = await apiClient.get<ApiResponse<FeedbackDto[]>>(
      resolvePath(MasterApiReference.Feedback.FamilyFeedback, { familyId }),
      { params: { teacherId } },
    );
    return (response.data.data ?? []).map(mapFeedbackDto);
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
    const response = await apiClient.get<ApiResponse<FeedbackDto[]>>(
      resolvePath(MasterApiReference.Feedback.FamilyFeedback, { familyId }),
      { params: { childId } },
    );
    return (response.data.data ?? []).map(mapFeedbackDto);
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
    const response = await apiClient.post<ApiResponse<FeedbackDto>>(
      resolvePath(MasterApiReference.Feedback.Acknowledge, { feedbackId }),
      { ParentResponseText: parentResponseText },
    );
    return mapFeedbackDto(response.data.data as FeedbackDto);
  },

  updateFeedback: async (familyId: string, feedbackId: string, data: any): Promise<Feedback> => {
    if (AppConfig.isDemo) return { id: feedbackId, ...data } as Feedback;
    const response = await apiClient.put<ApiResponse<FeedbackDto>>(
      resolvePath(MasterApiReference.Feedback.FamilyFeedbackItem, { familyId, feedbackId }),
      {
        Message: data.message,
        Severity: data.severity ? SEVERITY_TO_ENUM[data.severity as Severity] : undefined,
      },
    );
    return mapFeedbackDto(response.data.data as FeedbackDto);
  },

  deleteFeedback: async (familyId: string, feedbackId: string): Promise<boolean> => {
    if (AppConfig.isDemo) return true;
    const response = await apiClient.delete<ApiResponse<boolean>>(
      resolvePath(MasterApiReference.Feedback.FamilyFeedbackItem, { familyId, feedbackId }),
    );
    return response.data.data ?? false;
  },

  getFeedbackRatings: async (): Promise<FeedbackRatingOption[]> => {
    if (AppConfig.isDemo) {
      return [
        { id: 'feedback-low', label: 'Low', code: 'Low' },
        { id: 'feedback-medium', label: 'Medium', code: 'Medium' },
        { id: 'feedback-urgent', label: 'Urgent', code: 'Urgent' },
      ];
    }

    const items = await getMasters('FeedbackRating');
    return items.map((item: MasterDataItem) => ({
      id: item.id,
      label: item.name,
      code: item.code,
    }));
  },
};
