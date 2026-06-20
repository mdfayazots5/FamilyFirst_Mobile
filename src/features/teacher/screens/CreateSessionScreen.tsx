import React, { useState } from 'react';
import { Calendar, CheckCircle2, Clock, Info, Repeat, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { AttendanceRepository } from '../repositories/AttendanceRepository';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';

const CreateSessionScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [subject, setSubject] = useState('');
  const [batch, setBatch] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('16:00');
  const [endTime, setEndTime] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user?.familyId) {
      setSubmitError('Teacher family context is missing. Please sign in again.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await AttendanceRepository.createSession(user.familyId, {
        subject,
        sessionName: batch,
        scheduledDate,
        startTime,
        endTime: endTime || undefined,
        isRecurring,
      });
      navigate('/teacher');
    } catch {
      setSubmitError('Session creation failed. Verify the schedule details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-cream pb-24">
      <FFPageHeader
        title="Create session"
        subtitle="Set up attendance for the next class"
        showBack
      />

      <main className="page-enter mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <FFCard variant="primary" className="space-y-4 p-5 sm:p-6">
          <div className="min-w-0">
            <p className="font-body text-xs font-bold uppercase tracking-wider text-white/70">
              Session setup
            </p>
            <h1 className="mt-1 text-xl font-display font-bold text-white sm:text-2xl">
              Plan the next class
            </h1>
            <p className="mt-2 text-sm text-white/80">
              Teachers can schedule within the allowed attendance window and return to mark records quickly.
            </p>
          </div>
        </FFCard>

        {submitError ? (
          <FFCard variant="warm" className="p-4">
            <p className="text-sm text-alert">{submitError}</p>
          </FFCard>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="space-y-3">
            <FFSectionHeader icon={<Users />} title="Class details" />
            <FFCard className="space-y-4 p-4">
              <label className="block space-y-2">
                <span className="text-xs font-body font-semibold uppercase tracking-wider text-gray-400">
                  Subject
                </span>
                <input
                  required
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  className="min-h-12 w-full rounded-xl border border-black/5 bg-white px-4 text-sm text-primary outline-none transition-colors focus:border-primary/20"
                  placeholder="Mathematics"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-body font-semibold uppercase tracking-wider text-gray-400">
                  Session name
                </span>
                <input
                  required
                  value={batch}
                  onChange={(event) => setBatch(event.target.value)}
                  className="min-h-12 w-full rounded-xl border border-black/5 bg-white px-4 text-sm text-primary outline-none transition-colors focus:border-primary/20"
                  placeholder="Batch A"
                />
              </label>
            </FFCard>
          </section>

          <section className="space-y-3">
            <FFSectionHeader icon={<Calendar />} title="Schedule" />
            <FFCard className="grid gap-4 p-4 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-xs font-body font-semibold uppercase tracking-wider text-gray-400">
                  Date
                </span>
                <input
                  required
                  type="date"
                  value={scheduledDate}
                  onChange={(event) => setScheduledDate(event.target.value)}
                  className="min-h-12 w-full rounded-xl border border-black/5 bg-white px-4 text-sm text-primary outline-none transition-colors focus:border-primary/20"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-body font-semibold uppercase tracking-wider text-gray-400">
                  Start time
                </span>
                <input
                  required
                  type="time"
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  className="min-h-12 w-full rounded-xl border border-black/5 bg-white px-4 text-sm text-primary outline-none transition-colors focus:border-primary/20"
                />
              </label>

              <label className="block space-y-2 sm:col-span-2">
                <span className="text-xs font-body font-semibold uppercase tracking-wider text-gray-400">
                  End time
                </span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  className="min-h-12 w-full rounded-xl border border-black/5 bg-white px-4 text-sm text-primary outline-none transition-colors focus:border-primary/20"
                />
              </label>
            </FFCard>
          </section>

          <section className="space-y-3">
            <FFSectionHeader icon={<Repeat />} title="Recurrence" />
            <FFCard className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="font-display text-sm font-semibold text-primary">Repeat weekly</p>
                <p className="mt-1 text-sm text-gray-500">
                  Use this when the same session runs every week.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRecurring((current) => !current)}
                className={`flex min-h-12 min-w-12 items-center rounded-full p-1 transition-colors ${
                  isRecurring ? 'bg-primary' : 'bg-black/10'
                }`}
                aria-label="Toggle recurring session"
              >
                <span
                  className={`h-10 w-10 rounded-full bg-white transition-transform ${
                    isRecurring ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </FFCard>
          </section>

          <FFCard variant="warm" className="space-y-3 p-4">
            <FFSectionHeader icon={<Info />} title="Session rules" />
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Schedule within 7 days in the past and 30 days in the future.</li>
              <li>When an end time is entered, it must be later than the start time.</li>
              <li>Attendance submission will auto-fill any assigned child not marked manually.</li>
            </ul>
          </FFCard>

          <FFButton
            type="submit"
            className="w-full"
            icon={<CheckCircle2 className="h-4 w-4" />}
            isLoading={isSubmitting}
          >
            Create session
          </FFButton>

          <FFButton
            type="button"
            variant="outline"
            className="w-full"
            icon={<Clock className="h-4 w-4" />}
            onClick={() => navigate('/teacher')}
          >
            Back to sessions
          </FFButton>
        </form>
      </main>
    </div>
  );
};

export default CreateSessionScreen;
