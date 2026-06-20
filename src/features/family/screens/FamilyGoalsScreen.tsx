import React, { useEffect, useReducer } from 'react';
import { Calendar, Plus, Target, Trophy, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../../../core/auth/AuthContext';
import { FamilyGoal, FamilyGoalRepository } from '../repositories/FamilyGoalRepository';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import FFShimmer from '../../../shared/components/FFShimmer';

type NewGoal = {
  title: string;
  description: string;
  targetValue: string;
  unit: string;
  deadline: string;
  reward: string;
};

type State = {
  goals: FamilyGoal[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  showComposer: boolean;
  newGoal: NewGoal;
};

type Action =
  | { type: 'SET_GOALS'; goals: FamilyGoal[] }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_SAVING'; isSaving: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_SHOW_COMPOSER'; showComposer: boolean }
  | { type: 'SET_NEW_GOAL_FIELD'; field: keyof NewGoal; value: string }
  | { type: 'RESET_NEW_GOAL' };

const initialNewGoal = (): NewGoal => ({
  title: '',
  description: '',
  targetValue: '100',
  unit: 'Points',
  deadline: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  reward: '',
});

const initialState: State = {
  goals: [],
  isLoading: true,
  isSaving: false,
  error: null,
  showComposer: false,
  newGoal: initialNewGoal(),
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_GOALS':
      return { ...state, goals: action.goals, error: null };
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading };
    case 'SET_SAVING':
      return { ...state, isSaving: action.isSaving };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    case 'SET_SHOW_COMPOSER':
      return { ...state, showComposer: action.showComposer };
    case 'SET_NEW_GOAL_FIELD':
      return {
        ...state,
        newGoal: { ...state.newGoal, [action.field]: action.value },
        error: null,
      };
    case 'RESET_NEW_GOAL':
      return { ...state, newGoal: initialNewGoal() };
    default:
      return state;
  }
};

const FamilyGoalsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadGoals = async () => {
    if (!user?.familyId) {
      dispatch({ type: 'SET_LOADING', isLoading: false });
      dispatch({ type: 'SET_ERROR', error: 'Family membership is required to view goals.' });
      return;
    }

    dispatch({ type: 'SET_LOADING', isLoading: true });
    dispatch({ type: 'SET_ERROR', error: null });

    try {
      const goals = await FamilyGoalRepository.getGoals(user.familyId);
      dispatch({ type: 'SET_GOALS', goals });
    } catch (caughtError: unknown) {
      const message =
        caughtError instanceof Error ? caughtError.message : 'We could not load family goals.';
      dispatch({ type: 'SET_ERROR', error: message });
    } finally {
      dispatch({ type: 'SET_LOADING', isLoading: false });
    }
  };

  useEffect(() => {
    void loadGoals();
  }, [user?.familyId]);

  const handleCreateGoal = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.familyId) {
      return;
    }

    dispatch({ type: 'SET_SAVING', isSaving: true });
    dispatch({ type: 'SET_ERROR', error: null });

    try {
      const createdGoal = await FamilyGoalRepository.createGoal(user.familyId, {
        title: state.newGoal.title.trim(),
        description: state.newGoal.description.trim(),
        targetValue: Number(state.newGoal.targetValue),
        currentValue: 0,
        unit: state.newGoal.unit.trim(),
        deadline: state.newGoal.deadline,
        reward: state.newGoal.reward.trim(),
      });

      dispatch({ type: 'SET_GOALS', goals: [...state.goals, createdGoal] });
      dispatch({ type: 'SET_SHOW_COMPOSER', showComposer: false });
      dispatch({ type: 'RESET_NEW_GOAL' });
    } catch (caughtError: unknown) {
      const message =
        caughtError instanceof Error ? caughtError.message : 'We could not save the new goal.';
      dispatch({ type: 'SET_ERROR', error: message });
    } finally {
      dispatch({ type: 'SET_SAVING', isSaving: false });
    }
  };

  const activeGoals = state.goals.filter((goal) => goal.status === 'Active').length;
  const completedGoals = state.goals.filter((goal) => goal.status === 'Completed').length;
  const averageProgress =
    state.goals.length === 0
      ? 0
      : Math.round(
          state.goals.reduce((sum, goal) => sum + (goal.currentValue / goal.targetValue) * 100, 0) /
            state.goals.length,
        );

  return (
    <div className="min-h-screen bg-bg-cream page-enter">
      <FFPageHeader
        title="Family goals"
        subtitle="Shared progress for the whole home"
        showBack
        onBack={() => navigate(-1)}
        rightAction={
          <FFButton onClick={() => dispatch({ type: 'SET_SHOW_COMPOSER', showComposer: !state.showComposer })} icon={<Plus className="h-4 w-4" />}>
            Add goal
          </FFButton>
        }
      />

      <main className="mx-auto max-w-4xl px-4 py-6 pb-24 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="space-y-4"
        >
          <FFCard variant="primary" className="space-y-3 p-6 text-white">
            <p className="font-display text-xl font-bold text-white">Goals that keep everyone moving</p>
            <p className="text-sm text-white/75">
              Turn family effort into shared milestones, rewards, and simple weekly momentum.
            </p>
          </FFCard>

          <div className="grid gap-3 sm:grid-cols-3">
            <FFCard className="p-4">
              <p className="text-xs font-semibold text-gray-500">Active goals</p>
              <p className="mt-2 font-numbers text-2xl text-primary">{activeGoals}</p>
            </FFCard>
            <FFCard className="p-4">
              <p className="text-xs font-semibold text-gray-500">Completed goals</p>
              <p className="mt-2 font-numbers text-2xl text-primary">{completedGoals}</p>
            </FFCard>
            <FFCard className="p-4">
              <p className="text-xs font-semibold text-gray-500">Average progress</p>
              <p className="mt-2 font-numbers text-2xl text-primary">{averageProgress}%</p>
            </FFCard>
          </div>

          {state.showComposer ? (
            <FFCard className="space-y-5 p-4 sm:p-5 lg:p-6">
              <FFSectionHeader icon={<Target />} title="New goal" />
              <form className="space-y-4" onSubmit={handleCreateGoal}>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-500">Title</label>
                  <input
                    type="text"
                    value={state.newGoal.title}
                    onChange={(event) => dispatch({ type: 'SET_NEW_GOAL_FIELD', field: 'title', value: event.target.value })}
                    className="min-h-12 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-accent"
                    placeholder="Example: Sunday picnic fund"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-500">Description</label>
                  <textarea
                    rows={3}
                    value={state.newGoal.description}
                    onChange={(event) => dispatch({ type: 'SET_NEW_GOAL_FIELD', field: 'description', value: event.target.value })}
                    className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-accent"
                    placeholder="Explain what the family is working toward."
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gray-500">Target</label>
                    <input
                      type="number"
                      min="1"
                      value={state.newGoal.targetValue}
                      onChange={(event) => dispatch({ type: 'SET_NEW_GOAL_FIELD', field: 'targetValue', value: event.target.value })}
                      className="min-h-12 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-accent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gray-500">Unit</label>
                    <input
                      type="text"
                      value={state.newGoal.unit}
                      onChange={(event) => dispatch({ type: 'SET_NEW_GOAL_FIELD', field: 'unit', value: event.target.value })}
                      className="min-h-12 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-accent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gray-500">Deadline</label>
                    <input
                      type="date"
                      value={state.newGoal.deadline}
                      onChange={(event) => dispatch({ type: 'SET_NEW_GOAL_FIELD', field: 'deadline', value: event.target.value })}
                      className="min-h-12 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-accent"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-500">Reward</label>
                  <input
                    type="text"
                    value={state.newGoal.reward}
                    onChange={(event) => dispatch({ type: 'SET_NEW_GOAL_FIELD', field: 'reward', value: event.target.value })}
                    className="min-h-12 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-accent"
                    placeholder="Example: Family movie night"
                  />
                </div>

                {state.error ? (
                  <FFErrorState title="Goal could not be saved" message={state.error} onRetry={() => dispatch({ type: 'SET_ERROR', error: null })} />
                ) : null}

                <div className="flex gap-3">
                  <FFButton variant="outline" className="flex-1" onClick={() => dispatch({ type: 'SET_SHOW_COMPOSER', showComposer: false })}>
                    Cancel
                  </FFButton>
                  <FFButton type="submit" className="flex-1" isLoading={state.isSaving}>
                    Save goal
                  </FFButton>
                </div>
              </form>
            </FFCard>
          ) : null}

          <FFCard className="space-y-5 p-4 sm:p-5 lg:p-6">
            <FFSectionHeader icon={<Trophy />} title="Goal list" />

            {state.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <FFShimmer key={index} height="7rem" borderRadius="1rem" className="shimmer" />
                ))}
              </div>
            ) : null}

            {!state.isLoading && state.error ? (
              <FFErrorState title="Goals could not load" message={state.error} onRetry={() => void loadGoals()} />
            ) : null}

            {!state.isLoading && !state.error && state.goals.length === 0 ? (
              <FFEmptyState
                title="No goals yet"
                message="Create a shared goal to give the whole family something to work toward together."
                actionLabel="Create goal"
                onAction={() => dispatch({ type: 'SET_SHOW_COMPOSER', showComposer: true })}
              />
            ) : null}

            {!state.isLoading && !state.error && state.goals.length > 0 ? (
              <div className="space-y-3">
                {state.goals.map((goal) => {
                  const progress = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
                  return (
                    <FFCard key={goal.id} variant="warm" className="space-y-4 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-display text-sm font-semibold text-primary">{goal.title}</p>
                          <p className="mt-1 text-sm text-gray-500">{goal.description}</p>
                        </div>
                        <p className="font-numbers text-lg text-primary">{progress}%</p>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="text-sm text-gray-500">
                          <span className="font-semibold text-primary">{goal.currentValue}</span> of {goal.targetValue} {goal.unit}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(goal.deadline).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <TrendingUp className="h-4 w-4" />
                          <span>{goal.reward}</span>
                        </div>
                      </div>
                    </FFCard>
                  );
                })}
              </div>
            ) : null}
          </FFCard>
        </motion.div>
      </main>
    </div>
  );
};

export default FamilyGoalsScreen;
