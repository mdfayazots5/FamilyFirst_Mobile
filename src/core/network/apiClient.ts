import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { MasterApiReference } from '../api/MasterApiReference';
import { AppConfig } from '../config/appConfig';
import { SecureStorageService } from '../storage/SecureStorageService';
import type { ApiResponse } from './apiTypes';

type RefreshTokenPayload = {
  accessToken: string;
  refreshToken: string;
};

interface SessionRequest extends InternalAxiosRequestConfig {
  retried?: boolean;
  sentAccessToken?: string;
  sentRefreshToken?: string | null;
}

const clientOptions = {
  baseURL: AppConfig.apiBaseUrl,
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json' },
};

const apiClient = axios.create(clientOptions);
const refreshClient = axios.create(clientOptions);
export const apiForbiddenEvent = 'familyfirst:api-forbidden';

const anonymousAuthPaths = new Set<string>([
  MasterApiReference.Auth.Login,
  MasterApiReference.Auth.SendOtp,
  MasterApiReference.Auth.VerifyOtp,
  MasterApiReference.Auth.VerifyPin,
  MasterApiReference.Auth.RefreshToken,
  MasterApiReference.Families.ChildrenByJoinCode,
]);

const publicSharePrefixes = [
  MasterApiReference.Vault.ShareToken,
  MasterApiReference.Medical.EmergencyCardByToken,
].map(path => path.replace(':token', ''));

/** Dispatched when the server rejects the refresh token; AuthContext clears state and routes to /login. */
export const apiSessionExpiredEvent = 'familyfirst:session-expired';

class RefreshRejectedError extends Error {}

const isRefreshRejected = (error: unknown): boolean => {
  if (error instanceof RefreshRejectedError) return true;
  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  return status === 400 || status === 401;
};

const expireSession = () => {
  SecureStorageService.clearAll();
  window.dispatchEvent(new CustomEvent(apiSessionExpiredEvent));
};

let pendingRefresh: { refreshToken: string; result: Promise<string> } | undefined;
let lastRotation: { previous: string; current: string } | undefined;

const refreshAccessToken = (refreshToken: string): Promise<string> => {
  if (pendingRefresh?.refreshToken === refreshToken) return pendingRefresh.result;

  const result = refreshClient
    .post<ApiResponse<RefreshTokenPayload>>(MasterApiReference.Auth.RefreshToken, { refreshToken })
    .then(({ data }) => {
      const tokens = data.data;
      if (!data.succeeded || !tokens?.accessToken || !tokens.refreshToken) {
        throw new RefreshRejectedError(data.message ?? 'Refresh token response did not include token data.');
      }
      if (SecureStorageService.getRefreshToken() !== refreshToken) {
        throw new Error('The session changed during token refresh.');
      }

      SecureStorageService.saveAccessToken(tokens.accessToken);
      SecureStorageService.saveRefreshToken(tokens.refreshToken);
      lastRotation = { previous: refreshToken, current: tokens.refreshToken };
      return tokens.accessToken;
    })
    .catch(error => {
      // Only a definitive rejection ends the session. Network errors, timeouts and 5xx keep the session (and the
      // P9 emergency offline cache) so a flaky connection never logs the user out.
      if (isRefreshRejected(error) && SecureStorageService.getRefreshToken() === refreshToken) {
        expireSession();
      }
      throw error;
    })
    .finally(() => {
      if (pendingRefresh?.result === result) pendingRefresh = undefined;
    });

  pendingRefresh = { refreshToken, result };
  return result;
};

apiClient.interceptors.request.use((config: SessionRequest) => {
  const path = config.url?.split('?')[0] ?? '';
  if (anonymousAuthPaths.has(path) || publicSharePrefixes.some(prefix => path.startsWith(prefix))) {
    return config;
  }

  const token = SecureStorageService.getAccessToken();
  if (token && (!config.headers.has('Authorization') || config.retried)) {
    config.sentAccessToken = token;
    config.sentRefreshToken = SecureStorageService.getRefreshToken();
    config.headers.set('Authorization', 'Bearer ' + token);
  }
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const status = error.response?.status;
    const request: SessionRequest | undefined = error.config;

    if (status === 403) {
      const data = error.response?.data;
      const message = data?.errors?.[0]?.message || data?.message || 'You do not have permission to do that.';
      window.dispatchEvent(new CustomEvent<string>(apiForbiddenEvent, { detail: message }));
    }

    if (status !== 401 || !request?.sentAccessToken || request.retried) throw error;

    const accessToken = SecureStorageService.getAccessToken();
    const refreshToken = SecureStorageService.getRefreshToken();
    if (!accessToken) throw error;
    request.retried = true;

    if (request.sentRefreshToken !== refreshToken) {
      if (lastRotation?.previous !== request.sentRefreshToken
        || lastRotation?.current !== refreshToken
        || accessToken === request.sentAccessToken) throw error;
    } else if (accessToken === request.sentAccessToken) {
      if (!refreshToken) {
        expireSession();
        throw error;
      }
      await refreshAccessToken(refreshToken);
    }

    return apiClient(request);
  },
);

export default apiClient;
