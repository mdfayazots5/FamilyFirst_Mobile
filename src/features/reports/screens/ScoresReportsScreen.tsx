import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  ChevronRight,
  FileText,
  Activity,
  Award,
  ChevronLeft,
  Sparkles,
  Target,
  Zap,
  BarChart3,
  Cpu,
  Layers,
  Fingerprint,
  Radar,
  Command,
  Smartphone,
  CheckCircle2,
  RefreshCcw,
  Monitor
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { useReports } from '../providers/ReportsProvider';
import { ScoreHistoryPoint } from '../repositories/ReportsRepository';
import ScoreRadarWidget from '../widgets/ScoreRadarWidget';
import ScoreTrendChart from '../widgets/ScoreTrendChart';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFBadge from '../../../shared/components/FFBadge';

const ScoresReportsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { fetchScoreHistory } = useReports();
  const [activeChild, setActiveChild] = useState('Arjun');
  const [history, setHistory] = useState<ScoreHistoryPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      const data = await fetchScoreHistory('c1');
      setHistory(data);
      setTimeout(() => setIsLoading(false), 800);
    };
    fetch();
  }, [fetchScoreHistory, activeChild]);

  const children = [
    { id: 'c1', name: 'Arjun', score: 88, trend: '+4' },
    { id: 'c2', name: 'Zara', score: 76, trend: '-2' },
  ];

  const currentChild = children.find(c => c.name === activeChild) || children[0];

  if (isLoading && history.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#FDFCFB]">
        <div className="w-24 h-24 bg-primary/5 rounded-[32px] flex items-center justify-center text-primary mb-8 relative group">
           <div className="absolute inset-0 bg-primary/10 rounded-[32px] animate-ping opacity-20" />
           <RefreshCcw size={40} className="animate-spin" />
        </div>
        <div className="text-center space-y-3">
           <p className="text-[12px] font-black text-primary uppercase tracking-[0.5em] animate-pulse italic">COMPUTING_INTELLIGENCE_METRICS...</p>
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-60">Neural Pathway Sync Established</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-48">
      {/* Strategic Intelligence Header */}
      <header className="bg-white/95 backdrop-blur-2xl p-8 lg:p-14 border-b border-black/[0.03] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="flex items-center gap-10">
            <div className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-primary/30 relative group overflow-hidden">
               <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 animate-pulse" />
               <BarChart3 size={40} className="relative z-10" />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <FFBadge variant="primary" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none">INTELLIGENCE_REPORT</FFBadge>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">LIVE_STRATUM_ANALYSIS_V4</p>
                </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none">
                Performance Matrix
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/reports/weekly')}
              className="h-16 px-8 rounded-[24px] bg-white text-primary font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-4 border-2 border-primary/10 hover:border-primary hover:bg-primary/5 transition-all shadow-sm active:scale-95 italic whitespace-nowrap"
            >
              <FileText size={20} />
              WEEKLY_DIGEST
            </button>
            <button 
              onClick={() => navigate(-1)}
              className="w-16 h-16 bg-white rounded-[24px] border border-black/5 text-gray-300 hover:text-primary transition-all shadow-sm flex items-center justify-center group active:scale-90"
            >
              <ArrowLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12">
          <div className="inline-flex gap-4 p-2 bg-gray-100/50 rounded-[28px] border border-black/[0.03] shadow-inner">
            {children.map(child => (
              <button
                key={child.id}
                onClick={() => setActiveChild(child.name)}
                className={`flex items-center justify-center px-10 h-14 rounded-[20px] text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 italic whitespace-nowrap ${
                  activeChild === child.name 
                    ? 'bg-white text-primary shadow-xl scale-105' 
                    : 'text-gray-400 hover:text-primary'
                }`}
              >
                {child.name.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-12 lg:p-20 pt-16 space-y-24">
        {/* Unit Performance Focus */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
          <FFCard className="xl:col-span-2 p-16 bg-white overflow-hidden relative border-none shadow-3xl shadow-black/[0.01] rounded-[72px] group/hero">
            <div className="absolute top-0 right-0 p-16 opacity-[0.02] pointer-events-none group-hover/hero:scale-110 group-hover/hero:rotate-12 transition-transform duration-2000">
              <Cpu size={360} strokeWidth={1} />
            </div>
            
            <div className="relative z-10 space-y-16">
              <div className="flex justify-between items-start">
                <div className="space-y-4">
                  <div className="bg-primary/5 px-6 py-2 rounded-full w-fit border border-primary/10">
                     <p className="text-[12px] font-black text-primary uppercase tracking-[0.5em] italic leading-none">COMPOSITE_SCORE</p>
                  </div>
                  <h2 className="text-8xl md:text-[10rem] font-display font-black text-primary tracking-tighter leading-none italic">{currentChild.score}</h2>
                </div>
                <div className={`flex flex-col items-end gap-3 p-6 rounded-[32px] border transition-all duration-700 ${currentChild.trend.startsWith('+') ? 'bg-success/5 border-success/10 text-success' : 'bg-alert/5 border-alert/10 text-alert'}`}>
                  <div className="flex items-center gap-4">
                     {currentChild.trend.startsWith('+') ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                     <span className="text-3xl font-display font-black italic tracking-tight">{currentChild.trend}%</span>
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] italic opacity-60">GROWTH_VELOCITY</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <div className="bg-gray-50/50 p-10 rounded-[48px] border border-black/[0.02]">
                   <ScoreRadarWidget data={history[history.length - 1]?.pillars || { discipline: 80, learning: 70, contribution: 60, health: 90, social: 75 }} />
                </div>
                <div className="space-y-8 px-4">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                        <Activity size={20} strokeWidth={2.5} />
                     </div>
                     <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/30 italic">VECTOR_ANALYSIS_MOD_4.0</h4>
                  </div>
                  <div className="space-y-6">
                    <PillarRow label="Discipline" value={88} color="bg-primary shadow-lg shadow-primary/20" />
                    <PillarRow label="Learning" value={76} color="bg-success shadow-lg shadow-success/20" />
                    <PillarRow label="Contribution" value={64} color="bg-amber-500 shadow-lg shadow-amber-500/20" />
                    <PillarRow label="Health" value={92} color="bg-alert shadow-lg shadow-alert/20" />
                    <PillarRow label="Social" value={80} color="bg-accent shadow-lg shadow-accent/20" />
                  </div>
                </div>
              </div>
            </div>
          </FFCard>

          <div className="grid grid-cols-1 gap-12">
            <FFCard className="p-12 bg-primary text-white border-none shadow-3xl shadow-primary/40 rounded-[64px] relative overflow-hidden group/insight">
              <div className="absolute -top-10 -right-10 p-4 opacity-10 group-hover/insight:scale-125 transition-transform duration-1000">
                 <Sparkles size={160} />
              </div>

              <div className="relative z-10 space-y-10">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-[18px] flex items-center justify-center backdrop-blur-md">
                       <Monitor size={24} />
                    </div>
                    <h3 className="text-2xl font-display font-black italic uppercase tracking-tighter leading-none">Intelligence Hub</h3>
                 </div>
                 
                 <div className="bg-white/5 p-8 rounded-[36px] border border-white/10 backdrop-blur-sm">
                    <p className="text-xl lg:text-2xl font-display font-medium leading-relaxed italic opacity-90">
                      "{currentChild.name} is demonstrating peak growth in Discipline protocols. Authorization of a 4-day streak reward is recommended to maintain operational velocity."
                    </p>
                 </div>

                 <FFButton variant="accent" size="lg" className="w-full h-20 rounded-[28px] text-[15px] font-black uppercase tracking-[0.3em] italic shadow-2xl shadow-accent/40 group/btnrel">
                    <CheckCircle2 size={24} className="mr-4 group-hover/btnrel:scale-110 transition-transform" />
                    DECODE_INSIGHTS
                 </FFButton>
              </div>
            </FFCard>

            <section className="space-y-10 px-4">
              <div className="flex items-center gap-4">
                 <div className="w-8 h-0.5 bg-primary/20 rounded-full" />
                 <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 italic">PERSONNEL_MILESTONES</h3>
              </div>
              <div className="grid gap-6">
                <MilestoneTile label="Century Streak" desc="100 day active protocol" progress={80} />
                <MilestoneTile label="Academic Merit" desc="5 Star field ratings" progress={40} />
              </div>
            </section>
          </div>
        </div>

        {/* Temporal Trend Matrix */}
        <section className="space-y-12">
           <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-8">
                 <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
                    <RefreshCcw size={24} strokeWidth={2.5} className="animate-spin-slow" />
                 </div>
                 <h3 className="text-2xl font-display font-black uppercase tracking-widest text-primary italic leading-none">30_DAY_EVOLUTION_MATRIX</h3>
              </div>
              <div className="flex gap-4">
                 <FFBadge variant="primary" size="sm" className="font-black px-4 py-2 uppercase italic tracking-widest rounded-xl text-[10px]">ROLLING_CYCLE</FFBadge>
                 <FFBadge variant="accent" size="sm" className="font-black px-4 py-2 uppercase italic tracking-widest rounded-xl text-[10px]">ALL_VECTOR_PILLARS</FFBadge>
              </div>
           </div>

           <FFCard className="p-16 bg-white border-none shadow-3xl shadow-black/[0.01] rounded-[72px] relative group/trend">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50/0 via-gray-50/50 to-gray-50/0 opacity-0 group-hover/trend:opacity-100 transition-opacity duration-1000" />
              <div className="relative z-10 h-[480px]">
                 {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center gap-6 text-gray-200">
                       <RefreshCcw size={64} className="animate-spin" />
                       <span className="text-[12px] font-black uppercase tracking-[0.5em] italic">SYNCING_METRICS...</span>
                    </div>
                 ) : (
                    <ScoreTrendChart data={history} />
                 )}
              </div>
           </FFCard>
        </section>

        {/* Intelligence Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <IntelligenceAction 
            icon={<Activity size={32} />} 
            label="Attendance Map" 
            desc="Consistency Heatmap Sync" 
            path="/reports/attendance"
            color="success"
          />
          <IntelligenceAction 
            icon={<Award size={32} />} 
            label="Badge Arsenal" 
            desc="Personnel Achievements" 
            path="#"
            color="amber-500"
          />
          <IntelligenceAction 
            icon={<FileText size={32} />} 
            label="Export PDF" 
            desc="Monthly Tactical Review" 
            path="#"
            color="primary"
          />
        </div>

        <footer className="text-center space-y-12 py-40 px-8 border-t border-black/[0.03]">
           <div className="flex items-center justify-center gap-12 text-primary/10">
              <div className="h-px w-32 bg-current" />
              <Command size={40} />
              <div className="h-px w-32 bg-current" />
           </div>
           <div className="space-y-6">
              <p className="text-[12px] text-gray-400 font-black uppercase tracking-[1em] italic leading-relaxed">STATION_ENGINE // Intelligence Report Matrix v4.4.2</p>
              <div className="max-w-md mx-auto relative px-10 border-l-2 border-primary/10 italic">
                 <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.4em] leading-relaxed">
                   "Personnel data is synchronized with the primary neural relay. Strategic insights are verified for command oversight."
                 </p>
              </div>
           </div>
        </footer>
      </main>
    </div>
  );
};

const IntelligenceAction = ({ icon, label, desc, path, color }: any) => {
  const navigate = useNavigate();
  return (
    <motion.button
      whileHover={{ y: -10, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(path)}
      className="p-10 bg-white rounded-[56px] border border-black/[0.03] shadow-3xl shadow-black/[0.01] flex items-center gap-10 text-left group hover:shadow-3xl hover:shadow-black/[0.05] transition-all duration-500 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-8 opacity-[0.01] pointer-events-none group-hover:scale-125 transition-transform duration-1000">
         <Layers size={120} strokeWidth={1} />
      </div>

      <div className={`w-24 h-24 bg-${color}/10 rounded-[28px] flex items-center justify-center text-${color} shadow-inner group-hover:rotate-6 transition-transform duration-500`}>
        {icon}
      </div>
      <div className="flex-1 space-y-2">
        <h4 className="font-display font-black text-primary text-2xl uppercase tracking-tighter italic leading-none">{label}</h4>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic leading-none">{desc}</p>
      </div>
      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
         <ChevronRight size={24} />
      </div>
    </motion.button>
  );
};

const MilestoneTile = ({ label, desc, progress }: any) => (
  <div className="p-8 bg-white rounded-[40px] border border-black/[0.03] shadow-inner space-y-6 hover:bg-gray-50 transition-colors duration-500 group">
    <div className="flex justify-between items-center">
      <div className="space-y-1">
        <h4 className="font-display font-black text-primary text-2xl uppercase italic tracking-tighter leading-none">{label}</h4>
        <p className="text-[11px] text-gray-400 font-medium italic uppercase tracking-widest leading-none opacity-60">{desc}</p>
      </div>
      <div className="px-5 py-2 bg-primary/5 text-primary rounded-[14px] font-display font-black text-lg italic tracking-tighter shadow-sm">
         {progress}%
      </div>
    </div>
    <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner p-0.5">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 1.5, ease: "circOut" }}
        className="h-full bg-primary rounded-full shadow-lg" 
      />
    </div>
  </div>
);

const PillarRow = ({ label, value, color }: any) => (
  <div className="space-y-2 group/row">
    <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.3em] px-1 italic">
      <span className="text-gray-400 group-hover/row:text-primary transition-colors">{label.toUpperCase()}</span>
      <span className="text-primary tabular-nums font-display font-black text-sm">{value}%</span>
    </div>
    <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner p-0.5">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.5, ease: "circOut", delay: 0.2 }}
        className={`h-full ${color} rounded-full`}
      />
    </div>
  </div>
);

export default ScoresReportsScreen;
