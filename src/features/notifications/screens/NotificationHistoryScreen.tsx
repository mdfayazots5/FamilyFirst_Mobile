import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { Bell, CheckCheck, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import {
  AppNotification,
  NotificationRepository,
  NotificationTypeOption,
} from '../repositories/NotificationRepository';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import { FFCardSkeleton } from '../../../shared/components/FFShimmer';

type HistoryState =
  | {
      status: 'loading';
      notifications: AppNotification[];
      typeOptions: NotificationTypeOption[];
      error: null;
    }
  | {
      status: 'ready';
      notifications: AppNotification[];
      typeOptions: NotificationTypeOption[];
      error: null;
    }
  | {
      status: 'error';
      notifications: AppNotification[];
      typeOptions: NotificationTypeOption[];
      error: string;
    };

type HistoryAction =
  | { type: 'LOAD_START' }
  | {
      type: 'LOAD_SUCCESS';
      payload: { notifications: AppNotification[]; typeOptions: NotificationTypeOption[] };
    }
  | { type: 'LOAD_ERROR'; error: string }
  | { type: 'MARK_READ'; notificationId: string }
  | { type: 'MARK_ALL_READ' };

const historyReducer = (state: HistoryState, action: HistoryAction): HistoryState => {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, status: 'loading', error: null };
    case 'LOAD_SUCCESS':
      return { status: 'ready', ...action.payload, error: null };
    case 'LOAD_ERROR':
      return { status: 'error', notifications: state.notifications, typeOptions: state.typeOptions, error: action.error };
    case 'MARK_READ':
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification.id === action.notificationId ? { ...notification, isRead: true } : notification,
        ),
      };
    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map((notification) => ({ ...notification, isRead: true })),
      };
    default:
      return state;
  }
};

const formatTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const now = new Date();
  const differenceInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  if (differenceInHours < 1) {
    return 'Just now';
  }

  if (differenceInHours < 24) {
    return `${differenceInHours}h ago`;
  }

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const formatTypeLabel = (value: string) => value.replace(/([A-Z])/g, ' $1').trim();

const NotificationHistoryScreen: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(historyReducer, {
    status: 'loading',
    notifications: [],
    typeOptions: [],
    error: null,
  });
  const [reloadToken, reload] = useReducer((value: number) => value + 1, 0);
  const [readFilter, setReadFilter] = useState<'All' | 'Unread'>('All');
  const [typeFilter, setTypeFilter] = useState('All');

  useEffect(() => {
    const loadHistory = async () => {
      if (!user?.id) {
        dispatch({
          type: 'LOAD_ERROR',
          error: 'Notification history will appear once your account is available.',
        });
        return;
      }

      dispatch({ type: 'LOAD_START' });

      try {
        const [notifications, typeOptions] = await Promise.all([
          NotificationRepository.getNotifications(user.id),
          NotificationRepository.getNotificationTypes(),
        ]);

        dispatch({ type: 'LOAD_SUCCESS', payload: { notifications, typeOptions } });
      } catch {
        dispatch({
          type: 'LOAD_ERROR',
          error: 'Notification history could not be loaded right now. Please try again.',
        });
      }
    };

    void loadHistory();
  }, [reloadToken, user?.id]);

  const unreadCount = useMemo(
    () => state.notifications.filter((notification) => !notification.isRead).length,
    [state.notifications],
  );

  const typeFilters = useMemo(
    () => [
      { id: 'All', label: 'All' },
      ...state.typeOptions.map((option) => ({
        id: option.code === 'Calendar' || option.code === 'WeeklyDigest' ? 'System' : option.code,
        label: option.label,
      })),
    ].filter((option, index, items) => items.findIndex((item) => item.id === option.id) === index),
    [state.typeOptions],
  );

  const filteredNotifications = useMemo(
    () =>
      state.notifications.filter((notification) => {
        const matchesReadFilter = readFilter === 'All' || !notification.isRead;
        const matchesTypeFilter = typeFilter === 'All' || notification.type === typeFilter;
        return matchesReadFilter && matchesTypeFilter;
      }),
    [readFilter, state.notifications, typeFilter],
  );

  const handleNotificationClick = async (notification: AppNotification) => {
    if (!user?.id) {
      return;
    }

    dispatch({ type: 'MARK_READ', notificationId: notification.id });

    try {
      if (!notification.isRead) {
        await NotificationRepository.markAsRead(user.id, notification.id);
      }
    } catch {
      // Keep optimistic UI; next refresh will reconcile server state.
    }

    navigate(notification.deepLinkPath);
  };

  const handleMarkAllRead = async () => {
    if (!user?.id || unreadCount === 0) {
      return;
    }

    dispatch({ type: 'MARK_ALL_READ' });

    try {
      await NotificationRepository.markAllAsRead(user.id);
    } catch {
      // Keep optimistic UI; next refresh will reconcile server state.
    }
  };

  return (
    <div className="min-h-screen bg-bg-cream pb-24">
      <FFPageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread update${unreadCount === 1 ? '' : 's'}`}
        showBack
        rightAction={
          <FFButton
            variant="ghost"
            size="sm"
            icon={<Settings className="h-4 w-4" />}
            onClick={() => navigate('/notifications/preferences')}
          >
            Settings
          </FFButton>
        }
      />

      <main className="page-enter mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <FFCard variant="primary" className="space-y-3 p-5 sm:p-6">
          <p className="text-sm text-white/80">
            Review recent family updates, then clear the ones you have already handled.
          </p>
          <div className="flex flex-wrap gap-3">
            <FFButton
              type="button"
              variant={readFilter === 'All' ? 'accent' : 'outline'}
              onClick={() => setReadFilter('All')}
            >
              All
            </FFButton>
            <FFButton
              type="button"
              variant={readFilter === 'Unread' ? 'accent' : 'outline'}
              onClick={() => setReadFilter('Unread')}
            >
              Unread
            </FFButton>
            <FFButton
              type="button"
              variant="ghost"
              icon={<CheckCheck className="h-4 w-4" />}
              onClick={() => void handleMarkAllRead()}
              disabled={unreadCount === 0}
            >
              Mark all read
            </FFButton>
          </div>
        </FFCard>

        {state.status === 'loading' && state.notifications.length === 0 ? (
          <div className="space-y-3">
            <FFCardSkeleton />
            <FFCardSkeleton />
            <FFCardSkeleton />
          </div>
        ) : null}

        {state.status === 'error' && state.notifications.length === 0 ? (
          <FFErrorState message={state.error} onRetry={() => reload()} />
        ) : null}

        {state.notifications.length > 0 ? (
          <>
            <section className="space-y-3">
              <FFSectionHeader icon={<Bell />} title="Type Filter" />
              <div className="flex gap-2 overflow-x-auto pb-1">
                {typeFilters.map((typeOption) => (
                  <FFButton
                    key={typeOption.id}
                    type="button"
                    variant={typeFilter === typeOption.id ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setTypeFilter(typeOption.id)}
                  >
                    {typeOption.label}
                  </FFButton>
                ))}
              </div>
            </section>

            {filteredNotifications.length === 0 ? (
              <FFEmptyState
                title="No matching notifications"
                message="Try a different filter to see more updates."
                actionLabel="Clear filters"
                onAction={() => {
                  setReadFilter('All');
                  setTypeFilter('All');
                }}
                icon={<Bell className="h-8 w-8" />}
              />
            ) : (
              <section className="space-y-3">
                <FFSectionHeader icon={<Bell />} title="Recent Updates" />
                <div className="space-y-3">
                  {filteredNotifications.map((notification) => (
                    <FFCard
                      key={notification.id}
                      hoverable
                      onClick={() => void handleNotificationClick(notification)}
                      className={`p-4 shadow-card ${
                        notification.isRead ? 'bg-white' : 'border-accent/20 bg-accent/5'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-display font-semibold text-primary">
                              {notification.title}
                            </p>
                            {!notification.isRead ? (
                              <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-body font-bold tracking-wider text-accent">
                                New
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-sm text-gray-500">{notification.body}</p>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-body font-bold tracking-wider text-primary">
                              {formatTypeLabel(notification.type)}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatTime(notification.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </FFCard>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : null}

        {state.status !== 'loading' && state.notifications.length === 0 ? (
          <FFEmptyState
            title="No notifications yet"
            message="Recent alerts, reminders, and family updates will appear here."
            actionLabel="Open settings"
            onAction={() => navigate('/notifications/preferences')}
            icon={<Bell className="h-8 w-8" />}
          />
        ) : null}
      </main>
    </div>
  );
};

export default NotificationHistoryScreen;
