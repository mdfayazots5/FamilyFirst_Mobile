import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, ShoppingBag, Star } from 'lucide-react';
import { AdminRepository } from '../repositories/AdminRepository';
import type { RewardCatalogItem } from '../repositories/AdminRepository';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFBadge from '../../../shared/components/FFBadge';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFErrorState from '../../../shared/components/FFErrorState';

const RewardCatalogScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [rewards, setRewards]     = useState<RewardCatalogItem[]>([]);

  const fetchCatalog = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setRewards(await AdminRepository.getRewardCatalog());
    } catch {
      setError('Could not load reward catalog. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchCatalog(); }, [fetchCatalog]);

  return (
    <div className="min-h-screen bg-bg-cream pb-24">
      <FFPageHeader
        title="Reward Catalog"
        subtitle="Global reward items for families"
        showBack
        rightAction={
          <FFButton size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => {}}>Add</FFButton>
        }
      />

      <main className="px-4 py-5 page-enter">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => <FFShimmer key={i} className="h-40 rounded-ff" />)}
          </div>
        ) : error ? (
          <FFErrorState message={error} onRetry={fetchCatalog} />
        ) : rewards.length === 0 ? (
          <FFEmptyState
            icon={<ShoppingBag className="w-8 h-8 text-gray-300" />}
            title="No Rewards Yet"
            message="Add reward items for families to redeem with coins."
            actionLabel="Add First Reward"
            onAction={() => {}}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {rewards.map(reward => (
              <FFCard key={reward.id} className="p-4 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-white border border-black/5 rounded-ff-sm flex items-center justify-center text-2xl shadow-card">
                    {reward.icon}
                  </div>
                  <div className="flex gap-0.5">
                    <button
                      className="p-1.5 text-gray-300 hover:text-primary transition-colors"
                      aria-label="Edit reward"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      className="p-1.5 text-gray-300 hover:text-alert transition-colors"
                      aria-label="Delete reward"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="font-display font-semibold text-sm text-primary truncate">{reward.title}</p>
                {reward.description && (
                  <p className="font-body text-xs text-gray-400 mt-0.5 line-clamp-2">{reward.description}</p>
                )}

                <div className="mt-auto pt-3 border-t border-black/5 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="font-numbers font-medium text-sm text-primary">{reward.cost}</span>
                    <span className="font-body text-xs text-gray-400">coins</span>
                  </div>
                  <FFBadge variant="gray" size="sm">{reward.category}</FFBadge>
                </div>
              </FFCard>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default RewardCatalogScreen;
