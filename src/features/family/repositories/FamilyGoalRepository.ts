import apiClient from '../../../core/network/apiClient';
import { AppConfig } from '../../../core/config/appConfig';

export interface FamilyGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  reward: string;
  status: 'Active' | 'Completed' | 'Failed';
}

export const FamilyGoalRepository = {
  getGoals: async (familyId: string): Promise<FamilyGoal[]> => {
    if (AppConfig.isDemo) {
      return [
        {
          id: 'g1',
          title: 'Water Park Trip',
          description: 'Reach 1000 total family coins this month!',
          targetValue: 1000,
          currentValue: 680,
          unit: 'Coins',
          deadline: new Date(Date.now() + 86400000 * 4).toISOString(),
          reward: 'Full day at the Water Park!',
          status: 'Active'
        },
        {
          id: 'g2',
          title: 'Pizza Night',
          description: 'Everyone completes all tasks for 3 days in a row.',
          targetValue: 3,
          currentValue: 2,
          unit: 'Days',
          deadline: new Date(Date.now() + 86400000 * 2).toISOString(),
          reward: 'Unlimited Pizza & Movie!',
          status: 'Active'
        }
      ];
    }
    const response = await apiClient.get(`/families/${familyId}/goals`);
    return response.data;
  },

  createGoal: async (familyId: string, data: Partial<FamilyGoal>): Promise<FamilyGoal> => {
    if (AppConfig.isDemo) return { id: `g_${Math.random()}`, status: 'Active', ...data } as FamilyGoal;
    const response = await apiClient.post(`/families/${familyId}/goals`, data);
    return response.data;
  },

  updateGoal: async (familyId: string, goalId: string, data: Partial<FamilyGoal>): Promise<FamilyGoal> => {
    if (AppConfig.isDemo) return { id: goalId, ...data } as FamilyGoal;
    const response = await apiClient.put(`/families/${familyId}/goals/${goalId}`, data);
    return response.data;
  }
};
