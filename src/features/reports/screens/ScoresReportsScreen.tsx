import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  FileText,
  Award,
  BarChart3,
  ChevronRight,
  Map,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useReports } from '../providers/ReportsProvider';
import { ReportsRepository, type PillarScores } from '../repositories/ReportsRepository';
import { useApiResource } from '../../../core/hooks/useApiResource';
import ScoreRadarWidget, { PILLAR_LABELS, PILLAR_MAX } from '../widgets/ScoreRadarWidget';
import ScoreTrendChart from '../widgets/ScoreTrendChart';
import FFCard from '../../../shared/components/FFCard';
import FFBadge from '../../../shared/components/FFBadge';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFEmptyState from '../../../shared/components/FFEmptyState';

const PILLAR_COLORS: Record<keyof PillarScores, string> = {
  study:          'bg-primary',
  cleanliness:    'bg-success',
  discipline:     'bg-accent',
  screenControl:  'bg-alert',
  responsibility: 'bg-accent/60',
};

const PILLAR_KEYS = Object.keys(PILLAR_LABELS) as (keyof PillarScores)[];

const pillarTotal = (p: PillarScores) => PILLAR_KEYS.reduce((sum, key) => sum + p[key], 0);

const PillarRow = ({ label, value, colorClass }: { label: string; value: number; colorClass: string }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between font-body text-xs">
      <span className="text-gray-500">{label}</span>
      <span className="font-numbers font-semibold text-primary">{value}/{PILLAR_MAX}</span>
    </div>
    <div className="h-2 bg-black/5 rounded-full overflow-hidden">
      <div className={`h-full ${colorClass} rounded-full`} style={{ width: `${(value / PILLAR_MAX) * 100}%` }} />
    </div>
  </div>
);

const MilestoneTile = ({ label, desc, progress }: { label: string; desc: string; progress: number }) => (
  <FFCard className="p-4 space-y-3">
    <div className="flex justify-between items-center">
      <div>
        <p className="font-body text-sm font-semibold text-primary">{label}</p>
        <p className="font-body text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
      <span className="font-numbers text-sm font-bold text-primary">{progress}%</span>
    </div>
    <div className="h-2 bg-black/5 rounded-full overflow-hidden">
      <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
    </div>
  </FFCard>
);

const ScoresReportsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { fetchScoreHistory } = useReports();

  // API data — loaded through the shared reducer hook (no component useState for API data).
  const children = useApiResource(
    () => ReportsRepository.getChildren(),
    [],
    'Unable to load your children right now.',
  );
  // UI selection only.
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const activeChild =
    children.data?.find(c => c.id === selectedChildId) ?? children.data?.[0] ?? null;

  const history = useApiResource(
    activeChild ? () => fetchScoreHistory(activeChild.id) : null,
    [activeChild?.id, fetchScoreHistory],
    'Unable to load the score history.',
  );

  const points = history.data ?? [];
  const latest = points[points.length - 1];
  const first = points[0];
  const total = latest ? pillarTotal(latest.pillars) : 0;
  const trend = latest && first ? total - pillarTotal(first.pillars) : 0;
  const trendPositive = trend >= 0;
  const strongestPillar = latest
    ? PILLAR_KEYS.reduce((best, key) => (latest.pillars[key] > latest.pillars[best] ? key : best), PILLAR_KEYS[0])
    : null;

  if (children.isLoading) {
    return (
      <div className="min-h-screen bg-bg-cream">
        <FFPageHeader title="Performance" showBack />
        <div className="px-4 pt-4 space-y-3">
          <FFShimmer className="h-40 rounded-ff" />
          <FFShimmer className="h-52 rounded-ff" />
          <FFShimmer className="h-64 rounded-ff" />
        </div>
      </div>
    );
  }

  if (children.error) {
    return (
      <div className="min-h-screen bg-bg-cream">
        <FFPageHeader title="Performance" showBack />
        <FFErrorState message={children.error} onRetry={children.reload} />
      </div>
    );
  }

  if (!activeChild) {
    return (
      <div className="min-h-screen bg-bg-cream">
        <FFPageHeader title="Performance" showBack />
        <FFEmptyState title="No children yet" message="Add a child to your family to see their pillar scores here." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-cream pb-24">
      <FFPageHeader
        title="Performance Matrix"
        showBack
        rightAction={
          <button
            onClick={() => navigate('/reports/weekly')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 rounded-xl"
          >
            <FileText className="w-3.5 h-3.5 text-white" />
            <span className="font-body text-xs text-white font-medium">Weekly</span>
          </button>
        }
      />

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
        {history.error ? (
          <FFErrorState message={history.error} onRetry={history.reload} />
        ) : history.isLoading && !latest ? (
          <>
            <FFShimmer className="h-72 rounded-ff" />
            <FFShimmer className="h-52 rounded-ff" />
          </>
        ) : !latest ? (
          <FFEmptyState
            title="No scores yet"
            message={`${activeChild.label}'s pillar scores appear once their first tasks are approved.`}
          />
        ) : (
          <>
            {/* Score hero */}
            <FFCard className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-body text-xs text-gray-400 mb-1">Pillar Total</p>
                  <p className="font-numbers text-7xl font-bold text-primary leading-none">
                    {total}
                    <span className="text-xl text-gray-300">/{PILLAR_MAX * PILLAR_KEYS.length}</span>
                  </p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-ff ${
                  trendPositive ? 'bg-success/5 text-success border border-success/20' : 'bg-alert/5 text-alert border border-alert/20'
                }`}>
                  {trendPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span className="font-numbers text-sm font-bold">{trendPositive ? '+' : ''}{trend} pts</span>
                </div>
              </div>

              {/* Radar chart */}
              <div className="bg-black/[0.02] rounded-ff p-3">
                <ScoreRadarWidget data={latest.pillars} />
              </div>
            </FFCard>

            {/* Pillar breakdown */}
            <FFCard className="p-4 space-y-3">
              <FFSectionHeader title="Pillar Breakdown" />
              {PILLAR_KEYS.map(key => (
                <PillarRow key={key} label={PILLAR_LABELS[key]} value={latest.pillars[key]} colorClass={PILLAR_COLORS[key]} />
              ))}
            </FFCard>

            {/* Insight — derived from the loaded history only */}
            {strongestPillar && (
              <FFCard variant="primary" className="p-5 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-accent" />
                  <p className="font-body text-xs text-white/60 font-medium">Period Insight</p>
                </div>
                <p className="font-body text-sm text-white/90 leading-relaxed">
                  <span className="text-accent font-semibold">{activeChild.label}</span>'s strongest pillar is{' '}
                  <span className="font-semibold">{PILLAR_LABELS[strongestPillar]}</span> ({latest.pillars[strongestPillar]}/{PILLAR_MAX}).
                  The pillar total moved {trendPositive ? 'up' : 'down'} {Math.abs(trend)} points over this period.
                </p>
              </FFCard>
            )}

            {/* Trend */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <FFSectionHeader title="Score Trend" />
                <div className="flex gap-1.5">
                  <FFBadge variant="primary" size="sm">Rolling</FFBadge>
                  <FFBadge variant="accent" size="sm">All Pillars</FFBadge>
                </div>
              </div>
              <FFCard className="p-4">
                <div className="h-48">
                  <ScoreTrendChart data={points} />
                </div>
              </FFCard>
            </div>
          </>
        )}

        {/* Milestones — [VERIFY] no milestone API exists yet; static placeholders (audit F-P8-4). */}
        <div>
          <FFSectionHeader title="Milestones" />
          <div className="space-y-3 mt-2">
            <MilestoneTile label="Century Streak" desc="100 active days" progress={80} />
            <MilestoneTile label="Academic Merit"  desc="5 star ratings"  progress={40} />
          </div>
        </div>

        {/* Quick nav */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Map className="w-5 h-5" />,       label: 'Attendance', path: '/reports/attendance' },
            { icon: <Award className="w-5 h-5" />,     label: 'Badges',     path: '#' },
            { icon: <FileText className="w-5 h-5" />,  label: 'Export PDF', path: '#' },
          ].map(({ icon, label, path }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-2 bg-white border border-black/5 rounded-ff p-4 shadow-card text-center"
            >
              <div className="p-2 bg-primary/5 rounded-xl text-primary">{icon}</div>
              <span className="font-body text-xs text-gray-500">{label}</span>
              <ChevronRight className="w-3 h-3 text-gray-300" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScoresReportsScreen;
