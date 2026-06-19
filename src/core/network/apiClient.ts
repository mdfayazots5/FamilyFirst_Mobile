import axios from 'axios';
import { MasterApiReference } from '../api/MasterApiReference';
import { AppConfig } from '../config/appConfig';
import { SecureStorageService } from '../storage/SecureStorageService';
import type { ApiResponse } from './apiTypes';

type RefreshTokenPayload = {
  accessToken: string;
  refreshToken: string;
};

const apiClient = axios.create({
  baseURL: AppConfig.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = SecureStorageService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for Token Refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = SecureStorageService.getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');

        // Call refresh token endpoint
        const response = await axios.post<ApiResponse<RefreshTokenPayload>>(`${AppConfig.apiBaseUrl}${MasterApiReference.Auth.RefreshToken}`, {
          refreshToken,
        });

        const refreshData = response.data.data;
        if (!refreshData) {
          throw new Error(response.data.message ?? 'Refresh token response did not include token data.');
        }

        const { accessToken, refreshToken: newRefreshToken } = refreshData;
        
        SecureStorageService.saveAccessToken(accessToken);
        SecureStorageService.saveRefreshToken(newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear storage and redirect to login (handled by AuthContext)
        SecureStorageService.clearAll();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
