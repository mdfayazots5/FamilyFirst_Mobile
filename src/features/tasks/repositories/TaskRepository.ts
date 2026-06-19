import apiClient from '../../../core/network/apiClient';
import { MasterApiReference, resolvePath } from '../../../core/api/MasterApiReference';
import { AppConfig } from '../../../core/config/appConfig';
import type { ApiResponse, MasterDataItem } from '../../../core/network/apiTypes';
import { getMasters } from '../../../core/repositories/MasterDataRepository';

export type TimeBlock = 'Morning' | 'School' | 'Evening' | 'Night';
export type PillarTag = 'Study' | 'Cleanliness' | 'Discipline' | 'ScreenControl' | 'Responsibility';

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
    ActiveFromDate: data.activeFromDate ?? new Date().toISOString().split('T')[0],
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
    if (AppConfig.isDemo) {
      return [
        {
          id: 't1',
          childProfileId: childId,
          name: 'Take Bath',
          timeBlock: 'Morning',
          duration: 10,
          coinValue: 10,
          isPhotoRequired: false,
          pillarTag: 'Cleanliness',
          isRecurring: true,
          recurringDays: [1, 2, 3, 4, 5]
        },
        {
          id: 't2',
          childProfileId: childId,
          name: 'Eat Breakfast',
          timeBlock: 'Morning',
          duration: 15,
          coinValue: 5,
          isPhotoRequired: true,
          pillarTag: 'Responsibility',
          isRecurring: true,
          recurringDays: [1, 2, 3, 4, 5]
        },
        {
          id: 't3',
          childProfileId: childId,
          name: 'Math Homework',
          timeBlock: 'Evening',
          duration: 45,
          coinValue: 30,
          isPhotoRequired: true,
          pillarTag: 'Study',
          isRecurring: true,
          recurringDays: [1, 2, 3, 4, 5]
        },
        {
          id: 't4',
          childProfileId: childId,
          name: 'Read Book',
          timeBlock: 'Night',
          duration: 20,
          coinValue: 20,
          isPhotoRequired: false,
          pillarTag: 'Discipline',
          isRecurring: true,
          recurringDays: [1, 2, 3, 4, 5, 6, 7]
        }
      ];
    }
    const params: Record<string, string> = {
      date: date ?? new Date().toISOString().split('T')[0],
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
    if (AppConfig.isDemo) {
      return { id: Math.random().toString(36).substr(2, 9), ...data } as TaskItem;
    }
    const response = await apiClient.post<ApiResponse<TaskItemDto>>(
      resolvePath(MasterApiReference.Tasks.FamilyTasks, { familyId }),
      toTaskRequestDto(data),
    );
    return mapTaskDto(response.data.data as TaskItemDto);
  },

  updateTask: async (familyId: string, taskId: string, data: Partial<TaskItem>): Promise<TaskItem> => {
    if (AppConfig.isDemo) {
      return { id: taskId, ...data } as TaskItem;
    }
    const response = await apiClient.put<ApiResponse<TaskItemDto>>(
      resolvePath(MasterApiReference.Tasks.FamilyTask, { familyId, taskId }),
      toTaskRequestDto(data),
    );
    return mapTaskDto(response.data.data as TaskItemDto);
  },

  deleteTask: async (familyId: string, taskId: string): Promise<boolean> => {
    if (AppConfig.isDemo) return true;
    const response = await apiClient.delete<ApiResponse<boolean>>(
      resolvePath(MasterApiReference.Tasks.FamilyTask, { familyId, taskId }),
    );
    return response.data.data ?? false;
  },

  getTemplates: async (ageGroup: number): Promise<TaskTemplate[]> => {
    if (AppConfig.isDemo) {
      return [
        { id: 'tmp1', name: 'Brush Teeth', category: 'Morning', defaultDuration: 5, defaultCoinValue: 5, pillarTag: 'Cleanliness', icon: '🪥' },
        { id: 'tmp2', name: 'Make Bed', category: 'Morning', defaultDuration: 5, defaultCoinValue: 10, pillarTag: 'Discipline', icon: '🛏️' },
        { id: 'tmp3', name: 'Pack School Bag', category: 'Morning', defaultDuration: 10, defaultCoinValue: 15, pillarTag: 'Responsibility', icon: '🎒' },
        { id: 'tmp4', name: 'Math Practice', category: 'Study', defaultDuration: 30, defaultCoinValue: 25, pillarTag: 'Study', icon: '🔢' },
        { id: 'tmp5', name: 'Science Reading', category: 'Study', defaultDuration: 20, defaultCoinValue: 20, pillarTag: 'Study', icon: '🧪' },
        { id: 'tmp6', name: 'Clean Room', category: 'Chores', defaultDuration: 20, defaultCoinValue: 50, pillarTag: 'Cleanliness', icon: '🧹' },
        { id: 'tmp7', name: 'Water Plants', category: 'Chores', defaultDuration: 10, defaultCoinValue: 10, pillarTag: 'Responsibility', icon: '🪴' },
        { id: 'tmp8', name: 'No Screen Time', category: 'Self-care', defaultDuration: 60, defaultCoinValue: 40, pillarTag: 'ScreenControl', icon: '📵' },
        { id: 'tmp9', name: 'Meditation', category: 'Self-care', defaultDuration: 10, defaultCoinValue: 15, pillarTag: 'Discipline', icon: '🧘' },
        { id: 'tmp10', name: 'Journaling', category: 'Self-care', defaultDuration: 15, defaultCoinValue: 20, pillarTag: 'Discipline', icon: '📓' },
      ];
    }
    const response = await apiClient.get<ApiResponse<TaskTemplate[]>>(
      MasterApiReference.Admin.TaskTemplates,
      { params: { ageGroup } },
    );
    return response.data.data ?? [];
  },

  applyExamSeasonMode: async (familyId: string, childId: string): Promise<boolean> => {
    if (AppConfig.isDemo) return true;
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
