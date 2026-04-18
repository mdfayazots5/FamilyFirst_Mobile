import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Plus, 
  Heart, 
  TrendingDown, 
  Star,
  ChevronRight,
  Camera,
  AlertCircle,
  MoreVertical,
  Flame,
  TrendingUp,
  Activity,
  Zap,
  Target,
  ShieldCheck,
  Globe,
  Radar,
  Command,
  Layers,
  Fingerprint,
  RefreshCcw,
  ZapOff,
  Cpu,
  Smartphone,
  Maximize2
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { ChildRepository, ChildDetail, TaskCompletion, Feedback } from '../repositories/ChildRepository';
import FFAvatar from '../../../shared/components/FFAvatar';
import FFCard from '../../../shared/components/FFCard';
import FFBadge from '../../../shared/components/FFBadge';
import FFButton from '../../../shared/components/FFButton';
import ChildRadarChart from '../widgets/ChildRadarChart';
import WeekMiniCalendar from '../widgets/WeekMiniCalendar';
import FeedbackCard from '../widgets/FeedbackCard';
import PhotoReviewSheet from '../widgets/PhotoReviewSheet';

const ChildDetailScreen: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'feedback'>('today');
  const [child, setChild] = useState<ChildDetail | null>(null);
  const [tasks, setTasks] = useState<TaskCompletion[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedTask, setSelectedTask] = useState<TaskCompletion | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?.familyId || !childId) return;
    setIsLoading(true);
    try {
      const [detail, taskList, feedbackList] = await Promise.all([
        ChildRepository.getChildDetail(user.familyId, childId),
        ChildRepository.getTaskCompletions(user.familyId, childId),
        ChildRepository.getFeedback(user.familyId, childId)
      ]);
      setChild(detail);
      setTasks(taskList);
      setFeedbacks(feedbackList);
    } catch (error) {
      console.error('Failed to fetch child data', error);
    } finally {
      setTimeout(() => setIsLoading(false), 800);
    }
  }, [user?.familyId, childId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprove = async () => {
    if (!selectedTask) return;
    try {
      await ChildRepository.reviewTask(selectedTask.id, 'done');
      setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, status: 'done' } : t));
      setIsReviewOpen(false);
    } catch (error) {
      console.error('Failed to approve task', error);
    }
  };

  const handleFlag = async (reason: string, note: string) => {
    if (!selectedTask) return;
    try {
      await ChildRepository.reviewTask(selectedTask.id, 'flagged', `${reason}: ${note}`);
      setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, status: 'flagged' } : t));
      setIsReviewOpen(false);
    } catch (error) {
      console.error('Failed to flag task', error);
    }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      await ChildRepository.acknowledgeFeedback(id, 'Acknowledged by parent');
      setFeedbacks(feedbacks.map(f => f.id === id ? { ...f, isRead: true } : f));
    } catch (error) {
      console.error('Failed to acknowledge feedback', error);
    }
  };

  if (isLoading && !child) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#FDFCFB]">
        <div className="w-24 h-24 bg-primary/5 rounded-[32px] flex items-center justify-center text-primary mb-8 relative group">
           <div className="absolute inset-0 bg-primary/10 rounded-[32px] animate-ping opacity-20" />
           <RefreshCcw size={40} className="animate-spin" />
        </div>
        <div className="text-center space-y-3">
           <p className="text-[12px] font-black text-primary uppercase tracking-[0.5em] animate-pulse italic">SYNCHRONIZING_UNIT_TELEMETRY...</p>
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-60">High Priority Data Link Established</p>
        </div>
      </div>
    );
  }

  if (!child) return null;

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-48">
      {/* Tactical Header */}
      <header className="bg-white/95 backdrop-blur-2xl p-8 lg:p-14 border-b border-black/[0.03] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="flex items-center gap-10">
            <div className="relative group">
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                className="relative cursor-pointer"
                onClick={() => navigate(`/parent/routine/${childId}`)}
              >
                <div className="absolute -inset-2 bg-gradient-to-tr from-accent/30 via-accent/5 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                <FFAvatar name={child.name} size="xl" className="ring-8 ring-white shadow-3xl relative z-10" />
                <div className="absolute -bottom-2 -right-2 bg-accent text-white p-3 rounded-2xl shadow-xl border-4 border-white z-20 group-hover:scale-110 transition-transform">
                  <Fingerprint size={24} />
                </div>
              </motion.div>
              <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-success animate-pulse z-30 border-4 border-white shadow-lg" title="Unit Online" />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <FFBadge variant="accent" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none">UNIT_{childId?.substring(0, 4).toUpperCase() || 'ALPHA'}-1</FFBadge>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none whitespace-nowrap">OPERATIONAL_TELEMETRY_ACTIVE</p>
                </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none">
                {child.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="flex gap-2 p-2 bg-gray-50 border border-black/5 rounded-[24px] shadow-inner">
              {[
                { id: 'today', label: 'Timeline', icon: <Clock size={16} /> },
                { id: 'week', label: 'Analytics', icon: <TrendingUp size={16} /> },
                { id: 'feedback', label: 'Signals', icon: <MessageSquare size={16} /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-3 px-8 py-4 rounded-[18px] text-[11px] font-black uppercase tracking-widest transition-all duration-500 italic ${activeTab === tab.id ? 'bg-primary text-white shadow-2xl shadow-primary/40 scale-105' : 'text-gray-400 hover:text-primary'}`}
                >
                  {tab.icon} {tab.label.toUpperCase()}
                </button>
              ))}
            </div>
            <button 
              onClick={() => navigate(-1)}
              className="w-16 h-16 bg-white rounded-[24px] border border-black/5 text-gray-300 hover:text-primary transition-all shadow-sm flex items-center justify-center group active:scale-90"
            >
              <ArrowLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 lg:p-14 space-y-24 pt-16">
        {/* Vitals Feed */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Uptime Streak', value: child.streak, unit: 'DAYS', color: 'text-accent', icon: <Flame size={24} fill="currentColor" />, bg: 'bg-accent/5' },
            { label: 'Current Index', value: child.todayScore, unit: 'PTS', color: 'text-success', icon: <TrendingUp size={24} />, bg: 'bg-success/5' },
            { label: 'Unit Credits', value: 340, unit: 'COINS', color: 'text-amber-500', icon: <Star size={24} fill="currentColor" />, bg: 'bg-amber-50' },
            { label: 'Health Status', value: 'OPTIMAL', unit: 'SYNC', color: 'text-primary', icon: <Activity size={24} />, bg: 'bg-primary/5' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -8 }}
              className="h-full"
            >
              <FFCard className="p-10 border-none shadow-3xl shadow-black/[0.01] bg-white rounded-[48px] flex flex-col justify-between h-full relative overflow-hidden group">
                <div className={`absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000 ${stat.color}`}>
                   <Command size={120} strokeWidth={1} />
                </div>
                <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center mb-10 shadow-inner group-hover:rotate-6 transition-transform duration-500 ${stat.bg} ${stat.color}`}>
                   {stat.icon}
                </div>
                <div>
                  <div className={`text-5xl font-display font-black italic tracking-tighter leading-none mb-3 ${stat.color} tabular-nums`}>{stat.value}</div>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] leading-none italic">{stat.label} <span className="text-gray-200 ml-2">// {stat.unit}</span></p>
                </div>
              </FFCard>
            </motion.div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'today' && (
            <motion.div
              key="today"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
              className="space-y-16"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-4">
                 <div className="flex items-center gap-8">
                  <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
                    <Clock size={24} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic leading-none">OPERATIONAL_TIMELINE</h3>
                  <div className="h-px w-32 bg-primary/10 hidden lg:block" />
                </div>
                <div className="flex items-center gap-4">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none">STABILITY_ARRAY</p>
                   <FFBadge variant="success" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest italic rounded-xl">INDEX: 0.94</FFBadge>
                </div>
              </div>

              <div className="grid gap-10">
                {tasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <FFCard className="p-10 border-none shadow-3xl shadow-black/[0.01] bg-white rounded-[56px] group transition-all hover:bg-gray-50/50 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-12 opacity-[0.01] pointer-events-none translate-x-12 translate-y-[-10%] group-hover:scale-105 transition-transform duration-1000">
                         <Target size={200} strokeWidth={1} />
                      </div>

                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">
                        <div className="flex items-center gap-10">
                          <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center shadow-2xl transition-all duration-700 group-hover:rotate-3 ${task.status === 'done' ? 'bg-success text-white shadow-success/20' : task.status === 'pending' ? 'bg-accent text-white shadow-accent/20' : 'bg-alert text-white shadow-alert/20'}`}>
                            {task.status === 'done' ? <CheckCircle2 size={36} /> : task.status === 'pending' ? <Clock size={36} /> : <AlertCircle size={36} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-3">
                               <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] italic leading-none whitespace-nowrap">ID_{task.id.substring(0, 8).toUpperCase()}</p>
                               <div className="h-0.5 w-6 bg-primary/5 rounded-full" />
                            </div>
                            <h4 className="text-3xl font-display font-black text-primary uppercase italic tracking-tighter group-hover:text-primary transition-colors leading-none mb-4">{task.title}</h4>
                            <div className="flex flex-wrap items-center gap-5">
                              <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg text-primary/60">
                                 <Clock size={12} />
                                 <span className="text-[10px] font-black uppercase tracking-widest italic tabular-nums leading-none">{task.time}</span>
                              </div>
                              <div className="h-4 w-px bg-black/[0.05]" />
                              <FFBadge size="sm" variant="primary" className="font-black px-3 py-1 uppercase italic tracking-[0.2em] text-[9px]">{task.category} PROTOCOL</FFBadge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between md:justify-end gap-10">
                          {task.photoUrl && (
                            <button 
                              onClick={() => {
                                setSelectedTask(task);
                                setIsReviewOpen(true);
                              }}
                              className="relative group/asset active:scale-95 transition-transform"
                            >
                              <div className="w-24 h-24 rounded-[36px] overflow-hidden bg-gray-50 ring-8 ring-white shadow-3xl transition-all group-hover/asset:ring-accent group-hover/asset:rotate-6 duration-700">
                                <img src={task.photoUrl} alt="Task" className="w-full h-full object-cover group-hover/asset:scale-110 transition-transform duration-1000" referrerPolicy="no-referrer" />
                              </div>
                              <div className="absolute -top-3 -right-3 bg-accent text-white p-3 rounded-2xl shadow-xl border-4 border-white group-hover/asset:scale-125 transition-transform">
                                <Maximize2 size={16} />
                              </div>
                            </button>
                          )}
                          <div className="w-16 h-16 rounded-[24px] bg-white border border-black/[0.03] flex items-center justify-center text-gray-200 shadow-sm group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-500 transform group-hover:translate-x-1">
                            <ChevronRight size={32} />
                          </div>
                        </div>
                      </div>
                    </FFCard>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'week' && (
            <motion.div
              key="week"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
              className="space-y-16"
            >
               <div className="flex items-center gap-8 px-4">
                  <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
                    <TrendingUp size={24} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic leading-none">ANALYTIC_VECTORS</h3>
                  <div className="h-px w-32 bg-primary/10 hidden lg:block" />
                </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <FFCard className="p-12 border-none shadow-3xl shadow-black/[0.01] bg-white rounded-[64px] group overflow-hidden relative h-fit">
                   <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-110 group-hover:rotate-45 transition-transform duration-[3000ms]">
                      <Radar size={300} strokeWidth={1} />
                   </div>
                  <div className="flex items-center justify-between mb-16 relative z-10">
                    <div className="space-y-1">
                       <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/30 italic leading-none">PILLAR_VECTOR_MAPPING</h3>
                       <p className="text-[10px] text-gray-400 font-bold italic opacity-60">Comparative structural analysis</p>
                    </div>
                    <FFBadge variant="accent" size="sm" className="font-black italic px-4 py-2 text-[11px] rounded-xl">+12% ARC</FFBadge>
                  </div>
                  <div className="aspect-square relative z-10">
                    <ChildRadarChart data={child.radarData} />
                  </div>
                </FFCard>

                <div className="space-y-10">
                  <FFCard className="p-12 border-none shadow-3xl shadow-black/[0.01] bg-white rounded-[64px] group relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-105 transition-transform duration-[2000ms]">
                        <Calendar size={200} strokeWidth={1} />
                     </div>
                     <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/30 mb-10 italic leading-none">CHRONO-CALENDAR</h3>
                     <div className="relative z-10">
                        <WeekMiniCalendar />
                     </div>
                  </FFCard>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <motion.div whileHover={{ scale: 1.05 }} className="h-full">
                      <FFCard className="p-10 bg-success/5 border border-success/10 rounded-[48px] h-full flex flex-col justify-between group">
                        <div className="flex items-center gap-4 text-success mb-6">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                             <Star size={20} fill="currentColor" />
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-[0.3em] italic leading-none whitespace-nowrap">DOMINANT_VECTOR</span>
                        </div>
                        <p className="text-3xl font-display font-black text-primary uppercase italic tracking-tighter leading-none mb-1 group-hover:text-success transition-colors">Responsibility</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-60">PEAK_STABILITY</p>
                      </FFCard>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.05 }} className="h-full">
                      <FFCard className="p-10 bg-alert/5 border border-alert/10 rounded-[48px] h-full flex flex-col justify-between group">
                        <div className="flex items-center gap-4 text-alert mb-6">
                           <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:-rotate-12 transition-transform">
                              <Target size={20} />
                           </div>
                          <span className="text-[11px] font-black uppercase tracking-[0.3em] italic leading-none whitespace-nowrap">DRIFT_AREA</span>
                        </div>
                        <p className="text-3xl font-display font-black text-primary uppercase italic tracking-tighter leading-none mb-1 group-hover:text-alert transition-colors">Screen Time</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-60">ATTENTION_LEAK</p>
                      </FFCard>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'feedback' && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto space-y-16"
            >
               <div className="flex items-center gap-8 px-4">
                  <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
                    <MessageSquare size={24} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic leading-none">EXTERNAL_SIGNAL_FEED</h3>
                  <div className="h-px flex-1 bg-primary/10" />
                </div>

              <div className="space-y-10">
                {feedbacks.length === 0 ? (
                  <div className="bg-white p-24 rounded-[64px] border border-black/[0.03] text-center shadow-3xl shadow-black/[0.01]">
                     <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center text-gray-200 mx-auto mb-10">
                        <ZapOff size={48} />
                     </div>
                     <h4 className="text-2xl font-display font-black text-primary uppercase italic tracking-tighter mb-4">NO_SIGNALS_DETECTED</h4>
                     <p className="text-gray-400 font-medium italic">Telemetry is currently quiet. No external feedback packets have been received from the field.</p>
                  </div>
                ) : (
                  feedbacks.map(feedback => (
                    <FeedbackCard 
                      key={feedback.id} 
                      feedback={feedback} 
                      onAcknowledge={handleAcknowledge} 
                    />
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="text-center space-y-12 py-40 px-8 border-t border-black/[0.03]">
           <div className="flex items-center justify-center gap-10 text-primary/10">
              <div className="h-px w-32 bg-current" />
              <ShieldCheck size={40} />
              <div className="h-px w-32 bg-current" />
           </div>
           <div className="space-y-4">
              <p className="text-[12px] text-gray-400 font-black uppercase tracking-[0.8em] italic leading-relaxed">STATION_ENGINE // Parent Command Oversight Dashboard v4.4.2</p>
              <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.4em] italic opacity-40">Unauthorized access to personnel telemetry is strictly prohibited</p>
           </div>
        </footer>
      </main>

      {/* High-Command FAB */}
      <div className="fixed bottom-28 right-12 flex flex-col items-end gap-6 pointer-events-none z-40">
        <motion.button
          whileHover={{ scale: 1.15, y: -8, rotate: 12 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(`/parent/routine/${childId}`)}
          className="pointer-events-auto w-24 h-24 bg-black text-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-center transition-all group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl" />
          <Zap size={40} fill="white" className="relative z-10 group-hover:scale-110 transition-transform" />
          <div className="absolute -inset-2 border-2 border-white/20 rounded-[44px] group-hover:scale-110 opacity-0 group-hover:opacity-100 transition-all duration-700" />
        </motion.button>
      </div>

      {/* Proof Validation Interface */}
      {selectedTask && (
        <PhotoReviewSheet
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          photoUrl={selectedTask.photoUrl || ''}
          taskTitle={selectedTask.title}
          onApprove={handleApprove}
          onFlag={handleFlag}
        />
      )}
    </div>
  );
};

export default ChildDetailScreen;
