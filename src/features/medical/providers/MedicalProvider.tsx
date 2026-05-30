import React, { createContext, useContext, useState, useCallback } from 'react';
import { MedicalRepository, HealthProfileSummary, HealthProfile } from '../repositories/MedicalRepository';
import { useAuth } from '../../../core/auth/AuthContext';

interface MedicalContextType {
  summaries: HealthProfileSummary[];
  isLoading: boolean;
  error: string | null;
  loadSummaries: () => Promise<void>;
  selectedProfile: HealthProfile | null;
  loadProfile: (memberId: string) => Promise<void>;
  clearError: () => void;
}

const MedicalContext = createContext<MedicalContextType | undefined>(undefined);

export const MedicalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [summaries, setSummaries] = useState<HealthProfileSummary[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<HealthProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSummaries = useCallback(async () => {
    if (!user?.familyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await MedicalRepository.listHealthProfiles(user.familyId);
      setSummaries(data);
    } catch {
      setError('Failed to load health profiles. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.familyId]);

  const loadProfile = useCallback(async (memberId: string) => {
    if (!user?.familyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await MedicalRepository.getHealthProfile(user.familyId, memberId);
      setSelectedProfile(data);
    } catch {
      setError('Failed to load health profile.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.familyId]);

  const clearError = useCallback(() => setError(null), []);

  return (
    <MedicalContext.Provider value={{
      summaries, isLoading, error,
      loadSummaries, selectedProfile, loadProfile, clearError,
    }}>
      {children}
    </MedicalContext.Provider>
  );
};

export const useMedical = (): MedicalContextType => {
  const context = useContext(MedicalContext);
  if (!context) throw new Error('useMedical must be used within a MedicalProvider');
  return context;
};
