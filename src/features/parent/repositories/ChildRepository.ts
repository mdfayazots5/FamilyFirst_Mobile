import apiClient from '../../../core/network/apiClient';
import { MasterApiReference, resolvePath } from '../../../core/api/MasterApiReference';
import type { ApiResponse, MasterDataItem } from '../../../core/network/apiTypes';
import { requireApiData } from '../../../core/network/apiTypes';
import { getMasters } from '../../../core/repositories/MasterDataRepository';
import { TaskRepository } from '../../tasks/repositories/TaskRepository';
import { FeedbackRepository } from '../../teacher/repositories/FeedbackRepository';

export interface TaskCompletion {
  id: string;
  title: string;
  status: 'done' | 'pending' | 'missed' | 'flagged';
  time: string;
  photoUrl?: string;
  category: string;
}

export interface ChildDetail {
  id: string;
  name: string;
  todayScore: number;
  streak: number;
  radarData: {
    subject: string;
    score: number;
    fullMark: number;
  }[];
}

interface ChildDetailDto {
  childProfileId: string;
  fullName: string;
  currentStreakDays: number;
  studyScore: number;
  cleanlinessScore: number;
  disciplineScore: number;
  screenControlScore: number;
  responsibilityScore: number;
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
    const response = await apiClient.get<ApiResponse<ChildDetailDto>>(
      resolvePath(MasterApiReference.Children.Detail, { familyId, childId }),
    );
    const child = requireApiData(response.data, 'Child detail');
    const radarData = [
      { subject: 'Study', score: child.studyScore, fullMark: 20 },
      { subject: 'Cleanliness', score: child.cleanlinessScore, fullMark: 20 },
      { subject: 'Discipline', score: child.disciplineScore, fullMark: 20 },
      { subject: 'Screen Control', score: child.screenControlScore, fullMark: 20 },
      { subject: 'Responsibility', score: child.responsibilityScore, fullMark: 20 },
    ];
    return {
      id: child.childProfileId,
      name: child.fullName,
      streak: child.currentStreakDays,
      todayScore: radarData.reduce((total, item) => total + item.score, 0),
      radarData,
    };
  },

  getTaskCompletions: async (familyId: string, childId: string): Promise<TaskCompletion[]> => {
    const now = new Date();
    const today = [now.getFullYear(), now.getMonth() + 1, now.getDate()]
      .map(part => String(part).padStart(2, '0')).join('-');
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

  getFeedback: (familyId: string, childId: string) => FeedbackRepository.getFeedbackInbox(familyId, childId),

  reviewTask: async (familyId: string, taskId: string, status: 'done' | 'flagged', note?: string): Promise<void> => {
    await apiClient.put<ApiResponse<null>>(
      resolvePath(MasterApiReference.Tasks.TaskCompletionReview, { familyId, completionId: taskId }),
      { status: status === 'done' ? 4 : 5, reviewNote: note },
    );
  },

  acknowledgeFeedback: async (feedbackId: string, responseText: string): Promise<void> => {
    await apiClient.post<ApiResponse<null>>(
      resolvePath(MasterApiReference.Feedback.Acknowledge, { feedbackId }),
      { ParentResponseText: responseText },
    );
  },

  deductCoins: async (childId: string, amount: number, note: string): Promise<void> => {
    await apiClient.post<ApiResponse<null>>(
      resolvePath(MasterApiReference.Children.CoinDeduction, { childId }),
      { amount, note },
    );
  },

  getTaskTypes: async (): Promise<ChildLookupOption[]> => {
    return mapLookupItems(await getMasters('TaskType'));
  },

  getTaskStatuses: async (): Promise<ChildLookupOption[]> => {
    return mapLookupItems(await getMasters('TaskStatus'));
  },
};
