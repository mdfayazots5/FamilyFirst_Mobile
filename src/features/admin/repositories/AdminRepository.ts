import apiClient from '../../../core/network/apiClient';
import { MasterApiReference, resolvePath } from '../../../core/api/MasterApiReference';
import type { ApiResponse } from '../../../core/network/apiTypes';
import { requireApiData } from '../../../core/network/apiTypes';
import type { PillarTag } from '../../tasks/repositories/TaskRepository';

export interface AdminDashboardStats {
  totalFamilies: number;
  activeFamilies: number;
  newSignupsToday: number;
}

/** Input for sendCampaign — what NotificationCampaignScreen sends. */
export interface NotificationCampaignInput {
  title: string;
  body: string;
  roles: string[];
  scheduledFor: string | null;
}

export interface AdminFamily {
  id: string;
  name: string;
  city: string;
  status: 'Active' | 'Flagged';
  memberCount: number;
  createdAt: string;
  lastActive: string;
}

export interface RewardCatalogItem {
  id: string;
  title: string;
  cost: number;
  category: string;
  icon: string;
  description?: string;
  isEnabled: boolean;
}


export interface CreateTaskTemplateInput {
  taskName: string;
  category: string;
  ageGroup?: string;
  instructions?: string;
  iconCode?: string;
  timeBlock: 1 | 3 | 4;
  durationMinutes: number;
  coinValue: number;
  isPhotoRequired: boolean;
  pillarTag?: PillarTag;
  isRecurring: boolean;
  recurringDays: number[];
  activeFromDate: string;
}

export interface TaskTemplate extends Omit<CreateTaskTemplateInput, 'ageGroup' | 'instructions' | 'iconCode' | 'pillarTag'> {
  templateId: string;
  ageGroup: string | null;
  instructions: string | null;
  iconCode: string | null;
  pillarTag: PillarTag | null;
}

export interface FeatureFlag {
  flagKey: string;
  flagValue: string;
  description: string | null;
  updatedAt: string;
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
export const ADMIN_FAMILY_STATUS_OPTIONS = ['All', 'Active', 'Flagged'] as const;
export type AdminFamilyFilter = typeof ADMIN_FAMILY_STATUS_OPTIONS[number];
// [VERIFY - candidate master data]
export const ADMIN_CAMPAIGN_ROLE_OPTIONS: readonly string[] = ['All', 'Parent', 'Child', 'Teacher', 'Elder'];
// [VERIFY - candidate master data]
export const ADMIN_CAMPAIGN_SCHEDULE_OPTIONS: readonly string[] = ['Immediate', 'In 1 Hour', 'Tomorrow'];

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
  IsEnabled?: boolean;
  isEnabled?: boolean;
}

/** GET /api/admin/families → ApiResponse<PaginatedList<AdminFamilySummaryDto>> */
interface AdminFamilySummaryDto {
  familyId: string;
  familyName: string;
  city?: string | null;
  isActive: boolean;          // false = family blocked by SuperAdmin
  memberCount: number;
  createdAt: string;
}

/** GET /api/admin/dashboard → ApiResponse<AdminDashboardDto> */
interface AdminDashboardDto {
  totalFamilies: number;
  activeFamilies: number;
  signupsToday: number;
}

interface AdminFamilyPage {
  items: AdminFamilySummaryDto[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface AdminFamilyDetail {
  familyName: string;
  city?: string | null;
  isActive: boolean;
  createdAt: string;
  members: {
    memberId: string;
    fullName: string;
    role: string;
    isActive: boolean;
    joinedAt: string;
  }[];
}

const mapFamilyDto = (dto: AdminFamilySummaryDto): AdminFamily => ({
  id: dto.familyId,
  name: dto.familyName ?? '',
  city: dto.city ?? '',
  status: dto.isActive ? 'Active' : 'Flagged',
  memberCount: dto.memberCount ?? 0,
  createdAt: dto.createdAt,
  // API exposes no last-activity timestamp [VERIFY]; createdAt is the only date available.
  lastActive: dto.createdAt,
});


const mapRewardCatalogDto = (reward: RewardCatalogDto): RewardCatalogItem => ({
  id: reward.RewardId ?? reward.rewardId ?? '',
  title: reward.RewardName ?? reward.rewardName ?? '',
  cost: reward.CoinCost ?? reward.coinCost ?? 0,
  category: reward.Category ?? reward.category ?? '',
  icon: reward.IconCode ?? reward.iconCode ?? '🎁',
  description: reward.Description ?? reward.description ?? undefined,
  isEnabled: reward.IsEnabled ?? reward.isEnabled ?? false,
});

export const AdminRepository = {
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    const response = await apiClient.get<ApiResponse<AdminDashboardDto>>(MasterApiReference.Admin.Dashboard);
    const dto = requireApiData(response.data, 'AdminRepository.getDashboardStats');
    return {
      totalFamilies: dto.totalFamilies ?? 0,
      activeFamilies: dto.activeFamilies ?? 0,
      newSignupsToday: dto.signupsToday ?? 0,
    };
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

  getFamilies: async (
    params: { query?: string; status?: Exclude<AdminFamilyFilter, 'All'>; page: number },
    signal?: AbortSignal,
  ) => {
    const response = await apiClient.get<ApiResponse<AdminFamilyPage>>(MasterApiReference.Admin.Families, { params, signal });
    const page = requireApiData(response.data, 'AdminRepository.getFamilies');
    return { ...page, items: page.items.map(mapFamilyDto) };
  },

  getFamilyDetail: async (familyId: string): Promise<AdminFamilyDetail> => {
    const response = await apiClient.get<ApiResponse<AdminFamilyDetail>>(
      resolvePath(MasterApiReference.Admin.FamilyDetail, { familyId }),
    );
    return requireApiData(response.data, 'AdminRepository.getFamilyDetail');
  },

  getTaskTemplates: async (): Promise<TaskTemplate[]> => {
    const response = await apiClient.get<ApiResponse<TaskTemplate[]>>(MasterApiReference.Admin.TaskTemplates);
    return requireApiData(response.data, 'AdminRepository.getTaskTemplates');
  },

  createTaskTemplate: async (template: CreateTaskTemplateInput): Promise<TaskTemplate> => {
    const response = await apiClient.post<ApiResponse<TaskTemplate>>(MasterApiReference.Admin.TaskTemplates, template);
    return requireApiData(response.data, 'AdminRepository.createTaskTemplate');
  },

  getFeatureFlags: async (): Promise<FeatureFlag[]> => {
    const response = await apiClient.get<ApiResponse<FeatureFlag[]>>(MasterApiReference.Admin.FeatureFlags);
    return requireApiData(response.data, 'AdminRepository.getFeatureFlags');
  },

  updateFeatureFlag: async (flagId: string, flagValue: string | boolean): Promise<FeatureFlag> => {
    const response = await apiClient.put<ApiResponse<FeatureFlag>>(
      resolvePath(MasterApiReference.Admin.FeatureFlag, { flagId: encodeURIComponent(flagId) }),
      { flagValue: String(flagValue) },
    );
    return requireApiData(response.data, 'AdminRepository.updateFeatureFlag');
  },

  sendCampaign: async (data: NotificationCampaignInput): Promise<{ recipientCount: number }> => {
    const response = await apiClient.post<ApiResponse<{ recipientCount: number }>>(MasterApiReference.Admin.NotificationCampaign, data);
    return requireApiData(response.data, 'AdminRepository.sendCampaign');
  },

  getRewardCatalog: async (): Promise<RewardCatalogItem[]> => {
    const response = await apiClient.get<ApiResponse<RewardCatalogDto[]>>(MasterApiReference.Admin.RewardCatalog);
    return requireApiData(response.data, 'AdminRepository.getRewardCatalog').map(mapRewardCatalogDto);
  },

  createCatalogReward: async (reward: { rewardName: string; coinCost: number; category: string; description?: string }) => {
    const response = await apiClient.post<ApiResponse<RewardCatalogDto>>(MasterApiReference.Admin.RewardCatalog, reward);
    return mapRewardCatalogDto(requireApiData(response.data, 'AdminRepository.createCatalogReward'));
  },

  updateCatalogReward: async (rewardId: string, reward: { rewardName: string; coinCost: number; isEnabled: boolean }) => {
    const response = await apiClient.put<ApiResponse<RewardCatalogDto>>(
      resolvePath(MasterApiReference.Admin.RewardCatalogItem, { rewardId }),
      reward,
    );
    return mapRewardCatalogDto(requireApiData(response.data, 'AdminRepository.updateCatalogReward'));
  },
};
