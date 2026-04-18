import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  UserPlus, 
  AlertCircle,
  LayoutDashboard,
  Settings,
  Bell,
  ShoppingBag,
  ListTodo,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Server,
  Zap,
  Globe,
  Radio,
  Cpu,
  Layers,
  Terminal,
  Activity,
  Command,
  Monitor,
  Workflow,
  Eye,
  Signal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminRepository, AdminDashboardStats } from '../repositories/AdminRepository';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFBadge from '../../../shared/components/FFBadge';
import { AppConfig } from '../../../core/config/appConfig';

const AdminDashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await AdminRepository.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch admin stats', error);
      } finally {
        setTimeout(() => setIsLoading(false), 800);
      }
    };
    fetchStats();
  }, []);

  const adminModules = [
    { id: 'families', label: 'Families', desc: 'Registry & Personnel', icon: <Users size={28} />, path: '/admin/families', color: 'text-primary' },
    ...(AppConfig.features.subscriptionEnabled ? [{ id: 'plans', label: 'Revenue Tiers', desc: 'Fiscal Logic', icon: <CreditCard size={28} />, path: '/admin/plans', color: 'text-accent' }] : []),
    { id: 'tasks', label: 'Templates', desc: 'Global Directives', icon: <ListTodo size={28} />, path: '/admin/task-templates', color: 'text-success' },
    { id: 'rewards', label: 'Asset Library', desc: 'Reward Logistics', icon: <ShoppingBag size={28} />, path: '/admin/reward-catalog', color: 'text-amber-500' },
    { id: 'campaigns', label: 'Broadcasts', desc: 'Signal Campaigns', icon: <Bell size={28} />, path: '/admin/campaigns', color: 'text-rose-500' },
    { id: 'config', label: 'Core Config', desc: 'System Variables', icon: <Settings size={28} />, path: '/admin/config', color: 'text-gray-500' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#FDFCFB]">
        <div className="text-center space-y-8">
           <div className="w-32 h-32 bg-primary px-4 py-4 rounded-[40px] flex items-center justify-center text-white shadow-2xl shadow-primary/30 relative group overflow-hidden animate-pulse">
              <ShieldCheck size={64} />
           </div>
           <div className="space-y-3">
              <p className="text-[12px] font-black text-primary uppercase tracking-[0.5em] italic">BOOTING_COMMAND_STATION...</p>
              <div className="flex items-center justify-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary/20 animate-bounce [animation-delay:-0.3s]" />
                 <div className="w-1.5 h-1.5 rounded-full bg-primary/20 animate-bounce [animation-delay:-0.15s]" />
                 <div className="w-1.5 h-1.5 rounded-full bg-primary/20 animate-bounce" />
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-48">
      {/* Strategic Command Header */}
      <header className="bg-white/95 backdrop-blur-2xl p-8 lg:p-14 border-b border-black/[0.03] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="flex items-center gap-10">
            <div className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-primary/30 relative group overflow-hidden">
               <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
               <LayoutDashboard size={40} className="relative z-10" />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <FFBadge variant="primary" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none">v4.4.2-STABLE</FFBadge>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none whitespace-nowrap">STATION_ONLINE_ENCRYPTED</p>
                </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none">
                Tactical Station
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-10 px-8 border-r border-black/[0.03]">
               <div className="text-right">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none mb-2">LATENCY</p>
                  <p className="text-xl font-display font-black text-success tabular-nums italic">14ms</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none mb-2">LOAD_FACTOR</p>
                  <p className="text-xl font-display font-black text-accent tabular-nums italic">0.02</p>
               </div>
            </div>
            <FFButton 
               onClick={() => navigate('/admin/analytics')}
               size="lg"
               className="h-20 px-10 rounded-[28px] bg-primary group/intel italic shadow-2xl shadow-primary/30"
            >
               <Zap size={24} className="group-hover:scale-110 transition-transform text-accent" />
               <span className="ml-4 uppercase tracking-[0.3em] font-black italic">GLOBAL_INTEL</span>
            </FFButton>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 lg:p-14 pt-16 space-y-32">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <KPIWidget 
            label="FAMILIES_REGISTERED" 
            value={stats?.totalFamilies || 0} 
            icon={<Users size={20} />} 
            trend="+5%" 
            isPositive={true}
          />
          <KPIWidget 
            label="ACTIVE_PULSE_UNITS" 
            value={stats?.activeFamilies || 0} 
            icon={<TrendingUp size={20} />} 
            trend="+12%" 
            isPositive={true}
          />
          {AppConfig.features.subscriptionEnabled && (
            <KPIWidget 
              label="GROSS_FISCAL_REVENUE" 
              value={`₹${stats?.monthlyRevenue.toLocaleString()}`} 
              icon={<CreditCard size={20} />} 
              trend="+8%" 
              isPositive={true}
            />
          )}
          <KPIWidget 
            label="CORE_SERVER_UPTIME" 
            value="99.9%" 
            icon={<Server size={20} />} 
            trend="STABLE" 
            isPositive={true}
          />
        </div>

        {/* Infrastructure Nodes */}
        <section className="space-y-16">
          <div className="flex items-center gap-8 px-4">
            <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
               <Workflow size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic">CORE_INFRASTRUCTURE_NODES</h3>
            <div className="h-px flex-1 bg-primary/10" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {adminModules.map((module, i) => (
              <motion.button
                key={module.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => navigate(module.path)}
                className="bg-white p-12 rounded-[56px] border-none shadow-3xl shadow-black/[0.01] text-left flex flex-col gap-10 group hover:shadow-3xl hover:shadow-black/[0.04] transition-all relative overflow-hidden h-full"
              >
                <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-125 transition-transform duration-1000">
                  <Layers size={140} strokeWidth={1} />
                </div>
                
                <div className={`w-20 h-20 bg-gray-50 rounded-[28px] flex items-center justify-center ${module.color} shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                  {module.icon}
                </div>
                
                <div className="space-y-3 relative z-10 flex-1">
                  <h3 className="text-3xl font-display font-black text-primary uppercase italic tracking-tighter leading-none">{module.label}</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic leading-none opacity-60">{module.desc}</p>
                </div>

                <div className="flex items-center gap-3 text-[10px] font-black text-primary/30 uppercase tracking-[0.4em] italic group-hover:text-primary transition-colors">
                  SECURE_GATE <ChevronRight size={18} className="translate-y-[1px]" />
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* System Telemetry Stream */}
        <section className="space-y-16">
          <div className="flex items-center justify-between px-4">
             <div className="flex items-center gap-8">
                <div className="w-12 h-12 bg-black rounded-[18px] flex items-center justify-center text-accent">
                   <Terminal size={24} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic">REAL_TIME_SIGNAL_TELEMETRY</h3>
             </div>
             <button className="text-[10px] font-black text-primary uppercase tracking-[0.4em] italic hover:text-accent transition-colors flex items-center gap-4">
                <div className="w-8 h-px bg-current opacity-30" />
                DUMP_LOG_BUFFER
             </button>
          </div>

          <FFCard className="p-12 bg-black border-none shadow-3xl shadow-black/80 rounded-[64px] relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none animate-pulse">
                <Activity size={100} className="text-accent" />
             </div>
            <div className="space-y-6 font-mono text-xs overflow-x-auto">
              <LogLine time="19:22:45" level="INFO" msg="Family sync triggered for PID_1427" color="text-success" />
              <LogLine time="19:22:30" level="WARN" msg="Latency spike detected in Region AS-SE-1" color="text-amber-500" />
              <LogLine time="19:21:12" level="INFO" msg="Subscription tier upgraded for FAMILY_9982" color="text-success" />
              <LogLine time="19:20:05" level="ROOT" msg="System baseline verification complete" color="text-accent" />
              <LogLine time="19:18:50" level="AUTH" msg="SuperAdmin login detected from secure terminal 0xFE" color="text-blue-400" />
              <LogLine time="19:15:22" level="SYS" msg="Quantum encryption handshake verified" color="text-purple-400" />
            </div>
          </FFCard>
        </section>

        <footer className="text-center py-24 space-y-6">
           <div className="flex items-center justify-center gap-10 text-primary/10">
              <div className="h-px w-32 bg-current" />
              <ShieldCheck size={40} />
              <div className="h-px w-32 bg-current" />
           </div>
           <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.8em] italic opacity-40 leading-relaxed">STATION_ENGINE // Command Grid v4.4.2</p>
        </footer>
      </main>
    </div>
  );
};

const LogLine = ({ time, level, msg, color }: { time: string, level: string, msg: string, color: string }) => (
  <div className="flex gap-8 group/log items-center border-b border-white/[0.03] pb-4 last:border-0 hover:bg-white/[0.02] transition-colors -mx-4 px-4">
    <span className="text-white/10 font-black tracking-tighter w-20 shrink-0 italic">[{time}]</span>
    <span className={`font-black w-14 shrink-0 text-[10px] px-2 py-0.5 rounded-sm bg-white/5 text-center ${color} border border-current opacity-60 group-hover/log:opacity-100 transition-opacity tracking-widest uppercase`}>{level}</span>
    <span className="text-white/40 group-hover/log:text-white/80 transition-colors uppercase italic tracking-wider font-bold">{msg}</span>
  </div>
);

interface KPIWidgetProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend: string;
  isPositive: boolean;
}

const KPIWidget: React.FC<KPIWidgetProps> = ({ label, value, icon, trend, isPositive }) => (
  <motion.div
    whileHover={{ y: -10, scale: 1.02 }}
    transition={{ duration: 0.5, ease: "circOut" }}
  >
    <FFCard className="p-10 border-none bg-white shadow-3xl shadow-black/[0.01] rounded-[48px] overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
         {icon}
      </div>
      <div className="flex justify-between items-start mb-10 relative z-10">
        <div className="w-16 h-16 bg-gray-50 rounded-[24px] flex items-center justify-center text-primary shadow-sm border border-black/[0.02] group-hover:rotate-6 transition-transform">
          {icon}
        </div>
        <div className={`flex items-center gap-2 text-[10px] font-black px-4 py-2 rounded-xl italic tracking-widest ${isPositive ? 'bg-success/5 text-success' : 'bg-alert/5 text-alert'} border ${isPositive ? 'border-success/10' : 'border-alert/10'}`}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      </div>
      <div className="relative z-10">
        <h4 className="text-4xl lg:text-5xl font-display font-black text-primary tracking-tighter italic tabular-nums leading-none mb-3">{value}</h4>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none">{label}</p>
      </div>
    </FFCard>
  </motion.div>
);

export default AdminDashboardScreen;

