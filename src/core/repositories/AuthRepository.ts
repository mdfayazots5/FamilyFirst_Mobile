import apiClient from '../network/apiClient';
import { MasterApiReference } from '../api/MasterApiReference';
import { UserRole } from '../auth/UserRole';
import type { ApiResponse } from '../network/apiTypes';
import { requireApiData } from '../network/apiTypes';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    role: UserRole;
    name: string;
    phoneNumber?: string;
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

/**
 * Raw user payload from the API. Auth endpoints return UserDto (UserId, FullName, PhoneNumber, Role);
 * GET /auth/me returns CurrentUserDto (UserId, Name, PhoneNumber, Role, FamilyId, ChildProfileId).
 * Both are camelCased by the API serializer.
 */
interface ApiUserRaw {
  userId?: string;
  id?: string;
  role?: string;
  fullName?: string | null;
  name?: string | null;
  phoneNumber?: string | null;
  familyId?: string | null;
  childProfileId?: string | null;
}

interface ApiAuthResponseRaw {
  accessToken: string;
  refreshToken: string;
  user: ApiUserRaw;
}

function mapApiUser(apiUser: ApiUserRaw): AuthResponse['user'] {
  const rawRole = apiUser.role ?? '';
  return {
    id: apiUser.userId ?? apiUser.id ?? '',
    role: API_ROLE_MAP[rawRole] ?? (rawRole as UserRole),
    name: apiUser.fullName ?? apiUser.name ?? '',
    phoneNumber: apiUser.phoneNumber ?? undefined,
    familyId: apiUser.familyId ?? undefined,
    childProfileId: apiUser.childProfileId ?? undefined,
  };
}

/**
 * Reads the familyId / childProfileId claims from the access token (ProjectOverview §2.4 rule 13).
 * The sign-in UserDto does not carry them, so without this every live screen that needs user.familyId
 * failed after login. Display/context only — the API still authorizes every call from the signed token.
 */
function readTokenScope(accessToken: string): { familyId?: string; childProfileId?: string } {
  try {
    const segment = accessToken.split('.')[1] ?? '';
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(segment.length / 4) * 4, '=');
    const claims = JSON.parse(atob(base64)) as Record<string, unknown>;
    const text = (value: unknown) => (typeof value === 'string' && value.length > 0 ? value : undefined);
    return { familyId: text(claims.familyId), childProfileId: text(claims.childProfileId) };
  } catch {
    return {};
  }
}

function mapApiAuthResponse(raw: ApiAuthResponseRaw): AuthResponse {
  const user = mapApiUser(raw.user);
  const scope = readTokenScope(raw.accessToken);
  return {
    accessToken: raw.accessToken,
    refreshToken: raw.refreshToken,
    user: {
      ...user,
      familyId: user.familyId ?? scope.familyId,
      childProfileId: user.childProfileId ?? scope.childProfileId,
    },
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

// [VERIFY - candidate master data]
export interface CountryPhoneOption {
  code: string;
  label: string;
}

export const COUNTRY_PHONE_OPTIONS: readonly CountryPhoneOption[] = [
  { code: '+91', label: 'India' },
  { code: '+971', label: 'UAE' },
  { code: '+966', label: 'Saudi Arabia' },
  { code: '+1', label: 'United States' },
  { code: '+44', label: 'United Kingdom' },
];


export const AuthRepository = {
  loginWithPassword: async (phoneNumber: string, countryCode: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<ApiAuthResponseRaw>>(
      MasterApiReference.Auth.Login,
      { phoneNumber, countryCode, password },
    );
    return mapApiAuthResponse(requireApiData(response.data, 'AuthRepository.auth'));
  },

  sendOtp: async (phoneNumber: string, countryCode: string) => {
    const response = await apiClient.post<ApiResponse<SendOtpResponse>>(MasterApiReference.Auth.SendOtp, { phoneNumber, countryCode });
    return requireApiData(response.data, 'AuthRepository.sendOtp');
  },

  verifyOtp: async (phoneNumber: string, otpToken: string, otpCode: string): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<ApiAuthResponseRaw>>(MasterApiReference.Auth.VerifyOtp, { phoneNumber, otpToken, otpCode });
    return mapApiAuthResponse(requireApiData(response.data, 'AuthRepository.auth'));
  },

  verifyPin: async (userId: string, pin: string): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<ApiAuthResponseRaw>>(MasterApiReference.Auth.VerifyPin, { userId, pin });
    return mapApiAuthResponse(requireApiData(response.data, 'AuthRepository.auth'));
  },

  getChildrenByJoinCode: async (joinCode: string): Promise<JoinCodeChild[]> => {
    const response = await apiClient.get<ApiResponse<JoinCodeChild[]>>(MasterApiReference.Families.ChildrenByJoinCode, {
      params: { joinCode },
    });
    return response.data.data ?? [];
  },

  getMe: async (): Promise<AuthResponse['user']> => {
    const response = await apiClient.get<ApiResponse<ApiUserRaw>>(MasterApiReference.Auth.Me);
    return mapApiUser(requireApiData(response.data, 'AuthRepository.getMe'));
  },

  logout: async (refreshToken: string, accessToken?: string): Promise<boolean> => {
    const response = await apiClient.post<ApiResponse<boolean>>(
      MasterApiReference.Auth.RevokeToken,
      { refreshToken },
      accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined,
    );
    return response.data.data ?? false;
  }
};
