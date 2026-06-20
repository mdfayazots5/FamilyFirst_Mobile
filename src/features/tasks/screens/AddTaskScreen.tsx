import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { BookOpen, Calendar, Camera, CheckCircle2, Clock, Coins, Library, Repeat, Tag, Users } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { FamilyRepository } from '../../family/repositories/FamilyRepository';
import { PillarTag, TaskItem, TaskRepository, TaskTemplate, TimeBlock } from '../repositories/TaskRepository';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import { FFCardSkeleton } from '../../../shared/components/FFShimmer';

const pillarTags: PillarTag[] = ['Study', 'Cleanliness', 'Discipline', 'ScreenControl', 'Responsibility'];
const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const timeBlocks: Array<{ value: TimeBlock; label: string; detail: string }> = [
  { value: 'Morning', label: 'Morning', detail: 'Start the day well' },
  { value: 'Evening', label: 'Evening', detail: 'After-school routines' },
  { value: 'Night', label: 'Night', detail: 'Wrap up before bed' },
];

type BootstrapState =
  | {
      status: 'loading';
      childAge: number;
      existingTask: TaskItem | null;
      templates: TaskTemplate[];
      error: null;
    }
  | {
      status: 'ready';
      childAge: number;
      existingTask: TaskItem | null;
      templates: TaskTemplate[];
      error: null;
    }
  | {
      status: 'error';
      childAge: number;
      existingTask: TaskItem | null;
      templates: TaskTemplate[];
      error: string;
    };

type BootstrapAction =
  | { type: 'LOAD_START' }
  | {
      type: 'LOAD_SUCCESS';
      payload: {
        childAge: number;
        existingTask: TaskItem | null;
        templates: TaskTemplate[];
      };
    }
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

const AddTaskScreen: React.FC = () => {
  const { childId, taskId } = useParams<{ childId: string; taskId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [bootstrapState, dispatch] = useReducer(bootstrapReducer, {
    status: 'loading',
    childAge: 10,
    existingTask: null,
    templates: [],
    error: null,
  });

  const [name, setName] = useState('');
  const [timeBlock, setTimeBlock] = useState<TimeBlock>(
    (searchParams.get('block') as TimeBlock) || 'Morning',
  );
  const [duration, setDuration] = useState(15);
  const [coinValue, setCoinValue] = useState(10);
  const [isPhotoRequired, setIsPhotoRequired] = useState(false);
  const [pillarTag, setPillarTag] = useState<PillarTag>('Discipline');
  const [isRecurring, setIsRecurring] = useState(true);
  const [recurringDays, setRecurringDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [activeFromDate, setActiveFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showTemplateSheet, setShowTemplateSheet] = useState(false);

  useEffect(() => {
    const loadBootstrap = async () => {
      if (!user?.familyId || !childId) {
        dispatch({ type: 'LOAD_ERROR', error: 'Child details are required before a task can be created.' });
        return;
      }

      dispatch({ type: 'LOAD_START' });

      try {
        const [members, tasks, templates] = await Promise.all([
          FamilyRepository.getMembers(user.familyId),
          TaskRepository.getTasks(user.familyId, childId),
          TaskRepository.getTemplates(10),
        ]);

        const child = members.find((member) => member.id === childId);
        const childAge = child?.age || 10;
        const existingTask = taskId ? tasks.find((task) => task.id === taskId) ?? null : null;
        const ageTemplates = await TaskRepository.getTemplates(childAge);

        dispatch({
          type: 'LOAD_SUCCESS',
          payload: {
            childAge,
            existingTask,
            templates: ageTemplates.length > 0 ? ageTemplates : templates,
          },
        });
      } catch {
        dispatch({ type: 'LOAD_ERROR', error: 'Task setup could not be loaded. Try again.' });
      }
    };

    void loadBootstrap();
  }, [childId, taskId, user?.familyId]);

  useEffect(() => {
    if (bootstrapState.status !== 'ready' || !bootstrapState.existingTask) {
      return;
    }

    const task = bootstrapState.existingTask;
    setName(task.name);
    setTimeBlock(task.timeBlock);
    setDuration(task.duration);
    setCoinValue(task.coinValue);
    setIsPhotoRequired(task.isPhotoRequired);
    setPillarTag(task.pillarTag);
    setIsRecurring(task.isRecurring);
    setRecurringDays(task.recurringDays);
    setActiveFromDate(task.activeFromDate ?? new Date().toISOString().split('T')[0]);
  }, [bootstrapState]);

  const toggleDay = (dayValue: number) => {
    setRecurringDays((current) =>
      current.includes(dayValue) ? current.filter((day) => day !== dayValue) : [...current, dayValue].sort(),
    );
  };

  const handleTemplateSelect = (template: TaskTemplate) => {
    setName(template.name);
    setDuration(template.defaultDuration);
    setCoinValue(template.defaultCoinValue);
    setPillarTag(template.pillarTag);
    setShowTemplateSheet(false);
  };

  const filteredTemplates = useMemo(() => bootstrapState.templates.slice(0, 8), [bootstrapState.templates]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user?.familyId || !childId) {
      setSubmitError('Task setup is missing the required family or child context.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const taskData: Partial<TaskItem> = {
      childProfileId: childId,
      name,
      timeBlock,
      duration,
      coinValue,
      isPhotoRequired,
      pillarTag,
      isRecurring,
      recurringDays,
      activeFromDate,
    };

    try {
      if (taskId) {
        await TaskRepository.updateTask(user.familyId, taskId, taskData);
      } else {
        await TaskRepository.createTask(user.familyId, taskData);
      }

      navigate(-1);
    } catch {
      setSubmitError('Task could not be saved. Review the form and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-cream pb-24">
      <FFPageHeader
        title={taskId ? 'Edit task' : 'Add task'}
        subtitle="Build a clear routine for one child"
        showBack
        rightAction={
          !taskId ? (
            <FFButton
              variant="ghost"
              size="sm"
              icon={<Library className="h-4 w-4" />}
              onClick={() => setShowTemplateSheet(true)}
            >
              Templates
            </FFButton>
          ) : undefined
        }
      />

      <main className="page-enter mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <FFCard variant="primary" className="space-y-4 p-5 sm:p-6">
          <div className="min-w-0">
            <p className="font-body text-xs font-bold uppercase tracking-wider text-white/70">
              Task setup
            </p>
            <h1 className="mt-1 text-xl font-display font-bold text-white sm:text-2xl">
              {taskId ? 'Update a family routine' : 'Create a new family routine'}
            </h1>
            <p className="mt-2 text-sm text-white/80">
              Keep the task simple, specific, and easy for a child to finish without confusion.
            </p>
          </div>
        </FFCard>

        {submitError ? (
          <FFCard variant="warm" className="p-4">
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
          <FFErrorState message={bootstrapState.error} onRetry={() => window.location.reload()} />
        ) : null}

        {bootstrapState.status === 'ready' ? (
          <form onSubmit={handleSave} className="space-y-6">
            <section className="space-y-3">
              <FFSectionHeader icon={<BookOpen />} title="Task details" />
              <FFCard className="space-y-4 p-4">
                <label className="block space-y-2">
                  <span className="text-xs font-body font-semibold uppercase tracking-wider text-gray-400">
                    Task name
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="min-h-12 w-full rounded-xl border border-black/5 bg-white px-4 text-sm text-primary outline-none transition-colors focus:border-primary/20"
                    placeholder="Brush teeth"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-2">
                    <span className="text-xs font-body font-semibold uppercase tracking-wider text-gray-400">
                      Time block
                    </span>
                    <select
                      value={timeBlock}
                      onChange={(event) => setTimeBlock(event.target.value as TimeBlock)}
                      className="min-h-12 w-full rounded-xl border border-black/5 bg-white px-4 text-sm text-primary outline-none transition-colors focus:border-primary/20"
                    >
                      {timeBlocks.map((block) => (
                        <option key={block.value} value={block.value}>
                          {block.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-sm text-gray-500">
                      {timeBlocks.find((block) => block.value === timeBlock)?.detail}
                    </p>
                  </label>

                  <label className="block space-y-2">
                    <span className="text-xs font-body font-semibold uppercase tracking-wider text-gray-400">
                      Start date
                    </span>
                    <input
                      type="date"
                      value={activeFromDate}
                      onChange={(event) => setActiveFromDate(event.target.value)}
                      className="min-h-12 w-full rounded-xl border border-black/5 bg-white px-4 text-sm text-primary outline-none transition-colors focus:border-primary/20"
                    />
                  </label>
                </div>
              </FFCard>
            </section>

            <section className="space-y-3">
              <FFSectionHeader icon={<Clock />} title="Effort and reward" />
              <FFCard className="space-y-4 p-4">
                <label className="block space-y-2">
                  <span className="text-xs font-body font-semibold uppercase tracking-wider text-gray-400">
                    Duration
                  </span>
                  <input
                    type="number"
                    min={5}
                    max={120}
                    value={duration}
                    onChange={(event) => setDuration(parseInt(event.target.value || '0', 10))}
                    className="min-h-12 w-full rounded-xl border border-black/5 bg-white px-4 text-sm text-primary outline-none transition-colors focus:border-primary/20"
                  />
                </label>

                <label className="block space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-body font-semibold uppercase tracking-wider text-gray-400">
                      Coin value
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-[10px] font-body font-bold uppercase tracking-wider text-accent">
                      <Coins className="h-3 w-3" />
                      {coinValue} coins
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="200"
                    step="5"
                    value={coinValue}
                    onChange={(event) => setCoinValue(parseInt(event.target.value, 10))}
                    className="w-full accent-primary"
                  />
                </label>

                <div className="flex items-center justify-between gap-4 rounded-ff-sm bg-[#FDF9F4] p-4">
                  <div className="min-w-0">
                    <p className="font-display text-sm font-semibold text-primary">Photo proof</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Require a photo when the task needs visible confirmation.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPhotoRequired((current) => !current)}
                    className={`flex min-h-12 min-w-12 items-center rounded-full p-1 transition-colors ${
                      isPhotoRequired ? 'bg-primary' : 'bg-black/10'
                    }`}
                    aria-label="Toggle photo proof"
                  >
                    <span
                      className={`h-10 w-10 rounded-full bg-white transition-transform ${
                        isPhotoRequired ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </FFCard>
            </section>

            <section className="space-y-3">
              <FFSectionHeader icon={<Tag />} title="Focus area" />
              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                {pillarTags.map((tag) => {
                  const selected = pillarTag === tag;
                  return (
                    <FFButton
                      key={tag}
                      type="button"
                      variant={selected ? 'primary' : 'outline'}
                      onClick={() => setPillarTag(tag)}
                    >
                      {tag}
                    </FFButton>
                  );
                })}
              </div>
            </section>

            <section className="space-y-3">
              <FFSectionHeader icon={<Repeat />} title="Schedule" />
              <FFCard className="space-y-4 p-4">
                <div className="flex items-center justify-between gap-4 rounded-ff-sm bg-[#FDF9F4] p-4">
                  <div className="min-w-0">
                    <p className="font-display text-sm font-semibold text-primary">Repeat each week</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Turn this on for routines that should stay on the calendar.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRecurring((current) => !current)}
                    className={`flex min-h-12 min-w-12 items-center rounded-full p-1 transition-colors ${
                      isRecurring ? 'bg-primary' : 'bg-black/10'
                    }`}
                    aria-label="Toggle recurring task"
                  >
                    <span
                      className={`h-10 w-10 rounded-full bg-white transition-transform ${
                        isRecurring ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {isRecurring ? (
                  <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">
                    {weekdayLabels.map((label, index) => {
                      const dayValue = index + 1;
                      const selected = recurringDays.includes(dayValue);
                      return (
                        <FFButton
                          key={label}
                          type="button"
                          variant={selected ? 'accent' : 'outline'}
                          onClick={() => toggleDay(dayValue)}
                        >
                          {label}
                        </FFButton>
                      );
                    })}
                  </div>
                ) : null}
              </FFCard>
            </section>

            <FFCard variant="warm" className="space-y-3 p-4">
              <FFSectionHeader icon={<Users />} title="Template notes" />
              {filteredTemplates.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                  {filteredTemplates.map((template) => (
                    <FFCard
                      key={template.id}
                      hoverable
                      onClick={() => handleTemplateSelect(template)}
                      className="p-4"
                    >
                      <p className="font-display text-sm font-semibold text-primary">{template.name}</p>
                      <p className="mt-1 text-sm text-gray-500">
                        {template.defaultDuration} min · {template.defaultCoinValue} coins
                      </p>
                    </FFCard>
                  ))}
                </div>
              ) : (
                <FFEmptyState
                  title="No templates available"
                  message="Create a task manually for now. Templates can still be added later."
                  icon={<Library className="h-8 w-8" />}
                />
              )}
            </FFCard>

            <div className="space-y-3">
              <FFButton
                type="submit"
                className="w-full"
                icon={<CheckCircle2 className="h-4 w-4" />}
                isLoading={isSubmitting}
              >
                {taskId ? 'Save task' : 'Create task'}
              </FFButton>

              <FFButton
                type="button"
                variant="outline"
                className="w-full"
                icon={<Calendar className="h-4 w-4" />}
                onClick={() => navigate(-1)}
              >
                Back to routine
              </FFButton>
            </div>
          </form>
        ) : null}
      </main>

      {showTemplateSheet ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-50 bg-primary/40"
            onClick={() => setShowTemplateSheet(false)}
            aria-label="Close template list"
          />
          <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white p-4 shadow-elevated sm:p-6">
            <div className="mx-auto max-w-4xl space-y-4">
              <FFSectionHeader icon={<Library />} title={`Task templates · Age ${bootstrapState.childAge}`} />
              {filteredTemplates.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                  {filteredTemplates.map((template) => (
                    <FFCard
                      key={template.id}
                      hoverable
                      onClick={() => handleTemplateSelect(template)}
                      className="p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-display text-sm font-semibold text-primary">{template.name}</p>
                          <p className="mt-1 text-sm text-gray-500">
                            {template.category} · {template.defaultDuration} min
                          </p>
                        </div>
                        <span className="text-2xl">{template.icon}</span>
                      </div>
                    </FFCard>
                  ))}
                </div>
              ) : (
                <FFEmptyState
                  title="No templates available"
                  message="Try creating the task manually for this child."
                  icon={<Library className="h-8 w-8" />}
                />
              )}
              <FFButton variant="outline" className="w-full" onClick={() => setShowTemplateSheet(false)}>
                Close
              </FFButton>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default AddTaskScreen;
