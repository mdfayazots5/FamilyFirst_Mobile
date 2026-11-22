import apiClient from '../../../core/network/apiClient';
import { MasterApiReference, resolvePath } from '../../../core/api/MasterApiReference';
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

/** API CoinTransactionDto (camelCase JSON). */
interface CoinTransactionDto {
  transactionId: string;
  transactionType: string;
  amount: number;
  referenceType?: string | null;
  note?: string | null;
  createdAt: string;
}

// API types: Earned (in), Spent (reward redemption), Deducted (manual parent deduction).
const isCoinOutflow = (type: string | undefined): boolean =>
  ['spent', 'deducted'].includes((type ?? '').toLowerCase());

const mapCoinTransactionDto = (dto: CoinTransactionDto): CoinTransaction => ({
  id: dto.transactionId,
  amount: Math.abs(dto.amount),
  type: isCoinOutflow(dto.transactionType) ? 'Spent' : 'Earned',
  description: dto.note || dto.referenceType || (isCoinOutflow(dto.transactionType) ? 'Coins spent' : 'Coins earned'),
  date: dto.createdAt,
});

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
    const response = await apiClient.get<ApiResponse<RewardDto[]>>(
      resolvePath(MasterApiReference.Rewards.FamilyRewards, { familyId }),
      { params: { enabled: enabledOnly } },
    );
    return (response.data.data ?? []).map(mapRewardDto);
  },

  /**
   * GET /api/children/{childId}/coin-history → ApiResponse<PaginatedList<CoinTransactionDto>> (Drift Entry 088).
   * Reads data.items and maps the API fields (transactionId, transactionType, note, createdAt).
   */
  getCoinHistory: async (childId: string): Promise<CoinTransaction[]> => {
    const response = await apiClient.get<ApiResponse<{ items?: CoinTransactionDto[] }>>(
      resolvePath(MasterApiReference.Rewards.CoinHistory, { childId }),
      { params: { pageNumber: 1, pageSize: 100 } },
    );
    return (response.data.data?.items ?? []).map(mapCoinTransactionDto);
  },

  redeemReward: async (familyId: string, rewardId: string, childProfileId: string): Promise<Redemption> => {
    const response = await apiClient.post<ApiResponse<RedemptionDto>>(
      resolvePath(MasterApiReference.Rewards.Redeem, { familyId, rewardId }),
      { ChildProfileId: childProfileId },
    );
    return mapRedemptionDto(response.data.data as RedemptionDto);
  },

  getPendingRedemptions: async (familyId: string): Promise<Redemption[]> => {
    const response = await apiClient.get<ApiResponse<RedemptionDto[]>>(
      resolvePath(MasterApiReference.Rewards.Redemptions, { familyId }),
      { params: { status: 'Pending' } },
    );
    return (response.data.data ?? []).map(mapRedemptionDto);
  },

  reviewRedemption: async (familyId: string, redemptionId: string, status: 'Approved' | 'Rejected', parentNote?: string): Promise<Redemption> => {
    const response = await apiClient.put<ApiResponse<RedemptionDto>>(
      resolvePath(MasterApiReference.Rewards.Redemption, { familyId, redemptionId }),
      { Status: status === 'Approved' ? 2 : 3, ParentNote: parentNote },
    );
    return mapRedemptionDto(response.data.data as RedemptionDto);
  },

  createReward: async (familyId: string, data: Partial<Reward>): Promise<Reward> => {
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
    return mapLookupItems(await getMasters('RewardType'));
  },

  getCoinTransactionTypes: async (): Promise<RewardLookupOption[]> => {
    return mapLookupItems(await getMasters('CoinTransactionType'));
  },
};
