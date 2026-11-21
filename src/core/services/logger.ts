/**
 * App logger (R8). Development builds log to the console as before; production builds stay silent so error
 * objects (which can carry API payloads / PII) are never written to end-user consoles. Screens still surface
 * failures to the user through their own error states — this is diagnostics only.
 */
const isDev = import.meta.env.DEV;

export const logger = {
  error: (...args: unknown[]): void => { if (isDev) console.error(...args); },
  warn: (...args: unknown[]): void => { if (isDev) console.warn(...args); },
  info: (...args: unknown[]): void => { if (isDev) console.info(...args); },
};
