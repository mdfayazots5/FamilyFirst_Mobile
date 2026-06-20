import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  FileText,
  Award,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Map,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useReports } from '../providers/ReportsProvider';
import { ScoreHistoryPoint } from '../repositories/ReportsRepository';
import ScoreRadarWidget from '../widgets/ScoreRadarWidget';
import ScoreTrendChart from '../widgets/ScoreTrendChart';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFBadge from '../../../shared/components/FFBadge';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';

const PILLAR_COLORS: Record<string, string> = {
  Discipline:    'bg-primary',
  Learning:      'bg-success',
  Contribution:  'bg-accent',
  Health:        'bg-alert',
  Social:        'bg-accent/60',
};

const PillarRow = ({ label, value, colorClass }: { label: string; value: number; colorClass: string }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between font-body text-xs">
      <span className="text-gray-500">{label}</span>
      <span className="font-numbers font-semibold text-primary">{value}%</span>
    </div>
    <div className="h-2 bg-black/5 rounded-full overflow-hidden">
      <div className={`h-full ${colorClass} rounded-full`} style={{ width: `${value}%` }} />
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
  const [activeChild, setActiveChild] = useState('Arjun');
  const [history, setHistory] = useState<ScoreHistoryPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      const data = await fetchScoreHistory('c1');
      setHistory(data);
      setTimeout(() => setIsLoading(false), 800);
    };
    fetch();
  }, [fetchScoreHistory, activeChild]);

  const children = [
    { id: 'c1', name: 'Arjun', score: 88, trend: '+4' },
    { id: 'c2', name: 'Zara',  score: 76, trend: '-2' },
  ];

  const currentChild = children.find(c => c.name === activeChild) ?? children[0];
  const trendPositive = currentChild.trend.startsWith('+');

  if (isLoading && history.length === 0) {
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
          {children.map(child => (
            <button
              key={child.id}
              onClick={() => setActiveChild(child.name)}
              className={`flex-1 py-2.5 rounded-xl font-body text-sm font-medium transition-colors ${
                activeChild === child.name
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-white/70'
              }`}
            >
              {child.name}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Score hero */}
        <FFCard className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-body text-xs text-gray-400 mb-1">Composite Score</p>
              <p className="font-numbers text-7xl font-bold text-primary leading-none">
                {currentChild.score}
              </p>
            </div>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-ff ${
              trendPositive ? 'bg-success/5 text-success border border-success/20' : 'bg-alert/5 text-alert border border-alert/20'
            }`}>
              {trendPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="font-numbers text-sm font-bold">{currentChild.trend}%</span>
            </div>
          </div>

          {/* Radar chart */}
          <div className="bg-black/[0.02] rounded-ff p-3">
            <ScoreRadarWidget data={history[history.length - 1]?.pillars ?? { discipline: 80, learning: 70, contribution: 60, health: 90, social: 75 }} />
          </div>
        </FFCard>

        {/* Pillar breakdown */}
        <FFCard className="p-4 space-y-3">
          <FFSectionHeader title="Pillar Breakdown" />
          <PillarRow label="Discipline"   value={88} colorClass={PILLAR_COLORS.Discipline} />
          <PillarRow label="Learning"     value={76} colorClass={PILLAR_COLORS.Learning} />
          <PillarRow label="Contribution" value={64} colorClass={PILLAR_COLORS.Contribution} />
          <PillarRow label="Health"       value={92} colorClass={PILLAR_COLORS.Health} />
          <PillarRow label="Social"       value={80} colorClass={PILLAR_COLORS.Social} />
        </FFCard>

        {/* AI insight */}
        <FFCard className="bg-primary text-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-accent" />
            <p className="font-body text-xs text-white/60 font-medium">Weekly Insight</p>
          </div>
          <p className="font-body text-sm text-white/90 leading-relaxed">
            <span className="text-accent font-semibold">{currentChild.name}</span> is showing strong
            growth in Discipline. A 4-day streak reward is recommended to maintain this momentum.
          </p>
          <FFButton variant="accent" size="sm" className="mt-4 w-full">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Acknowledge
          </FFButton>
        </FFCard>

        {/* 30-day trend */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <FFSectionHeader title="30-Day Trend" />
            <div className="flex gap-1.5">
              <FFBadge variant="primary" size="sm">Rolling</FFBadge>
              <FFBadge variant="accent" size="sm">All Pillars</FFBadge>
            </div>
          </div>
          <FFCard className="p-4">
            {isLoading ? (
              <FFShimmer className="h-48 rounded-xl" />
            ) : (
              <div className="h-48">
                <ScoreTrendChart data={history} />
              </div>
            )}
          </FFCard>
        </div>

        {/* Milestones */}
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
