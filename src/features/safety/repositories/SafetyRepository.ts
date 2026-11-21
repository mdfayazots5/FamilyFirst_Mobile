import apiClient from '../../../core/network/apiClient';
import { MasterApiReference, resolvePath } from '../../../core/api/MasterApiReference';
import type { ApiResponse } from '../../../core/network/apiTypes';
import { requireApiData } from '../../../core/network/apiTypes';
import type { MasterDataItem } from '../../../core/network/apiTypes';
import { getMasters } from '../../../core/repositories/MasterDataRepository';
export interface SafetyLookupOption {
  id: string;
  label: string;
  code: string;
}

// [VERIFY - candidate master data]
export const SAFETY_ALERT_FILTER_OPTIONS: readonly string[] =
  ['All', 'ZoneArrival', 'ZoneDeparture', 'LateAlert', 'SOS', 'BatteryWarning'];

const mapLookupItems = (items: MasterDataItem[]): SafetyLookupOption[] =>
  items.map((item) => ({ id: item.id, label: item.name, code: item.code }));

export interface MemberPin {
  memberId: string;
  memberName: string;
  photoUrl?: string;
  lastKnownLat?: number;
  lastKnownLng?: number;
  lastUpdatedAt?: string;
  batteryLevel?: number;
  currentLocationName?: string;
  isInsideZone: boolean;
  zoneType?: string;
  isStale: boolean;
  hasActiveSos: boolean;
}

export interface SafeZone {
  zoneId: string;
  zoneName: string;
  zoneType: string;
  centerLatitude: number;
  centerLongitude: number;
  radiusMetres: number;
  alertOnArrival: boolean;
  alertOnDeparture: boolean;
  lateAlertEnabled: boolean;
  lateAlertTime?: string;
  overrideQuietHours: boolean;
  appliedToMemberIds: string[];
}

export interface MapView {
  memberPins: MemberPin[];
  safeZones: SafeZone[];
}

export interface LocationAlert {
  alertId: string;
  memberId: string;
  memberName: string;
  alertType: string;
  zoneName?: string;
  latitude?: number;
  longitude?: number;
  isResolved: boolean;
  resolvedAt?: string;
  resolutionNote?: string;
  triggeredAt: string;
}

export interface SosEvent {
  sosEventId: string;
  dispatchedAt: string;
  latitude: number;
  longitude: number;
  alertsSentCount: number;
}

export interface MemberLocationSetting {
  memberId: string;
  memberName: string;
  sharingEnabled: boolean;
  consentGiven: boolean;
  caregiverViewOnly: boolean;
  lastUpdatedAt?: string;
}

export interface LocationSettings {
  globalSharingEnabled: boolean;
  memberSettings: MemberLocationSetting[];
}

export const SafetyRepository = {
  getSafeZoneTypes: async (): Promise<SafetyLookupOption[]> => {
    return mapLookupItems(await getMasters('SafeZoneType'));
  },

  getMapView: async (familyId: string): Promise<MapView> => {
    const response = await apiClient.get<ApiResponse<MapView>>(
      resolvePath(MasterApiReference.Safety.Map, { familyId }),
    );
    return requireApiData(response.data, 'SafetyRepository.getMapView');
  },

  updateLocation: async (
    familyId: string,
    data: { latitude: number; longitude: number; batteryLevel: number; timestamp: string },
  ): Promise<void> => {
    await apiClient.post<ApiResponse<null>>(
      resolvePath(MasterApiReference.Safety.Location, { familyId }),
      data,
    );
  },

  listZones: async (familyId: string): Promise<SafeZone[]> => {
    const response = await apiClient.get<ApiResponse<SafeZone[]>>(
      resolvePath(MasterApiReference.Safety.Zones, { familyId }),
    );
    return response.data.data ?? [];
  },

  createZone: async (familyId: string, data: Omit<SafeZone, 'zoneId'>): Promise<SafeZone> => {
    const response = await apiClient.post<ApiResponse<SafeZone>>(
      resolvePath(MasterApiReference.Safety.Zones, { familyId }),
      data,
    );
    return requireApiData(response.data, 'SafetyRepository.createZone');
  },

  updateZone: async (familyId: string, zoneId: string, data: Omit<SafeZone, 'zoneId'>): Promise<SafeZone> => {
    const response = await apiClient.put<ApiResponse<SafeZone>>(
      resolvePath(MasterApiReference.Safety.Zone, { familyId, zoneId }),
      data,
    );
    return requireApiData(response.data, 'SafetyRepository.updateZone');
  },

  deleteZone: async (familyId: string, zoneId: string): Promise<void> => {
    await apiClient.delete<ApiResponse<null>>(
      resolvePath(MasterApiReference.Safety.Zone, { familyId, zoneId }),
    );
  },

  listAlerts: async (
    familyId: string,
    params?: { memberId?: string; alertType?: string; fromDate?: string; toDate?: string; page?: number },
  ): Promise<{ items: LocationAlert[]; totalCount: number }> => {
    const response = await apiClient.get<ApiResponse<{ items: LocationAlert[]; totalCount: number }>>(
      resolvePath(MasterApiReference.Safety.Alerts, { familyId }),
      { params },
    );
    return { items: response.data.data?.items ?? [], totalCount: response.data.data?.totalCount ?? 0 };
  },

  resolveAlert: async (familyId: string, alertId: string, resolutionNote?: string): Promise<LocationAlert> => {
    const response = await apiClient.put<ApiResponse<LocationAlert>>(
      resolvePath(MasterApiReference.Safety.ResolveAlert, { familyId, alertId }),
      { resolutionNote },
    );
    return requireApiData(response.data, 'SafetyRepository.resolveAlert');
  },

  triggerSos: async (
    familyId: string,
    data: { latitude: number; longitude: number; timestamp: string },
  ): Promise<SosEvent> => {
    const response = await apiClient.post<ApiResponse<SosEvent>>(
      resolvePath(MasterApiReference.Safety.Sos, { familyId }),
      data,
    );
    return requireApiData(response.data, 'SafetyRepository.triggerSos');
  },

  getSettings: async (familyId: string): Promise<LocationSettings> => {
    const response = await apiClient.get<ApiResponse<LocationSettings>>(
      resolvePath(MasterApiReference.Safety.Settings, { familyId }),
    );
    return requireApiData(response.data, 'SafetyRepository.getSettings');
  },

  updateSettings: async (
    familyId: string,
    data: {
      globalSharingEnabled?: boolean;
      memberSettings: Array<{ memberId: string; sharingEnabled: boolean; caregiverViewOnly: boolean }>;
    },
  ): Promise<LocationSettings> => {
    const response = await apiClient.put<ApiResponse<LocationSettings>>(
      resolvePath(MasterApiReference.Safety.Settings, { familyId }),
      data,
    );
    return requireApiData(response.data, 'SafetyRepository.updateSettings');
  },
};
