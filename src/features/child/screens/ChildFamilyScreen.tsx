import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Trophy, 
  Target, 
  Heart, 
  MessageCircle, 
  ChevronRight,
  ArrowLeft,
  Calendar,
  Play,
  Zap,
  ShieldCheck,
  Star,
  Sparkles,
  ArrowRight,
  Fingerprint,
  Cpu,
  Layers,
  Activity,
  CloudUpload,
  RefreshCcw,
  Network
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { FamilyGoalRepository, FamilyGoal } from '../../family/repositories/FamilyGoalRepository';
import { ElderRepository, Appreciation, GrandchildStatus } from '../../elder/repositories/ElderRepository';
import { CalendarRepository, CalendarEvent } from '../../calendar/repositories/CalendarRepository';
import FFCard from '../../../shared/components/FFCard';
import FFBadge from '../../../shared/components/FFBadge';
import FFAvatar from '../../../shared/components/FFAvatar';

const ChildFamilyScreen: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [goals, setGoals] = useState<FamilyGoal[]>([]);
  const [appreciations, setAppreciations] = useState<Appreciation[]>([]);
  const [siblings, setSiblings] = useState<GrandchildStatus[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const familyScore = 78;
  const myContribution = 18;

  const fetchData = useCallback(async () => {
    if (!user?.familyId) return;
    setIsLoading(true);
    try {
      const [goalList, apprList, sibList, eventList] = await Promise.all([
        FamilyGoalRepository.getGoals(user.familyId),
        ElderRepository.getAppreciations(user.familyId),
        ElderRepository.getGrandchildren(user.familyId),
        CalendarRepository.getUpcomingEvents(user.familyId, 7)
      ]);
      setGoals(goalList);
      setAppreciations(apprList);
      setSiblings(sibList.filter(s => s.id !== user.id));
      setEvents(eventList);
    } catch (error) {
      console.error('Failed to fetch child family data', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.familyId, user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-success';
    if (score >= 40) return 'text-amber-500';
    return 'text-alert';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-12 text-center space-y-8">
        <motion.div 
           animate={{ rotate: 360 }}
           transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
           className="w-24 h-24 rounded-[32px] bg-primary/5 flex items-center justify-center text-primary"
        >
           <RefreshCcw size={40} />
        </motion.div>
        <p className="text-[12px] font-black uppercase tracking-[0.5em] text-primary/30 italic animate-pulse">SYNCING_COLLECTIVE_DATA...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-48">
      {/* Precision Header */}
      <header className="bg-white/90 backdrop-blur-2xl p-8 lg:p-14 border-b border-black/[0.03] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="flex items-center gap-10">
            <div className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-primary/20 -rotate-3 transform hover:rotate-0 transition-transform duration-500 relative group">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-110 group-hover:scale-125 transition-transform" />
              <Network size={40} className="relative z-10" />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <FFBadge variant="primary" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest">COLLECTIVE_INTELLIGENCE</FFBadge>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] italic">SYNC_STATUS: ACTIVE</p>
                </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none">
                Our Family
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

      <main className="max-w-7xl mx-auto p-8 lg:p-14 space-y-24 pt-16">
        {/* Collective Score Gauge */}
        <div className="flex flex-col items-center relative py-16 bg-white/50 rounded-[64px] border border-black/[0.02] shadow-xl shadow-black/[0.01]">
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
             <div className="w-[500px] h-[500px] border-[50px] border-primary rounded-full blur-2xl" />
          </div>

          <div className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FB8C05" />
                  <stop offset="100%" stopColor="#ED4E33" />
                </linearGradient>
              </defs>
              <circle
                cx="50%"
                cy="50%"
                r="44%"
                fill="none"
                stroke="currentColor"
                strokeWidth="24"
                className="text-gray-100"
              />
              <motion.circle
                cx="50%"
                cy="50%"
                r="44%"
                fill="none"
                stroke="url(#scoreGradient)"
                strokeWidth="24"
                strokeDasharray="100"
                initial={{ strokeDashoffset: 100 }}
                animate={{ strokeDashoffset: 100 - familyScore }}
                transition={{ duration: 2.5, ease: "circOut" }}
                strokeLinecap="round"
                pathLength="100"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
               <motion.span 
                 initial={{ opacity: 0, scale: 0.5 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="text-9xl font-display font-black tracking-tighter text-primary italic leading-none"
               >
                 {familyScore}
               </motion.span>
               <div className="flex items-center gap-2 mt-4 px-4 py-1.5 bg-primary/5 rounded-full border border-primary/5">
                  <Cpu size={12} className="text-primary/40" />
                  <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.5em] italic">UNIT_EFFICIENCY</span>
               </div>
            </div>
          </div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-16 px-12 py-6 bg-white rounded-[40px] border border-black/[0.02] shadow-2xl shadow-primary/5 flex items-center gap-6 group hover:translate-y-[-4px] transition-transform"
          >
            <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent shadow-inner relative overflow-hidden">
               <Zap size={28} fill="currentColor" className="relative z-10" />
               <div className="absolute inset-x-0 bottom-0 h-1 bg-accent/20 animate-pulse" />
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-1 italic">INDIVIDUAL_INPUT_DATA</p>
               <p className="text-xl font-black text-primary uppercase italic tracking-tighter">
                 CONTRIBUTION: <span className="text-accent underline decoration-accent/30 decoration-4 underline-offset-4">+{myContribution} SIG_POINTS</span> TODAY
               </p>
            </div>
          </motion.div>
        </div>

        {/* Active Goal: Strategic Mission */}
        {goals.length > 0 && (
          <section className="space-y-12">
            <div className="flex items-center gap-8">
              <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary italic">
                 <Target size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic">STRATEGIC_MISSION_v2</h3>
              <div className="h-px flex-1 bg-primary/10" />
            </div>

            <FFCard className="p-16 border-none shadow-2xl shadow-black/[0.01] bg-white rounded-[64px] relative overflow-hidden group">
              <div className="relative z-10 space-y-14">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
                  <div className="space-y-8 flex-1">
                    <div className="flex items-center gap-6">
                       <FFBadge variant="warning" size="sm" className="font-black px-4 py-1.5 uppercase tracking-widest italic rounded-xl">PRIORITY_ALPHA</FFBadge>
                       <div className="flex items-center gap-3">
                          <Calendar size={14} className="text-gray-300" />
                          <span className="text-[11px] font-black text-gray-300 uppercase tracking-[0.3em] italic">DEPLOYMENT_WINDOW_CLOSING: 04d_05h</span>
                       </div>
                    </div>
                    <div>
                       <h4 className="text-5xl md:text-6xl font-display font-black text-primary uppercase italic tracking-tighter leading-none mb-6">{goals[0].title}</h4>
                       <p className="text-xl text-gray-400 font-medium max-w-3xl italic leading-relaxed">"{goals[0].description}"</p>
                    </div>
                  </div>
                  <motion.div 
                    animate={{ rotate: [12, 0, 12] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="w-32 h-32 bg-amber-50 rounded-[40px] flex items-center justify-center text-amber-500 shadow-2xl shadow-amber-500/10 border-4 border-white transform lg:translate-y-[-20%] group-hover:scale-110 transition-transform"
                  >
                    <Trophy size={56} />
                  </motion.div>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-end mb-4 px-2">
                    <div className="flex items-baseline gap-4">
                       <span className="text-6xl font-display font-black text-primary italic leading-none">{Math.round((goals[0].currentValue / goals[0].targetValue) * 100)}%</span>
                       <span className="text-[11px] font-black text-gray-300 uppercase tracking-[0.4em] italic mb-1">DATA_SATURATION</span>
                    </div>
                    <div className="text-right">
                       <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.4em] italic leading-none mb-2">TARGET_QUOTA</p>
                       <span className="text-2xl font-display font-black text-primary italic leading-none">{goals[0].targetValue}_Units</span>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-50 rounded-full overflow-hidden p-1 border border-black/[0.02]">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(goals[0].currentValue / goals[0].targetValue) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 2, ease: "circOut" }}
                      className="h-full bg-primary rounded-full shadow-lg shadow-primary/20 relative overflow-hidden"
                    >
                       <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-shimmer" />
                    </motion.div>
                  </div>
                </div>

                <div className="pt-12 border-t border-black/[0.03] flex flex-col md:flex-row md:items-center justify-between gap-8">
                   <div className="flex items-center gap-6 text-amber-600">
                      <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                         <Target size={28} />
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600/50 mb-1 italic">MISSION_REWARD_PROTOCOL</p>
                         <span className="text-2xl font-display font-black uppercase italic tracking-tighter leading-none">{goals[0].reward}</span>
                      </div>
                   </div>
                   <button className="flex items-center gap-4 py-4 px-8 bg-primary/5 rounded-2xl text-[12px] font-black text-primary uppercase tracking-[0.3em] italic hover:bg-primary hover:text-white transition-all group/btn shadow-sm active:scale-95">
                      LOG_MISSION_PROGRESS <ArrowRight size={18} className="group-hover/btn:translate-x-2 transition-transform" />
                   </button>
                </div>
              </div>
              <div className="absolute -right-20 -bottom-20 text-primary/[0.01] rotate-12 pointer-events-none transition-transform duration-[3000ms] group-hover:rotate-45">
                <Network size={600} strokeWidth={1} />
              </div>
            </FFCard>
          </section>
        )}

        {/* Unit Coordination: Sibling Sync */}
        <section className="space-y-12">
           <div className="flex items-center gap-8">
            <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary italic">
               <Layers size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic">UNIT_COORDINATION_ARRAY</h3>
            <div className="h-px flex-1 bg-primary/10" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {siblings.map(sibling => (
              <FFCard key={sibling.id} className="p-10 border-none shadow-2xl shadow-black/[0.01] bg-white rounded-[48px] flex items-center gap-10 group hover:translate-y-[-4px] transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] -rotate-12 translate-x-4">
                   <Fingerprint size={120} />
                </div>
                <div className="relative">
                  <FFAvatar name={sibling.name} size="xxxl" className="ring-8 ring-primary/5 rounded-[40px] group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-success rounded-[18px] border-4 border-white flex items-center justify-center text-white shadow-xl shadow-success/20 transition-transform hover:rotate-12">
                     <ShieldCheck size={22} />
                  </div>
                </div>
                <div className="flex-1 space-y-6 relative z-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-3xl font-display font-black text-primary uppercase italic tracking-tighter leading-none">{sibling.name}</h4>
                      <div className="flex items-center gap-3 mt-3 px-3 py-1 bg-success/5 border border-success/10 rounded-full w-fit">
                        <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                        <p className="text-[10px] font-black text-success uppercase tracking-widest italic">{sibling.status.toUpperCase()}_SYNC</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-3xl font-display font-black text-primary italic leading-none tabular-nums">{sibling.tasksCompleted}</p>
                       <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">TASKS_SYNCED</p>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden p-0.5 border border-black/[0.02]">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(sibling.tasksCompleted / sibling.totalTasks) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, ease: "circOut" }}
                      className="h-full bg-success rounded-full shadow-lg shadow-success/10 relative overflow-hidden" 
                    >
                       <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer" />
                    </motion.div>
                  </div>
                </div>
              </FFCard>
            ))}
          </div>
          <div className="bg-primary p-8 rounded-[40px] border border-primary/10 flex flex-col md:flex-row items-center justify-center gap-8 shadow-2xl shadow-primary/20 relative overflow-hidden">
             <div className="absolute top-0 left-0 p-8 opacity-[0.05] rotate-12">
                <MessageCircle size={160} />
             </div>
             <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-accent shadow-inner backdrop-blur-xl border border-white/5 relative z-10">
                <MessageCircle size={32} />
             </div>
             <p className="text-xl md:text-2xl font-display font-black text-white uppercase italic tracking-tighter text-center md:text-left relative z-10 leading-tight">
              "UNIT_ARJUN IS LEADING BY 2 PROTOCOLS! ACCELERATE SYNC_OPERATION_IMMEDIATELY."
            </p>
          </div>
        </section>

        {/* Appreciation Wall: External Validation */}
        <section className="space-y-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary italic">
                 <Heart size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic">EXTERNAL_VALIDATION_STREAM</h3>
            </div>
            <div className="h-px flex-1 bg-primary/10 ml-8" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {appreciations.map((appr, i) => (
              <FFCard key={appr.id} className="p-12 border-none shadow-2xl shadow-black/[0.01] bg-white rounded-[56px] relative overflow-hidden group hover:bg-accent/[0.02] transition-colors">
                <div className="flex flex-col md:flex-row gap-10 relative z-10">
                  <div className="w-24 h-24 bg-accent/5 rounded-[36px] flex items-center justify-center text-5xl shrink-0 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                    {appr.sticker || '❤️'}
                  </div>
                  <div className="flex-1 space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                         <div className="flex items-center gap-2">
                            <Sparkles size={12} className="text-accent" />
                            <p className="text-[10px] font-black text-accent uppercase tracking-[0.4em] italic leading-none">SOURCE: {appr.authorName.toUpperCase()}</p>
                         </div>
                         <h4 className="text-2xl font-display font-black text-primary uppercase italic tracking-tighter leading-none">POSITIVE_SIGNAL_{String(i+1).padStart(2, '0')}</h4>
                      </div>
                      <span className="text-[11px] font-black text-gray-200 uppercase tabular-nums italic tracking-widest">
                        {new Date(appr.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xl text-gray-400 font-medium italic leading-relaxed">"{appr.message}"</p>
                    
                    {appr.audioUrl && (
                      <button className="flex items-center gap-4 px-8 h-14 bg-primary text-white rounded-[24px] font-black text-[12px] uppercase tracking-[0.3em] hover:bg-primary/90 transition-all shadow-2xl shadow-primary/20 italic group/audio overflow-hidden relative">
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-accent/30 animate-pulse" />
                        <Play size={20} fill="currentColor" className="relative z-10 group-hover/audio:scale-125 transition-transform" />
                        <span className="relative z-10">PLAY_VOICE_MEMO</span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="absolute right-[-20px] top-[-20px] text-accent/[0.03] pointer-events-none group-hover:rotate-45 transition-transform duration-1000">
                   <Heart size={200} />
                </div>
              </FFCard>
            ))}
          </div>
        </section>

        {/* Family Events: Deployment Schedule */}
        <section className="space-y-12 pb-24">
           <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary italic">
                 <Calendar size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic">DEPLOYMENT_SCHEDULE_LOG</h3>
            </div>
            <div className="h-px flex-1 bg-primary/10 mx-8" />
            <button 
              onClick={() => navigate('/calendar')}
              className="h-14 px-8 bg-white rounded-2xl border border-black/[0.03] shadow-sm text-[12px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-4 hover:bg-gray-50 transition-all hover:translate-y-[-2px] italic active:scale-95 shadow-2xl shadow-black/[0.02]"
            >
              FULL_OPERATIONAL_LOG <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {events.slice(0, 2).map(event => (
              <FFCard key={event.id} className="p-10 border-none shadow-2xl shadow-black/[0.01] bg-white rounded-[48px] flex items-center gap-10 group hover:bg-primary/[0.02] cursor-pointer transition-all hover:scale-[1.02]">
                <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex flex-col items-center justify-center text-primary shrink-0 border border-black/[0.03] group-hover:bg-white transition-colors shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.05] -rotate-12 translate-x-2">
                     <Calendar size={40} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.4em] leading-none mb-2 italic relative z-10 mt-2">{new Date(event.startDateTime).toLocaleDateString('en-US', { month: 'short' })}</span>
                  <span className="text-5xl font-display font-black leading-none italic relative z-10">{new Date(event.startDateTime).getDate()}</span>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                     <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.3em] italic">{event.isAllDay ? 'FULL_DAY_OPERATION' : new Date(event.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <h4 className="text-3xl font-display font-black text-primary uppercase italic tracking-tighter leading-none transition-colors group-hover:text-primary mb-2">{event.title}</h4>
                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                     <p className="text-[10px] font-black text-primary uppercase tracking-widest italic">View Mission Parameters</p>
                     <ArrowRight size={14} className="text-primary" />
                  </div>
                </div>
                <div className="w-14 h-14 bg-white rounded-2xl border border-black/[0.03] flex items-center justify-center text-gray-200 group-hover:text-primary group-hover:scale-110 group-hover:rotate-12 transition-all shadow-sm">
                   <ArrowRight size={24} />
                </div>
              </FFCard>
            ))}
          </div>
        </section>
      </main>

       <footer className="text-center space-y-8 py-32 px-8 border-t border-black/[0.03]">
         <div className="flex items-center justify-center gap-6 text-primary/10">
            <div className="h-px w-20 bg-current" />
            <Users size={28} />
            <div className="h-px w-20 bg-current" />
         </div>
         <div className="space-y-4">
            <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.6em] italic leading-relaxed">COLLECTIVE_ENGINE // FamilyFirst Unit Synchronization v2.1.0</p>
            <p className="text-[9px] text-gray-300 font-black uppercase tracking-[0.3em] italic opacity-40">All family signals are synchronized and and encrypted via secure unit protocol</p>
         </div>
      </footer>
    </div>
  );
};

export default ChildFamilyScreen;
