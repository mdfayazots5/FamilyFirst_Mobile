import apiClient from '../../../core/network/apiClient';
import { MasterApiReference, resolvePath } from '../../../core/api/MasterApiReference';
import { AppConfig } from '../../../core/config/appConfig';
import { UserRole } from '../../../core/auth/AuthContext';
import type { ApiResponse, MasterDataItem } from '../../../core/network/apiTypes';
import { getMasters } from '../../../core/repositories/MasterDataRepository';

export interface FamilyMember {
  id: string;
  name: string;
  role: UserRole;
  linkType: string;
  phone?: string;
  avatarUrl?: string;
  age?: number;
}

export interface Family {
  id: string;
  name: string;
  city: string;
  joinCode: string;
  subscription: 'FreeTrial' | 'Basic' | 'Family' | 'Premium';
}

export interface FamilyLookupOption {
  id: string;
  label: string;
  code: string;
}

interface FamilyMemberDto {
  MemberId?: string;
  memberId?: string;
  UserId?: string;
  userId?: string;
  FullName?: string;
  fullName?: string;
  DisplayName?: string;
  displayName?: string;
  PhoneNumber?: string;
  phoneNumber?: string;
  Role?: number | string;
  role?: number | string;
  LinkType?: string;
  linkType?: string;
  AvatarUrl?: string;
  avatarUrl?: string;
  Age?: number;
  age?: number;
}

const DEMO_ROLE_OPTIONS: FamilyLookupOption[] = [
  { id: 'role-parent', label: 'Parent', code: 'Parent' },
  { id: 'role-elder', label: 'Elder', code: 'Elder' },
  { id: 'role-teacher', label: 'Teacher', code: 'Teacher' },
];

const DEMO_PLAN_OPTIONS: FamilyLookupOption[] = [
  { id: 'plan-free-trial', label: 'Free Trial', code: 'FreeTrial' },
  { id: 'plan-basic', label: 'Basic', code: 'Basic' },
  { id: 'plan-family', label: 'Family', code: 'Family' },
  { id: 'plan-premium', label: 'Premium', code: 'Premium' },
];

const mapRoleValue = (role: number | string | undefined): UserRole => {
  if (typeof role === 'number') {
    switch (role) {
      case 2:
        return UserRole.FAMILY_ADMIN;
      case 3:
        return UserRole.PARENT;
      case 4:
        return UserRole.CHILD;
      case 5:
        return UserRole.TEACHER;
      case 6:
        return UserRole.ELDER;
      default:
        return UserRole.PARENT;
    }
  }

  switch ((role ?? '').toString().toLowerCase()) {
    case 'familyadmin':
    case 'family_admin':
      return UserRole.FAMILY_ADMIN;
    case 'parent':
      return UserRole.PARENT;
    case 'child':
      return UserRole.CHILD;
    case 'teacher':
      return UserRole.TEACHER;
    case 'elder':
      return UserRole.ELDER;
    case 'superadmin':
    case 'super_admin':
      return UserRole.SUPER_ADMIN;
    default:
      return UserRole.PARENT;
  }
};

const mapMemberDto = (member: FamilyMemberDto): FamilyMember => ({
  id: member.MemberId ?? member.memberId ?? member.UserId ?? member.userId ?? '',
  name: member.FullName ?? member.fullName ?? member.DisplayName ?? member.displayName ?? '',
  role: mapRoleValue(member.Role ?? member.role),
  linkType: member.LinkType ?? member.linkType ?? '',
  phone: member.PhoneNumber ?? member.phoneNumber,
  avatarUrl: member.AvatarUrl ?? member.avatarUrl,
  age: member.Age ?? member.age,
});

const mapLookupItems = (items: MasterDataItem[]): FamilyLookupOption[] =>
  items.map((item) => ({
    id: item.id,
    label: item.name,
    code: item.code,
  }));

export const FamilyRepository = {
  createFamily: async (name: string, city: string): Promise<Family> => {
    if (AppConfig.isDemo) {
      return {
        id: 'fam_demo_1',
        name,
        city,
        joinCode: 'DEMO01',
        subscription: 'FreeTrial'
      };
    }
    const response = await apiClient.post<ApiResponse<Family>>(MasterApiReference.Families.Root, { familyName: name, city });
    return response.data.data as Family;
  },

  addMember: async (familyId: string, member: Partial<FamilyMember>): Promise<FamilyMember> => {
    if (AppConfig.isDemo) {
      return {
        id: `mem_${Math.random().toString(36).substr(2, 9)}`,
        name: member.name || '',
        role: member.role || UserRole.CHILD,
        linkType: member.linkType || 'Son',
        ...member
      };
    }
    const response = await apiClient.post<ApiResponse<FamilyMemberDto>>(
      resolvePath(MasterApiReference.Families.Members, { familyId }),
      {
        PhoneNumber: member.phone,
        FullName: member.name,
        Role: member.role === UserRole.PARENT ? 3 : member.role === UserRole.CHILD ? 4 : member.role === UserRole.TEACHER ? 5 : 6,
        LinkType: member.linkType,
      },
    );
    return mapMemberDto(response.data.data as FamilyMemberDto);
  },

  getMembers: async (familyId: string): Promise<FamilyMember[]> => {
    if (AppConfig.isDemo) {
      return [
        { id: 'mem_1', name: 'Amina Sharma', role: UserRole.PARENT, linkType: 'Mother' },
        { id: 'mem_2', name: 'Arjun', role: UserRole.CHILD, linkType: 'Son', avatarUrl: 'avatar_01' },
        { id: 'mem_3', name: 'Zara', role: UserRole.CHILD, linkType: 'Daughter', avatarUrl: 'avatar_02' },
        { id: 'mem_4', name: 'Dadi', role: UserRole.ELDER, linkType: 'Grandmother' },
      ];
    }
    const response = await apiClient.get<ApiResponse<FamilyMemberDto[] | { items?: FamilyMemberDto[] }>>(
      resolvePath(MasterApiReference.Families.Members, { familyId }),
      { params: { page: 1, pageSize: 100 } },
    );
    const payload = response.data.data;
    const items = Array.isArray(payload) ? payload : payload?.items ?? [];
    return items.map(mapMemberDto);
  },

  getJoinCode: async (familyId: string): Promise<{ joinCode: string }> => {
    if (AppConfig.isDemo) return { joinCode: 'DEMO01' };
    const response = await apiClient.get<ApiResponse<{ joinCode: string }>>(
      resolvePath(MasterApiReference.Families.JoinCode, { familyId }),
    );
    return response.data.data as { joinCode: string };
  },

  regenerateJoinCode: async (familyId: string): Promise<{ joinCode: string }> => {
    if (AppConfig.isDemo) return { joinCode: 'NEW123' };
    const response = await apiClient.post<ApiResponse<{ joinCode: string }>>(
      resolvePath(MasterApiReference.Families.RegenerateJoinCode, { familyId }),
    );
    return response.data.data as { joinCode: string };
  },

  getRoleOptions: async (): Promise<FamilyLookupOption[]> => {
    if (AppConfig.isDemo) {
      return DEMO_ROLE_OPTIONS;
    }

    return mapLookupItems(await getMasters('Role'));
  },

  getPlanOptions: async (): Promise<FamilyLookupOption[]> => {
    if (AppConfig.isDemo) {
      return DEMO_PLAN_OPTIONS;
    }

    return mapLookupItems(await getMasters('Plan'));
  },
};
