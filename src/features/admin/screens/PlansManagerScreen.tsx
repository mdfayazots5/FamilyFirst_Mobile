import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Check, Edit2, Trash2, CreditCard, Users } from 'lucide-react';
import { AdminRepository, SubscriptionPlan } from '../repositories/AdminRepository';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFBadge from '../../../shared/components/FFBadge';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';

const PlansManagerScreen: React.FC = () => {
  const [plans, setPlans]       = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setPlans(await AdminRepository.getPlans());
    } catch {
      setError('Could not load plan tiers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  return (
    <div className="min-h-screen bg-bg-cream pb-24">
      <FFPageHeader
        title="Plan Tiers"
        subtitle="Family access levels and limits"
        showBack
        rightAction={
          <FFButton size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => {}}>New</FFButton>
        }
      />

      <main className="px-4 py-5 space-y-6 page-enter">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <FFShimmer key={i} className="h-48 rounded-ff" />)}
          </div>
        ) : error ? (
          <FFErrorState message={error} onRetry={fetchPlans} />
        ) : plans.length === 0 ? (
          <FFEmptyState
            icon={<CreditCard className="w-8 h-8 text-gray-300" />}
            title="No Plan Tiers"
            message="Add plan tiers to configure family access levels."
            actionLabel="Add First Plan"
            onAction={() => {}}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {plans.map(plan => (
                <FFCard key={plan.id} className="p-4 flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-display font-semibold text-sm text-primary">{plan.name}</p>
                      <div className="flex items-baseline gap-0.5 mt-0.5">
                        <span className="font-numbers font-medium text-2xl text-primary">₹{plan.price}</span>
                        <span className="font-body text-xs text-gray-400">/mo</span>
                      </div>
                    </div>
                    <button
                      className="p-2 text-gray-300 hover:text-primary transition-colors"
                      aria-label="Edit plan"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-primary/40 flex-shrink-0" />
                    <span className="font-body text-xs text-gray-500">Up to {plan.maxChildren} children</span>
                  </div>

                  <div className="space-y-1.5 flex-1">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-success flex-shrink-0 mt-0.5" />
                        <span className="font-body text-xs text-gray-500">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 mt-3 border-t border-black/5 flex gap-2">
                    <FFButton variant="outline" size="sm" className="flex-1">Edit</FFButton>
                    <button
                      className="p-2 text-gray-300 hover:text-alert transition-colors"
                      aria-label="Delete plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </FFCard>
              ))}
            </div>

            {/* Promo codes */}
            <div className="space-y-3">
              <FFSectionHeader
                icon={<CreditCard className="w-[18px] h-[18px]" />}
                title="Promo Codes"
              />
              <FFCard className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-ff-sm bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-sm text-primary">WELCOME50</p>
                  <p className="font-body text-xs text-gray-400">50% off for first 3 months</p>
                </div>
                <FFBadge variant="success">Active</FFBadge>
              </FFCard>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default PlansManagerScreen;
