import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { AlertCircle, Award, BookOpen, Calendar, MessageSquare, Search, Star, Trash2 } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { Feedback, FeedbackRepository, FeedbackType } from '../repositories/FeedbackRepository';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import { FFCardSkeleton } from '../../../shared/components/FFShimmer';

type HistoryState =
  | { status: 'loading'; data: Feedback[]; error: null }
  | { status: 'ready'; data: Feedback[]; error: null }
  | { status: 'error'; data: Feedback[]; error: string };

type HistoryAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: Feedback[] }
  | { type: 'LOAD_ERROR'; error: string }
  | { type: 'REMOVE_ITEM'; payload: string };

const historyReducer = (state: HistoryState, action: HistoryAction): HistoryState => {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, status: 'loading', error: null };
    case 'LOAD_SUCCESS':
      return { status: 'ready', data: action.payload, error: null };
    case 'LOAD_ERROR':
      return { status: 'error', data: state.data, error: action.error };
    case 'REMOVE_ITEM':
      return { ...state, data: state.data.filter((item) => item.id !== action.payload) };
    default:
      return state;
  }
};

const typeIcon: Record<FeedbackType, React.ReactNode> = {
  Appreciation: <Award className="h-5 w-5" />,
  Complaint: <AlertCircle className="h-5 w-5" />,
  Observation: <MessageSquare className="h-5 w-5" />,
  Homework: <BookOpen className="h-5 w-5" />,
  Urgent: <AlertCircle className="h-5 w-5" />,
  WeeklySummary: <Calendar className="h-5 w-5" />,
};

const typeTone: Record<FeedbackType, string> = {
  Appreciation: 'bg-success/10 text-success',
  Complaint: 'bg-alert/10 text-alert',
  Observation: 'bg-primary/10 text-primary',
  Homework: 'bg-accent/10 text-accent',
  Urgent: 'bg-alert/10 text-alert',
  WeeklySummary: 'bg-primary/10 text-primary',
};

const isEditable = (date: string) => {
  const feedbackDate = new Date(date);
  if (Number.isNaN(feedbackDate.getTime())) {
    return false;
  }

  return Date.now() - feedbackDate.getTime() < 24 * 60 * 60 * 1000;
};

const FeedbackHistoryScreen: React.FC = () => {
  const { user } = useAuth();
  const [historyState, dispatch] = useReducer(historyReducer, {
    status: 'loading',
    data: [],
    error: null,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    if (!user?.familyId || !user?.id) {
      dispatch({ type: 'LOAD_ERROR', error: 'Teacher feedback history is unavailable right now.' });
      return;
    }

    dispatch({ type: 'LOAD_START' });

    try {
      const feedback = await FeedbackRepository.getFeedbackHistory(user.familyId, user.id);
      dispatch({ type: 'LOAD_SUCCESS', payload: feedback });
    } catch {
      dispatch({ type: 'LOAD_ERROR', error: 'Feedback history could not be loaded. Try again.' });
    }
  }, [user?.familyId, user?.id]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const filteredFeedback = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return historyState.data;
    }

    return historyState.data.filter((item) =>
      [item.childName, item.message, item.type].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [historyState.data, searchQuery]);

  const handleDelete = async (feedbackId: string) => {
    if (!user?.familyId) {
      return;
    }

    setDeleteError(null);

    try {
      await FeedbackRepository.deleteFeedback(user.familyId, feedbackId);
      dispatch({ type: 'REMOVE_ITEM', payload: feedbackId });
    } catch {
      setDeleteError('The feedback item could not be removed. Try again.');
    }
  };

  return (
    <div className="min-h-screen bg-bg-cream pb-24">
      <FFPageHeader
        title="Feedback history"
        subtitle="Recent notes shared with families"
        showBack
      />

      <main className="page-enter mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <FFCard variant="primary" className="space-y-4 p-5 sm:p-6">
          <div className="min-w-0">
            <p className="font-body text-xs font-bold uppercase tracking-wider text-white/70">
              History
            </p>
            <h1 className="mt-1 text-xl font-display font-bold text-white sm:text-2xl">
              Track what families have received
            </h1>
            <p className="mt-2 text-sm text-white/80">
              Review acknowledgements, search old notes, and remove messages still inside the edit window.
            </p>
          </div>
        </FFCard>

        <FFCard className="p-4">
          <label className="flex items-center gap-3 rounded-xl border border-black/5 bg-white px-4">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by child, type, or message"
              className="min-h-12 w-full bg-transparent text-sm text-primary outline-none"
            />
          </label>
        </FFCard>

        {deleteError ? (
          <FFCard variant="warm" className="p-4">
            <p className="text-sm text-alert">{deleteError}</p>
          </FFCard>
        ) : null}

        <section className="space-y-3">
          <FFSectionHeader icon={<Star />} title="Submitted feedback" />

          {historyState.status === 'loading' && historyState.data.length === 0 ? (
            <div className="space-y-3">
              <FFCardSkeleton />
              <FFCardSkeleton />
              <FFCardSkeleton />
            </div>
          ) : null}

          {historyState.status === 'error' && historyState.data.length === 0 ? (
            <FFErrorState message={historyState.error} onRetry={() => void loadHistory()} />
          ) : null}

          {historyState.status !== 'loading' && filteredFeedback.length === 0 ? (
            <FFEmptyState
              title={searchQuery ? 'No matching feedback' : 'No feedback yet'}
              message={
                searchQuery
                  ? 'Try a different search term to review previous notes.'
                  : 'Send your first note to a family and it will appear here.'
              }
              onAction={searchQuery ? () => setSearchQuery('') : undefined}
              actionLabel={searchQuery ? 'Clear search' : undefined}
              icon={<MessageSquare className="h-8 w-8" />}
            />
          ) : null}

          {filteredFeedback.length > 0 ? (
            <div className="space-y-3">
              {filteredFeedback.map((item) => (
                <FFCard key={item.id} className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-body font-bold uppercase tracking-wider ${typeTone[item.type]}`}>
                          {item.type}
                        </span>
                        {item.acknowledgedAt ? (
                          <span className="rounded-full bg-success/10 px-3 py-1 text-[10px] font-body font-bold uppercase tracking-wider text-success">
                            Acknowledged
                          </span>
                        ) : (
                          <span className="rounded-full bg-accent/10 px-3 py-1 text-[10px] font-body font-bold uppercase tracking-wider text-accent">
                            Awaiting response
                          </span>
                        )}
                      </div>
                      <p className="mt-3 font-display text-sm font-semibold text-primary">
                        {item.childName}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {new Date(item.date).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-ff-sm bg-primary/10 text-primary">
                      {typeIcon[item.type]}
                    </div>
                  </div>

                  <div className="rounded-ff-sm bg-[#FDF9F4] p-4">
                    <p className="text-sm text-gray-700">{item.message}</p>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-gray-500">
                      {isEditable(item.date)
                        ? 'Editable for up to 24 hours after submission.'
                        : 'Edit window has ended.'}
                    </p>
                    {isEditable(item.date) ? (
                      <FFButton
                        variant="outline"
                        size="sm"
                        icon={<Trash2 className="h-4 w-4" />}
                        onClick={() => void handleDelete(item.id)}
                      >
                        Delete
                      </FFButton>
                    ) : null}
                  </div>
                </FFCard>
              ))}
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
};

export default FeedbackHistoryScreen;
