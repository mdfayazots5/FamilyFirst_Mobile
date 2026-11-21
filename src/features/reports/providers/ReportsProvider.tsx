import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from '../../../core/auth/AuthContext';
import { ReportsRepository, WeeklyDigest, AttendanceSummary, ScoreHistoryPoint } from '../repositories/ReportsRepository';
import { logger } from '../../../core/services/logger';

interface ReportsContextType {
  weeklyDigest: WeeklyDigest | null;
  isLoading: boolean;
  fetchWeeklyDigest: (weekStartDate: string) => Promise<void>;
  /** from / to: yyyy-mm-dd. Rejects when the user has no family. */
  fetchAttendanceSummary: (childId: string, from: string, to: string) => Promise<AttendanceSummary>;
  /** Rejects when the user has no family. */
  fetchScoreHistory: (childId: string) => Promise<ScoreHistoryPoint[]>;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

export const ReportsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [weeklyDigest, setWeeklyDigest] = useState<WeeklyDigest | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWeeklyDigest = useCallback(async (weekStartDate: string) => {
    if (!user?.familyId) return;
    setIsLoading(true);
    try {
      const data = await ReportsRepository.getWeeklyDigest(user.familyId, weekStartDate);
      setWeeklyDigest(data);
    } catch (error) {
      logger.error('Failed to fetch weekly digest', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.familyId]);

  const fetchAttendanceSummary = useCallback(async (childId: string, from: string, to: string) => {
    if (!user?.familyId) throw new Error('No family selected');
    return await ReportsRepository.getAttendanceSummary(user.familyId, childId, from, to);
  }, [user?.familyId]);

  const fetchScoreHistory = useCallback(async (childId: string) => {
    if (!user?.familyId) throw new Error('No family selected');
    return await ReportsRepository.getScoreHistory(user.familyId, childId);
  }, [user?.familyId]);

  return (
    <ReportsContext.Provider value={{ 
      weeklyDigest, 
      isLoading, 
      fetchWeeklyDigest, 
      fetchAttendanceSummary, 
      fetchScoreHistory 
    }}>
      {children}
    </ReportsContext.Provider>
  );
};

export const useReports = () => {
  const context = useContext(ReportsContext);
  if (context === undefined) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
};
