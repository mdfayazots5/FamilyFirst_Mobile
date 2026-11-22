import { AppConfig } from '../config/appConfig';

/**
 * App-wide display locale — India / English only (founder decision 2026-11-22).
 * 'en-IN' renders dates as DD/MM/YYYY. Never call toLocaleDateString() without it:
 * a bare call follows the browser's locale (often en-US → MM/DD/YYYY).
 */
export const APP_LOCALE = AppConfig.defaultLocale;

/** "DoctorAppointment" → "Doctor visit", "SchoolEvent" → "School Event" (same rule as the calendar screens). */
export const formatEventTypeLabel = (value: string | null | undefined): string =>
  (value ?? '')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace('Doctor Appointment', 'Doctor visit')
    .replace('Family Travel', 'Family plan');
