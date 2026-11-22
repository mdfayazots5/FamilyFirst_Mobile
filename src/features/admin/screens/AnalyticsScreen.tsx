import { Baby, BarChart2, ClipboardList, GraduationCap, Users } from 'lucide-react';
import FFCard from '../../../shared/components/FFCard';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFShimmer from '../../../shared/components/FFShimmer';
import { AdminRepository } from '../repositories/AdminRepository';
import { useApiResource } from '../../../core/hooks/useApiResource';

// Platform analytics (R6). GET /api/admin/analytics/overview returns all-time totals only, so the screen shows
// exactly those. Removed in R6: a static "engagement heatmap", an "activity trend" derived as 25/50/75% of a total,
// a 7d/30d/90d toggle that changed nothing, and an Export button with no handler.
// [VERIFY — L1 spec admin analytics] time-series / date-range endpoints are needed before trend charts return.

const AnalyticsScreen = () => {
  const resource = useApiResource(
    AdminRepository.getAnalyticsOverview,
    [],
    'Could not load analytics. Please try again.',
  );
  const analytics = resource.data;

  const kpis = [
    { label: 'Total users', value: analytics?.totalUsers, icon: Users },
    { label: 'Children', value: analytics?.totalChildren, icon: Baby },
    { label: 'Teachers', value: analytics?.totalTeachers, icon: GraduationCap },
    { label: 'Tasks', value: analytics?.totalTasks, icon: ClipboardList },
  ];

  const featureUsage = [
    { name: 'Tasks', count: analytics?.totalTasks ?? 0 },
    { name: 'Task completions', count: analytics?.totalTaskCompletions ?? 0 },
    { name: 'Feedback entries', count: analytics?.totalFeedbackEntries ?? 0 },
    { name: 'Notifications', count: analytics?.totalNotifications ?? 0 },
  ];
  const maxCount = Math.max(...featureUsage.map(({ count }) => count));

  if (resource.error) {
    return <FFErrorState message={resource.error} onRetry={resource.reload} />;
  }

  return (
    <div className="px-4 py-5 space-y-6 pb-24 page-enter">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h1 className="font-display text-xl font-bold text-primary">Platform Analytics</h1>
        <p className="font-body text-sm text-slate-600">All-time totals</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon }) => (
          resource.isLoading ? (
            <FFShimmer key={label} className="h-28 rounded-ff" />
          ) : (
            <FFCard key={label} className="p-4">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-ff-sm bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="font-numbers font-medium text-2xl text-primary tabular-nums">
                {(value ?? 0).toLocaleString('en-IN')}
              </p>
              <p className="mt-0.5 font-body text-sm text-slate-600">{label}</p>
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
          <FFCard className="px-4 sm:px-6">
            {maxCount === 0 && (
              <p className="border-b border-black/5 py-4 text-sm text-slate-600">
                No feature activity recorded yet.
              </p>
            )}
            <dl aria-label="Feature usage totals" className="divide-y divide-black/5">
              {featureUsage.map(({ name, count }) => (
                <div key={name} className={`relative flex items-center justify-between gap-4 pt-3 ${maxCount > 0 ? 'pb-8' : 'pb-3'}`}>
                  <dt className="text-sm font-semibold text-primary">{name}</dt>
                  <dd className="text-right font-numbers text-base font-semibold tabular-nums text-primary">
                    {count.toLocaleString('en-IN')}
                    {maxCount > 0 && (
                      <span aria-hidden="true" className="absolute inset-x-0 bottom-3 h-2 overflow-hidden rounded-full bg-primary/10">
                        <span className="block h-full rounded-full bg-primary" style={{ width: `${(count / maxCount) * 100}%` }} />
                      </span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </FFCard>
        )}
      </div>
    </div>
  );
};

export default AnalyticsScreen;
