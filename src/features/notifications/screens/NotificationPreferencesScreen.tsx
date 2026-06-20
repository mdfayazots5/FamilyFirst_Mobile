import React, { useEffect, useReducer } from 'react';
import {
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquare,
  Moon,
  Save,
  Trophy,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import {
  NotificationPreferences,
  NotificationRepository,
} from '../repositories/NotificationRepository';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import { FFCardSkeleton } from '../../../shared/components/FFShimmer';

type PreferencesState =
  | {
      status: 'loading';
      prefs: NotificationPreferences | null;
      error: null;
      isSaving: boolean;
      saveError: null;
      saveSuccess: boolean;
    }
  | {
      status: 'ready';
      prefs: NotificationPreferences;
      error: null;
      isSaving: boolean;
      saveError: string | null;
      saveSuccess: boolean;
    }
  | {
      status: 'error';
      prefs: NotificationPreferences | null;
      error: string;
      isSaving: boolean;
      saveError: null;
      saveSuccess: boolean;
    };

type PreferencesAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: NotificationPreferences }
  | { type: 'LOAD_ERROR'; error: string }
  | { type: 'UPDATE_PREF'; key: keyof NotificationPreferences; value: boolean | string }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_SUCCESS'; payload: NotificationPreferences }
  | { type: 'SAVE_ERROR'; error: string }
  | { type: 'CLEAR_SAVE_MESSAGE' };

const preferencesReducer = (
  state: PreferencesState,
  action: PreferencesAction,
): PreferencesState => {
  switch (action.type) {
    case 'LOAD_START':
      return {
        ...state,
        status: 'loading',
        error: null,
        saveError: null,
        saveSuccess: false,
      };
    case 'LOAD_SUCCESS':
      return {
        status: 'ready',
        prefs: action.payload,
        error: null,
        isSaving: false,
        saveError: null,
        saveSuccess: false,
      };
    case 'LOAD_ERROR':
      return {
        ...state,
        status: 'error',
        error: action.error,
        isSaving: false,
        saveError: null,
        saveSuccess: false,
      };
    case 'UPDATE_PREF':
      if (state.status !== 'ready') {
        return state;
      }

      return {
        ...state,
        prefs: {
          ...state.prefs,
          [action.key]: action.value,
        },
        saveError: null,
        saveSuccess: false,
      };
    case 'SAVE_START':
      if (state.status !== 'ready') {
        return state;
      }

      return {
        ...state,
        isSaving: true,
        saveError: null,
        saveSuccess: false,
      };
    case 'SAVE_SUCCESS':
      return {
        status: 'ready',
        prefs: action.payload,
        error: null,
        isSaving: false,
        saveError: null,
        saveSuccess: true,
      };
    case 'SAVE_ERROR':
      if (state.status !== 'ready') {
        return state;
      }

      return {
        ...state,
        isSaving: false,
        saveError: action.error,
        saveSuccess: false,
      };
    case 'CLEAR_SAVE_MESSAGE':
      if (state.status !== 'ready') {
        return state;
      }

      return {
        ...state,
        saveError: null,
        saveSuccess: false,
      };
    default:
      return state;
  }
};

const preferenceSections: Array<{
  key: keyof Pick<
    NotificationPreferences,
    'attendanceEnabled' | 'feedbackEnabled' | 'rewardEnabled' | 'taskEnabled' | 'calendarEnabled'
  >;
  title: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    key: 'attendanceEnabled',
    title: 'Attendance alerts',
    description: 'Receive updates when attendance is marked absent or late.',
    icon: <Bell className="h-4 w-4" />,
  },
  {
    key: 'feedbackEnabled',
    title: 'Teacher feedback',
    description: 'Stay informed when new remarks or observations are shared.',
    icon: <MessageSquare className="h-4 w-4" />,
  },
  {
    key: 'rewardEnabled',
    title: 'Reward requests',
    description: 'Get notified when a child requests a reward review.',
    icon: <Trophy className="h-4 w-4" />,
  },
  {
    key: 'taskEnabled',
    title: 'Task reviews',
    description: 'See when a completed task is ready for approval.',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  {
    key: 'calendarEnabled',
    title: 'Calendar reminders',
    description: 'Receive reminders for events, visits, and shared family plans.',
    icon: <Calendar className="h-4 w-4" />,
  },
];

const NotificationPreferencesScreen: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(preferencesReducer, {
    status: 'loading',
    prefs: null,
    error: null,
    isSaving: false,
    saveError: null,
    saveSuccess: false,
  });
  const [reloadToken, reload] = useReducer((value: number) => value + 1, 0);

  useEffect(() => {
    const loadPreferences = async () => {
      if (!user?.id) {
        dispatch({
          type: 'LOAD_ERROR',
          error: 'Notification preferences will appear once your profile is available.',
        });
        return;
      }

      dispatch({ type: 'LOAD_START' });

      try {
        const prefs = await NotificationRepository.getPreferences(user.id);
        dispatch({ type: 'LOAD_SUCCESS', payload: prefs });
      } catch {
        dispatch({
          type: 'LOAD_ERROR',
          error: 'Your notification settings could not be loaded right now. Please try again.',
        });
      }
    };

    void loadPreferences();
  }, [reloadToken, user?.id]);

  const handleSave = async () => {
    if (!user?.id || state.status !== 'ready') {
      return;
    }

    dispatch({ type: 'SAVE_START' });

    try {
      const updated = await NotificationRepository.updatePreferences(user.id, state.prefs);
      dispatch({ type: 'SAVE_SUCCESS', payload: updated });
    } catch {
      dispatch({
        type: 'SAVE_ERROR',
        error: 'Your changes could not be saved. Please review the times and try again.',
      });
    }
  };

  const renderToggle = (
    key: keyof NotificationPreferences,
    title: string,
    description: string,
    icon: React.ReactNode,
  ) => {
    if (state.status !== 'ready') {
      return null;
    }

    const isEnabled = Boolean(state.prefs[key]);

    return (
      <FFCard key={title} className="flex items-center justify-between gap-4 p-4 shadow-card">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-ff-sm bg-primary/5 text-primary">
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-display font-semibold text-primary">{title}</p>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <FFButton
          type="button"
          variant={isEnabled ? 'primary' : 'outline'}
          size="sm"
          onClick={() =>
            dispatch({ type: 'UPDATE_PREF', key, value: !isEnabled })
          }
        >
          {isEnabled ? 'On' : 'Off'}
        </FFButton>
      </FFCard>
    );
  };

  return (
    <div className="min-h-screen bg-bg-cream pb-24">
      <FFPageHeader
        title="Notifications"
        subtitle="Alerts, quiet hours, and digests"
        showBack
        rightAction={
          state.status === 'ready' ? (
            <FFButton
              variant="ghost"
              size="sm"
              icon={<Save className="h-4 w-4" />}
              onClick={() => void handleSave()}
              isLoading={state.isSaving}
            >
              Save
            </FFButton>
          ) : undefined
        }
      />

      <main className="page-enter mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <FFCard variant="primary" className="space-y-3 p-5 sm:p-6">
          <p className="text-sm text-white/80">
            Choose which updates matter most and set a quiet window for the hours when your family
            needs less interruption.
          </p>
        </FFCard>

        {state.status === 'loading' ? (
          <div className="space-y-3">
            <FFCardSkeleton />
            <FFCardSkeleton />
            <FFCardSkeleton />
          </div>
        ) : null}

        {state.status === 'error' ? (
          <FFErrorState message={state.error} onRetry={() => reload()} />
        ) : null}

        {state.status === 'ready' ? (
          <>
            {state.saveError ? (
              <FFCard variant="warm" className="p-4 shadow-card">
                <p className="text-sm text-alert">{state.saveError}</p>
              </FFCard>
            ) : null}

            {state.saveSuccess ? (
              <FFCard variant="warm" className="p-4 shadow-card">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-success">Notification preferences saved.</p>
                  <FFButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => dispatch({ type: 'CLEAR_SAVE_MESSAGE' })}
                  >
                    Dismiss
                  </FFButton>
                </div>
              </FFCard>
            ) : null}

            <section className="space-y-3">
              <FFSectionHeader icon={<Bell />} title="Alert Types" />
              <div className="space-y-3">
                {preferenceSections.map((section) =>
                  renderToggle(section.key, section.title, section.description, section.icon),
                )}
              </div>
            </section>

            <section className="space-y-3">
              <FFSectionHeader icon={<Moon />} title="Quiet Hours" />
              <FFCard className="space-y-4 p-4 shadow-card">
                {renderToggle(
                  'quietHoursEnabled',
                  'Quiet hours',
                  'Pause non-urgent pushes overnight while keeping the setting easy to adjust.',
                  <Moon className="h-4 w-4" />,
                )}

                {state.prefs.quietHoursEnabled ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block space-y-2">
                      <span className="text-sm font-body font-semibold text-primary">Starts</span>
                      <input
                        type="time"
                        value={state.prefs.quietHoursStart}
                        onChange={(event) =>
                          dispatch({
                            type: 'UPDATE_PREF',
                            key: 'quietHoursStart',
                            value: event.target.value,
                          })
                        }
                        className="min-h-12 w-full rounded-xl border border-black/5 bg-white px-4 text-sm text-primary outline-none transition-colors focus:border-primary/20"
                      />
                    </label>
                    <label className="block space-y-2">
                      <span className="text-sm font-body font-semibold text-primary">Ends</span>
                      <input
                        type="time"
                        value={state.prefs.quietHoursEnd}
                        onChange={(event) =>
                          dispatch({
                            type: 'UPDATE_PREF',
                            key: 'quietHoursEnd',
                            value: event.target.value,
                          })
                        }
                        className="min-h-12 w-full rounded-xl border border-black/5 bg-white px-4 text-sm text-primary outline-none transition-colors focus:border-primary/20"
                      />
                    </label>
                  </div>
                ) : null}
              </FFCard>
            </section>

            <section className="space-y-3">
              <FFSectionHeader icon={<Clock />} title="Digest Times" />
              <FFCard className="space-y-4 p-4 shadow-card">
                {renderToggle(
                  'weeklyDigestEnabled',
                  'Weekly digest',
                  'Receive a summary of attendance, tasks, and updates for the week.',
                  <Clock className="h-4 w-4" />,
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-2">
                    <span className="text-sm font-body font-semibold text-primary">
                      Morning digest
                    </span>
                    <input
                      type="time"
                      value={state.prefs.morningDigestTime}
                      onChange={(event) =>
                        dispatch({
                          type: 'UPDATE_PREF',
                          key: 'morningDigestTime',
                          value: event.target.value,
                        })
                      }
                      className="min-h-12 w-full rounded-xl border border-black/5 bg-white px-4 text-sm text-primary outline-none transition-colors focus:border-primary/20"
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-body font-semibold text-primary">
                      Evening digest
                    </span>
                    <input
                      type="time"
                      value={state.prefs.eveningDigestTime}
                      onChange={(event) =>
                        dispatch({
                          type: 'UPDATE_PREF',
                          key: 'eveningDigestTime',
                          value: event.target.value,
                        })
                      }
                      className="min-h-12 w-full rounded-xl border border-black/5 bg-white px-4 text-sm text-primary outline-none transition-colors focus:border-primary/20"
                    />
                  </label>
                </div>
              </FFCard>
            </section>

            <div className="space-y-3">
              <FFButton
                className="w-full"
                icon={<Save className="h-4 w-4" />}
                isLoading={state.isSaving}
                onClick={() => void handleSave()}
              >
                Save preferences
              </FFButton>
              <FFButton
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate('/notifications')}
              >
                View notification history
              </FFButton>
            </div>
          </>
        ) : null}

        {state.status === 'ready' && !state.prefs ? (
          <FFEmptyState
            title="Preferences unavailable"
            message="Notification settings are not ready yet."
            actionLabel="Try again"
            onAction={() => reload()}
            icon={<Bell className="h-8 w-8" />}
          />
        ) : null}
      </main>
    </div>
  );
};

export default NotificationPreferencesScreen;
