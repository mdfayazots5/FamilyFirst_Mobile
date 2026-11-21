export const emergencyRoutes = {
  folder: '/vault/emergency',
  card: '/medical/:memberId/emergency-card',
  sharedCard: '/medical/emergency-card/:token',
  sharedDocument: '/vault/share/:token',
} as const;

export const isEmergencyRoute = (pathname: string) =>
  /^\/(?:vault\/(?:emergency|share\/[^/]+)|medical\/(?:[^/]+\/emergency-card|emergency-card\/[^/]+))\/?$/i.test(pathname);
