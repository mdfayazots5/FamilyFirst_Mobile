import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Calendar, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  RefreshCcw,
  Radar,
  Activity,
  Layers,
  Cpu,
  Monitor,
  Command,
  ShieldCheck,
  Target,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { useReports } from '../providers/ReportsProvider';
import { AttendanceDay } from '../repositories/ReportsRepository';
import AttendanceHeatmapWidget from '../widgets/AttendanceHeatmapWidget';
import FFCard from '../../../shared/components/FFCard';
import FFBadge from '../../../shared/components/FFBadge';

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
    avgCompletion: Math.round(attendanceData.reduce((acc, curr) => acc + curr.completionRate, 0) / (attendanceData.length || 1) * 100),
    bestStreak: 12,
    missedDays: 2
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-48">
      {/* Precision Tracking Header */}
      <header className="bg-white/95 backdrop-blur-2xl p-8 lg:p-14 border-b border-black/[0.03] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="flex items-center gap-10">
            <div className="w-24 h-24 bg-primary/5 rounded-[32px] flex items-center justify-center text-primary shadow-inner relative group overflow-hidden">
               <div className="absolute inset-x-0 bottom-0 h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
               <Target size={40} className="relative z-10 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <FFBadge variant="primary" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none">PERSISTENCE_MONITOR</FFBadge>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none whitespace-nowrap">CROSS_UNIT_CONSISTENCY_ARCHIVE</p>
                </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none">
                Consistency Matrix
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="h-16 w-16 bg-white rounded-[24px] border border-black/5 text-gray-300 hover:text-primary transition-all shadow-sm flex items-center justify-center group active:scale-90">
               <Filter size={24} className="group-hover:rotate-12 transition-transform" />
            </button>
            <button 
              onClick={() => navigate(-1)}
              className="w-16 h-16 bg-white rounded-[24px] border border-black/5 text-gray-300 hover:text-primary transition-all shadow-sm flex items-center justify-center group active:scale-90"
            >
              <ArrowLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto mt-12">
            <div className="flex gap-4 p-2 bg-gray-50 rounded-[32px] border border-black/[0.03] shadow-inner relative">
              {['Arjun', 'Zara'].map(child => (
                <button
                  key={child}
                  onClick={() => setSelectedChild(child)}
                  className={`flex-1 h-16 rounded-[24px] text-[11px] font-black uppercase tracking-[0.4em] transition-all italic relative overflow-hidden group ${
                    selectedChild === child 
                      ? 'text-white' 
                      : 'text-gray-400 hover:text-primary'
                  }`}
                >
                  {selectedChild === child && (
                    <motion.div 
                       layoutId="child-selector" 
                       className="absolute inset-0 bg-primary shadow-2xl shadow-primary/30 z-0" 
                    />
                  )}
                  <span className="relative z-10">{child}</span>
                </button>
              ))}
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 lg:p-14 pt-16 space-y-20">
        {/* Heatmap Section */}
        <section className="space-y-12">
           <div className="flex items-center gap-8 px-4">
              <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
                 <RefreshCcw size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic">TEMPORAL_ACTIVITY_MAP</h3>
              <div className="h-px flex-1 bg-primary/10" />
           </div>

           <FFCard className="p-12 lg:p-16 border-none shadow-3xl shadow-black/[0.01] bg-white rounded-[64px] relative overflow-hidden group/heatmap">
              <div className="absolute top-0 right-0 p-12 opacity-[0.01] pointer-events-none translate-x-12 translate-y-[-20%] group-hover:scale-110 transition-transform duration-1000">
                 <Activity size={160} strokeWidth={1} />
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8 relative z-10">
                <div className="space-y-2">
                   <FFBadge variant="accent" size="sm" className="font-black italic px-4 py-1.5 opacity-60">RETROSPECTIVE_30_DAY_SCAN</FFBadge>
                   <p className="text-sm font-black text-gray-300 uppercase tracking-widest italic">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}</p>
                </div>
                <div className="flex flex-wrap gap-8 items-center bg-gray-50/50 p-6 rounded-[32px] border border-black/[0.02]">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-success rounded-full shadow-lg shadow-success/20" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">OPTIMAL_STATE</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-amber-500 rounded-full shadow-lg shadow-amber-500/20" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">NOMINAL_DRIVE</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-alert rounded-full shadow-lg shadow-alert/20" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">CRITICAL_LATENCY</span>
                  </div>
                </div>
              </div>
              
              <div className="relative z-10 min-h-[300px] flex items-center justify-center">
                {isLoading ? (
                  <div className="flex flex-col items-center gap-6 animate-pulse">
                     <RefreshCcw size={48} className="text-primary/10 animate-spin" />
                     <p className="text-[11px] font-black text-primary/20 uppercase tracking-[0.5em] italic">EXTRACTING_TELEMETRY...</p>
                  </div>
                ) : (
                  <div className="w-full">
                     <AttendanceHeatmapWidget data={attendanceData} />
                  </div>
                )}
              </div>
           </FFCard>
        </section>

        {/* Operational Metrics Grid */}
        <section className="space-y-12">
            <div className="flex items-center gap-8 px-4">
               <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
                  <Monitor size={24} strokeWidth={2.5} />
               </div>
               <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic">DIAGNOSTIC_METRICS</h3>
               <div className="h-px flex-1 bg-primary/10" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <StatCard 
                icon={<TrendingUp size={28} />} 
                label="AVG_COMPLETION_RATE" 
                value={`${stats.avgCompletion}%`} 
                color="text-success" 
                trend="+4.2%"
              />
              <StatCard 
                icon={<Clock size={28} />} 
                label="PEAK_CONSECUTIVE_STREAK" 
                value={`${stats.bestStreak}`} 
                unit="CYCLES"
                color="text-primary" 
              />
              <StatCard 
                icon={<CheckCircle2 size={28} />} 
                label="LATENCY_INCURRED" 
                value={stats.missedDays} 
                unit="INCIDENTS"
                color="text-alert" 
              />
            </div>
        </section>

        {/* Predictive Heuristics */}
        <FFCard className="p-12 lg:p-16 border-none shadow-3xl shadow-primary/[0.02] bg-primary text-white rounded-[64px] relative overflow-hidden group/insight">
          <div className="absolute top-0 right-0 p-12 opacity-[0.08] pointer-events-none group-hover:scale-110 group-hover:rotate-12 transition-transform duration-2000">
            <Cpu size={240} strokeWidth={1} />
          </div>
          <div className="flex flex-col md:flex-row gap-12 items-center relative z-10">
            <div className="w-24 h-24 bg-white/10 rounded-[32px] flex items-center justify-center text-accent shadow-2xl backdrop-blur-md shrink-0 border border-white/10 animate-pulse">
              <Radar size={40} />
            </div>
            <div className="space-y-6 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4">
                 <FFBadge variant="accent" size="sm" className="font-black px-4 py-1.5 uppercase tracking-widest">HEURISTIC_FEEDBACK</FFBadge>
                 <span className="text-[10px] font-black text-white/40 uppercase tracking-widest italic leading-none">AI_COGNITION_LAYER // ACTIVE</span>
              </div>
              <p className="text-2xl lg:text-3xl font-display font-medium leading-relaxed italic opacity-90">
                "Personnel unit <span className="text-accent underline underline-offset-8 decoration-accent/30">{selectedChild}</span> exhibits peak operational efficiency during mid-cycle intervals (Tues-Wed). Latency spikes identified during weekend rest periods require tactical adjustment."
              </p>
            </div>
          </div>
        </FFCard>

        <footer className="text-center space-y-12 py-40 px-8 border-t border-black/[0.03]">
           <div className="flex items-center justify-center gap-12 text-primary/10">
              <div className="h-px w-32 bg-current" />
              <ShieldCheck size={40} />
              <div className="h-px w-32 bg-current" />
           </div>
           <div className="space-y-6">
              <p className="text-[12px] text-gray-400 font-black uppercase tracking-[1em] italic leading-relaxed">STATION_ENGINE // Consistency Matrix Registry v4.4.2</p>
              <div className="max-w-md mx-auto relative px-10 border-l-2 border-primary/10 italic">
                 <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.4em] leading-relaxed">
                   "Persistence metrics are strictly audited for high-command compliance. Registry locked."
                 </p>
              </div>
           </div>
        </footer>
      </main>
    </div>
  );
};

const StatCard = ({ icon, label, value, unit, color, trend }: any) => (
  <FFCard className="p-10 lg:p-12 border-none shadow-3xl shadow-black/[0.01] bg-white rounded-[48px] relative overflow-hidden group flex flex-col justify-between">
    <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:scale-125 transition-transform duration-1000">
       <Layers size={120} strokeWidth={1} />
    </div>
    
    <div className="relative z-10 flex justify-between items-start mb-12">
      <div className="p-4 bg-gray-50 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner group-hover:shadow-primary/30 group-hover:scale-110">
        {icon}
      </div>
      {trend && (
         <div className="flex items-center gap-1.5 px-3 py-1 bg-success/10 text-success rounded-full text-[10px] font-black italic tracking-widest border border-success/10">
            <Zap size={10} fill="currentColor" /> {trend}
         </div>
      )}
    </div>

    <div className="relative z-10 space-y-2">
      <div className="flex items-baseline gap-3">
         <span className={`text-6xl font-display font-black italic tracking-tighter ${color} group-hover:scale-105 transition-transform origin-left block`}>{value}</span>
         {unit && <span className="text-xs font-black text-gray-300 uppercase tracking-widest italic">{unit}</span>}
      </div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] italic mb-1 leading-none">{label}</p>
    </div>
  </FFCard>
);

export default AttendanceSummaryScreen;
