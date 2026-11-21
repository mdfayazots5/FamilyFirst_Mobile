import React, { useMemo } from 'react';
import { TrendingUp, Users, BarChart2, Clock } from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import FFCard from '../../../shared/components/FFCard';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFShimmer from '../../../shared/components/FFShimmer';
import { AdminAnalyticsOverview, AdminRepository } from '../repositories/AdminRepository';
import { useApiResource } from '../../../core/hooks/useApiResource';

// Platform analytics (R6). GET /api/admin/analytics/overview returns all-time totals only, so the screen shows
// exactly those. Removed in R6: a static "engagement heatmap", an "activity trend" derived as 25/50/75% of a total,
// a 7d/30d/90d toggle that changed nothing, and an Export button with no handler.
// [VERIFY — L1 spec admin analytics] time-series / date-range endpoints are needed before trend charts return.

const AnalyticsScreen: React.FC = () => {
  const resource = useApiResource<AdminAnalyticsOverview>(
    () => AdminRepository.getAnalyticsOverview(),
    [],
    'Could not load analytics. Please try again.',
  );
  const analytics = resource.data;

  const kpis = useMemo(() => [
    { label: 'Total Users', value: analytics?.totalUsers, icon: <Users className="w-5 h-5 text-primary" /> },
    { label: 'Children', value: analytics?.totalChildren, icon: <TrendingUp className="w-5 h-5 text-accent" /> },
    { label: 'Teachers', value: analytics?.totalTeachers, icon: <BarChart2 className="w-5 h-5 text-success" /> },
    { label: 'Tasks', value: analytics?.totalTasks, icon: <Clock className="w-5 h-5 text-amber-500" /> },
  ], [analytics]);

  const featureUsage = useMemo(() => [
    { name: 'Tasks', usage: analytics?.totalTasks ?? 0, color: '#C8922A' },
    { name: 'Completions', usage: analytics?.totalTaskCompletions ?? 0, color: '#2D6A4F' },
    { name: 'Feedback', usage: analytics?.totalFeedbackEntries ?? 0, color: '#C1121F' },
    { name: 'Notifications', usage: analytics?.totalNotifications ?? 0, color: '#1A2E4A' },
  ], [analytics]);

  if (resource.error) {
    return <FFErrorState message={resource.error} onRetry={resource.reload} />;
  }

  return (
    <div className="px-4 py-5 space-y-6 pb-24 page-enter">
      <div className="flex items-center justify-between">
        <p className="font-display font-semibold text-sm text-primary">Platform Analytics</p>
        <p className="font-body text-xs text-gray-400">All-time totals</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3">
        {kpis.map(kpi => (
          resource.isLoading ? (
            <FFShimmer key={kpi.label} className="h-28 rounded-ff" />
          ) : (
            <FFCard key={kpi.label} className="p-4">
              <div className="w-10 h-10 rounded-ff-sm bg-primary/10 flex items-center justify-center mb-3">
                {kpi.icon}
              </div>
              <p className="font-numbers font-medium text-2xl text-primary tabular-nums">
                {(kpi.value ?? 0).toLocaleString('en-IN')}
              </p>
              <p className="font-body text-xs text-gray-400 mt-0.5 uppercase tracking-wider">{kpi.label}</p>
            </FFCard>
          )
        ))}
      </div>

      {/* Feature Usage */}
      <div className="space-y-3">
        <FFSectionHeader icon={<BarChart2 className="w-[18px] h-[18px]" />} title="Feature Usage" />
        {resource.isLoading ? (
          <FFShimmer className="h-52 rounded-ff" />
        ) : (
          <FFCard className="p-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureUsage} layout="vertical">
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#1A2E4A', fontFamily: 'Nunito' }}
                  width={84}
                />
                <Tooltip
                  cursor={{ fill: '#f8f4ee', radius: 8 }}
                  contentStyle={{
                    borderRadius: '12px', border: 'none',
                    boxShadow: '0 2px 12px rgba(26,46,74,0.08)',
                    fontSize: '12px', fontFamily: 'Nunito',
                  }}
                />
                <Bar dataKey="usage" radius={[0, 8, 8, 0]} barSize={20}>
                  {featureUsage.map(entry => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </FFCard>
        )}
      </div>
    </div>
  );
};

export default AnalyticsScreen;
