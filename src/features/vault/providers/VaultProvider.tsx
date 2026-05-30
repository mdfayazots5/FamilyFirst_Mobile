import React, { createContext, useContext, useState, useCallback } from 'react';
import { VaultRepository, VaultDocument, PaginatedDocuments } from '../repositories/VaultRepository';
import { useAuth } from '../../../core/auth/AuthContext';

interface VaultContextType {
  documents: VaultDocument[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  expiringDocuments: VaultDocument[];
  loadDocuments: (params?: {
    category?: number;
    memberId?: string;
    search?: string;
    expiryStatus?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
  }) => Promise<void>;
  loadExpiringDocuments: () => Promise<void>;
  deleteDocument: (documentId: string) => Promise<void>;
  clearError: () => void;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expiringDocuments, setExpiringDocuments] = useState<VaultDocument[]>([]);

  const loadDocuments = useCallback(async (params?: Parameters<VaultContextType['loadDocuments']>[0]) => {
    if (!user?.familyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const result: PaginatedDocuments = await VaultRepository.listDocuments(user.familyId, params);
      setDocuments(result.items);
      setTotalCount(result.totalCount);
    } catch {
      setError('Failed to load documents. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.familyId]);

  const loadExpiringDocuments = useCallback(async () => {
    if (!user?.familyId) return;
    try {
      const docs = await VaultRepository.getExpiringDocuments(user.familyId);
      setExpiringDocuments(docs);
    } catch {
      // non-critical — expiry strip is supplementary
    }
  }, [user?.familyId]);

  const deleteDocument = useCallback(async (documentId: string) => {
    if (!user?.familyId) return;
    await VaultRepository.deleteDocument(user.familyId, documentId);
    setDocuments(prev => prev.filter(d => d.documentId !== documentId));
    setTotalCount(prev => prev - 1);
  }, [user?.familyId]);

  const clearError = useCallback(() => setError(null), []);

  return (
    <VaultContext.Provider value={{
      documents, totalCount, isLoading, error, expiringDocuments,
      loadDocuments, loadExpiringDocuments, deleteDocument, clearError,
    }}>
      {children}
    </VaultContext.Provider>
  );
};

export const useVault = (): VaultContextType => {
  const context = useContext(VaultContext);
  if (!context) throw new Error('useVault must be used within a VaultProvider');
  return context;
};
