import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Shield, Plus, Search, AlertTriangle, Zap, RefreshCw, WifiOff,
} from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { VaultProvider, useVault } from '../providers/VaultProvider';
import { VaultRepository, CATEGORY_LABELS } from '../repositories/VaultRepository';
import CategoryTile from '../widgets/CategoryTile';
import DocumentCard from '../widgets/DocumentCard';
import FFButton from '../../../shared/components/FFButton';
import FFEmptyState from '../../../shared/components/FFEmptyState';

const CATEGORIES = [1, 2, 3, 4, 5, 6, 7, 8] as const;

const VaultHomeContent: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { documents, isLoading, error, expiringDocuments, loadDocuments, loadExpiringDocuments } = useVault();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    loadDocuments({ pageSize: 5, sortBy: 'date' });
    loadExpiringDocuments();
  }, [loadDocuments, loadExpiringDocuments]);

  useEffect(() => {
    const handleOnline  = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const countByCategory = (cat: number) => documents.filter(d => d.category === cat).length;
  const expiringByCategory = (cat: number) =>
    expiringDocuments.filter(d => d.category === cat).length;

  return (
    <div className="min-h-screen bg-[#F8F4EE]">
      {/* Offline banner */}
      {isOffline && (
        <div className="bg-amber-500 text-white px-4 py-2 flex items-center gap-2 text-sm">
          <WifiOff className="w-4 h-4" />
          <span>You're offline. Showing last synced content.</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#1A2E4A] px-5 pt-12 pb-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#C8922A]" />
            <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Document Vault
            </h1>
          </div>
          <button
            onClick={() => navigate('/vault/upload')}
            className="flex items-center gap-1.5 bg-[#C8922A] text-white px-3 py-1.5 rounded-xl text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            Upload
          </button>
        </div>
        <p className="text-blue-200 text-xs mt-1">
          {user?.familyId ? 'Your family's secure document store' : ''}
        </p>
      </div>

      <div className="px-4 pt-4 space-y-5 pb-24">
        {/* Emergency folder shortcut */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate('/vault/emergency')}
          className="flex items-center gap-3 w-full p-4 bg-red-50 border border-red-200 rounded-2xl"
        >
          <div className="p-2 bg-red-100 rounded-xl">
            <Zap className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold text-red-700">Emergency Folder</p>
            <p className="text-xs text-red-500">
              {expiringDocuments.filter(d => d.isEmergencyPriority).length} priority docs · Available offline
            </p>
          </div>
          <span className="text-red-400 text-xs font-medium">View →</span>
        </motion.button>

        {/* Expiry alert strip */}
        {expiringDocuments.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <p className="text-sm font-semibold text-amber-800">
                {expiringDocuments.length} document{expiringDocuments.length > 1 ? 's' : ''} expiring soon
              </p>
              <button
                onClick={() => navigate('/vault/expiry')}
                className="ml-auto text-xs font-medium text-amber-700 underline"
              >
                See all
              </button>
            </div>
            <div className="space-y-2">
              {expiringDocuments.slice(0, 2).map(doc => (
                <button
                  key={doc.documentId}
                  onClick={() => navigate(`/vault/${doc.documentId}`)}
                  className="flex items-center gap-2 w-full text-left"
                >
                  <AlertTriangle className={`w-3.5 h-3.5 flex-shrink-0 ${doc.expiryStatus === 'Red' ? 'text-red-500' : 'text-amber-500'}`} />
                  <span className="text-xs text-gray-700 truncate">{doc.documentName}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Search shortcut */}
        <button
          onClick={() => navigate('/vault/search')}
          className="flex items-center gap-3 w-full px-4 py-3 bg-white rounded-2xl shadow-sm border border-gray-100"
        >
          <Search className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">Search documents, members, tags…</span>
        </button>

        {/* Category grid */}
        <div>
          <h2 className="text-sm font-bold text-[#1A2E4A] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Categories
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map(cat => (
              <CategoryTile
                key={cat}
                category={cat}
                categoryName={CATEGORY_LABELS[cat]}
                documentCount={countByCategory(cat)}
                expiringCount={expiringByCategory(cat)}
                onClick={() => navigate(`/vault/category/${cat}`)}
              />
            ))}
          </div>
        </div>

        {/* Recent uploads */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#1A2E4A]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Recent Uploads
            </h2>
            <button
              onClick={() => navigate('/vault/search')}
              className="text-xs text-[#C8922A] font-medium"
            >
              See all
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-6 h-6 text-gray-300 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-sm text-red-500 mb-3">{error}</p>
              <FFButton variant="secondary" size="sm" onClick={() => loadDocuments()}>Retry</FFButton>
            </div>
          ) : documents.length === 0 ? (
            <FFEmptyState
              title="Your Document Vault is ready"
              subtitle="Start by uploading your family's most important document."
              action={{ label: 'Upload Document', onClick: () => navigate('/vault/upload') }}
            />
          ) : (
            <div className="space-y-2">
              {documents.slice(0, 5).map(doc => (
                <DocumentCard
                  key={doc.documentId}
                  document={doc}
                  onClick={() => navigate(`/vault/${doc.documentId}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const VaultHomeScreen: React.FC = () => (
  <VaultProvider>
    <VaultHomeContent />
  </VaultProvider>
);

export default VaultHomeScreen;
