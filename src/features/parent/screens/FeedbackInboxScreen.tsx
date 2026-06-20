import React, { useEffect, useReducer, useState } from 'react';
import {
  Bell,
  BookOpen,
  MessageSquare,
  RefreshCw,
  Star,
  TriangleAlert,
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
import { Feedback, FeedbackRepository, FeedbackType } from '../../teacher/repositories/FeedbackRepository';

type InboxFilter = 'All' | 'Unread' | FeedbackType;

type InboxState =
  | { status: 'loading'; data: Feedback[] | null; error: string | null }
  | { status: 'ready'; data: Feedback[]; error: string | null }
  | { status: 'error'; data: Feedback[] | null; error: string };

type InboxAction =
  | { type: 'LOAD_START'; preserve: Feedback[] | null }
  | { type: 'LOAD_SUCCESS'; payload: Feedback[] }
  | { type: 'LOAD_ERROR'; error: string };

const initialState: InboxState = {
  status: 'loading',
  data: null,
  error: null,
};

function reducer(state: InboxState, action: InboxAction): InboxState {
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

const toneByType: Record<FeedbackType, string> = {
  Appreciation: 'bg-success/10 text-success',
  Complaint: 'bg-alert/10 text-alert',
  Observation: 'bg-primary/5 text-primary',
  Homework: 'bg-accent/15 text-primary',
  Urgent: 'bg-alert/10 text-alert',
  WeeklySummary: 'bg-primary/5 text-primary',
};

const iconByType: Record<FeedbackType, React.ReactNode> = {
  Appreciation: <Star size={18} />,
  Complaint: <TriangleAlert size={18} />,
  Observation: <MessageSquare size={18} />,
  Homework: <BookOpen size={18} />,
  Urgent: <Bell size={18} />,
  WeeklySummary: <BookOpen size={18} />,
};

const filters: InboxFilter[] = [
  'All',
  'Unread',
  'Appreciation',
  'Observation',
  'Homework',
  'Complaint',
  'Urgent',
  'WeeklySummary',
];

const FeedbackInboxScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [filter, setFilter] = useState<InboxFilter>('All');

  const loadInbox = async () => {
    if (!user?.familyId) {
      dispatch({ type: 'LOAD_ERROR', error: 'Family details are not available for the feedback inbox.' });
      return;
    }

    dispatch({ type: 'LOAD_START', preserve: state.data });

    try {
      const data = await FeedbackRepository.getFeedbackInbox(user.familyId);
      dispatch({ type: 'LOAD_SUCCESS', payload: data });
    } catch (error) {
      console.error('Failed to load feedback inbox', error);
      dispatch({ type: 'LOAD_ERROR', error: 'Unable to load feedback right now.' });
    }
  };

  useEffect(() => {
    void loadInbox();
  }, [user?.familyId]);

  const inbox = state.data ?? [];
  const unreadCount = inbox.filter((item) => !item.isRead).length;
  const filteredInbox = inbox.filter((item) => {
    if (filter === 'All') return true;
    if (filter === 'Unread') return !item.isRead;
    return item.type === filter;
  });

  return (
    <div className="min-h-screen bg-[#F8F4EE]">
      <FFPageHeader
        title="Feedback inbox"
        subtitle="Teacher messages, alerts, and summaries"
        showBack
        rightAction={
          <FFButton
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
            onClick={() => void loadInbox()}
            icon={<RefreshCw size={16} />}
          >
            Refresh
          </FFButton>
        }
      />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 pb-24">
        <FFCard className="shadow-card p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-primary">Keep school communication clear</h1>
              <p className="mt-2 font-body text-sm text-slate-500">
                Review observations, homework notes, and urgent teacher messages in one stream.
              </p>
            </div>
            <div className="rounded-ff bg-accent/15 px-4 py-3 text-center">
              <p className="font-display text-xl font-bold text-primary">{unreadCount}</p>
              <p className="font-body text-xs text-slate-500">Unread</p>
            </div>
          </div>
        </FFCard>

        <section className="space-y-4">
          <FFSectionHeader icon={<MessageSquare />} title="Filters" />
          <div className="flex flex-wrap gap-3">
            {filters.map((item) => (
              <FFButton
                key={item}
                variant={filter === item ? 'primary' : 'outline'}
                onClick={() => setFilter(item)}
              >
                {item}
              </FFButton>
            ))}
          </div>
        </section>

        {state.status === 'loading' && inbox.length === 0 ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <FFCard key={index} className="shadow-card p-5">
                <FFShimmer width="35%" height={18} />
                <FFShimmer className="mt-4" width="100%" height={14} />
                <FFShimmer className="mt-2" width="75%" height={14} />
              </FFCard>
            ))}
          </div>
        ) : null}

        {state.status === 'error' && inbox.length === 0 ? (
          <FFErrorState message={state.error} onRetry={() => void loadInbox()} />
        ) : null}

        {inbox.length > 0 ? (
          <section className="space-y-4">
            <FFSectionHeader icon={<Bell />} title="Messages" />
            {state.status === 'error' ? (
              <FFCard className="shadow-card border-alert/20 bg-alert/5 p-4">
                <p className="font-body text-sm text-alert">{state.error}</p>
              </FFCard>
            ) : null}
            {filteredInbox.length === 0 ? (
              <FFEmptyState
                title="Nothing in this filter"
                message="Try another filter to view the feedback items that matter right now."
              />
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {filteredInbox.map((item) => (
                  <FFCard
                    key={item.id}
                    hoverable
                    onClick={() => navigate(`/parent/feedback/${item.id}`)}
                    className="shadow-card p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <span className="rounded-ff-sm bg-primary/5 p-3 text-primary">
                          {iconByType[item.type]}
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-display text-lg font-semibold text-primary">{item.teacherName}</p>
                            {!item.isRead ? (
                              <span className="rounded-full bg-accent/15 px-3 py-1 font-body text-xs text-primary">
                                New
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 font-body text-sm text-slate-500">{item.childName}</p>
                        </div>
                      </div>
                      <span className={`rounded-full px-3 py-1 font-body text-xs ${toneByType[item.type]}`}>
                        {item.type}
                      </span>
                    </div>
                    <p className="mt-4 font-body text-sm leading-6 text-slate-600">{item.message}</p>
                    <div className="mt-4 flex items-center justify-between font-body text-xs text-slate-400">
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                      <span>{item.severity}</span>
                    </div>
                  </FFCard>
                ))}
              </div>
            )}
          </section>
        ) : null}
      </main>
    </div>
  );
};

export default FeedbackInboxScreen;
