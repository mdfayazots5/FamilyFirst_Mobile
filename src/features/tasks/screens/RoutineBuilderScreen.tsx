import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { Calendar, CheckCircle2, Clock, Plus, RefreshCw, Sparkles, Trash2, Users } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { FamilyRepository } from '../../family/repositories/FamilyRepository';
import { TaskItem, TaskRepository, TimeBlock } from '../repositories/TaskRepository';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import { FFCardSkeleton } from '../../../shared/components/FFShimmer';

const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const weekdayTitles = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const visibleBlocks: Array<{ id: Exclude<TimeBlock, 'School'>; label: string; detail: string }> = [
  { id: 'Morning', label: 'Morning', detail: 'Start the day with simple wins' },
  { id: 'Evening', label: 'Evening', detail: 'Homework, chores, and family routines' },
  { id: 'Night', label: 'Night', detail: 'Calm wrap-up before bed' },
];

type RoutineState =
  | { status: 'loading'; tasks: TaskItem[]; childName: string; error: null }
  | { status: 'ready'; tasks: TaskItem[]; childName: string; error: null }
  | { status: 'error'; tasks: TaskItem[]; childName: string; error: string };

type RoutineAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: { tasks: TaskItem[]; childName: string } }
  | { type: 'LOAD_ERROR'; error: string }
  | { type: 'DELETE_TASK'; payload: string };

const routineReducer = (state: RoutineState, action: RoutineAction): RoutineState => {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, status: 'loading', error: null };
    case 'LOAD_SUCCESS':
      return { status: 'ready', ...action.payload, error: null };
    case 'LOAD_ERROR':
      return { ...state, status: 'error', error: action.error };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter((task) => task.id !== action.payload) };
    default:
      return state;
  }
};

const getTasksForBlock = (tasks: TaskItem[], blockId: TimeBlock, dayIndex: number) => {
  const apiDay = dayIndex + 1;
  return tasks.filter((task) => task.timeBlock === blockId && task.recurringDays.includes(apiDay));
};

const RoutineBuilderScreen: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [routineState, dispatch] = useReducer(routineReducer, {
    status: 'loading',
    tasks: [],
    childName: '',
    error: null,
  });
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
  const [showExamModeConfirm, setShowExamModeConfirm] = useState(false);
  const [taskPendingDelete, setTaskPendingDelete] = useState<TaskItem | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadRoutine = useCallback(async () => {
    if (!user?.familyId || !childId) {
      dispatch({ type: 'LOAD_ERROR', error: 'Child details are required before a routine can be shown.' });
      return;
    }

    dispatch({ type: 'LOAD_START' });

    try {
      const [tasks, members] = await Promise.all([
        TaskRepository.getTasks(user.familyId, childId),
        FamilyRepository.getMembers(user.familyId),
      ]);
      const child = members.find((member) => member.id === childId);

      dispatch({
        type: 'LOAD_SUCCESS',
        payload: {
          tasks,
          childName: child?.name ?? 'Child',
        },
      });
    } catch {
      dispatch({ type: 'LOAD_ERROR', error: 'Routine details could not be loaded. Try again.' });
    }
  }, [childId, user?.familyId]);

  useEffect(() => {
    void loadRoutine();
  }, [loadRoutine]);

  const totals = useMemo(
    () => ({
      total: routineState.tasks.length,
      photoProof: routineState.tasks.filter((task) => task.isPhotoRequired).length,
      recurring: routineState.tasks.filter((task) => task.isRecurring).length,
    }),
    [routineState.tasks],
  );

  const handleDeleteTask = async () => {
    if (!user?.familyId || !taskPendingDelete) {
      return;
    }

    setActionError(null);

    try {
      await TaskRepository.deleteTask(user.familyId, taskPendingDelete.id);
      dispatch({ type: 'DELETE_TASK', payload: taskPendingDelete.id });
      setTaskPendingDelete(null);
    } catch {
      setActionError('The task could not be removed. Try again.');
    }
  };

  const handleExamMode = async () => {
    if (!user?.familyId || !childId) {
      return;
    }

    setActionError(null);

    try {
      await TaskRepository.applyExamSeasonMode(user.familyId, childId);
      await loadRoutine();
      setShowExamModeConfirm(false);
    } catch {
      setActionError('Exam mode could not be applied. Try again.');
    }
  };

  return (
    <div className="min-h-screen bg-bg-cream pb-24">
      <FFPageHeader
        title="Routine builder"
        subtitle={routineState.childName ? `${routineState.childName}'s weekly routine` : 'Weekly task planning'}
        showBack
        rightAction={
          <FFButton
            variant="ghost"
            size="sm"
            icon={<Sparkles className="h-4 w-4" />}
            onClick={() => setShowExamModeConfirm(true)}
          >
            Exam mode
          </FFButton>
        }
      />

      <main className="page-enter mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <FFCard variant="primary" className="space-y-4 p-5 sm:p-6">
          <div className="min-w-0">
            <p className="font-body text-xs font-bold uppercase tracking-wider text-white/70">
              Family routine
            </p>
            <h1 className="mt-1 text-xl font-display font-bold text-white sm:text-2xl">
              Keep the week clear and consistent
            </h1>
            <p className="mt-2 text-sm text-white/80">
              Build routines by time of day so a parent can review everything at a glance.
            </p>
          </div>
        </FFCard>

        {actionError ? (
          <FFCard variant="warm" className="p-4">
            <p className="text-sm text-alert">{actionError}</p>
          </FFCard>
        ) : null}

        <section className="space-y-3">
          <FFSectionHeader
            icon={<Users />}
            title="Overview"
            rightAction={
              <button
                type="button"
                onClick={() => void loadRoutine()}
                className="touch-target rounded-xl text-primary/70 transition-colors hover:text-primary"
                aria-label="Refresh routine"
              >
                <RefreshCw className={`h-4 w-4 ${routineState.status === 'loading' ? 'animate-spin' : ''}`} />
              </button>
            }
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <FFCard className="p-4">
              <p className="text-xs font-body font-semibold uppercase tracking-wider text-gray-400">Child</p>
              <p className="mt-2 font-display text-sm font-semibold text-primary">
                {routineState.childName || 'Waiting'}
              </p>
            </FFCard>
            <FFCard className="p-4">
              <p className="text-xs font-body font-semibold uppercase tracking-wider text-gray-400">Tasks</p>
              <p className="mt-2 font-numbers text-2xl text-primary">{totals.total}</p>
            </FFCard>
            <FFCard className="p-4">
              <p className="text-xs font-body font-semibold uppercase tracking-wider text-gray-400">Recurring</p>
              <p className="mt-2 font-numbers text-2xl text-primary">{totals.recurring}</p>
            </FFCard>
            <FFCard className="p-4">
              <p className="text-xs font-body font-semibold uppercase tracking-wider text-gray-400">Photo proof</p>
              <p className="mt-2 font-numbers text-2xl text-primary">{totals.photoProof}</p>
            </FFCard>
          </div>
        </section>

        <section className="space-y-3">
          <FFSectionHeader icon={<Calendar />} title="Day picker" />
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-7 sm:gap-4">
            {weekdayLabels.map((label, index) => (
              <FFButton
                key={label}
                type="button"
                variant={selectedDay === index ? 'primary' : 'outline'}
                onClick={() => setSelectedDay(index)}
              >
                {label}
              </FFButton>
            ))}
          </div>
        </section>

        {routineState.status === 'loading' && routineState.tasks.length === 0 ? (
          <div className="space-y-3">
            <FFCardSkeleton />
            <FFCardSkeleton />
            <FFCardSkeleton />
          </div>
        ) : null}

        {routineState.status === 'error' && routineState.tasks.length === 0 ? (
          <FFErrorState message={routineState.error} onRetry={() => void loadRoutine()} />
        ) : null}

        {routineState.status !== 'loading' && routineState.tasks.length === 0 ? (
          <FFEmptyState
            title="No tasks yet"
            message="Create the first task to start building this child’s weekly routine."
            actionLabel="Add first task"
            onAction={() => navigate(`/parent/routine/${childId}/add?day=${selectedDay}`)}
            icon={<Plus className="h-8 w-8" />}
          />
        ) : null}

        {routineState.tasks.length > 0 ? (
          <section className="space-y-6">
            <FFSectionHeader icon={<Clock />} title={weekdayTitles[selectedDay]} />
            <div className="grid gap-6 lg:grid-cols-3">
              {visibleBlocks.map((block) => {
                const blockTasks = getTasksForBlock(routineState.tasks, block.id, selectedDay);

                return (
                  <FFCard key={block.id} className="space-y-4 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-display text-sm font-semibold text-primary">{block.label}</p>
                        <p className="mt-1 text-sm text-gray-500">{block.detail}</p>
                      </div>
                      <FFButton
                        variant="outline"
                        size="sm"
                        icon={<Plus className="h-4 w-4" />}
                        onClick={() => navigate(`/parent/routine/${childId}/add?block=${block.id}&day=${selectedDay}`)}
                      >
                        Add
                      </FFButton>
                    </div>

                    {blockTasks.length === 0 ? (
                      <FFEmptyState
                        title={`No ${block.label.toLowerCase()} tasks`}
                        message="Add a routine step for this part of the day."
                        onAction={() => navigate(`/parent/routine/${childId}/add?block=${block.id}&day=${selectedDay}`)}
                        actionLabel="Add task"
                        icon={<Calendar className="h-8 w-8" />}
                      />
                    ) : (
                      <div className="space-y-3">
                        {blockTasks.map((task) => (
                          <FFCard key={task.id} variant="warm" className="space-y-3 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="font-display text-sm font-semibold text-primary">{task.name}</p>
                                <p className="mt-1 text-sm text-gray-500">
                                  {task.duration} min · {task.coinValue} coins
                                </p>
                              </div>
                              <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-body font-bold uppercase tracking-wider text-primary">
                                {task.pillarTag}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {task.isPhotoRequired ? (
                                <span className="rounded-full bg-accent/10 px-3 py-1 text-[10px] font-body font-bold uppercase tracking-wider text-accent">
                                  Photo proof
                                </span>
                              ) : null}
                              {task.isRecurring ? (
                                <span className="rounded-full bg-success/10 px-3 py-1 text-[10px] font-body font-bold uppercase tracking-wider text-success">
                                  Recurring
                                </span>
                              ) : null}
                            </div>

                            <div className="flex gap-3">
                              <FFButton
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => navigate(`/parent/routine/${childId}/edit/${task.id}`)}
                              >
                                Edit
                              </FFButton>
                              <FFButton
                                variant="alert"
                                size="sm"
                                className="flex-1"
                                icon={<Trash2 className="h-4 w-4" />}
                                onClick={() => setTaskPendingDelete(task)}
                              >
                                Delete
                              </FFButton>
                            </div>
                          </FFCard>
                        ))}
                      </div>
                    )}
                  </FFCard>
                );
              })}
            </div>
          </section>
        ) : null}

        <FFButton
          className="w-full"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => navigate(`/parent/routine/${childId}/add?day=${selectedDay}`)}
        >
          Add task for {weekdayTitles[selectedDay]}
        </FFButton>
      </main>

      {showExamModeConfirm ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-50 bg-primary/40"
            onClick={() => setShowExamModeConfirm(false)}
            aria-label="Close exam mode confirmation"
          />
          <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white p-4 shadow-elevated sm:p-6">
            <div className="mx-auto max-w-3xl space-y-4">
              <FFSectionHeader icon={<Sparkles />} title="Exam mode" />
              <FFCard variant="warm" className="space-y-3 p-4">
                <p className="text-sm text-gray-600">
                  Apply the saved exam routine for this child and refresh the current task list.
                </p>
              </FFCard>
              <div className="flex gap-3">
                <FFButton variant="outline" className="flex-1" onClick={() => setShowExamModeConfirm(false)}>
                  Cancel
                </FFButton>
                <FFButton className="flex-1" onClick={() => void handleExamMode()}>
                  Apply exam mode
                </FFButton>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {taskPendingDelete ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-50 bg-primary/40"
            onClick={() => setTaskPendingDelete(null)}
            aria-label="Close delete confirmation"
          />
          <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white p-4 shadow-elevated sm:p-6">
            <div className="mx-auto max-w-3xl space-y-4">
              <FFSectionHeader icon={<Trash2 />} title="Delete task" />
              <FFCard variant="warm" className="space-y-3 p-4">
                <p className="font-display text-sm font-semibold text-primary">{taskPendingDelete.name}</p>
                <p className="text-sm text-gray-600">
                  Remove this task from the routine. Existing history stays intact, but the task will no longer appear in the plan.
                </p>
              </FFCard>
              <div className="flex gap-3">
                <FFButton variant="outline" className="flex-1" onClick={() => setTaskPendingDelete(null)}>
                  Keep task
                </FFButton>
                <FFButton
                  variant="alert"
                  className="flex-1"
                  icon={<Trash2 className="h-4 w-4" />}
                  onClick={() => void handleDeleteTask()}
                >
                  Delete task
                </FFButton>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default RoutineBuilderScreen;
