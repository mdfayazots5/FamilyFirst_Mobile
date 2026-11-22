/**
 * Production Configuration for FamilyFirst
 */

const resolveApiBaseUrl = (): string => {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!configuredUrl) return 'https://api.familyfirst.app/api';
  return configuredUrl.endsWith('/') ? configuredUrl.slice(0, -1) : configuredUrl;
};

export const AppConfig = {
  apiBaseUrl: resolveApiBaseUrl(),
  fcmEnabled: true,
  analyticsEnabled: true,
  version: '1.0.0',
  buildNumber: '100',
  environment: import.meta.env.MODE ?? 'production',
  
  // Feature Flags
  features: {
    aiFamilyAssist: false, // Level 3 - Out of scope for now
    documentVault: true,   // Level 2 - Phase L2-1 complete
    medicalRecords: true,  // Level 2 - Phase L2-2 complete
    safetyLocation: true,  // Level 2 - Phase L2-3 complete
    medicalVault: false,   // Level 2 - Out of scope for now
    financeTracker: true,  // Level 2 - Phase L2-5 complete
  },

  // Localization: English only, India only (founder decision 2026-11-22)
  defaultLocale: 'en-IN',
};
