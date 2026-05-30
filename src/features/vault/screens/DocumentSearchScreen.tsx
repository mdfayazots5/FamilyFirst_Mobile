import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, X, RefreshCw } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { VaultRepository } from '../repositories/VaultRepository';
import type { VaultDocument } from '../repositories/VaultRepository';
import DocumentCard from '../widgets/DocumentCard';
import FFEmptyState from '../../../shared/components/FFEmptyState';

const EXPIRY_FILTERS = [
  { label: 'All', value: undefined },
  { label: 'Expiring soon', value: 'expiring-soon' },
];

const DocumentSearchScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [query, setQuery] = useState('');
  const [expiryFilter, setExpiryFilter] = useState<string | undefined>(undefined);
  const [results, setResults] = useState<VaultDocument[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const doSearch = useCallback(async (q: string, expiry?: string) => {
    if (!user?.familyId) return;
    setIsSearching(true);
    setHasSearched(true);
    try {
      const result = await VaultRepository.listDocuments(user.familyId, {
        search: q || undefined,
        expiryStatus: expiry,
        pageSize: 50,
      });
      setResults(result.items);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [user?.familyId]);

  const handleQueryChange = (q: string) => {
    setQuery(q);
    if (q.length >= 2 || q.length === 0) {
      doSearch(q, expiryFilter);
    }
  };

  const handleExpiryFilter = (v: string | undefined) => {
    setExpiryFilter(v);
    doSearch(query, v);
  };

  return (
    <div className="min-h-screen bg-[#F8F4EE]">
      {/* Header */}
      <div className="bg-[#1A2E4A] px-5 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1 flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-white/70 flex-shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={e => handleQueryChange(e.target.value)}
              placeholder="Search documents, members, tags…"
              className="flex-1 bg-transparent text-white placeholder-white/60 text-sm focus:outline-none"
            />
            {query.length > 0 && (
              <button onClick={() => handleQueryChange('')}>
                <X className="w-4 h-4 text-white/70" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pt-3 pb-24 space-y-4">
        {/* Filters */}
        <div className="flex gap-2">
          {EXPIRY_FILTERS.map(f => (
            <button
              key={String(f.value)}
              onClick={() => handleExpiryFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                ${expiryFilter === f.value
                  ? 'bg-[#1A2E4A] text-white'
                  : 'bg-white text-gray-600 border border-gray-200'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {isSearching ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="w-6 h-6 text-gray-300 animate-spin" />
          </div>
        ) : !hasSearched ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-400">Start typing to search your documents</p>
          </div>
        ) : results.length === 0 ? (
          <FFEmptyState
            title="No documents found"
            subtitle={`No results for "${query || 'current filters'}".`}
          />
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 px-1">{results.length} result{results.length !== 1 ? 's' : ''}</p>
            {results.map(doc => (
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

export default DocumentSearchScreen;
