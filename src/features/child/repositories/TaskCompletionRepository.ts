import apiClient from '../../../core/network/apiClient';
import { MasterApiReference, resolvePath } from '../../../core/api/MasterApiReference';
import type { ApiResponse, MasterDataItem } from '../../../core/network/apiTypes';
import { getMasters } from '../../../core/repositories/MasterDataRepository';
import { TaskRepository, type TimeBlock } from '../../tasks/repositories/TaskRepository';
import { toLocalIsoDate } from '../../../core/utils/format';

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
    const response = await apiClient.post<ApiResponse<TaskCompletionUploadUrlDto>>(
      resolvePath(MasterApiReference.Tasks.UploadUrl, { familyId }),
      { TaskId: taskId },
    );
    return {
      presignedUrl: response.data.data?.UploadUrl ?? response.data.data?.uploadUrl ?? '',
      s3Key: response.data.data?.ObjectKey ?? response.data.data?.objectKey ?? '',
    };
  },

  /**
   * Uploads a task photo and returns the canonical S3 object URL to send as `photoUrl` (ProjectOverview §6).
   * Live: PUT to the presigned URL with the signed `Content-Type: image/jpeg`. This is the documented exception to
   * "all HTTP via apiClient": S3 must not receive the app's Bearer token or base URL. Rejects on any non-2xx status,
   * so a failed upload can never be submitted as a completed photo.
   */
  uploadPhoto: async (
    familyId: string,
    taskId: string,
    file: Blob,
    onProgress?: (progress: number) => void,
  ): Promise<string> => {
    const { presignedUrl } = await TaskCompletionRepository.getUploadUrl(familyId, taskId);
    if (!presignedUrl) {
      throw new Error('Upload URL was not issued.');
    }

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', presignedUrl);
      xhr.setRequestHeader('Content-Type', 'image/jpeg');
      xhr.timeout = 60_000;
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
      };
      xhr.onload = () => (xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Photo upload failed (HTTP ${xhr.status}).`)));
      xhr.onerror = () => reject(new Error('Photo upload failed (network).'));
      xhr.ontimeout = () => reject(new Error('Photo upload timed out.'));
      xhr.send(file);
    });

    onProgress?.(100);
    return presignedUrl.split('?')[0];
  },

  submitCompletion: async (familyId: string, taskId: string, data: { scheduledDate: string; photoUrl?: string }): Promise<TaskCompletion> => {
    const response = await apiClient.post<ApiResponse<TaskCompletionDto>>(
      resolvePath(MasterApiReference.Tasks.TaskCompletions, { familyId, taskId }),
      data,
    );
    const taskDetails = await buildTaskDetailsMap(familyId, '', data.scheduledDate);
    return mapTaskCompletionDto(response.data.data as TaskCompletionDto, taskDetails);
  },

  getVerificationQueue: async (familyId: string): Promise<TaskCompletion[]> => {
    const response = await apiClient.get<ApiResponse<TaskCompletionDto[]>>(
      resolvePath(MasterApiReference.Tasks.VerificationQueue, { familyId }),
    );
    const taskDetails = await buildTaskDetailsMap(familyId, '', toLocalIsoDate());
    return (response.data.data ?? []).map((completion) => mapTaskCompletionDto(completion, taskDetails));
  },

  reviewCompletion: async (familyId: string, completionId: string, status: 'approved' | 'flagged', reviewNote?: string): Promise<void> => {
    await apiClient.put<ApiResponse<null>>(
      resolvePath(MasterApiReference.Tasks.TaskCompletionReview, { familyId, completionId }),
      { status: status === 'approved' ? 4 : 5, reviewNote },
    );
  },

  approveAll: async (familyId: string): Promise<number> => {
    const response = await apiClient.post<ApiResponse<{ approvedCount: number }>>(
      resolvePath(MasterApiReference.Tasks.ApproveAllVerificationQueue, { familyId }),
    );
    return response.data.data?.approvedCount ?? 0;
  },

  getTaskStatuses: async (): Promise<TaskStatusOption[]> => {
    const items = await getMasters('TaskStatus');
    return items.map((item: MasterDataItem) => ({
      id: item.id,
      label: item.name,
      code: item.code,
    }));
  },
};
