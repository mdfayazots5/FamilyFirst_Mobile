import apiClient from '../../../core/network/apiClient';
import { MasterApiReference, resolvePath } from '../../../core/api/MasterApiReference';
import { AppConfig } from '../../../core/config/appConfig';
import type { ApiResponse, MasterDataItem } from '../../../core/network/apiTypes';
import { getMasters } from '../../../core/repositories/MasterDataRepository';

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

export interface RewardLookupOption {
  id: string;
  label: string;
  code: string;
}

interface RewardDto {
  RewardId?: string;
  rewardId?: string;
  RewardName?: string;
  rewardName?: string;
  Category?: string;
  category?: string;
  CoinCost?: number;
  coinCost?: number;
  IsEnabled?: boolean;
  isEnabled?: boolean;
  IconCode?: string;
  iconCode?: string;
  Description?: string | null;
  description?: string | null;
}

interface RedemptionDto {
  RedemptionId?: string;
  redemptionId?: string;
  RewardId?: string;
  rewardId?: string;
  RewardName?: string;
  rewardName?: string;
  ChildProfileId?: string;
  childProfileId?: string;
  ChildName?: string;
  childName?: string;
  Status?: number | string;
  status?: number | string;
  CoinsSpent?: number;
  coinsSpent?: number;
  RequestedAt?: string;
  requestedAt?: string;
  ParentNote?: string | null;
  parentNote?: string | null;
}

const mapRewardDto = (reward: RewardDto): Reward => ({
  id: reward.RewardId ?? reward.rewardId ?? '',
  name: reward.RewardName ?? reward.rewardName ?? '',
  category: reward.Category ?? reward.category ?? '',
  coinCost: reward.CoinCost ?? reward.coinCost ?? 0,
  isEnabled: reward.IsEnabled ?? reward.isEnabled ?? false,
  icon: reward.IconCode ?? reward.iconCode ?? '🎁',
  description: reward.Description ?? reward.description ?? undefined,
});

const mapRedemptionStatus = (status: number | string | undefined): Redemption['status'] => {
  if (typeof status === 'number') {
    switch (status) {
      case 2:
        return 'Approved';
      case 3:
        return 'Rejected';
      default:
        return 'Pending';
    }
  }

  switch ((status ?? '').toString().toLowerCase()) {
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    default:
      return 'Pending';
  }
};

const mapRedemptionDto = (redemption: RedemptionDto): Redemption => ({
  id: redemption.RedemptionId ?? redemption.redemptionId ?? '',
  rewardId: redemption.RewardId ?? redemption.rewardId ?? '',
  rewardName: redemption.RewardName ?? redemption.rewardName ?? '',
  childProfileId: redemption.ChildProfileId ?? redemption.childProfileId ?? '',
  childName: redemption.ChildName ?? redemption.childName ?? '',
  status: mapRedemptionStatus(redemption.Status ?? redemption.status),
  coinCost: redemption.CoinsSpent ?? redemption.coinsSpent ?? 0,
  requestedAt: redemption.RequestedAt ?? redemption.requestedAt ?? '',
  parentNote: redemption.ParentNote ?? redemption.parentNote ?? undefined,
});

const mapLookupItems = (items: MasterDataItem[]): RewardLookupOption[] =>
  items.map((item) => ({
    id: item.id,
    label: item.name,
    code: item.code,
  }));

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
    const response = await apiClient.get<ApiResponse<RewardDto[]>>(
      resolvePath(MasterApiReference.Rewards.FamilyRewards, { familyId }),
      { params: { enabled: enabledOnly } },
    );
    return (response.data.data ?? []).map(mapRewardDto);
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
    const response = await apiClient.get<ApiResponse<CoinTransaction[]>>(
      resolvePath(MasterApiReference.Rewards.CoinHistory, { childId }),
    );
    return response.data.data ?? [];
  },

  redeemReward: async (familyId: string, rewardId: string, childProfileId: string): Promise<Redemption> => {
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
    const response = await apiClient.post<ApiResponse<RedemptionDto>>(
      resolvePath(MasterApiReference.Rewards.Redeem, { familyId, rewardId }),
      { ChildProfileId: childProfileId },
    );
    return mapRedemptionDto(response.data.data as RedemptionDto);
  },

  getPendingRedemptions: async (familyId: string): Promise<Redemption[]> => {
    if (AppConfig.isDemo) {
      return [
        { id: 'red_1', rewardId: 'r2', rewardName: 'Movie Night', childProfileId: 'mem_2', childName: 'Arjun', status: 'Pending', coinCost: 200, requestedAt: new Date().toISOString() }
      ];
    }
    const response = await apiClient.get<ApiResponse<RedemptionDto[]>>(
      resolvePath(MasterApiReference.Rewards.Redemptions, { familyId }),
      { params: { status: 'Pending' } },
    );
    return (response.data.data ?? []).map(mapRedemptionDto);
  },

  reviewRedemption: async (familyId: string, redemptionId: string, status: 'Approved' | 'Rejected', parentNote?: string): Promise<Redemption> => {
    if (AppConfig.isDemo) {
      return { id: redemptionId, status, parentNote } as Redemption;
    }
    const response = await apiClient.put<ApiResponse<RedemptionDto>>(
      resolvePath(MasterApiReference.Rewards.Redemption, { familyId, redemptionId }),
      { Status: status === 'Approved' ? 2 : 3, ParentNote: parentNote },
    );
    return mapRedemptionDto(response.data.data as RedemptionDto);
  },

  createReward: async (familyId: string, data: Partial<Reward>): Promise<Reward> => {
    if (AppConfig.isDemo) return { id: 'r_new', ...data } as Reward;
    const response = await apiClient.post<ApiResponse<RewardDto>>(
      resolvePath(MasterApiReference.Rewards.FamilyRewards, { familyId }),
      {
        RewardName: data.name,
        Description: data.description ?? null,
        IconCode: data.icon ?? null,
        Category: data.category,
        CoinCost: data.coinCost,
      },
    );
    return mapRewardDto(response.data.data as RewardDto);
  },

  updateReward: async (familyId: string, rewardId: string, data: Partial<Reward>): Promise<Reward> => {
    if (AppConfig.isDemo) return { id: rewardId, ...data } as Reward;
    const response = await apiClient.put<ApiResponse<RewardDto>>(
      resolvePath(MasterApiReference.Rewards.FamilyReward, { familyId, rewardId }),
      {
        RewardName: data.name,
        Description: data.description ?? null,
        IconCode: data.icon ?? null,
        Category: data.category,
        CoinCost: data.coinCost,
        IsEnabled: data.isEnabled,
      },
    );
    return mapRewardDto(response.data.data as RewardDto);
  },

  getRewardTypes: async (): Promise<RewardLookupOption[]> => {
    if (AppConfig.isDemo) {
      return [
        { id: 'reward-screen-time', label: 'Screen Time', code: 'ScreenTime' },
        { id: 'reward-food-treat', label: 'Food Treat', code: 'FoodTreat' },
        { id: 'reward-outing', label: 'Outing', code: 'Outing' },
        { id: 'reward-purchase', label: 'Purchase', code: 'Purchase' },
        { id: 'reward-family-activity', label: 'Family Activity', code: 'FamilyActivity' },
      ];
    }

    return mapLookupItems(await getMasters('RewardType'));
  },

  getCoinTransactionTypes: async (): Promise<RewardLookupOption[]> => {
    if (AppConfig.isDemo) {
      return [
        { id: 'coin-earned', label: 'Earned', code: 'Earned' },
        { id: 'coin-spent', label: 'Spent', code: 'Spent' },
      ];
    }

    return mapLookupItems(await getMasters('CoinTransactionType'));
  },
};
