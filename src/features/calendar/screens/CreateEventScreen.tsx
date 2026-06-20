import React, { useEffect, useMemo, useReducer, useState } from 'react';
import {
  Bell,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import {
  CalendarEvent,
  CalendarRepository,
  EventType,
  EventTypeOption,
} from '../repositories/CalendarRepository';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import { FFCardSkeleton } from '../../../shared/components/FFShimmer';

type BootstrapState =
  | { status: 'loading'; eventTypes: EventTypeOption[]; existingEvent: CalendarEvent | null; error: null }
  | { status: 'ready'; eventTypes: EventTypeOption[]; existingEvent: CalendarEvent | null; error: null }
  | { status: 'error'; eventTypes: EventTypeOption[]; existingEvent: CalendarEvent | null; error: string };

type BootstrapAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: { eventTypes: EventTypeOption[]; existingEvent: CalendarEvent | null } }
  | { type: 'LOAD_ERROR'; error: string };

const visibilityOptions = ['Family', 'Parent', 'Child', 'Elder'];
const reminderOptions = ['5min', '15min', '30min', '1hr', '2hr', '1day', '3days'];

const bootstrapReducer = (state: BootstrapState, action: BootstrapAction): BootstrapState => {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, status: 'loading', error: null };
    case 'LOAD_SUCCESS':
      return { status: 'ready', ...action.payload, error: null };
    case 'LOAD_ERROR':
      return { ...state, status: 'error', error: action.error };
    default:
      return state;
  }
};

const formatInputDateTime = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  const timezoneOffset = parsed.getTimezoneOffset() * 60000;
  return new Date(parsed.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

const buildDefaultFormState = (): Partial<CalendarEvent> => {
  const start = new Date();
  start.setMinutes(0, 0, 0);
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  return {
    title: '',
    type: 'FamilyTravel',
    startDateTime: formatInputDateTime(start.toISOString()),
    endDateTime: formatInputDateTime(end.toISOString()),
    isAllDay: false,
    visibilityScope: ['Family'],
    isRecurring: false,
    reminders: ['1hr'],
    description: '',
    location: '',
  };
};

const formatEventTypeLabel = (value: EventType) =>
  value.replace(/([A-Z])/g, ' $1').trim().replace('Doctor Appointment', 'Doctor visit');

const CreateEventScreen: React.FC = () => {
  const { eventId } = useParams<{ eventId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bootstrapState, dispatch] = useReducer(bootstrapReducer, {
    status: 'loading',
    eventTypes: [],
    existingEvent: null,
    error: null,
  });
  const [reloadToken, reloadBootstrap] = useReducer((value: number) => value + 1, 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CalendarEvent>>(buildDefaultFormState);

  const isEditing = Boolean(eventId && eventId !== 'create');

  useEffect(() => {
    const loadBootstrap = async () => {
      if (!user?.familyId) {
        dispatch({
          type: 'LOAD_ERROR',
          error: 'A family account is required before you can create or edit calendar plans.',
        });
        return;
      }

      dispatch({ type: 'LOAD_START' });

      try {
        const eventTypes = await CalendarRepository.getEventTypes();
        let existingEvent: CalendarEvent | null = null;

        if (isEditing && eventId) {
          const events = await CalendarRepository.getEvents(user.familyId, '', '');
          existingEvent = events.find((event) => event.id === eventId) ?? null;
        }

        dispatch({ type: 'LOAD_SUCCESS', payload: { eventTypes, existingEvent } });
      } catch {
        dispatch({
          type: 'LOAD_ERROR',
          error: 'The event form could not be prepared right now. Please try again.',
        });
      }
    };

    void loadBootstrap();
  }, [eventId, isEditing, reloadToken, user?.familyId]);

  useEffect(() => {
    if (bootstrapState.status !== 'ready' || !bootstrapState.existingEvent) {
      return;
    }

    const event = bootstrapState.existingEvent;
    setFormData({
      ...event,
      startDateTime: formatInputDateTime(event.startDateTime),
      endDateTime: formatInputDateTime(event.endDateTime),
      visibilityScope:
        event.visibilityScope.length > 0 ? [event.visibilityScope[0] ?? 'Family'] : ['Family'],
      reminders: event.reminders.length > 0 ? event.reminders : ['1hr'],
    });
  }, [bootstrapState]);

  const selectedVisibility = formData.visibilityScope?.[0] ?? 'Family';
  const eventTypes = bootstrapState.eventTypes;
  const readyToEdit = !isEditing || bootstrapState.existingEvent;

  const selectedEventTypeLabel = useMemo(() => {
    const matched = eventTypes.find((item) => item.value === formData.type);
    return matched ? matched.label : formatEventTypeLabel((formData.type ?? 'FamilyTravel') as EventType);
  }, [eventTypes, formData.type]);

  const updateFormField = <K extends keyof CalendarEvent>(field: K, value: CalendarEvent[K]) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleReminderToggle = (option: string) => {
    const currentReminders = formData.reminders ?? [];
    const nextReminders = currentReminders.includes(option)
      ? currentReminders.filter((reminder) => reminder !== option)
      : [...currentReminders, option].slice(0, 5);

    updateFormField('reminders', nextReminders);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user?.familyId) {
      setSubmitError('A family account is required before this plan can be saved.');
      return;
    }

    if (!formData.title?.trim()) {
      setSubmitError('Add a short title so everyone can recognize this plan quickly.');
      return;
    }

    if (!formData.startDateTime) {
      setSubmitError('Choose a start time for this event.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const normalizedPayload: Partial<CalendarEvent> = {
      ...formData,
      title: formData.title.trim(),
      endDateTime: formData.isAllDay
        ? formData.startDateTime
        : formData.endDateTime || formData.startDateTime,
      visibilityScope: [selectedVisibility],
      reminders: formData.reminders ?? [],
      recurrenceRule: formData.isRecurring ? formData.recurrenceRule || 'FREQ=WEEKLY' : undefined,
    };

    try {
      if (isEditing && eventId) {
        await CalendarRepository.updateEvent(user.familyId, eventId, normalizedPayload);
      } else {
        await CalendarRepository.createEvent(user.familyId, normalizedPayload);
      }

      navigate('/calendar');
    } catch {
      setSubmitError('The event could not be saved. Please review the schedule and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-cream pb-24">
      <FFPageHeader
        title={isEditing ? 'Edit Event' : 'Create Event'}
        subtitle="Plan the details clearly"
        showBack
      />

      <main className="page-enter mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <FFCard variant="primary" className="space-y-3 p-5 sm:p-6">
          <p className="text-sm text-white/80">
            Share the timing, visibility, and reminders once so everyone sees the same plan.
          </p>
          <div className="rounded-ff-sm bg-white/10 px-3 py-2 text-sm text-white/90">
            Selected type: {selectedEventTypeLabel}
          </div>
        </FFCard>

        {submitError ? (
          <FFCard variant="warm" className="p-4 shadow-card">
            <p className="text-sm text-alert">{submitError}</p>
          </FFCard>
        ) : null}

        {bootstrapState.status === 'loading' ? (
          <div className="space-y-3">
            <FFCardSkeleton />
            <FFCardSkeleton />
            <FFCardSkeleton />
          </div>
        ) : null}

        {bootstrapState.status === 'error' ? (
          <FFErrorState message={bootstrapState.error} onRetry={() => reloadBootstrap()} />
        ) : null}

        {bootstrapState.status === 'ready' && eventTypes.length === 0 ? (
          <FFEmptyState
            title="Event types are unavailable"
            message="The calendar setup needs event types before a new plan can be saved."
            actionLabel="Try again"
            onAction={() => reloadBootstrap()}
            icon={<CalendarIcon className="h-8 w-8" />}
          />
        ) : null}

        {bootstrapState.status === 'ready' && eventTypes.length > 0 && !readyToEdit ? (
          <FFEmptyState
            title="Event not found"
            message="This calendar item is no longer available to edit."
            actionLabel="Back to calendar"
            onAction={() => navigate('/calendar')}
            icon={<CalendarIcon className="h-8 w-8" />}
          />
        ) : null}

        {bootstrapState.status === 'ready' && eventTypes.length > 0 && readyToEdit ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="space-y-3">
              <FFSectionHeader icon={<CalendarIcon />} title="Event Details" />
              <FFCard className="space-y-4 p-4 shadow-card">
                <label className="block space-y-2">
                  <span className="text-sm font-body font-semibold text-primary">Title</span>
                  <input
                    type="text"
                    required
                    value={formData.title ?? ''}
                    onChange={(event) => updateFormField('title', event.target.value)}
                    className="min-h-12 w-full rounded-xl border border-black/5 bg-white px-4 text-sm text-primary outline-none transition-colors focus:border-primary/20"
                    placeholder="School annual day"
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  {eventTypes.map((type) => (
                    <FFButton
                      key={type.id}
                      type="button"
                      variant={formData.type === type.value ? 'primary' : 'outline'}
                      onClick={() => updateFormField('type', type.value)}
                    >
                      {type.label}
                    </FFButton>
                  ))}
                </div>
              </FFCard>
            </section>

            <section className="space-y-3">
              <FFSectionHeader icon={<Clock />} title="Schedule" />
              <FFCard className="space-y-4 p-4 shadow-card">
                <div className="flex items-center justify-between gap-4 rounded-ff-sm bg-primary/5 p-4">
                  <div className="min-w-0">
                    <p className="text-sm font-display font-semibold text-primary">All-day event</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Use this when the family only needs the date, not a precise end time.
                    </p>
                  </div>
                  <FFButton
                    type="button"
                    variant={formData.isAllDay ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => updateFormField('isAllDay', !formData.isAllDay)}
                  >
                    {formData.isAllDay ? 'On' : 'Off'}
                  </FFButton>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-2">
                    <span className="text-sm font-body font-semibold text-primary">Start</span>
                    <input
                      type="datetime-local"
                      required
                      value={formData.startDateTime ?? ''}
                      onChange={(event) => updateFormField('startDateTime', event.target.value)}
                      className="min-h-12 w-full rounded-xl border border-black/5 bg-white px-4 text-sm text-primary outline-none transition-colors focus:border-primary/20"
                    />
                  </label>

                  {!formData.isAllDay ? (
                    <label className="block space-y-2">
                      <span className="text-sm font-body font-semibold text-primary">End</span>
                      <input
                        type="datetime-local"
                        required
                        value={formData.endDateTime ?? ''}
                        onChange={(event) => updateFormField('endDateTime', event.target.value)}
                        className="min-h-12 w-full rounded-xl border border-black/5 bg-white px-4 text-sm text-primary outline-none transition-colors focus:border-primary/20"
                      />
                    </label>
                  ) : null}
                </div>

                <div className="flex items-center justify-between gap-4 rounded-ff-sm bg-primary/5 p-4">
                  <div className="min-w-0">
                    <p className="text-sm font-display font-semibold text-primary">Recurring plan</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Turn this on when the same event repeats on a regular pattern.
                    </p>
                  </div>
                  <FFButton
                    type="button"
                    variant={formData.isRecurring ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => updateFormField('isRecurring', !formData.isRecurring)}
                  >
                    {formData.isRecurring ? 'On' : 'Off'}
                  </FFButton>
                </div>

                {formData.isRecurring ? (
                  <label className="block space-y-2">
                    <span className="text-sm font-body font-semibold text-primary">Repeat rule</span>
                    <input
                      type="text"
                      value={formData.recurrenceRule ?? ''}
                      onChange={(event) => updateFormField('recurrenceRule', event.target.value)}
                      className="min-h-12 w-full rounded-xl border border-black/5 bg-white px-4 text-sm text-primary outline-none transition-colors focus:border-primary/20"
                      placeholder="FREQ=WEEKLY"
                    />
                  </label>
                ) : null}
              </FFCard>
            </section>

            <section className="space-y-3">
              <FFSectionHeader icon={<Users />} title="Visibility" />
              <FFCard className="space-y-4 p-4 shadow-card">
                <p className="text-sm text-gray-500">
                  Choose the main audience for this event. The mobile flow currently saves one
                  visibility selection per event.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {visibilityOptions.map((option) => (
                    <FFButton
                      key={option}
                      type="button"
                      variant={selectedVisibility === option ? 'accent' : 'outline'}
                      onClick={() => updateFormField('visibilityScope', [option])}
                    >
                      {option}
                    </FFButton>
                  ))}
                </div>
              </FFCard>
            </section>

            <section className="space-y-3">
              <FFSectionHeader icon={<Bell />} title="Reminders" />
              <FFCard className="space-y-4 p-4 shadow-card">
                <div className="grid gap-3 sm:grid-cols-3">
                  {reminderOptions.map((option) => {
                    const selected = formData.reminders?.includes(option) ?? false;

                    return (
                      <FFButton
                        key={option}
                        type="button"
                        variant={selected ? 'primary' : 'outline'}
                        onClick={() => handleReminderToggle(option)}
                      >
                        {option}
                      </FFButton>
                    );
                  })}
                </div>
                <p className="text-sm text-gray-500">Choose up to five reminders for one event.</p>
              </FFCard>
            </section>

            <section className="space-y-3">
              <FFSectionHeader icon={<MapPin />} title="Location and Notes" />
              <FFCard className="space-y-4 p-4 shadow-card">
                <label className="block space-y-2">
                  <span className="text-sm font-body font-semibold text-primary">Location</span>
                  <input
                    type="text"
                    value={formData.location ?? ''}
                    onChange={(event) => updateFormField('location', event.target.value)}
                    className="min-h-12 w-full rounded-xl border border-black/5 bg-white px-4 text-sm text-primary outline-none transition-colors focus:border-primary/20"
                    placeholder="School auditorium"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-body font-semibold text-primary">Notes</span>
                  <textarea
                    rows={4}
                    value={formData.description ?? ''}
                    onChange={(event) => updateFormField('description', event.target.value)}
                    className="w-full rounded-ff border border-black/5 bg-white px-4 py-3 text-sm text-primary outline-none transition-colors focus:border-primary/20"
                    placeholder="Add the details everyone should know before the event."
                  />
                </label>
              </FFCard>
            </section>

            <div className="space-y-3">
              <FFButton
                type="submit"
                className="w-full"
                icon={<CheckCircle2 className="h-4 w-4" />}
                isLoading={isSubmitting}
              >
                {isEditing ? 'Save event' : 'Create event'}
              </FFButton>

              <FFButton
                type="button"
                variant="outline"
                className="w-full"
                icon={<CalendarIcon className="h-4 w-4" />}
                onClick={() => navigate('/calendar')}
              >
                Back to calendar
              </FFButton>
            </div>
          </form>
        ) : null}
      </main>
    </div>
  );
};

export default CreateEventScreen;
