import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Share2, 
  TrendingUp, 
  TrendingDown, 
  Star, 
  Calendar,
  MessageSquare,
  CheckCircle2,
  ChevronRight,
  Download,
  Sparkles,
  Quote,
  Target,
  RefreshCcw,
  Monitor,
  Cpu,
  Fingerprint,
  Layers,
  Activity,
  Command,
  Smartphone,
  ShieldCheck,
  Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { useReports } from '../providers/ReportsProvider';
import { ReportsRepository } from '../repositories/ReportsRepository';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFBadge from '../../../shared/components/FFBadge';

const WeeklyDigestScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { weeklyDigest, fetchWeeklyDigest, isLoading } = useReports();
  const [remark, setRemark] = useState('');
  const [isSavingRemark, setIsSavingRemark] = useState(false);

  useEffect(() => {
    const today = new Date();
    const lastSunday = new Date(today.setDate(today.getDate() - today.getDay()));
    fetchWeeklyDigest(lastSunday.toISOString().split('T')[0]);
  }, [fetchWeeklyDigest]);

  const handleSaveRemark = async (childId: string) => {
    if (!remark) return;
    setIsSavingRemark(true);
    try {
      await ReportsRepository.updateParentRemark(childId, remark);
      setRemark('');
    } catch (error) {
      console.error('Failed to save remark', error);
    } finally {
      setTimeout(() => setIsSavingRemark(false), 500);
    }
  };

  const handleShare = () => {
    // Sharing logic
  };

  if (isLoading || !weeklyDigest) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#FDFCFB]">
        <div className="w-24 h-24 bg-primary/5 rounded-[32px] flex items-center justify-center text-primary mb-8 relative group">
           <div className="absolute inset-0 bg-primary/10 rounded-[32px] animate-ping opacity-20" />
           <RefreshCcw size={40} className="animate-spin" />
        </div>
        <div className="text-center space-y-3">
           <p className="text-[12px] font-black text-primary uppercase tracking-[0.5em] animate-pulse italic">SYNCHRONIZING_DIGEST_ARCHIVE...</p>
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-60">Neural Pathway Extraction Active</p>
        </div>
      </div>
    );
  }

  const scoreDiff = weeklyDigest.familyScore - weeklyDigest.previousFamilyScore;

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-48">
      {/* Strategic Broadcast Header */}
      <header className="bg-white/95 backdrop-blur-2xl p-8 lg:p-14 border-b border-black/[0.03] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="flex items-center gap-10">
            <div className="w-24 h-24 bg-accent/10 rounded-[32px] flex items-center justify-center text-accent shadow-inner relative group overflow-hidden">
               <div className="absolute inset-0 bg-accent/20 -translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
               <Sparkles size={40} className="relative z-10 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <FFBadge variant="accent" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none">VOL. 08 // ISSUE 4</FFBadge>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none whitespace-nowrap">FAMILY_INTELLIGENCE_DISPATCH_v1.0</p>
                </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none">
                Weekly Digest
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={handleShare}
              className="h-16 px-10 rounded-[24px] bg-primary text-white font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-4 shadow-3xl shadow-primary/30 hover:bg-black transition-all active:scale-95 italic whitespace-nowrap group"
            >
              <Share2 size={20} className="group-hover:rotate-12 transition-transform" />
              DISPATCH_REPORT_CARD
            </button>
            <button 
              onClick={() => navigate(-1)}
              className="w-16 h-16 bg-white rounded-[24px] border border-black/5 text-gray-300 hover:text-primary transition-all shadow-sm flex items-center justify-center group active:scale-90"
            >
              <ArrowLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-12 lg:p-20 pt-16 space-y-24">
        {/* AGGREGATE_VELOCITY_HERO */}
        <FFCard className="p-16 bg-primary text-white overflow-hidden relative border-none shadow-3xl shadow-primary/40 rounded-[72px] group/hero">
          <div className="absolute top-0 right-0 p-16 opacity-[0.05] pointer-events-none group-hover:scale-110 group-hover:rotate-12 transition-transform duration-2000">
            <Quote size={400} fill="currentColor" strokeWidth={1} />
          </div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-12">
              <div className="space-y-4">
                 <div className="bg-white/10 px-6 py-2 rounded-full w-fit border border-white/10 backdrop-blur-md">
                    <p className="text-[12px] font-black text-white uppercase tracking-[0.5em] italic leading-none opacity-80">AGGREGATE_VELOCITY</p>
                 </div>
                 <h2 className="text-9xl md:text-[11rem] font-display font-black tracking-tighter leading-none italic drop-shadow-2xl">{weeklyDigest.familyScore}</h2>
              </div>
              
              <div className="flex items-center gap-6 p-6 rounded-[32px] bg-white/5 border border-white/10 w-fit backdrop-blur-sm">
                <div className={`p-4 rounded-2xl ${scoreDiff >= 0 ? 'bg-success/20 text-success' : 'bg-alert/20 text-alert'}`}>
                   {scoreDiff >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                </div>
                <div>
                   <p className="text-3xl font-display font-black italic tracking-tight">{Math.abs(scoreDiff)} DELTA_UNITS</p>
                   <p className="text-[11px] font-black uppercase tracking-[0.3em] opacity-40">PERFORMANCE_SHIFT_CYCLE</p>
                </div>
              </div>
            </div>

            <div className="relative pl-16 border-l-4 border-white/10">
              <Quote className="absolute left-0 top-0 text-accent opacity-40 -translate-x-6" size={48} />
              <p className="text-3xl lg:text-4xl font-display font-medium leading-tight italic opacity-90 drop-shadow-md">
                {weeklyDigest.narrative}
              </p>
            </div>
          </div>
        </FFCard>

        {/* PERSONNEL_ANALYSIS_STATIONS */}
        <section className="space-y-16">
          <div className="flex items-center gap-8 px-4">
             <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
                <Monitor size={24} strokeWidth={2.5} />
             </div>
             <h3 className="text-2xl font-display font-black uppercase tracking-widest text-primary italic leading-none">INTELLIGENCE_HIGHLIGHTS</h3>
             <div className="h-px flex-1 bg-primary/10" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {weeklyDigest.childSummaries.map((child, index) => (
              <motion.div
                key={child.childId}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <FFCard className="p-12 space-y-12 border-none shadow-3xl shadow-black/[0.01] bg-white rounded-[64px] relative overflow-hidden group hover:shadow-3xl hover:shadow-black/[0.04] transition-all duration-700 h-full flex flex-col">
                  <div className="absolute top-0 right-0 p-12 opacity-[0.01] pointer-events-none translate-x-12 translate-y-[-20%] group-hover:scale-125 transition-transform duration-1000">
                     <Command size={160} strokeWidth={1} />
                  </div>

                  <div className="relative z-10 flex justify-between items-start">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-success translate-y-[-1px]" />
                         <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] italic leading-none">STATION_CHILD_{index + 1}</p>
                      </div>
                      <h4 className="text-4xl md:text-5xl font-display font-black text-primary uppercase italic tracking-tighter leading-none group-hover:text-primary transition-colors">{child.childName}</h4>
                    </div>
                    <div className="flex flex-col gap-3 items-end">
                      <FFBadge variant="success" size="sm" className="font-black px-4 py-2 italic tracking-widest rounded-xl text-[10px]">ATTENDANCE: {child.attendance}</FFBadge>
                      <FFBadge variant="accent" size="sm" className="font-black px-4 py-2 italic tracking-widest rounded-xl text-[10px]">HOMEWORK: {child.homework}</FFBadge>
                    </div>
                  </div>

                  <div className="flex-1 space-y-6 relative z-10">
                    <h5 className="text-[11px] font-black text-primary/30 uppercase tracking-[0.4em] italic mb-6">VICTORY_LOG_ENTRIES</h5>
                    <ul className="space-y-6">
                      {child.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-6 group/item">
                          <div className="w-8 h-8 rounded-2xl bg-success/10 flex items-center justify-center text-success shrink-0 group-hover/item:scale-110 group-hover/item:rotate-12 transition-all shadow-inner border border-success/10">
                            <CheckCircle2 size={16} strokeWidth={3} />
                          </div>
                          <span className="text-xl font-medium text-primary italic leading-snug group-hover/item:translate-x-1 transition-transform duration-500">{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* EXEC_REMARK_COMM_CHANNEL */}
                  <div className="pt-12 border-t border-black/[0.03] space-y-6 relative z-10 mt-auto">
                    <div className="flex items-center gap-4">
                       <MessageSquare size={16} className="text-gray-300" />
                       <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest italic opacity-60">EXECUTIVE_REMARK_PROTOCOL</label>
                    </div>
                    <div className="flex gap-4">
                      <div className="relative flex-1 group/input">
                         <div className="absolute inset-x-6 top-0 h-px bg-primary/20 scale-x-0 group-hover/input:scale-x-100 transition-transform duration-700" />
                         <input 
                            type="text" 
                            placeholder="Enter command blessing..."
                            className="w-full h-18 px-8 bg-gray-50/50 border border-black/[0.02] rounded-[24px] text-lg font-bold text-primary focus:outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all shadow-inner placeholder:italic placeholder:opacity-30 italic"
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                         />
                      </div>
                      <FFButton 
                        onClick={() => handleSaveRemark(child.childId)}
                        disabled={!remark || isSavingRemark}
                        className="h-18 px-10 rounded-[24px] bg-primary group/send"
                      >
                        {isSavingRemark ? <RefreshCcw className="animate-spin" size={24} /> : <Send size={24} className="group-hover/send:translate-x-1 group-hover/send:-translate-y-1 transition-transform" />}
                      </FFButton>
                    </div>
                  </div>
                </FFCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FEEDBACK_FEEDS & FUTURE_OBJECTIVES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <FFCard className="p-12 border-none shadow-3xl shadow-black/[0.01] bg-white rounded-[56px] relative overflow-hidden group/obs">
            <div className="absolute top-0 right-0 p-12 opacity-[0.01] pointer-events-none translate-x-10 translate-y-[-10%] group-hover:scale-110 transition-transform duration-1000">
               <Cpu size={140} strokeWidth={1} />
            </div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/30 mb-10 flex items-center gap-4 italic group-hover:text-primary transition-colors">
              <MessageSquare size={20} /> STAFF_OBSERVATION_STREAM
            </h4>
            <div className="space-y-10">
              {weeklyDigest.teacherAppreciations.map((note, i) => (
                <div key={i} className="relative pl-12 group/note">
                  <Quote className="absolute left-0 top-0 text-accent/20 group-hover:text-accent transition-colors" size={24} />
                  <p className="text-2xl font-display font-medium text-primary italic leading-snug drop-shadow-sm group-hover:translate-x-1 transition-transform duration-500">"{note}"</p>
                </div>
              ))}
            </div>
          </FFCard>
          
          <FFCard className="p-12 border-none shadow-3xl shadow-black/[0.01] bg-white rounded-[56px] relative overflow-hidden group/fut">
            <div className="absolute top-0 right-0 p-12 opacity-[0.01] pointer-events-none translate-x-10 translate-y-[-10%] group-hover:scale-110 transition-transform duration-1000">
               <Layers size={140} strokeWidth={1} />
            </div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/30 mb-10 flex items-center gap-4 italic group-hover:text-accent transition-colors">
              <Calendar size={20} /> NEXT_CYCLE_VECTORS
            </h4>
            <div className="space-y-6">
              {weeklyDigest.upcomingEvents.map((event, i) => (
                <motion.div 
                   key={i} 
                   whileHover={{ x: 10 }}
                   className="flex items-center gap-6 p-5 hover:bg-black/5 rounded-[24px] transition-all cursor-pointer group/ev"
                >
                  <div className="w-4 h-4 rounded-full bg-accent animate-pulse shadow-lg shadow-accent/20" />
                  <span className="text-2xl font-display font-black text-primary uppercase italic tracking-tighter truncate leading-none group-ev:text-primary">{event}</span>
                </motion.div>
              ))}
            </div>
          </FFCard>
        </div>

        <footer className="text-center space-y-12 py-40 px-8 border-t border-black/[0.03]">
           <div className="flex items-center justify-center gap-12 text-primary/10">
              <div className="h-px w-32 bg-current" />
              <ShieldCheck size={40} />
              <div className="h-px w-32 bg-current" />
           </div>
           <div className="space-y-6">
              <p className="text-[12px] text-gray-400 font-black uppercase tracking-[1em] italic leading-relaxed">STATION_ENGINE // Intelligence Report Matrix v4.4.2</p>
              <div className="max-w-md mx-auto relative px-10 border-l-2 border-primary/10 italic">
                 <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.4em] leading-relaxed">
                   "Executive digest is verified for cross-family strategic synchronization. Dispatch successful."
                 </p>
              </div>
           </div>
        </footer>
      </main>
    </div>
  );
};

export default WeeklyDigestScreen;
