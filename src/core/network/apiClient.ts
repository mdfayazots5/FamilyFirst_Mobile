import axios from 'axios';
import { AppConfig } from '../config/appConfig';
import { SecureStorageService } from '../storage/SecureStorageService';

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
        const response = await axios.post(`${AppConfig.apiBaseUrl}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        SecureStorageService.saveAccessToken(accessToken);
        SecureStorageService.saveRefreshToken(newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear storage and redirect to login (handled by AuthContext)
        SecureStorageService.clearAll();
        window.location.href = '/phone-login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
