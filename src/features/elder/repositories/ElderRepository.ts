import apiClient from '../../../core/network/apiClient';
import { MasterApiReference, resolvePath } from '../../../core/api/MasterApiReference';
import { AppConfig } from '../../../core/config/appConfig';
import type { ApiResponse, MasterDataItem } from '../../../core/network/apiTypes';
import { getMasters } from '../../../core/repositories/MasterDataRepository';
import type { EventType } from '../../calendar/repositories/CalendarRepository';

export interface Appreciation {
  id: string;
  childProfileId: string;
  childName: string;
  authorId: string;
  authorName: string;
  message: string;
  sticker?: string;
  audioUrl?: string;
  createdAt: string;
}

export interface GrandchildStatus {
  id: string;
  name: string;
  avatarUrl?: string;
  tasksCompleted: number;
  totalTasks: number;
  status: 'Doing Great' | 'Needs Help' | 'Just Started';
}

export interface ElderEventTypeOption {
  id: string;
  label: string;
  code: EventType;
}

const mapCalendarEventTypeCode = (value: string | undefined): EventType => {
  const normalized = (value ?? '').trim().toLowerCase();

  switch (normalized) {
    case 'doctorappointment':
      return 'DoctorAppointment';
    case 'schoolevent':
      return 'SchoolEvent';
    case 'tuition':
    case 'tuitionclass':
      return 'Tuition';
    case 'birthday':
      return 'Birthday';
    case 'medicine':
    case 'medicinereminder':
      return 'Medicine';
    case 'exam':
    case 'examdate':
      return 'Exam';
    case 'familytravel':
    case 'other':
    default:
      return 'FamilyTravel';
  }
};

const mapLookupItems = (items: MasterDataItem[]): ElderEventTypeOption[] =>
  items.map((item) => ({
    id: item.id,
    label: item.name,
    code: mapCalendarEventTypeCode(item.code),
  }));

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
  Message?: string;
  message?: string;
  CreatedAt?: string;
  createdAt?: string;
}

const mapFeedbackToAppreciation = (feedback: FeedbackDto): Appreciation => ({
  id: feedback.FeedbackId ?? feedback.feedbackId ?? '',
  childProfileId: feedback.ChildProfileId ?? feedback.childProfileId ?? '',
  childName: feedback.ChildName ?? feedback.childName ?? '',
  authorId: feedback.TeacherProfileId ?? feedback.teacherProfileId ?? '',
  authorName: feedback.TeacherName ?? feedback.teacherName ?? '',
  message: feedback.Message ?? feedback.message ?? '',
  createdAt: feedback.CreatedAt ?? feedback.createdAt ?? new Date().toISOString(),
});

export const ElderRepository = {
  getGrandchildren: async (familyId: string): Promise<GrandchildStatus[]> => {
    if (AppConfig.isDemo) {
      return [
        { id: 'mem_2', name: 'Arjun', tasksCompleted: 8, totalTasks: 10, status: 'Doing Great' },
        { id: 'mem_3', name: 'Zara', tasksCompleted: 4, totalTasks: 8, status: 'Needs Help' }
      ];
    }
    const response = await apiClient.get<ApiResponse<GrandchildStatus[]>>(
      resolvePath(MasterApiReference.Elder.Grandchildren, { familyId }),
    );
    return response.data.data ?? [];
  },

  sendAppreciation: async (familyId: string, data: Partial<Appreciation>): Promise<Appreciation> => {
    if (AppConfig.isDemo) {
      return {
        id: `appr_${Math.random()}`,
        createdAt: new Date().toISOString(),
        ...data
      } as Appreciation;
    }
    const response = await apiClient.post<ApiResponse<FeedbackDto>>(
      resolvePath(MasterApiReference.Feedback.FamilyFeedback, { familyId }),
      {
        ChildProfileId: data.childProfileId,
        FeedbackType: 1,
        Message: data.message,
      },
    );
    return mapFeedbackToAppreciation(response.data.data as FeedbackDto);
  },

  getAppreciations: async (familyId: string): Promise<Appreciation[]> => {
    if (AppConfig.isDemo) {
      return [
        {
          id: 'a1',
          childProfileId: 'mem_2',
          childName: 'Arjun',
          authorId: 'mem_4',
          authorName: 'Dadi',
          message: 'Bahut acha kiya beta! 🙏',
          sticker: '🙏',
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'a2',
          childProfileId: 'mem_3',
          childName: 'Zara',
          authorId: 'mem_4',
          authorName: 'Dadi',
          message: 'Keep it up, my star! 🌟',
          sticker: '🌟',
          createdAt: new Date(Date.now() - 7200000).toISOString()
        }
      ];
    }
    const response = await apiClient.get<ApiResponse<FeedbackDto[]>>(
      resolvePath(MasterApiReference.Feedback.FamilyFeedback, { familyId }),
      { params: { type: 1, page: 1, pageSize: 50 } },
    );
    return (response.data.data ?? []).map(mapFeedbackToAppreciation);
  },

  getCalendarEventTypes: async (): Promise<ElderEventTypeOption[]> => {
    if (AppConfig.isDemo) {
      return [
        { id: 'elder-event-birthday', label: 'Birthday', code: 'Birthday' },
        { id: 'elder-event-family', label: 'Family Event', code: 'FamilyTravel' },
      ];
    }

    return mapLookupItems(await getMasters('CalendarEventType'));
  },
};
