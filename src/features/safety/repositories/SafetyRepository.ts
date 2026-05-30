import apiClient from '../../../core/network/apiClient';
import { AppConfig } from '../../../core/config/appConfig';

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

const DEMO_MAP: MapView = {
  memberPins: [
    {
      memberId: 'm1', memberName: 'Arjun',
      lastKnownLat: 28.6139, lastKnownLng: 77.2090,
      lastUpdatedAt: new Date(Date.now() - 8 * 60000).toISOString(),
      batteryLevel: 72,
      currentLocationName: 'Delhi Public School, Dwarka',
      isInsideZone: true, zoneType: 'School',
      isStale: false, hasActiveSos: false,
    },
    {
      memberId: 'm3', memberName: 'Zara',
      lastKnownLat: 28.6200, lastKnownLng: 77.1950,
      lastUpdatedAt: new Date(Date.now() - 3 * 60000).toISOString(),
      batteryLevel: 45,
      currentLocationName: 'Home',
      isInsideZone: true, zoneType: 'Home',
      isStale: false, hasActiveSos: false,
    },
  ],
  safeZones: [
    {
      zoneId: 'z1', zoneName: 'Delhi Public School', zoneType: 'School',
      centerLatitude: 28.6139, centerLongitude: 77.2090, radiusMetres: 200,
      alertOnArrival: true, alertOnDeparture: true,
      lateAlertEnabled: true, lateAlertTime: '08:30',
      overrideQuietHours: true, appliedToMemberIds: ['m1', 'm3'],
    },
    {
      zoneId: 'z2', zoneName: 'Home', zoneType: 'Home',
      centerLatitude: 28.6200, centerLongitude: 77.1950, radiusMetres: 100,
      alertOnArrival: false, alertOnDeparture: true,
      lateAlertEnabled: false,
      overrideQuietHours: true, appliedToMemberIds: ['m1', 'm3'],
    },
  ],
};

const DEMO_ALERTS: LocationAlert[] = [
  {
    alertId: 'a1', memberId: 'm1', memberName: 'Arjun',
    alertType: 'ZoneArrival', zoneName: 'Delhi Public School',
    isResolved: false,
    triggeredAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    alertId: 'a2', memberId: 'm3', memberName: 'Zara',
    alertType: 'BatteryWarning',
    isResolved: true, resolvedAt: new Date(Date.now() - 3600000).toISOString(),
    triggeredAt: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
];

export const SafetyRepository = {
  getMapView: async (familyId: string): Promise<MapView> => {
    if (AppConfig.isDemo) return DEMO_MAP;
    const response = await apiClient.get(`/families/${familyId}/safety/map`);
    return response.data.data;
  },

  updateLocation: async (
    familyId: string,
    data: { latitude: number; longitude: number; batteryLevel: number; timestamp: string },
  ): Promise<void> => {
    if (AppConfig.isDemo) return;
    await apiClient.post(`/families/${familyId}/safety/location`, data);
  },

  listZones: async (familyId: string): Promise<SafeZone[]> => {
    if (AppConfig.isDemo) return DEMO_MAP.safeZones;
    const response = await apiClient.get(`/families/${familyId}/safety/zones`);
    return response.data.data;
  },

  createZone: async (familyId: string, data: Omit<SafeZone, 'zoneId'>): Promise<SafeZone> => {
    if (AppConfig.isDemo) return { zoneId: `z-${Date.now()}`, ...data };
    const response = await apiClient.post(`/families/${familyId}/safety/zones`, data);
    return response.data.data;
  },

  updateZone: async (familyId: string, zoneId: string, data: Omit<SafeZone, 'zoneId'>): Promise<SafeZone> => {
    if (AppConfig.isDemo) return { zoneId, ...data };
    const response = await apiClient.put(`/families/${familyId}/safety/zones/${zoneId}`, data);
    return response.data.data;
  },

  deleteZone: async (familyId: string, zoneId: string): Promise<void> => {
    if (AppConfig.isDemo) return;
    await apiClient.delete(`/families/${familyId}/safety/zones/${zoneId}`);
  },

  listAlerts: async (
    familyId: string,
    params?: { memberId?: string; alertType?: string; fromDate?: string; toDate?: string; page?: number },
  ): Promise<{ items: LocationAlert[]; totalCount: number }> => {
    if (AppConfig.isDemo) return { items: DEMO_ALERTS, totalCount: DEMO_ALERTS.length };
    const response = await apiClient.get(`/families/${familyId}/safety/alerts`, { params });
    return { items: response.data.data.items, totalCount: response.data.data.totalCount };
  },

  resolveAlert: async (familyId: string, alertId: string, resolutionNote?: string): Promise<LocationAlert> => {
    if (AppConfig.isDemo) {
      const alert = DEMO_ALERTS.find(a => a.alertId === alertId) ?? DEMO_ALERTS[0];
      return { ...alert, isResolved: true, resolvedAt: new Date().toISOString() };
    }
    const response = await apiClient.put(`/families/${familyId}/safety/alerts/${alertId}/resolve`, { resolutionNote });
    return response.data.data;
  },

  triggerSos: async (
    familyId: string,
    data: { latitude: number; longitude: number; timestamp: string },
  ): Promise<SosEvent> => {
    if (AppConfig.isDemo) {
      return {
        sosEventId: `sos-${Date.now()}`,
        dispatchedAt: new Date().toISOString(),
        latitude: data.latitude,
        longitude: data.longitude,
        alertsSentCount: 2,
      };
    }
    const response = await apiClient.post(`/families/${familyId}/safety/sos`, data);
    return response.data.data;
  },

  getSettings: async (familyId: string): Promise<LocationSettings> => {
    if (AppConfig.isDemo) {
      return {
        globalSharingEnabled: true,
        memberSettings: [
          { memberId: 'm1', memberName: 'Arjun', sharingEnabled: true, consentGiven: true, caregiverViewOnly: false },
          { memberId: 'm3', memberName: 'Zara', sharingEnabled: true, consentGiven: true, caregiverViewOnly: false },
        ],
      };
    }
    const response = await apiClient.get(`/families/${familyId}/safety/settings`);
    return response.data.data;
  },

  updateSettings: async (
    familyId: string,
    data: {
      globalSharingEnabled?: boolean;
      memberSettings: Array<{ memberId: string; sharingEnabled: boolean; caregiverViewOnly: boolean }>;
    },
  ): Promise<LocationSettings> => {
    if (AppConfig.isDemo) return SafetyRepository.getSettings(familyId);
    const response = await apiClient.put(`/families/${familyId}/safety/settings`, data);
    return response.data.data;
  },
};
