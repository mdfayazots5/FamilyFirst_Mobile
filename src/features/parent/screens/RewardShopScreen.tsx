import React, { useEffect, useReducer, useState } from 'react';
import {
  Coins,
  RefreshCw,
  ShoppingBag,
  WalletCards,
} from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import RewardIcon from '../../../shared/components/RewardIcon';
import { Redemption, Reward, RewardRepository } from '../repositories/RewardRepository';
import { logger } from '../../../core/services/logger';
import { APP_LOCALE } from '../../../core/utils/format';

type RewardTab = 'active' | 'pending';

const rewardGrid = 'grid grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))] gap-4';

interface RewardShopData {
  rewards: Reward[];
  pending: Redemption[];
}

type RewardShopState =
  | { status: 'loading'; data: RewardShopData | null; error: string | null }
  | { status: 'ready'; data: RewardShopData; error: string | null }
  | { status: 'error'; data: RewardShopData | null; error: string };

type RewardShopAction =
  | { type: 'LOAD_START'; preserve: RewardShopData | null }
  | { type: 'LOAD_SUCCESS'; payload: RewardShopData }
  | { type: 'LOAD_ERROR'; error: string }
  | { type: 'REWARDS_UPDATED'; payload: Reward[] }
  | { type: 'PENDING_UPDATED'; payload: Redemption[] };

const initialState: RewardShopState = {
  status: 'loading',
  data: null,
  error: null,
};

function reducer(state: RewardShopState, action: RewardShopAction): RewardShopState {
  switch (action.type) {
    case 'LOAD_START':
      return { status: 'loading', data: action.preserve, error: null };
    case 'LOAD_SUCCESS':
      return { status: 'ready', data: action.payload, error: null };
    case 'LOAD_ERROR':
      return { status: 'error', data: state.data, error: action.error };
    case 'REWARDS_UPDATED':
      return state.data
        ? { ...state, data: { ...state.data, rewards: action.payload } }
        : state;
    case 'PENDING_UPDATED':
      return state.data
        ? { ...state, data: { ...state.data, pending: action.payload } }
        : state;
    default:
      return state;
  }
}

const RewardShopScreen: React.FC = () => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [tab, setTab] = useState<RewardTab>('active');

  const loadRewards = async () => {
    if (!user?.familyId) {
      dispatch({ type: 'LOAD_ERROR', error: 'Family details are not available for rewards.' });
      return;
    }

    dispatch({ type: 'LOAD_START', preserve: state.data });

    try {
      const [rewards, pending] = await Promise.all([
        RewardRepository.getRewards(user.familyId, false),
        RewardRepository.getPendingRedemptions(user.familyId),
      ]);

      dispatch({ type: 'LOAD_SUCCESS', payload: { rewards, pending } });
    } catch (error) {
      logger.error('Failed to load reward shop', error);
      dispatch({ type: 'LOAD_ERROR', error: 'Unable to load rewards right now.' });
    }
  };

  useEffect(() => {
    void loadRewards();
  }, [user?.familyId]);

  const rewardData = state.data;

  const handleToggleReward = async (reward: Reward) => {
    if (!user?.familyId) {
      return;
    }

    try {
      await RewardRepository.updateReward(user.familyId, reward.id, {
        ...reward,
        isEnabled: !reward.isEnabled,
      });

      const nextRewards = (rewardData?.rewards ?? []).map((item) =>
        item.id === reward.id ? { ...item, isEnabled: !item.isEnabled } : item,
      );
      dispatch({ type: 'REWARDS_UPDATED', payload: nextRewards });
    } catch (error) {
      logger.error('Failed to toggle reward', error);
    }
  };

  const handleReview = async (item: Redemption, status: 'Approved' | 'Rejected') => {
    if (!user?.familyId) {
      return;
    }

    try {
      await RewardRepository.reviewRedemption(user.familyId, item.id, status);
      const nextPending = (rewardData?.pending ?? []).filter((entry) => entry.id !== item.id);
      dispatch({ type: 'PENDING_UPDATED', payload: nextPending });
    } catch (error) {
      logger.error('Failed to review redemption', error);
    }
  };

  return (
    <div className="min-h-screen bg-bg-cream">
      <FFPageHeader
        title="Reward shop"
        showBack
        rightAction={
          <FFButton
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
            onClick={() => void loadRewards()}
            icon={<RefreshCw size={16} />}
          >
            Refresh
          </FFButton>
        }
      />

      <div className="flex flex-col gap-6 py-5 sm:py-6">
        <div role="group" aria-label="Reward shop views" className="grid grid-cols-2 gap-1 rounded-ff border border-primary/10 bg-white p-1.5 sm:w-fit">
          <FFButton size="sm" variant={tab === 'active' ? 'primary' : 'ghost'} className="min-w-0! whitespace-normal! px-2! sm:px-4!" aria-pressed={tab === 'active'} onClick={() => setTab('active')}>
            Reward catalogue
          </FFButton>
          <FFButton size="sm" variant={tab === 'pending' ? 'primary' : 'ghost'} className="min-w-0! whitespace-normal! px-2! sm:px-4!" aria-pressed={tab === 'pending'} onClick={() => setTab('pending')}>
            Pending approvals
          </FFButton>
        </div>

        {state.status === 'loading' && !rewardData ? (
          <div className={rewardGrid}>
            {Array.from({ length: 3 }).map((_, index) => (
              <FFCard key={index} className="shadow-card p-5">
                <FFShimmer width={52} height={52} borderRadius="1rem" />
                <FFShimmer className="mt-4" width="60%" height={18} />
                <FFShimmer className="mt-3" width="80%" height={14} />
              </FFCard>
            ))}
          </div>
        ) : null}

        {state.status === 'error' && !rewardData ? (
          <FFErrorState message={state.error} onRetry={() => void loadRewards()} />
        ) : null}

        {rewardData ? (
          <>
            {state.status === 'error' ? (
              <FFCard className="shadow-card border-alert/20 bg-alert/5 p-4">
                <p className="font-body text-sm text-alert">{state.error}</p>
              </FFCard>
            ) : null}

            {tab === 'active' ? (
              <section aria-label="Reward catalogue">
                {rewardData.rewards.length === 0 ? (
                  <FFEmptyState title="No rewards available" message="Rewards will appear here when they are added to the catalogue." icon={<ShoppingBag size={32} />} />
                ) : (
                  <div className={rewardGrid}>
                    {rewardData.rewards.map((reward) => {
                      const category = reward.category.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ');
                      return (
                        <FFCard key={reward.id} className="shadow-card flex min-w-0 flex-col p-5">
                          <div className="flex items-start justify-between gap-3">
                            <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-primary">
                              <RewardIcon code={reward.icon} />
                            </span>
                            <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-accent/10 px-2.5 py-1.5 text-xs font-bold tabular-nums text-primary">
                              <Coins size={14} aria-hidden="true" />
                              {reward.coinCost} coins
                            </span>
                          </div>
                          <div className="mt-3">
                            {category ? <p className="mb-1 text-xs font-semibold text-slate-600">{category}</p> : null}
                            <h2 className="wrap-anywhere text-base font-semibold leading-snug sm:text-lg">{reward.name}</h2>
                            {reward.description ? <p className="mt-1.5 wrap-anywhere text-sm leading-relaxed text-slate-600">{reward.description}</p> : null}
                          </div>
                          <div className="mt-auto pt-4">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-primary/10 pt-3">
                              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${reward.isEnabled ? 'bg-success/10 text-success' : 'bg-slate-100 text-slate-600'}`}>
                                {reward.isEnabled ? 'Enabled' : 'Paused'}
                              </span>
                              <FFButton size="sm" variant="outline" onClick={() => void handleToggleReward(reward)}>
                                {reward.isEnabled ? 'Pause reward' : 'Enable reward'}
                              </FFButton>
                            </div>
                          </div>
                        </FFCard>
                      );
                    })}
                  </div>
                )}
              </section>
            ) : (
              <section className="space-y-4">
                <FFSectionHeader icon={<WalletCards />} title="Pending redemptions" />
                {rewardData.pending.length === 0 ? (
                  <FFEmptyState
                    title="No pending approvals"
                    message="Children do not have any reward redemptions waiting for your review right now."
                  />
                ) : (
                  <div className="space-y-3">
                    {rewardData.pending.map((item) => (
                      <FFCard key={item.id} className="shadow-card p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-display text-lg font-semibold text-primary">{item.rewardName}</p>
                              <span className="rounded-full bg-accent/15 px-3 py-1 font-body text-xs text-primary">
                                {item.coinCost} coins
                              </span>
                            </div>
                            <p className="mt-2 font-body text-sm text-slate-500">
                              Requested by {item.childName} on {new Date(item.requestedAt).toLocaleDateString(APP_LOCALE)}
                            </p>
                            {item.parentNote ? (
                              <p className="mt-2 font-body text-sm text-slate-500">{item.parentNote}</p>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <FFButton variant="outline" onClick={() => void handleReview(item, 'Rejected')}>
                              Reject
                            </FFButton>
                            <FFButton onClick={() => void handleReview(item, 'Approved')}>
                              Approve
                            </FFButton>
                          </div>
                        </div>
                      </FFCard>
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default RewardShopScreen;
