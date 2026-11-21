import apiClient from '../../../core/network/apiClient';
import { MasterApiReference, resolvePath } from '../../../core/api/MasterApiReference';
import type { ApiResponse, MasterDataItem } from '../../../core/network/apiTypes';
import { requireApiData } from '../../../core/network/apiTypes';
import { getMasters } from '../../../core/repositories/MasterDataRepository';

export interface AdminDashboardStats {
  totalFamilies: number;
  activeFamilies: number;
  monthlyRevenue: number;
  churnRate: number;
  newSignupsToday: number;
  revenueTrend: number; // percentage
}

/** Input for sendCampaign — what NotificationCampaignScreen sends. */
export interface NotificationCampaignInput {
  title: string;
  body: string;
  targetRole: string;
  scheduledFor: string;
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

export interface AdminAnalyticsOverview {
  totalUsers: number;
  totalChildren: number;
  totalTeachers: number;
  totalTasks: number;
  totalTaskCompletions: number;
  totalFeedbackEntries: number;
  totalNotifications: number;
}

export interface AdminActivityLog {
  id: string;
  dotColor: string;
  message: string;
  time: string;
}

export interface AdminSupportTicket {
  id: string;
  user: string;
  email: string;
  subject: string;
  status: 'open' | 'pending' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  lastMessage: string;
}

export interface AdminContentItem {
  id: string;
  type: 'onboarding' | 'tip' | 'faq';
  title: string;
  content: string;
  status: 'active' | 'draft';
}

// [VERIFY - candidate master data]
export const ADMIN_FAMILY_STATUS_OPTIONS: readonly string[] = ['All', 'Active', 'Trial', 'Churned', 'Flagged'];
// [VERIFY - candidate master data]
export const ADMIN_CAMPAIGN_ROLE_OPTIONS: readonly string[] = ['All', 'Parent', 'Child', 'Teacher', 'Elder'];
// [VERIFY - candidate master data]
export const ADMIN_CAMPAIGN_SCHEDULE_OPTIONS: readonly string[] = ['Immediate', 'In 1 Hour', 'Tomorrow'];

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
    const response = await apiClient.get<ApiResponse<AdminDashboardStats>>(MasterApiReference.Admin.Dashboard);
    return response.data.data as AdminDashboardStats;
  },

  getAnalyticsOverview: async (): Promise<AdminAnalyticsOverview> => {
    const response = await apiClient.get<ApiResponse<AdminAnalyticsOverview>>(MasterApiReference.Admin.Analytics);
    return requireApiData(response.data, 'AdminRepository.getAnalyticsOverview');
  },

  getActivityLogs: async (): Promise<AdminActivityLog[]> => {
    const dashboard = await AdminRepository.getDashboardStats();
    return [
      { id: 'live-signups', dotColor: 'bg-success', message: `${dashboard.newSignupsToday} new signups today`, time: 'Today' },
      { id: 'live-active', dotColor: 'bg-primary/60', message: `${dashboard.activeFamilies} active families`, time: 'Now' },
      { id: 'live-total', dotColor: 'bg-accent', message: `${dashboard.totalFamilies} total families`, time: 'Dashboard' },
    ];
  },

  getSupportTickets: async (): Promise<AdminSupportTicket[]> => {
    return [];
  },

  getContentItems: async (): Promise<AdminContentItem[]> => {
    return [];
  },

  getFamilies: async (params?: Record<string, string | number | boolean>): Promise<AdminFamily[]> => {
    const response = await apiClient.get<ApiResponse<AdminFamily[]>>(MasterApiReference.Admin.Families, { params });
    return response.data.data ?? [];
  },

  getPlans: async (): Promise<SubscriptionPlan[]> => {
    const response = await apiClient.get<ApiResponse<AdminPlanDto[]>>(MasterApiReference.Admin.Plans);
    return (response.data.data ?? []).map(mapPlanDto);
  },

  getTaskTemplates: async (): Promise<TaskTemplate[]> => {
    const response = await apiClient.get<ApiResponse<TaskTemplate[]>>(MasterApiReference.Admin.TaskTemplates);
    return response.data.data ?? [];
  },

  getFeatureFlags: async (): Promise<FeatureFlag[]> => {
    const response = await apiClient.get<ApiResponse<FeatureFlag[]>>(MasterApiReference.Admin.FeatureFlags);
    return response.data.data ?? [];
  },

  updateFeatureFlag: async (flagId: string, isEnabled: boolean): Promise<void> => {
    await apiClient.put<ApiResponse<null>>(
      resolvePath(MasterApiReference.Admin.FeatureFlag, { flagId }),
      { isEnabled },
    );
  },

  sendCampaign: async (data: NotificationCampaignInput): Promise<void> => {
    await apiClient.post<ApiResponse<null>>(MasterApiReference.Admin.NotificationCampaign, data);
  },

  getRewardCatalog: async (): Promise<RewardCatalogItem[]> => {
    const response = await apiClient.get<ApiResponse<RewardCatalogDto[]>>(MasterApiReference.Admin.RewardCatalog);
    return (response.data.data ?? []).map(mapRewardCatalogDto);
  },

  getPlanOptions: async (): Promise<AdminLookupOption[]> => {
    return mapLookupItems(await getMasters('Plan'));
  },
};
