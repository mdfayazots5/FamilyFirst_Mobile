import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Filter, Plus } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { VaultRepository, CATEGORY_LABELS } from '../repositories/VaultRepository';
import type { VaultDocument } from '../repositories/VaultRepository';
import DocumentCard from '../widgets/DocumentCard';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFButton from '../../../shared/components/FFButton';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFShimmer from '../../../shared/components/FFShimmer';

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

  const load = async () => {
    if (!user?.familyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await VaultRepository.listDocuments(user.familyId, {
        category: cat, sortBy, pageSize: 50,
      });
      setDocuments(result.items);
    } catch {
      setError('Failed to load documents.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, [cat, sortBy]);

  return (
    <div className="min-h-screen bg-bg-cream pb-24">
      <FFPageHeader
        title={categoryName}
        subtitle={documents.length > 0 ? `${documents.length} document${documents.length !== 1 ? 's' : ''}` : undefined}
        showBack
        rightAction={
          <FFButton size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/vault/upload')}>
            Add
          </FFButton>
        }
      />

      <main className="px-4 pt-4 space-y-4 pb-24 page-enter">
        {/* Sort controls */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {(['date', 'name', 'expiry'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-3 py-1.5 rounded-full font-body text-xs font-semibold transition-colors ${
                sortBy === s
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-500 border border-black/5'
              }`}
            >
              {s === 'date' ? 'Newest' : s === 'name' ? 'A–Z' : 'Expiry'}
            </button>
          ))}
        </div>

        {/* Document list */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <FFShimmer key={i} className="h-16 rounded-ff" />)}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="font-body text-sm text-alert mb-3">{error}</p>
            <FFButton variant="outline" size="sm" onClick={load}>Retry</FFButton>
          </div>
        ) : documents.length === 0 ? (
          <FFEmptyState
            title={`No ${categoryName} documents yet`}
            message="Upload your first document in this category."
            actionLabel="Upload"
            onAction={() => navigate('/vault/upload')}
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

      {/* FAB */}
      <button
        onClick={() => navigate('/vault/upload')}
        className="fixed bottom-6 right-5 w-14 h-14 bg-accent rounded-full flex items-center justify-center shadow-card"
        aria-label="Upload document"
      >
        <Plus className="w-6 h-6 text-white" />
      </button>
    </div>
  );
};

export default CategoryViewScreen;
