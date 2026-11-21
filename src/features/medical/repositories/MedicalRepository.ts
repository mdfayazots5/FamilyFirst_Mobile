import apiClient from '../../../core/network/apiClient';
import {
  EmergencyOfflineStore, isEmergencyAccessFailure, isEmergencyNetworkFailure, type EmergencyLoad,
} from '../../../core/cache/EmergencyOfflineStore';
import { SecureStorageService } from '../../../core/storage/SecureStorageService';
import { MasterApiReference, resolvePath } from '../../../core/api/MasterApiReference';
import type { ApiResponse } from '../../../core/network/apiTypes';
import { requireApiData } from '../../../core/network/apiTypes';
import type { MasterDataItem } from '../../../core/network/apiTypes';
import { getMasters } from '../../../core/repositories/MasterDataRepository';
export interface MedicalLookupOption {
  id: string;
  label: string;
  code: string;
}

// [VERIFY - candidate master data]
export const BLOOD_GROUP_OPTIONS: readonly string[] =
  ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
// [VERIFY - candidate master data]
export const ALLERGY_CATEGORY_OPTIONS: readonly ('Food' | 'Medication' | 'Environmental')[] =
  ['Food', 'Medication', 'Environmental'];
// [VERIFY - candidate master data]
export const CHRONIC_CONDITION_OPTIONS: readonly string[] =
  ['Asthma', 'Diabetes', 'Epilepsy', 'Heart condition', 'Other'];

const mapLookupItems = (items: MasterDataItem[]): MedicalLookupOption[] =>
  items.map((item) => ({ id: item.id, label: item.name, code: item.code }));

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

export const MedicalRepository = {
  getHealthRecordTypes: async (): Promise<MedicalLookupOption[]> => {
    return mapLookupItems(await getMasters('HealthRecordType'));
  },

  listHealthProfiles: async (familyId: string): Promise<HealthProfileSummary[]> => {
    const response = await apiClient.get<ApiResponse<HealthProfileSummary[]>>(
      resolvePath(MasterApiReference.Medical.HealthProfiles, { familyId }),
    );
    return response.data.data ?? [];
  },

  getHealthProfile: async (familyId: string, memberId: string): Promise<HealthProfile> => {
    const response = await apiClient.get<ApiResponse<HealthProfile>>(
      resolvePath(MasterApiReference.Medical.HealthProfile, { familyId, memberId }),
    );
    return requireApiData(response.data, 'MedicalRepository.getHealthProfile');
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
    const response = await apiClient.put<ApiResponse<HealthProfile>>(
      resolvePath(MasterApiReference.Medical.HealthProfile, { familyId, memberId }),
      data,
    );
    return requireApiData(response.data, 'MedicalRepository.updateHealthProfile');
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
    const response = await apiClient.post<ApiResponse<Medication>>(
      resolvePath(MasterApiReference.Medical.Prescriptions, { familyId, memberId }),
      data,
    );
    return requireApiData(response.data, 'MedicalRepository.addPrescription');
  },

  deletePrescription: async (familyId: string, memberId: string, prescriptionId: string): Promise<void> => {
    await apiClient.delete<ApiResponse<null>>(
      resolvePath(MasterApiReference.Medical.Prescription, { familyId, memberId, prescriptionId }),
    );
  },

  listVaccinations: async (familyId: string, memberId: string): Promise<VaccinationEntry[]> => {
    const response = await apiClient.get<ApiResponse<VaccinationEntry[]>>(
      resolvePath(MasterApiReference.Medical.Vaccinations, { familyId, memberId }),
    );
    return response.data.data ?? [];
  },

  addVaccination: async (
    familyId: string,
    memberId: string,
    data: Omit<VaccinationEntry, 'vaccinationId'>,
  ): Promise<VaccinationEntry> => {
    const response = await apiClient.post<ApiResponse<VaccinationEntry>>(
      resolvePath(MasterApiReference.Medical.Vaccinations, { familyId, memberId }),
      data,
    );
    return requireApiData(response.data, 'MedicalRepository.addVaccination');
  },

  updateVaccinationStatus: async (
    familyId: string,
    memberId: string,
    vaccinationId: string,
    data: { status: string; givenDate?: string },
  ): Promise<VaccinationEntry> => {
    const response = await apiClient.put<ApiResponse<VaccinationEntry>>(
      resolvePath(MasterApiReference.Medical.VaccinationStatus, { familyId, memberId, vaccinationId }),
      data,
    );
    return requireApiData(response.data, 'MedicalRepository.updateVaccinationStatus');
  },

  listTimeline: async (
    familyId: string,
    memberId: string,
    params?: { eventType?: string; fromDate?: string; toDate?: string; page?: number; pageSize?: number },
  ): Promise<{ items: HealthRecord[]; totalCount: number }> => {
    const response = await apiClient.get<ApiResponse<{ items: HealthRecord[]; totalCount: number }>>(
      resolvePath(MasterApiReference.Medical.Timeline, { familyId, memberId }),
      { params },
    );
    return { items: response.data.data?.items ?? [], totalCount: response.data.data?.totalCount ?? 0 };
  },

  getEmergencyCard: async (familyId: string, memberId: string): Promise<EmergencyCard> => {
    return (await MedicalRepository.loadEmergencyCard(familyId, memberId)).data;
  },

  loadEmergencyCard: async (familyId: string, memberId: string): Promise<EmergencyLoad<EmergencyCard>> => {
    const scope = SecureStorageService.getEmergencyCacheScope(familyId);
    try {
      const response = await apiClient.get<ApiResponse<EmergencyCard>>(
        resolvePath(MasterApiReference.Medical.EmergencyCard, { familyId, memberId }),
      );
      const data = requireApiData(response.data, 'MedicalRepository.getEmergencyCard');
      if (scope) await EmergencyOfflineStore.saveCard(scope, memberId, data).catch(() => undefined);
      return { data, fromCache: false };
    } catch (error) {
      if (scope && isEmergencyNetworkFailure(error)) {
        const data = await EmergencyOfflineStore.getCard(scope, memberId).catch(() => undefined);
        if (data) return { data, fromCache: true };
      } else if (scope && isEmergencyAccessFailure(error)) {
        await EmergencyOfflineStore.removeCard(scope, memberId).catch(() => undefined);
      }
      throw error;
    }
  },

  shareEmergencyCard: async (
    familyId: string,
    memberId: string,
    data: { expiryHours?: number; language?: string },
  ): Promise<EmergencyCardShare> => {
    const response = await apiClient.post<ApiResponse<EmergencyCardShare>>(
      resolvePath(MasterApiReference.Medical.ShareEmergencyCard, { familyId, memberId }),
      data,
    );
    return requireApiData(response.data, 'MedicalRepository.shareEmergencyCard');
  },

  getEmergencyCardByToken: async (token: string): Promise<EmergencyCard> => {
    const response = await apiClient.get<ApiResponse<EmergencyCard>>(
      resolvePath(MasterApiReference.Medical.EmergencyCardByToken, { token }),
    );
    return requireApiData(response.data, 'MedicalRepository.getEmergencyCardByToken');
  },

  listHeightWeight: async (familyId: string, memberId: string): Promise<HeightWeightEntry[]> => {
    const response = await apiClient.get<ApiResponse<HeightWeightEntry[]>>(
      resolvePath(MasterApiReference.Medical.HeightWeight, { familyId, memberId }),
    );
    return response.data.data ?? [];
  },

  addHeightWeight: async (
    familyId: string,
    memberId: string,
    data: { recordedDate: string; heightCm?: number; weightKg?: number },
  ): Promise<HeightWeightEntry> => {
    const response = await apiClient.post<ApiResponse<HeightWeightEntry>>(
      resolvePath(MasterApiReference.Medical.HeightWeight, { familyId, memberId }),
      data,
    );
    return requireApiData(response.data, 'MedicalRepository.addHeightWeight');
  },
};
