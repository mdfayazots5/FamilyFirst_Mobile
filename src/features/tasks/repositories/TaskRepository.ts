import apiClient from '../../../core/network/apiClient';
import { AppConfig } from '../../../core/config/appConfig';

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
  recurringDays: number[]; // 0-6 (Sun-Sat)
  icon?: string;
  isCompleted?: boolean;
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

export const TaskRepository = {
  getTasks: async (familyId: string, childId: string): Promise<TaskItem[]> => {
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
          recurringDays: [1, 2, 3, 4, 5, 6, 0]
        }
      ];
    }
    const response = await apiClient.get(`/families/${familyId}/tasks`, { params: { childId } });
    return response.data;
  },

  createTask: async (familyId: string, data: Partial<TaskItem>): Promise<TaskItem> => {
    if (AppConfig.isDemo) {
      return { id: Math.random().toString(36).substr(2, 9), ...data } as TaskItem;
    }
    const response = await apiClient.post(`/families/${familyId}/tasks`, data);
    return response.data;
  },

  updateTask: async (familyId: string, taskId: string, data: Partial<TaskItem>): Promise<TaskItem> => {
    if (AppConfig.isDemo) {
      return { id: taskId, ...data } as TaskItem;
    }
    const response = await apiClient.put(`/families/${familyId}/tasks/${taskId}`, data);
    return response.data;
  },

  deleteTask: async (familyId: string, taskId: string): Promise<boolean> => {
    if (AppConfig.isDemo) return true;
    const response = await apiClient.delete(`/families/${familyId}/tasks/${taskId}`);
    return response.data;
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
    const response = await apiClient.get('/admin/task-templates', { params: { ageGroup } });
    return response.data;
  },

  applyExamSeasonMode: async (familyId: string, childId: string): Promise<boolean> => {
    if (AppConfig.isDemo) return true;
    const response = await apiClient.post(`/families/${familyId}/tasks/exam-mode`, { childId });
    return response.data;
  }
};
