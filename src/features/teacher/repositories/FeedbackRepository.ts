import apiClient from '../../../core/network/apiClient';
import { MasterApiReference, resolvePath } from '../../../core/api/MasterApiReference';
import type { ApiResponse, MasterDataItem } from '../../../core/network/apiTypes';
import { requireApiData } from '../../../core/network/apiTypes';
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

/** Input for submitFeedback — what FeedbackSubmissionScreen sends. */
export interface SubmitFeedbackInput {
  childProfileId: string;
  type: FeedbackType;
  severity?: Severity;
  message: string;
  weeklyData?: Feedback['weeklyData'];
}

/** Input for updateFeedback — the backend UpdateFeedbackRequest accepts Message and Severity only. */
export interface UpdateFeedbackInput {
  message?: string;
  severity?: Severity;
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

interface FeedbackPage {
  items: FeedbackDto[];
  hasNextPage: boolean;
}

const listFeedback = async (familyId: string, filters: { childId?: string; teacherId?: string }): Promise<Feedback[]> => {
  const path = resolvePath(MasterApiReference.Feedback.FamilyFeedback, { familyId });
  const items: FeedbackDto[] = [];

  for (let page = 1; ; page += 1) {
    const { data } = await apiClient.get<ApiResponse<FeedbackPage | FeedbackDto[]>>(path, { params: { ...filters, page } });
    const result = requireApiData(data, 'Feedback list');
    if (Array.isArray(result)) return [...items, ...result].map(mapFeedbackDto);
    items.push(...result.items);
    if (!result.hasNextPage) return items.map(mapFeedbackDto);
  }
};

export const FeedbackRepository = {
  submitFeedback: async (familyId: string, data: SubmitFeedbackInput): Promise<Feedback> => {
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

  getFeedbackHistory: (familyId: string, teacherId: string): Promise<Feedback[]> =>
    listFeedback(familyId, { teacherId }),

  getFeedbackInbox: (familyId: string, childId?: string): Promise<Feedback[]> =>
    listFeedback(familyId, { childId }),

  getFeedback: async (familyId: string, feedbackId: string): Promise<Feedback> => {
    const { data } = await apiClient.get<ApiResponse<FeedbackDto>>(
      resolvePath(MasterApiReference.Feedback.FamilyFeedbackItem, { familyId, feedbackId }),
    );
    return mapFeedbackDto(requireApiData(data, 'Feedback detail'));
  },

  acknowledgeFeedback: async (feedbackId: string, parentResponseText: string): Promise<Feedback> => {
    const response = await apiClient.post<ApiResponse<FeedbackDto>>(
      resolvePath(MasterApiReference.Feedback.Acknowledge, { feedbackId }),
      { ParentResponseText: parentResponseText },
    );
    return mapFeedbackDto(response.data.data as FeedbackDto);
  },

  updateFeedback: async (familyId: string, feedbackId: string, data: UpdateFeedbackInput): Promise<Feedback> => {
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
    const response = await apiClient.delete<ApiResponse<boolean>>(
      resolvePath(MasterApiReference.Feedback.FamilyFeedbackItem, { familyId, feedbackId }),
    );
    return response.data.data ?? false;
  },

  getFeedbackRatings: async (): Promise<FeedbackRatingOption[]> => {
    const items = await getMasters('FeedbackRating');
    return items.map((item: MasterDataItem) => ({
      id: item.id,
      label: item.name,
      code: item.code,
    }));
  },
};
