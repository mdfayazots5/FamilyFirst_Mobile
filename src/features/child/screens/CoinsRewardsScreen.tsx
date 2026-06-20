import React, { useEffect, useReducer, useState } from 'react';
import {
  Coins,
  Gift,
  History,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import { CoinTransaction, Redemption, Reward, RewardRepository } from '../../parent/repositories/RewardRepository';

interface CoinsRewardsData {
  rewards: Reward[];
  history: CoinTransaction[];
  redemptions: Redemption[];
}

type CoinsRewardsState =
  | { status: 'loading'; data: CoinsRewardsData | null; error: string | null }
  | { status: 'ready'; data: CoinsRewardsData; error: string | null }
  | { status: 'error'; data: CoinsRewardsData | null; error: string };

type CoinsRewardsAction =
  | { type: 'LOAD_START'; preserve: CoinsRewardsData | null }
  | { type: 'LOAD_SUCCESS'; payload: CoinsRewardsData }
  | { type: 'LOAD_ERROR'; error: string }
  | { type: 'REDEMPTIONS_UPDATED'; payload: Redemption[] };

const initialState: CoinsRewardsState = {
  status: 'loading',
  data: null,
  error: null,
};

function reducer(state: CoinsRewardsState, action: CoinsRewardsAction): CoinsRewardsState {
  switch (action.type) {
    case 'LOAD_START':
      return { status: 'loading', data: action.preserve, error: null };
    case 'LOAD_SUCCESS':
      return { status: 'ready', data: action.payload, error: null };
    case 'LOAD_ERROR':
      return { status: 'error', data: state.data, error: action.error };
    case 'REDEMPTIONS_UPDATED':
      return state.data
        ? { ...state, data: { ...state.data, redemptions: action.payload } }
        : state;
    default:
      return state;
  }
}

const CoinsRewardsScreen: React.FC = () => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [tab, setTab] = useState<'shop' | 'history'>('shop');
  const [selectedRewardId, setSelectedRewardId] = useState<string | null>(null);

  const loadScreen = async () => {
    if (!user?.familyId || !user?.id) {
      dispatch({ type: 'LOAD_ERROR', error: 'Coins and rewards are not available right now.' });
      return;
    }

    dispatch({ type: 'LOAD_START', preserve: state.data });

    try {
      const [rewards, history, redemptions] = await Promise.all([
        RewardRepository.getRewards(user.familyId),
        RewardRepository.getCoinHistory(user.id),
        RewardRepository.getPendingRedemptions(user.familyId),
      ]);

      dispatch({ type: 'LOAD_SUCCESS', payload: { rewards, history, redemptions } });
    } catch (error) {
      console.error('Failed to load child coins and rewards', error);
      dispatch({ type: 'LOAD_ERROR', error: 'Unable to load coins and rewards right now.' });
    }
  };

  useEffect(() => {
    void loadScreen();
  }, [user?.familyId, user?.id]);

  const screenData = state.data;
  const history = screenData?.history ?? [];
  const currentCoins = history.reduce(
    (balance, item) => balance + (item.type === 'Earned' ? item.amount : -item.amount),
    0,
  );

  const today = new Date().toISOString().split('T')[0];
  const earnedToday = history
    .filter((item) => item.type === 'Earned' && item.date.startsWith(today))
    .reduce((sum, item) => sum + item.amount, 0);

  const spendToday = history
    .filter((item) => item.type === 'Spent' && item.date.startsWith(today))
    .reduce((sum, item) => sum + item.amount, 0);

  const handleRedeem = async (reward: Reward) => {
    if (!user?.familyId || !user?.id) {
      return;
    }

    setSelectedRewardId(reward.id);

    try {
      const redemption = await RewardRepository.redeemReward(user.familyId, reward.id, user.id);
      dispatch({
        type: 'REDEMPTIONS_UPDATED',
        payload: [redemption, ...(screenData?.redemptions ?? [])],
      });
    } catch (error) {
      console.error('Failed to redeem reward for child', error);
    } finally {
      setSelectedRewardId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F4EE]">
      <FFPageHeader
        title="Coins and rewards"
        subtitle="Spend wisely and save for big treats"
        showBack
        rightAction={
          <FFButton
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
            onClick={() => void loadScreen()}
            icon={<RefreshCw size={16} />}
          >
            Refresh
          </FFButton>
        }
      />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 pb-24">
        <FFCard variant="primary" className="shadow-card p-5 text-white">
          <p className="font-body text-sm text-white/75">Your reward wallet</p>
          <h1 className="mt-1 font-display text-3xl font-bold">{currentCoins} coins</h1>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-ff-sm bg-white/10 p-4">
              <p className="font-body text-xs uppercase tracking-wider text-white/70">Earned today</p>
              <p className="mt-2 font-display text-2xl font-bold text-white">+{earnedToday}</p>
            </div>
            <div className="rounded-ff-sm bg-white/10 p-4">
              <p className="font-body text-xs uppercase tracking-wider text-white/70">Spent today</p>
              <p className="mt-2 font-display text-2xl font-bold text-white">-{spendToday}</p>
            </div>
          </div>
        </FFCard>

        <div className="flex flex-wrap gap-3">
          <FFButton variant={tab === 'shop' ? 'primary' : 'outline'} onClick={() => setTab('shop')}>
            Reward shop
          </FFButton>
          <FFButton variant={tab === 'history' ? 'primary' : 'outline'} onClick={() => setTab('history')}>
            History
          </FFButton>
        </div>

        {state.status === 'loading' && !screenData ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <FFCard key={index} className="shadow-card p-5">
                <FFShimmer width={42} height={42} borderRadius="1rem" />
                <FFShimmer className="mt-4" width="60%" height={18} />
                <FFShimmer className="mt-3" width="75%" height={14} />
              </FFCard>
            ))}
          </div>
        ) : null}

        {state.status === 'error' && !screenData ? (
          <FFErrorState message={state.error} onRetry={() => void loadScreen()} />
        ) : null}

        {screenData ? (
          <>
            {state.status === 'error' ? (
              <FFCard className="shadow-card border-alert/20 bg-alert/5 p-4">
                <p className="font-body text-sm text-alert">{state.error}</p>
              </FFCard>
            ) : null}

            {tab === 'shop' ? (
              <section className="space-y-4">
                <FFSectionHeader icon={<ShoppingBag />} title="Reward shop" />
                {screenData.rewards.length === 0 ? (
                  <FFEmptyState
                    title="No rewards ready yet"
                    message="Family-approved reward ideas will show here when they are available."
                  />
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {screenData.rewards.map((reward) => {
                      const isPending = screenData.redemptions.some(
                        (item) => item.rewardId === reward.id && item.status === 'Pending',
                      );

                      return (
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
                              {reward.coinCost}
                            </span>
                          </div>
                          <p className="mt-4 font-body text-sm text-slate-500">
                            {reward.description ?? 'A fun family reward to work toward.'}
                          </p>
                          <div className="mt-4 flex items-center justify-between gap-3">
                            <span
                              className={`rounded-full px-3 py-1 font-body text-xs ${
                                isPending ? 'bg-accent/15 text-primary' : 'bg-success/10 text-success'
                              }`}
                            >
                              {isPending ? 'Pending' : 'Ready'}
                            </span>
                            <FFButton
                              onClick={() => void handleRedeem(reward)}
                              disabled={isPending || currentCoins < reward.coinCost}
                              isLoading={selectedRewardId === reward.id}
                            >
                              Redeem
                            </FFButton>
                          </div>
                        </FFCard>
                      );
                    })}
                  </div>
                )}
              </section>
            ) : (
              <section className="space-y-4">
                <FFSectionHeader icon={<History />} title="Coin history" />
                {history.length === 0 ? (
                  <FFEmptyState
                    title="No history yet"
                    message="Your coin activity will appear here after tasks are approved or rewards are redeemed."
                  />
                ) : (
                  <div className="space-y-3">
                    {history.map((item) => (
                      <FFCard key={item.id} className="shadow-card p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-display text-base font-semibold text-primary">{item.description}</p>
                            <p className="mt-2 font-body text-sm text-slate-500">
                              {new Date(item.date).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 font-body text-xs ${
                              item.type === 'Earned' ? 'bg-success/10 text-success' : 'bg-alert/10 text-alert'
                            }`}
                          >
                            {item.type === 'Earned' ? '+' : '-'}
                            {item.amount}
                          </span>
                        </div>
                      </FFCard>
                    ))}
                  </div>
                )}
              </section>
            )}

            <FFCard className="shadow-card bg-[#FDF9F4] p-5">
              <FFSectionHeader icon={<Gift />} title="Smart spending tip" />
              <p className="mt-4 font-body text-sm leading-6 text-slate-600">
                Saving for one bigger reward can feel even more exciting than spending coins right away.
              </p>
            </FFCard>
          </>
        ) : null}
      </main>
    </div>
  );
};

export default CoinsRewardsScreen;
