import apiClient from '../../../core/network/apiClient';
import { AppConfig } from '../../../core/config/appConfig';

export interface AllergyEntry { text: string; category: 'Food' | 'Medication' | 'Environmental'; }

export interface HealthProfileSummary {
  memberId: string;
  memberName: string;
  bloodGroup: string;
  hasAllergies: boolean;
  activeMedicationCount: number;
  nextVaccinationDue?: string;
  isProfileComplete: boolean;
}

export interface Medication {
  prescriptionId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  prescribingDoctor: string;
  startDate: string;
  endDate?: string;
  isRecurring: boolean;
  isArchived: boolean;
  linkedDocumentId?: string;
}

export interface VaccinationEntry {
  vaccinationId: string;
  vaccineName: string;
  status: 'Given' | 'Due' | 'Overdue' | 'NotApplicable';
  givenDate?: string;
  dueDate?: string;
  linkedDocumentId?: string;
}

export interface HealthProfile {
  healthProfileId: string;
  memberId: string;
  memberName: string;
  bloodGroup: string;
  knownAllergies: AllergyEntry[];
  chronicConditions: string[];
  primaryDoctor?: { name: string; phone?: string };
  emergencyContact?: { name: string; relationship?: string; phone?: string };
  organDonor: boolean;
  currentMedications: Medication[];
  vaccinationStatus: VaccinationEntry[];
  isProfileComplete: boolean;
  lastUpdated: string;
}

export interface HealthRecord {
  healthRecordId: string;
  eventType: string;
  eventDate: string;
  title: string;
  notes?: string;
  linkedDocumentId?: string;
}

export interface EmergencyCard {
  memberId: string;
  memberName: string;
  memberPhotoUrl?: string;
  ageYears?: number;
  bloodGroup: string;
  knownAllergies: AllergyEntry[];
  currentMedications: { medicationName: string; dosage: string }[];
  primaryDoctorName?: string;
  primaryDoctorPhone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  organDonor: boolean;
  isProfileComplete: boolean;
}

export interface EmergencyCardShare {
  shareLink: string;
  qrCodeData: string;
  shareableImageUrl?: string;
  expiresAt: string;
}

export interface HeightWeightEntry {
  heightWeightRecordId: string;
  recordedDate: string;
  heightCm?: number;
  weightKg?: number;
}

const DEMO_PROFILE: HealthProfile = {
  healthProfileId: 'hp-1',
  memberId: 'm1',
  memberName: 'Arjun',
  bloodGroup: 'B+',
  knownAllergies: [
    { text: 'Penicillin', category: 'Medication' },
    { text: 'Peanuts', category: 'Food' },
  ],
  chronicConditions: ['Asthma'],
  primaryDoctor: { name: 'Dr. Priya Nair', phone: '+91 98765 12345' },
  emergencyContact: { name: 'Amina Sharma', relationship: 'Mother', phone: '+91 98765 43210' },
  organDonor: false,
  currentMedications: [
    {
      prescriptionId: 'rx-1', medicationName: 'Salbutamol', dosage: '100mcg',
      frequency: 'As needed', prescribingDoctor: 'Dr. Priya Nair',
      startDate: '2025-01-15', isRecurring: false, isArchived: false,
    },
  ],
  vaccinationStatus: [
    { vaccinationId: 'v-1', vaccineName: 'MMR', status: 'Given', givenDate: '2023-06-01' },
    { vaccinationId: 'v-2', vaccineName: 'Hepatitis B Booster', status: 'Due',
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0] },
    { vaccinationId: 'v-3', vaccineName: 'Varicella', status: 'Given', givenDate: '2022-03-10' },
  ],
  isProfileComplete: true,
  lastUpdated: new Date(Date.now() - 86400000 * 2).toISOString(),
};

const DEMO_SUMMARIES: HealthProfileSummary[] = [
  {
    memberId: 'm1', memberName: 'Arjun', bloodGroup: 'B+',
    hasAllergies: true, activeMedicationCount: 1,
    nextVaccinationDue: new Date(Date.now() + 14 * 86400000).toISOString(),
    isProfileComplete: true,
  },
  {
    memberId: 'm2', memberName: 'Priya', bloodGroup: 'O+',
    hasAllergies: false, activeMedicationCount: 0,
    isProfileComplete: false,
  },
  {
    memberId: 'm3', memberName: 'Zara', bloodGroup: 'A+',
    hasAllergies: false, activeMedicationCount: 0,
    isProfileComplete: false,
  },
];

export const MedicalRepository = {
  listHealthProfiles: async (familyId: string): Promise<HealthProfileSummary[]> => {
    if (AppConfig.isDemo) return DEMO_SUMMARIES;
    const response = await apiClient.get(`/families/${familyId}/health-profiles`);
    return response.data.data;
  },

  getHealthProfile: async (familyId: string, memberId: string): Promise<HealthProfile> => {
    if (AppConfig.isDemo) return { ...DEMO_PROFILE, memberId };
    const response = await apiClient.get(`/families/${familyId}/health-profiles/${memberId}`);
    return response.data.data;
  },

  updateHealthProfile: async (
    familyId: string,
    memberId: string,
    data: Partial<{
      bloodGroup: string;
      knownAllergies: AllergyEntry[];
      chronicConditions: string[];
      primaryDoctorName: string;
      primaryDoctorPhone: string;
      emergencyContactName: string;
      emergencyContactRelationship: string;
      emergencyContactPhone: string;
      organDonor: boolean;
    }>,
  ): Promise<HealthProfile> => {
    if (AppConfig.isDemo) return { ...DEMO_PROFILE, ...data } as HealthProfile;
    const response = await apiClient.put(`/families/${familyId}/health-profiles/${memberId}`, data);
    return response.data.data;
  },

  addPrescription: async (
    familyId: string,
    memberId: string,
    data: {
      medicationName: string; dosage: string; frequency: string;
      prescribingDoctor: string; startDate: string; endDate?: string;
      isRecurring: boolean; linkedDocumentId?: string;
    },
  ): Promise<Medication> => {
    if (AppConfig.isDemo) {
      return { prescriptionId: `rx-${Date.now()}`, isArchived: false, ...data };
    }
    const response = await apiClient.post(`/families/${familyId}/health-profiles/${memberId}/prescriptions`, data);
    return response.data.data;
  },

  deletePrescription: async (familyId: string, memberId: string, prescriptionId: string): Promise<void> => {
    if (AppConfig.isDemo) return;
    await apiClient.delete(`/families/${familyId}/health-profiles/${memberId}/prescriptions/${prescriptionId}`);
  },

  listVaccinations: async (familyId: string, memberId: string): Promise<VaccinationEntry[]> => {
    if (AppConfig.isDemo) return DEMO_PROFILE.vaccinationStatus;
    const response = await apiClient.get(`/families/${familyId}/health-profiles/${memberId}/vaccinations`);
    return response.data.data;
  },

  addVaccination: async (
    familyId: string,
    memberId: string,
    data: Omit<VaccinationEntry, 'vaccinationId'>,
  ): Promise<VaccinationEntry> => {
    if (AppConfig.isDemo) return { vaccinationId: `v-${Date.now()}`, ...data };
    const response = await apiClient.post(`/families/${familyId}/health-profiles/${memberId}/vaccinations`, data);
    return response.data.data;
  },

  updateVaccinationStatus: async (
    familyId: string,
    memberId: string,
    vaccinationId: string,
    data: { status: string; givenDate?: string },
  ): Promise<VaccinationEntry> => {
    if (AppConfig.isDemo) {
      const v = DEMO_PROFILE.vaccinationStatus.find(x => x.vaccinationId === vaccinationId)
        ?? DEMO_PROFILE.vaccinationStatus[0];
      return { ...v, ...data } as VaccinationEntry;
    }
    const response = await apiClient.put(
      `/families/${familyId}/health-profiles/${memberId}/vaccinations/${vaccinationId}/status`, data,
    );
    return response.data.data;
  },

  listTimeline: async (
    familyId: string,
    memberId: string,
    params?: { eventType?: string; fromDate?: string; toDate?: string; page?: number; pageSize?: number },
  ): Promise<{ items: HealthRecord[]; totalCount: number }> => {
    if (AppConfig.isDemo) {
      return {
        items: [
          { healthRecordId: 'hr-1', eventType: 'Prescription', eventDate: '2025-01-15',
            title: 'Prescription: Salbutamol 100mcg' },
          { healthRecordId: 'hr-2', eventType: 'Vaccination', eventDate: '2023-06-01',
            title: 'Vaccination: MMR' },
          { healthRecordId: 'hr-3', eventType: 'DoctorNote', eventDate: '2024-08-20',
            title: 'Dr. Nair: Asthma follow-up', notes: 'Good progress. Continue inhaler.' },
        ],
        totalCount: 3,
      };
    }
    const response = await apiClient.get(
      `/families/${familyId}/health-profiles/${memberId}/timeline`, { params },
    );
    return { items: response.data.data.items, totalCount: response.data.data.totalCount };
  },

  getEmergencyCard: async (familyId: string, memberId: string): Promise<EmergencyCard> => {
    if (AppConfig.isDemo) {
      return {
        memberId: 'm1', memberName: 'Arjun', bloodGroup: 'B+',
        knownAllergies: DEMO_PROFILE.knownAllergies,
        currentMedications: [{ medicationName: 'Salbutamol', dosage: '100mcg' }],
        primaryDoctorName: 'Dr. Priya Nair', primaryDoctorPhone: '+91 98765 12345',
        emergencyContactName: 'Amina Sharma', emergencyContactPhone: '+91 98765 43210',
        organDonor: false, isProfileComplete: true,
      };
    }
    const response = await apiClient.get(`/families/${familyId}/health-profiles/${memberId}/emergency-card`);
    return response.data.data;
  },

  shareEmergencyCard: async (
    familyId: string,
    memberId: string,
    data: { expiryHours?: number; language?: string },
  ): Promise<EmergencyCardShare> => {
    if (AppConfig.isDemo) {
      return {
        shareLink: `/medical/emergency-card/demo-token-${Date.now()}`,
        qrCodeData: `/medical/emergency-card/demo-token-${Date.now()}`,
        expiresAt: new Date(Date.now() + 72 * 3600000).toISOString(),
      };
    }
    const response = await apiClient.post(
      `/families/${familyId}/health-profiles/${memberId}/emergency-card/share`, data,
    );
    return response.data.data;
  },

  getEmergencyCardByToken: async (token: string): Promise<EmergencyCard> => {
    if (AppConfig.isDemo) {
      return {
        memberId: 'm1', memberName: 'Arjun', bloodGroup: 'B+',
        knownAllergies: DEMO_PROFILE.knownAllergies,
        currentMedications: [{ medicationName: 'Salbutamol', dosage: '100mcg' }],
        primaryDoctorName: 'Dr. Priya Nair', primaryDoctorPhone: '+91 98765 12345',
        emergencyContactName: 'Amina Sharma', emergencyContactPhone: '+91 98765 43210',
        organDonor: false, isProfileComplete: true,
      };
    }
    const response = await apiClient.get(`/medical/emergency-card/${token}`);
    return response.data.data;
  },

  listHeightWeight: async (familyId: string, memberId: string): Promise<HeightWeightEntry[]> => {
    if (AppConfig.isDemo) {
      return [
        { heightWeightRecordId: 'hw-1', recordedDate: '2025-03-01', heightCm: 142, weightKg: 36.5 },
        { heightWeightRecordId: 'hw-2', recordedDate: '2024-09-15', heightCm: 138, weightKg: 34.2 },
      ];
    }
    const response = await apiClient.get(`/families/${familyId}/health-profiles/${memberId}/height-weight`);
    return response.data.data;
  },

  addHeightWeight: async (
    familyId: string,
    memberId: string,
    data: { recordedDate: string; heightCm?: number; weightKg?: number },
  ): Promise<HeightWeightEntry> => {
    if (AppConfig.isDemo) return { heightWeightRecordId: `hw-${Date.now()}`, ...data };
    const response = await apiClient.post(
      `/families/${familyId}/health-profiles/${memberId}/height-weight`, data,
    );
    return response.data.data;
  },
};
