import React, { useEffect, useReducer, useRef, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Clock,
  ImagePlus,
  RefreshCw,
  Send,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { S3UploadService } from '../../../core/services/S3UploadService';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import { TaskCompletion, TaskCompletionRepository } from '../repositories/TaskCompletionRepository';

type TaskDetailState =
  | { status: 'loading'; data: TaskCompletion | null; error: string | null }
  | { status: 'ready'; data: TaskCompletion; error: string | null }
  | { status: 'error'; data: TaskCompletion | null; error: string };

type TaskDetailAction =
  | { type: 'LOAD_START'; preserve: TaskCompletion | null }
  | { type: 'LOAD_SUCCESS'; payload: TaskCompletion }
  | { type: 'LOAD_ERROR'; error: string }
  | { type: 'TASK_UPDATED'; payload: TaskCompletion };

const initialState: TaskDetailState = {
  status: 'loading',
  data: null,
  error: null,
};

function reducer(state: TaskDetailState, action: TaskDetailAction): TaskDetailState {
  switch (action.type) {
    case 'LOAD_START':
      return { status: 'loading', data: action.preserve, error: null };
    case 'LOAD_SUCCESS':
      return { status: 'ready', data: action.payload, error: null };
    case 'LOAD_ERROR':
      return { status: 'error', data: state.data, error: action.error };
    case 'TASK_UPDATED':
      return { status: 'ready', data: action.payload, error: null };
    default:
      return state;
  }
}

const TaskDetailScreen: React.FC = () => {
  const { completionId } = useParams<{ completionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadTask = async () => {
    if (!user?.familyId || !user?.id || !completionId) {
      dispatch({ type: 'LOAD_ERROR', error: 'Task details are not available right now.' });
      return;
    }

    dispatch({ type: 'LOAD_START', preserve: state.data });

    try {
      const today = new Date().toISOString().split('T')[0];
      const completions = await TaskCompletionRepository.getCompletions(user.familyId, user.id, today);
      const task = completions.find((item) => item.id === completionId);

      if (!task) {
        dispatch({ type: 'LOAD_ERROR', error: 'Task not found.' });
        return;
      }

      dispatch({ type: 'LOAD_SUCCESS', payload: task });
    } catch (error) {
      console.error('Failed to load child task detail', error);
      dispatch({ type: 'LOAD_ERROR', error: 'Unable to load this task right now.' });
    }
  };

  useEffect(() => {
    void loadTask();
  }, [user?.familyId, user?.id, completionId]);

  const task = state.data;
  const isComplete = task?.status === 'approved' || task?.status === 'submitted';

  const handleCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCapturedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!task || !user?.familyId) {
      return;
    }

    setIsSubmitting(true);

    try {
      let photoUrl = task.photoUrl;
      const selectedFile = fileInputRef.current?.files?.[0];

      if (selectedFile) {
        photoUrl = await S3UploadService.uploadImage(
          user.familyId,
          task.taskId,
          selectedFile,
          (progress) => setUploadProgress(progress),
        );
      }

      const updated = await TaskCompletionRepository.submitCompletion(user.familyId, task.taskId, {
        scheduledDate: new Date().toISOString().split('T')[0],
        photoUrl,
      });

      dispatch({ type: 'TASK_UPDATED', payload: updated });
      navigate('/child');
    } catch (error) {
      console.error('Failed to submit child task', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F4EE]">
      <FFPageHeader
        title={task?.taskName ?? 'Task detail'}
        subtitle="Finish your task and send proof"
        showBack
        rightAction={
          <FFButton
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
            onClick={() => void loadTask()}
            icon={<RefreshCw size={16} />}
          >
            Refresh
          </FFButton>
        }
      />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 pb-24">
        {state.status === 'loading' && !task ? (
          <FFCard className="shadow-card p-5">
            <FFShimmer width="45%" height={18} />
            <FFShimmer className="mt-4" width="100%" height={14} />
            <FFShimmer className="mt-2" width="70%" height={14} />
          </FFCard>
        ) : null}

        {state.status === 'error' && !task ? (
          <FFErrorState message={state.error} onRetry={() => void loadTask()} />
        ) : null}

        {task ? (
          <>
            {state.status === 'error' ? (
              <FFCard className="shadow-card border-alert/20 bg-alert/5 p-4">
                <p className="font-body text-sm text-alert">{state.error}</p>
              </FFCard>
            ) : null}

            <FFCard variant="primary" className="shadow-card p-5 text-white">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="font-body text-xs uppercase tracking-wider text-white/70">Time block</p>
                  <p className="mt-2 font-display text-2xl font-bold">{task.timeBlock}</p>
                </div>
                <div>
                  <p className="font-body text-xs uppercase tracking-wider text-white/70">Reward</p>
                  <p className="mt-2 font-display text-2xl font-bold">{task.coinValue} coins</p>
                </div>
                <div>
                  <p className="font-body text-xs uppercase tracking-wider text-white/70">Status</p>
                  <p className="mt-2 font-display text-2xl font-bold">{task.status}</p>
                </div>
              </div>
            </FFCard>

            <section className="space-y-4">
              <FFSectionHeader icon={<Clock />} title="What to do" />
              <FFCard className="shadow-card p-5">
                <p className="font-body text-sm leading-6 text-slate-600">
                  Finish the task carefully, take a clear photo if needed, and send it for parent review.
                </p>
              </FFCard>
            </section>

            <section className="space-y-4">
              <FFSectionHeader icon={<Camera />} title="Photo proof" />
              <FFCard className="shadow-card p-5">
                <div className="overflow-hidden rounded-ff border border-black/5 bg-slate-50">
                  {capturedImage || task.photoUrl ? (
                    <img
                      src={capturedImage ?? task.photoUrl}
                      alt={task.taskName}
                      className="h-72 w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-72 flex-col items-center justify-center gap-3 text-slate-400">
                      <ImagePlus size={36} />
                      <p className="font-body text-sm">Add a clear photo if this task needs proof.</p>
                    </div>
                  )}
                </div>

                {!isComplete ? (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <FFButton variant="outline" onClick={() => fileInputRef.current?.click()}>
                      Choose photo
                    </FFButton>
                    <FFButton onClick={() => void handleSubmit()} isLoading={isSubmitting} icon={<Send size={16} />}>
                      Submit task
                    </FFButton>
                  </div>
                ) : (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-2 font-body text-sm text-success">
                    <CheckCircle2 size={16} />
                    This task has already been sent for review.
                  </div>
                )}

                {uploadProgress > 0 && uploadProgress < 100 ? (
                  <p className="mt-3 font-body text-sm text-slate-500">Upload progress: {uploadProgress}%</p>
                ) : null}
              </FFCard>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleCapture}
              />
            </section>
          </>
        ) : null}

        {state.status === 'ready' && !task ? (
          <FFEmptyState
            title="Task not found"
            message="This task may have moved or may no longer be part of today’s routine."
          />
        ) : null}
      </main>
    </div>
  );
};

export default TaskDetailScreen;
