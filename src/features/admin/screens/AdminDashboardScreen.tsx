import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  TrendingUp,
  UserPlus,
  ShoppingBag,
  ListTodo,
  ChevronRight,
  Bell,
  Settings,
  Server,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminRepository, AdminDashboardStats } from '../repositories/AdminRepository';
import { AppConfig } from '../../../core/config/appConfig';
import FFCard from '../../../shared/components/FFCard';
import FFBadge from '../../../shared/components/FFBadge';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import FFErrorState from '../../../shared/components/FFErrorState';

const adminModules = [
  { id: 'families',  label: 'Families',      desc: 'Manage all families',        Icon: Users,     path: '/admin/families' },
  { id: 'tasks',     label: 'Templates',     desc: 'Task and routine templates',  Icon: ListTodo,  path: '/admin/task-templates' },
  { id: 'rewards',   label: 'Rewards',       desc: 'Global reward catalog',       Icon: ShoppingBag, path: '/admin/reward-catalog' },
  { id: 'campaigns', label: 'Broadcasts',    desc: 'Push campaigns',              Icon: Bell,      path: '/admin/campaigns' },
  { id: 'config',    label: 'Configuration', desc: 'Platform settings and flags', Icon: Settings,  path: '/admin/config' },
];

const activityLogs = [
  { id: 1, dotColor: 'bg-primary/60',  message: 'Family sync completed for Sharma Family', time: '2 min ago' },
  { id: 2, dotColor: 'bg-accent',      message: 'Latency spike detected — resolved',        time: '8 min ago' },
  { id: 3, dotColor: 'bg-primary/60',  message: 'New family registered: Iyer Family',       time: '21 min ago' },
  { id: 4, dotColor: 'bg-success',     message: 'Admin login verified',                     time: '34 min ago' },
  { id: 5, dotColor: 'bg-black/20',    message: 'Encryption handshake confirmed',           time: '1 hr ago' },
];

const AdminDashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats]       = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await AdminRepository.getDashboardStats();
      setStats(data);
    } catch {
      setError('Could not load dashboard. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (isLoading) {
    return (
      <div className="px-4 py-5 space-y-6 pb-24 page-enter">
        <FFShimmer className="h-28 rounded-ff-lg w-full" />
        <div className="grid grid-cols-2 gap-3">
          <FFShimmer className="h-20 rounded-ff" />
          <FFShimmer className="h-20 rounded-ff" />
          <FFShimmer className="h-20 rounded-ff" />
          <FFShimmer className="h-20 rounded-ff" />
        </div>
        <FFShimmer className="h-10 rounded-ff w-32" />
        <div className="grid grid-cols-2 gap-3">
          <FFShimmer className="h-24 rounded-ff" />
          <FFShimmer className="h-24 rounded-ff" />
          <FFShimmer className="h-24 rounded-ff" />
          <FFShimmer className="h-24 rounded-ff" />
        </div>
        <FFShimmer className="h-48 rounded-ff" />
      </div>
    );
  }

  return (
    <div className="px-4 py-5 space-y-6 pb-24 page-enter">

      {/* Welcome Hero */}
      <div className="rounded-ff-lg bg-gradient-to-br from-[#0F1E30] to-[#1A2E4A] p-5">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="font-body text-white/60 text-xs">Platform overview</p>
            <p className="font-display font-bold text-xl text-white mt-0.5 truncate">Control Center</p>
          </div>
          <FFBadge variant="neutral">v{AppConfig.version}</FFBadge>
        </div>
        <p className="font-body text-white/50 text-xs mt-3">All systems running smoothly</p>
      </div>

      {/* KPI Grid */}
      {error ? (
        <FFErrorState message={error} onRetry={fetchStats} />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <KPICard
            icon={<Users className="w-5 h-5 text-primary" />}
            value={stats?.totalFamilies ?? 0}
            label="Families"
            trend="+5%"
            positive
          />
          <KPICard
            icon={<TrendingUp className="w-5 h-5 text-primary" />}
            value={stats?.activeFamilies ?? 0}
            label="Active"
            trend="+12%"
            positive
          />
          <KPICard
            icon={<UserPlus className="w-5 h-5 text-primary" />}
            value={stats?.newSignupsToday ?? 0}
            label="New Today"
            trend="Today"
            positive
          />
          <KPICard
            icon={<CheckCircle2 className="w-5 h-5 text-success" />}
            value="99.9%"
            label="Uptime"
            trend="Healthy"
            positive
          />
        </div>
      )}

      {/* Platform Modules */}
      <div className="space-y-3">
        <FFSectionHeader icon={<Server />} title="Platform" />
        <div className="grid grid-cols-2 gap-3">
          {adminModules.map(({ id, label, desc, Icon, path }) => (
            <FFCard
              key={id}
              hoverable
              onClick={() => navigate(path)}
              className="p-4"
            >
              <div className="w-10 h-10 rounded-ff-sm bg-accent/10 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-accent" />
              </div>
              <p className="font-display font-semibold text-sm text-primary truncate">{label}</p>
              <div className="flex items-center gap-1 mt-1">
                <p className="font-body text-xs text-gray-400 flex-1 min-w-0 truncate">{desc}</p>
                <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
              </div>
            </FFCard>
          ))}
        </div>
      </div>

      {/* Activity Log */}
      <div className="space-y-3">
        <FFSectionHeader
          icon={<Activity />}
          title="Activity Log"
          rightAction={
            <button className="font-body text-xs text-accent font-semibold py-1">
              Export
            </button>
          }
        />
        <FFCard className="p-4">
          {activityLogs.map((log, i) => (
            <div
              key={log.id}
              className={`flex items-start gap-3 py-3 ${
                i < activityLogs.length - 1 ? 'border-b border-black/5' : ''
              }`}
            >
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${log.dotColor}`} />
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm text-primary truncate">{log.message}</p>
                <p className="font-body text-xs text-gray-400 mt-0.5">{log.time}</p>
              </div>
            </div>
          ))}
          <button className="w-full mt-3 py-2.5 font-body font-semibold text-sm text-accent text-center hover:opacity-80 transition-opacity">
            Load More
          </button>
        </FFCard>
      </div>

    </div>
  );
};

interface KPICardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  trend: string;
  positive: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ icon, value, label, trend, positive }) => (
  <FFCard className="p-4">
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 rounded-ff-sm bg-primary/10 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <FFBadge variant={positive ? 'success' : 'alert'}>{trend}</FFBadge>
    </div>
    <p className="font-numbers font-medium text-2xl text-primary tabular-nums">{value}</p>
    <p className="font-body text-xs text-gray-400 mt-0.5 uppercase tracking-wider">{label}</p>
  </FFCard>
);

export default AdminDashboardScreen;
