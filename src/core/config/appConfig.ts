/**
 * Production Configuration for FamilyFirst
 */

export const AppConfig = {
  isDemo: true, // Set to true for demo mode, false for live API
  apiBaseUrl: 'https://api.familyfirst.app/v1',
  fcmEnabled: true,
  analyticsEnabled: true,
  version: '1.0.0',
  buildNumber: '100',
  environment: 'production',
  
  // Feature Flags
  features: {
    subscriptionEnabled: false,
    aiFamilyAssist: false, // Level 3 - Out of scope for now
    medicalVault: false,   // Level 2 - Out of scope for now
    financeTracker: false, // Level 2 - Out of scope for now
  },

  // Localization
  defaultLocale: 'en',
  supportedLocales: ['en', 'hi', 'ta', 'te', 'mr'],
};
