import apiClient from '../../../core/network/apiClient';
import { MasterApiReference, resolvePath } from '../../../core/api/MasterApiReference';
import { UserRole } from '../../../core/auth/AuthContext';
import type { ApiResponse, MasterDataItem } from '../../../core/network/apiTypes';
import { requireApiData } from '../../../core/network/apiTypes';
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

// [VERIFY - candidate master data]
export const FAMILY_LINK_TYPE_OPTIONS: readonly string[] = [
  'Father',
  'Mother',
  'Son',
  'Daughter',
  'Grandfather',
  'Grandmother',
  'Tutor',
  'ArabicTeacher',
  'Driver',
  'Caregiver',
];

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
    const response = await apiClient.post<ApiResponse<Family>>(MasterApiReference.Families.Root, { familyName: name, city });
    return response.data.data as Family;
  },

  addMember: async (familyId: string, member: Partial<FamilyMember>): Promise<FamilyMember> => {
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
    const response = await apiClient.get<ApiResponse<FamilyMemberDto[] | { items?: FamilyMemberDto[] }>>(
      resolvePath(MasterApiReference.Families.Members, { familyId }),
      { params: { page: 1, pageSize: 100 } },
    );
    const payload = response.data.data;
    const items = Array.isArray(payload) ? payload : payload?.items ?? [];
    return items.map(mapMemberDto);
  },

  getJoinCode: async (familyId: string): Promise<{ joinCode: string }> => {
    const response = await apiClient.get<ApiResponse<{ joinCode: string }>>(
      resolvePath(MasterApiReference.Families.JoinCode, { familyId }),
    );
    return requireApiData(response.data, 'FamilyRepository.getJoinCode');
  },

  regenerateJoinCode: async (familyId: string): Promise<{ joinCode: string }> => {
    const response = await apiClient.post<ApiResponse<{ joinCode: string }>>(
      resolvePath(MasterApiReference.Families.RegenerateJoinCode, { familyId }),
    );
    return requireApiData(response.data, 'FamilyRepository.regenerateJoinCode');
  },

  getRoleOptions: async (): Promise<FamilyLookupOption[]> => {
    return mapLookupItems(await getMasters('Role'));
  },

  getPlanOptions: async (): Promise<FamilyLookupOption[]> => {
    return mapLookupItems(await getMasters('Plan'));
  },
};
