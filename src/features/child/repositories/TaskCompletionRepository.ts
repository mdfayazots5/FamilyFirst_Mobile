import apiClient from '../../../core/network/apiClient';
import { AppConfig } from '../../../core/config/appConfig';

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
    const response = await apiClient.get(`/families/${familyId}/tasks/completions`, { params: { childId, date } });
    return response.data;
  },

  getUploadUrl: async (fileName: string): Promise<{ presignedUrl: string; s3Key: string }> => {
    if (AppConfig.isDemo) {
      return { presignedUrl: 'https://demo-upload.com', s3Key: `tasks/${fileName}` };
    }
    const response = await apiClient.post('/tasks/completions/upload-url', { fileName });
    return response.data;
  },

  submitCompletion: async (taskId: string, data: { scheduledDate: string; photoUrl?: string }): Promise<TaskCompletion> => {
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
    const response = await apiClient.post(`/tasks/${taskId}/completions`, data);
    return response.data;
  },

  getVerificationQueue: async (familyId: string): Promise<TaskCompletion[]> => {
    if (AppConfig.isDemo) {
      return [
        { id: 'q1', taskId: 't4', taskName: 'Math Homework', childProfileId: 'mem_2', status: 'submitted', timeBlock: 'Evening', coinValue: 30, photoUrl: 'https://picsum.photos/seed/math/400/300', submittedAt: new Date().toISOString() },
        { id: 'q2', taskId: 't8', taskName: 'Clean Room', childProfileId: 'mem_2', status: 'submitted', timeBlock: 'Night', coinValue: 50, photoUrl: 'https://picsum.photos/seed/room/400/300', submittedAt: new Date().toISOString() },
        { id: 'q3', taskId: 't9', taskName: 'Science Project', childProfileId: 'mem_3', status: 'submitted', timeBlock: 'Evening', coinValue: 100, photoUrl: 'https://picsum.photos/seed/science/400/300', submittedAt: new Date().toISOString() },
      ];
    }
    const response = await apiClient.get(`/families/${familyId}/tasks/verification-queue`);
    return response.data;
  },

  reviewCompletion: async (completionId: string, status: 'approved' | 'flagged', reviewNote?: string): Promise<void> => {
    if (AppConfig.isDemo) return;
    await apiClient.put(`/tasks/completions/${completionId}/review`, { status, reviewNote });
  },

  approveAll: async (familyId: string): Promise<number> => {
    if (AppConfig.isDemo) return 3;
    const response = await apiClient.post(`/families/${familyId}/tasks/verification-queue/approve-all`);
    return response.data.approvedCount;
  }
};
