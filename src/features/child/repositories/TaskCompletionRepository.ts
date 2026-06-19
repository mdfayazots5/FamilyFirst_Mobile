import apiClient from '../../../core/network/apiClient';
import { MasterApiReference, resolvePath } from '../../../core/api/MasterApiReference';
import { AppConfig } from '../../../core/config/appConfig';
import type { ApiResponse, MasterDataItem } from '../../../core/network/apiTypes';
import { getMasters } from '../../../core/repositories/MasterDataRepository';
import { TaskRepository, type TimeBlock } from '../../tasks/repositories/TaskRepository';

export type CompletionStatus = 'pending' | 'submitted' | 'approved' | 'flagged' | 'missed';

export interface TaskCompletion {
  id: string;
  taskId: string;
  taskName: string;
  childProfileId: string;
  status: CompletionStatus;
  photoUrl?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewNote?: string;
  timeBlock: string;
  coinValue: number;
}

export interface TaskStatusOption {
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
  ChildProfileId?: string;
  childProfileId?: string;
  Status?: number | string;
  status?: number | string;
  PhotoUrl?: string | null;
  photoUrl?: string | null;
  SubmittedAt?: string | null;
  submittedAt?: string | null;
  ReviewedAt?: string | null;
  reviewedAt?: string | null;
  ReviewNote?: string | null;
  reviewNote?: string | null;
  CoinsAwarded?: number;
  coinsAwarded?: number;
}

interface TaskCompletionUploadUrlDto {
  TaskId?: string;
  taskId?: string;
  UploadUrl?: string;
  uploadUrl?: string;
  ObjectKey?: string;
  objectKey?: string;
}

const mapCompletionStatus = (value: number | string | undefined): CompletionStatus => {
  if (typeof value === 'number') {
    switch (value) {
      case 3:
        return 'submitted';
      case 4:
        return 'approved';
      case 5:
        return 'flagged';
      case 6:
        return 'missed';
      default:
        return 'pending';
    }
  }

  switch ((value ?? '').toString().toLowerCase()) {
    case 'submittedforreview':
    case 'submitted':
      return 'submitted';
    case 'approved':
      return 'approved';
    case 'flagged':
      return 'flagged';
    case 'missed':
      return 'missed';
    default:
      return 'pending';
  }
};

const normalizeTimeBlock = (value: string | undefined): string => {
  const normalized = (value ?? '').toString().trim().toLowerCase();

  switch (normalized) {
    case 'school':
      return 'School';
    case 'evening':
      return 'Evening';
    case 'night':
      return 'Night';
    default:
      return 'Morning';
  }
};

const buildTaskDetailsMap = async (familyId: string, childId: string, date: string) => {
  const tasks = await TaskRepository.getTasks(familyId, childId, date);

  return new Map(
    tasks.map((task) => [
      task.id,
      {
        timeBlock: task.timeBlock,
        coinValue: task.coinValue,
      },
    ]),
  );
};

const mapTaskCompletionDto = (
  completion: TaskCompletionDto,
  taskDetails: Map<string, { timeBlock: TimeBlock; coinValue: number }>,
): TaskCompletion => {
  const taskId = completion.TaskId ?? completion.taskId ?? '';
  const taskMeta = taskDetails.get(taskId);

  return {
    id: completion.CompletionId ?? completion.completionId ?? '',
    taskId,
    taskName: completion.TaskName ?? completion.taskName ?? '',
    childProfileId: completion.ChildProfileId ?? completion.childProfileId ?? '',
    status: mapCompletionStatus(completion.Status ?? completion.status),
    photoUrl: completion.PhotoUrl ?? completion.photoUrl ?? undefined,
    submittedAt: completion.SubmittedAt ?? completion.submittedAt ?? undefined,
    reviewedAt: completion.ReviewedAt ?? completion.reviewedAt ?? undefined,
    reviewNote: completion.ReviewNote ?? completion.reviewNote ?? undefined,
    timeBlock: normalizeTimeBlock(taskMeta?.timeBlock),
    coinValue: completion.CoinsAwarded ?? completion.coinsAwarded ?? taskMeta?.coinValue ?? 0,
  };
};

export const TaskCompletionRepository = {
  getCompletions: async (familyId: string, childId: string, date: string): Promise<TaskCompletion[]> => {
    if (AppConfig.isDemo) {
      return [
        { id: 'c1', taskId: 't1', taskName: 'Take Bath', childProfileId: childId, status: 'approved', timeBlock: 'Morning', coinValue: 10 },
        { id: 'c2', taskId: 't2', taskName: 'Eat Breakfast', childProfileId: childId, status: 'approved', timeBlock: 'Morning', coinValue: 5 },
        { id: 'c3', taskId: 't3', taskName: 'Brush Teeth', childProfileId: childId, status: 'approved', timeBlock: 'Morning', coinValue: 5 },
        { id: 'c4', taskId: 't4', taskName: 'Math Homework', childProfileId: childId, status: 'submitted', timeBlock: 'Evening', coinValue: 30, photoUrl: 'https://picsum.photos/seed/math/400/300' },
        { id: 'c5', taskId: 't5', taskName: 'Read Book', childProfileId: childId, status: 'pending', timeBlock: 'Evening', coinValue: 20 },
        { id: 'c6', taskId: 't6', taskName: 'Clean Room', childProfileId: childId, status: 'pending', timeBlock: 'Night', coinValue: 50 },
        { id: 'c7', taskId: 't7', taskName: 'Revision', childProfileId: childId, status: 'pending', timeBlock: 'Night', coinValue: 20 },
      ];
    }
    const [response, taskDetails] = await Promise.all([
      apiClient.get<ApiResponse<TaskCompletionDto[]>>(
        resolvePath(MasterApiReference.Tasks.FamilyTaskCompletions, { familyId }),
        { params: { childId, date } },
      ),
      buildTaskDetailsMap(familyId, childId, date),
    ]);

    return (response.data.data ?? []).map((completion) => mapTaskCompletionDto(completion, taskDetails));
  },

  getUploadUrl: async (familyId: string, taskId: string): Promise<{ presignedUrl: string; s3Key: string }> => {
    if (AppConfig.isDemo) {
      return { presignedUrl: 'https://demo-upload.com', s3Key: `tasks/${taskId}/${Date.now()}` };
    }
    const response = await apiClient.post<ApiResponse<TaskCompletionUploadUrlDto>>(
      resolvePath(MasterApiReference.Tasks.UploadUrl, { familyId }),
      { TaskId: taskId },
    );
    return {
      presignedUrl: response.data.data?.UploadUrl ?? response.data.data?.uploadUrl ?? '',
      s3Key: response.data.data?.ObjectKey ?? response.data.data?.objectKey ?? '',
    };
  },

  submitCompletion: async (familyId: string, taskId: string, data: { scheduledDate: string; photoUrl?: string }): Promise<TaskCompletion> => {
    if (AppConfig.isDemo) {
      return {
        id: `comp_${Math.random().toString(36).substr(2, 9)}`,
        taskId,
        taskName: 'Demo Task',
        childProfileId: 'demo_child',
        status: 'submitted',
        timeBlock: 'Morning',
        coinValue: 10,
        submittedAt: new Date().toISOString(),
        ...data
      } as TaskCompletion;
    }
    const response = await apiClient.post<ApiResponse<TaskCompletionDto>>(
      resolvePath(MasterApiReference.Tasks.TaskCompletions, { familyId, taskId }),
      data,
    );
    const taskDetails = await buildTaskDetailsMap(familyId, '', data.scheduledDate);
    return mapTaskCompletionDto(response.data.data as TaskCompletionDto, taskDetails);
  },

  getVerificationQueue: async (familyId: string): Promise<TaskCompletion[]> => {
    if (AppConfig.isDemo) {
      return [
        { id: 'q1', taskId: 't4', taskName: 'Math Homework', childProfileId: 'mem_2', status: 'submitted', timeBlock: 'Evening', coinValue: 30, photoUrl: 'https://picsum.photos/seed/math/400/300', submittedAt: new Date().toISOString() },
        { id: 'q2', taskId: 't8', taskName: 'Clean Room', childProfileId: 'mem_2', status: 'submitted', timeBlock: 'Night', coinValue: 50, photoUrl: 'https://picsum.photos/seed/room/400/300', submittedAt: new Date().toISOString() },
        { id: 'q3', taskId: 't9', taskName: 'Science Project', childProfileId: 'mem_3', status: 'submitted', timeBlock: 'Evening', coinValue: 100, photoUrl: 'https://picsum.photos/seed/science/400/300', submittedAt: new Date().toISOString() },
      ];
    }
    const response = await apiClient.get<ApiResponse<TaskCompletionDto[]>>(
      resolvePath(MasterApiReference.Tasks.VerificationQueue, { familyId }),
    );
    const taskDetails = await buildTaskDetailsMap(familyId, '', new Date().toISOString().split('T')[0]);
    return (response.data.data ?? []).map((completion) => mapTaskCompletionDto(completion, taskDetails));
  },

  reviewCompletion: async (familyId: string, completionId: string, status: 'approved' | 'flagged', reviewNote?: string): Promise<void> => {
    if (AppConfig.isDemo) return;
    await apiClient.put<ApiResponse<null>>(
      resolvePath(MasterApiReference.Tasks.TaskCompletionReview, { familyId, completionId }),
      { status: status === 'approved' ? 4 : 5, reviewNote },
    );
  },

  approveAll: async (familyId: string): Promise<number> => {
    if (AppConfig.isDemo) return 3;
    const response = await apiClient.post<ApiResponse<{ approvedCount: number }>>(
      resolvePath(MasterApiReference.Tasks.ApproveAllVerificationQueue, { familyId }),
    );
    return response.data.data?.approvedCount ?? 0;
  },

  getTaskStatuses: async (): Promise<TaskStatusOption[]> => {
    return (await getMasters('TaskStatus')).map((item: MasterDataItem) => ({
      id: item.id,
      label: item.name,
      code: item.code,
    }));
  },
};
