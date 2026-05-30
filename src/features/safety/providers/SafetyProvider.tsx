import React, { createContext, useContext, useState, useCallback } from 'react';
import { SafetyRepository, MapView, LocationAlert, SafeZone } from '../repositories/SafetyRepository';
import { useAuth } from '../../../core/auth/AuthContext';

interface SafetyContextType {
  mapView: MapView | null;
  alerts: LocationAlert[];
  zones: SafeZone[];
  isLoading: boolean;
  error: string | null;
  loadMapView: () => Promise<void>;
  loadAlerts: () => Promise<void>;
  loadZones: () => Promise<void>;
  resolveAlert: (alertId: string, note?: string) => Promise<void>;
  clearError: () => void;
}

const SafetyContext = createContext<SafetyContextType | undefined>(undefined);

export const SafetyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [mapView, setMapView]   = useState<MapView | null>(null);
  const [alerts, setAlerts]     = useState<LocationAlert[]>([]);
  const [zones, setZones]       = useState<SafeZone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const loadMapView = useCallback(async () => {
    if (!user?.familyId) return;
    setIsLoading(true);
    try {
      const data = await SafetyRepository.getMapView(user.familyId);
      setMapView(data);
    } catch {
      setError('Failed to load map view.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.familyId]);

  const loadAlerts = useCallback(async () => {
    if (!user?.familyId) return;
    setIsLoading(true);
    try {
      const { items } = await SafetyRepository.listAlerts(user.familyId);
      setAlerts(items);
    } catch {
      setError('Failed to load alerts.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.familyId]);

  const loadZones = useCallback(async () => {
    if (!user?.familyId) return;
    try {
      const data = await SafetyRepository.listZones(user.familyId);
      setZones(data);
    } catch {
      // non-critical
    }
  }, [user?.familyId]);

  const resolveAlert = useCallback(async (alertId: string, note?: string) => {
    if (!user?.familyId) return;
    await SafetyRepository.resolveAlert(user.familyId, alertId, note);
    setAlerts(prev => prev.map(a => a.alertId === alertId ? { ...a, isResolved: true } : a));
  }, [user?.familyId]);

  const clearError = useCallback(() => setError(null), []);

  return (
    <SafetyContext.Provider value={{
      mapView, alerts, zones, isLoading, error,
      loadMapView, loadAlerts, loadZones, resolveAlert, clearError,
    }}>
      {children}
    </SafetyContext.Provider>
  );
};

export const useSafety = (): SafetyContextType => {
  const context = useContext(SafetyContext);
  if (!context) throw new Error('useSafety must be used within a SafetyProvider');
  return context;
};
