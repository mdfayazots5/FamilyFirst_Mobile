import React, { useEffect, useReducer, useState } from 'react';
import {
  Gift,
  RefreshCw,
  ShoppingBag,
  Sparkles,
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
import { Redemption, Reward, RewardRepository } from '../repositories/RewardRepository';

type RewardTab = 'active' | 'pending';

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
      console.error('Failed to load reward shop', error);
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
      console.error('Failed to toggle reward', error);
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
      console.error('Failed to review redemption', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F4EE]">
      <FFPageHeader
        title="Reward shop"
        subtitle="Family rewards and redemption approvals"
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

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 pb-24">
        <FFCard className="shadow-card p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-primary">Reward choices that feel motivating</h1>
              <p className="mt-2 font-body text-sm text-slate-500">
                Keep reward options meaningful, affordable, and easy for children to understand.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <FFButton variant={tab === 'active' ? 'primary' : 'outline'} onClick={() => setTab('active')}>
                Active rewards
              </FFButton>
              <FFButton variant={tab === 'pending' ? 'primary' : 'outline'} onClick={() => setTab('pending')}>
                Pending approvals
              </FFButton>
            </div>
          </div>
        </FFCard>

        {state.status === 'loading' && !rewardData ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
              <section className="space-y-4">
                <FFSectionHeader icon={<ShoppingBag />} title="Reward catalogue" />
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {rewardData.rewards.map((reward) => (
                    <FFCard key={reward.id} className="shadow-card p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-12 w-12 items-center justify-center rounded-ff-sm bg-accent/15 text-2xl">
                            {reward.icon}
                          </span>
                          <div>
                            <p className="font-display text-lg font-semibold text-primary">{reward.name}</p>
                            <p className="font-body text-sm text-slate-500">{reward.category}</p>
                          </div>
                        </div>
                        <span className="rounded-full bg-primary/5 px-3 py-1 font-body text-xs text-primary">
                          {reward.coinCost} coins
                        </span>
                      </div>
                      <p className="mt-4 font-body text-sm text-slate-500">
                        {reward.description ?? 'A family-approved reward option for consistent effort.'}
                      </p>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <span
                          className={`rounded-full px-3 py-1 font-body text-xs ${
                            reward.isEnabled ? 'bg-success/10 text-success' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {reward.isEnabled ? 'Enabled' : 'Paused'}
                        </span>
                        <FFButton variant="outline" onClick={() => void handleToggleReward(reward)}>
                          {reward.isEnabled ? 'Pause reward' : 'Enable reward'}
                        </FFButton>
                      </div>
                    </FFCard>
                  ))}
                </div>
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
                              Requested by {item.childName} on {new Date(item.requestedAt).toLocaleDateString()}
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

            <section className="grid gap-4 md:grid-cols-3">
              <FFCard className="shadow-card p-4">
                <FFSectionHeader icon={<Gift />} title="Good reward balance" />
                <p className="mt-4 font-body text-sm text-slate-500">
                  Mix quick wins with larger goals so children stay motivated without over-spending coins.
                </p>
              </FFCard>
              <FFCard className="shadow-card p-4">
                <FFSectionHeader icon={<Sparkles />} title="Family tone" />
                <p className="mt-4 font-body text-sm text-slate-500">
                  Keep reward names simple, warm, and easy for children to connect to effort.
                </p>
              </FFCard>
              <FFCard className="shadow-card p-4">
                <FFSectionHeader icon={<WalletCards />} title="Approval reminder" />
                <p className="mt-4 font-body text-sm text-slate-500">
                  Review pending redemptions soon after request so children feel the system is responsive.
                </p>
              </FFCard>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
};

export default RewardShopScreen;
