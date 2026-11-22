import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Users, Calendar, UserCheck } from 'lucide-react';
import {
  ADMIN_FAMILY_STATUS_OPTIONS,
  AdminRepository,
  type AdminFamilyFilter,
} from '../repositories/AdminRepository';
import FFCard from '../../../shared/components/FFCard';
import FFBadge from '../../../shared/components/FFBadge';
import FFButton from '../../../shared/components/FFButton';
import FFShimmer from '../../../shared/components/FFShimmer';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import { useApiResource } from '../../../core/hooks/useApiResource';
import { APP_LOCALE } from '../../../core/utils/format';

const FamilyManagementScreen: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = (searchParams.get('query') ?? '').slice(0, 100);
  const filterStatus = ADMIN_FAMILY_STATUS_OPTIONS.find(status => status === searchParams.get('status')) ?? 'All';
  const [query, setQuery] = useState(searchQuery.trim());

  useEffect(() => {
    const timeout = window.setTimeout(() => setQuery(searchQuery.trim()), 250);
    return () => window.clearTimeout(timeout);
  }, [searchQuery]);

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true, preventScrollReset: true });
  };

  return (
    <div className="px-4 py-5 space-y-5 pb-24 page-enter">

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
        <input
          type="search"
          aria-label="Search families"
          maxLength={100}
          placeholder="Search families..."
          className="w-full h-12 pl-11 pr-4 bg-white border border-black/5 rounded-xl font-body text-sm text-primary focus:outline-none focus:ring-1 focus:ring-primary/20 placeholder:text-gray-300"
          value={searchQuery}
          onChange={(e) => updateFilter('query', e.target.value)}
        />
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {ADMIN_FAMILY_STATUS_OPTIONS.map(s => (
          <button
            key={s}
            type="button"
            aria-pressed={filterStatus === s}
            onClick={() => updateFilter('status', s === 'All' ? '' : s)}
            className={`flex-shrink-0 h-8 px-4 rounded-full font-body font-semibold text-xs transition-all ${
              filterStatus === s
                ? 'bg-primary text-white'
                : 'bg-white text-gray-400 border border-black/5'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <FamilyResults key={JSON.stringify([query, filterStatus])} query={query} filterStatus={filterStatus} />
    </div>
  );
};

const getStatusVariant = (status: string): 'success' | 'accent' | 'gray' | 'alert' => {
  switch (status) {
    case 'Active':  return 'success';
    case 'Flagged': return 'alert';
    default:        return 'gray';
  }
};

const FamilyResults: React.FC<{ query: string; filterStatus: AdminFamilyFilter }> = ({ query, filterStatus }) => {
  const navigate = useNavigate();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const pendingPage = useRef<AbortController | null>(null);
  const filters = { query: query || undefined, status: filterStatus === 'All' ? undefined : filterStatus };
  const { data, isLoading, error, reload, setData } = useApiResource(
    () => AdminRepository.getFamilies({ ...filters, page: 1 }),
    [],
    'Could not load families. Please try again.',
  );

  useEffect(() => () => pendingPage.current?.abort(), []);

  const loadMore = async () => {
    if (!data?.hasNextPage || pendingPage.current) return;
    const controller = new AbortController();
    pendingPage.current = controller;
    setIsLoadingMore(true);
    setLoadMoreError(false);

    try {
      const page = await AdminRepository.getFamilies({ ...filters, page: data.pageNumber + 1 }, controller.signal);
      if (controller.signal.aborted) return;
      const existingIds = new Set(data.items.map(family => family.id));
      setData({ ...page, items: [...data.items, ...page.items.filter(family => !existingIds.has(family.id))] });
    } catch {
      if (!controller.signal.aborted) setLoadMoreError(true);
    } finally {
      pendingPage.current = null;
      if (!controller.signal.aborted) setIsLoadingMore(false);
    }
  };

  return isLoading ? (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => <FFShimmer key={i} className="h-20 rounded-ff" />)}
    </div>
  ) : error ? (
    <FFErrorState message={error} onRetry={reload} />
  ) : !data?.items.length ? (
    <FFEmptyState
      icon={<Users className="w-8 h-8 text-gray-300" />}
      title="No Families Found"
      message={query ? 'Try a different search term.' : 'No families match the selected filters.'}
    />
  ) : (
    <div className="space-y-3">
      <FFSectionHeader
        icon={<Users className="w-[18px] h-[18px]" />}
        title="Families"
        rightAction={
          <span className="font-body text-xs text-accent font-semibold">
            {data.totalCount} total
          </span>
        }
      />

      {data.items.map(family => (
        <FFCard key={family.id} hoverable className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-ff-sm bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-display font-semibold text-sm text-primary truncate">{family.name}</p>
                <FFBadge variant={getStatusVariant(family.status)}>{family.status}</FFBadge>
              </div>
              <div className="flex items-center gap-4 mt-0.5 flex-wrap">
                <span className="font-body text-xs text-gray-400 flex items-center gap-1">
                  <UserCheck className="w-3 h-3" /> {family.memberCount} members
                </span>
                {family.city ? (
                  <span className="font-body text-xs text-gray-400">{family.city}</span>
                ) : null}
                <span className="font-body text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(family.createdAt).toLocaleDateString(APP_LOCALE)}
                </span>
              </div>
            </div>
            <FFButton
              variant="outline"
              size="sm"
              className="flex-shrink-0"
              aria-label={`View ${family.name}`}
              onClick={() => navigate(`/admin/families/${family.id}`, { state: { fromFamilies: true } })}
            >
              View
            </FFButton>
          </div>
        </FFCard>
      ))}

      {loadMoreError && <p role="alert" className="text-center text-sm text-alert">Could not load more families. Please try again.</p>}
      {data.hasNextPage && (
        <FFButton variant="outline" className="w-full" isLoading={isLoadingMore} aria-label="Load More" onClick={loadMore}>
          Load More
        </FFButton>
      )}
    </div>
  );
};

export default FamilyManagementScreen;
