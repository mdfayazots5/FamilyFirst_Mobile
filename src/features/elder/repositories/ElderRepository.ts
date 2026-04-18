import apiClient from '../../../core/network/apiClient';
import { AppConfig } from '../../../core/config/appConfig';

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

export const ElderRepository = {
  getGrandchildren: async (familyId: string): Promise<GrandchildStatus[]> => {
    if (AppConfig.isDemo) {
      return [
        { id: 'mem_2', name: 'Arjun', tasksCompleted: 8, totalTasks: 10, status: 'Doing Great' },
        { id: 'mem_3', name: 'Zara', tasksCompleted: 4, totalTasks: 8, status: 'Needs Help' }
      ];
    }
    const response = await apiClient.get(`/families/${familyId}/members/grandchildren`);
    return response.data;
  },

  sendAppreciation: async (familyId: string, data: Partial<Appreciation>): Promise<Appreciation> => {
    if (AppConfig.isDemo) {
      return {
        id: `appr_${Math.random()}`,
        createdAt: new Date().toISOString(),
        ...data
      } as Appreciation;
    }
    const response = await apiClient.post(`/families/${familyId}/feedback`, { ...data, type: 'Appreciation' });
    return response.data;
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
    const response = await apiClient.get(`/families/${familyId}/feedback`, { params: { type: 'Appreciation' } });
    return response.data;
  }
};
