import React, { useEffect, useReducer } from 'react';
import {
  Award,
  BarChart3,
  RefreshCw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import { ChildDetail, ChildRepository } from '../../parent/repositories/ChildRepository';
import { TaskCompletion, TaskCompletionRepository } from '../repositories/TaskCompletionRepository';

interface ScoresData {
  child: ChildDetail;
  completions: TaskCompletion[];
}

type ScoresState =
  | { status: 'loading'; data: ScoresData | null; error: string | null }
  | { status: 'ready'; data: ScoresData; error: string | null }
  | { status: 'error'; data: ScoresData | null; error: string };

type ScoresAction =
  | { type: 'LOAD_START'; preserve: ScoresData | null }
  | { type: 'LOAD_SUCCESS'; payload: ScoresData }
  | { type: 'LOAD_ERROR'; error: string };

const initialState: ScoresState = {
  status: 'loading',
  data: null,
  error: null,
};

function reducer(state: ScoresState, action: ScoresAction): ScoresState {
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

const MyScoresScreen: React.FC = () => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadScreen = async () => {
    if (!user?.familyId || !user?.id) {
      dispatch({ type: 'LOAD_ERROR', error: 'Your score details are not available right now.' });
      return;
    }

    dispatch({ type: 'LOAD_START', preserve: state.data });

    try {
      const today = new Date().toISOString().split('T')[0];
      const [child, completions] = await Promise.all([
        ChildRepository.getChildDetail(user.familyId, user.id),
        TaskCompletionRepository.getCompletions(user.familyId, user.id, today),
      ]);

      dispatch({ type: 'LOAD_SUCCESS', payload: { child, completions } });
    } catch (error) {
      console.error('Failed to load child scores', error);
      dispatch({ type: 'LOAD_ERROR', error: 'Unable to load your scores right now.' });
    }
  };

  useEffect(() => {
    void loadScreen();
  }, [user?.familyId, user?.id]);

  const screenData = state.data;
  const completions = screenData?.completions ?? [];
  const approved = completions.filter((item) => item.status === 'approved').length;
  const pending = completions.filter((item) => item.status === 'pending' || item.status === 'submitted').length;
  const totalScore = screenData?.child.todayScore ?? 0;

  return (
    <div className="min-h-screen bg-[#F8F4EE]">
      <FFPageHeader
        title="My scores"
        subtitle="Progress, habits, and streaks"
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
        {state.status === 'loading' && !screenData ? (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <FFCard key={index} className="shadow-card p-5">
                <FFShimmer width="45%" height={16} />
                <FFShimmer className="mt-4" width="35%" height={32} />
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

            <FFCard variant="primary" className="shadow-card p-5 text-white">
              <p className="font-body text-sm text-white/75">Today&apos;s score</p>
              <h1 className="mt-1 font-display text-4xl font-bold">{totalScore}</h1>
              <p className="mt-3 font-body text-sm leading-6 text-white/80">
                Your score grows when you complete routines, stay consistent, and keep building strong habits.
              </p>
            </FFCard>

            <section className="grid gap-4 md:grid-cols-3">
              <FFCard className="shadow-card p-5">
                <div className="flex items-center justify-between">
                  <BarChart3 size={20} className="text-primary" />
                  <span className="font-body text-xs uppercase tracking-wider text-slate-500">Completed</span>
                </div>
                <p className="mt-4 font-display text-3xl font-bold text-primary">{approved}</p>
                <p className="mt-2 font-body text-sm text-slate-500">Tasks finished today.</p>
              </FFCard>

              <FFCard className="shadow-card p-5">
                <div className="flex items-center justify-between">
                  <Trophy size={20} className="text-primary" />
                  <span className="font-body text-xs uppercase tracking-wider text-slate-500">Streak</span>
                </div>
                <p className="mt-4 font-display text-3xl font-bold text-primary">
                  {screenData.child.streak} days
                </p>
                <p className="mt-2 font-body text-sm text-slate-500">Keep it going one day at a time.</p>
              </FFCard>

              <FFCard className="shadow-card p-5">
                <div className="flex items-center justify-between">
                  <Sparkles size={20} className="text-primary" />
                  <span className="font-body text-xs uppercase tracking-wider text-slate-500">Still to do</span>
                </div>
                <p className="mt-4 font-display text-3xl font-bold text-primary">{pending}</p>
                <p className="mt-2 font-body text-sm text-slate-500">Tasks can still boost your score today.</p>
              </FFCard>
            </section>

            <section className="space-y-4">
              <FFSectionHeader icon={<Award />} title="Focus areas" />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {screenData.child.radarData.map((item) => {
                  const percent = Math.round((item.score / item.fullMark) * 100);

                  return (
                    <FFCard key={item.subject} className="shadow-card p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-display text-lg font-semibold text-primary">{item.subject}</p>
                          <p className="mt-2 font-body text-sm text-slate-500">
                            {item.score} out of {item.fullMark}
                          </p>
                        </div>
                        <span className="rounded-full bg-accent/15 px-3 py-1 font-body text-xs text-primary">
                          {percent}%
                        </span>
                      </div>
                      <div className="mt-4 h-3 rounded-full bg-slate-100">
                        <div className="h-3 rounded-full bg-accent" style={{ width: `${percent}%` }} />
                      </div>
                    </FFCard>
                  );
                })}
              </div>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
};

export default MyScoresScreen;
