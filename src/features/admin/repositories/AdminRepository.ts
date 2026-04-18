import apiClient from '../../../core/network/apiClient';
import { AppConfig } from '../../../core/config/appConfig';

export interface AdminDashboardStats {
  totalFamilies: number;
  activeFamilies: number;
  monthlyRevenue: number;
  churnRate: number;
  newSignupsToday: number;
  revenueTrend: number; // percentage
}

export interface AdminFamily {
  id: string;
  name: string;
  plan: string;
  status: 'Active' | 'Trial' | 'Churned' | 'Flagged';
  memberCount: number;
  createdAt: string;
  lastActive: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  maxChildren: number;
  features: string[];
}

export interface TaskTemplate {
  id: string;
  taskName: string;
  category: string;
  iconCode: string;
  coinValue: number;
  ageGroup: string;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
}

export const AdminRepository = {
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    if (AppConfig.isDemo) {
      return {
        totalFamilies: 47,
        activeFamilies: 38,
        monthlyRevenue: 8900,
        churnRate: 4,
        newSignupsToday: 3,
        revenueTrend: 12
      };
    }
    const response = await apiClient.get('/admin/dashboard');
    return response.data;
  },

  getFamilies: async (params?: any): Promise<AdminFamily[]> => {
    if (AppConfig.isDemo) {
      return [
        { id: 'f1', name: 'Sharma Family', plan: 'Premium', status: 'Active', memberCount: 5, createdAt: '2025-01-10', lastActive: '2026-04-11' },
        { id: 'f2', name: 'Verma Family', plan: 'Basic', status: 'Trial', memberCount: 3, createdAt: '2026-04-01', lastActive: '2026-04-10' },
        { id: 'f3', name: 'Iyer Family', plan: 'Premium', status: 'Active', memberCount: 6, createdAt: '2025-06-15', lastActive: '2026-04-11' },
        { id: 'f4', name: 'Kapoor Family', plan: 'Free', status: 'Churned', memberCount: 4, createdAt: '2024-12-20', lastActive: '2025-03-15' },
        { id: 'f5', name: 'Reddy Family', plan: 'Premium', status: 'Flagged', memberCount: 5, createdAt: '2025-11-05', lastActive: '2026-04-09' },
      ];
    }
    const response = await apiClient.get('/admin/families', { params });
    return response.data;
  },

  getPlans: async (): Promise<SubscriptionPlan[]> => {
    if (AppConfig.isDemo) {
      return [
        { id: 'p1', name: 'Free', price: 0, maxChildren: 1, features: ['Basic Tasks', '1 Child Profile'] },
        { id: 'p2', name: 'Basic', price: 199, maxChildren: 2, features: ['Unlimited Tasks', '2 Child Profiles', 'Rewards'] },
        { id: 'p3', name: 'Premium', price: 499, maxChildren: 5, features: ['Unlimited Everything', 'Elder App', 'Advanced Analytics'] },
        { id: 'p4', name: 'Family Plus', price: 999, maxChildren: 10, features: ['Multi-Family Support', 'Priority Support'] },
      ];
    }
    const response = await apiClient.get('/admin/plans');
    return response.data;
  },

  getTaskTemplates: async (): Promise<TaskTemplate[]> => {
    if (AppConfig.isDemo) {
      return Array.from({ length: 15 }).map((_, i) => ({
        id: `t${i}`,
        taskName: ['Brush Teeth', 'Read Book', 'Clean Room', 'Math Practice', 'Water Plants'][i % 5],
        category: ['Hygiene', 'Education', 'Chore', 'Education', 'Chore'][i % 5],
        iconCode: 'star',
        coinValue: (i + 1) * 5,
        ageGroup: i % 2 === 0 ? '5-8' : '9-12'
      }));
    }
    const response = await apiClient.get('/admin/task-templates');
    return response.data;
  },

  getFeatureFlags: async (): Promise<FeatureFlag[]> => {
    if (AppConfig.isDemo) {
      return [
        { id: 'f1', name: 'Maintenance Mode', description: 'Disable all user access for maintenance', isEnabled: false },
        { id: 'f2', name: 'New Reward Shop', description: 'Enable the redesigned reward catalog', isEnabled: true },
        { id: 'f3', name: 'Elder Voice Notes', description: 'Allow elders to record audio appreciations', isEnabled: true },
        { id: 'f4', name: 'AI Task Suggestions', description: 'Use Gemini to suggest tasks based on age', isEnabled: false },
        { id: 'f5', name: 'Global Leaderboard', description: 'Show family rankings globally', isEnabled: false },
        { id: 'f6', name: 'Dark Mode', description: 'Enable dark theme support', isEnabled: true },
        { id: 'f7', name: 'Push Notifications', description: 'Enable FCM push notifications', isEnabled: true },
        { id: 'f8', name: 'Trial Extension', description: 'Allow parents to request trial extensions', isEnabled: true },
      ];
    }
    const response = await apiClient.get('/admin/feature-flags');
    return response.data;
  },

  updateFeatureFlag: async (flagId: string, isEnabled: boolean): Promise<void> => {
    if (AppConfig.isDemo) return;
    await apiClient.put(`/admin/feature-flags/${flagId}`, { isEnabled });
  },

  sendCampaign: async (data: any): Promise<void> => {
    if (AppConfig.isDemo) return;
    await apiClient.post('/admin/notifications/campaign', data);
  }
};
