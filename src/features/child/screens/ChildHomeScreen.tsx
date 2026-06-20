import React, { useEffect, useReducer } from 'react';
import {
  Coins,
  Heart,
  RefreshCw,
  Sparkles,
  Star,
  Trophy,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import { RewardRepository } from '../../parent/repositories/RewardRepository';
import { TaskCompletion, TaskCompletionRepository } from '../repositories/TaskCompletionRepository';

interface ChildHomeData {
  completions: TaskCompletion[];
  coins: number;
}

type ChildHomeState =
  | { status: 'loading'; data: ChildHomeData | null; error: string | null }
  | { status: 'ready'; data: ChildHomeData; error: string | null }
  | { status: 'error'; data: ChildHomeData | null; error: string };

type ChildHomeAction =
  | { type: 'LOAD_START'; preserve: ChildHomeData | null }
  | { type: 'LOAD_SUCCESS'; payload: ChildHomeData }
  | { type: 'LOAD_ERROR'; error: string };

const initialState: ChildHomeState = {
  status: 'loading',
  data: null,
  error: null,
};

function reducer(state: ChildHomeState, action: ChildHomeAction): ChildHomeState {
  switch (action.type) {
    case 'LOAD_START':
      return { status: 'loading', data: action.preserve, error: null };
    case 'LOAD_SUCCESS':
      return { status: 'ready', data: action.payload, error: null };
    case 'LOAD_ERROR':
      return { status: 'error', data: state.data, error: action.error };
    default:
      return state;
  }
}

const ChildHomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadScreen = async () => {
    if (!user?.familyId || !user?.id) {
      dispatch({ type: 'LOAD_ERROR', error: 'Child details are not available right now.' });
      return;
    }

    dispatch({ type: 'LOAD_START', preserve: state.data });

    try {
      const today = new Date().toISOString().split('T')[0];
      const [completions, history] = await Promise.all([
        TaskCompletionRepository.getCompletions(user.familyId, user.id, today),
        RewardRepository.getCoinHistory(user.id),
      ]);

      const coins = history.reduce(
        (balance, item) => balance + (item.type === 'Earned' ? item.amount : -item.amount),
        0,
      );

      dispatch({ type: 'LOAD_SUCCESS', payload: { completions, coins } });
    } catch (error) {
      console.error('Failed to load child home', error);
      dispatch({ type: 'LOAD_ERROR', error: 'Unable to load your day right now.' });
    }
  };

  useEffect(() => {
    void loadScreen();
  }, [user?.familyId, user?.id]);

  const screenData = state.data;
  const completions = screenData?.completions ?? [];
  const approved = completions.filter((item) => item.status === 'approved').length;
  const submitted = completions.filter((item) => item.status === 'submitted').length;
  const progress = completions.length > 0 ? Math.round((approved / completions.length) * 100) : 0;

  const grouped = ['Morning', 'Evening', 'Night'].map((block) => ({
    block,
    items: completions.filter((item) => item.timeBlock === block),
  }));

  return (
    <div className="min-h-screen bg-[#F8F4EE]">
      <FFPageHeader
        variant="home"
        roleLabel="Child"
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
          <p className="font-body text-sm text-white/75">Hi {user?.name?.split(' ')[0] ?? 'there'}!</p>
          <h1 className="mt-1 font-display text-3xl font-bold">Let&apos;s make today feel awesome</h1>
          <p className="mt-3 font-body text-sm leading-6 text-white/80">
            Finish your tasks, collect coins, and keep your streak going one step at a time.
          </p>
        </FFCard>

        {state.status === 'loading' && !screenData ? (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <FFCard key={index} className="shadow-card p-5">
                <FFShimmer width="40%" height={16} />
                <FFShimmer className="mt-4" width="35%" height={32} />
                <FFShimmer className="mt-3" width="70%" height={14} />
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

            <section className="grid gap-4 md:grid-cols-3">
              <FFCard className="shadow-card p-5">
                <div className="flex items-center justify-between">
                  <span className="rounded-ff-sm bg-accent/15 p-3 text-accent">
                    <Sparkles size={20} />
                  </span>
                  <span className="font-body text-xs uppercase tracking-wider text-slate-500">Today</span>
                </div>
                <p className="mt-4 font-display text-3xl font-bold text-primary">{progress}%</p>
                <p className="mt-2 font-body text-sm text-slate-500">
                  {approved} of {completions.length} tasks completed.
                </p>
              </FFCard>

              <FFCard className="shadow-card p-5">
                <div className="flex items-center justify-between">
                  <span className="rounded-ff-sm bg-success/10 p-3 text-success">
                    <Coins size={20} />
                  </span>
                  <span className="font-body text-xs uppercase tracking-wider text-slate-500">Coins</span>
                </div>
                <p className="mt-4 font-display text-3xl font-bold text-primary">{screenData.coins}</p>
                <p className="mt-2 font-body text-sm text-slate-500">Keep going to unlock your next reward.</p>
              </FFCard>

              <FFCard className="shadow-card p-5">
                <div className="flex items-center justify-between">
                  <span className="rounded-ff-sm bg-primary/5 p-3 text-primary">
                    <Trophy size={20} />
                  </span>
                  <span className="font-body text-xs uppercase tracking-wider text-slate-500">Waiting</span>
                </div>
                <p className="mt-4 font-display text-3xl font-bold text-primary">{submitted}</p>
                <p className="mt-2 font-body text-sm text-slate-500">
                  tasks are waiting for a parent review.
                </p>
              </FFCard>
            </section>

            <section className="space-y-4">
              <FFSectionHeader icon={<Star />} title="My tasks today" />
              {completions.length === 0 ? (
                <FFEmptyState
                  title="No tasks planned yet"
                  message="Your routine tasks will show up here as soon as they are ready."
                />
              ) : (
                <div className="space-y-5">
                  {grouped.map(({ block, items }) =>
                    items.length > 0 ? (
                      <div key={block} className="space-y-3">
                        <p className="font-display text-lg font-semibold text-primary">{block}</p>
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                          {items.map((item) => (
                            <FFCard
                              key={item.id}
                              hoverable
                              onClick={() => navigate(`/child/tasks/${item.id}`)}
                              className="shadow-card p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-display text-lg font-semibold text-primary">{item.taskName}</p>
                                  <p className="mt-1 font-body text-sm text-slate-500">
                                    {item.timeBlock} • {item.coinValue} coins
                                  </p>
                                </div>
                                <span
                                  className={`rounded-full px-3 py-1 font-body text-xs ${
                                    item.status === 'approved'
                                      ? 'bg-success/10 text-success'
                                      : item.status === 'submitted'
                                        ? 'bg-accent/15 text-primary'
                                        : item.status === 'flagged'
                                          ? 'bg-alert/10 text-alert'
                                          : 'bg-primary/5 text-primary'
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </div>
                            </FFCard>
                          ))}
                        </div>
                      </div>
                    ) : null,
                  )}
                </div>
              )}
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              <FFButton onClick={() => navigate('/child/coins')} className="w-full">
                Open coins and rewards
              </FFButton>
              <FFButton variant="outline" onClick={() => navigate('/child/scores')} className="w-full">
                See my scores
              </FFButton>
              <FFButton variant="outline" onClick={() => navigate('/child/family')} className="w-full">
                Family space
              </FFButton>
            </section>

            <FFCard className="shadow-card bg-[#FDF9F4] p-5">
              <FFSectionHeader icon={<Heart />} title="A kind reminder" />
              <p className="mt-4 font-body text-sm leading-6 text-slate-600">
                Every finished task counts. Small wins still matter, especially when you keep showing up.
              </p>
            </FFCard>
          </>
        ) : null}
      </main>
    </div>
  );
};

export default ChildHomeScreen;
