import apiClient from '../../../core/network/apiClient';
import { MasterApiReference, resolvePath } from '../../../core/api/MasterApiReference';
import type { ApiResponse } from '../../../core/network/apiTypes';
import { requireApiData } from '../../../core/network/apiTypes';
import type { MasterDataItem } from '../../../core/network/apiTypes';
import { getMasters } from '../../../core/repositories/MasterDataRepository';
export interface FinanceLookupOption {
  id: string;
  label: string;
  code: string;
}

const mapLookupItems = (items: MasterDataItem[]): FinanceLookupOption[] =>
  items.map((item) => ({ id: item.id, label: item.name, code: item.code }));

/**
 * Presentation-only emoji per FinanceCategory code. Category names come from GetMasters('FinanceCategory');
 * this map only decorates them (unknown codes fall back to FINANCE_DEFAULT_ICON).
 */
export const FINANCE_CATEGORY_ICONS: Readonly<Record<string, string>> = {
  GroceriesKirana: '🛒', FoodDining: '🍔', Utilities: '💡', MobileRecharge: '📱',
  EducationSchool: '📚', MedicalHealth: '🏥', TravelTransport: '🚗', Shopping: '🛍',
  InsuranceLIC: '🛡', LoanEmi: '🏦', DomesticHelp: '🏠', Entertainment: '🎬',
  DonationsReligion: '🙏', ChitFundInvestment: '📈',
};
export const FINANCE_DEFAULT_ICON = '💸';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface FamilyHealthScore {
  totalSpendMtd: number;
  totalIncomeMtd: number;
  netSavingsMtd: number;
  savingsRatePct: number;
  healthStatus: 'Green' | 'Amber' | 'Red';
}

export interface MemberSpendCard {
  memberId: string;
  memberName: string;
  photoUrl?: string;
  privacyTier: 1 | 2 | 3;
  todaySpend?: number;
  monthSpend?: number;
  monthTotal?: number;
  isAboveThreshold: boolean;
}

export interface FinanceTransaction {
  transactionId: string;
  memberId: string;
  memberName: string;
  merchantName?: string;       // null for Tier 2/3
  merchantNameHash?: string;
  amount: number;
  transactionType: 'Debit' | 'Credit';
  category: string;
  isCategoryBlurred: boolean;
  privacyTier: number;
  questionStatus: string;
  parsedAt: string;
}

export interface FinanceAlert {
  alertType: string;
  message: string;
  severity: 'Info' | 'Warning' | 'Critical';
  relatedTransactionId?: string;
  relatedCommitmentId?: string;
}

export interface Commitment {
  commitmentId: string;
  memberId: string;
  memberName: string;
  commitmentName: string;
  commitmentType: string;
  amount: number;
  frequencyType: string;
  nextDueDate: string;
  status: 'Upcoming' | 'Paid' | 'Missed' | 'PendingConfirmation';
  isConfirmed: boolean;
}

export interface FinanceDashboard {
  healthScore: FamilyHealthScore;
  memberCards: MemberSpendCard[];
  todaysTransactions: FinanceTransaction[];
  alerts: FinanceAlert[];
  upcomingCommitments: Commitment[];
}

export interface BudgetItem {
  category: string;
  budgetAmount: number;
  actualSpend: number;
  remaining: number;
  utilisationPct?: number;
  status: 'Green' | 'Amber' | 'Red';
}

export interface CategorySpend {
  category: string;
  totalSpend: number;
  transactionCount: number;
  pctOfTotalSpend: number;
  topMerchant?: string;
}

export interface MemberFinanceSetting {
  memberId: string;
  memberName: string;
  privacyTier: number;
  consentStatus: string;
  consentGivenAt?: string;
  optedOutAt?: string;
}

export interface FinanceSettings {
  cfoMemberId?: string;
  cfoMemberName?: string;
  isModuleEnabled: boolean;
  memberSettings: MemberFinanceSetting[];
}

// ── Repository ────────────────────────────────────────────────────────────────

export const FinanceRepository = {
  getFinanceCategories: async (): Promise<FinanceLookupOption[]> => {
    return mapLookupItems(await getMasters('FinanceCategory'));
  },

  getDashboard: async (familyId: string): Promise<FinanceDashboard> => {
    const r = await apiClient.get<ApiResponse<FinanceDashboard>>(
      resolvePath(MasterApiReference.Finance.Dashboard, { familyId }),
    );
    return requireApiData(r.data, 'FinanceRepository.getDashboard');
  },

  listTransactions: async (
    familyId: string,
    params?: { memberId?: string; category?: string; fromDate?: string; toDate?: string; page?: number; pageSize?: number },
  ): Promise<{ items: FinanceTransaction[]; totalCount: number }> => {
    const r = await apiClient.get<ApiResponse<{ items: FinanceTransaction[]; totalCount: number }>>(
      resolvePath(MasterApiReference.Finance.Transactions, { familyId }),
      { params },
    );
    return { items: r.data.data?.items ?? [], totalCount: r.data.data?.totalCount ?? 0 };
  },

  questionTransaction: async (
    familyId: string, transactionId: string,
    data: { questionType: string; contextNote?: string },
  ): Promise<void> => {
    await apiClient.post<ApiResponse<null>>(
      resolvePath(MasterApiReference.Finance.TransactionQuestion, { familyId, transactionId }),
      data,
    );
  },

  getBudgets: async (familyId: string): Promise<BudgetItem[]> => {
    const r = await apiClient.get<ApiResponse<BudgetItem[]>>(
      resolvePath(MasterApiReference.Finance.Budget, { familyId }),
    );
    return r.data.data ?? [];
  },

  setBudget: async (familyId: string, data: { category: string; budgetAmount: number }): Promise<void> => {
    await apiClient.put<ApiResponse<null>>(
      resolvePath(MasterApiReference.Finance.Budget, { familyId }),
      data,
    );
  },

  getCategoryBreakdown: async (familyId: string, fromDate?: string, toDate?: string): Promise<CategorySpend[]> => {
    const r = await apiClient.get<ApiResponse<CategorySpend[]>>(
      resolvePath(MasterApiReference.Finance.Categories, { familyId }),
      { params: { fromDate, toDate } },
    );
    return r.data.data ?? [];
  },

  listCommitments: async (familyId: string): Promise<Commitment[]> => {
    const r = await apiClient.get<ApiResponse<Commitment[]>>(
      resolvePath(MasterApiReference.Finance.Commitments, { familyId }),
    );
    return r.data.data ?? [];
  },

  inviteConsent: async (familyId: string, data: { memberId: string; privacyTier: number }): Promise<void> => {
    await apiClient.post<ApiResponse<null>>(
      resolvePath(MasterApiReference.Finance.ConsentInvite, { familyId }),
      data,
    );
  },

  revokeConsent: async (familyId: string, memberId: string): Promise<void> => {
    await apiClient.delete<ApiResponse<null>>(
      resolvePath(MasterApiReference.Finance.ConsentMember, { familyId, memberId }),
    );
  },

  getSettings: async (familyId: string): Promise<FinanceSettings> => {
    const r = await apiClient.get<ApiResponse<FinanceSettings>>(
      resolvePath(MasterApiReference.Finance.Settings, { familyId }),
    );
    return requireApiData(r.data, 'FinanceRepository.getSettings');
  },

  updateSettings: async (
    familyId: string,
    data: { cfoMemberId?: string; memberTierChanges?: Array<{ memberId: string; privacyTier: number }> },
  ): Promise<FinanceSettings> => {
    const r = await apiClient.put<ApiResponse<FinanceSettings>>(
      resolvePath(MasterApiReference.Finance.Settings, { familyId }),
      data,
    );
    return requireApiData(r.data, 'FinanceRepository.updateSettings');
  },
};
