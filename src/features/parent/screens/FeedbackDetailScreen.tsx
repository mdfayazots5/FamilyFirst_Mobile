import React, { useEffect, useReducer, useState } from 'react';
import {
  Bell,
  BookOpen,
  MessageSquare,
  RefreshCw,
  Send,
  Star,
  TriangleAlert,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import FFAvatar from '../../../shared/components/FFAvatar';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import { Feedback, FeedbackRepository, FeedbackType } from '../../teacher/repositories/FeedbackRepository';

type DetailState =
  | { status: 'loading'; data: Feedback | null; error: string | null }
  | { status: 'ready'; data: Feedback; error: string | null }
  | { status: 'error'; data: Feedback | null; error: string };

type DetailAction =
  | { type: 'LOAD_START'; preserve: Feedback | null }
  | { type: 'LOAD_SUCCESS'; payload: Feedback }
  | { type: 'LOAD_ERROR'; error: string }
  | { type: 'ACK_SUCCESS'; payload: Feedback };

const initialState: DetailState = {
  status: 'loading',
  data: null,
  error: null,
};

function reducer(state: DetailState, action: DetailAction): DetailState {
  switch (action.type) {
    case 'LOAD_START':
      return { status: 'loading', data: action.preserve, error: null };
    case 'LOAD_SUCCESS':
      return { status: 'ready', data: action.payload, error: null };
    case 'LOAD_ERROR':
      return { status: 'error', data: state.data, error: action.error };
    case 'ACK_SUCCESS':
      return { status: 'ready', data: action.payload, error: null };
    default:
      return state;
  }
}

const iconByType: Record<FeedbackType, React.ReactNode> = {
  Appreciation: <Star size={20} />,
  Complaint: <TriangleAlert size={20} />,
  Observation: <MessageSquare size={20} />,
  Homework: <BookOpen size={20} />,
  Urgent: <Bell size={20} />,
  WeeklySummary: <BookOpen size={20} />,
};

const FeedbackDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const { feedbackId } = useParams<{ feedbackId: string }>();
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [responseText, setResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadDetail = async () => {
    if (!user?.familyId || !feedbackId) {
      dispatch({ type: 'LOAD_ERROR', error: 'Feedback details are not available.' });
      return;
    }

    dispatch({ type: 'LOAD_START', preserve: state.data });

    try {
      const inbox = await FeedbackRepository.getFeedbackInbox(user.familyId);
      const detail = inbox.find((item) => item.id === feedbackId);

      if (!detail) {
        dispatch({ type: 'LOAD_ERROR', error: 'Feedback item not found.' });
        return;
      }

      dispatch({ type: 'LOAD_SUCCESS', payload: detail });
      setResponseText(detail.parentResponse ?? '');
    } catch (error) {
      console.error('Failed to load feedback detail', error);
      dispatch({ type: 'LOAD_ERROR', error: 'Unable to load this feedback item right now.' });
    }
  };

  useEffect(() => {
    void loadDetail();
  }, [user?.familyId, feedbackId]);

  const feedback = state.data;

  const handleAcknowledge = async () => {
    if (!feedback || !feedbackId) {
      return;
    }

    setIsSubmitting(true);

    try {
      const updated = await FeedbackRepository.acknowledgeFeedback(feedbackId, responseText.trim());
      dispatch({
        type: 'ACK_SUCCESS',
        payload: {
          ...feedback,
          ...updated,
          isRead: true,
          parentResponse: responseText.trim(),
          acknowledgedAt: updated.acknowledgedAt ?? new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Failed to acknowledge feedback detail', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F4EE]">
      <FFPageHeader
        title="Feedback detail"
        subtitle="Teacher note and parent response"
        showBack
        rightAction={
          <FFButton
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
            onClick={() => void loadDetail()}
            icon={<RefreshCw size={16} />}
          >
            Refresh
          </FFButton>
        }
      />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 pb-24">
        {state.status === 'loading' && !feedback ? (
          <FFCard className="shadow-card p-5">
            <FFShimmer width="35%" height={18} />
            <FFShimmer className="mt-4" width="100%" height={16} />
            <FFShimmer className="mt-2" width="85%" height={16} />
          </FFCard>
        ) : null}

        {state.status === 'error' && !feedback ? (
          <FFErrorState message={state.error} onRetry={() => void loadDetail()} />
        ) : null}

        {feedback ? (
          <>
            <FFCard className="shadow-card p-5">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div className="flex items-center gap-4">
                  <FFAvatar name={feedback.childName} size="lg" />
                  <div>
                    <p className="font-display text-2xl font-bold text-primary">{feedback.childName}</p>
                    <p className="mt-1 font-body text-sm text-slate-500">{feedback.teacherName}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-primary/5 px-3 py-1 font-body text-xs text-primary">
                    {feedback.type}
                  </span>
                  <span className="rounded-full bg-accent/15 px-3 py-1 font-body text-xs text-primary">
                    {feedback.severity}
                  </span>
                </div>
              </div>
            </FFCard>

            {state.status === 'error' ? (
              <FFCard className="shadow-card border-alert/20 bg-alert/5 p-4">
                <p className="font-body text-sm text-alert">{state.error}</p>
              </FFCard>
            ) : null}

            <section className="space-y-4">
              <FFSectionHeader icon={<MessageSquare />} title="Teacher message" />
              <FFCard className="shadow-card p-5">
                <div className="flex items-start gap-3">
                  <span className="rounded-ff-sm bg-primary/5 p-3 text-primary">
                    {iconByType[feedback.type]}
                  </span>
                  <div>
                    <p className="font-body text-sm leading-6 text-slate-600">{feedback.message}</p>
                    <p className="mt-3 font-body text-xs text-slate-400">
                      Shared on {new Date(feedback.date).toLocaleString()}
                    </p>
                  </div>
                </div>
              </FFCard>
            </section>

            {feedback.type === 'WeeklySummary' && feedback.weeklyData ? (
              <section className="space-y-4">
                <FFSectionHeader icon={<BookOpen />} title="Weekly summary" />
                <div className="grid gap-4 md:grid-cols-2">
                  <FFCard className="shadow-card p-5">
                    <p className="font-body text-sm text-slate-500">Attendance rate</p>
                    <p className="mt-2 font-display text-3xl font-bold text-primary">
                      {feedback.weeklyData.attendanceRate}%
                    </p>
                  </FFCard>
                  <FFCard className="shadow-card p-5">
                    <p className="font-body text-sm text-slate-500">Homework rate</p>
                    <p className="mt-2 font-display text-3xl font-bold text-primary">
                      {feedback.weeklyData.homeworkRate}%
                    </p>
                  </FFCard>
                  <FFCard className="shadow-card p-5">
                    <p className="font-display text-lg font-semibold text-primary">Standout</p>
                    <p className="mt-2 font-body text-sm text-slate-500">{feedback.weeklyData.standout}</p>
                  </FFCard>
                  <FFCard className="shadow-card p-5">
                    <p className="font-display text-lg font-semibold text-primary">Focus area</p>
                    <p className="mt-2 font-body text-sm text-slate-500">{feedback.weeklyData.focusArea}</p>
                  </FFCard>
                </div>
              </section>
            ) : null}

            <section className="space-y-4">
              <FFSectionHeader icon={<Send />} title="Parent response" />
              <FFCard className="shadow-card p-5">
                <label className="block">
                  <span className="font-body text-sm text-slate-500">Add a response for the teacher</span>
                  <textarea
                    value={responseText}
                    onChange={(event) => setResponseText(event.target.value)}
                    rows={5}
                    className="mt-3 w-full rounded-ff border border-black/10 bg-white px-4 py-3 font-body text-sm text-primary outline-none focus:border-primary"
                    placeholder="Thank you for the update. We will review this at home."
                  />
                </label>
                <div className="mt-4 flex flex-wrap gap-3">
                  <FFButton
                    onClick={() => void handleAcknowledge()}
                    isLoading={isSubmitting}
                    icon={<Send size={16} />}
                  >
                    {feedback.isRead ? 'Update response' : 'Acknowledge feedback'}
                  </FFButton>
                  <FFButton variant="outline" onClick={() => navigate('/parent/feedback')}>
                    Back to inbox
                  </FFButton>
                </div>
                {feedback.acknowledgedAt ? (
                  <p className="mt-3 font-body text-xs text-slate-400">
                    Last acknowledged on {new Date(feedback.acknowledgedAt).toLocaleString()}
                  </p>
                ) : null}
              </FFCard>
            </section>
          </>
        ) : null}

        {state.status === 'ready' && !feedback ? (
          <FFEmptyState
            title="Feedback not found"
            message="This item may have been removed or is no longer available in the parent inbox."
          />
        ) : null}
      </main>
    </div>
  );
};

export default FeedbackDetailScreen;
