import React, { useState, useEffect } from 'react';
import {
  Filter,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useReports } from '../providers/ReportsProvider';
import { AttendanceDay } from '../repositories/ReportsRepository';
import AttendanceHeatmapWidget from '../widgets/AttendanceHeatmapWidget';
import FFCard from '../../../shared/components/FFCard';
import FFBadge from '../../../shared/components/FFBadge';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';

const AttendanceSummaryScreen: React.FC = () => {
  const navigate = useNavigate();
  const { fetchAttendanceSummary } = useReports();
  const [attendanceData, setAttendanceData] = useState<AttendanceDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState('Arjun');

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      const today = new Date();
      const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
      const data = await fetchAttendanceSummary('c1', thirtyDaysAgo.toISOString(), new Date().toISOString());
      setAttendanceData(data);
      setIsLoading(false);
    };
    fetch();
  }, [fetchAttendanceSummary]);

  const stats = {
    avgCompletion: Math.round(
      attendanceData.reduce((acc, curr) => acc + curr.completionRate, 0) / (attendanceData.length || 1) * 100
    ),
    bestStreak: 12,
    missedDays: 2,
  };

  const children = ['Arjun', 'Zara'];

  return (
    <div className="min-h-screen bg-bg-cream pb-24">
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

      {/* Child selector — inside header extension */}
      <div className="bg-primary px-4 pb-3">
        <div className="flex gap-2 p-1.5 bg-white/10 rounded-ff">
          {children.map(child => (
            <button
              key={child}
              onClick={() => setSelectedChild(child)}
              className={`flex-1 py-2.5 rounded-xl font-body text-sm font-medium transition-colors ${
                selectedChild === child
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-white/70'
              }`}
            >
              {child}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Heatmap */}
        <div>
          <FFSectionHeader title="30-Day Activity" />
          <FFCard className="p-4 mt-2">
            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-4">
              {[
                { color: 'bg-success', label: 'Present' },
                { color: 'bg-accent', label: 'Partial' },
                { color: 'bg-alert', label: 'Absent' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <span className="font-body text-xs text-gray-400">{label}</span>
                </div>
              ))}
            </div>
            {isLoading ? (
              <FFShimmer className="h-32 rounded-xl" />
            ) : (
              <AttendanceHeatmapWidget data={attendanceData} />
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
              <p className="font-numbers text-xl font-bold text-primary">{stats.avgCompletion}%</p>
              <p className="font-body text-xs text-gray-400 mt-0.5">Avg. Rate</p>
              <FFBadge variant="success" size="sm" className="mt-1">+4.2%</FFBadge>
            </FFCard>

            <FFCard className="p-4 flex flex-col items-center text-center">
              <div className="p-2 bg-primary/5 rounded-xl mb-2">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <p className="font-numbers text-xl font-bold text-primary">{stats.bestStreak}</p>
              <p className="font-body text-xs text-gray-400 mt-0.5">Best Streak</p>
              <p className="font-body text-xs text-gray-300 mt-1">days</p>
            </FFCard>

            <FFCard className="p-4 flex flex-col items-center text-center">
              <div className="p-2 bg-alert/10 rounded-xl mb-2">
                <CheckCircle2 className="w-5 h-5 text-alert" />
              </div>
              <p className="font-numbers text-xl font-bold text-primary">{stats.missedDays}</p>
              <p className="font-body text-xs text-gray-400 mt-0.5">Missed</p>
              <p className="font-body text-xs text-gray-300 mt-1">days</p>
            </FFCard>
          </div>
        </div>

        {/* Insight card */}
        <FFCard className="bg-primary text-white p-5">
          <p className="font-body text-xs text-white/60 mb-2">Weekly Pattern</p>
          <p className="font-body text-sm text-white/90 leading-relaxed">
            <span className="font-semibold text-accent">{selectedChild}</span> shows the highest
            attendance mid-week (Tuesday–Wednesday). Attendance tends to dip on Mondays — a reminder
            on Sunday evenings may help.
          </p>
        </FFCard>
      </div>
    </div>
  );
};

export default AttendanceSummaryScreen;
