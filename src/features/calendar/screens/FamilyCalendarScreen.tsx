import React, { useEffect, useMemo, useReducer, useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronRight,
  Clock,
  List,
  Plus,
  RefreshCw,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../../../core/auth/AuthContext';
import { CalendarEvent, CalendarRepository } from '../repositories/CalendarRepository';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import { FFCardSkeleton } from '../../../shared/components/FFShimmer';

type CalendarState =
  | { status: 'loading'; events: CalendarEvent[]; error: null }
  | { status: 'ready'; events: CalendarEvent[]; error: null }
  | { status: 'error'; events: CalendarEvent[]; error: string };

type CalendarAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: CalendarEvent[] }
  | { type: 'LOAD_ERROR'; error: string };

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const calendarReducer = (state: CalendarState, action: CalendarAction): CalendarState => {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, status: 'loading', error: null };
    case 'LOAD_SUCCESS':
      return { status: 'ready', events: action.payload, error: null };
    case 'LOAD_ERROR':
      return { status: 'error', events: state.events, error: action.error };
    default:
      return state;
  }
};

const formatMonthLabel = (date: Date) =>
  date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

const formatEventTypeLabel = (value: CalendarEvent['type']) =>
  value
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace('Doctor Appointment', 'Doctor visit')
    .replace('Family Travel', 'Family plan');

const formatEventDate = (value: string, isAllDay: boolean) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  if (isAllDay) {
    return parsed.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  return parsed.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const eventBadgeClasses = (type: CalendarEvent['type']) => {
  switch (type) {
    case 'DoctorAppointment':
      return 'bg-alert/10 text-alert border border-alert/20';
    case 'Birthday':
      return 'bg-accent/10 text-accent border border-accent/20';
    case 'Medicine':
      return 'bg-success/10 text-success border border-success/20';
    default:
      return 'bg-primary/10 text-primary border border-primary/20';
  }
};

const FamilyCalendarScreen: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(calendarReducer, {
    status: 'loading',
    events: [],
    error: null,
  });
  const [reloadToken, refreshEvents] = useReducer((value: number) => value + 1, 0);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'list'>(
    user?.role === UserRole.ELDER ? 'list' : 'month',
  );

  useEffect(() => {
    const loadEvents = async () => {
      if (!user?.familyId) {
        dispatch({
          type: 'LOAD_ERROR',
          error: 'Calendar details will appear after a family account is selected.',
        });
        return;
      }

      dispatch({ type: 'LOAD_START' });

      try {
        const events = await CalendarRepository.getEvents(user.familyId, '', '');
        let visibleEvents = events;

        if (user.role === UserRole.CHILD) {
          visibleEvents = events.filter(
            (event) =>
              event.visibilityScope.includes('Child') || event.visibilityScope.includes('Family'),
          );
        } else if (user.role === UserRole.ELDER) {
          visibleEvents = events.filter(
            (event) =>
              event.visibilityScope.includes('Elder') ||
              event.visibilityScope.includes('Family') ||
              event.type === 'Birthday',
          );
        }

        dispatch({ type: 'LOAD_SUCCESS', payload: visibleEvents });
      } catch {
        dispatch({
          type: 'LOAD_ERROR',
          error: 'The family calendar could not be refreshed right now. Please try again.',
        });
      }
    };

    void loadEvents();
  }, [reloadToken, user?.familyId, user?.role]);

  const canCreateEvent =
    user?.role === UserRole.PARENT ||
    user?.role === UserRole.TEACHER ||
    user?.role === UserRole.FAMILY_ADMIN;

  const monthEvents = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    return state.events.filter((event) => {
      const eventDate = new Date(event.startDateTime);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });
  }, [currentDate, state.events]);

  const groupedEvents = useMemo(() => {
    const groups = new Map<string, CalendarEvent[]>();

    state.events.forEach((event) => {
      const dateKey = event.startDateTime.split('T')[0] ?? event.startDateTime;
      const existing = groups.get(dateKey) ?? [];
      existing.push(event);
      groups.set(dateKey, existing);
    });

    return Array.from(groups.entries()).sort(([left], [right]) => left.localeCompare(right));
  }, [state.events]);

  const upcomingEvents = useMemo(
    () =>
      state.events
        .slice()
        .sort((left, right) => left.startDateTime.localeCompare(right.startDateTime))
        .slice(0, 4),
    [state.events],
  );

  const monthGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: React.ReactNode[] = [];

    for (let index = 0; index < firstDay; index += 1) {
      cells.push(
        <div
          key={`empty-${index}`}
          className="min-h-[112px] rounded-ff border border-black/5 bg-white/50 shadow-card"
        />,
      );
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const cellDate = new Date(year, month, day);
      const dateKey = cellDate.toISOString().split('T')[0];
      const dayEvents = monthEvents.filter((event) => event.startDateTime.startsWith(dateKey));
      const isToday = new Date().toDateString() === cellDate.toDateString();

      cells.push(
        <FFCard key={dateKey} className="min-h-[112px] p-3 shadow-card">
          <div className="flex items-start justify-between gap-2">
            <span
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-body font-bold ${
                isToday ? 'bg-primary text-white' : 'bg-primary/5 text-primary'
              }`}
            >
              {day}
            </span>
            {dayEvents.length > 0 ? (
              <span className="rounded-full bg-accent/10 px-2.5 py-1 text-[10px] font-body font-bold tracking-wider text-accent">
                {dayEvents.length} plan{dayEvents.length > 1 ? 's' : ''}
              </span>
            ) : null}
          </div>

          <div className="mt-3 space-y-2">
            {dayEvents.slice(0, 2).map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => navigate(`/calendar/event/${event.id}`)}
                className="flex w-full items-center justify-between rounded-ff-sm border border-primary/10 bg-primary/5 px-2.5 py-2 text-left transition-colors hover:bg-primary/10"
              >
                <span className="min-w-0 text-xs font-body font-semibold text-primary">
                  <span className="block truncate">{event.title}</span>
                </span>
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-primary/60" />
              </button>
            ))}

            {dayEvents.length > 2 ? (
              <p className="text-xs text-gray-500">+{dayEvents.length - 2} more for this day</p>
            ) : null}
          </div>
        </FFCard>,
      );
    }

    return cells;
  }, [currentDate, monthEvents, navigate]);

  return (
    <div className="min-h-screen bg-bg-cream pb-24">
      <FFPageHeader
        title="Family Calendar"
        subtitle="Shared plans and reminders"
        showBack={false}
        rightAction={
          canCreateEvent ? (
            <FFButton
              variant="ghost"
              size="sm"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => navigate('/calendar/create')}
            >
              Add
            </FFButton>
          ) : undefined
        }
      />

      <main className="page-enter mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <FFCard variant="primary" className="space-y-3 p-5 sm:p-6">
          <p className="text-sm font-body text-white/80">
            Keep appointments, school moments, and family plans easy to review in one place.
          </p>
          <div className="flex flex-wrap gap-3">
            <FFButton
              type="button"
              variant={viewMode === 'month' ? 'accent' : 'outline'}
              onClick={() => setViewMode('month')}
            >
              Month view
            </FFButton>
            <FFButton
              type="button"
              variant={viewMode === 'list' ? 'accent' : 'outline'}
              onClick={() => setViewMode('list')}
              icon={<List className="h-4 w-4" />}
            >
              List view
            </FFButton>
            <FFButton
              type="button"
              variant="ghost"
              icon={<RefreshCw className={`h-4 w-4 ${state.status === 'loading' ? 'animate-spin' : ''}`} />}
              onClick={() => refreshEvents()}
            >
              Refresh
            </FFButton>
          </div>
        </FFCard>

        {state.status === 'loading' && state.events.length === 0 ? (
          <div className="space-y-3">
            <FFCardSkeleton />
            <FFCardSkeleton />
            <FFCardSkeleton />
          </div>
        ) : null}

        {state.status === 'error' && state.events.length === 0 ? (
          <FFErrorState message={state.error} onRetry={() => refreshEvents()} />
        ) : null}

        {state.status !== 'loading' && state.events.length === 0 ? (
          <FFEmptyState
            title="No events yet"
            message="Family plans, reminders, and celebrations will appear here once the first event is added."
            actionLabel={canCreateEvent ? 'Create event' : undefined}
            onAction={canCreateEvent ? () => navigate('/calendar/create') : undefined}
            icon={<CalendarIcon className="h-8 w-8" />}
          />
        ) : null}

        {state.events.length > 0 ? (
          <>
            <section className="space-y-3">
              <FFSectionHeader
                icon={<CalendarIcon />}
                title="This Month"
                rightAction={
                  <div className="flex items-center gap-2">
                    <FFButton
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentDate(
                          new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
                        )
                      }
                    >
                      Previous
                    </FFButton>
                    <FFButton
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentDate(
                          new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
                        )
                      }
                    >
                      Next
                    </FFButton>
                  </div>
                }
              />

              <FFCard className="space-y-4 p-4 shadow-card">
                <p className="text-base font-display font-semibold text-primary">
                  {formatMonthLabel(currentDate)}
                </p>

                {viewMode === 'month' ? (
                  <>
                    <div className="grid grid-cols-7 gap-2">
                      {weekdayLabels.map((day) => (
                        <p
                          key={day}
                          className="text-center text-xs font-body font-semibold tracking-wider text-gray-500"
                        >
                          {day}
                        </p>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">{monthGrid}</div>
                  </>
                ) : (
                  <div className="space-y-3">
                    {groupedEvents.map(([date, events]) => (
                      <FFCard key={date} variant="warm" className="space-y-3 p-4 shadow-card">
                        <p className="text-sm font-display font-semibold text-primary">
                          {new Date(date).toLocaleDateString(undefined, {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>

                        <div className="space-y-3">
                          {events.map((event) => (
                            <FFCard
                              key={event.id}
                              hoverable
                              onClick={() => navigate(`/calendar/event/${event.id}`)}
                              className="p-4 shadow-card"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <p className="text-sm font-display font-semibold text-primary">
                                    {event.title}
                                  </p>
                                  <p className="mt-1 text-sm text-gray-500">
                                    {formatEventDate(event.startDateTime, event.isAllDay)}
                                  </p>
                                </div>
                                <span
                                  className={`rounded-full px-2.5 py-1 text-[10px] font-body font-bold tracking-wider ${eventBadgeClasses(event.type)}`}
                                >
                                  {formatEventTypeLabel(event.type)}
                                </span>
                              </div>
                            </FFCard>
                          ))}
                        </div>
                      </FFCard>
                    ))}
                  </div>
                )}
              </FFCard>
            </section>

            <section className="space-y-3">
              <FFSectionHeader icon={<Clock />} title="Coming Up" />
              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                {upcomingEvents.map((event) => (
                  <FFCard
                    key={event.id}
                    hoverable
                    onClick={() => navigate(`/calendar/event/${event.id}`)}
                    className="space-y-3 p-4 shadow-card"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-display font-semibold text-primary">{event.title}</p>
                        <p className="mt-1 text-sm text-gray-500">
                          {formatEventDate(event.startDateTime, event.isAllDay)}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-body font-bold tracking-wider ${eventBadgeClasses(event.type)}`}
                      >
                        {formatEventTypeLabel(event.type)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-ff-sm bg-primary/5 px-3 py-2">
                      <span className="text-sm text-primary">
                        {event.visibilityScope.join(', ')}
                      </span>
                      <ChevronRight className="h-4 w-4 text-primary/60" />
                    </div>
                  </FFCard>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <FFSectionHeader icon={<Users />} title="Who Can See Each Event" />
              <FFCard variant="warm" className="p-4 shadow-card">
                <p className="text-sm text-gray-600">
                  Children and elders only see the events shared with them, while parents and family
                  administrators can review the full family calendar.
                </p>
              </FFCard>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
};

export default FamilyCalendarScreen;
