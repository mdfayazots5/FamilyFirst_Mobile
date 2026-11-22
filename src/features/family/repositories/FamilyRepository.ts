import apiClient from '../../../core/network/apiClient';
import { MasterApiReference, resolvePath } from '../../../core/api/MasterApiReference';
import { UserRole } from '../../../core/auth/AuthContext';
import type { ApiResponse } from '../../../core/network/apiTypes';
import { requireApiData } from '../../../core/network/apiTypes';
import { getMasters } from '../../../core/repositories/MasterDataRepository';
import {
  INDIAN_MOBILE_ERROR,
  isValidIndianMobile,
  toIndianE164,
  toIndianMobileDigits,
} from '../../../core/utils/indianPhone';

export interface FamilyMember {
  id: string;
  memberId?: string;
  /** User GUID — required by POST /auth/verify-pin for the Child/Elder device handover. */
  userId?: string;
  displayName?: string;
  name: string;
  role: UserRole;
  linkType: string;
  phone?: string;
  avatarUrl?: string;
  age?: number;
}

/** POST /api/families → ApiResponse<FamilyDto> (camelCase JSON). */
export interface Family {
  familyId: string;
  familyName: string;
  city?: string | null;
}

export interface FamilyLookupOption {
  id: string;
  label: string;
  code: string;
}

type AssignableFamilyRole = 2 | 3 | 4 | 5 | 6;

export type FamilyInviteRoleOption = Pick<FamilyLookupOption, 'id' | 'label'> & {
  value: AssignableFamilyRole;
};

const assignableRoleValues = new Map<string, AssignableFamilyRole>([
  ['FA', 2], // FamilyAdmin
  ['PA', 3], // Parent
  ['CH', 4], // Child
  ['TE', 5], // Teacher
  ['EL', 6], // Elder
]);

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
  'Uncle',
  'Aunt',
];

interface FamilyMemberDto {
  FamilyMemberId?: string;
  familyMemberId?: string;
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

export const mapRoleValue = (role: number | string | undefined): UserRole => {
  if (typeof role === 'number') {
    switch (role) {
      case 1:
        return UserRole.SUPER_ADMIN;
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
  userId: member.UserId ?? member.userId,
  memberId: member.familyMemberId ?? member.FamilyMemberId ?? member.memberId ?? member.MemberId,
  displayName: member.displayName ?? member.DisplayName ?? undefined,
  name: member.FullName ?? member.fullName ?? member.DisplayName ?? member.displayName ?? '',
  role: mapRoleValue(member.Role ?? member.role),
  linkType: member.LinkType ?? member.linkType ?? '',
  phone: member.PhoneNumber ?? member.phoneNumber,
  avatarUrl: member.AvatarUrl ?? member.avatarUrl,
  age: member.Age ?? member.age,
});

export const FamilyRepository = {
  createFamily: async (name: string, city: string): Promise<Family> => {
    const response = await apiClient.post<ApiResponse<Family>>(MasterApiReference.Families.Root, { familyName: name, city });
    return requireApiData(response.data, 'FamilyRepository.createFamily');
  },

  addMember: async (familyId: string, member: {
    name: string;
    phone: string;
    role: AssignableFamilyRole;
    linkType: string;
  }): Promise<FamilyMember> => {
    const digits = toIndianMobileDigits(member.phone);
    if (!isValidIndianMobile(digits)) {
      throw new Error(INDIAN_MOBILE_ERROR);
    }
    const phoneNumber = toIndianE164(digits);
    if (![...assignableRoleValues.values()].includes(member.role)) {
      throw new Error('Select a valid family role.');
    }

    const response = await apiClient.post<ApiResponse<FamilyMemberDto>>(
      resolvePath(MasterApiReference.Families.Members, { familyId }),
      {
        PhoneNumber: phoneNumber,
        FullName: member.name,
        Role: member.role,
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
    return items.map(mapMemberDto).filter(member => member.role !== UserRole.SUPER_ADMIN);
  },

  updateMember: async (familyId: string, memberId: string, changes: {
    role: AssignableFamilyRole;
    linkType?: string;
    displayName: string;
  }): Promise<FamilyMember> => {
    const response = await apiClient.put<ApiResponse<FamilyMemberDto>>(
      resolvePath(MasterApiReference.Families.Member, { familyId, memberId }),
      changes,
    );
    return mapMemberDto(requireApiData(response.data, 'FamilyRepository.updateMember'));
  },

  removeMember: async (familyId: string, memberId: string): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<boolean>>(
      resolvePath(MasterApiReference.Families.Member, { familyId, memberId }),
    );
    if (!requireApiData(response.data, 'FamilyRepository.removeMember')) {
      throw new Error('The member could not be removed.');
    }
  },

  getRoleOptions: async (): Promise<FamilyInviteRoleOption[]> => {
    const roles = await getMasters('Role');
    const options = roles.flatMap(({ id, name, code }) => {
      const value = assignableRoleValues.get(code.trim().toUpperCase());
      return value === undefined ? [] : [{ id, label: name, value }];
    });
    if (options.length === 0) {
      throw new Error('No assignable family roles are available.');
    }
    return options;
  },

};
