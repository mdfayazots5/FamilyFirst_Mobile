import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  MessageSquare, 
  Send, 
  Star, 
  Flag, 
  Radio, 
  FileText, 
  Bell, 
  Calendar,
  AlertTriangle,
  User,
  Clock,
  Zap,
  ShieldCheck,
  Target,
  ArrowRight,
  Monitor,
  Fingerprint,
  Cpu,
  RefreshCcw,
  Layers,
  Activity,
  Command,
  Smartphone
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { FeedbackRepository, Feedback, FeedbackType } from '../../teacher/repositories/FeedbackRepository';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFBadge from '../../../shared/components/FFBadge';
import FFAvatar from '../../../shared/components/FFAvatar';

const FeedbackDetailScreen: React.FC = () => {
  const { feedbackId } = useParams<{ feedbackId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [responseText, setResponseText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!user?.familyId || !feedbackId) return;
      try {
        const inbox = await FeedbackRepository.getFeedbackInbox(user.familyId);
        const detail = inbox.find(f => f.id === feedbackId);
        setFeedback(detail || null);
      } catch (error) {
        console.error('Failed to fetch feedback detail', error);
      } finally {
        setTimeout(() => setIsLoading(false), 800);
      }
    };
    fetchDetail();
  }, [user?.familyId, feedbackId]);

  const handleAcknowledge = async () => {
    if (!feedbackId) return;
    setIsSubmitting(true);
    try {
      const updated = await FeedbackRepository.acknowledgeFeedback(feedbackId, responseText);
      setFeedback({ ...feedback!, ...updated });
    } catch (error) {
      console.error('Failed to acknowledge feedback', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#FDFCFB]">
        <div className="w-24 h-24 bg-primary/5 rounded-[32px] flex items-center justify-center text-primary mb-8 relative group">
           <div className="absolute inset-0 bg-primary/10 rounded-[32px] animate-ping opacity-20" />
           <RefreshCcw size={40} className="animate-spin" />
        </div>
        <div className="text-center space-y-3">
           <p className="text-[12px] font-black text-primary uppercase tracking-[0.5em] animate-pulse italic">DECRYPTING_SIGNAL_PKT...</p>
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-60">Authentication Protocol Secure</p>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#FDFCFB]">
        <div className="w-24 h-24 bg-alert/5 rounded-[32px] flex items-center justify-center text-alert mb-8 group">
           <AlertTriangle size={40} className="group-hover:rotate-12 transition-transform" />
        </div>
        <div className="text-center space-y-3">
           <p className="text-[12px] font-black text-alert uppercase tracking-[0.5em] italic">SIGNAL_LOST_404</p>
           <button onClick={() => navigate(-1)} className="text-[10px] text-primary font-black uppercase tracking-widest hover:underline decoration-2 underline-offset-4">Return to Hub</button>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-48">
      {/* Tactical Analysis Header */}
      <header className="bg-white/95 backdrop-blur-2xl p-8 lg:p-14 border-b border-black/[0.03] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="flex items-center gap-10">
            <div className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-primary/30 relative group overflow-hidden">
               <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 animate-pulse" />
               <Activity size={40} className="relative z-10" />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <FFBadge variant="primary" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none">SIGNAL_ANALYSIS</FFBadge>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">{feedback.type.toUpperCase()}_VECTOR_IDENTIFIED</p>
                </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none">
                Signal Insight
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

      <main className="max-w-5xl mx-auto p-8 lg:p-14 space-y-20 pt-16">
        {/* Source ID Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <FFCard className="p-10 border-none shadow-3xl shadow-black/[0.01] bg-white rounded-[48px] group transition-all hover:bg-gray-50/50">
              <div className="flex items-center gap-8">
                 <div className="relative">
                    <FFAvatar name={feedback.childName} size="xl" className="ring-8 ring-accent/5 rounded-[36px] shadow-2xl" />
                    <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-accent rounded-[14px] border-4 border-white shadow-xl flex items-center justify-center text-white scale-90">
                       <Fingerprint size={16} />
                    </div>
                 </div>
                 <div className="space-y-3">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] italic leading-none">PRIMARY_UNIT</p>
                    <h3 className="text-3xl font-display font-black text-primary uppercase italic tracking-tighter leading-none">{feedback.childName}</h3>
                 </div>
              </div>
           </FFCard>

           <FFCard className="p-10 border-none shadow-3xl shadow-black/[0.01] bg-white rounded-[48px] group transition-all hover:bg-gray-50/50">
              <div className="flex items-center gap-8">
                 <div className="w-20 h-20 bg-gray-50 rounded-[28px] flex items-center justify-center text-primary group-hover:rotate-6 transition-transform">
                    <User size={40} />
                 </div>
                 <div className="space-y-3">
                    <p className="text-[10px] font-black text-accent uppercase tracking-[0.4em] italic leading-none">FIELD_OBSERVER</p>
                    <h3 className="text-3xl font-display font-black text-primary uppercase italic tracking-tighter leading-none">{feedback.teacherName}</h3>
                 </div>
              </div>
           </FFCard>
        </div>

        {/* Urgent Escalation Overlay */}
        <AnimatePresence>
          {(feedback.severity === 'Urgent' || feedback.type === 'Urgent') && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="p-12 bg-alert text-white rounded-[56px] shadow-3xl shadow-alert/30 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-1000">
                <AlertTriangle size={160} />
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-12 relative z-10">
                <div className="w-24 h-24 bg-white/20 rounded-[32px] flex items-center justify-center backdrop-blur-md shadow-2xl">
                  <Bell size={48} fill="white" className="animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-4xl font-display font-black uppercase italic tracking-tighter leading-none">High-Priority Direct Attention</h4>
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] opacity-80 italic leading-none">Level 1 Escalation Protocol Initiated // Immediate Sync Required</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transmission Content Array */}
        <section className="space-y-12">
           <div className="flex items-center gap-8 px-4">
              <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
                 <Radio size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic leading-none">TRANSMISSION_PAYLOAD</h3>
              <div className="h-px flex-1 bg-primary/10" />
           </div>

          <FFCard className="p-16 border-none shadow-3xl shadow-black/[0.01] bg-white rounded-[72px] relative overflow-hidden group/payload">
            <div className="absolute top-0 right-0 p-16 opacity-[0.02] pointer-events-none group-hover/payload:rotate-12 transition-transform duration-2000">
               <Cpu size={320} strokeWidth={1} />
            </div>
            
            {feedback.type === 'WeeklySummary' && feedback.weeklyData ? (
              <div className="space-y-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="p-12 bg-success/5 rounded-[56px] border border-success/10 group/stat hover:bg-success/10 transition-all shadow-sm">
                    <p className="text-[11px] font-black text-success uppercase tracking-[0.4em] mb-6 italic leading-none">SYNC_RATE // ATTENDANCE</p>
                    <div className="flex items-end gap-2">
                       <p className="text-8xl font-display font-black text-primary tracking-tighter italic uppercase leading-none">{feedback.weeklyData.attendanceRate}</p>
                       <span className="text-4xl text-gray-200 font-display font-black mb-2">%</span>
                    </div>
                  </div>
                  <div className="p-12 bg-accent/5 rounded-[56px] border border-accent/10 group/stat hover:bg-accent/10 transition-all shadow-sm">
                    <p className="text-[11px] font-black text-accent uppercase tracking-[0.4em] mb-6 italic leading-none">OUTPUT // HOMEWORK</p>
                    <div className="flex items-end gap-2">
                       <p className="text-8xl font-display font-black text-primary tracking-tighter italic uppercase leading-none">{feedback.weeklyData.homeworkRate}</p>
                       <span className="text-4xl text-gray-200 font-display font-black mb-2">%</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-12 pt-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                         <Zap size={20} fill="currentColor" />
                      </div>
                      <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.4em] italic leading-none">STRATEGIC_ADVANTAGE_POINT</h4>
                    </div>
                    <p className="text-3xl lg:text-4xl font-display font-black text-primary leading-tight italic uppercase tracking-tighter">"{feedback.weeklyData.standout}"</p>
                  </div>
                  <div className="h-px bg-gray-50" />
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-alert/10 rounded-xl flex items-center justify-center text-alert">
                         <Target size={20} />
                      </div>
                      <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.4em] italic leading-none">RECALIBRATION_FOCUS_AREA</h4>
                    </div>
                    <p className="text-3xl lg:text-4xl font-display font-black text-primary leading-tight italic uppercase tracking-tighter">"{feedback.weeklyData.focusArea}"</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-12">
                <div className="flex items-center gap-6 text-primary/30">
                  <ShieldCheck size={28} />
                  <span className="text-[12px] font-black uppercase tracking-[0.4em] italic leading-none">INTELLIGENCE_PKT_DECRYPTED_READY</span>
                </div>
                <p className="text-4xl md:text-6xl font-display font-black text-primary leading-[1.05] tracking-tighter italic uppercase">
                  "{feedback.message}"
                </p>
                <div className="flex items-center gap-6 bg-gray-100/50 w-fit px-8 py-4 rounded-[24px] border border-black/[0.02] shadow-inner">
                  <Clock size={20} className="text-gray-300" />
                  <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] italic tabular-nums">LOG_TMSTAMP: {new Date(feedback.date).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </FFCard>
        </section>

        {/* Authorization Protocol Interface */}
        <section className="space-y-12">
          <div className="flex items-center gap-8 px-4">
              <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
                 <Command size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic leading-none">COMMAND_AUTHORIZATION</h3>
              <div className="h-px flex-1 bg-primary/10" />
           </div>

          <AnimatePresence mode="wait">
            {feedback.acknowledgedAt ? (
              <motion.div
                key="acknowledged"
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
              >
                <FFCard className="p-12 bg-success/5 border-2 border-success/10 rounded-[64px] shadow-3xl shadow-black/[0.01] relative overflow-hidden group/success">
                  <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover/success:scale-110 transition-transform duration-1000">
                     <ShieldCheck size={240} strokeWidth={1} />
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center gap-12 mb-12 relative z-10">
                    <div className="w-24 h-24 bg-success text-white rounded-[32px] flex items-center justify-center shadow-3xl shadow-success/30 transform group-hover/success:rotate-12 transition-transform duration-500">
                      <ShieldCheck size={48} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-4xl font-display font-black text-primary uppercase italic tracking-tighter leading-none">Signal Authorized</h4>
                      <div className="flex items-center gap-4">
                         <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] italic leading-none">
                           PKT_AUTH_TIMESTAMP: {new Date(feedback.acknowledgedAt).toLocaleString().toUpperCase()}
                         </p>
                      </div>
                    </div>
                  </div>
                  {feedback.parentResponse && (
                    <div className="p-12 bg-white rounded-[48px] border-2 border-success/10 shadow-3xl shadow-success/5 relative z-10">
                      <div className="flex items-center gap-4 mb-8">
                         <div className="w-4 h-0.5 bg-success rounded-full" />
                         <p className="text-[11px] font-black text-success uppercase tracking-[0.4em] italic leading-none">COMMAND_RESPONSE_LOG</p>
                      </div>
                      <p className="text-2xl lg:text-3xl font-display font-black text-primary italic uppercase leading-relaxed tracking-tight group-hover/success:text-success transition-colors">"{feedback.parentResponse}"</p>
                    </div>
                  )}
                </FFCard>
              </motion.div>
            ) : (
              <motion.div
                key="unacknowledged"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.8 } }}
                className="space-y-12"
              >
                <div className="relative group/box">
                  <div className="absolute left-10 top-12 text-primary/20 group-focus-within/box:text-primary group-focus-within/box:scale-110 transition-all duration-500">
                    <MessageSquare size={32} />
                  </div>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="ESTABLISH_RETURN_SIGNAL_PROTOCOL..."
                    className="w-full bg-white border border-black/[0.03] shadow-3xl shadow-black/[0.01] rounded-[64px] pl-24 pr-12 py-12 font-display font-black text-primary focus:outline-none focus:ring-8 focus:ring-primary/5 min-h-[240px] text-2xl lg:text-3xl placeholder:text-gray-100 transition-all italic leading-[1.3] uppercase"
                  />
                  <div className="absolute bottom-10 right-10">
                     <Smartphone size={32} className="text-gray-100 group-focus-within/box:text-primary/10 transition-colors" />
                  </div>
                </div>
                
                <FFButton 
                  className="w-full h-32 rounded-[48px] text-2xl font-black uppercase tracking-[0.4em] italic shadow-3xl shadow-primary/30 group/btn relative overflow-hidden" 
                  isLoading={isSubmitting}
                  onClick={handleAcknowledge}
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-6 relative z-10">
                     <ShieldCheck size={32} className="group-hover/btn:scale-110 group-hover/btn:rotate-12 transition-all" />
                     ACKNOWLEDGE_SIGNAL_PKT
                  </div>
                </FFButton>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <footer className="text-center space-y-12 py-40 px-8 border-t border-black/[0.03]">
           <div className="flex items-center justify-center gap-10 text-primary/10">
              <div className="h-px w-32 bg-current" />
              <ShieldCheck size={40} />
              <div className="h-px w-32 bg-current" />
           </div>
           <div className="space-y-4">
              <p className="text-[12px] text-gray-400 font-black uppercase tracking-[0.8em] italic leading-relaxed">STATION_ENGINE // Signal Analysis Terminal Matrix v4.4.2</p>
              <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.4em] italic opacity-40">Unauthorized access to signal telemetry is strictly prohibited</p>
           </div>
        </footer>
      </main>
    </div>
  );
};

export default FeedbackDetailScreen;
