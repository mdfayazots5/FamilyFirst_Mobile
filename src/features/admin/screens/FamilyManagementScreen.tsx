import React, { useState, useEffect, useCallback } from 'react';
import { Search, Users, Calendar, UserCheck } from 'lucide-react';
import { AdminRepository, AdminFamily, AdminLookupOption } from '../repositories/AdminRepository';
import FFCard from '../../../shared/components/FFCard';
import FFBadge from '../../../shared/components/FFBadge';
import FFButton from '../../../shared/components/FFButton';
import FFShimmer from '../../../shared/components/FFShimmer';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';

const FamilyManagementScreen: React.FC = () => {
  const [families, setFamilies] = useState<AdminFamily[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [planOptions, setPlanOptions] = useState<AdminLookupOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [familyData, livePlanOptions] = await Promise.all([
        AdminRepository.getFamilies(),
        AdminRepository.getPlanOptions(),
      ]);
      setFamilies(familyData);
      setPlanOptions(livePlanOptions);
    } catch {
      setError('Could not load families. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredFamilies = families.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || f.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusVariant = (status: string): 'success' | 'accent' | 'gray' | 'alert' => {
    switch (status) {
      case 'Active':   return 'success';
      case 'Trial':    return 'accent';
      case 'Flagged':  return 'alert';
      default:         return 'gray';
    }
  };

  const statuses = ['All', 'Active', 'Trial', 'Churned', 'Flagged'];

  return (
    <div className="px-4 py-5 space-y-5 pb-24 page-enter">

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
        <input
          type="text"
          placeholder="Search families..."
          className="w-full h-12 pl-11 pr-4 bg-white border border-black/5 rounded-xl font-body text-sm text-primary focus:outline-none focus:ring-1 focus:ring-primary/20 placeholder:text-gray-300"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
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

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <FFShimmer key={i} className="h-20 rounded-ff" />)}
        </div>
      ) : error ? (
        <FFErrorState message={error} onRetry={fetchData} />
      ) : filteredFamilies.length === 0 ? (
        <FFEmptyState
          icon={<Users className="w-8 h-8 text-gray-300" />}
          title="No Families Found"
          message={searchQuery ? 'Try a different search term.' : 'No families match the selected filters.'}
        />
      ) : (
        <div className="space-y-3">
          <FFSectionHeader
            icon={<Users className="w-[18px] h-[18px]" />}
            title="Families"
            rightAction={
              <span className="font-body text-xs text-accent font-semibold">
                {filteredFamilies.length} total
              </span>
            }
          />

          {filteredFamilies.map(family => (
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
                    <span className="font-body text-xs text-gray-400">{family.plan}</span>
                    <span className="font-body text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(family.lastActive).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <FFButton variant="ghost" size="sm" className="flex-shrink-0">View</FFButton>
              </div>
            </FFCard>
          ))}

          <FFButton variant="ghost" className="w-full">Load More</FFButton>
        </div>
      )}
    </div>
  );
};

export default FamilyManagementScreen;
