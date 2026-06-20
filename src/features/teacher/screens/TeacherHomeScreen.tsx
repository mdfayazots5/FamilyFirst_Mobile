import React, { useCallback, useEffect, useMemo, useReducer } from 'react';
import { BookOpen, Calendar, CheckCircle2, ChevronRight, Clock, Home, List, RefreshCw, Settings, Star, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { AttendanceRepository, AttendanceSession } from '../repositories/AttendanceRepository';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import { FFCardSkeleton } from '../../../shared/components/FFShimmer';

type SessionState =
  | { status: 'loading'; data: AttendanceSession[]; error: null }
  | { status: 'ready'; data: AttendanceSession[]; error: null }
  | { status: 'error'; data: AttendanceSession[]; error: string };

type SessionAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: AttendanceSession[] }
  | { type: 'LOAD_ERROR'; error: string };

const sessionReducer = (state: SessionState, action: SessionAction): SessionState => {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, status: 'loading', error: null };
    case 'LOAD_SUCCESS':
      return { status: 'ready', data: action.payload, error: null };
    case 'LOAD_ERROR':
      return { status: 'error', data: state.data, error: action.error };
    default:
      return state;
  }
};

const formatDate = (value: Date) =>
  value.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

const formatSessionDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

const TeacherHomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sessionState, dispatch] = useReducer(sessionReducer, {
    status: 'loading',
    data: [],
    error: null,
  });

  const loadSessions = useCallback(async () => {
    if (!user?.familyId) {
      dispatch({ type: 'LOAD_ERROR', error: 'Teacher sessions are unavailable until a family is selected.' });
      return;
    }

    dispatch({ type: 'LOAD_START' });

    try {
      const sessions = await AttendanceRepository.getTodaySessions(user.familyId);
      dispatch({ type: 'LOAD_SUCCESS', payload: sessions });
    } catch {
      dispatch({ type: 'LOAD_ERROR', error: 'Today’s sessions could not be loaded. Try again.' });
    }
  }, [user?.familyId]);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const pendingSessions = useMemo(
    () => sessionState.data.filter((session) => !session.isSubmitted),
    [sessionState.data],
  );
  const completedSessions = useMemo(
    () => sessionState.data.filter((session) => session.isSubmitted),
    [sessionState.data],
  );
  const activeSession = pendingSessions[0] ?? null;
  const studentCount = sessionState.data.reduce((total, session) => total + session.studentCount, 0);

  return (
    <div className="min-h-screen bg-bg-cream pb-24">
      <FFPageHeader
        variant="home"
        roleLabel="Teacher"
        rightAction={
          <button
            type="button"
            onClick={() => navigate('/teacher/settings')}
            className="touch-target rounded-xl text-white/80 transition-colors hover:text-white"
            aria-label="Open settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        }
      />

      <main className="page-enter mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <FFCard variant="primary" className="space-y-4 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-body text-xs font-bold uppercase tracking-wider text-white/70">
                My Sessions
              </p>
              <h1 className="mt-1 text-xl font-display font-bold text-white sm:text-2xl">
                Ready for today’s classes
              </h1>
              <p className="mt-2 text-sm text-white/80">{formatDate(new Date())}</p>
            </div>
            <div className="rounded-full bg-white/10 px-3 py-2 text-right">
              <p className="font-numbers text-2xl text-white">{pendingSessions.length}</p>
              <p className="text-[10px] font-body font-semibold uppercase tracking-wider text-white/70">
                Pending
              </p>
            </div>
          </div>

          <FFButton
            className="w-full"
            icon={<CheckCircle2 className="h-4 w-4" />}
            onClick={() =>
              activeSession
                ? navigate(`/teacher/attendance/${activeSession.id}`)
                : navigate('/teacher/create-session')
            }
          >
            {activeSession ? 'Mark Attendance' : 'Create Session'}
          </FFButton>
        </FFCard>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          <FFCard className="p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-ff-sm bg-primary/10 text-primary">
              <Clock className="h-5 w-5" />
            </div>
            <p className="font-numbers text-2xl text-primary">{pendingSessions.length}</p>
            <p className="mt-1 text-xs font-body text-gray-500">Sessions to submit</p>
          </FFCard>
          <FFCard className="p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-ff-sm bg-accent/10 text-accent">
              <Users className="h-5 w-5" />
            </div>
            <p className="font-numbers text-2xl text-primary">{studentCount}</p>
            <p className="mt-1 text-xs font-body text-gray-500">Students today</p>
          </FFCard>
        </div>

        {activeSession ? (
          <FFCard variant="accent" className="space-y-3 p-4">
            <FFSectionHeader icon={<Clock />} title="Active session" />
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-display text-sm font-semibold text-primary">
                  {activeSession.subject}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {activeSession.sessionName} · {activeSession.startTime}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {activeSession.studentCount} students · {formatSessionDate(activeSession.scheduledDate)}
                </p>
              </div>
              <FFButton
                variant="accent"
                size="sm"
                icon={<ChevronRight className="h-4 w-4" />}
                onClick={() => navigate(`/teacher/attendance/${activeSession.id}`)}
              >
                Open
              </FFButton>
            </div>
          </FFCard>
        ) : null}

        <section className="space-y-3">
          <FFSectionHeader
            icon={<Calendar />}
            title="Today"
            rightAction={
              <button
                type="button"
                onClick={() => void loadSessions()}
                className="touch-target rounded-xl text-primary/70 transition-colors hover:text-primary"
                aria-label="Refresh sessions"
              >
                <RefreshCw className={`h-4 w-4 ${sessionState.status === 'loading' ? 'animate-spin' : ''}`} />
              </button>
            }
          />

          {sessionState.status === 'loading' && sessionState.data.length === 0 ? (
            <div className="space-y-3">
              <FFCardSkeleton />
              <FFCardSkeleton />
              <FFCardSkeleton />
            </div>
          ) : null}

          {sessionState.status === 'error' && sessionState.data.length === 0 ? (
            <FFErrorState message={sessionState.error} onRetry={() => void loadSessions()} />
          ) : null}

          {sessionState.status !== 'loading' && sessionState.data.length === 0 ? (
            <FFEmptyState
              title="No sessions for today"
              message="Create a class session to start attendance for this family."
              actionLabel="Create session"
              onAction={() => navigate('/teacher/create-session')}
              icon={<Calendar className="h-8 w-8" />}
            />
          ) : null}

          {sessionState.data.length > 0 ? (
            <div className="space-y-3">
              {sessionState.data.map((session) => (
                <FFCard
                  key={session.id}
                  hoverable
                  onClick={() =>
                    session.isSubmitted
                      ? navigate('/teacher/feedback/history')
                      : navigate(`/teacher/attendance/${session.id}`)
                  }
                  className="p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-display text-sm font-semibold text-primary">
                        {session.subject}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {session.sessionName} · {session.startTime}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {session.studentCount} students · {formatSessionDate(session.scheduledDate)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-body font-bold uppercase tracking-wider ${
                          session.isSubmitted
                            ? 'bg-success/10 text-success'
                            : 'bg-accent/10 text-accent'
                        }`}
                      >
                        {session.isSubmitted ? 'Submitted' : 'Ready'}
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-300" />
                    </div>
                  </div>
                </FFCard>
              ))}
            </div>
          ) : null}
        </section>

        <section className="space-y-3">
          <FFSectionHeader icon={<Star />} title="Recent feedback" />
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:gap-6">
            <FFCard hoverable onClick={() => navigate('/teacher/feedback/new')} className="p-4">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-ff-sm bg-accent/10 text-accent">
                <Star className="h-5 w-5" />
              </div>
              <p className="font-display text-sm font-semibold text-primary">Share a note</p>
              <p className="mt-1 text-sm text-gray-500">
                Send appreciation, homework, or a weekly summary.
              </p>
            </FFCard>
            <FFCard hoverable onClick={() => navigate('/teacher/feedback/history')} className="p-4">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-ff-sm bg-primary/10 text-primary">
                <List className="h-5 w-5" />
              </div>
              <p className="font-display text-sm font-semibold text-primary">Review history</p>
              <p className="mt-1 text-sm text-gray-500">
                See what families have received and acknowledged.
              </p>
            </FFCard>
          </div>
        </section>

        <section className="space-y-3">
          <FFSectionHeader icon={<BookOpen />} title="History" />
          {completedSessions.length > 0 ? (
            <div className="space-y-3">
              {completedSessions.slice(0, 3).map((session) => (
                <FFCard key={session.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-display text-sm font-semibold text-primary">
                        {session.subject}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Submitted {session.submittedAt ? new Date(session.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'today'}
                      </p>
                    </div>
                    <span className="rounded-full bg-success/10 px-3 py-1 text-[10px] font-body font-bold uppercase tracking-wider text-success">
                      Complete
                    </span>
                  </div>
                </FFCard>
              ))}
            </div>
          ) : (
            <FFEmptyState
              title="No completed sessions yet"
              message="Submitted attendance will appear here after a class is marked."
              icon={<Home className="h-8 w-8" />}
            />
          )}
        </section>
      </main>
    </div>
  );
};

export default TeacherHomeScreen;
