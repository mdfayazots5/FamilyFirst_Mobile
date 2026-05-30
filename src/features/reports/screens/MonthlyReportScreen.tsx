import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw, TrendingUp, TrendingDown, Minus, AlertCircle, Heart, FileText, Download } from 'lucide-react';
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

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ── RP-03 Monthly Family Report ────────────────────────────────────────────────

const MonthlyFamilyView: React.FC<{ report: MonthlyFamilyReport; onChildSelect: (id: string) => void }> = ({
  report, onChildSelect,
}) => {
  const { narrativeHeadline, children, expiringDocuments, healthReminders, totalFeedbackCount } = report;

  return (
    <div className="space-y-5">
      {/* Headline */}
      <div className="bg-[#1A2E4A] rounded-2xl p-5 text-white">
        <p className="text-xs text-blue-200 mb-1">Monthly Report — {MONTH_NAMES[report.month - 1]} {report.year}</p>
        <p className="text-lg font-bold leading-snug" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {narrativeHeadline}
        </p>
        <p className="text-xs text-blue-300 mt-2">{totalFeedbackCount} teacher feedback{totalFeedbackCount !== 1 ? 's' : ''} this month</p>
      </div>

      {/* Per-child cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-[#1A2E4A]" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Children's Highlights
        </h2>
        {children.map(child => (
          <button
            key={child.childProfileId}
            onClick={() => onChildSelect(child.childProfileId)}
            className="w-full bg-white rounded-2xl p-4 shadow-sm text-left"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-[#1A2E4A]">{child.childName}</p>
              <span className="text-xs text-[#C8922A] font-medium">View Details →</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Attendance', value: child.attendanceRate, delta: child.attendanceDelta },
                { label: 'Tasks', value: child.taskRate, delta: child.taskDelta },
              ].map(({ label, value, delta }) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 mb-1">{label}</p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-lg font-bold text-[#1A2E4A]" style={{ fontFamily: 'Space Grotesk, monospace' }}>
                      {value.toFixed(0)}%
                    </p>
                    <span className={`flex items-center gap-0.5 text-xs font-medium ${delta > 0 ? 'text-green-600' : delta < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                      {delta > 0 ? <TrendingUp className="w-3 h-3" /> : delta < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                      {Math.abs(delta).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-3 text-xs text-gray-500">
              <span>💰 {child.coinsEarned} earned</span>
              <span>🎁 {child.coinsSpent} spent</span>
              <span>📝 {child.feedbackCount} feedback</span>
            </div>
          </button>
        ))}
      </div>

      {/* Expiring documents */}
      {expiringDocuments.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-[#1A2E4A]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Documents Expiring Soon
            </h2>
          </div>
          <div className="space-y-2">
            {expiringDocuments.map(doc => (
              <div key={doc.documentId} className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#1A2E4A] truncate">{doc.documentName}</p>
                  <p className="text-xs text-gray-400">{doc.category}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                  doc.daysUntilExpiry <= 14 ? 'text-red-600 bg-red-50' : 'text-amber-700 bg-amber-50'
                }`}>
                  {doc.daysUntilExpiry}d
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Health reminders */}
      {healthReminders.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-bold text-[#1A2E4A]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Health Reminders
            </h2>
          </div>
          <div className="space-y-2">
            {healthReminders.map((r, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full flex-shrink-0">
                  {r.reminderType}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#1A2E4A]">{r.memberName} — {r.description}</p>
                  {r.dueDate && (
                    <p className="text-xs text-gray-400">Due {new Date(r.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── RP-04 Child Monthly Summary ────────────────────────────────────────────────

const ChildMonthlyView: React.FC<{ summary: ChildMonthlySummary }> = ({ summary }) => {
  const radarData = [
    { subject: 'Study',       value: summary.pillarScores.at(-1)?.studyScore ?? 0 },
    { subject: 'Discipline',  value: summary.pillarScores.at(-1)?.disciplineScore ?? 0 },
    { subject: 'Cleanliness', value: summary.pillarScores.at(-1)?.cleanlinessScore ?? 0 },
    { subject: 'Screen',      value: summary.pillarScores.at(-1)?.screenControlScore ?? 0 },
    { subject: 'Responsibility', value: summary.pillarScores.at(-1)?.responsibilityScore ?? 0 },
  ];

  const trendData = summary.pillarScores.map(s => ({
    month: MONTH_NAMES[new Date(s.month).getMonth()],
    study: s.studyScore,
    discipline: s.disciplineScore,
    cleanliness: s.cleanlinessScore,
  }));

  return (
    <div className="space-y-5">
      {/* Narrative */}
      <div className="bg-[#1A2E4A] rounded-2xl p-5 text-white">
        <p className="text-xs text-blue-200 mb-1">{summary.childName} — {MONTH_NAMES[summary.month - 1]} {summary.year}</p>
        <p className="text-sm font-medium leading-relaxed text-blue-100">{summary.narrativeSummary}</p>
      </div>

      {/* Attendance + Tasks */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Attendance', rate: summary.attendanceRate, a: summary.attendancePresentCount, b: summary.attendanceSessions, suffix: 'sessions' },
          { label: 'Tasks', rate: summary.taskRate, a: summary.taskApprovedCount, b: summary.taskAssignedCount, suffix: 'assigned' },
        ].map(({ label, rate, a, b, suffix }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className="text-2xl font-bold text-[#1A2E4A]" style={{ fontFamily: 'Space Grotesk, monospace' }}>
              {rate.toFixed(0)}%
            </p>
            <p className="text-xs text-gray-400 mt-1">{a}/{b} {suffix}</p>
            <div className="mt-2 bg-gray-100 rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-[#1A2E4A]" style={{ width: `${rate}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Coins */}
      <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-6">
        <div>
          <p className="text-xs text-gray-400">Earned</p>
          <p className="text-xl font-bold text-[#C8922A]">+{summary.coinsEarned}</p>
        </div>
        <div className="w-px h-10 bg-gray-100" />
        <div>
          <p className="text-xs text-gray-400">Spent</p>
          <p className="text-xl font-bold text-gray-400">-{summary.coinsSpent}</p>
        </div>
        <div className="w-px h-10 bg-gray-100" />
        <div>
          <p className="text-xs text-gray-400">Balance</p>
          <p className="text-xl font-bold text-[#2D6A4F]">{summary.coinsEarned - summary.coinsSpent}</p>
        </div>
      </div>

      {/* Pillar radar */}
      {summary.pillarScores.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-sm font-bold text-[#1A2E4A] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Pillar Scores
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#6b7280' }} />
              <Radar dataKey="value" fill="#1A2E4A" fillOpacity={0.25} stroke="#1A2E4A" strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>

          {/* 3-month trend */}
          {trendData.length > 1 && (
            <>
              <p className="text-xs text-gray-400 mb-2 mt-3">3-month trend</p>
              <ResponsiveContainer width="100%" height={80}>
                <LineChart data={trendData}>
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 10 }} />
                  <Line dataKey="study"      stroke="#1A2E4A" strokeWidth={2} dot={false} />
                  <Line dataKey="discipline" stroke="#C8922A" strokeWidth={2} dot={false} />
                  <Line dataKey="cleanliness" stroke="#2D6A4F" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main screen ────────────────────────────────────────────────────────────────

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

  const title = view === 'child' && childSummary
    ? `${childSummary.childName}'s Report`
    : 'Monthly Report';

  return (
    <div className="min-h-screen bg-[#F8F4EE]">
      <div className="bg-[#1A2E4A] px-5 pt-12 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => view === 'child' ? setView('family') : navigate(-1)}
            className="p-2 rounded-xl bg-white/10"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {title}
            </h1>
          </div>
          <button
            onClick={() => view === 'family' ? loadFamily() : (selectedChildId && loadChild(selectedChildId))}
            className="p-2 rounded-xl bg-white/10"
          >
            <RefreshCw className={`w-4 h-4 text-white ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button className="p-2 rounded-xl bg-white/10" title="Export PDF">
            <Download className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Tab bar — family ↔ child */}
        {view === 'family' && familyReport && familyReport.children.length > 0 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            <button
              onClick={() => setView('family')}
              className="px-3 py-1 rounded-full text-xs font-medium bg-[#C8922A] text-white flex-shrink-0"
            >
              Family
            </button>
            {familyReport.children.map(c => (
              <button
                key={c.childProfileId}
                onClick={() => handleChildSelect(c.childProfileId)}
                className="px-3 py-1 rounded-full text-xs font-medium bg-white/15 text-white flex-shrink-0"
              >
                {c.childName}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 pt-4 pb-24">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <RefreshCw className="w-6 h-6 text-gray-300 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <AlertCircle className="w-8 h-8 text-gray-300" />
            <p className="text-sm text-gray-400">{error}</p>
            <button
              onClick={() => view === 'family' ? loadFamily() : (selectedChildId && loadChild(selectedChildId))}
              className="text-sm text-[#C8922A] font-medium"
            >
              Retry
            </button>
          </div>
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
