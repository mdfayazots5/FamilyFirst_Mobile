import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { VaultRepository } from '../repositories/VaultRepository';
import type { VaultDocument } from '../repositories/VaultRepository';
import DocumentCard from '../widgets/DocumentCard';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import FFCard from '../../../shared/components/FFCard';

const ExpiryDashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.familyId) return;
    VaultRepository.getExpiringDocuments(user.familyId)
      .then(docs => {
        const priority = { Red: 0, Amber: 1, Green: 2, None: 3 };
        setDocuments([...docs].sort((a, b) =>
          (priority[a.expiryStatus] ?? 3) - (priority[b.expiryStatus] ?? 3),
        ));
      })
      .finally(() => setIsLoading(false));
  }, [user?.familyId]);

  const redCount   = documents.filter(d => d.expiryStatus === 'Red').length;
  const amberCount = documents.filter(d => d.expiryStatus === 'Amber').length;

  return (
    <div className="min-h-screen bg-bg-cream pb-24">
      <FFPageHeader
        title="Expiry Dashboard"
        subtitle="Documents expiring within 90 days"
        showBack
      />

      <main className="px-4 pt-4 pb-24 space-y-4 page-enter">
        {/* Summary tiles */}
        {!isLoading && documents.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <FFCard className="p-4">
              <AlertTriangle className="w-5 h-5 text-alert mb-2" />
              <p className="font-numbers font-medium text-2xl text-alert tabular-nums">{redCount}</p>
              <p className="font-body text-xs text-gray-400 mt-0.5">Expiring &lt;30 days</p>
            </FFCard>
            <FFCard className="p-4">
              <Clock className="w-5 h-5 text-accent mb-2" />
              <p className="font-numbers font-medium text-2xl text-accent tabular-nums">{amberCount}</p>
              <p className="font-body text-xs text-gray-400 mt-0.5">Expiring 30–90 days</p>
            </FFCard>
          </div>
        )}

        {/* List */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <FFShimmer key={i} className="h-16 rounded-ff" />)}
          </div>
        ) : documents.length === 0 ? (
          <FFEmptyState
            title="All documents are current"
            message="No documents expiring within the next 90 days."
          />
        ) : (
          <div className="space-y-2">
            {documents.map(doc => (
              <DocumentCard
                key={doc.documentId}
                document={doc}
                onClick={() => navigate(`/vault/${doc.documentId}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ExpiryDashboardScreen;
