import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Search, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Clock,
  RefreshCcw,
  Star,
  Flag,
  Eye,
  BookOpen,
  Bell,
  Calendar,
  MoreVertical,
  ShieldCheck,
  Activity,
  Cpu,
  Layers,
  Zap,
  Monitor,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { FeedbackRepository, Feedback, FeedbackType } from '../repositories/FeedbackRepository';
import FFCard from '../../../shared/components/FFCard';
import FFBadge from '../../../shared/components/FFBadge';
import FFAvatar from '../../../shared/components/FFAvatar';

const FeedbackHistoryScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchHistory = useCallback(async () => {
    if (!user?.familyId || !user?.id) return;
    setIsLoading(true);
    try {
      const data = await FeedbackRepository.getFeedbackHistory(user.familyId, user.id);
      setFeedbacks(data);
    } catch (error) {
      console.error('Failed to fetch feedback history', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.familyId, user?.id]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDelete = async (id: string) => {
    if (!user?.familyId) return;
    if (!window.confirm('Are you sure you want to delete this archived intelligence entry?')) return;
    
    try {
      await FeedbackRepository.deleteFeedback(user.familyId, id);
      setFeedbacks(feedbacks.filter(f => f.id !== id));
    } catch (error) {
      console.error('Failed to delete feedback', error);
    }
  };

  const getIcon = (type: FeedbackType) => {
    switch (type) {
      case 'Appreciation': return <Star size={18} />;
      case 'Complaint': return <Flag size={18} />;
      case 'Observation': return <Eye size={18} />;
      case 'Homework': return <BookOpen size={18} />;
      case 'Urgent': return <Bell size={18} />;
      case 'WeeklySummary': return <Calendar size={18} />;
    }
  };

  const isEditable = (date: string) => {
    const feedbackDate = new Date(date);
    const now = new Date();
    const diffHours = (now.getTime() - feedbackDate.getTime()) / (1000 * 60 * 60);
    return diffHours < 24;
  };

  const filteredFeedbacks = feedbacks.filter(fb => 
    fb.childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fb.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fb.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-12 text-center space-y-8">
        <motion.div 
           animate={{ rotate: 360 }}
           transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
           className="w-24 h-24 rounded-[32px] bg-primary/5 flex items-center justify-center text-primary shadow-inner"
        >
           <RefreshCcw size={40} />
        </motion.div>
        <p className="text-[12px] font-black uppercase tracking-[0.5em] text-primary/40 italic animate-pulse">INTELLIGENCE_RETRIEVAL_v4...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-48 font-sans overflow-hidden">
      {/* Intelligence Archive Header */}
      <header className="bg-white/95 backdrop-blur-2xl p-8 lg:p-14 border-b border-black/[0.03] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="flex items-center gap-10">
            <button 
              onClick={() => navigate(-1)}
              className="w-16 h-16 bg-white rounded-[24px] border border-black/5 text-gray-300 hover:text-primary transition-all shadow-sm flex items-center justify-center group active:scale-90"
            >
              <ArrowLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <FFBadge variant="accent" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none">INTELLIGENCE_ARCHIVE</FFBadge>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none whitespace-nowrap">OBSERVATION_TELEMETRY_ONLINE</p>
                </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none whitespace-nowrap">
                Command <span className="text-accent underline decoration-accent/20 decoration-8 underline-offset-8">ARCHIVE</span>
              </h1>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-12">
             <div className="relative w-full md:w-80">
                <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/20" />
                <input 
                  type="text"
                  placeholder="FILTER_LOGS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-16 bg-gray-50/50 border border-black/[0.03] rounded-[24px] pl-14 pr-6 font-black text-[11px] uppercase tracking-widest focus:bg-white focus:border-primary/10 transition-all outline-none italic placeholder:text-gray-200"
                />
             </div>
             <div className="hidden xl:flex items-center gap-12">
                <div className="text-right">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] italic mb-1">TOTAL_RECORDS</p>
                    <p className="text-primary font-display font-black text-4xl italic uppercase leading-none">{feedbacks.length}</p>
                </div>
                <div className="w-px h-12 bg-black/5" />
                <div className="text-right">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] italic mb-1">SYNC_SUCCESS</p>
                    <p className="text-success font-display font-black text-4xl italic uppercase leading-none">{feedbacks.filter(f => f.acknowledgedAt).length}</p>
                </div>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-8 lg:p-14 space-y-12 relative">
        <div className="absolute inset-0 opacity-[0.01] pointer-events-none overflow-hidden">
           <Layers size={800} className="absolute -top-40 -left-40 rotate-12" />
        </div>

        <div className="flex items-center gap-4 px-4 opacity-30 relative z-10">
           <p className="text-[11px] font-black uppercase tracking-[0.5em] text-primary italic whitespace-nowrap">MISSION_RECORDS_SEQUENTIAL_DECRYPT</p>
           <div className="h-px flex-1 bg-primary/20" />
        </div>

        {filteredFeedbacks.length === 0 ? (
          <div className="bg-white rounded-[64px] p-24 border border-dashed border-black/5 text-center space-y-10 shadow-inner relative z-10">
            <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center text-gray-200 mx-auto shadow-inner group">
               <Monitor size={48} strokeWidth={1} className="group-hover:rotate-12 transition-transform" />
            </div>
            <div>
               <h3 className="text-3xl font-display font-black text-gray-300 uppercase italic tracking-tighter mb-2 leading-none">Anomaly: Records Clear</h3>
               <p className="text-[11px] font-black text-gray-200 uppercase tracking-[0.4em] italic mt-4 leading-none">NO_MATCHING_TELEMETRY_FOUND</p>
            </div>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-accent transition-colors underline decoration-primary/20 underline-offset-4 italic"
              >
                RESET_FILTER_PARAMETERS
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-10 relative z-10">
            {filteredFeedbacks.map((fb, idx) => (
              <motion.div
                key={fb.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group"
              >
                <FFCard className="relative p-0 overflow-hidden border-none shadow-3xl shadow-black/[0.01] hover:shadow-primary/5 hover:translate-x-2 transition-all rounded-[56px] bg-white">
                  <div className="absolute top-0 right-0 p-12 opacity-[0.01] pointer-events-none group-hover:rotate-12 transition-transform duration-1000 group-hover:scale-110">
                     <Cpu size={160} />
                  </div>

                  <div className="p-10 lg:p-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                      <div className="flex items-center gap-10">
                        <div className="relative">
                           <FFAvatar name={fb.childName} size="xl" className="border-4 border-white shadow-xl ring-6 ring-gray-50 group-hover:scale-105 transition-transform duration-700" />
                           <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent rounded-lg flex items-center justify-center text-white text-[8px] font-black italic shadow-lg">
                              ID
                           </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] italic mb-1.5 leading-none">LOG_REF: {fb.id.slice(0, 12).toUpperCase()}</p>
                          <h4 className="font-display font-black text-4xl text-primary italic uppercase tracking-tighter mb-3 leading-none group-hover:text-accent transition-colors">{fb.childName}</h4>
                          <div className="flex items-center gap-4">
                             <div className="px-4 py-1.5 bg-gray-50 rounded-full border border-black/5 flex items-center gap-2">
                                <Clock size={12} className="text-gray-400 italic" />
                                <span className="text-[10px] text-gray-300 font-black uppercase tracking-widest italic leading-none">
                                  {new Date(fb.date).toLocaleDateString()} // {new Date(fb.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                             </div>
                             <div className="px-4 py-1.5 bg-primary/5 rounded-full border border-primary/10 flex items-center gap-2 text-primary">
                                <Zap size={12} fill="currentColor" />
                                <span className="text-[10px] font-black uppercase italic tracking-widest leading-none">{fb.type.toUpperCase()}</span>
                             </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 self-end md:self-center">
                        <div className={`w-14 h-14 rounded-[20px] bg-gray-50 flex items-center justify-center text-primary/40 shadow-inner group-hover:scale-110 transition-transform group-hover:text-primary border border-black/[0.02]`}>
                          {getIcon(fb.type)}
                        </div>
                        {fb.acknowledgedAt && (
                          <div className="w-14 h-14 rounded-[20px] bg-success text-white flex items-center justify-center shadow-2xl shadow-success/30 group-hover:rotate-12 transition-transform">
                             <CheckCircle2 size={24} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50/50 p-10 lg:p-12 rounded-[44px] border border-black/[0.02] shadow-inner mb-10 relative group/msg">
                       <p className="text-lg lg:text-2xl font-medium text-gray-500 italic leading-relaxed relative z-10">
                          "{fb.message}"
                       </p>
                       <div className="absolute top-8 left-8 opacity-[0.02] group-hover/msg:opacity-[0.05] transition-opacity pointer-events-none">
                           <Layers size={48} />
                       </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-black/[0.03] pt-10">
                      <div className="flex items-center gap-4">
                        {fb.acknowledgedAt ? (
                          <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                             <span className="text-[11px] font-black text-success uppercase tracking-[0.4em] italic leading-none">INTELLIGENCE_VERIFIED</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-alert animate-ping" />
                             <span className="text-[11px] font-black text-alert uppercase tracking-[0.4em] italic leading-none">AWAITING_RECEPTION</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-4">
                        {isEditable(fb.date) ? (
                          <>
                            <button 
                              onClick={() => navigate(`/teacher/feedback/edit/${fb.id}`)}
                              className="w-16 h-16 bg-white border border-black/5 rounded-[24px] flex items-center justify-center text-gray-300 hover:text-primary hover:shadow-xl hover:shadow-primary/5 transition-all active:scale-90"
                            >
                              <Edit3 size={24} />
                            </button>
                            <button 
                              onClick={() => handleDelete(fb.id)}
                              className="w-16 h-16 bg-white border border-black/5 rounded-[24px] flex items-center justify-center text-gray-300 hover:text-alert hover:shadow-xl hover:shadow-alert/5 transition-all active:scale-90"
                            >
                              <Trash2 size={24} />
                            </button>
                          </>
                        ) : (
                           <div className="px-8 h-16 bg-gray-50 rounded-[28px] flex items-center justify-center border border-black/[0.05] opacity-40">
                              <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none">ARCHIVE_LOCKED</span>
                           </div>
                        )}
                      </div>
                    </div>
                  </div>
                </FFCard>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <footer className="text-center space-y-12 py-40 px-8 border-t border-black/[0.03]">
           <div className="flex items-center justify-center gap-10 text-primary/10">
              <div className="h-px w-32 bg-current" />
              <ShieldCheck size={40} />
              <div className="h-px w-32 bg-current" />
           </div>
           <div className="space-y-4">
              <p className="text-[12px] text-gray-400 font-black uppercase tracking-[0.8em] italic leading-relaxed">STATION_ENGINE // Intelligence Archive Matrix v4.4.2</p>
              <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.4em] italic opacity-40">All intelligence payloads are mirrored across authoritative central redundant grids</p>
           </div>
      </footer>
    </div>
  );
};

export default FeedbackHistoryScreen;
