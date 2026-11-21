import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
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
  /** Display name for a FinanceCategory code (from GetMasters); falls back to the code itself. */
  categoryLabel: (code: string) => string;
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

  const withLoad = useCallback(async (fn: (familyId: string) => Promise<void>) => {
    const familyId = user?.familyId;
    if (!familyId) { setError('Family details are not available.'); return; }
    setIsLoading(true);
    setError(null);
    try { await fn(familyId); }
    catch { setError('Failed to load finance data.'); }
    finally { setIsLoading(false); }
  }, [user?.familyId]);

  const loadDashboard  = useCallback(() => withLoad(async (familyId) => {
    const data = await FinanceRepository.getDashboard(familyId);
    setDashboard(data);
  }), [withLoad, user?.familyId]);

  const loadBudgets    = useCallback(() => withLoad(async (familyId) => {
    const data = await FinanceRepository.getBudgets(familyId);
    setBudgets(data);
  }), [withLoad, user?.familyId]);

  const loadCategories = useCallback(() => withLoad(async (familyId) => {
    const data = await FinanceRepository.getCategoryBreakdown(familyId);
    setCategories(data);
  }), [withLoad, user?.familyId]);

  const loadCommitments = useCallback(() => withLoad(async (familyId) => {
    const data = await FinanceRepository.listCommitments(familyId);
    setCommitments(data);
  }), [withLoad, user?.familyId]);

  const loadSettings   = useCallback(() => withLoad(async (familyId) => {
    const data = await FinanceRepository.getSettings(familyId);
    setSettings(data);
  }), [withLoad, user?.familyId]);

  const clearError = useCallback(() => setError(null), []);

  // Category names are master data (P8). A failed lookup leaves codes as labels rather than blocking the screen.
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>({});
  useEffect(() => {
    let active = true;
    FinanceRepository.getFinanceCategories()
      .then((items) => { if (active) setCategoryNames(Object.fromEntries(items.map((i) => [i.code, i.label]))); })
      .catch(() => { /* labels fall back to the category code */ });
    return () => { active = false; };
  }, []);
  const categoryLabel = useCallback((code: string) => categoryNames[code] ?? code, [categoryNames]);

  return (
    <FinanceContext.Provider value={{
      dashboard, budgets, categories, commitments, settings,
      isLoading, error,
      loadDashboard, loadBudgets, loadCategories, loadCommitments, loadSettings,
      clearError, categoryLabel,
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
