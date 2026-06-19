export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  FAMILY_ADMIN = 'FAMILY_ADMIN',
  PARENT = 'PARENT',
  TEACHER = 'TEACHER',
  CHILD = 'CHILD',
  ELDER = 'ELDER',
}

const ROLE_NORMALIZE_MAP: Record<string, UserRole> = {
  SuperAdmin: UserRole.SUPER_ADMIN,
  FamilyAdmin: UserRole.FAMILY_ADMIN,
  Parent: UserRole.PARENT,
  Child: UserRole.CHILD,
  Teacher: UserRole.TEACHER,
  Elder: UserRole.ELDER,
  SUPER_ADMIN: UserRole.SUPER_ADMIN,
  FAMILY_ADMIN: UserRole.FAMILY_ADMIN,
  PARENT: UserRole.PARENT,
  CHILD: UserRole.CHILD,
  TEACHER: UserRole.TEACHER,
  ELDER: UserRole.ELDER,
};

export function normalizeRole(role: string): UserRole {
  return ROLE_NORMALIZE_MAP[role] ?? (role as UserRole);
}
