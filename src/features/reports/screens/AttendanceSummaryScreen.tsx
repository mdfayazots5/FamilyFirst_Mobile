import React, { useMemo, useState } from 'react';
import {
  Filter,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useReports } from '../providers/ReportsProvider';
import { ReportsRepository, type AttendanceHeatmapEntry } from '../repositories/ReportsRepository';
import { useApiResource } from '../../../core/hooks/useApiResource';
import AttendanceHeatmapWidget, { HEATMAP_LEGEND } from '../widgets/AttendanceHeatmapWidget';
import FFCard from '../../../shared/components/FFCard';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import { toLocalIsoDate } from '../../../core/utils/format';

const PERIOD_DAYS = 30;
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const toIsoDate = (d: Date) => toLocalIsoDate(d);

/** Longest run of consecutive Present session-days (days with no session are skipped, not breaks). */
const bestPresentStreak = (heatmap: AttendanceHeatmapEntry[]) => {
  let best = 0;
  let run = 0;
  for (const day of heatmap) {
    if (day.status === 'NoSession') continue;
    run = day.status === 'Present' ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return best;
};

/** Present share per weekday over session-days; returns best and worst weekday when there is data. */
const weekdayPattern = (heatmap: AttendanceHeatmapEntry[]) => {
  const totals = WEEKDAYS.map(() => ({ sessions: 0, present: 0 }));
  for (const day of heatmap) {
    if (day.status === 'NoSession') continue;
    const wd = new Date(`${day.date}T00:00:00`).getDay();
    totals[wd].sessions += 1;
    if (day.status === 'Present') totals[wd].present += 1;
  }
  const rated = totals
    .map((t, wd) => ({ wd, rate: t.sessions ? t.present / t.sessions : -1 }))
    .filter(r => r.rate >= 0);
  if (rated.length < 2) return null;
  const best = rated.reduce((a, b) => (b.rate > a.rate ? b : a));
  const worst = rated.reduce((a, b) => (b.rate < a.rate ? b : a));
  return best.rate === worst.rate ? null : { best: WEEKDAYS[best.wd], worst: WEEKDAYS[worst.wd] };
};

const AttendanceSummaryScreen: React.FC = () => {
  const { fetchAttendanceSummary } = useReports();

  // Fixed 30-day window, computed once per mount.
  const [range] = useState(() => {
    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - (PERIOD_DAYS - 1));
    return { from: toIsoDate(from), to: toIsoDate(to) };
  });

  const children = useApiResource(
    () => ReportsRepository.getChildren(),
    [],
    'Unable to load your children right now.',
  );
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const activeChild =
    children.data?.find(c => c.id === selectedChildId) ?? children.data?.[0] ?? null;

  const summary = useApiResource(
    activeChild ? () => fetchAttendanceSummary(activeChild.id, range.from, range.to) : null,
    [activeChild?.id, fetchAttendanceSummary, range.from, range.to],
    'Unable to load attendance for this period.',
  );

  const heatmap = summary.data?.heatmap ?? [];
  const streak = useMemo(() => bestPresentStreak(heatmap), [heatmap]);
  const pattern = useMemo(() => weekdayPattern(heatmap), [heatmap]);

  const header = (
    <FFPageHeader
      title="Attendance Summary"
      subtitle={new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
      showBack
      rightAction={
        <button className="p-2 rounded-xl bg-white/10" aria-label="Filter">
          <Filter className="w-4 h-4 text-white" />
        </button>
      }
    />
  );

  if (children.isLoading) {
    return (
      <div className="min-h-screen bg-bg-cream">
        {header}
        <div className="px-4 pt-4 space-y-3">
          <FFShimmer className="h-40 rounded-ff" />
          <FFShimmer className="h-28 rounded-ff" />
        </div>
      </div>
    );
  }

  if (children.error) {
    return (
      <div className="min-h-screen bg-bg-cream">
        {header}
        <FFErrorState message={children.error} onRetry={children.reload} />
      </div>
    );
  }

  if (!activeChild) {
    return (
      <div className="min-h-screen bg-bg-cream">
        {header}
        <FFEmptyState title="No children yet" message="Add a child to your family to see attendance here." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-cream pb-24">
      {header}

      {/* Child selector — inside header extension */}
      <div className="bg-primary px-4 pb-3">
        <div className="flex gap-2 p-1.5 bg-white/10 rounded-ff">
          {(children.data ?? []).map(child => (
            <button
              key={child.id}
              onClick={() => setSelectedChildId(child.id)}
              className={`flex-1 min-h-12 py-2.5 rounded-xl font-body text-sm font-medium transition-colors ${
                activeChild.id === child.id
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-white/70'
              }`}
            >
              {child.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {summary.error ? (
          <FFErrorState message={summary.error} onRetry={summary.reload} />
        ) : (
          <>
            {/* Heatmap */}
            <div>
              <FFSectionHeader title={`${PERIOD_DAYS}-Day Activity`} />
              <FFCard className="p-4 mt-2">
                {/* Legend */}
                <div className="flex flex-wrap gap-4 mb-4">
                  {HEATMAP_LEGEND.map(({ status, cell, label }) => (
                    <div key={status} className="flex items-center gap-1.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${cell}`} />
                      <span className="font-body text-xs text-gray-400">{label}</span>
                    </div>
                  ))}
                </div>
                {summary.isLoading || !summary.data ? (
                  <FFShimmer className="h-32 rounded-xl" />
                ) : (
                  <AttendanceHeatmapWidget data={heatmap} />
                )}
              </FFCard>
            </div>

            {/* Stats */}
            <div>
              <FFSectionHeader title="Performance" />
              <div className="grid grid-cols-3 gap-3 mt-2">
                <FFCard className="p-4 flex flex-col items-center text-center">
                  <div className="p-2 bg-success/10 rounded-xl mb-2">
                    <TrendingUp className="w-5 h-5 text-success" />
                  </div>
                  <p className="font-numbers text-xl font-bold text-primary">
                    {summary.data ? `${Math.round(summary.data.attendanceRate)}%` : '—'}
                  </p>
                  <p className="font-body text-xs text-gray-400 mt-0.5">Present Rate</p>
                  <p className="font-body text-xs text-gray-300 mt-1">
                    {summary.data ? `${summary.data.totalSessions} sessions` : ''}
                  </p>
                </FFCard>

                <FFCard className="p-4 flex flex-col items-center text-center">
                  <div className="p-2 bg-primary/5 rounded-xl mb-2">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <p className="font-numbers text-xl font-bold text-primary">{summary.data ? streak : '—'}</p>
                  <p className="font-body text-xs text-gray-400 mt-0.5">Best Streak</p>
                  <p className="font-body text-xs text-gray-300 mt-1">sessions</p>
                </FFCard>

                <FFCard className="p-4 flex flex-col items-center text-center">
                  <div className="p-2 bg-alert/10 rounded-xl mb-2">
                    <CheckCircle2 className="w-5 h-5 text-alert" />
                  </div>
                  <p className="font-numbers text-xl font-bold text-primary">{summary.data ? summary.data.absentCount : '—'}</p>
                  <p className="font-body text-xs text-gray-400 mt-0.5">Absent</p>
                  <p className="font-body text-xs text-gray-300 mt-1">
                    {summary.data ? `${summary.data.lateCount} late` : ''}
                  </p>
                </FFCard>
              </div>
            </div>

            {/* Insight card — derived from the loaded heatmap only */}
            {pattern && (
              <FFCard variant="primary" className="p-5 text-white">
                <p className="font-body text-xs text-white/60 mb-2">Weekly Pattern</p>
                <p className="font-body text-sm text-white/90 leading-relaxed">
                  <span className="font-semibold text-accent">{activeChild.label}</span> has the best attendance on{' '}
                  {pattern.best}s and the lowest on {pattern.worst}s in the last {PERIOD_DAYS} days.
                </p>
              </FFCard>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AttendanceSummaryScreen;
