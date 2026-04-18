import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Flame, 
  Trophy, 
  Star, 
  ChevronRight,
  Info,
  Heart,
  Zap,
  Target,
  ShieldCheck,
  Activity,
  Award,
  TrendingUp,
  BarChart3,
  Sparkles,
  ArrowRight,
  Cpu,
  Layers,
  Fingerprint,
  PieChart,
  Radar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import FFCard from '../../../shared/components/FFCard';
import FFBadge from '../../../shared/components/FFBadge';
import ChildRadarChart from '../../parent/widgets/ChildRadarChart';
import BadgeGrid from '../widgets/BadgeGrid';

const MyScoresScreen: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Demo data
  const radarData = [
    { subject: 'Study', A: 85, fullMark: 100 },
    { subject: 'Cleanliness', A: 70, fullMark: 100 },
    { subject: 'Discipline', A: 90, fullMark: 100 },
    { subject: 'ScreenControl', A: 60, fullMark: 100 },
    { subject: 'Responsibility', A: 80, fullMark: 100 },
  ];

  const streak = {
    current: 8,
    best: 15,
    freezes: 1
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-40">
      {/* Precision Header */}
      <header className="bg-white/90 backdrop-blur-2xl p-8 lg:p-14 border-b border-black/[0.03] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="flex items-center gap-10">
            <div className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-primary/20 rotate-3 transform hover:rotate-0 transition-transform duration-500 relative group">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-110 group-hover:scale-125 transition-transform" />
              <TrendingUp size={40} className="relative z-10" />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <FFBadge variant="primary" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest">PERFORMANCE_ANALYTICS</FFBadge>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Unit_ID: {user?.name?.toUpperCase() || 'UNIT_77'}</p>
                </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none">
                My Scores
              </h1>
            </div>
          </div>

          <button 
            onClick={() => navigate(-1)}
            className="w-16 h-16 bg-white rounded-[24px] border border-black/5 text-gray-300 hover:text-primary transition-all shadow-sm flex items-center justify-center group active:scale-90"
          >
            <ArrowLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 lg:p-14 space-y-24">
        {/* Efficiency Index: Main KPI */}
        <section className="flex flex-col items-center relative py-16 bg-white/50 rounded-[64px] border border-black/[0.02] shadow-xl shadow-black/[0.01]">
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none">
            <Radar size={400} strokeWidth={1} className="animate-spin-slow" />
          </div>
          
          <div className="text-center relative z-10">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 12 }}
              className="relative inline-block"
            >
              <span className="text-9xl md:text-[12rem] font-display font-black text-primary tracking-tighter italic leading-none block">77.4</span>
              <div className="absolute -top-10 -right-16 w-24 h-24 bg-accent rounded-[32px] border-8 border-white flex items-center justify-center text-white shadow-2xl shadow-accent/40 rotate-12 transition-transform hover:rotate-0 cursor-default">
                <Trophy size={40} />
              </div>
              <div className="absolute -bottom-6 left-0 bg-primary text-white border-4 border-white px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] italic shadow-xl">
                 RANKING: ELITE_PROTOCOL
              </div>
            </motion.div>
            <div className="flex flex-col items-center gap-4 mt-16">
               <p className="text-[12px] font-black text-gray-400 uppercase tracking-[0.6em] italic leading-none">CUMULATIVE_EFFICIENCY_INDEX</p>
               <div className="flex items-center gap-3">
                  <TrendingUp size={16} className="text-success" />
                  <p className="text-[10px] font-black text-success uppercase tracking-widest">+4.2% FROM LAST PERIOD</p>
               </div>
            </div>
          </div>
        </section>

        {/* Continuity Log: Persistence Tracking */}
        <section className="space-y-12">
           <div className="flex items-center gap-8">
            <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary italic">
               <Activity size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic">CONTINUITY_LOG_v2</h3>
            <div className="h-px flex-1 bg-primary/10" />
          </div>

          <FFCard className="p-16 bg-primary text-white border-none shadow-2xl shadow-primary/30 rounded-[64px] overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-16 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-1000 -rotate-12 translate-x-16 pointer-events-none">
              <Zap size={480} strokeWidth={1} fill="white" />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
              <div className="flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
                <motion.div 
                  animate={{ 
                    scale: [1, 1.05, 1],
                    boxShadow: ["0 0 0px rgba(251, 191, 36, 0)", "0 0 40px rgba(251, 191, 36, 0.4)", "0 0 0px rgba(251, 191, 36, 0)"]
                  }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="w-32 h-32 bg-white/10 rounded-[40px] flex items-center justify-center text-amber-400 shadow-inner border border-white/5 backdrop-blur-xl"
                >
                  <Flame size={72} fill="currentColor" />
                </motion.div>
                <div>
                  <h4 className="text-7xl md:text-8xl font-display font-black uppercase italic tracking-tighter leading-none mb-4">{streak.current}_Days</h4>
                  <div className="flex items-center justify-center md:justify-start gap-3">
                     <Cpu size={14} className="opacity-40" />
                     <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em] italic">ACTIVE_SYNCHRONIZATION_STREAK</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center lg:items-end gap-10 w-full lg:w-auto mt-8 lg:mt-0">
                <div className="space-y-6 text-center lg:text-right w-full">
                  <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em] italic">MAX_CONTINUITY_HISTORICAL: {streak.best}D</p>
                  <div className="flex gap-4 justify-center lg:justify-end">
                    {[...Array(3)].map((_, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 shadow-xl ${i < streak.freezes ? 'bg-accent/40 border-accent text-accent' : 'bg-white/5 border-white/10 text-white/10'}`}
                      >
                         <ShieldCheck size={24} />
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center lg:justify-end gap-3 text-accent animate-pulse">
                     <Fingerprint size={14} />
                     <p className="text-[11px] font-black uppercase tracking-[0.3em] italic">STREAK_SHIELDS_STANDBY</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Background Aura */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10" />
          </FFCard>
        </section>

        {/* Data Matrix: Radar & Badges */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Dimensional Balance: Skill Radar */}
          <section className="space-y-12">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-[18px] bg-primary/5 flex items-center justify-center text-primary italic">
                 <PieChart size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic">DIMENSIONAL_BALANCE</h3>
              <div className="h-px flex-1 bg-primary/10" />
            </div>
            <FFCard className="p-16 border-none shadow-2xl shadow-black/[0.01] bg-white rounded-[64px] flex items-center justify-center min-h-[500px] relative overflow-hidden group">
              <div className="absolute top-0 left-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                 <Target size={120} />
              </div>
              <div className="w-full max-w-sm relative z-10 transform group-hover:scale-105 transition-transform duration-700">
                <ChildRadarChart data={radarData} />
              </div>
            </FFCard>
          </section>

          {/* Achievement Vault: Neural Badges */}
          <section className="space-y-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                 <div className="w-12 h-12 rounded-[18px] bg-primary/5 flex items-center justify-center text-primary italic">
                    <Award size={24} strokeWidth={2.5} />
                 </div>
                 <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic">ACHIEVEMENT_VAULT</h3>
              </div>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic leading-none">SYNCED: 03 // 06</p>
            </div>
            <FFCard className="p-16 border-none shadow-2xl shadow-black/[0.01] bg-white rounded-[64px] h-full flex items-center justify-center relative overflow-hidden group">
               <div className="absolute bottom-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity translate-x-4 translate-y-4">
                  <Star size={160} strokeWidth={1} />
               </div>
               <div className="w-full relative z-10">
                <BadgeGrid />
               </div>
            </FFCard>
          </section>
        </div>

        {/* Command Signal: Feedback Loop */}
        <section className="space-y-12 pb-24">
           <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-alert/5 rounded-[18px] flex items-center justify-center text-alert italic">
               <ArrowRight size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic">EXTERNAL_FEEDBACK_LOOP</h3>
            <div className="h-px flex-1 bg-primary/10" />
          </div>

          <FFCard className="p-16 border-none shadow-2xl shadow-black/[0.01] bg-[#FFF9F4] rounded-[72px] relative overflow-hidden group">
            <div className="relative z-10 space-y-12">
              <div className="text-alert/5 absolute -left-12 -top-12 rotate-12 pointer-events-none">
                 <Heart size={320} fill="currentColor" />
              </div>

              <div className="space-y-8 relative z-10">
                 <div className="flex items-center gap-4 text-alert">
                    <Sparkles size={20} />
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] italic">PRIORITY_ENCRYPTION_SIGNAL</p>
                 </div>
                 <p className="text-3xl md:text-5xl font-display font-black text-primary italic leading-none tracking-tighter uppercase">
                  "SO_PROUD OF YOUR_CONSISTENCY WITH_NEURAL_DRILLS. GROWTH_IS_DATA_PROVEN. KEEP_PUSHING_BOUNDARIES."
                </p>
                <div className="flex items-center gap-6 pt-4">
                  <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center text-alert shadow-2xl shadow-alert/10 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                    <Heart size={36} fill="currentColor" />
                  </div>
                  <div>
                    <h5 className="text-2xl font-display font-black text-primary uppercase italic tracking-tighter leading-none">Command_Unit_MOM</h5>
                    <div className="flex items-center gap-2 mt-2">
                       <div className="w-2 h-2 rounded-full bg-alert animate-ping" />
                       <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest italic leading-none">SIGNAL_STRENGTH: MAXIMUM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute right-[-40px] bottom-[-40px] text-amber-500/[0.02] group-hover:rotate-90 transition-transform duration-[2000ms] pointer-events-none">
              <Sparkles size={400} />
            </div>
          </FFCard>
        </section>
      </main>

       <footer className="text-center space-y-8 py-24 px-8 border-t border-black/[0.03]">
         <div className="flex items-center justify-center gap-6 text-primary/10">
            <div className="h-px w-20 bg-current" />
            <Cpu size={28} />
            <div className="h-px w-20 bg-current" />
         </div>
         <div className="space-y-4">
            <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.6em] italic">ANALYTICS_CORE // FamilyFirst Strategic Performance v2.1.0</p>
            <p className="text-[9px] text-gray-300 font-black uppercase tracking-[0.3em] italic opacity-40">All performance metrics are encrypted and verified via neural-link integration</p>
         </div>
      </footer>
    </div>
  );
};

export default MyScoresScreen;
