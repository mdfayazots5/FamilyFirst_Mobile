import apiClient from '../../../core/network/apiClient';
import { AppConfig } from '../../../core/config/appConfig';

export interface Reward {
  id: string;
  name: string;
  category: string;
  coinCost: number;
  isEnabled: boolean;
  icon: string;
  description?: string;
}

export interface Redemption {
  id: string;
  rewardId: string;
  rewardName: string;
  childProfileId: string;
  childName: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  coinCost: number;
  requestedAt: string;
  parentNote?: string;
}

export interface CoinTransaction {
  id: string;
  amount: number;
  type: 'Earned' | 'Spent';
  description: string;
  date: string;
}

export const RewardRepository = {
  getRewards: async (familyId: string, enabledOnly = true): Promise<Reward[]> => {
    if (AppConfig.isDemo) {
      return [
        { id: 'r1', name: '30min Screen Time', category: 'Entertainment', coinCost: 100, isEnabled: true, icon: '📱' },
        { id: 'r2', name: 'Movie Night', category: 'Family', coinCost: 200, isEnabled: true, icon: '🍿' },
        { id: 'r3', name: 'Choose Dinner', category: 'Food', coinCost: 150, isEnabled: true, icon: '🍕' },
        { id: 'r4', name: 'Gaming Session', category: 'Entertainment', coinCost: 120, isEnabled: true, icon: '🎮' },
        { id: 'r5', name: '₹50 Pocket Money', category: 'Money', coinCost: 300, isEnabled: true, icon: '💰' },
      ];
    }
    const response = await apiClient.get(`/families/${familyId}/rewards`, { params: { enabled: enabledOnly } });
    return response.data;
  },

  getCoinHistory: async (childId: string): Promise<CoinTransaction[]> => {
    if (AppConfig.isDemo) {
      return [
        { id: 't1', amount: 30, type: 'Earned', description: 'Math Homework Approved', date: new Date().toISOString() },
        { id: 't2', amount: 10, type: 'Earned', description: 'Take Bath Approved', date: new Date().toISOString() },
        { id: 't3', amount: 100, type: 'Spent', description: 'Redeemed 30min Screen Time', date: new Date(Date.now() - 86400000).toISOString() },
        { id: 't4', amount: 15, type: 'Earned', description: 'Daily Streak Bonus', date: new Date(Date.now() - 86400000).toISOString() },
      ];
    }
    const response = await apiClient.get(`/children/${childId}/coin-history`);
    return response.data;
  },

  redeemReward: async (rewardId: string, childProfileId: string): Promise<Redemption> => {
    if (AppConfig.isDemo) {
      return {
        id: `red_${Math.random().toString(36).substr(2, 9)}`,
        rewardId,
        rewardName: 'Demo Reward',
        childProfileId,
        childName: 'Arjun',
        status: 'Pending',
        coinCost: 100,
        requestedAt: new Date().toISOString()
      };
    }
    const response = await apiClient.post(`/rewards/${rewardId}/redeem`, { childProfileId });
    return response.data;
  },

  getPendingRedemptions: async (familyId: string): Promise<Redemption[]> => {
    if (AppConfig.isDemo) {
      return [
        { id: 'red_1', rewardId: 'r2', rewardName: 'Movie Night', childProfileId: 'mem_2', childName: 'Arjun', status: 'Pending', coinCost: 200, requestedAt: new Date().toISOString() }
      ];
    }
    const response = await apiClient.get(`/families/${familyId}/rewards/redemptions`, { params: { status: 'Pending' } });
    return response.data;
  },

  reviewRedemption: async (redemptionId: string, status: 'Approved' | 'Rejected', parentNote?: string): Promise<Redemption> => {
    if (AppConfig.isDemo) {
      return { id: redemptionId, status, parentNote } as Redemption;
    }
    const response = await apiClient.put(`/rewards/redemptions/${redemptionId}`, { status, parentNote });
    return response.data;
  },

  createReward: async (familyId: string, data: Partial<Reward>): Promise<Reward> => {
    if (AppConfig.isDemo) return { id: 'r_new', ...data } as Reward;
    const response = await apiClient.post(`/families/${familyId}/rewards`, data);
    return response.data;
  },

  updateReward: async (familyId: string, rewardId: string, data: Partial<Reward>): Promise<Reward> => {
    if (AppConfig.isDemo) return { id: rewardId, ...data } as Reward;
    const response = await apiClient.put(`/families/${familyId}/rewards/${rewardId}`, data);
    return response.data;
  }
};
