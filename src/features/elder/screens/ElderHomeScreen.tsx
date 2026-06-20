import React, { useEffect, useReducer, useState } from 'react';
import {
  CalendarDays,
  Heart,
  Phone,
  RefreshCw,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import { CalendarEvent, CalendarRepository, EventType } from '../../calendar/repositories/CalendarRepository';
import { ElderEventTypeOption, ElderRepository, GrandchildStatus } from '../repositories/ElderRepository';

type ElderTimelineFilter = 'All' | EventType;

interface ElderHomeData {
  grandchildren: GrandchildStatus[];
  events: CalendarEvent[];
  eventTypes: ElderEventTypeOption[];
}

type ElderHomeState =
  | { status: 'loading'; data: ElderHomeData | null; error: string | null }
  | { status: 'ready'; data: ElderHomeData; error: string | null }
  | { status: 'error'; data: ElderHomeData | null; error: string };

type ElderHomeAction =
  | { type: 'LOAD_START'; preserve: ElderHomeData | null }
  | { type: 'LOAD_SUCCESS'; payload: ElderHomeData }
  | { type: 'LOAD_ERROR'; error: string };

const initialState: ElderHomeState = {
  status: 'loading',
  data: null,
  error: null,
};

function reducer(state: ElderHomeState, action: ElderHomeAction): ElderHomeState {
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

const ElderHomeScreen: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [selectedEventType, setSelectedEventType] = useState<ElderTimelineFilter>('All');

  const loadScreen = async () => {
    if (!user?.familyId) {
      dispatch({ type: 'LOAD_ERROR', error: 'Family details are not available right now.' });
      return;
    }

    dispatch({ type: 'LOAD_START', preserve: state.data });

    try {
      const [grandchildren, events, eventTypes] = await Promise.all([
        ElderRepository.getGrandchildren(user.familyId),
        CalendarRepository.getUpcomingEvents(user.familyId, 30),
        ElderRepository.getCalendarEventTypes(),
      ]);

      dispatch({
        type: 'LOAD_SUCCESS',
        payload: {
          grandchildren,
          events: events.filter((item) => item.visibilityScope.includes('Elder') || item.type === 'Birthday'),
          eventTypes,
        },
      });
    } catch (error) {
      console.error('Failed to load elder home screen', error);
      dispatch({ type: 'LOAD_ERROR', error: 'Unable to load elder updates right now.' });
    }
  };

  useEffect(() => {
    void loadScreen();
  }, [user?.familyId]);

  const screenData = state.data;
  const filteredEvents = (screenData?.events ?? []).filter(
    (item) => selectedEventType === 'All' || item.type === selectedEventType,
  );

  return (
    <div className="min-h-screen bg-[#F8F4EE]">
      <FFPageHeader
        variant="home"
        roleLabel="Elder"
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
        <FFCard variant="primary" className="p-5 text-white">
          <p className="font-body text-sm text-white/75">Namaste, {user?.name?.split(' ')[0] ?? 'Elder'}</p>
          <h1 className="mt-1 font-display text-3xl font-bold">Family moments close to your heart</h1>
          <p className="mt-3 font-body text-sm leading-6 text-white/80">
            Keep up with grandchildren, family plans, and small ways to encourage them every day.
          </p>
        </FFCard>

        {state.status === 'loading' && !screenData ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <FFCard key={index} className="p-5 shadow-card">
                <FFShimmer width="40%" height={18} />
                <FFShimmer className="mt-4" width="85%" height={14} />
                <FFShimmer className="mt-2" width="60%" height={14} />
              </FFCard>
            ))}
          </div>
        ) : null}

        {state.status === 'error' && !screenData ? (
          <FFErrorState message={state.error} onRetry={() => void loadScreen()} />
        ) : null}

        {screenData ? (
          <>
            {state.status === 'error' ? (
              <FFCard className="border-alert/20 bg-alert/5 p-4 shadow-card">
                <p className="font-body text-sm text-alert">{state.error}</p>
              </FFCard>
            ) : null}

            <section className="grid gap-4 md:grid-cols-3">
              <FFCard className="p-5 shadow-card">
                <p className="font-body text-xs uppercase tracking-wider text-slate-500">Grandchildren</p>
                <p className="mt-3 font-display text-3xl font-bold text-primary">{screenData.grandchildren.length}</p>
                <p className="mt-2 font-body text-sm text-slate-500">Children you can encourage and follow closely.</p>
              </FFCard>
              <FFCard className="p-5 shadow-card">
                <p className="font-body text-xs uppercase tracking-wider text-slate-500">Upcoming events</p>
                <p className="mt-3 font-display text-3xl font-bold text-primary">{screenData.events.length}</p>
                <p className="mt-2 font-body text-sm text-slate-500">Family plans visible to you this month.</p>
              </FFCard>
              <FFCard className="p-5 shadow-card">
                <p className="font-body text-xs uppercase tracking-wider text-slate-500">Quick support</p>
                <FFButton
                  variant="outline"
                  className="mt-4 w-full"
                  icon={<Phone size={16} />}
                  onClick={() => {
                    window.location.href = 'tel:911';
                  }}
                >
                  Emergency call
                </FFButton>
              </FFCard>
            </section>

            <section className="space-y-4">
              <FFSectionHeader icon={<Users />} title="Grandchildren" />
              {screenData.grandchildren.length === 0 ? (
                <FFEmptyState
                  title="No grandchildren found"
                  message="Grandchild updates will appear here when family profiles are available."
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {screenData.grandchildren.map((child) => (
                    <FFCard
                      key={child.id}
                      hoverable
                      onClick={() => navigate(`/elder/appreciate/${child.id}`)}
                      className="p-5 shadow-card"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-display text-xl font-semibold text-primary">{child.name}</p>
                          <p className="mt-2 font-body text-sm text-slate-500">
                            {child.tasksCompleted} of {child.totalTasks} tasks completed
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 font-body text-xs ${
                            child.status === 'Needs Help'
                              ? 'bg-alert/10 text-alert'
                              : child.status === 'Doing Great'
                                ? 'bg-success/10 text-success'
                                : 'bg-primary/5 text-primary'
                          }`}
                        >
                          {child.status}
                        </span>
                      </div>
                      <div className="mt-4 h-3 rounded-full bg-slate-100">
                        <div
                          className="h-3 rounded-full bg-accent"
                          style={{
                            width: `${child.totalTasks > 0 ? Math.round((child.tasksCompleted / child.totalTasks) * 100) : 0}%`,
                          }}
                        />
                      </div>
                      <FFButton className="mt-4 w-full" variant="outline" icon={<Heart size={16} />}>
                        Send appreciation
                      </FFButton>
                    </FFCard>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-4">
              <FFSectionHeader icon={<CalendarDays />} title="Family timeline" />
              {screenData.eventTypes.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  <FFButton
                    variant={selectedEventType === 'All' ? 'primary' : 'outline'}
                    onClick={() => setSelectedEventType('All')}
                  >
                    All events
                  </FFButton>
                  {screenData.eventTypes.map((eventType) => (
                    <FFButton
                      key={eventType.id}
                      variant={selectedEventType === eventType.code ? 'accent' : 'outline'}
                      onClick={() => setSelectedEventType(eventType.code)}
                    >
                      {eventType.label}
                    </FFButton>
                  ))}
                </div>
              ) : null}

              {filteredEvents.length === 0 ? (
                <FFEmptyState
                  title="No events for this filter"
                  message="Try another filter or check back later for more family plans."
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filteredEvents.slice(0, 3).map((event) => (
                    <FFCard key={event.id} className="p-5 shadow-card">
                      <p className="font-display text-lg font-semibold text-primary">{event.title}</p>
                      <p className="mt-2 font-body text-sm text-slate-500">{event.type}</p>
                      <p className="mt-2 font-body text-sm text-slate-500">
                        {new Date(event.startDateTime).toLocaleDateString()}
                      </p>
                    </FFCard>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
};

export default ElderHomeScreen;
