import apiClient from '../network/apiClient';
import { AppConfig } from '../config/appConfig';
import { UserRole } from '../auth/AuthContext';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    role: UserRole;
    name: string;
    familyId?: string;
    childProfileId?: string;
  };
}

export const AuthRepository = {
  sendOtp: async (phoneNumber: string, countryCode: string) => {
    if (AppConfig.isDemo) {
      return { otpToken: 'demo_otp_token' };
    }
    const response = await apiClient.post('/auth/send-otp', { phoneNumber, countryCode });
    return response.data;
  },

  verifyOtp: async (phoneNumber: string, otpToken: string, otpCode: string): Promise<AuthResponse> => {
    if (AppConfig.isDemo) {
      if (otpCode !== '123456') throw new Error('Invalid OTP');
      return {
        accessToken: 'demo_access_token',
        refreshToken: 'demo_refresh_token',
        user: {
          id: 'demo_parent_1',
          role: UserRole.PARENT,
          name: 'Amina Sharma',
          familyId: 'fam_demo_1'
        }
      };
    }
    const response = await apiClient.post('/auth/verify-otp', { phoneNumber, otpToken, otpCode });
    return response.data;
  },

  verifyPin: async (userId: string, pin: string): Promise<AuthResponse> => {
    if (AppConfig.isDemo) {
      if (pin === '0000' || pin === '1111') throw new Error('Invalid PIN pattern'); // Example rejection
      if (pin !== '1234') throw new Error('Incorrect PIN');
      
      return {
        accessToken: 'demo_access_token',
        refreshToken: 'demo_refresh_token',
        user: {
          id: userId,
          role: userId.includes('child') ? UserRole.CHILD : UserRole.ELDER,
          name: userId.includes('child') ? 'Arjun' : 'Dadi',
          familyId: 'fam_demo_1',
          childProfileId: userId.includes('child') ? 'child_1' : undefined
        }
      };
    }
    const response = await apiClient.post('/auth/verify-pin', { userId, pin });
    return response.data;
  },

  getChildrenByJoinCode: async (joinCode: string) => {
    if (AppConfig.isDemo) {
      if (joinCode !== 'DEMO01') throw new Error('Invalid Join Code');
      return [
        { id: 'demo_child_1', name: 'Arjun', age: 12 },
        { id: 'demo_child_2', name: 'Sana', age: 8 }
      ];
    }
    const response = await apiClient.get(`/families/children?joinCode=${joinCode}`);
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  logout: async (refreshToken: string) => {
    if (AppConfig.isDemo) return true;
    const response = await apiClient.post('/auth/revoke-token', { refreshToken });
    return response.data;
  }
};
