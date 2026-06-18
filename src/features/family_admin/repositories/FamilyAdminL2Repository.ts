import apiClient from '../../../core/network/apiClient';
import { MasterApiReference, resolvePath } from '../../../core/api/MasterApiReference';
import { AppConfig } from '../../../core/config/appConfig';
import type { ApiResponse } from '../../../core/network/apiTypes';

// ── Storage Config (AC-01 / AC-02) ───────────────────────────────────────────

export interface HybridRoutingRule {
  category: string;
  provider: 'App' | 'GoogleDrive';
}

export interface StorageConfig {
  storageMode: 'AppManaged' | 'GoogleDrive' | 'Hybrid';
  googleDriveConnected: boolean;
  googleDriveEmail?: string;
  googleDriveFolderName?: string;
  storageQuotaAlertThresholdPct: number;
  offlineCacheSizeMb: number;
  storageUsedBytes: number;
  storageQuotaBytes: number;
  hybridRouting: HybridRoutingRule[];
}

// ── Alert Thresholds (AC-04) ─────────────────────────────────────────────────

export interface AlertThresholds {
  financeLargeTransactionThreshold: number;
  documentExpiryLeadDaysDefault: number;
  documentExpiryLeadDaysIdentity: number;
  documentExpiryLeadDaysMedical: number;
  documentExpiryLeadDaysInsurance: number;
  lateArrivalToleranceMinutes: number;
  locationStaleThresholdMinutes: number;
}

// ── Emergency Access Rules (DV-07) ───────────────────────────────────────────

export interface EmergencyContact {
  name: string;
  phoneNumber: string;
  relationship: string;
}

export interface EmergencyAccessRules {
  accessMode: 'LoginRequired' | 'PinOnly' | 'NoLogin';
  emergencyLinkExpiryHours: number;
  emergencyContacts: EmergencyContact[];
}

// ── Finance Privacy Config (AC-06) ───────────────────────────────────────────

export interface FinancePrivacyConfig {
  defaultAdultEarningMemberTier: 1 | 2 | 3;
  defaultIndependentMemberTier: 1 | 2 | 3;
  consentReminderIntervalDays: number;
  autoExcludeSalaryCredits: boolean;
}

// ── Demo Data ─────────────────────────────────────────────────────────────────

const DEMO_STORAGE: StorageConfig = {
  storageMode: 'AppManaged',
  googleDriveConnected: false,
  storageQuotaAlertThresholdPct: 90,
  offlineCacheSizeMb: 500,
  storageUsedBytes: 320 * 1024 * 1024,
  storageQuotaBytes: 2 * 1024 * 1024 * 1024,
  hybridRouting: [],
};

const DEMO_THRESHOLDS: AlertThresholds = {
  financeLargeTransactionThreshold: 5000,
  documentExpiryLeadDaysDefault: 30,
  documentExpiryLeadDaysIdentity: 60,
  documentExpiryLeadDaysMedical: 30,
  documentExpiryLeadDaysInsurance: 45,
  lateArrivalToleranceMinutes: 0,
  locationStaleThresholdMinutes: 60,
};

const DEMO_EMERGENCY: EmergencyAccessRules = {
  accessMode: 'LoginRequired',
  emergencyLinkExpiryHours: 72,
  emergencyContacts: [
    { name: 'Dr. Anil Sharma', phoneNumber: '+919876543210', relationship: 'Family Doctor' },
  ],
};

const DEMO_FINANCE_PRIVACY: FinancePrivacyConfig = {
  defaultAdultEarningMemberTier: 2,
  defaultIndependentMemberTier: 3,
  consentReminderIntervalDays: 30,
  autoExcludeSalaryCredits: true,
};

// ── Module Visibility ─────────────────────────────────────────────────────────

export interface ModuleVisibilityItem {
  configId?: string;
  role: number; // UserRole enum int: Parent=3, Child=4, Teacher=5, Elder=6
  moduleName: string;
  isVisible: boolean;
  isDefault: boolean;
  updatedAt: string;
}

export interface UpdateModuleVisibilityRequest {
  items: Array<{ role: number; moduleName: string; isVisible: boolean }>;
}

// ── Notification Rules ────────────────────────────────────────────────────────

export interface NotificationRuleItem {
  ruleId: string;
  familyId: string;
  ruleKey: string;
  isEnabled: boolean;
  priorityOverride?: number;
  deliveryDelayMinutes?: number;
  updatedAt: string;
}

export interface UpdateNotificationRulePayload {
  isEnabled: boolean;
  priorityOverride?: number;
  deliveryDelayMinutes?: number;
}

// ── Demo Data (continued) ─────────────────────────────────────────────────────

const ts = new Date().toISOString();

const DEMO_MODULE_VISIBILITY: ModuleVisibilityItem[] = [
  { role: 3, moduleName: 'Attendance',  isVisible: true,  isDefault: true, updatedAt: ts },
  { role: 3, moduleName: 'Tasks',       isVisible: true,  isDefault: true, updatedAt: ts },
  { role: 3, moduleName: 'Rewards',     isVisible: true,  isDefault: true, updatedAt: ts },
  { role: 3, moduleName: 'Feedback',    isVisible: true,  isDefault: true, updatedAt: ts },
  { role: 3, moduleName: 'Calendar',    isVisible: true,  isDefault: true, updatedAt: ts },
  { role: 3, moduleName: 'Reports',     isVisible: true,  isDefault: true, updatedAt: ts },
  { role: 3, moduleName: 'Safety',      isVisible: true,  isDefault: true, updatedAt: ts },
  { role: 3, moduleName: 'FamilyAdmin', isVisible: true,  isDefault: true, updatedAt: ts },
  { role: 4, moduleName: 'Attendance',  isVisible: true,  isDefault: true, updatedAt: ts },
  { role: 4, moduleName: 'Tasks',       isVisible: true,  isDefault: true, updatedAt: ts },
  { role: 4, moduleName: 'Rewards',     isVisible: true,  isDefault: true, updatedAt: ts },
  { role: 4, moduleName: 'Feedback',    isVisible: false, isDefault: true, updatedAt: ts },
  { role: 4, moduleName: 'Calendar',    isVisible: true,  isDefault: true, updatedAt: ts },
  { role: 4, moduleName: 'Reports',     isVisible: false, isDefault: true, updatedAt: ts },
  { role: 4, moduleName: 'Safety',      isVisible: true,  isDefault: true, updatedAt: ts },
  { role: 4, moduleName: 'FamilyAdmin', isVisible: false, isDefault: true, updatedAt: ts },
  { role: 5, moduleName: 'Attendance',  isVisible: true,  isDefault: true, updatedAt: ts },
  { role: 5, moduleName: 'Tasks',       isVisible: false, isDefault: true, updatedAt: ts },
  { role: 5, moduleName: 'Rewards',     isVisible: false, isDefault: true, updatedAt: ts },
  { role: 5, moduleName: 'Feedback',    isVisible: true,  isDefault: true, updatedAt: ts },
  { role: 5, moduleName: 'Calendar',    isVisible: true,  isDefault: true, updatedAt: ts },
  { role: 5, moduleName: 'Reports',     isVisible: false, isDefault: true, updatedAt: ts },
  { role: 5, moduleName: 'Safety',      isVisible: false, isDefault: true, updatedAt: ts },
  { role: 5, moduleName: 'FamilyAdmin', isVisible: false, isDefault: true, updatedAt: ts },
  { role: 6, moduleName: 'Attendance',  isVisible: false, isDefault: true, updatedAt: ts },
  { role: 6, moduleName: 'Tasks',       isVisible: false, isDefault: true, updatedAt: ts },
  { role: 6, moduleName: 'Rewards',     isVisible: false, isDefault: true, updatedAt: ts },
  { role: 6, moduleName: 'Feedback',    isVisible: false, isDefault: true, updatedAt: ts },
  { role: 6, moduleName: 'Calendar',    isVisible: true,  isDefault: true, updatedAt: ts },
  { role: 6, moduleName: 'Reports',     isVisible: false, isDefault: true, updatedAt: ts },
  { role: 6, moduleName: 'Safety',      isVisible: true,  isDefault: true, updatedAt: ts },
  { role: 6, moduleName: 'FamilyAdmin', isVisible: false, isDefault: true, updatedAt: ts },
];

const DEMO_NOTIFICATION_RULES: NotificationRuleItem[] = [
  { ruleId: '00000001-0000-0000-0000-000000000001', familyId: '', ruleKey: 'Attendance',   isEnabled: true, updatedAt: ts },
  { ruleId: '00000001-0000-0000-0000-000000000002', familyId: '', ruleKey: 'Feedback',     isEnabled: true, updatedAt: ts },
  { ruleId: '00000001-0000-0000-0000-000000000003', familyId: '', ruleKey: 'Task',         isEnabled: true, updatedAt: ts },
  { ruleId: '00000001-0000-0000-0000-000000000004', familyId: '', ruleKey: 'Reward',       isEnabled: true, updatedAt: ts },
  { ruleId: '00000001-0000-0000-0000-000000000005', familyId: '', ruleKey: 'Calendar',     isEnabled: true, updatedAt: ts },
  { ruleId: '00000001-0000-0000-0000-000000000006', familyId: '', ruleKey: 'WeeklyDigest', isEnabled: true, updatedAt: ts },
];

// ── Repository ────────────────────────────────────────────────────────────────

export const FamilyAdminL2Repository = {
  // Storage
  getStorageConfig: async (familyId: string): Promise<StorageConfig> => {
    if (AppConfig.isDemo) return DEMO_STORAGE;
    const r = await apiClient.get<ApiResponse<StorageConfig>>(
      resolvePath(MasterApiReference.FamilyAdmin.Storage, { familyId }),
    );
    return r.data.data;
  },
  updateStorageConfig: async (familyId: string, data: Partial<StorageConfig>): Promise<StorageConfig> => {
    if (AppConfig.isDemo) return { ...DEMO_STORAGE, ...data };
    const r = await apiClient.put<ApiResponse<StorageConfig>>(
      resolvePath(MasterApiReference.FamilyAdmin.Storage, { familyId }),
      data,
    );
    return r.data.data;
  },

  // Alert Thresholds
  getAlertThresholds: async (familyId: string): Promise<AlertThresholds> => {
    if (AppConfig.isDemo) return DEMO_THRESHOLDS;
    const r = await apiClient.get<ApiResponse<AlertThresholds>>(
      resolvePath(MasterApiReference.FamilyAdmin.AlertThresholds, { familyId }),
    );
    return r.data.data;
  },
  updateAlertThresholds: async (familyId: string, data: Partial<AlertThresholds>): Promise<AlertThresholds> => {
    if (AppConfig.isDemo) return { ...DEMO_THRESHOLDS, ...data };
    const r = await apiClient.put<ApiResponse<AlertThresholds>>(
      resolvePath(MasterApiReference.FamilyAdmin.AlertThresholds, { familyId }),
      data,
    );
    return r.data.data;
  },

  // Emergency Access
  getEmergencyConfig: async (familyId: string): Promise<EmergencyAccessRules> => {
    if (AppConfig.isDemo) return DEMO_EMERGENCY;
    const r = await apiClient.get<ApiResponse<EmergencyAccessRules>>(
      resolvePath(MasterApiReference.FamilyAdmin.EmergencyConfig, { familyId }),
    );
    return r.data.data;
  },
  updateEmergencyConfig: async (familyId: string, data: Partial<EmergencyAccessRules>): Promise<EmergencyAccessRules> => {
    if (AppConfig.isDemo) return { ...DEMO_EMERGENCY, ...data };
    const r = await apiClient.put<ApiResponse<EmergencyAccessRules>>(
      resolvePath(MasterApiReference.FamilyAdmin.EmergencyConfig, { familyId }),
      data,
    );
    return r.data.data;
  },

  // Finance Privacy
  getFinancePrivacyConfig: async (familyId: string): Promise<FinancePrivacyConfig> => {
    if (AppConfig.isDemo) return DEMO_FINANCE_PRIVACY;
    const r = await apiClient.get<ApiResponse<FinancePrivacyConfig>>(
      resolvePath(MasterApiReference.FamilyAdmin.FinanceConfig, { familyId }),
    );
    return r.data.data;
  },
  updateFinancePrivacyConfig: async (familyId: string, data: Partial<FinancePrivacyConfig>): Promise<FinancePrivacyConfig> => {
    if (AppConfig.isDemo) return { ...DEMO_FINANCE_PRIVACY, ...data };
    const r = await apiClient.put<ApiResponse<FinancePrivacyConfig>>(
      resolvePath(MasterApiReference.FamilyAdmin.FinanceConfig, { familyId }),
      data,
    );
    return r.data.data;
  },

  // Module Visibility
  getModuleVisibility: async (familyId: string): Promise<ModuleVisibilityItem[]> => {
    if (AppConfig.isDemo) return DEMO_MODULE_VISIBILITY;
    const r = await apiClient.get<ApiResponse<ModuleVisibilityItem[]>>(
      resolvePath(MasterApiReference.FamilyAdmin.ModuleVisibility, { familyId }),
    );
    return r.data.data;
  },
  updateModuleVisibility: async (familyId: string, data: UpdateModuleVisibilityRequest): Promise<ModuleVisibilityItem[]> => {
    if (AppConfig.isDemo) return DEMO_MODULE_VISIBILITY;
    const r = await apiClient.put<ApiResponse<ModuleVisibilityItem[]>>(
      resolvePath(MasterApiReference.FamilyAdmin.ModuleVisibility, { familyId }),
      data,
    );
    return r.data.data;
  },

  // Notification Rules
  getNotificationRules: async (familyId: string): Promise<NotificationRuleItem[]> => {
    if (AppConfig.isDemo) return DEMO_NOTIFICATION_RULES;
    const r = await apiClient.get<ApiResponse<NotificationRuleItem[]>>(
      resolvePath(MasterApiReference.FamilyAdmin.NotificationRules, { familyId }),
    );
    return r.data.data;
  },
  updateNotificationRule: async (familyId: string, ruleId: string, data: UpdateNotificationRulePayload): Promise<NotificationRuleItem> => {
    if (AppConfig.isDemo) {
      const existing = DEMO_NOTIFICATION_RULES.find(rule => rule.ruleId === ruleId) ?? DEMO_NOTIFICATION_RULES[0];
      return { ...existing, ...data };
    }
    const r = await apiClient.put<ApiResponse<NotificationRuleItem>>(
      resolvePath(MasterApiReference.FamilyAdmin.NotificationRule, { familyId, ruleId }),
      data,
    );
    return r.data.data;
  },
};
