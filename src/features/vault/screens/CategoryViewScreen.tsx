import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Filter, RefreshCw } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { VaultRepository, CATEGORY_LABELS } from '../repositories/VaultRepository';
import type { VaultDocument } from '../repositories/VaultRepository';
import DocumentCard from '../widgets/DocumentCard';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFButton from '../../../shared/components/FFButton';

const CategoryViewScreen: React.FC = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const { user } = useAuth();
  const cat = parseInt(categoryId ?? '1', 10);
  const categoryName = CATEGORY_LABELS[cat] ?? 'Documents';

  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'expiry'>('date');
  const [memberFilter, setMemberFilter] = useState<string | undefined>(undefined);

  const load = async () => {
    if (!user?.familyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await VaultRepository.listDocuments(user.familyId, {
        category: cat, memberId: memberFilter, sortBy, pageSize: 50,
      });
      setDocuments(result.items);
    } catch {
      setError('Failed to load documents.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, [cat, sortBy, memberFilter]);

  return (
    <div className="min-h-screen bg-[#F8F4EE]">
      {/* Header */}
      <div className="bg-[#1A2E4A] px-5 pt-12 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {categoryName}
          </h1>
          <span className="ml-auto text-sm text-blue-200">{documents.length} docs</span>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4 pb-24">
        {/* Sort controls */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {(['date', 'name', 'expiry'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                ${sortBy === s
                  ? 'bg-[#1A2E4A] text-white'
                  : 'bg-white text-gray-600 border border-gray-200'}`}
            >
              {s === 'date' ? 'Newest' : s === 'name' ? 'A–Z' : 'Expiry'}
            </button>
          ))}
        </div>

        {/* Document list */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="w-6 h-6 text-gray-300 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-sm text-red-500 mb-3">{error}</p>
            <FFButton variant="secondary" size="sm" onClick={load}>Retry</FFButton>
          </div>
        ) : documents.length === 0 ? (
          <FFEmptyState
            title={`No ${categoryName} documents yet`}
            subtitle="Upload your first document in this category."
            action={{ label: 'Upload', onClick: () => navigate('/vault/upload') }}
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

      {/* FAB */}
      <button
        onClick={() => navigate('/vault/upload')}
        className="fixed bottom-6 right-5 w-14 h-14 bg-[#C8922A] rounded-full flex items-center justify-center shadow-lg"
      >
        <span className="text-white text-2xl font-light">+</span>
      </button>
    </div>
  );
};

export default CategoryViewScreen;
