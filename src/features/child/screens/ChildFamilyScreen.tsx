import React, { useEffect, useReducer } from 'react';
import {
  CalendarDays,
  Heart,
  RefreshCw,
  Target,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import FFCard from '../../../shared/components/FFCard';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import FFButton from '../../../shared/components/FFButton';
import { CalendarEvent, CalendarRepository } from '../../calendar/repositories/CalendarRepository';
import { FamilyGoal, FamilyGoalRepository } from '../../family/repositories/FamilyGoalRepository';
import { Appreciation, ElderRepository, GrandchildStatus } from '../../elder/repositories/ElderRepository';

interface ChildFamilyData {
  goals: FamilyGoal[];
  appreciations: Appreciation[];
  siblings: GrandchildStatus[];
  events: CalendarEvent[];
}

type ChildFamilyState =
  | { status: 'loading'; data: ChildFamilyData | null; error: string | null }
  | { status: 'ready'; data: ChildFamilyData; error: string | null }
  | { status: 'error'; data: ChildFamilyData | null; error: string };

type ChildFamilyAction =
  | { type: 'LOAD_START'; preserve: ChildFamilyData | null }
  | { type: 'LOAD_SUCCESS'; payload: ChildFamilyData }
  | { type: 'LOAD_ERROR'; error: string };

const initialState: ChildFamilyState = {
  status: 'loading',
  data: null,
  error: null,
};

function reducer(state: ChildFamilyState, action: ChildFamilyAction): ChildFamilyState {
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

const ChildFamilyScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadScreen = async () => {
    if (!user?.familyId) {
      dispatch({ type: 'LOAD_ERROR', error: 'Family details are not available right now.' });
      return;
    }

    dispatch({ type: 'LOAD_START', preserve: state.data });

    try {
      const [goals, appreciations, siblings, events] = await Promise.all([
        FamilyGoalRepository.getGoals(user.familyId),
        ElderRepository.getAppreciations(user.familyId),
        ElderRepository.getGrandchildren(user.familyId),
        CalendarRepository.getUpcomingEvents(user.familyId, 7),
      ]);

      dispatch({
        type: 'LOAD_SUCCESS',
        payload: {
          goals,
          appreciations,
          siblings: siblings.filter((item) => item.id !== user.id),
          events,
        },
      });
    } catch (error) {
      console.error('Failed to load child family screen', error);
      dispatch({ type: 'LOAD_ERROR', error: 'Unable to load your family space right now.' });
    }
  };

  useEffect(() => {
    void loadScreen();
  }, [user?.familyId, user?.id]);

  const screenData = state.data;

  return (
    <div className="min-h-screen bg-[#F8F4EE]">
      <FFPageHeader
        title="Family space"
        subtitle="Goals, love, and plans together"
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
          <p className="font-body text-sm text-white/75">This is your family team board</p>
          <h1 className="mt-1 font-display text-3xl font-bold">Cheer each other on</h1>
          <p className="mt-3 font-body text-sm leading-6 text-white/80">
            See family goals, special messages, and the plans everyone is working toward together.
          </p>
        </FFCard>

        {state.status === 'loading' && !screenData ? (
          <div className="space-y-4">
            <FFCard className="shadow-card p-5">
              <FFShimmer width="40%" height={18} />
              <FFShimmer className="mt-4" width="100%" height={14} />
              <FFShimmer className="mt-2" width="70%" height={14} />
            </FFCard>
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

            <section className="space-y-4">
              <FFSectionHeader icon={<Target />} title="Family goals" />
              {screenData.goals.length === 0 ? (
                <FFEmptyState
                  title="No family goal yet"
                  message="A shared goal will show up here when your family sets one."
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {screenData.goals.map((goal) => {
                    const progress = goal.targetValue > 0
                      ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
                      : 0;

                    return (
                      <FFCard key={goal.id} className="shadow-card p-5">
                        <p className="font-display text-xl font-semibold text-primary">{goal.title}</p>
                        <p className="mt-2 font-body text-sm text-slate-500">{goal.description}</p>
                        <div className="mt-4 h-3 rounded-full bg-slate-100">
                          <div className="h-3 rounded-full bg-accent" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="mt-4 flex items-center justify-between font-body text-sm text-slate-500">
                          <span>
                            {goal.currentValue} / {goal.targetValue} {goal.unit}
                          </span>
                          <span>{progress}%</span>
                        </div>
                        <p className="mt-3 font-body text-sm text-primary">Reward: {goal.reward}</p>
                      </FFCard>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <FFSectionHeader icon={<Heart />} title="Appreciation" />
                {screenData.appreciations.length === 0 ? (
                  <FFEmptyState
                    title="No appreciation yet"
                    message="Encouraging messages from elders and family will appear here."
                  />
                ) : (
                  <div className="space-y-3">
                    {screenData.appreciations.slice(0, 3).map((item) => (
                      <FFCard key={item.id} className="shadow-card p-4">
                        <p className="font-display text-base font-semibold text-primary">{item.authorName}</p>
                        <p className="mt-2 font-body text-sm leading-6 text-slate-600">{item.message}</p>
                        <p className="mt-3 font-body text-xs text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </FFCard>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <FFSectionHeader icon={<Users />} title="My family" />
                {screenData.siblings.length === 0 ? (
                  <FFEmptyState
                    title="No sibling updates yet"
                    message="Progress from your family members will show up here."
                  />
                ) : (
                  <div className="space-y-3">
                    {screenData.siblings.map((item) => (
                      <FFCard key={item.id} className="shadow-card p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-display text-base font-semibold text-primary">{item.name}</p>
                            <p className="mt-2 font-body text-sm text-slate-500">
                              {item.tasksCompleted} of {item.totalTasks} tasks completed
                            </p>
                          </div>
                          <span className="rounded-full bg-primary/5 px-3 py-1 font-body text-xs text-primary">
                            {item.status}
                          </span>
                        </div>
                      </FFCard>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-4">
              <FFSectionHeader icon={<CalendarDays />} title="Coming up" />
              {screenData.events.length === 0 ? (
                <FFEmptyState
                  title="No family events this week"
                  message="Upcoming plans and celebrations will show here."
                />
              ) : (
                <div className="grid gap-3 md:grid-cols-3">
                  {screenData.events.slice(0, 3).map((event) => (
                    <FFCard key={event.id} className="shadow-card p-4">
                      <p className="font-display text-base font-semibold text-primary">{event.title}</p>
                      <p className="mt-2 font-body text-sm text-slate-500">{event.type}</p>
                      <p className="mt-2 font-body text-xs text-slate-400">
                        {new Date(event.startDateTime).toLocaleDateString()}
                      </p>
                    </FFCard>
                  ))}
                </div>
              )}
            </section>

            <FFButton variant="outline" onClick={() => navigate('/child')}>
              Back to my day
            </FFButton>
          </>
        ) : null}
      </main>
    </div>
  );
};

export default ChildFamilyScreen;
