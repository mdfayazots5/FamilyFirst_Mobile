import apiClient from '../../../core/network/apiClient';
import { AppConfig } from '../../../core/config/appConfig';
import { UserRole } from '../../../core/auth/AuthContext';

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
    const response = await apiClient.post('/families', { familyName: name, city });
    return response.data;
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
    const response = await apiClient.post(`/families/${familyId}/members`, member);
    return response.data;
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
    const response = await apiClient.get(`/families/${familyId}/members`);
    return response.data;
  },

  getJoinCode: async (familyId: string): Promise<{ joinCode: string }> => {
    if (AppConfig.isDemo) return { joinCode: 'DEMO01' };
    const response = await apiClient.get(`/families/${familyId}/join-code`);
    return response.data;
  },

  regenerateJoinCode: async (familyId: string): Promise<{ joinCode: string }> => {
    if (AppConfig.isDemo) return { joinCode: 'NEW123' };
    const response = await apiClient.post(`/families/${familyId}/join-code/regenerate`);
    return response.data;
  }
};
