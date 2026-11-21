import { EmergencyOfflineStore, emergencySessionKey } from '../cache/EmergencyOfflineStore';

const ACCESS_TOKEN_KEY = 'ff_access_token';
const REFRESH_TOKEN_KEY = 'ff_refresh_token';
export const authUserStorageKey = 'ff_user';

export const SecureStorageService = {
  saveAccessToken: (token: string) => localStorage.setItem(ACCESS_TOKEN_KEY, token),
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  deleteAccessToken: () => localStorage.removeItem(ACCESS_TOKEN_KEY),

  saveRefreshToken: (token: string) => localStorage.setItem(REFRESH_TOKEN_KEY, token),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  deleteRefreshToken: () => localStorage.removeItem(REFRESH_TOKEN_KEY),

  // Typed as unknown (not the AuthContext User) to avoid a storage → AuthContext circular import (ProjectOverview §23.1).
  saveUser: (user: unknown) => {
    void EmergencyOfflineStore.invalidateSession();
    localStorage.setItem(authUserStorageKey, JSON.stringify(user));
  },
  getUser: () => {
    const user = localStorage.getItem(authUserStorageKey);
    return user ? JSON.parse(user) : null;
  },
  deleteUser: () => {
    localStorage.removeItem(authUserStorageKey);
    void EmergencyOfflineStore.invalidateSession();
  },

  getEmergencyCacheScope: (familyId: string) => {
    if (!crypto.randomUUID || !localStorage.getItem(ACCESS_TOKEN_KEY)) return undefined;
    const user = localStorage.getItem(authUserStorageKey);
    if (!user) return undefined;
    const identity: { id?: string; familyId?: string } = JSON.parse(user);
    if (!identity?.id || identity.familyId !== familyId) return undefined;
    const existing = localStorage.getItem(emergencySessionKey);
    if (existing) return existing;
    const scope = crypto.randomUUID();
    localStorage.setItem(emergencySessionKey, scope);
    return scope;
  },

  clearAll: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(authUserStorageKey);
    void EmergencyOfflineStore.invalidateSession();
  }
};
