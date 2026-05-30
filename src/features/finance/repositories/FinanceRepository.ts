import apiClient from '../../../core/network/apiClient';
import { AppConfig } from '../../../core/config/appConfig';

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

// ── Demo Data ─────────────────────────────────────────────────────────────────

const DEMO_DASHBOARD: FinanceDashboard = {
  healthScore: {
    totalSpendMtd: 28400, totalIncomeMtd: 75000,
    netSavingsMtd: 46600, savingsRatePct: 62.1, healthStatus: 'Green',
  },
  memberCards: [
    { memberId: 'm1', memberName: 'Rahul (Papa)', privacyTier: 1,
      todaySpend: 850, monthSpend: 14200, isAboveThreshold: false },
    { memberId: 'm2', memberName: 'Priya (Mama)', privacyTier: 2,
      todaySpend: undefined, monthSpend: 14200, isAboveThreshold: true },
  ],
  todaysTransactions: [
    { transactionId: 'tx1', memberId: 'm1', memberName: 'Rahul',
      merchantName: 'Zomato', amount: 450, transactionType: 'Debit',
      category: 'FoodDining', isCategoryBlurred: false, privacyTier: 1,
      questionStatus: 'None', parsedAt: new Date(Date.now() - 2 * 3600000).toISOString() },
    { transactionId: 'tx2', memberId: 'm1', memberName: 'Rahul',
      merchantName: 'DMart', amount: 3200, transactionType: 'Debit',
      category: 'GroceriesKirana', isCategoryBlurred: false, privacyTier: 1,
      questionStatus: 'None', parsedAt: new Date(Date.now() - 5 * 3600000).toISOString() },
    { transactionId: 'tx3', memberId: 'm2', memberName: 'Priya',
      merchantName: undefined, amount: 1850, transactionType: 'Debit',
      category: 'Shopping', isCategoryBlurred: false, privacyTier: 2,
      questionStatus: 'None', parsedAt: new Date(Date.now() - 7 * 3600000).toISOString() },
  ],
  alerts: [
    { alertType: 'CommitmentMissed', message: 'LIC Premium NACH debit not received. Verify with bank.',
      severity: 'Critical', relatedCommitmentId: 'c2' },
  ],
  upcomingCommitments: [
    { commitmentId: 'c1', memberId: 'm1', memberName: 'Rahul', commitmentName: 'HDFC Home Loan EMI',
      commitmentType: 'HomeLoanEmi', amount: 18500, frequencyType: 'Monthly',
      nextDueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      status: 'Upcoming', isConfirmed: true },
    { commitmentId: 'c2', memberId: 'm1', memberName: 'Rahul', commitmentName: 'LIC Jeevan Anand',
      commitmentType: 'LICPremium', amount: 12000, frequencyType: 'Annual',
      nextDueDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      status: 'Missed', isConfirmed: true },
  ],
};

const DEMO_BUDGETS: BudgetItem[] = [
  { category: 'GroceriesKirana', budgetAmount: 8000, actualSpend: 6200, remaining: 1800, utilisationPct: 77.5, status: 'Green' },
  { category: 'FoodDining',       budgetAmount: 4000, actualSpend: 4200, remaining: -200, utilisationPct: 105,  status: 'Red' },
  { category: 'Utilities',        budgetAmount: 5000, actualSpend: 3800, remaining: 1200, utilisationPct: 76,   status: 'Green' },
  { category: 'EducationSchool',  budgetAmount: 12000, actualSpend: 11500, remaining: 500, utilisationPct: 95.8, status: 'Amber' },
  { category: 'Shopping',         budgetAmount: 3000, actualSpend: 1850, remaining: 1150, utilisationPct: 61.7, status: 'Green' },
];

const DEMO_CATEGORIES: CategorySpend[] = [
  { category: 'GroceriesKirana', totalSpend: 6200, transactionCount: 12, pctOfTotalSpend: 21.8, topMerchant: 'DMart' },
  { category: 'EducationSchool', totalSpend: 11500, transactionCount: 2, pctOfTotalSpend: 40.5, topMerchant: 'Delhi Public School' },
  { category: 'FoodDining',      totalSpend: 4200, transactionCount: 8, pctOfTotalSpend: 14.8, topMerchant: 'Zomato' },
  { category: 'Utilities',       totalSpend: 3800, transactionCount: 4, pctOfTotalSpend: 13.4, topMerchant: 'Jio' },
  { category: 'Shopping',        totalSpend: 1850, transactionCount: 3, pctOfTotalSpend: 6.5  },
];

const DEMO_SETTINGS: FinanceSettings = {
  cfoMemberId: 'm1', cfoMemberName: 'Rahul',
  isModuleEnabled: true,
  memberSettings: [
    { memberId: 'm1', memberName: 'Rahul', privacyTier: 1, consentStatus: 'Accepted',
      consentGivenAt: new Date(Date.now() - 30 * 86400000).toISOString() },
    { memberId: 'm2', memberName: 'Priya', privacyTier: 2, consentStatus: 'Accepted',
      consentGivenAt: new Date(Date.now() - 28 * 86400000).toISOString() },
  ],
};

// ── Repository ────────────────────────────────────────────────────────────────

export const FinanceRepository = {
  getDashboard: async (familyId: string): Promise<FinanceDashboard> => {
    if (AppConfig.isDemo) return DEMO_DASHBOARD;
    const r = await apiClient.get(`/families/${familyId}/finance/dashboard`);
    return r.data.data;
  },

  listTransactions: async (
    familyId: string,
    params?: { memberId?: string; category?: string; fromDate?: string; toDate?: string; page?: number; pageSize?: number },
  ): Promise<{ items: FinanceTransaction[]; totalCount: number }> => {
    if (AppConfig.isDemo) return { items: DEMO_DASHBOARD.todaysTransactions, totalCount: 3 };
    const r = await apiClient.get(`/families/${familyId}/finance/transactions`, { params });
    return { items: r.data.data.items, totalCount: r.data.data.totalCount };
  },

  questionTransaction: async (
    familyId: string, transactionId: string,
    data: { questionType: string; contextNote?: string },
  ): Promise<void> => {
    if (AppConfig.isDemo) return;
    await apiClient.post(`/families/${familyId}/finance/transactions/${transactionId}/question`, data);
  },

  getBudgets: async (familyId: string): Promise<BudgetItem[]> => {
    if (AppConfig.isDemo) return DEMO_BUDGETS;
    const r = await apiClient.get(`/families/${familyId}/finance/budget`);
    return r.data.data;
  },

  setBudget: async (familyId: string, data: { category: string; budgetAmount: number }): Promise<void> => {
    if (AppConfig.isDemo) return;
    await apiClient.put(`/families/${familyId}/finance/budget`, data);
  },

  getCategoryBreakdown: async (familyId: string, fromDate?: string, toDate?: string): Promise<CategorySpend[]> => {
    if (AppConfig.isDemo) return DEMO_CATEGORIES;
    const r = await apiClient.get(`/families/${familyId}/finance/categories`, { params: { fromDate, toDate } });
    return r.data.data;
  },

  listCommitments: async (familyId: string): Promise<Commitment[]> => {
    if (AppConfig.isDemo) return DEMO_DASHBOARD.upcomingCommitments;
    const r = await apiClient.get(`/families/${familyId}/finance/commitments`);
    return r.data.data;
  },

  inviteConsent: async (familyId: string, data: { memberId: string; privacyTier: number }): Promise<void> => {
    if (AppConfig.isDemo) return;
    await apiClient.post(`/families/${familyId}/finance/consent/invite`, data);
  },

  revokeConsent: async (familyId: string, memberId: string): Promise<void> => {
    if (AppConfig.isDemo) return;
    await apiClient.delete(`/families/${familyId}/finance/consent/${memberId}`);
  },

  getSettings: async (familyId: string): Promise<FinanceSettings> => {
    if (AppConfig.isDemo) return DEMO_SETTINGS;
    const r = await apiClient.get(`/families/${familyId}/finance/settings`);
    return r.data.data;
  },

  updateSettings: async (
    familyId: string,
    data: { cfoMemberId?: string; memberTierChanges?: Array<{ memberId: string; privacyTier: number }> },
  ): Promise<FinanceSettings> => {
    if (AppConfig.isDemo) return DEMO_SETTINGS;
    const r = await apiClient.put(`/families/${familyId}/finance/settings`, data);
    return r.data.data;
  },
};
