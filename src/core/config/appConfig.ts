/**
 * Production Configuration for FamilyFirst
 */

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) return fallback;
  const normalised = value.trim().toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(normalised)) return true;
  if (['false', '0', 'no', 'off'].includes(normalised)) return false;
  return fallback;
};

const resolveApiBaseUrl = (): string => {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!configuredUrl) return 'https://api.familyfirst.app/api';
  return configuredUrl.endsWith('/') ? configuredUrl.slice(0, -1) : configuredUrl;
};

export const AppConfig = {
  isDemo: parseBoolean(import.meta.env.VITE_IS_DEMO, false),
  apiBaseUrl: resolveApiBaseUrl(),
  fcmEnabled: true,
  analyticsEnabled: true,
  version: '1.0.0',
  buildNumber: '100',
  environment: import.meta.env.MODE ?? 'production',
  
  // Feature Flags
  features: {
    subscriptionEnabled: false,
    aiFamilyAssist: false, // Level 3 - Out of scope for now
    documentVault: true,   // Level 2 - Phase L2-1 complete
    medicalRecords: true,  // Level 2 - Phase L2-2 complete
    safetyLocation: true,  // Level 2 - Phase L2-3 complete
    medicalVault: false,   // Level 2 - Out of scope for now
    financeTracker: true,  // Level 2 - Phase L2-5 complete (Premium plan only)
  },

  // Localization
  defaultLocale: 'en',
  supportedLocales: ['en', 'hi', 'ta', 'te', 'mr'],
};
