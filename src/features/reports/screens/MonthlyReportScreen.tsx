import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RefreshCw, TrendingUp, TrendingDown, Minus, Heart, FileText, Download } from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, LineChart, Line, XAxis, Tooltip,
} from 'recharts';
import { useAuth } from '../../../core/auth/AuthContext';
import {
  ReportsRepository,
  MonthlyFamilyReport,
  ChildMonthlySummary,
} from '../repositories/ReportsRepository';
import FFCard from '../../../shared/components/FFCard';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Recharts SVG stroke/fill require hex strings — CSS tokens don't apply here
const CHART_COLORS = { primary: '#1A2E4A', accent: '#C8922A', success: '#2D6A4F' };

const MonthlyFamilyView: React.FC<{
  report: MonthlyFamilyReport;
  onChildSelect: (id: string) => void;
}> = ({ report, onChildSelect }) => {
  const { narrativeHeadline, children, expiringDocuments, healthReminders, totalFeedbackCount } = report;

  return (
    <div className="space-y-4">
      {/* Headline */}
      <FFCard className="bg-primary text-white p-5">
        <p className="font-body text-xs text-white/60 mb-1">
          Monthly Report — {MONTH_NAMES[report.month - 1]} {report.year}
        </p>
        <p className="font-display font-semibold text-base leading-snug">{narrativeHeadline}</p>
        <p className="font-body text-xs text-white/50 mt-2">
          {totalFeedbackCount} teacher feedback{totalFeedbackCount !== 1 ? 's' : ''} this month
        </p>
      </FFCard>

      {/* Per-child cards */}
      <div className="space-y-3">
        <FFSectionHeader title="Children's Highlights" />
        {children.map(child => (
          <button
            key={child.childProfileId}
            onClick={() => onChildSelect(child.childProfileId)}
            className="w-full text-left"
          >
            <FFCard className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="font-body text-sm font-semibold text-primary">{child.childName}</p>
                <span className="font-body text-xs text-accent font-medium">View Details →</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Attendance', value: child.attendanceRate, delta: child.attendanceDelta },
                  { label: 'Tasks', value: child.taskRate, delta: child.taskDelta },
                ].map(({ label, value, delta }) => (
                  <div key={label}>
                    <p className="font-body text-xs text-gray-400 mb-1">{label}</p>
                    <div className="flex items-center gap-1.5">
                      <p className="font-numbers text-lg font-bold text-primary">{value.toFixed(0)}%</p>
                      <span className={`flex items-center gap-0.5 font-numbers text-xs font-medium ${
                        delta > 0 ? 'text-success' : delta < 0 ? 'text-alert' : 'text-gray-400'
                      }`}>
                        {delta > 0 ? <TrendingUp className="w-3 h-3" /> : delta < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                        {Math.abs(delta).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-3 font-body text-xs text-gray-500">
                <span>💰 {child.coinsEarned} earned</span>
                <span>🎁 {child.coinsSpent} spent</span>
                <span>📝 {child.feedbackCount} feedback</span>
              </div>
            </FFCard>
          </button>
        ))}
      </div>

      {/* Expiring documents */}
      {expiringDocuments.length > 0 && (
        <FFCard className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-accent" />
            <FFSectionHeader title="Documents Expiring Soon" />
          </div>
          <div className="space-y-2">
            {expiringDocuments.map(doc => (
              <div key={doc.documentId} className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-body text-xs font-medium text-primary truncate">{doc.documentName}</p>
                  <p className="font-body text-xs text-gray-400">{doc.category}</p>
                </div>
                <span className={`font-numbers text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                  doc.daysUntilExpiry <= 14 ? 'text-alert bg-alert/5' : 'text-accent bg-accent/10'
                }`}>
                  {doc.daysUntilExpiry}d
                </span>
              </div>
            ))}
          </div>
        </FFCard>
      )}

      {/* Health reminders */}
      {healthReminders.length > 0 && (
        <FFCard className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-alert" />
            <FFSectionHeader title="Health Reminders" />
          </div>
          <div className="space-y-2">
            {healthReminders.map((r, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="font-body text-xs font-medium text-primary bg-primary/5 px-2 py-0.5 rounded-full flex-shrink-0">
                  {r.reminderType}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-xs font-medium text-primary">{r.memberName} — {r.description}</p>
                  {r.dueDate && (
                    <p className="font-body text-xs text-gray-400">
                      Due {new Date(r.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </FFCard>
      )}
    </div>
  );
};

const ChildMonthlyView: React.FC<{ summary: ChildMonthlySummary }> = ({ summary }) => {
  const radarData = [
    { subject: 'Study',          value: summary.pillarScores.at(-1)?.studyScore ?? 0 },
    { subject: 'Discipline',     value: summary.pillarScores.at(-1)?.disciplineScore ?? 0 },
    { subject: 'Cleanliness',    value: summary.pillarScores.at(-1)?.cleanlinessScore ?? 0 },
    { subject: 'Screen',         value: summary.pillarScores.at(-1)?.screenControlScore ?? 0 },
    { subject: 'Responsibility', value: summary.pillarScores.at(-1)?.responsibilityScore ?? 0 },
  ];

  const trendData = summary.pillarScores.map(s => ({
    month:       MONTH_NAMES[new Date(s.month).getMonth()],
    study:       s.studyScore,
    discipline:  s.disciplineScore,
    cleanliness: s.cleanlinessScore,
  }));

  return (
    <div className="space-y-4">
      {/* Narrative */}
      <FFCard className="bg-primary text-white p-5">
        <p className="font-body text-xs text-white/60 mb-1">
          {summary.childName} — {MONTH_NAMES[summary.month - 1]} {summary.year}
        </p>
        <p className="font-body text-sm font-medium leading-relaxed text-white/80">{summary.narrativeSummary}</p>
      </FFCard>

      {/* Attendance + Tasks */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Attendance', rate: summary.attendanceRate, a: summary.attendancePresentCount, b: summary.attendanceSessions, suffix: 'sessions' },
          { label: 'Tasks',      rate: summary.taskRate,       a: summary.taskApprovedCount,     b: summary.taskAssignedCount,  suffix: 'assigned' },
        ].map(({ label, rate, a, b, suffix }) => (
          <FFCard key={label} className="p-4">
            <p className="font-body text-xs text-gray-400 mb-1">{label}</p>
            <p className="font-numbers text-2xl font-bold text-primary">{rate.toFixed(0)}%</p>
            <p className="font-body text-xs text-gray-400 mt-1">{a}/{b} {suffix}</p>
            <div className="mt-2 bg-black/5 rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-primary" style={{ width: `${rate}%` }} />
            </div>
          </FFCard>
        ))}
      </div>

      {/* Coins */}
      <FFCard className="p-4 flex items-center gap-6">
        <div>
          <p className="font-body text-xs text-gray-400">Earned</p>
          <p className="font-numbers text-xl font-bold text-accent">+{summary.coinsEarned}</p>
        </div>
        <div className="w-px h-10 bg-black/5" />
        <div>
          <p className="font-body text-xs text-gray-400">Spent</p>
          <p className="font-numbers text-xl font-bold text-gray-400">-{summary.coinsSpent}</p>
        </div>
        <div className="w-px h-10 bg-black/5" />
        <div>
          <p className="font-body text-xs text-gray-400">Balance</p>
          <p className="font-numbers text-xl font-bold text-success">{summary.coinsEarned - summary.coinsSpent}</p>
        </div>
      </FFCard>

      {/* Pillar radar */}
      {summary.pillarScores.length > 0 && (
        <FFCard className="p-4">
          <FFSectionHeader title="Pillar Scores" />
          {/* Recharts SVG requires hex color strings, not CSS tokens */}
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#6b7280' }} />
              <Radar dataKey="value" fill={CHART_COLORS.primary} fillOpacity={0.25} stroke={CHART_COLORS.primary} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>

          {trendData.length > 1 && (
            <>
              <p className="font-body text-xs text-gray-400 mb-2 mt-3">3-month trend</p>
              <ResponsiveContainer width="100%" height={80}>
                <LineChart data={trendData}>
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 10 }} />
                  <Line dataKey="study"       stroke={CHART_COLORS.primary} strokeWidth={2} dot={false} />
                  <Line dataKey="discipline"  stroke={CHART_COLORS.accent}  strokeWidth={2} dot={false} />
                  <Line dataKey="cleanliness" stroke={CHART_COLORS.success} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </FFCard>
      )}
    </div>
  );
};

const MonthlyReportScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const childIdParam = searchParams.get('childId');
  const [view, setView] = useState<'family' | 'child'>(childIdParam ? 'child' : 'family');
  const [selectedChildId, setSelectedChildId] = useState<string | null>(childIdParam);

  const [familyReport, setFamilyReport] = useState<MonthlyFamilyReport | null>(null);
  const [childSummary, setChildSummary]  = useState<ChildMonthlySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFamily = async () => {
    if (!user?.familyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await ReportsRepository.getMonthlyFamilyReport(user.familyId);
      setFamilyReport(data);
    } catch {
      setError('Failed to load monthly report.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadChild = async (childId: string) => {
    if (!user?.familyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await ReportsRepository.getChildMonthlySummary(user.familyId, childId);
      setChildSummary(data);
    } catch {
      setError('Failed to load child summary.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'family') loadFamily();
    else if (view === 'child' && selectedChildId) loadChild(selectedChildId);
  }, [view, selectedChildId, user?.familyId]);

  const handleChildSelect = (childId: string) => {
    setSelectedChildId(childId);
    setView('child');
  };

  const handleBack = () => {
    if (view === 'child') setView('family');
    else navigate(-1);
  };

  const title = view === 'child' && childSummary
    ? `${childSummary.childName}'s Report`
    : 'Monthly Report';

  const handleRefresh = () => {
    if (view === 'family') loadFamily();
    else if (selectedChildId) loadChild(selectedChildId);
  };

  return (
    <div className="min-h-screen bg-bg-cream">
      <FFPageHeader
        title={title}
        showBack
        onBack={handleBack}
        rightAction={
          <div className="flex gap-1">
            <button onClick={handleRefresh} className="p-2 rounded-xl bg-white/10" aria-label="Refresh">
              <RefreshCw className={`w-4 h-4 text-white ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button className="p-2 rounded-xl bg-white/10" aria-label="Export PDF">
              <Download className="w-4 h-4 text-white" />
            </button>
          </div>
        }
      />

      {/* Child tab bar — inside header extension */}
      {view === 'family' && familyReport && familyReport.children.length > 0 && (
        <div className="bg-primary px-4 pb-3 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setView('family')}
            className="px-3 py-1 rounded-full font-body text-xs font-medium bg-accent text-white flex-shrink-0"
          >
            Family
          </button>
          {familyReport.children.map(c => (
            <button
              key={c.childProfileId}
              onClick={() => handleChildSelect(c.childProfileId)}
              className="px-3 py-1 rounded-full font-body text-xs font-medium bg-white/15 text-white flex-shrink-0"
            >
              {c.childName}
            </button>
          ))}
        </div>
      )}

      <div className="px-4 pt-4 pb-24">
        {isLoading ? (
          <div className="space-y-3">
            <FFShimmer className="h-24 rounded-ff" />
            <FFShimmer className="h-36 rounded-ff" />
            <FFShimmer className="h-36 rounded-ff" />
          </div>
        ) : error ? (
          <FFErrorState message={error} onRetry={handleRefresh} />
        ) : view === 'family' && familyReport ? (
          <MonthlyFamilyView report={familyReport} onChildSelect={handleChildSelect} />
        ) : view === 'child' && childSummary ? (
          <ChildMonthlyView summary={childSummary} />
        ) : null}
      </div>
    </div>
  );
};

export default MonthlyReportScreen;
