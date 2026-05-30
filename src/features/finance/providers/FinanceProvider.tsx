import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from '../../../core/auth/AuthContext';
import {
  FinanceRepository,
  FinanceDashboard,
  BudgetItem,
  CategorySpend,
  Commitment,
  FinanceSettings,
} from '../repositories/FinanceRepository';

interface FinanceContextType {
  dashboard: FinanceDashboard | null;
  budgets: BudgetItem[];
  categories: CategorySpend[];
  commitments: Commitment[];
  settings: FinanceSettings | null;
  isLoading: boolean;
  error: string | null;
  loadDashboard: () => Promise<void>;
  loadBudgets: () => Promise<void>;
  loadCategories: () => Promise<void>;
  loadCommitments: () => Promise<void>;
  loadSettings: () => Promise<void>;
  clearError: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [dashboard,    setDashboard]    = useState<FinanceDashboard | null>(null);
  const [budgets,      setBudgets]      = useState<BudgetItem[]>([]);
  const [categories,   setCategories]   = useState<CategorySpend[]>([]);
  const [commitments,  setCommitments]  = useState<Commitment[]>([]);
  const [settings,     setSettings]     = useState<FinanceSettings | null>(null);
  const [isLoading,    setIsLoading]    = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  const withLoad = useCallback(async (fn: () => Promise<void>) => {
    if (!user?.familyId) return;
    setIsLoading(true);
    setError(null);
    try { await fn(); }
    catch { setError('Failed to load finance data.'); }
    finally { setIsLoading(false); }
  }, [user?.familyId]);

  const loadDashboard  = useCallback(() => withLoad(async () => {
    const data = await FinanceRepository.getDashboard(user!.familyId!);
    setDashboard(data);
  }), [withLoad, user?.familyId]);

  const loadBudgets    = useCallback(() => withLoad(async () => {
    const data = await FinanceRepository.getBudgets(user!.familyId!);
    setBudgets(data);
  }), [withLoad, user?.familyId]);

  const loadCategories = useCallback(() => withLoad(async () => {
    const data = await FinanceRepository.getCategoryBreakdown(user!.familyId!);
    setCategories(data);
  }), [withLoad, user?.familyId]);

  const loadCommitments = useCallback(() => withLoad(async () => {
    const data = await FinanceRepository.listCommitments(user!.familyId!);
    setCommitments(data);
  }), [withLoad, user?.familyId]);

  const loadSettings   = useCallback(() => withLoad(async () => {
    const data = await FinanceRepository.getSettings(user!.familyId!);
    setSettings(data);
  }), [withLoad, user?.familyId]);

  const clearError = useCallback(() => setError(null), []);

  return (
    <FinanceContext.Provider value={{
      dashboard, budgets, categories, commitments, settings,
      isLoading, error,
      loadDashboard, loadBudgets, loadCategories, loadCommitments, loadSettings,
      clearError,
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = (): FinanceContextType => {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within a FinanceProvider');
  return ctx;
};
