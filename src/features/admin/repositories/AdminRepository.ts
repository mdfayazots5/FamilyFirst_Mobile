import apiClient from '../../../core/network/apiClient';
import { MasterApiReference, resolvePath } from '../../../core/api/MasterApiReference';
import { AppConfig } from '../../../core/config/appConfig';
import type { ApiResponse, MasterDataItem } from '../../../core/network/apiTypes';
import { getMasters } from '../../../core/repositories/MasterDataRepository';

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

export interface RewardCatalogItem {
  id: string;
  title: string;
  cost: number;
  category: string;
  icon: string;
  description?: string;
}

export interface AdminLookupOption {
  id: string;
  label: string;
  code: string;
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

interface AdminPlanDto {
  PlanId?: number;
  planId?: number;
  PlanName?: string;
  planName?: string;
  PlanCode?: string;
  planCode?: string;
  PriceMonthly?: number;
  priceMonthly?: number;
  MaxChildren?: number;
  maxChildren?: number;
  MaxTeachers?: number;
  maxTeachers?: number;
  HasElderMode?: boolean;
  hasElderMode?: boolean;
  HasWeeklyDigest?: boolean;
  hasWeeklyDigest?: boolean;
  HasAdvancedReports?: boolean;
  hasAdvancedReports?: boolean;
  StorageQuotaMb?: number;
  storageQuotaMb?: number;
  TrialDays?: number;
  trialDays?: number;
  IsActive?: boolean;
  isActive?: boolean;
}

interface RewardCatalogDto {
  RewardId?: string;
  rewardId?: string;
  RewardName?: string;
  rewardName?: string;
  CoinCost?: number;
  coinCost?: number;
  Category?: string;
  category?: string;
  IconCode?: string;
  iconCode?: string;
  Description?: string | null;
  description?: string | null;
}

const mapLookupItems = (items: MasterDataItem[]): AdminLookupOption[] =>
  items.map((item) => ({
    id: item.id,
    label: item.name,
    code: item.code,
  }));

const mapPlanDto = (plan: AdminPlanDto): SubscriptionPlan => {
  const features = [
    (plan.HasElderMode ?? plan.hasElderMode) ? 'Elder Mode' : null,
    (plan.HasWeeklyDigest ?? plan.hasWeeklyDigest) ? 'Weekly Digest' : null,
    (plan.HasAdvancedReports ?? plan.hasAdvancedReports) ? 'Advanced Reports' : null,
    `${plan.MaxTeachers ?? plan.maxTeachers ?? 0} Teachers`,
    `${plan.StorageQuotaMb ?? plan.storageQuotaMb ?? 0} MB Storage`,
  ].filter(Boolean) as string[];

  return {
    id: String(plan.PlanId ?? plan.planId ?? ''),
    name: plan.PlanName ?? plan.planName ?? '',
    price: plan.PriceMonthly ?? plan.priceMonthly ?? 0,
    maxChildren: plan.MaxChildren ?? plan.maxChildren ?? 0,
    features,
  };
};

const mapRewardCatalogDto = (reward: RewardCatalogDto): RewardCatalogItem => ({
  id: reward.RewardId ?? reward.rewardId ?? '',
  title: reward.RewardName ?? reward.rewardName ?? '',
  cost: reward.CoinCost ?? reward.coinCost ?? 0,
  category: reward.Category ?? reward.category ?? '',
  icon: reward.IconCode ?? reward.iconCode ?? '🎁',
  description: reward.Description ?? reward.description ?? undefined,
});

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
    const response = await apiClient.get<ApiResponse<AdminDashboardStats>>(MasterApiReference.Admin.Dashboard);
    return response.data.data as AdminDashboardStats;
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
    const response = await apiClient.get<ApiResponse<AdminFamily[]>>(MasterApiReference.Admin.Families, { params });
    return response.data.data ?? [];
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
    const response = await apiClient.get<ApiResponse<AdminPlanDto[]>>(MasterApiReference.Admin.Plans);
    return (response.data.data ?? []).map(mapPlanDto);
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
    const response = await apiClient.get<ApiResponse<TaskTemplate[]>>(MasterApiReference.Admin.TaskTemplates);
    return response.data.data ?? [];
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
    const response = await apiClient.get<ApiResponse<FeatureFlag[]>>(MasterApiReference.Admin.FeatureFlags);
    return response.data.data ?? [];
  },

  updateFeatureFlag: async (flagId: string, isEnabled: boolean): Promise<void> => {
    if (AppConfig.isDemo) return;
    await apiClient.put<ApiResponse<null>>(
      resolvePath(MasterApiReference.Admin.FeatureFlag, { flagId }),
      { isEnabled },
    );
  },

  sendCampaign: async (data: any): Promise<void> => {
    if (AppConfig.isDemo) return;
    await apiClient.post<ApiResponse<null>>(MasterApiReference.Admin.NotificationCampaign, data);
  },

  getRewardCatalog: async (): Promise<RewardCatalogItem[]> => {
    if (AppConfig.isDemo) {
      return [
        { id: 'r1', title: 'Extra Screen Time', cost: 50, category: 'ScreenTime', icon: '📺' },
        { id: 'r2', title: 'Pizza Night', cost: 200, category: 'FoodTreat', icon: '🍕' },
        { id: 'r3', title: 'New Toy', cost: 500, category: 'Purchase', icon: '🧸' },
        { id: 'r4', title: 'Bedtime Extension', cost: 30, category: 'FamilyActivity', icon: '⏰' },
      ];
    }

    const response = await apiClient.get<ApiResponse<RewardCatalogDto[]>>(MasterApiReference.Admin.RewardCatalog);
    return (response.data.data ?? []).map(mapRewardCatalogDto);
  },

  getPlanOptions: async (): Promise<AdminLookupOption[]> => {
    if (AppConfig.isDemo) {
      return [
        { id: 'plan-free-trial', label: 'Free Trial', code: 'FreeTrial' },
        { id: 'plan-basic', label: 'Basic', code: 'Basic' },
        { id: 'plan-family', label: 'Family', code: 'Family' },
        { id: 'plan-premium', label: 'Premium', code: 'Premium' },
      ];
    }

    return mapLookupItems(await getMasters('Plan'));
  },
};
