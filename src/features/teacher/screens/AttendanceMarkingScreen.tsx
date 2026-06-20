import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { AlertCircle, BookOpen, CheckCircle2, ChevronRight, Clock, MessageSquare, Send, Users, WifiOff } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import {
  AttendanceRecord,
  AttendanceRepository,
  AttendanceStatus,
  AttendanceStatusOption,
  CommentTemplate,
} from '../repositories/AttendanceRepository';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import { FFCardSkeleton } from '../../../shared/components/FFShimmer';

type AttendanceLoadState =
  | {
      status: 'loading';
      records: AttendanceRecord[];
      templates: CommentTemplate[];
      statusOptions: AttendanceStatus[];
      customStatuses: AttendanceStatusOption[];
      error: null;
    }
  | {
      status: 'ready';
      records: AttendanceRecord[];
      templates: CommentTemplate[];
      statusOptions: AttendanceStatus[];
      customStatuses: AttendanceStatusOption[];
      error: null;
    }
  | {
      status: 'error';
      records: AttendanceRecord[];
      templates: CommentTemplate[];
      statusOptions: AttendanceStatus[];
      customStatuses: AttendanceStatusOption[];
      error: string;
    };

type AttendanceAction =
  | { type: 'LOAD_START' }
  | {
      type: 'LOAD_SUCCESS';
      payload: {
        records: AttendanceRecord[];
        templates: CommentTemplate[];
        statusOptions: AttendanceStatus[];
        customStatuses: AttendanceStatusOption[];
      };
    }
  | { type: 'LOAD_ERROR'; error: string }
  | { type: 'SET_RECORDS'; payload: AttendanceRecord[] };

const attendanceReducer = (
  state: AttendanceLoadState,
  action: AttendanceAction,
): AttendanceLoadState => {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, status: 'loading', error: null };
    case 'LOAD_SUCCESS':
      return {
        status: 'ready',
        records: action.payload.records,
        templates: action.payload.templates,
        statusOptions: action.payload.statusOptions,
        customStatuses: action.payload.customStatuses,
        error: null,
      };
    case 'LOAD_ERROR':
      return { ...state, status: 'error', error: action.error };
    case 'SET_RECORDS':
      return { ...state, records: action.payload };
    default:
      return state;
  }
};

const FALLBACK_STATUSES: AttendanceStatus[] = ['Present', 'Absent', 'Late', 'LeftEarly'];

const statusTone: Record<AttendanceStatus, string> = {
  Present: 'bg-success/10 text-success',
  Absent: 'bg-alert/10 text-alert',
  Late: 'bg-accent/10 text-accent',
  LeftEarly: 'bg-primary/10 text-primary',
};

const nextStatus = (current: AttendanceStatus, available: AttendanceStatus[]) => {
  const sequence = available.length > 0 ? available : FALLBACK_STATUSES;
  const index = sequence.indexOf(current);
  return sequence[(index + 1) % sequence.length];
};

const AttendanceMarkingScreen: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loadState, dispatch] = useReducer(attendanceReducer, {
    status: 'loading',
    records: [],
    templates: [],
    statusOptions: [],
    customStatuses: [],
    error: null,
  });
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentRecordId, setCommentRecordId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showConfirmSheet, setShowConfirmSheet] = useState(false);

  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const loadAttendance = useCallback(async () => {
    if (!user?.familyId || !sessionId) {
      dispatch({ type: 'LOAD_ERROR', error: 'Session details are missing for attendance.' });
      return;
    }

    dispatch({ type: 'LOAD_START' });

    try {
      const [records, templates, masterStatuses, customStatuses] = await Promise.all([
        AttendanceRepository.getSessionRecords(user.familyId, sessionId),
        AttendanceRepository.getCommentTemplates(user.familyId),
        AttendanceRepository.getAttendanceStatuses(),
        AttendanceRepository.getCustomAttendanceStatuses(),
      ]);

      const statusOptions = masterStatuses
        .map((item) => item.code as AttendanceStatus)
        .filter((status): status is AttendanceStatus => FALLBACK_STATUSES.includes(status));

      dispatch({
        type: 'LOAD_SUCCESS',
        payload: {
          records,
          templates,
          statusOptions,
          customStatuses,
        },
      });
    } catch {
      dispatch({ type: 'LOAD_ERROR', error: 'Attendance records could not be loaded. Try again.' });
    }
  }, [sessionId, user?.familyId]);

  useEffect(() => {
    void loadAttendance();
  }, [loadAttendance]);

  const stats = useMemo(
    () => ({
      present: loadState.records.filter((record) => record.status === 'Present').length,
      absent: loadState.records.filter((record) => record.status === 'Absent').length,
      late: loadState.records.filter((record) => record.status === 'Late').length,
      leftEarly: loadState.records.filter((record) => record.status === 'LeftEarly').length,
    }),
    [loadState.records],
  );

  const selectedRecord = loadState.records.find((record) => record.id === commentRecordId) ?? null;

  const updateRecord = (recordId: string, updater: (record: AttendanceRecord) => AttendanceRecord) => {
    dispatch({
      type: 'SET_RECORDS',
      payload: loadState.records.map((record) => (record.id === recordId ? updater(record) : record)),
    });
  };

  const openCommentEditor = (record: AttendanceRecord) => {
    setCommentRecordId(record.id);
    setCommentDraft(record.comment ?? '');
  };

  const saveComment = () => {
    if (!commentRecordId) {
      return;
    }

    updateRecord(commentRecordId, (record) => ({
      ...record,
      comment: commentDraft.trim() || undefined,
    }));
    setCommentRecordId(null);
    setCommentDraft('');
  };

  const handleSubmit = async () => {
    if (!sessionId || !user?.familyId) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitMessage(null);

    try {
      if (isOffline) {
        localStorage.setItem(`offline_attendance_${sessionId}`, JSON.stringify(loadState.records));
        setSubmitMessage('Attendance was saved on this device and will need to be submitted when you are online.');
      } else {
        await AttendanceRepository.submitAttendance(user.familyId, sessionId, loadState.records);
        navigate('/teacher');
        return;
      }
    } catch {
      setSubmitError('Attendance could not be submitted. Please review the records and try again.');
    } finally {
      setIsSubmitting(false);
      setShowConfirmSheet(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-cream pb-32">
      <FFPageHeader
        title="Mark attendance"
        subtitle="Update each assigned child before submitting"
        showBack
      />

      <main className="page-enter mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <FFCard variant="primary" className="space-y-4 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-body text-xs font-bold uppercase tracking-wider text-white/70">
                Attendance
              </p>
              <h1 className="mt-1 text-xl font-display font-bold text-white sm:text-2xl">
                Fast classroom check-in
              </h1>
              <p className="mt-2 text-sm text-white/80">
                Move through the list quickly, add notes when needed, and submit once all students are reviewed.
              </p>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-2 text-right">
              <p className="font-numbers text-2xl text-white">{loadState.records.length}</p>
              <p className="text-[10px] font-body font-semibold uppercase tracking-wider text-white/70">
                Students
              </p>
            </span>
          </div>
        </FFCard>

        {isOffline ? (
          <FFCard variant="warm" className="p-4">
            <div className="flex items-start gap-3">
              <WifiOff className="mt-0.5 h-5 w-5 flex-shrink-0 text-alert" />
              <div>
                <p className="font-display text-sm font-semibold text-primary">Offline mode</p>
                <p className="mt-1 text-sm text-gray-600">
                  You can keep editing the list, but online submission is required to sync with the family.
                </p>
              </div>
            </div>
          </FFCard>
        ) : null}

        {submitMessage ? (
          <FFCard variant="warm" className="p-4">
            <p className="text-sm text-success">{submitMessage}</p>
          </FFCard>
        ) : null}

        {submitError ? (
          <FFCard variant="warm" className="p-4">
            <p className="text-sm text-alert">{submitError}</p>
          </FFCard>
        ) : null}

        <section className="space-y-3">
          <FFSectionHeader icon={<Users />} title="Summary" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {[
              { label: 'Present', value: stats.present, tone: 'bg-success/10 text-success' },
              { label: 'Absent', value: stats.absent, tone: 'bg-alert/10 text-alert' },
              { label: 'Late', value: stats.late, tone: 'bg-accent/10 text-accent' },
              { label: 'Left early', value: stats.leftEarly, tone: 'bg-primary/10 text-primary' },
            ].map((item) => (
              <FFCard key={item.label} className="p-4">
                <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-body font-bold uppercase tracking-wider ${item.tone}`}>
                  {item.label}
                </span>
                <p className="mt-3 font-numbers text-2xl text-primary">{item.value}</p>
              </FFCard>
            ))}
          </div>
        </section>

        {loadState.customStatuses.length > 0 ? (
          <FFCard variant="warm" className="space-y-3 p-4">
            <FFSectionHeader icon={<BookOpen />} title="Custom labels" />
            <div className="flex flex-wrap gap-2">
              {loadState.customStatuses.map((status) => (
                <span
                  key={status.id}
                  className="rounded-full border border-black/5 bg-white px-3 py-1 text-[10px] font-body font-bold uppercase tracking-wider text-primary"
                >
                  {status.name}
                </span>
              ))}
            </div>
          </FFCard>
        ) : null}

        <section className="space-y-3">
          <FFSectionHeader icon={<CheckCircle2 />} title="Student list" />

          {loadState.status === 'loading' && loadState.records.length === 0 ? (
            <div className="space-y-3">
              <FFCardSkeleton />
              <FFCardSkeleton />
              <FFCardSkeleton />
            </div>
          ) : null}

          {loadState.status === 'error' && loadState.records.length === 0 ? (
            <FFErrorState message={loadState.error} onRetry={() => void loadAttendance()} />
          ) : null}

          {loadState.status !== 'loading' && loadState.records.length === 0 ? (
            <FFEmptyState
              title="No attendance records"
              message="Assigned children will appear here once the session is ready for marking."
              onAction={() => navigate('/teacher')}
              actionLabel="Back to sessions"
              icon={<Users className="h-8 w-8" />}
            />
          ) : null}

          {loadState.records.length > 0 ? (
            <div className="space-y-3">
              {loadState.records.map((record) => (
                <FFCard key={record.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-sm font-semibold text-primary">
                        {record.childName}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {record.comment ? record.comment : 'No note added yet'}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-body font-bold uppercase tracking-wider ${statusTone[record.status]}`}>
                      {record.status}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <FFButton
                      variant="outline"
                      className="flex-1"
                      icon={<Clock className="h-4 w-4" />}
                      onClick={() =>
                        updateRecord(record.id, (item) => ({
                          ...item,
                          status: nextStatus(
                            item.status,
                            loadState.statusOptions.length > 0
                              ? loadState.statusOptions
                              : FALLBACK_STATUSES,
                          ),
                        }))
                      }
                    >
                      Cycle status
                    </FFButton>
                    <FFButton
                      variant="ghost"
                      className="flex-1"
                      icon={<MessageSquare className="h-4 w-4" />}
                      onClick={() => openCommentEditor(record)}
                    >
                      Add note
                    </FFButton>
                  </div>
                </FFCard>
              ))}
            </div>
          ) : null}
        </section>
      </main>

      {loadState.records.length > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-white/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-display text-sm font-semibold text-primary">
                {loadState.records.length} students ready
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Review the list before sending attendance for this session.
              </p>
            </div>
            <FFButton
              className="w-full sm:w-auto"
              icon={<Send className="h-4 w-4" />}
              onClick={() => setShowConfirmSheet(true)}
              disabled={loadState.statusOptions.length === 0 && loadState.status === 'ready' && loadState.records.length > 0 ? false : false}
            >
              Submit attendance
            </FFButton>
          </div>
        </div>
      ) : null}

      {commentRecordId && selectedRecord ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-50 bg-primary/40"
            onClick={() => setCommentRecordId(null)}
            aria-label="Close note editor"
          />
          <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white p-4 shadow-elevated sm:p-6">
            <div className="mx-auto max-w-3xl space-y-4">
              <FFSectionHeader icon={<MessageSquare />} title={`Note for ${selectedRecord.childName}`} />
              <div className="space-y-2">
                {loadState.templates.slice(0, 4).map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setCommentDraft(template.text)}
                    className="w-full rounded-xl border border-black/5 bg-[#FDF9F4] px-4 py-3 text-left text-sm text-primary transition-colors hover:border-primary/10"
                  >
                    {template.text}
                  </button>
                ))}
              </div>
              <textarea
                value={commentDraft}
                onChange={(event) => setCommentDraft(event.target.value)}
                placeholder="Add a short note for the family."
                className="min-h-[120px] w-full rounded-ff border border-black/5 bg-white px-4 py-3 text-sm text-primary outline-none transition-colors focus:border-primary/20"
              />
              <div className="flex gap-3">
                <FFButton variant="outline" className="flex-1" onClick={() => setCommentRecordId(null)}>
                  Cancel
                </FFButton>
                <FFButton className="flex-1" onClick={saveComment}>
                  Save note
                </FFButton>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {showConfirmSheet ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-50 bg-primary/40"
            onClick={() => setShowConfirmSheet(false)}
            aria-label="Close attendance confirmation"
          />
          <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white p-4 shadow-elevated sm:p-6">
            <div className="mx-auto max-w-3xl space-y-4">
              <FFSectionHeader icon={<AlertCircle />} title="Ready to submit" />
              <FFCard variant="warm" className="space-y-3 p-4">
                <p className="text-sm text-gray-600">
                  Present: {stats.present} · Absent: {stats.absent} · Late: {stats.late} · Left early: {stats.leftEarly}
                </p>
                {isOffline ? (
                  <p className="text-sm text-alert">
                    You are offline. Saving here will store the attendance locally only.
                  </p>
                ) : null}
              </FFCard>
              <div className="flex gap-3">
                <FFButton variant="outline" className="flex-1" onClick={() => setShowConfirmSheet(false)}>
                  Review again
                </FFButton>
                <FFButton
                  className="flex-1"
                  isLoading={isSubmitting}
                  onClick={() => void handleSubmit()}
                >
                  Confirm submit
                </FFButton>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default AttendanceMarkingScreen;
