import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Shield, Plus, Search, AlertTriangle, ShieldAlert, WifiOff,
} from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { VaultProvider, useVault } from '../providers/VaultProvider';
import { VaultRepository, CATEGORY_LABELS } from '../repositories/VaultRepository';
import CategoryTile from '../widgets/CategoryTile';
import DocumentCard from '../widgets/DocumentCard';
import FFButton from '../../../shared/components/FFButton';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFShimmer from '../../../shared/components/FFShimmer';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import FFPageHeader from '../../../shared/components/FFPageHeader';

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

  const countByCategory    = (cat: number) => documents.filter(d => d.category === cat).length;
  const expiringByCategory = (cat: number) => expiringDocuments.filter(d => d.category === cat).length;

  return (
    <div className="min-h-screen bg-bg-cream pb-24">
      {/* Offline banner */}
      {isOffline && (
        <div className="bg-accent text-primary px-4 py-2 flex items-center gap-2 font-body text-sm font-semibold">
          <WifiOff className="w-4 h-4 flex-shrink-0" />
          <span>You're offline. Showing last synced content.</span>
        </div>
      )}

      <FFPageHeader
        title="Document Vault"
        subtitle={user?.familyId ? "Your family's secure document store" : ''}
        rightAction={
          <FFButton
            size="sm"
            variant="accent"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/vault/upload')}
          >
            Upload
          </FFButton>
        }
      />

      <main className="px-4 pt-4 space-y-5 pb-24 page-enter">
        {/* Emergency folder shortcut */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate('/vault/emergency')}
          className="flex items-center gap-3 w-full p-4 bg-alert/5 border border-alert/20 rounded-ff"
        >
          <div className="p-2 bg-alert/10 rounded-xl flex-shrink-0">
            <ShieldAlert className="w-5 h-5 text-alert" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="font-display font-semibold text-sm text-alert">Emergency Folder</p>
            <p className="font-body text-xs text-alert/70">
              {expiringDocuments.filter(d => d.isEmergencyPriority).length} priority docs · Available offline
            </p>
          </div>
          <span className="font-body text-alert/60 text-xs font-medium flex-shrink-0">View →</span>
        </motion.button>

        {/* Expiry alert strip */}
        {expiringDocuments.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-accent/10 border border-accent/20 rounded-ff p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-accent" />
              <p className="font-body font-semibold text-sm text-primary flex-1">
                {expiringDocuments.length} document{expiringDocuments.length > 1 ? 's' : ''} expiring soon
              </p>
              <button
                onClick={() => navigate('/vault/expiry')}
                className="font-body text-xs font-semibold text-accent"
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
                  <AlertTriangle className={`w-3.5 h-3.5 flex-shrink-0 ${doc.expiryStatus === 'Red' ? 'text-alert' : 'text-accent'}`} />
                  <span className="font-body text-xs text-primary truncate">{doc.documentName}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Search shortcut */}
        <button
          onClick={() => navigate('/vault/search')}
          className="flex items-center gap-3 w-full px-4 py-3 bg-white border border-black/5 rounded-ff shadow-card"
        >
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="font-body text-sm text-gray-400">Search documents, members, tags…</span>
        </button>

        {/* Category grid */}
        <div>
          <FFSectionHeader icon={<Shield className="w-[18px] h-[18px]" />} title="Categories" />
          <div className="grid grid-cols-2 gap-3 mt-3">
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
          <FFSectionHeader
            icon={<Shield className="w-[18px] h-[18px]" />}
            title="Recent Uploads"
            rightAction={
              <button onClick={() => navigate('/vault/search')} className="font-body text-xs font-semibold text-accent py-1">
                See all
              </button>
            }
          />
          <div className="mt-3">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => <FFShimmer key={i} className="h-16 rounded-ff" />)}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="font-body text-sm text-alert mb-3">{error}</p>
                <FFButton variant="outline" size="sm" onClick={() => loadDocuments()}>Retry</FFButton>
              </div>
            ) : documents.length === 0 ? (
              <FFEmptyState
                title="Your Document Vault is ready"
                message="Start by uploading your family's most important document."
                actionLabel="Upload Document"
                onAction={() => navigate('/vault/upload')}
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
      </main>
    </div>
  );
};

const VaultHomeScreen: React.FC = () => (
  <VaultProvider>
    <VaultHomeContent />
  </VaultProvider>
);

export default VaultHomeScreen;
