import apiClient from '../../../core/network/apiClient';
import { MasterApiReference, resolvePath } from '../../../core/api/MasterApiReference';
import type { ApiResponse } from '../../../core/network/apiTypes';
import { requireApiData } from '../../../core/network/apiTypes';

// [VERIFY - candidate master data]
export const FAMILY_ADMIN_ROLE_OPTIONS: readonly string[] = ['PARENT', 'CHILD', 'TEACHER', 'ELDER'];

// ── Screen option lists (R6: moved out of screen components) ─────────────────────────────────────────────
// [VERIFY — candidate master data] These have no GetMasters code yet; ids match the backend enum/string values.

export const EMERGENCY_ACCESS_MODE_OPTIONS = [
  { id: 'LoginRequired', label: 'Login Required', desc: 'Viewer must sign in to FamilyFirst.' },
  { id: 'PinOnly',       label: 'PIN Only',       desc: 'Access via a numeric PIN — no FamilyFirst account needed.' },
  { id: 'NoLogin',       label: 'No Login',       desc: 'Emergency folder viewable by anyone with the link. Only for Emergency Folder.' },
] as const;

/** Emergency link lifetime choices in hours (backend max 168). */
export const EMERGENCY_LINK_EXPIRY_OPTIONS: readonly number[] = [24, 48, 72, 120, 168];

export const STORAGE_MODE_OPTIONS = [
  { id: 'AppManaged',  label: 'App Managed',  desc: 'Documents stored securely on FamilyFirst servers (AWS S3, India region).' },
  { id: 'GoogleDrive', label: 'Google Drive', desc: 'All documents routed to your Google Drive. Requires Google sign-in.' },
  { id: 'Hybrid',      label: 'Hybrid',       desc: 'Medical + Identity stay on app; other categories route to Google Drive.' },
] as const;

export const STORAGE_QUOTA_ALERT_OPTIONS: readonly number[] = [75, 90, 95];
export const OFFLINE_CACHE_SIZE_OPTIONS: readonly number[] = [500, 1000, 2000];
export const FINANCE_CONSENT_REMINDER_OPTIONS: readonly number[] = [7, 14, 30, 60, 90];

/** Display names for notification rule keys returned by GET .../family-admin/notification-rules (presentation only). */
export const NOTIFICATION_RULE_LABELS: Readonly<Record<string, string>> = {
  Attendance: 'Attendance updates (absent / late)',
  Feedback: 'Teacher feedback received',
  Task: 'Task submitted / completed',
  Reward: 'Reward redemption',
  Calendar: 'Calendar reminders',
  WeeklyDigest: 'Weekly summary report',
};

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

// ── Repository ────────────────────────────────────────────────────────────────

export const FamilyAdminL2Repository = {
  // Storage
  getStorageConfig: async (familyId: string): Promise<StorageConfig> => {
    const r = await apiClient.get<ApiResponse<StorageConfig>>(
      resolvePath(MasterApiReference.FamilyAdmin.Storage, { familyId }),
    );
    return requireApiData(r.data, 'FamilyAdminL2Repository.getStorageConfig');
  },
  updateStorageConfig: async (familyId: string, data: Partial<StorageConfig>): Promise<StorageConfig> => {
    const r = await apiClient.put<ApiResponse<StorageConfig>>(
      resolvePath(MasterApiReference.FamilyAdmin.Storage, { familyId }),
      data,
    );
    return requireApiData(r.data, 'FamilyAdminL2Repository.updateStorageConfig');
  },

  // Alert Thresholds
  getAlertThresholds: async (familyId: string): Promise<AlertThresholds> => {
    const r = await apiClient.get<ApiResponse<AlertThresholds>>(
      resolvePath(MasterApiReference.FamilyAdmin.AlertThresholds, { familyId }),
    );
    return requireApiData(r.data, 'FamilyAdminL2Repository.getAlertThresholds');
  },
  updateAlertThresholds: async (familyId: string, data: Partial<AlertThresholds>): Promise<AlertThresholds> => {
    const r = await apiClient.put<ApiResponse<AlertThresholds>>(
      resolvePath(MasterApiReference.FamilyAdmin.AlertThresholds, { familyId }),
      data,
    );
    return requireApiData(r.data, 'FamilyAdminL2Repository.updateAlertThresholds');
  },

  // Emergency Access
  getEmergencyConfig: async (familyId: string): Promise<EmergencyAccessRules> => {
    const r = await apiClient.get<ApiResponse<EmergencyAccessRules>>(
      resolvePath(MasterApiReference.FamilyAdmin.EmergencyConfig, { familyId }),
    );
    return requireApiData(r.data, 'FamilyAdminL2Repository.getEmergencyConfig');
  },
  updateEmergencyConfig: async (familyId: string, data: Partial<EmergencyAccessRules>): Promise<EmergencyAccessRules> => {
    const r = await apiClient.put<ApiResponse<EmergencyAccessRules>>(
      resolvePath(MasterApiReference.FamilyAdmin.EmergencyConfig, { familyId }),
      data,
    );
    return requireApiData(r.data, 'FamilyAdminL2Repository.updateEmergencyConfig');
  },

  // Finance Privacy
  getFinancePrivacyConfig: async (familyId: string): Promise<FinancePrivacyConfig> => {
    const r = await apiClient.get<ApiResponse<FinancePrivacyConfig>>(
      resolvePath(MasterApiReference.FamilyAdmin.FinanceConfig, { familyId }),
    );
    return requireApiData(r.data, 'FamilyAdminL2Repository.getFinancePrivacyConfig');
  },
  updateFinancePrivacyConfig: async (familyId: string, data: Partial<FinancePrivacyConfig>): Promise<FinancePrivacyConfig> => {
    const r = await apiClient.put<ApiResponse<FinancePrivacyConfig>>(
      resolvePath(MasterApiReference.FamilyAdmin.FinanceConfig, { familyId }),
      data,
    );
    return requireApiData(r.data, 'FamilyAdminL2Repository.updateFinancePrivacyConfig');
  },

  // Module Visibility
  getModuleVisibility: async (familyId: string): Promise<ModuleVisibilityItem[]> => {
    const r = await apiClient.get<ApiResponse<ModuleVisibilityItem[]>>(
      resolvePath(MasterApiReference.FamilyAdmin.ModuleVisibility, { familyId }),
    );
    return r.data.data ?? [];
  },
  updateModuleVisibility: async (familyId: string, data: UpdateModuleVisibilityRequest): Promise<ModuleVisibilityItem[]> => {
    const r = await apiClient.put<ApiResponse<ModuleVisibilityItem[]>>(
      resolvePath(MasterApiReference.FamilyAdmin.ModuleVisibility, { familyId }),
      data,
    );
    return r.data.data ?? [];
  },

  // Notification Rules
  getNotificationRules: async (familyId: string): Promise<NotificationRuleItem[]> => {
    const r = await apiClient.get<ApiResponse<NotificationRuleItem[]>>(
      resolvePath(MasterApiReference.FamilyAdmin.NotificationRules, { familyId }),
    );
    return r.data.data ?? [];
  },
  updateNotificationRule: async (familyId: string, ruleId: string, data: UpdateNotificationRulePayload): Promise<NotificationRuleItem> => {
    const r = await apiClient.put<ApiResponse<NotificationRuleItem>>(
      resolvePath(MasterApiReference.FamilyAdmin.NotificationRule, { familyId, ruleId }),
      data,
    );
    return requireApiData(r.data, 'FamilyAdminL2Repository.updateNotificationRule');
  },
};
