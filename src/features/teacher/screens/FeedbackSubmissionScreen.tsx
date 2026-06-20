import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { AlertCircle, Award, BookOpen, Calendar, CheckCircle2, List, MessageSquare, Send, Star, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../../../core/auth/AuthContext';
import { FamilyRepository } from '../../family/repositories/FamilyRepository';
import {
  FeedbackRatingOption,
  FeedbackRepository,
  FeedbackType,
  Severity,
} from '../repositories/FeedbackRepository';
import FFAvatar from '../../../shared/components/FFAvatar';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import { FFCardSkeleton } from '../../../shared/components/FFShimmer';

interface ChildOption {
  id: string;
  name: string;
}

type BootstrapState =
  | { status: 'loading'; children: ChildOption[]; severityOptions: FeedbackRatingOption[]; error: null }
  | { status: 'ready'; children: ChildOption[]; severityOptions: FeedbackRatingOption[]; error: null }
  | { status: 'error'; children: ChildOption[]; severityOptions: FeedbackRatingOption[]; error: string };

type BootstrapAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: { children: ChildOption[]; severityOptions: FeedbackRatingOption[] } }
  | { type: 'LOAD_ERROR'; error: string };

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

const feedbackTypeMeta: Array<{
  type: FeedbackType;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    type: 'Appreciation',
    label: 'Appreciation',
    description: 'Celebrate a strong effort or positive classroom moment.',
    icon: <Award className="h-5 w-5" />,
  },
  {
    type: 'Observation',
    label: 'Observation',
    description: 'Share a regular classroom note for the family.',
    icon: <List className="h-5 w-5" />,
  },
  {
    type: 'Homework',
    label: 'Homework',
    description: 'Document follow-up work or preparation for home.',
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    type: 'Complaint',
    label: 'Complaint',
    description: 'Flag a classroom concern that needs attention.',
    icon: <AlertCircle className="h-5 w-5" />,
  },
  {
    type: 'Urgent',
    label: 'Urgent',
    description: 'Escalate an issue that needs quick family action.',
    icon: <AlertCircle className="h-5 w-5" />,
  },
  {
    type: 'WeeklySummary',
    label: 'Weekly summary',
    description: 'Wrap up attendance, homework, and the week’s progress.',
    icon: <Calendar className="h-5 w-5" />,
  },
];

const mapRatingToSeverity = (code: string): Severity => {
  switch (code.toLowerCase()) {
    case 'medium':
      return 'Medium';
    case 'urgent':
      return 'Urgent';
    default:
      return 'Low';
  }
};

const FeedbackSubmissionScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [bootstrapState, dispatch] = useReducer(bootstrapReducer, {
    status: 'loading',
    children: [],
    severityOptions: [],
    error: null,
  });
  const [selectedType, setSelectedType] = useState<FeedbackType | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [severity, setSeverity] = useState<Severity>('Low');
  const [message, setMessage] = useState('');
  const [weeklyData, setWeeklyData] = useState({
    attendanceRate: '',
    homeworkRate: '',
    standout: '',
    focusArea: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const loadBootstrap = async () => {
      if (!user?.familyId) {
        dispatch({ type: 'LOAD_ERROR', error: 'Teacher family context is missing for feedback.' });
        return;
      }

      dispatch({ type: 'LOAD_START' });

      try {
        const [members, ratings] = await Promise.all([
          FamilyRepository.getMembers(user.familyId),
          FeedbackRepository.getFeedbackRatings(),
        ]);

        dispatch({
          type: 'LOAD_SUCCESS',
          payload: {
            children: members
              .filter((member) => member.role === UserRole.CHILD)
              .map((member) => ({ id: member.id, name: member.name })),
            severityOptions: ratings,
          },
        });
      } catch {
        dispatch({
          type: 'LOAD_ERROR',
          error: 'Feedback setup could not be loaded. Try again.',
        });
      }
    };

    void loadBootstrap();
  }, [user?.familyId]);

  const isFriday = new Date().getDay() === 5;
  const disabledTypes = useMemo<FeedbackType[]>(
    () => (isFriday ? [] : ['WeeklySummary']),
    [isFriday],
  );
  const selectedChild = bootstrapState.children.find((child) => child.id === selectedChildId) ?? null;

  const handleSubmit = async () => {
    if (!user?.familyId || !selectedChildId || !selectedType) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await FeedbackRepository.submitFeedback(user.familyId, {
        childProfileId: selectedChildId,
        type: selectedType,
        severity: selectedType === 'Complaint' || selectedType === 'Urgent' ? severity : undefined,
        message: selectedType === 'WeeklySummary' ? 'Weekly Progress Report' : message,
        weeklyData: selectedType === 'WeeklySummary' ? weeklyData : undefined,
      });

      navigate('/teacher/feedback/history');
    } catch {
      setSubmitError('Feedback could not be sent. Review the details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const weeklySummaryReady =
    weeklyData.attendanceRate.trim() &&
    weeklyData.homeworkRate.trim() &&
    weeklyData.standout.trim() &&
    weeklyData.focusArea.trim();

  const submitDisabled =
    !selectedType ||
    !selectedChildId ||
    (selectedType === 'WeeklySummary' ? !weeklySummaryReady : !message.trim());

  return (
    <div className="min-h-screen bg-bg-cream pb-24">
      <FFPageHeader
        title="Send feedback"
        subtitle="Share a clear note with the family"
        showBack
      />

      <main className="page-enter mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <FFCard variant="primary" className="space-y-4 p-5 sm:p-6">
          <div className="min-w-0">
            <p className="font-body text-xs font-bold uppercase tracking-wider text-white/70">
              Teacher feedback
            </p>
            <h1 className="mt-1 text-xl font-display font-bold text-white sm:text-2xl">
              Keep classroom communication simple
            </h1>
            <p className="mt-2 text-sm text-white/80">
              Choose the note type, select the child, and send a message families can act on quickly.
            </p>
          </div>
        </FFCard>

        {submitError ? (
          <FFCard variant="warm" className="p-4">
            <p className="text-sm text-alert">{submitError}</p>
          </FFCard>
        ) : null}

        <section className="space-y-3">
          <FFSectionHeader icon={<Star />} title="Feedback type" />

          {bootstrapState.status === 'loading' && bootstrapState.children.length === 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              <FFCardSkeleton />
              <FFCardSkeleton />
              <FFCardSkeleton />
              <FFCardSkeleton />
            </div>
          ) : null}

          {bootstrapState.status === 'error' && bootstrapState.children.length === 0 ? (
            <FFErrorState message={bootstrapState.error} onRetry={() => window.location.reload()} />
          ) : null}

          {bootstrapState.status !== 'loading' ? (
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {feedbackTypeMeta.map((item) => {
                const disabled = disabledTypes.includes(item.type);
                const selected = selectedType === item.type;
                return (
                  <FFCard
                    key={item.type}
                    hoverable={!disabled}
                    onClick={disabled ? undefined : () => setSelectedType(item.type)}
                    className={`p-4 ${selected ? 'ring-2 ring-accent/40' : ''} ${disabled ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-ff-sm bg-accent/10 text-accent">
                        {item.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-sm font-semibold text-primary">{item.label}</p>
                        <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                        {disabled ? (
                          <p className="mt-2 text-xs text-alert">Available on Friday only</p>
                        ) : null}
                      </div>
                    </div>
                  </FFCard>
                );
              })}
            </div>
          ) : null}
        </section>

        <section className="space-y-3">
          <FFSectionHeader icon={<Users />} title="Child" />

          {bootstrapState.status === 'loading' && bootstrapState.children.length === 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              <FFCardSkeleton />
              <FFCardSkeleton />
              <FFCardSkeleton />
            </div>
          ) : null}

          {bootstrapState.status === 'error' && bootstrapState.children.length === 0 ? (
            <FFErrorState message={bootstrapState.error} onRetry={() => window.location.reload()} />
          ) : null}

          {bootstrapState.status !== 'loading' && bootstrapState.children.length === 0 ? (
            <FFEmptyState
              title="No assigned children"
              message="Feedback can be sent once teacher assignments are available for this family."
              icon={<Users className="h-8 w-8" />}
            />
          ) : null}

          {bootstrapState.children.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              {bootstrapState.children.map((child) => {
                const selected = child.id === selectedChildId;
                return (
                  <FFCard
                    key={child.id}
                    hoverable
                    onClick={() => setSelectedChildId(child.id)}
                    className={`p-4 ${selected ? 'ring-2 ring-primary/20 bg-[#FDF9F4]' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <FFAvatar name={child.name} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-sm font-semibold text-primary">{child.name}</p>
                        <p className="mt-1 text-sm text-gray-500">
                          {selected ? 'Selected for this note' : 'Tap to choose this child'}
                        </p>
                      </div>
                      {selected ? <CheckCircle2 className="h-5 w-5 text-success" /> : null}
                    </div>
                  </FFCard>
                );
              })}
            </div>
          ) : null}
        </section>

        {selectedChild && selectedType ? (
          <FFCard variant="warm" className="space-y-2 p-4">
            <p className="text-xs font-body font-semibold uppercase tracking-wider text-gray-400">
              Ready to send
            </p>
            <p className="font-display text-sm font-semibold text-primary">
              {selectedChild.name} · {feedbackTypeMeta.find((item) => item.type === selectedType)?.label}
            </p>
          </FFCard>
        ) : null}

        {(selectedType === 'Complaint' || selectedType === 'Urgent') ? (
          <section className="space-y-3">
            <FFSectionHeader icon={<AlertCircle />} title="Severity" />
            <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
              {(bootstrapState.severityOptions.length > 0
                ? bootstrapState.severityOptions
                : [
                    { id: 'low', label: 'Low', code: 'Low' },
                    { id: 'medium', label: 'Medium', code: 'Medium' },
                    { id: 'urgent', label: 'Urgent', code: 'Urgent' },
                  ]
              ).map((option) => {
                const optionSeverity = mapRatingToSeverity(option.code);
                const selected = optionSeverity === severity;
                return (
                  <FFButton
                    key={option.id}
                    type="button"
                    variant={selected ? 'alert' : 'outline'}
                    onClick={() => setSeverity(optionSeverity)}
                  >
                    {option.label}
                  </FFButton>
                );
              })}
            </div>
          </section>
        ) : null}

        {selectedType === 'WeeklySummary' ? (
          <section className="space-y-3">
            <FFSectionHeader icon={<Calendar />} title="Weekly summary" />
            <FFCard className="space-y-4 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-xs font-body font-semibold uppercase tracking-wider text-gray-400">
                    Attendance rate
                  </span>
                  <input
                    value={weeklyData.attendanceRate}
                    onChange={(event) =>
                      setWeeklyData((current) => ({ ...current, attendanceRate: event.target.value }))
                    }
                    className="min-h-12 w-full rounded-xl border border-black/5 bg-white px-4 text-sm text-primary outline-none transition-colors focus:border-primary/20"
                    placeholder="100%"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-xs font-body font-semibold uppercase tracking-wider text-gray-400">
                    Homework rate
                  </span>
                  <input
                    value={weeklyData.homeworkRate}
                    onChange={(event) =>
                      setWeeklyData((current) => ({ ...current, homeworkRate: event.target.value }))
                    }
                    className="min-h-12 w-full rounded-xl border border-black/5 bg-white px-4 text-sm text-primary outline-none transition-colors focus:border-primary/20"
                    placeholder="95%"
                  />
                </label>
              </div>
              <label className="block space-y-2">
                <span className="text-xs font-body font-semibold uppercase tracking-wider text-gray-400">
                  Standout moment
                </span>
                <textarea
                  value={weeklyData.standout}
                  onChange={(event) =>
                    setWeeklyData((current) => ({ ...current, standout: event.target.value }))
                  }
                  className="min-h-[120px] w-full rounded-ff border border-black/5 bg-white px-4 py-3 text-sm text-primary outline-none transition-colors focus:border-primary/20"
                  placeholder="Highlight one strong effort from the week."
                />
              </label>
              <label className="block space-y-2">
                <span className="text-xs font-body font-semibold uppercase tracking-wider text-gray-400">
                  Focus area
                </span>
                <textarea
                  value={weeklyData.focusArea}
                  onChange={(event) =>
                    setWeeklyData((current) => ({ ...current, focusArea: event.target.value }))
                  }
                  className="min-h-[120px] w-full rounded-ff border border-black/5 bg-white px-4 py-3 text-sm text-primary outline-none transition-colors focus:border-primary/20"
                  placeholder="Explain what the family should support next week."
                />
              </label>
            </FFCard>
          </section>
        ) : (
          <section className="space-y-3">
            <FFSectionHeader icon={<MessageSquare />} title="Message" />
            <FFCard className="space-y-4 p-4">
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="min-h-[160px] w-full rounded-ff border border-black/5 bg-white px-4 py-3 text-sm text-primary outline-none transition-colors focus:border-primary/20"
                placeholder="Write a short, clear message for the family."
              />
              <p className="text-sm text-gray-500">
                Keep the note practical and easy to act on in under a minute.
              </p>
            </FFCard>
          </section>
        )}

        <div className="space-y-3">
          <FFButton
            className="w-full"
            icon={<Send className="h-4 w-4" />}
            isLoading={isSubmitting}
            onClick={() => void handleSubmit()}
            disabled={submitDisabled}
          >
            Send feedback
          </FFButton>
          <FFButton
            variant="outline"
            className="w-full"
            icon={<CheckCircle2 className="h-4 w-4" />}
            onClick={() => navigate('/teacher/feedback/history')}
          >
            Review feedback history
          </FFButton>
        </div>
      </main>
    </div>
  );
};

export default FeedbackSubmissionScreen;
