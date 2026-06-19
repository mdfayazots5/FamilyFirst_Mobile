import apiClient from '../../../core/network/apiClient';
import { MasterApiReference, resolvePath } from '../../../core/api/MasterApiReference';
import { AppConfig } from '../../../core/config/appConfig';
import type { ApiResponse, MasterDataItem } from '../../../core/network/apiTypes';
import { getMasters } from '../../../core/repositories/MasterDataRepository';
import { TaskRepository } from '../../tasks/repositories/TaskRepository';

export interface TaskCompletion {
  id: string;
  title: string;
  status: 'done' | 'pending' | 'missed' | 'flagged';
  time: string;
  photoUrl?: string;
  category: string;
}

export interface Feedback {
  id: string;
  teacherName: string;
  type: 'Appreciation' | 'Complaint' | 'Observation';
  message: string;
  date: string;
  isRead: boolean;
}

export interface ChildDetail {
  id: string;
  name: string;
  avatarUrl: string;
  todayScore: number;
  streak: number;
  radarData: {
    subject: string;
    score: number;
    fullMark: number;
  }[];
}

export interface ChildLookupOption {
  id: string;
  label: string;
  code: string;
}

interface TaskCompletionDto {
  CompletionId?: string;
  completionId?: string;
  TaskId?: string;
  taskId?: string;
  TaskName?: string;
  taskName?: string;
  Status?: number | string;
  status?: number | string;
  PhotoUrl?: string | null;
  photoUrl?: string | null;
}

const mapLookupItems = (items: MasterDataItem[]): ChildLookupOption[] =>
  items.map((item) => ({
    id: item.id,
    label: item.name,
    code: item.code,
  }));

const mapTaskStatus = (value: number | string | undefined): TaskCompletion['status'] => {
  if (typeof value === 'number') {
    switch (value) {
      case 4:
        return 'done';
      case 5:
        return 'flagged';
      case 6:
        return 'missed';
      default:
        return 'pending';
    }
  }

  switch ((value ?? '').toString().toLowerCase()) {
    case 'approved':
      return 'done';
    case 'flagged':
      return 'flagged';
    case 'missed':
      return 'missed';
    default:
      return 'pending';
  }
};

export const ChildRepository = {
  getChildDetail: async (familyId: string, childId: string): Promise<ChildDetail> => {
    if (AppConfig.isDemo) {
      return {
        id: childId,
        name: 'Arjun',
        avatarUrl: 'avatar_01',
        todayScore: 82,
        streak: 8,
        radarData: [
          { subject: 'Study', score: 17, fullMark: 20 },
          { subject: 'Clean', score: 14, fullMark: 20 },
          { subject: 'Disc', score: 16, fullMark: 20 },
          { subject: 'Screen', score: 12, fullMark: 20 },
          { subject: 'Resp', score: 18, fullMark: 20 },
        ]
      };
    }
    const response = await apiClient.get<ApiResponse<ChildDetail>>(
      resolvePath(MasterApiReference.Children.Detail, { familyId, childId }),
    );
    return response.data.data as ChildDetail;
  },

  getTaskCompletions: async (familyId: string, childId: string): Promise<TaskCompletion[]> => {
    if (AppConfig.isDemo) {
      return [
        { id: '1', title: 'Morning Prayer', status: 'done', time: '06:30 AM', category: 'Spirituality' },
        { id: '2', title: 'Make Bed', status: 'done', time: '07:00 AM', category: 'Responsibility' },
        { id: '3', title: 'Brush Teeth', status: 'done', time: '07:15 AM', category: 'Hygiene' },
        { id: '4', title: 'School Homework', status: 'pending', time: '04:00 PM', category: 'Study', photoUrl: 'https://picsum.photos/seed/homework/400/300' },
        { id: '5', title: 'Reading 20 mins', status: 'pending', time: '05:00 PM', category: 'Study', photoUrl: 'https://picsum.photos/seed/reading/400/300' },
        { id: '6', title: 'Clean Room', status: 'missed', time: '08:00 PM', category: 'Cleanliness' },
      ];
    }
    const today = new Date().toISOString().split('T')[0];
    const [response, tasks] = await Promise.all([
      apiClient.get<ApiResponse<TaskCompletionDto[]>>(
        resolvePath(MasterApiReference.Tasks.FamilyTaskCompletions, { familyId }),
        { params: { childId, date: today } },
      ),
      TaskRepository.getTasks(familyId, childId, today),
    ]);
    const taskMap = new Map(tasks.map((task) => [task.id, task]));

    return (response.data.data ?? []).map((completion) => {
      const taskId = completion.TaskId ?? completion.taskId ?? '';
      const task = taskMap.get(taskId);

      return {
        id: completion.CompletionId ?? completion.completionId ?? '',
        title: completion.TaskName ?? completion.taskName ?? '',
        status: mapTaskStatus(completion.Status ?? completion.status),
        time: task?.timeBlock ?? 'Morning',
        photoUrl: completion.PhotoUrl ?? completion.photoUrl ?? undefined,
        category: task?.pillarTag ?? 'Discipline',
      };
    });
  },

  getFeedback: async (familyId: string, childId: string): Promise<Feedback[]> => {
    if (AppConfig.isDemo) {
      return [
        { id: '1', teacherName: 'Mr. Sharma', type: 'Appreciation', message: 'Arjun was very helpful in class today.', date: '2024-04-10', isRead: true },
        { id: '2', teacherName: 'Ms. Gupta', type: 'Complaint', message: 'Arjun missed his math assignment.', date: '2024-04-09', isRead: false },
        { id: '3', teacherName: 'Mr. Khan', type: 'Observation', message: 'Arjun seems a bit distracted lately.', date: '2024-04-08', isRead: true },
      ];
    }
    const response = await apiClient.get<ApiResponse<Feedback[]>>(
      resolvePath(MasterApiReference.Feedback.FamilyFeedback, { familyId }),
      { params: { childId, page: 1, pageSize: 20 } },
    );
    return response.data.data ?? [];
  },

  reviewTask: async (familyId: string, taskId: string, status: 'done' | 'flagged', note?: string): Promise<void> => {
    if (AppConfig.isDemo) return;
    await apiClient.put<ApiResponse<null>>(
      resolvePath(MasterApiReference.Tasks.TaskCompletionReview, { familyId, completionId: taskId }),
      { status: status === 'done' ? 4 : 5, reviewNote: note },
    );
  },

  acknowledgeFeedback: async (feedbackId: string, responseText: string): Promise<void> => {
    if (AppConfig.isDemo) return;
    await apiClient.post<ApiResponse<null>>(
      resolvePath(MasterApiReference.Feedback.Acknowledge, { feedbackId }),
      { ParentResponseText: responseText },
    );
  },

  deductCoins: async (childId: string, amount: number, note: string): Promise<void> => {
    if (AppConfig.isDemo) return;
    await apiClient.post<ApiResponse<null>>(
      resolvePath(MasterApiReference.Children.CoinDeduction, { childId }),
      { amount, note },
    );
  },

  getTaskTypes: async (): Promise<ChildLookupOption[]> => mapLookupItems(await getMasters('TaskType')),

  getTaskStatuses: async (): Promise<ChildLookupOption[]> => mapLookupItems(await getMasters('TaskStatus')),
};
