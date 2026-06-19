import apiClient from '../network/apiClient';
import { MasterApiReference } from '../api/MasterApiReference';
import { AppConfig } from '../config/appConfig';
import { UserRole } from '../auth/UserRole';
import type { ApiResponse } from '../network/apiTypes';

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

// API returns PascalCase role strings; map them to internal UserRole enum values.
const API_ROLE_MAP: Record<string, UserRole> = {
  SuperAdmin: UserRole.SUPER_ADMIN,
  FamilyAdmin: UserRole.FAMILY_ADMIN,
  Parent: UserRole.PARENT,
  Child: UserRole.CHILD,
  Teacher: UserRole.TEACHER,
  Elder: UserRole.ELDER,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApiUser(apiUser: any): AuthResponse['user'] {
  return {
    id: apiUser.userId ?? apiUser.id,
    role: API_ROLE_MAP[apiUser.role] ?? apiUser.role,
    name: apiUser.fullName ?? apiUser.name,
    familyId: apiUser.familyId,
    childProfileId: apiUser.childProfileId,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApiAuthResponse(raw: any): AuthResponse {
  return {
    accessToken: raw.accessToken,
    refreshToken: raw.refreshToken,
    user: mapApiUser(raw.user),
  };
}

interface SendOtpResponse {
  otpToken: string;
}

interface JoinCodeChild {
  id: string;
  name: string;
  age: number;
}

export const AuthRepository = {
  loginWithPassword: async (phoneNumber: string, countryCode: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      MasterApiReference.Auth.Login,
      { phoneNumber, countryCode, password },
    );
    return mapApiAuthResponse(response.data.data);
  },

  sendOtp: async (phoneNumber: string, countryCode: string) => {
    if (AppConfig.isDemo) {
      return { otpToken: 'demo_otp_token' };
    }
    const response = await apiClient.post<ApiResponse<SendOtpResponse>>(MasterApiReference.Auth.SendOtp, { phoneNumber, countryCode });
    return response.data.data;
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
    const response = await apiClient.post<ApiResponse<AuthResponse>>(MasterApiReference.Auth.VerifyOtp, { phoneNumber, otpToken, otpCode });
    return mapApiAuthResponse(response.data.data);
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
    const response = await apiClient.post<ApiResponse<AuthResponse>>(MasterApiReference.Auth.VerifyPin, { userId, pin });
    return mapApiAuthResponse(response.data.data);
  },

  getChildrenByJoinCode: async (joinCode: string): Promise<JoinCodeChild[]> => {
    if (AppConfig.isDemo) {
      if (joinCode !== 'DEMO01') throw new Error('Invalid Join Code');
      return [
        { id: 'demo_child_1', name: 'Arjun', age: 12 },
        { id: 'demo_child_2', name: 'Sana', age: 8 }
      ];
    }
    const response = await apiClient.get<ApiResponse<JoinCodeChild[]>>(MasterApiReference.Families.ChildrenByJoinCode, {
      params: { joinCode },
    });
    return response.data.data ?? [];
  },

  getMe: async (): Promise<AuthResponse['user']> => {
    const response = await apiClient.get<ApiResponse<AuthResponse['user']>>(MasterApiReference.Auth.Me);
    return mapApiUser(response.data.data);
  },

  logout: async (refreshToken: string): Promise<boolean> => {
    if (AppConfig.isDemo) return true;
    const response = await apiClient.post<ApiResponse<boolean>>(MasterApiReference.Auth.RevokeToken, { refreshToken });
    return response.data.data ?? false;
  }
};
