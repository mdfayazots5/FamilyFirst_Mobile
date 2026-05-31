/**
 * Production Configuration for FamilyFirst
 */

export const AppConfig = {
  isDemo: true, // Set to true for demo mode, false for live API
  apiBaseUrl: 'https://api.familyfirst.app/api',
  fcmEnabled: true,
  analyticsEnabled: true,
  version: '1.0.0',
  buildNumber: '100',
  environment: 'production',
  
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
