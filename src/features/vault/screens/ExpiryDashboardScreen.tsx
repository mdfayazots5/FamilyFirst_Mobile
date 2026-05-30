import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { VaultRepository } from '../repositories/VaultRepository';
import type { VaultDocument } from '../repositories/VaultRepository';
import DocumentCard from '../widgets/DocumentCard';
import FFEmptyState from '../../../shared/components/FFEmptyState';

const ExpiryDashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.familyId) return;
    VaultRepository.getExpiringDocuments(user.familyId)
      .then(docs => {
        // Sort: Red first, then Amber, then Green
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
    <div className="min-h-screen bg-[#F8F4EE]">
      {/* Header */}
      <div className="bg-[#1A2E4A] px-5 pt-12 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Expiry Dashboard
            </h1>
            <p className="text-xs text-blue-200">Documents expiring within 90 days</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-24 space-y-4">
        {/* Summary tiles */}
        {!isLoading && documents.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <AlertTriangle className="w-5 h-5 text-red-500 mb-2" />
              <p className="text-2xl font-bold text-red-700" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {redCount}
              </p>
              <p className="text-xs text-red-500 mt-0.5">Expiring &lt;30 days</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <Clock className="w-5 h-5 text-amber-500 mb-2" />
              <p className="text-2xl font-bold text-amber-700" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {amberCount}
              </p>
              <p className="text-xs text-amber-500 mt-0.5">Expiring 30–90 days</p>
            </div>
          </div>
        )}

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="w-6 h-6 text-gray-300 animate-spin" />
          </div>
        ) : documents.length === 0 ? (
          <FFEmptyState
            title="All documents are current"
            subtitle="No documents expiring within the next 90 days."
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
      </div>
    </div>
  );
};

export default ExpiryDashboardScreen;
