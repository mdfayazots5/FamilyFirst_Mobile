import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  Star, 
  Flag, 
  Eye, 
  BookOpen, 
  Bell, 
  Calendar,
  ChevronRight,
  CheckCircle2,
  Clock,
  Inbox,
  LayoutGrid,
  Zap,
  ShieldCheck,
  Target,
  RefreshCcw,
  Activity,
  Command,
  MessageSquare,
  AlertTriangle,
  FileText,
  Radio,
  Share2,
  Monitor
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { FeedbackRepository, Feedback, FeedbackType } from '../../teacher/repositories/FeedbackRepository';
import FFCard from '../../../shared/components/FFCard';
import FFBadge from '../../../shared/components/FFBadge';
import FFAvatar from '../../../shared/components/FFAvatar';
import FFEmptyState from '../../../shared/components/FFEmptyState';

const FeedbackInboxScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [filter, setFilter] = useState<FeedbackType | 'All' | 'Unread'>('All');
  const [isLoading, setIsLoading] = useState(true);

  const fetchFeedback = useCallback(async () => {
    if (!user?.familyId) return;
    setIsLoading(true);
    try {
      const data = await FeedbackRepository.getFeedbackInbox(user.familyId);
      setFeedbacks(data);
    } catch (error) {
      console.error('Failed to fetch feedback', error);
    } finally {
      setTimeout(() => setIsLoading(false), 800);
    }
  }, [user?.familyId]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const filteredFeedbacks = feedbacks.filter(fb => {
    if (filter === 'All') return true;
    if (filter === 'Unread') return !fb.isRead;
    return fb.type === filter;
  });

  const getIcon = (type: FeedbackType) => {
    switch (type) {
      case 'Appreciation': return <Star size={24} className="text-success" fill="currentColor" />;
      case 'Complaint': return <Flag size={24} className="text-alert" fill="currentColor" />;
      case 'Observation': return <Radio size={24} className="text-primary" />;
      case 'Homework': return <FileText size={24} className="text-accent" />;
      case 'Urgent': return <Bell size={24} className="text-alert animate-bounce" fill="currentColor" />;
      case 'WeeklySummary': return <Monitor size={24} className="text-indigo-600" />;
    }
  };

  const getBadgeVariant = (type: FeedbackType, severity: string) => {
    if (severity === 'Urgent' || type === 'Urgent') return 'alert';
    switch (type) {
      case 'Appreciation': return 'success';
      case 'Complaint': return 'alert';
      case 'Observation': return 'primary';
      case 'WeeklySummary': return 'accent';
      default: return 'gray';
    }
  };

  if (isLoading && feedbacks.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#FDFCFB]">
        <div className="w-24 h-24 bg-primary/5 rounded-[32px] flex items-center justify-center text-primary mb-8 relative group">
           <div className="absolute inset-0 bg-primary/10 rounded-[32px] animate-ping opacity-20" />
           <RefreshCcw size={40} className="animate-spin" />
        </div>
        <div className="text-center space-y-3">
           <p className="text-[12px] font-black text-primary uppercase tracking-[0.5em] animate-pulse italic">SYNCHRONIZING_SIGNAL_DECODE...</p>
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-60">High-Bit Protocol Establish</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-48">
      {/* Intelligence Header */}
      <header className="bg-white/95 backdrop-blur-2xl p-8 lg:p-14 border-b border-black/[0.03] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="flex items-center gap-10">
            <div className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-primary/30 relative group overflow-hidden">
               <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 animate-pulse" />
               <MessageSquare size={40} className="relative z-10" />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <FFBadge variant="primary" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none">INTELLIGENCE_LOG</FFBadge>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none whitespace-nowrap">{feedbacks.length} ACTIVE_SIGNALS_DECODED</p>
                </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none">
                Feedback Hub
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="w-16 h-16 bg-white rounded-[24px] border border-black/5 text-gray-300 hover:text-primary transition-all shadow-sm flex items-center justify-center group active:scale-90 cursor-pointer">
                <Search size={28} />
             </div>
             <div className="w-16 h-16 bg-white rounded-[24px] border border-black/5 text-gray-300 hover:text-primary transition-all shadow-sm flex items-center justify-center group active:scale-90 cursor-pointer">
                <Filter size={28} />
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 lg:p-14 space-y-24 pt-16">
        {/* Signal Filters Feed */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-12 px-4">
            <div className="space-y-4">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                     <Radio size={20} className="animate-pulse" />
                  </div>
                  <h2 className="text-4xl font-display font-black text-primary uppercase italic tracking-tighter leading-none">Frequency Matrix</h2>
               </div>
               <p className="text-gray-400 font-medium italic max-w-xl text-lg leading-relaxed">
                 Filter incoming intelligence packets based on origin frequency and operational type.
               </p>
            </div>
            
            <div className="flex gap-4 p-3 bg-white border border-black/[0.03] rounded-[36px] shadow-3xl shadow-black/[0.01] overflow-x-auto no-scrollbar scroll-smooth">
              {['All', 'Unread', 'Appreciation', 'Complaint', 'Observation', 'WeeklySummary'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`flex items-center justify-center min-w-[140px] h-16 rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 group relative italic overflow-hidden whitespace-nowrap px-8 ${filter === f ? 'bg-primary text-white shadow-3xl shadow-primary/30 scale-105 active:scale-95' : 'text-gray-300 hover:bg-gray-50'}`}
                >
                  {f.toUpperCase()}
                  {f === 'Unread' && feedbacks.filter(fb => !fb.isRead).length > 0 && (
                     <span className="ml-3 w-5 h-5 bg-accent text-white rounded-full text-[9px] flex items-center justify-center border-2 border-white shadow-lg font-black group-hover:scale-110 transition-transform">{feedbacks.filter(fb => !fb.isRead).length}</span>
                  )}
                </button>
              ))}
            </div>
        </div>

        {/* Intelligence Stream Overlay */}
        <div className="space-y-16">
           <div className="flex items-center gap-8 px-4">
              <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
                 <Activity size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic leading-none">OPERATIONAL_SIGNAL_STREAM</h3>
              <div className="h-px flex-1 bg-primary/10 hidden md:block" />
           </div>

           <div className="grid gap-12">
            {filteredFeedbacks.length === 0 ? (
               <div className="bg-white p-32 rounded-[64px] border border-black/[0.03] text-center shadow-3xl shadow-black/[0.01]">
                  <div className="w-32 h-32 bg-success/5 rounded-[48px] flex items-center justify-center text-success/20 mx-auto mb-12 group">
                     <ShieldCheck size={64} className="group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <h4 className="text-4xl font-display font-black text-primary uppercase italic tracking-tighter mb-6">NO_SIGNALS_DETECTED</h4>
                  <p className="text-gray-400 font-medium italic text-lg max-w-lg mx-auto leading-relaxed">The intelligence stream is currently clear. No pending field observations have been routed to secondary command units.</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <AnimatePresence mode="popLayout">
                  {filteredFeedbacks.map((fb, idx) => (
                    <motion.div
                      key={fb.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.5, delay: idx * 0.05 }}
                      onClick={() => navigate(`/parent/feedback/${fb.id}`)}
                      className="group/card"
                    >
                      <FFCard 
                        className={`h-full p-12 flex flex-col justify-between border-none shadow-3xl shadow-black/[0.01] rounded-[56px] cursor-pointer transition-all duration-700 hover:shadow-black/[0.03] hover:-translate-y-4 relative overflow-hidden bg-white ${!fb.isRead ? 'ring-4 ring-accent shadow-accent/10 scale-[1.02]' : ''}`}
                      >
                        <div className="absolute top-0 right-0 p-12 opacity-[0.01] pointer-events-none translate-x-12 translate-y-[-10%] group-hover/card:scale-105 transition-transform duration-1000">
                           <Command size={240} strokeWidth={1} />
                        </div>

                        {!fb.isRead && (
                           <div className="absolute top-8 right-8 z-20">
                              <motion.div 
                                animate={{ scale: [1, 1.4, 1] }} 
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="w-4 h-4 bg-accent rounded-full shadow-2xl shadow-accent/50 border-2 border-white" 
                              />
                           </div>
                        )}

                        <div className="space-y-10 relative z-10">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-6">
                              <div className={`w-20 h-20 flex items-center justify-center rounded-[28px] shadow-inner transform group-hover/card:rotate-6 transition-transform duration-700 ${!fb.isRead ? 'bg-accent/10 text-accent' : 'bg-gray-50 text-primary'}`}>
                                {getIcon(fb.type)}
                              </div>
                              <div className="space-y-2">
                                <h4 className="text-3xl font-display font-black text-primary uppercase italic tracking-tighter leading-none group-hover/card:text-primary transition-colors">{fb.teacherName}</h4>
                                <div className="flex items-center gap-4 mt-2">
                                  <span className="text-[12px] font-black text-accent uppercase tracking-widest italic leading-none">{fb.childName.toUpperCase()}</span>
                                  <div className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
                                  <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest italic tabular-nums leading-none">{new Date(fb.date).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            <FFBadge variant={getBadgeVariant(fb.type, fb.severity) as any} size="sm" className="font-black px-4 py-2 uppercase italic tracking-[0.2em] rounded-xl text-[10px]">
                              {fb.type.toUpperCase()}
                            </FFBadge>
                          </div>

                          <div className="bg-gray-50/50 rounded-[36px] p-8 border border-black/[0.02]">
                             <p className={`text-xl lg:text-2xl leading-relaxed italic line-clamp-3 ${!fb.isRead ? 'text-primary font-black' : 'text-gray-400 font-medium'}`}>
                               "{fb.message}"
                             </p>
                          </div>
                        </div>

                        <div className="mt-12 flex items-center justify-between pt-10 border-t border-black/[0.03] relative z-10">
                          <div className="flex items-center gap-6">
                            {fb.acknowledgedAt ? (
                              <div className="flex items-center gap-3 text-[11px] font-black text-success uppercase tracking-[0.3em] italic leading-none bg-success/5 px-5 py-2.5 rounded-full border border-success/10">
                                <ShieldCheck size={16} /> SECURE_ACK_ESTABLISHED
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 text-[11px] font-black text-accent uppercase tracking-[0.3em] italic leading-none animate-pulse bg-accent/5 px-5 py-2.5 rounded-full border border-accent/10">
                                <Clock size={16} /> PENDING_SYNC_AUTHORIZATION
                              </div>
                            )}
                          </div>
                          <div className="w-16 h-16 bg-white border border-black/[0.03] rounded-[24px] flex items-center justify-center text-gray-200 group-hover/card:bg-primary group-hover/card:text-white group-hover/card:scale-110 group-hover/card:rotate-12 transition-all duration-500 shadow-sm">
                             <ChevronRight size={32} />
                          </div>
                        </div>
                      </FFCard>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
           </div>
        </div>

        <footer className="text-center space-y-12 py-40 px-8 border-t border-black/[0.03]">
           <div className="flex items-center justify-center gap-10 text-primary/10">
              <div className="h-px w-32 bg-current" />
              <ShieldCheck size={40} />
              <div className="h-px w-32 bg-current" />
           </div>
           <div className="space-y-4">
              <p className="text-[12px] text-gray-400 font-black uppercase tracking-[0.8em] italic leading-relaxed">STATION_ENGINE // Intelligence Protocol Hub Matrix v4.4.2</p>
              <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.4em] italic opacity-40">Unauthorized access to intelligence telemetry is strictly prohibited</p>
           </div>
        </footer>
      </main>
    </div>
  );
};

export default FeedbackInboxScreen;
;
