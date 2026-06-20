import React, { useEffect, useReducer, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Filter,
  MessageSquare,
  RefreshCw,
  Sparkles,
  Target,
  TriangleAlert,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import FFAvatar from '../../../shared/components/FFAvatar';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import {
  ChildDetail,
  ChildLookupOption,
  ChildRepository,
  Feedback,
  TaskCompletion,
} from '../repositories/ChildRepository';

type TabKey = 'tasks' | 'feedback';

interface ChildDetailPayload {
  child: ChildDetail;
  tasks: TaskCompletion[];
  feedback: Feedback[];
  taskTypes: ChildLookupOption[];
  taskStatuses: ChildLookupOption[];
}

type ChildDetailState =
  | { status: 'loading'; data: ChildDetailPayload | null; error: string | null }
  | { status: 'ready'; data: ChildDetailPayload; error: string | null }
  | { status: 'error'; data: ChildDetailPayload | null; error: string };

type ChildDetailAction =
  | { type: 'LOAD_START'; preserve: ChildDetailPayload | null }
  | { type: 'LOAD_SUCCESS'; payload: ChildDetailPayload }
  | { type: 'LOAD_ERROR'; error: string }
  | { type: 'TASK_UPDATED'; payload: TaskCompletion[] }
  | { type: 'FEEDBACK_UPDATED'; payload: Feedback[] };

const initialState: ChildDetailState = {
  status: 'loading',
  data: null,
  error: null,
};

function reducer(state: ChildDetailState, action: ChildDetailAction): ChildDetailState {
  switch (action.type) {
    case 'LOAD_START':
      return { status: 'loading', data: action.preserve, error: null };
    case 'LOAD_SUCCESS':
      return { status: 'ready', data: action.payload, error: null };
    case 'LOAD_ERROR':
      return { status: 'error', data: state.data, error: action.error };
    case 'TASK_UPDATED':
      return state.data
        ? { ...state, data: { ...state.data, tasks: action.payload } }
        : state;
    case 'FEEDBACK_UPDATED':
      return state.data
        ? { ...state, data: { ...state.data, feedback: action.payload } }
        : state;
    default:
      return state;
  }
}

const statusTone: Record<TaskCompletion['status'], string> = {
  done: 'bg-success/10 text-success',
  pending: 'bg-accent/15 text-primary',
  missed: 'bg-alert/10 text-alert',
  flagged: 'bg-alert/10 text-alert',
};

const ChildDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const { childId } = useParams<{ childId: string }>();
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [activeTab, setActiveTab] = useState<TabKey>('tasks');
  const [selectedTaskType, setSelectedTaskType] = useState<string>('All');
  const [selectedTaskStatus, setSelectedTaskStatus] = useState<string>('All');

  const loadScreen = async () => {
    if (!user?.familyId || !childId) {
      dispatch({ type: 'LOAD_ERROR', error: 'Child details are not available.' });
      return;
    }

    dispatch({ type: 'LOAD_START', preserve: state.data });

    try {
      const [child, tasks, feedback, taskTypes, taskStatuses] = await Promise.all([
        ChildRepository.getChildDetail(user.familyId, childId),
        ChildRepository.getTaskCompletions(user.familyId, childId),
        ChildRepository.getFeedback(user.familyId, childId),
        ChildRepository.getTaskTypes(),
        ChildRepository.getTaskStatuses(),
      ]);

      dispatch({
        type: 'LOAD_SUCCESS',
        payload: { child, tasks, feedback, taskTypes, taskStatuses },
      });
    } catch (error) {
      console.error('Failed to load child detail screen', error);
      dispatch({ type: 'LOAD_ERROR', error: 'Unable to load this child profile right now.' });
    }
  };

  useEffect(() => {
    void loadScreen();
  }, [user?.familyId, childId]);

  const payload = state.data;

  const filteredTasks = (payload?.tasks ?? []).filter((task) => {
    const matchesType =
      selectedTaskType === 'All' ||
      task.category.toLowerCase() ===
        (payload?.taskTypes.find((item) => item.id === selectedTaskType)?.label ?? '').toLowerCase();

    const matchesStatus =
      selectedTaskStatus === 'All' ||
      task.status.toLowerCase() ===
        (payload?.taskStatuses.find((item) => item.id === selectedTaskStatus)?.code ?? '').toLowerCase();

    return matchesType && matchesStatus;
  });

  const handleTaskReview = async (task: TaskCompletion, status: 'done' | 'flagged') => {
    if (!user?.familyId) {
      return;
    }

    try {
      await ChildRepository.reviewTask(user.familyId, task.id, status);
      const nextTasks = (payload?.tasks ?? []).map((item) =>
        item.id === task.id ? { ...item, status: status === 'done' ? 'done' : 'flagged' } : item,
      );
      dispatch({ type: 'TASK_UPDATED', payload: nextTasks });
    } catch (error) {
      console.error('Failed to review child task', error);
    }
  };

  const handleAcknowledgeFeedback = async (feedbackItem: Feedback) => {
    try {
      await ChildRepository.acknowledgeFeedback(feedbackItem.id, 'Acknowledged by parent');
      const nextFeedback = (payload?.feedback ?? []).map((item) =>
        item.id === feedbackItem.id ? { ...item, isRead: true } : item,
      );
      dispatch({ type: 'FEEDBACK_UPDATED', payload: nextFeedback });
    } catch (error) {
      console.error('Failed to acknowledge child feedback', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F4EE]">
      <FFPageHeader
        title={payload?.child.name ?? 'Child details'}
        subtitle="Parent progress view"
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
        {state.status === 'loading' && !payload ? (
          <div className="space-y-4">
            <FFCard className="shadow-card p-5">
              <div className="flex items-center gap-4">
                <FFShimmer width={72} height={72} borderRadius="9999px" />
                <div className="flex-1 space-y-3">
                  <FFShimmer width="40%" height={20} />
                  <FFShimmer width="65%" height={14} />
                </div>
              </div>
            </FFCard>
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <FFCard key={index} className="shadow-card p-5">
                  <FFShimmer height={18} width="55%" />
                  <FFShimmer className="mt-4" height={34} width="35%" />
                </FFCard>
              ))}
            </div>
          </div>
        ) : null}

        {state.status === 'error' && !payload ? (
          <FFErrorState message={state.error} onRetry={() => void loadScreen()} />
        ) : null}

        {payload ? (
          <>
            {state.status === 'error' ? (
              <FFCard className="shadow-card border-alert/20 bg-alert/5 p-4">
                <p className="font-body text-sm text-alert">{state.error}</p>
              </FFCard>
            ) : null}

            <FFCard className="shadow-card p-5">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <FFAvatar name={payload.child.name} size="xl" />
                  <div>
                    <h1 className="font-display text-2xl font-bold text-primary">{payload.child.name}</h1>
                    <p className="mt-1 font-body text-sm text-slate-500">
                      Daily score {payload.child.todayScore} with a {payload.child.streak}-day streak.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  <div className="rounded-ff-sm bg-primary/5 px-4 py-3 text-center">
                    <p className="font-display text-xl font-bold text-primary">{payload.tasks.length}</p>
                    <p className="font-body text-xs text-slate-500">Tasks</p>
                  </div>
                  <div className="rounded-ff-sm bg-accent/15 px-4 py-3 text-center">
                    <p className="font-display text-xl font-bold text-primary">{payload.feedback.length}</p>
                    <p className="font-body text-xs text-slate-500">Feedback items</p>
                  </div>
                  <div className="rounded-ff-sm bg-success/10 px-4 py-3 text-center">
                    <p className="font-display text-xl font-bold text-primary">{payload.child.radarData.length}</p>
                    <p className="font-body text-xs text-slate-500">Focus areas</p>
                  </div>
                </div>
              </div>
            </FFCard>

            <section className="grid gap-4 md:grid-cols-3">
              {payload.child.radarData.map((item) => (
                <FFCard key={item.subject} className="shadow-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-lg font-semibold text-primary">{item.subject}</p>
                      <p className="mt-1 font-body text-sm text-slate-500">
                        {item.score} out of {item.fullMark}
                      </p>
                    </div>
                    <span className="rounded-full bg-primary/5 px-3 py-1 font-body text-xs text-primary">
                      {Math.round((item.score / item.fullMark) * 100)}%
                    </span>
                  </div>
                </FFCard>
              ))}
            </section>

            <div className="flex flex-wrap gap-3">
              <FFButton
                variant={activeTab === 'tasks' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('tasks')}
              >
                Tasks
              </FFButton>
              <FFButton
                variant={activeTab === 'feedback' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('feedback')}
              >
                Feedback
              </FFButton>
              <FFButton variant="ghost" onClick={() => navigate('/parent/feedback')}>
                Open full inbox
              </FFButton>
            </div>

            {activeTab === 'tasks' ? (
              <section className="space-y-4">
                <FFSectionHeader
                  icon={<Filter />}
                  title="Task progress"
                  rightAction={
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <select
                        value={selectedTaskType}
                        onChange={(event) => setSelectedTaskType(event.target.value)}
                        className="min-h-12 rounded-ff border border-black/10 bg-white px-4 font-body text-sm text-primary"
                      >
                        <option value="All">All categories</option>
                        {payload.taskTypes.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                      <select
                        value={selectedTaskStatus}
                        onChange={(event) => setSelectedTaskStatus(event.target.value)}
                        className="min-h-12 rounded-ff border border-black/10 bg-white px-4 font-body text-sm text-primary"
                      >
                        <option value="All">All statuses</option>
                        {payload.taskStatuses.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  }
                />

                {filteredTasks.length === 0 ? (
                  <FFEmptyState
                    title="No tasks match this filter"
                    message="Try another category or status to review your child's latest routine activity."
                  />
                ) : (
                  <div className="space-y-3">
                    {filteredTasks.map((task) => (
                      <FFCard key={task.id} className="shadow-card p-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-display text-lg font-semibold text-primary">{task.title}</p>
                              <span className={`rounded-full px-3 py-1 font-body text-xs ${statusTone[task.status]}`}>
                                {task.status}
                              </span>
                            </div>
                            <p className="mt-2 font-body text-sm text-slate-500">
                              {task.category} • {task.time}
                            </p>
                            {task.photoUrl ? (
                              <a
                                href={task.photoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 inline-flex text-sm text-primary underline underline-offset-4"
                              >
                                View proof photo
                              </a>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <FFButton
                              variant="outline"
                              onClick={() => void handleTaskReview(task, 'flagged')}
                            >
                              Flag
                            </FFButton>
                            <FFButton onClick={() => void handleTaskReview(task, 'done')}>
                              Approve
                            </FFButton>
                          </div>
                        </div>
                      </FFCard>
                    ))}
                  </div>
                )}
              </section>
            ) : (
              <section className="space-y-4">
                <FFSectionHeader icon={<MessageSquare />} title="Teacher feedback" />
                {payload.feedback.length === 0 ? (
                  <FFEmptyState
                    title="No feedback yet"
                    message="Teacher messages and classroom observations will appear here."
                  />
                ) : (
                  <div className="space-y-3">
                    {payload.feedback.map((item) => (
                      <FFCard key={item.id} className="shadow-card p-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-display text-lg font-semibold text-primary">{item.teacherName}</p>
                              <span className="rounded-full bg-primary/5 px-3 py-1 font-body text-xs text-primary">
                                {item.type}
                              </span>
                              {!item.isRead ? (
                                <span className="rounded-full bg-accent/15 px-3 py-1 font-body text-xs text-primary">
                                  New
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-2 font-body text-sm text-slate-500">{item.message}</p>
                            <p className="mt-2 font-body text-xs text-slate-400">
                              {new Date(item.date).toLocaleDateString()}
                            </p>
                          </div>
                          {!item.isRead ? (
                            <FFButton onClick={() => void handleAcknowledgeFeedback(item)}>
                              Acknowledge
                            </FFButton>
                          ) : (
                            <FFButton variant="ghost" disabled icon={<CheckCircle2 size={16} />}>
                              Acknowledged
                            </FFButton>
                          )}
                        </div>
                      </FFCard>
                    ))}
                  </div>
                )}
              </section>
            )}

            <section className="grid gap-4 md:grid-cols-3">
              <FFCard className="shadow-card p-4">
                <FFSectionHeader icon={<Target />} title="Today focus" />
                <p className="mt-4 font-body text-sm text-slate-500">
                  Keep routines steady and clear any pending study or responsibility tasks by evening.
                </p>
              </FFCard>
              <FFCard className="shadow-card p-4">
                <FFSectionHeader icon={<BookOpen />} title="Study reminder" />
                <p className="mt-4 font-body text-sm text-slate-500">
                  Review homework proof submissions before rewards are approved for the day.
                </p>
              </FFCard>
              <FFCard className="shadow-card p-4">
                <FFSectionHeader icon={<Sparkles />} title="Parent note" />
                <p className="mt-4 font-body text-sm text-slate-500">
                  Use feedback acknowledgements to close the loop with teachers and children consistently.
                </p>
              </FFCard>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
};

export default ChildDetailScreen;
