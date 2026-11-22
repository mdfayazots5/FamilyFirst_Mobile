import apiClient from '../../../core/network/apiClient';
import { MasterApiReference, resolvePath } from '../../../core/api/MasterApiReference';
import type { ApiResponse, MasterDataItem } from '../../../core/network/apiTypes';
import { getMasters } from '../../../core/repositories/MasterDataRepository';
import { toLocalIsoDate } from '../../../core/utils/format';
export type TimeBlock = 'Morning' | 'School' | 'Evening' | 'Night';
export type PillarTag = 'Study' | 'Cleanliness' | 'Discipline' | 'ScreenControl' | 'Responsibility';

// [VERIFY - candidate master data]
export const PILLAR_TAG_OPTIONS: readonly PillarTag[] = [
  'Study',
  'Cleanliness',
  'Discipline',
  'ScreenControl',
  'Responsibility',
];

export interface TaskItem {
  id: string;
  childProfileId: string;
  name: string;
  timeBlock: TimeBlock;
  duration: number; // in minutes
  coinValue: number;
  isPhotoRequired: boolean;
  pillarTag: PillarTag;
  isRecurring: boolean;
  recurringDays: number[]; // 1-7 (Mon-Sun)
  icon?: string;
  isCompleted?: boolean;
  instructions?: string;
  activeFromDate?: string;
}

export interface TaskTemplate {
  id: string;
  name: string;
  category: 'Study' | 'Morning' | 'Evening' | 'Chores' | 'Self-care';
  defaultDuration: number;
  defaultCoinValue: number;
  pillarTag: PillarTag;
  icon: string;
}

export interface TaskLookupOption {
  id: string;
  label: string;
  code: string;
}

interface TaskItemDto {
  TaskId?: string;
  taskId?: string;
  ChildProfileId?: string | null;
  childProfileId?: string | null;
  TaskName?: string;
  taskName?: string;
  Instructions?: string | null;
  instructions?: string | null;
  IconCode?: string | null;
  iconCode?: string | null;
  TimeBlock?: number | string;
  timeBlock?: number | string;
  DurationMinutes?: number;
  durationMinutes?: number;
  CoinValue?: number;
  coinValue?: number;
  IsPhotoRequired?: boolean;
  isPhotoRequired?: boolean;
  PillarTag?: string | null;
  pillarTag?: string | null;
  IsRecurring?: boolean;
  isRecurring?: boolean;
  RecurringDays?: number[];
  recurringDays?: number[];
  ActiveFromDate?: string;
  activeFromDate?: string;
}

interface TaskRequestDto {
  TaskName: string;
  ChildProfileId: string | null;
  Instructions: string | null;
  IconCode: string | null;
  TimeBlock: number;
  DurationMinutes: number;
  CoinValue: number;
  IsPhotoRequired: boolean;
  PillarTag: string | null;
  IsRecurring: boolean;
  RecurringDays: number[] | null;
  ActiveFromDate: string;
}

const TASK_TIME_BLOCK_TO_ENUM: Record<TimeBlock, number> = {
  Morning: 1,
  School: 2,
  Evening: 3,
  Night: 4,
};

const mapTimeBlock = (value: number | string | undefined): TimeBlock => {
  if (typeof value === 'number') {
    switch (value) {
      case 1:
        return 'Morning';
      case 2:
        return 'School';
      case 3:
        return 'Evening';
      case 4:
        return 'Night';
      default:
        return 'Morning';
    }
  }

  switch ((value ?? '').toString().toLowerCase()) {
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

const mapPillarTag = (value: string | null | undefined): PillarTag => {
  switch ((value ?? '').toString().toLowerCase()) {
    case 'study':
      return 'Study';
    case 'cleanliness':
      return 'Cleanliness';
    case 'screencontrol':
      return 'ScreenControl';
    case 'responsibility':
      return 'Responsibility';
    default:
      return 'Discipline';
  }
};

const normalizeRecurringDays = (days: number[] | undefined, isRecurring: boolean): number[] =>
  isRecurring ? (days ?? []).filter((day) => day >= 1 && day <= 7) : [];

const mapTaskDto = (task: TaskItemDto): TaskItem => {
  const isRecurring = task.IsRecurring ?? task.isRecurring ?? false;

  return {
    id: task.TaskId ?? task.taskId ?? '',
    childProfileId: task.ChildProfileId ?? task.childProfileId ?? '',
    name: task.TaskName ?? task.taskName ?? '',
    instructions: task.Instructions ?? task.instructions ?? undefined,
    icon: task.IconCode ?? task.iconCode ?? undefined,
    timeBlock: mapTimeBlock(task.TimeBlock ?? task.timeBlock),
    duration: task.DurationMinutes ?? task.durationMinutes ?? 15,
    coinValue: task.CoinValue ?? task.coinValue ?? 0,
    isPhotoRequired: task.IsPhotoRequired ?? task.isPhotoRequired ?? false,
    pillarTag: mapPillarTag(task.PillarTag ?? task.pillarTag),
    isRecurring,
    recurringDays: normalizeRecurringDays(task.RecurringDays ?? task.recurringDays, isRecurring),
    activeFromDate: task.ActiveFromDate ?? task.activeFromDate ?? undefined,
  };
};

const toTaskRequestDto = (data: Partial<TaskItem>): TaskRequestDto => {
  const isRecurring = data.isRecurring ?? true;
  const recurringDays = normalizeRecurringDays(data.recurringDays, isRecurring);

  return {
    TaskName: data.name?.trim() ?? '',
    ChildProfileId: data.childProfileId?.trim() ? data.childProfileId : null,
    Instructions: data.instructions?.trim() ? data.instructions.trim() : null,
    IconCode: data.icon?.trim() ? data.icon.trim() : null,
    TimeBlock: TASK_TIME_BLOCK_TO_ENUM[data.timeBlock ?? 'Morning'],
    DurationMinutes: data.duration ?? 15,
    CoinValue: data.coinValue ?? 5,
    IsPhotoRequired: data.isPhotoRequired ?? false,
    PillarTag: data.pillarTag ?? null,
    IsRecurring: isRecurring,
    RecurringDays: isRecurring ? recurringDays : null,
    ActiveFromDate: data.activeFromDate ?? toLocalIsoDate(),
  };
};

const mapLookupItems = (items: MasterDataItem[]): TaskLookupOption[] =>
  items.map((item) => ({
    id: item.id,
    label: item.name,
    code: item.code,
  }));

export const TaskRepository = {
  getTasks: async (familyId: string, childId: string, date?: string): Promise<TaskItem[]> => {
    const params: Record<string, string> = {
      date: date ?? toLocalIsoDate(),
    };

    if (childId.trim()) {
      params.childId = childId;
    }

    const response = await apiClient.get<ApiResponse<TaskItemDto[]>>(
      resolvePath(MasterApiReference.Tasks.FamilyTasks, { familyId }),
      { params },
    );
    return (response.data.data ?? []).map(mapTaskDto);
  },

  createTask: async (familyId: string, data: Partial<TaskItem>): Promise<TaskItem> => {
    const response = await apiClient.post<ApiResponse<TaskItemDto>>(
      resolvePath(MasterApiReference.Tasks.FamilyTasks, { familyId }),
      toTaskRequestDto(data),
    );
    return mapTaskDto(response.data.data as TaskItemDto);
  },

  updateTask: async (familyId: string, taskId: string, data: Partial<TaskItem>): Promise<TaskItem> => {
    const response = await apiClient.put<ApiResponse<TaskItemDto>>(
      resolvePath(MasterApiReference.Tasks.FamilyTask, { familyId, taskId }),
      toTaskRequestDto(data),
    );
    return mapTaskDto(response.data.data as TaskItemDto);
  },

  deleteTask: async (familyId: string, taskId: string): Promise<boolean> => {
    const response = await apiClient.delete<ApiResponse<boolean>>(
      resolvePath(MasterApiReference.Tasks.FamilyTask, { familyId, taskId }),
    );
    return response.data.data ?? false;
  },

  getTemplates: async (ageGroup: number): Promise<TaskTemplate[]> => {
    const response = await apiClient.get<ApiResponse<TaskTemplate[]>>(
      MasterApiReference.Admin.TaskTemplates,
      { params: { ageGroup } },
    );
    return response.data.data ?? [];
  },

  applyExamSeasonMode: async (familyId: string, childId: string): Promise<boolean> => {
    const response = await apiClient.post<ApiResponse<boolean>>(
      resolvePath(MasterApiReference.Tasks.ExamMode, { familyId }),
      { childId },
    );
    return response.data.data ?? false;
  },

  getTaskTypes: async (): Promise<TaskLookupOption[]> => {
    return mapLookupItems(await getMasters('TaskType'));
  },

  getTaskStatuses: async (): Promise<TaskLookupOption[]> => {
    return mapLookupItems(await getMasters('TaskStatus'));
  },
};
