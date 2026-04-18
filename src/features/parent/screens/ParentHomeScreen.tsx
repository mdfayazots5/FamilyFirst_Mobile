import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RefreshCw, 
  Flame, 
  CheckCircle2, 
  Plus, 
  ChevronRight,
  TrendingUp,
  ShoppingBag,
  Target,
  Settings,
  FileText,
  History,
  Zap,
  Activity,
  ShieldCheck,
  Globe,
  Bell,
  Cpu,
  Layers,
  ArrowRight,
  Fingerprint,
  Radar,
  Network,
  Command
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { DashboardRepository, DashboardData } from '../repositories/DashboardRepository';
import ChildSummaryCard from '../widgets/ChildSummaryCard';
import AlertStrip from '../widgets/AlertStrip';
import EventsPreview from '../widgets/EventsPreview';
import FFButton from '../../../shared/components/FFButton';
import FFBadge from '../../../shared/components/FFBadge';
import FFCard from '../../../shared/components/FFCard';
import FFShimmer, { FFListSkeleton } from '../../../shared/components/FFShimmer';
import FFErrorState from '../../../shared/components/FFErrorState';
import { CacheService } from '../../../core/cache/CacheService';
import { withRetry } from '../../../core/api/retryUtility';

import { useLocalNotifications } from '../../../core/notifications/LocalNotificationService';
import { NotificationType } from '../../../core/notifications/NotificationPayloadHandler';

const ParentHomeScreen: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useLocalNotifications();

  const [data, setData] = useState<DashboardData | null>(CacheService.get<DashboardData>('parent_dashboard'));
  const [isLoading, setIsLoading] = useState(!data);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboard = useCallback(async (showLoading = true) => {
    if (!user?.familyId) return;
    if (showLoading) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const dashboardData = await withRetry(() => DashboardRepository.getDashboard(user.familyId!));
      setData(dashboardData);
      CacheService.set('parent_dashboard', dashboardData, 30);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch dashboard', err);
      setError('Failed to load dashboard.');
      const cached = CacheService.get<DashboardData>('parent_dashboard');
      if (cached) setData(cached);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.familyId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '晨 MORNING';
    if (hour < 17) return '午 AFTERNOON';
    return '晩 EVENING';
  };

  const simulateNotification = (type: NotificationType, priority: 'normal' | 'urgent' | 'birthday' = 'normal') => {
    const titles: Record<string, string> = {
      [NotificationType.TaskVerification]: 'Task Review Required',
      [NotificationType.RewardRedemption]: 'Reward Approval Needed',
      [NotificationType.SOS]: 'EMERGENCY SOS',
    };

    const bodies: Record<string, string> = {
      [NotificationType.TaskVerification]: 'Arjun has submitted "Clean Room" for review.',
      [NotificationType.RewardRedemption]: 'Zara wants to redeem "Extra Screen Time".',
      [NotificationType.SOS]: 'Arjun has triggered an SOS alert!',
    };

    showNotification({
      title: titles[type] || 'New Notification',
      body: bodies[type] || 'You have a new update.',
      priority,
      payload: { type, childId: 'c1', referenceId: 'r1', memberName: 'Arjun' }
    });
  };

  if (isLoading && !data) {
    return (
      <div className="p-12 space-y-16 animate-pulse bg-[#FDFCFB] min-h-screen">
        <div className="flex items-center gap-8">
           <div className="w-20 h-20 bg-gray-100 rounded-[32px]" />
           <div className="space-y-3">
              <div className="h-6 bg-gray-100 rounded-lg w-32" />
              <div className="h-12 bg-gray-100 rounded-2xl w-64" />
           </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="h-64 bg-gray-100 rounded-[48px]" />
          <div className="h-64 bg-gray-100 rounded-[48px]" />
          <div className="h-64 bg-gray-100 rounded-[48px]" />
        </div>
        <div className="h-[600px] bg-gray-100 rounded-[56px]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-48">
      {/* Precision Command Header */}
      <header className="bg-white/90 backdrop-blur-2xl p-8 lg:p-14 border-b border-black/[0.03] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="flex items-center gap-10">
            <div className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-primary/30 relative group overflow-hidden">
              <div className="absolute inset-x-0 bottom-0 h-1 bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-110 group-hover:scale-150 transition-transform" />
              <ShieldCheck size={40} className="relative z-10 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <FFBadge variant="accent" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none">{getGreeting()}</FFBadge>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none">CORE_OS_v3.4.0</p>
                </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none">
                {user?.name.split(' ')[0]} <span className="text-accent underline decoration-accent/20 decoration-8 underline-offset-8">STATION</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="hidden lg:flex flex-col items-end mr-4">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] mb-3 italic">UPTIME_PULSE_ARRAY</p>
                <div className="flex gap-1.5">
                   {[1,2,3,4,5,6,7,8].map(i => (
                     <motion.div 
                       key={i} 
                       initial={{ height: 4 }}
                       animate={{ height: Math.random() * 12 + 4 }}
                       transition={{ repeat: Infinity, repeatType: "mirror", duration: 0.5 + Math.random() }}
                       className={`w-1.5 rounded-full ${i < 7 ? 'bg-success' : 'bg-gray-100'}`} 
                     />
                   ))}
                </div>
             </div>
            <button 
              onClick={() => fetchDashboard(false)}
              disabled={isRefreshing}
              className="w-16 h-16 bg-white text-primary rounded-[24px] border border-black/5 hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center group active:scale-90"
            >
              <RefreshCw size={28} className={isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 lg:p-14 space-y-24">
        {/* Strategic Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <FFCard className="p-12 bg-primary text-white border-none shadow-2xl shadow-primary/20 flex flex-col justify-between group overflow-hidden relative rounded-[56px] min-h-[320px]">
            <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none -rotate-12 translate-x-12 translate-y-[-20%] group-hover:rotate-45 transition-transform duration-1000">
              <Zap size={280} fill="white" />
            </div>
            <div className="flex items-center justify-between relative z-10">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-accent shadow-inner backdrop-blur-xl border border-white/5">
                <Flame size={32} className="group-hover:scale-120 transition-transform" fill="currentColor" />
              </div>
              <FFBadge variant="accent" size="sm" className="font-black border-none bg-accent/20 px-4 py-1.5 uppercase italic tracking-widest">HOT_STREAK</FFBadge>
            </div>
            <div className="relative z-10">
              <motion.h4 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-8xl font-display font-black italic tracking-tighter mb-4 leading-none"
              >
                {data?.streak || 0}
              </motion.h4>
              <div className="flex items-center gap-3">
                 <Cpu size={14} className="text-white/30" />
                 <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.5em] italic leading-none mt-1">OPERATIONAL_STREAK_STABLE</p>
              </div>
            </div>
          </FFCard>

          <FFCard 
            hoverable
            onClick={() => navigate('/parent/verification')}
            className="p-12 bg-white border-none shadow-2xl shadow-black/[0.01] flex flex-col justify-between rounded-[56px] group relative overflow-hidden min-h-[320px]"
          >
            <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none -rotate-12 translate-x-8 translate-y-[-20%]">
               <Fingerprint size={280} />
            </div>
            <div className="flex items-center justify-between relative z-10">
              <div className="w-16 h-16 bg-success/5 rounded-2xl text-success shadow-inner border border-success/10 flex items-center justify-center">
                <CheckCircle2 size={32} />
              </div>
              <div className="flex flex-col items-end">
                 <FFBadge variant="success" size="sm" className="font-black uppercase italic tracking-widest px-4 py-1.5">PRIME_STATUS</FFBadge>
                 <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-2">{data?.pendingCount || 0} ITEMS_WAITING</span>
              </div>
            </div>
            <div className="relative z-10">
              <h4 className="text-8xl font-display font-black italic tracking-tighter text-primary mb-4 leading-none">{data?.pendingCount || 0}</h4>
              <div className="flex items-center gap-3">
                 <Activity size={14} className="text-gray-300" />
                 <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.5em] italic leading-none mt-1">VERIFICATION_QUEUE_ACTIVE</p>
              </div>
            </div>
          </FFCard>

          <FFCard 
            hoverable
            onClick={() => navigate('/parent/rewards')}
            className="p-12 bg-white border-none shadow-2xl shadow-black/[0.01] flex flex-col justify-between rounded-[56px] group relative overflow-hidden min-h-[320px]"
          >
             <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none rotate-12 translate-x-12 translate-y-[-20%]">
               <ShoppingBag size={280} />
            </div>
            <div className="flex items-center justify-between relative z-10">
              <div className="w-16 h-16 bg-accent/5 rounded-2xl text-accent shadow-inner border border-accent/10 flex items-center justify-center">
                <ShoppingBag size={32} />
              </div>
              <div className="flex flex-col items-end">
                <FFBadge variant="accent" size="sm" className="font-black uppercase italic tracking-widest px-4 py-1.5">BOUNTY_HUB</FFBadge>
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-2">MARKETPLACE_ONLINE</span>
              </div>
            </div>
            <div className="relative z-10">
              <h4 className="text-8xl font-display font-black italic tracking-tighter text-primary mb-4 leading-none">SHOP</h4>
              <div className="flex items-center gap-3">
                 <Globe size={14} className="text-gray-300" />
                 <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.4em] italic leading-none mt-1">GLOBAL_REWARDS_REPOSITORY</p>
              </div>
            </div>
          </FFCard>
        </div>

        {/* Command Operations: Strategic Directives */}
        <section className="space-y-12">
          <div className="flex items-center gap-8">
            <div className="w-14 h-14 bg-primary/5 rounded-[20px] flex items-center justify-center text-primary">
               <Command size={28} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-display font-black uppercase tracking-widest text-primary italic">COMMAND_OPERATIONS_v2</h3>
            <div className="h-px flex-1 bg-primary/10" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Target size={28} />, title: 'Goal Protocol', label: 'STRATEGIC_TARGETS', path: '/parent/goals', color: 'bg-primary' },
              { icon: <History size={28} />, title: 'Ledger Audit', label: 'FISCAL_TRANSACTIONS', path: '/parent/ledger', color: 'bg-accent' },
              { icon: <Settings size={28} />, title: 'Control Panel', label: 'SYSTEM_ADMIN', path: '/parent/admin', color: 'bg-gray-800' },
              { icon: <FileText size={28} />, title: 'Premium Digest', label: 'ANALYTICS_REPORTS', path: '/reports/weekly', color: 'bg-success' }
            ].map((action, i) => (
              <motion.button
                key={i}
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => navigate(action.path)}
                className="p-10 bg-white rounded-[48px] border border-black/[0.03] shadow-2xl shadow-black/[0.01] text-left group transition-all relative overflow-hidden"
              >
                <div className="w-20 h-20 bg-gray-50 rounded-[28px] flex items-center justify-center text-gray-300 mb-10 group-hover:bg-primary group-hover:text-white transition-all shadow-inner relative z-10 overflow-hidden group/icon">
                   <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                   <div className="relative z-10 group-hover:scale-110 transition-transform">
                      {action.icon}
                   </div>
                </div>
                <div className="relative z-10">
                   <h4 className="font-black text-primary text-2xl uppercase italic tracking-tighter mb-2 leading-none group-hover:text-primary transition-colors">{action.title}</h4>
                   <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.4em] italic mb-4">{action.label}</p>
                   <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest italic">Initialize_Protocol</span>
                      <ArrowRight size={14} className="text-primary" />
                   </div>
                </div>
                <div className="absolute -right-6 -bottom-6 text-primary/[0.02] rotate-12 group-hover:rotate-45 transition-transform duration-1000">
                   {action.icon}
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Global Family State Registry */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
          {/* Unit Personnel Status */}
          <section className="space-y-12">
            <div className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                 <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary italic">
                    <Layers size={24} strokeWidth={2.5} />
                 </div>
                 <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic">UNIT_PERSONNEL_STATUS</h3>
              </div>
              <button 
                onClick={() => navigate('/parent/admin/members')}
                className="h-14 px-8 bg-white border border-black/[0.03] rounded-2xl text-[11px] font-black text-accent uppercase tracking-[0.3em] hover:translate-y-[-2px] transition-all flex items-center gap-3 italic shadow-sm shadow-black/[0.01]"
              >
                REGISTRY <ChevronRight size={18} />
              </button>
            </div>
            
            <div className="grid gap-8">
              {data?.children.map((child) => (
                <ChildSummaryCard 
                  key={child.id} 
                  child={child} 
                  onClick={() => navigate(`/parent/children/${child.id}`)}
                />
              ))}
            </div>
          </section>

          {/* Activity & Synergy Array */}
          <div className="space-y-16">
            <EventsPreview events={data?.upcomingEvents || []} />
            
            <FFCard className="p-16 bg-white border-none shadow-2xl shadow-black/[0.01] rounded-[64px] overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none rotate-12 group-hover:rotate-90 transition-transform duration-1000">
                <Radar size={320} strokeWidth={1} />
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8">
                <div>
                  <h3 className="text-3xl font-display font-black text-primary uppercase italic tracking-tighter leading-none mb-3">Synergy Index</h3>
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                     <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.4em] italic">REAL_TIME_ENGAGEMENT_ARRAY</p>
                  </div>
                </div>
                <div className="w-20 h-20 bg-accent/10 rounded-[28px] flex items-center justify-center text-accent shadow-inner border border-accent/10">
                  <Activity size={40} />
                </div>
              </div>
              <div className="flex flex-wrap items-baseline gap-6 mb-12">
                <span className="text-[10rem] md:text-[12rem] font-display font-black italic tracking-tighter text-primary leading-none">{data?.familyScore || 0}</span>
                <div className="flex flex-col gap-3">
                   <FFBadge variant="success" size="sm" className="font-black px-4 py-2 text-[12px] uppercase italic tracking-[0.2em] rounded-xl">+12.4% ARC</FFBadge>
                   <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">WEEKLY_DELTA_OK</p>
                </div>
              </div>
              <div className="relative z-10 bg-primary p-10 rounded-[40px] border border-white/10 shadow-3xl shadow-primary/30">
                 <p className="text-2xl font-display font-medium text-white italic leading-tight">
                  "Family engagement vectors are currently <span className="text-accent underline decoration-accent/30 decoration-4 underline-offset-4">15% ABOVE</span> the rolling average. System suggests continued positive reinforcement protocols."
                 </p>
              </div>
            </FFCard>
          </div>
        </div>

        {/* System Simulation Protocols: Stress Tests */}
        <section className="space-y-12 pt-24 border-t border-black/[0.03]">
          <div className="flex items-center gap-4">
             <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
             <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-primary/30 italic">SYSTEM_STRESS_SIMULATION_CABINET</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'PROXY_TASK_SUBMIT', type: NotificationType.TaskVerification, icon: <Network size={16} /> },
              { label: 'SIM_SHOP_REQUEST', type: NotificationType.RewardRedemption, icon: <ShoppingBag size={16} /> },
              { label: 'ELDER_SIGNAL_LINK', type: NotificationType.Appreciation, icon: <RefreshCw size={16} /> },
              { label: 'CRITICAL_SOS_DEBUG', type: NotificationType.SOS, urgent: true, icon: <Bell size={16} /> }
            ].map((trigger, i) => (
              <button 
                key={i}
                onClick={() => simulateNotification(trigger.type, trigger.urgent ? 'urgent' : 'normal')}
                className={`
                  p-8 rounded-[32px] border transition-all text-[11px] font-black uppercase tracking-widest flex flex-col gap-4 group active:scale-95 text-center items-center italic
                  ${trigger.urgent 
                    ? 'bg-alert/5 text-alert border-alert/20 hover:bg-alert hover:text-white shadow-2xl shadow-alert/10' 
                    : 'bg-white text-gray-400 border-black/5 hover:border-primary hover:text-primary shadow-sm hover:shadow-2xl hover:shadow-primary/5'}
                `}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${trigger.urgent ? 'bg-alert/10 text-alert group-hover:bg-white/20 group-hover:text-white' : 'bg-gray-50 text-gray-300 group-hover:bg-primary/5 group-hover:text-primary shadow-inner'}`}>
                   {trigger.icon}
                </div>
                {trigger.label}
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* Floating Operational Cable */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-12 right-12 w-24 h-24 bg-accent text-primary rounded-[36px] shadow-3xl shadow-accent/40 flex items-center justify-center z-50 border-4 border-white transition-all overflow-hidden group"
        onClick={() => navigate('/parent/admin/tasks/new')}
      >
        <div className="absolute inset-x-0 bottom-0 h-2 bg-primary/20 animate-pulse" />
        <Plus size={40} strokeWidth={3} className="relative z-10" />
      </motion.button>
       
       <footer className="text-center space-y-8 py-32 px-8 border-t border-black/[0.03]">
         <div className="flex items-center justify-center gap-8 text-primary/10">
            <div className="h-px w-24 bg-current" />
            <ShieldCheck size={32} />
            <div className="h-px w-24 bg-current" />
         </div>
         <div className="space-y-4">
            <p className="text-[12px] text-gray-400 font-black uppercase tracking-[0.8em] italic leading-relaxed">STATION_ENGINE // Parent Command Oversight Array v3.4.0</p>
            <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.4em] italic opacity-40">All unit signals are synchronized via end-to-end encrypted protocol</p>
         </div>
      </footer>
    </div>
  );
};

export default ParentHomeScreen;
