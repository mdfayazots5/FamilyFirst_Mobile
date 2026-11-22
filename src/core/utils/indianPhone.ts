/**
 * FamilyFirst is India-only (founder decision 2026-11-22).
 * Every phone number is an Indian mobile number: 10 digits starting with 6, 7, 8 or 9.
 * The country code is always +91 — there is no country picker anywhere in the app.
 * Mirrors the backend rule `IndianPhoneNumber.Pattern` = ^(\+91)?[6-9]\d{9}$.
 */
export const INDIA_COUNTRY_CODE = '+91';

export const INDIAN_MOBILE_LENGTH = 10;

export const INDIAN_MOBILE_ERROR = 'Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9.';

/**
 * Keeps only the 10 national digits. Strips spaces/dashes and a leading +91 / 91 / 0
 * so pasted numbers like "+91 98765 43210" still work. Result is capped at 10 digits.
 */
export const toIndianMobileDigits = (value: string): string => {
  let digits = value.replace(/\D/g, '');
  if (digits.length > INDIAN_MOBILE_LENGTH && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length > INDIAN_MOBILE_LENGTH && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits.slice(0, INDIAN_MOBILE_LENGTH);
};

export const isValidIndianMobile = (digits: string): boolean => /^[6-9]\d{9}$/.test(digits);

/** +91XXXXXXXXXX — call only after isValidIndianMobile. */
export const toIndianE164 = (digits: string): string => `${INDIA_COUNTRY_CODE}${digits}`;
