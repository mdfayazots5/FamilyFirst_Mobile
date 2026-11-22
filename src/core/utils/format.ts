import { AppConfig } from '../config/appConfig';

/**
 * App-wide display locale — India / English only (founder decision 2026-11-22).
 * 'en-IN' renders dates as DD/MM/YYYY. Never call toLocaleDateString() without it:
 * a bare call follows the browser's locale (often en-US → MM/DD/YYYY).
 */
export const APP_LOCALE = AppConfig.defaultLocale;

/**
 * Calendar date in the device's local time as YYYY-MM-DD (what DateOnly API params expect).
 * Never use `toISOString().split('T')[0]` for "today": that is the UTC date, which in India is
 * still yesterday between 00:00 and 05:30 IST.
 */
export const toLocalIsoDate = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** "DoctorAppointment" → "Doctor visit", "SchoolEvent" → "School Event" (same rule as the calendar screens). */
export const formatEventTypeLabel = (value: string | null | undefined): string =>
  (value ?? '')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace('Doctor Appointment', 'Doctor visit')
    .replace('Family Travel', 'Family plan');
