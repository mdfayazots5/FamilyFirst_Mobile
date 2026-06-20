import React, { useEffect, useReducer } from 'react';
import {
  Award,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  Flame,
  RefreshCw,
  ShieldAlert,
  Star,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import { DashboardData, DashboardRepository } from '../repositories/DashboardRepository';

type ParentHomeState =
  | { status: 'loading'; data: DashboardData | null; error: string | null }
  | { status: 'ready'; data: DashboardData; error: string | null }
  | { status: 'error'; data: DashboardData | null; error: string };

type ParentHomeAction =
  | { type: 'LOAD_START'; preserve: DashboardData | null }
  | { type: 'LOAD_SUCCESS'; payload: DashboardData }
  | { type: 'LOAD_ERROR'; error: string };

const initialState: ParentHomeState = {
  status: 'loading',
  data: null,
  error: null,
};

function reducer(state: ParentHomeState, action: ParentHomeAction): ParentHomeState {
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

const ParentHomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadDashboard = async () => {
    if (!user?.familyId) {
      dispatch({ type: 'LOAD_ERROR', error: 'Family details are not available for this account.' });
      return;
    }

    dispatch({ type: 'LOAD_START', preserve: state.data });

    try {
      const data = await DashboardRepository.getDashboard(user.familyId);
      dispatch({ type: 'LOAD_SUCCESS', payload: data });
    } catch (error) {
      console.error('Failed to load parent dashboard', error);
      dispatch({ type: 'LOAD_ERROR', error: 'Unable to load the parent dashboard right now.' });
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, [user?.familyId]);

  const dashboard = state.data;

  return (
    <div className="min-h-screen bg-[#F8F4EE]">
      <FFPageHeader
        variant="home"
        roleLabel="Parent"
        rightAction={
          <FFButton
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
            onClick={() => void loadDashboard()}
            icon={<RefreshCw size={16} />}
          >
            Refresh
          </FFButton>
        }
      />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 pb-24">
        <FFCard variant="primary" className="shadow-card p-5 text-white">
          <p className="font-body text-sm text-white/70">
            Welcome back, {user?.name?.split(' ')[0] ?? 'Parent'}
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold">Family progress at a glance</h1>
          <p className="mt-3 max-w-2xl font-body text-sm leading-6 text-white/80">
            Review today&apos;s child progress, pending approvals, and upcoming family events from one place.
          </p>
        </FFCard>

        {state.status === 'loading' && !dashboard ? (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <FFCard key={index} className="shadow-card p-5">
                <FFShimmer height={20} width="45%" />
                <FFShimmer className="mt-4" height={42} width="35%" />
                <FFShimmer className="mt-3" height={14} width="70%" />
              </FFCard>
            ))}
          </div>
        ) : null}

        {state.status === 'error' && !dashboard ? (
          <FFErrorState message={state.error} onRetry={() => void loadDashboard()} />
        ) : null}

        {dashboard ? (
          <>
            {state.status === 'error' ? (
              <FFCard className="shadow-card border-alert/20 bg-alert/5 p-4">
                <p className="font-body text-sm text-alert">{state.error}</p>
              </FFCard>
            ) : null}

            <section className="grid gap-4 md:grid-cols-3">
              <FFCard className="shadow-card p-5">
                <div className="flex items-center justify-between">
                  <span className="rounded-ff-sm bg-primary/5 p-3 text-primary">
                    <Star size={20} />
                  </span>
                  <span className="font-body text-xs uppercase tracking-wider text-slate-500">
                    Family score
                  </span>
                </div>
                <p className="mt-4 font-display text-3xl font-bold text-primary">
                  {dashboard.familyScore}
                </p>
                <p className="mt-2 font-body text-sm text-slate-500">
                  A combined snapshot of routines, participation, and feedback.
                </p>
              </FFCard>

              <FFCard
                hoverable
                onClick={() => navigate('/parent/verification')}
                className="shadow-card p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-ff-sm bg-accent/15 p-3 text-accent">
                    <ClipboardCheck size={20} />
                  </span>
                  <ChevronRight size={18} className="text-slate-400" />
                </div>
                <p className="mt-4 font-display text-3xl font-bold text-primary">
                  {dashboard.pendingCount}
                </p>
                <p className="mt-2 font-body text-sm text-slate-500">
                  approvals are waiting for your review.
                </p>
              </FFCard>

              <FFCard className="shadow-card p-5">
                <div className="flex items-center justify-between">
                  <span className="rounded-ff-sm bg-success/10 p-3 text-success">
                    <Flame size={20} />
                  </span>
                  <span className="font-body text-xs uppercase tracking-wider text-slate-500">
                    Current streak
                  </span>
                </div>
                <p className="mt-4 font-display text-3xl font-bold text-primary">
                  {dashboard.streak} days
                </p>
                <p className="mt-2 font-body text-sm text-slate-500">
                  Consistent family routines are holding steady this week.
                </p>
              </FFCard>
            </section>

            <section className="space-y-4">
              <FFSectionHeader icon={<Users />} title="Children" />
              <div className="grid gap-4 md:grid-cols-2">
                {dashboard.children.map((child) => {
                  const progress = child.totalTasks > 0
                    ? Math.round((child.tasksCompleted / child.totalTasks) * 100)
                    : 0;

                  return (
                    <FFCard
                      key={child.id}
                      hoverable
                      onClick={() => navigate(`/parent/child/${child.id}`)}
                      className="shadow-card p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-display text-xl font-semibold text-primary">{child.name}</p>
                          <p className="mt-1 font-body text-sm text-slate-500">
                            {child.tasksCompleted} of {child.totalTasks} tasks completed
                          </p>
                        </div>
                        <span className="font-body text-xs text-slate-500">{child.lastActive}</span>
                      </div>
                      <div className="mt-4 h-3 rounded-full bg-slate-100">
                        <div
                          className="h-3 rounded-full bg-accent"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="mt-4 flex items-center justify-between font-body text-sm text-slate-500">
                        <span>{progress}% complete</span>
                        <span className="inline-flex items-center gap-1 text-primary">
                          Open details
                          <ChevronRight size={16} />
                        </span>
                      </div>
                    </FFCard>
                  );
                })}
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <FFSectionHeader icon={<ShieldAlert />} title="Important alerts" />
                <div className="space-y-3">
                  {dashboard.alerts.map((alert) => (
                    <FFCard key={alert.id} className="shadow-card p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-display text-base font-semibold text-primary">
                            {alert.type.replace('_', ' ')}
                          </p>
                          <p className="mt-1 font-body text-sm text-slate-500">{alert.message}</p>
                        </div>
                        <span className="rounded-full bg-primary/5 px-3 py-1 font-body text-xs text-primary">
                          Priority {alert.priority}
                        </span>
                      </div>
                    </FFCard>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <FFSectionHeader icon={<CalendarDays />} title="Upcoming events" />
                <div className="space-y-3">
                  {dashboard.upcomingEvents.map((event) => (
                    <FFCard key={event.id} className="shadow-card p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-display text-base font-semibold text-primary">{event.title}</p>
                          <p className="mt-1 font-body text-sm text-slate-500">{event.type}</p>
                        </div>
                        <span className="rounded-full bg-accent/15 px-3 py-1 font-body text-xs text-primary">
                          {event.time}
                        </span>
                      </div>
                    </FFCard>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              <FFButton onClick={() => navigate('/parent/feedback')} className="w-full">
                Open feedback inbox
              </FFButton>
              <FFButton variant="outline" onClick={() => navigate('/parent/rewards')} className="w-full">
                Review reward shop
              </FFButton>
              <FFButton variant="outline" onClick={() => navigate('/parent/settings')} className="w-full">
                Parent settings
              </FFButton>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
};

export default ParentHomeScreen;
