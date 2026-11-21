import apiClient from '../../../core/network/apiClient';
import { MasterApiReference, resolvePath } from '../../../core/api/MasterApiReference';
import type { ApiResponse } from '../../../core/network/apiTypes';

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
    const response = await apiClient.get<ApiResponse<FamilyGoal[]>>(
      resolvePath(MasterApiReference.Families.Goals, { familyId }),
    );
    return response.data.data ?? [];
  },

  createGoal: async (familyId: string, data: Partial<FamilyGoal>): Promise<FamilyGoal> => {
    const response = await apiClient.post<ApiResponse<FamilyGoal>>(
      resolvePath(MasterApiReference.Families.Goals, { familyId }),
      data,
    );
    return response.data.data as FamilyGoal;
  },

  updateGoal: async (familyId: string, goalId: string, data: Partial<FamilyGoal>): Promise<FamilyGoal> => {
    const response = await apiClient.put<ApiResponse<FamilyGoal>>(
      resolvePath(MasterApiReference.Families.Goal, { familyId, goalId }),
      data,
    );
    return response.data.data as FamilyGoal;
  }
};
