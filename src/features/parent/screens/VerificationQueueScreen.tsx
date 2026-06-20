import React, { useEffect, useReducer, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Eye,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
  X,
} from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import { TaskCompletion, TaskCompletionRepository } from '../../child/repositories/TaskCompletionRepository';

type QueueState =
  | { status: 'loading'; data: TaskCompletion[] | null; error: string | null }
  | { status: 'ready'; data: TaskCompletion[]; error: string | null }
  | { status: 'error'; data: TaskCompletion[] | null; error: string };

type QueueAction =
  | { type: 'LOAD_START'; preserve: TaskCompletion[] | null }
  | { type: 'LOAD_SUCCESS'; payload: TaskCompletion[] }
  | { type: 'LOAD_ERROR'; error: string }
  | { type: 'QUEUE_UPDATED'; payload: TaskCompletion[] };

const initialState: QueueState = {
  status: 'loading',
  data: null,
  error: null,
};

function reducer(state: QueueState, action: QueueAction): QueueState {
  switch (action.type) {
    case 'LOAD_START':
      return { status: 'loading', data: action.preserve, error: null };
    case 'LOAD_SUCCESS':
      return { status: 'ready', data: action.payload, error: null };
    case 'LOAD_ERROR':
      return { status: 'error', data: state.data, error: action.error };
    case 'QUEUE_UPDATED':
      return { status: 'ready', data: action.payload, error: null };
    default:
      return state;
  }
}

const VerificationQueueScreen: React.FC = () => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isApprovingAll, setIsApprovingAll] = useState(false);

  const loadQueue = async () => {
    if (!user?.familyId) {
      dispatch({ type: 'LOAD_ERROR', error: 'Family details are not available for verification.' });
      return;
    }

    dispatch({ type: 'LOAD_START', preserve: state.data });

    try {
      const data = await TaskCompletionRepository.getVerificationQueue(user.familyId);
      dispatch({ type: 'LOAD_SUCCESS', payload: data });
    } catch (error) {
      console.error('Failed to load verification queue', error);
      dispatch({ type: 'LOAD_ERROR', error: 'Unable to load verification requests right now.' });
    }
  };

  useEffect(() => {
    void loadQueue();
  }, [user?.familyId]);

  const queue = state.data ?? [];

  const handleReview = async (item: TaskCompletion, status: 'approved' | 'flagged') => {
    if (!user?.familyId) {
      return;
    }

    try {
      await TaskCompletionRepository.reviewCompletion(user.familyId, item.id, status);
      dispatch({
        type: 'QUEUE_UPDATED',
        payload: queue.filter((entry) => entry.id !== item.id),
      });
    } catch (error) {
      console.error('Failed to review verification item', error);
    }
  };

  const handleApproveAll = async () => {
    if (!user?.familyId || queue.length === 0) {
      return;
    }

    setIsApprovingAll(true);

    try {
      await TaskCompletionRepository.approveAll(user.familyId);
      dispatch({ type: 'QUEUE_UPDATED', payload: [] });
    } catch (error) {
      console.error('Failed to approve all verification items', error);
    } finally {
      setIsApprovingAll(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F4EE]">
      <FFPageHeader
        title="Verification queue"
        subtitle="Parent review for proof-based tasks"
        showBack
        rightAction={
          <FFButton
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
            onClick={() => void loadQueue()}
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
              <h1 className="font-display text-2xl font-bold text-primary">Review proof with care and speed</h1>
              <p className="mt-2 font-body text-sm text-slate-500">
                Check task photos, confirm effort, and clear the queue while the routine is still fresh.
              </p>
            </div>
            <FFButton onClick={() => void handleApproveAll()} isLoading={isApprovingAll} disabled={queue.length === 0}>
              Approve all
            </FFButton>
          </div>
        </FFCard>

        {state.status === 'loading' && queue.length === 0 ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <FFCard key={index} className="shadow-card p-5">
                <FFShimmer width="35%" height={18} />
                <FFShimmer className="mt-4" width="100%" height={14} />
                <FFShimmer className="mt-2" width="70%" height={14} />
              </FFCard>
            ))}
          </div>
        ) : null}

        {state.status === 'error' && queue.length === 0 ? (
          <FFErrorState message={state.error} onRetry={() => void loadQueue()} />
        ) : null}

        {queue.length > 0 ? (
          <section className="space-y-4">
            <FFSectionHeader icon={<ShieldCheck />} title={`Pending reviews (${queue.length})`} />
            {state.status === 'error' ? (
              <FFCard className="shadow-card border-alert/20 bg-alert/5 p-4">
                <p className="font-body text-sm text-alert">{state.error}</p>
              </FFCard>
            ) : null}
            <div className="space-y-4">
              {queue.map((item) => (
                <FFCard key={item.id} className="shadow-card p-5">
                  <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-display text-xl font-semibold text-primary">{item.taskName}</p>
                        <span className="rounded-full bg-accent/15 px-3 py-1 font-body text-xs text-primary">
                          {item.coinValue} coins
                        </span>
                        <span className="rounded-full bg-primary/5 px-3 py-1 font-body text-xs text-primary">
                          {item.timeBlock}
                        </span>
                      </div>
                      <p className="mt-2 font-body text-sm text-slate-500">
                        Child profile {item.childProfileId} • submitted{' '}
                        {item.submittedAt ? new Date(item.submittedAt).toLocaleString() : 'recently'}
                      </p>

                      <div className="mt-4 overflow-hidden rounded-ff border border-black/5 bg-slate-50">
                        {item.photoUrl ? (
                          <img
                            src={item.photoUrl}
                            alt={item.taskName}
                            className="h-64 w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-400">
                            <Camera size={36} />
                            <p className="font-body text-sm">No proof photo attached</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col justify-between gap-4">
                      <div className="space-y-4">
                        <FFSectionHeader icon={<Eye />} title="Review guidance" />
                        <p className="font-body text-sm leading-6 text-slate-500">
                          Confirm the photo matches the submitted task, then approve to release coins or flag it for a follow-up.
                        </p>
                        {item.photoUrl ? (
                          <FFButton variant="outline" onClick={() => setSelectedPhoto(item.photoUrl ?? null)}>
                            Open photo
                          </FFButton>
                        ) : null}
                      </div>

                      <div className="flex flex-col gap-3">
                        <FFButton variant="outline" onClick={() => void handleReview(item, 'flagged')}>
                          Flag submission
                        </FFButton>
                        <FFButton onClick={() => void handleReview(item, 'approved')} icon={<CheckCircle2 size={16} />}>
                          Approve submission
                        </FFButton>
                      </div>
                    </div>
                  </div>
                </FFCard>
              ))}
            </div>
          </section>
        ) : null}

        {state.status === 'ready' && queue.length === 0 ? (
          <FFEmptyState
            title="Queue cleared"
            message="There are no proof-based task submissions waiting for review right now."
          />
        ) : null}
      </main>

      {selectedPhoto ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/75 p-4">
          <div className="relative w-full max-w-3xl rounded-ff-lg bg-white p-4 shadow-card">
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white"
              aria-label="Close image preview"
            >
              <X size={20} />
            </button>
            <img src={selectedPhoto} alt="Task proof" className="max-h-[80vh] w-full rounded-ff object-contain" />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default VerificationQueueScreen;
