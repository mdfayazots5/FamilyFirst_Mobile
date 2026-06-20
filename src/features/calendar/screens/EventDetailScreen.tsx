import React, { useEffect, useReducer, useState } from 'react';
import {
  Bell,
  Calendar as CalendarIcon,
  Clock,
  Edit2,
  MapPin,
  Trash2,
  Users,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth, UserRole } from '../../../core/auth/AuthContext';
import { CalendarEvent, CalendarRepository } from '../repositories/CalendarRepository';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import { FFCardSkeleton } from '../../../shared/components/FFShimmer';

type DetailState =
  | { status: 'loading'; event: CalendarEvent | null; error: null }
  | { status: 'ready'; event: CalendarEvent; error: null }
  | { status: 'error'; event: CalendarEvent | null; error: string };

type DetailAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: CalendarEvent }
  | { type: 'LOAD_ERROR'; error: string };

const detailReducer = (state: DetailState, action: DetailAction): DetailState => {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, status: 'loading', error: null };
    case 'LOAD_SUCCESS':
      return { status: 'ready', event: action.payload, error: null };
    case 'LOAD_ERROR':
      return { status: 'error', event: state.event, error: action.error };
    default:
      return state;
  }
};

const formatEventTypeLabel = (value: CalendarEvent['type']) =>
  value
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace('Doctor Appointment', 'Doctor visit')
    .replace('Family Travel', 'Family plan');

const formatReminderLabel = (value: string) =>
  value
    .replace('min', ' min')
    .replace('hr', ' hr')
    .replace('day', ' day')
    .replace('days', ' days');

const formatDateTime = (value: string, isAllDay: boolean) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  if (isAllDay) {
    return parsed.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return parsed.toLocaleString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const EventDetailScreen: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, dispatch] = useReducer(detailReducer, {
    status: 'loading',
    event: null,
    error: null,
  });
  const [reloadToken, reloadDetail] = useReducer((value: number) => value + 1, 0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvent = async () => {
      if (!user?.familyId || !eventId) {
        dispatch({
          type: 'LOAD_ERROR',
          error: 'Calendar details are not available until a family account is selected.',
        });
        return;
      }

      dispatch({ type: 'LOAD_START' });

      try {
        const events = await CalendarRepository.getEvents(user.familyId, '', '');
        const event = events.find((item) => item.id === eventId);

        if (!event) {
          dispatch({ type: 'LOAD_ERROR', error: 'This event could not be found.' });
          return;
        }

        dispatch({ type: 'LOAD_SUCCESS', payload: event });
      } catch {
        dispatch({
          type: 'LOAD_ERROR',
          error: 'The event details could not be loaded right now. Please try again.',
        });
      }
    };

    void loadEvent();
  }, [eventId, reloadToken, user?.familyId]);

  const handleDelete = async () => {
    if (!user?.familyId || !eventId) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await CalendarRepository.deleteEvent(user.familyId, eventId);
      navigate('/calendar');
    } catch {
      setDeleteError('This event could not be removed right now. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const canManage =
    user?.role === UserRole.FAMILY_ADMIN ||
    user?.role === UserRole.PARENT ||
    user?.role === UserRole.TEACHER;

  if (state.status === 'loading' && !state.event) {
    return (
      <div className="min-h-screen bg-bg-cream pb-24">
        <FFPageHeader title="Event Details" subtitle="Loading plan" showBack />
        <main className="page-enter mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <FFCardSkeleton />
          <FFCardSkeleton />
          <FFCardSkeleton />
        </main>
      </div>
    );
  }

  if (state.status === 'error' && !state.event) {
    return (
      <div className="min-h-screen bg-bg-cream pb-24">
        <FFPageHeader title="Event Details" subtitle="Shared family plan" showBack />
        <main className="page-enter mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <FFErrorState message={state.error} onRetry={() => reloadDetail()} />
        </main>
      </div>
    );
  }

  const event = state.event;

  if (!event) {
    return (
      <div className="min-h-screen bg-bg-cream pb-24">
        <FFPageHeader title="Event Details" subtitle="Shared family plan" showBack />
        <main className="page-enter mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <FFEmptyState
            title="Event not found"
            message="This calendar item is no longer available."
            actionLabel="Back to calendar"
            onAction={() => navigate('/calendar')}
            icon={<CalendarIcon className="h-8 w-8" />}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-cream pb-24">
      <FFPageHeader
        title="Event Details"
        subtitle="Shared family plan"
        showBack
        rightAction={
          canManage ? (
            <FFButton
              variant="ghost"
              size="sm"
              icon={<Edit2 className="h-4 w-4" />}
              onClick={() => navigate(`/calendar/edit/${event.id}`)}
            >
              Edit
            </FFButton>
          ) : undefined
        }
      />

      <main className="page-enter mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <FFCard variant="primary" className="space-y-4 p-5 sm:p-6">
          <div className="space-y-3">
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[10px] font-body font-bold tracking-wider text-white">
              {formatEventTypeLabel(event.type)}
            </span>
            <h1 className="text-xl font-display font-bold text-white sm:text-2xl">{event.title}</h1>
            <p className="text-sm text-white/80">{formatDateTime(event.startDateTime, event.isAllDay)}</p>
          </div>
        </FFCard>

        {deleteError ? (
          <FFCard variant="warm" className="p-4 shadow-card">
            <p className="text-sm text-alert">{deleteError}</p>
          </FFCard>
        ) : null}

        <section className="space-y-3">
          <FFSectionHeader icon={<Clock />} title="Schedule" />
          <FFCard className="space-y-4 p-4 shadow-card">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-ff-sm bg-primary/5 p-4">
                <p className="text-sm font-body font-semibold text-primary">Starts</p>
                <p className="mt-1 text-sm text-gray-600">
                  {formatDateTime(event.startDateTime, event.isAllDay)}
                </p>
              </div>
              <div className="rounded-ff-sm bg-primary/5 p-4">
                <p className="text-sm font-body font-semibold text-primary">Ends</p>
                <p className="mt-1 text-sm text-gray-600">
                  {event.isAllDay ? 'All day' : formatDateTime(event.endDateTime, false)}
                </p>
              </div>
            </div>

            {event.isRecurring ? (
              <div className="rounded-ff-sm bg-primary/5 p-4">
                <p className="text-sm font-body font-semibold text-primary">Repeats</p>
                <p className="mt-1 text-sm text-gray-600">
                  {event.recurrenceRule || 'This event follows a saved repeat pattern.'}
                </p>
              </div>
            ) : null}
          </FFCard>
        </section>

        <section className="space-y-3">
          <FFSectionHeader icon={<Users />} title="Visibility and Reminders" />
          <FFCard className="space-y-4 p-4 shadow-card">
            <div>
              <p className="text-sm font-body font-semibold text-primary">Visible to</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {event.visibilityScope.map((role) => (
                  <span
                    key={role}
                    className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-body font-bold tracking-wider text-primary"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-body font-semibold text-primary">Reminders</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {event.reminders.length > 0 ? (
                  event.reminders.map((reminder) => (
                    <span
                      key={reminder}
                      className="rounded-full border border-accent/20 bg-accent/10 px-2.5 py-1 text-[10px] font-body font-bold tracking-wider text-accent"
                    >
                      {formatReminderLabel(reminder)}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No reminders are set for this event.</p>
                )}
              </div>
            </div>
          </FFCard>
        </section>

        {event.location ? (
          <section className="space-y-3">
            <FFSectionHeader icon={<MapPin />} title="Location" />
            <FFCard className="p-4 shadow-card">
              <p className="text-sm text-gray-600">{event.location}</p>
            </FFCard>
          </section>
        ) : null}

        {event.description ? (
          <section className="space-y-3">
            <FFSectionHeader icon={<Bell />} title="Notes" />
            <FFCard className="p-4 shadow-card">
              <p className="text-sm text-gray-600">{event.description}</p>
            </FFCard>
          </section>
        ) : null}

        <div className="space-y-3">
          <FFButton
            variant="outline"
            className="w-full"
            icon={<CalendarIcon className="h-4 w-4" />}
            onClick={() => navigate('/calendar')}
          >
            Back to calendar
          </FFButton>

          {canManage ? (
            <FFButton
              variant="alert"
              className="w-full"
              icon={<Trash2 className="h-4 w-4" />}
              isLoading={isDeleting}
              onClick={() => void handleDelete()}
            >
              Delete event
            </FFButton>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default EventDetailScreen;
