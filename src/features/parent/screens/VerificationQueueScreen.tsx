import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Camera, 
  ChevronRight,
  Clock,
  Sparkles,
  Zap,
  ShieldCheck,
  Eye,
  AlertTriangle,
  X,
  RefreshCcw,
  Cpu,
  Layers,
  ArrowRight,
  Fingerprint,
  Radar,
  Network,
  Command,
  Activity,
  Maximize2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { TaskCompletionRepository, TaskCompletion } from '../../child/repositories/TaskCompletionRepository';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFBadge from '../../../shared/components/FFBadge';
import FFAvatar from '../../../shared/components/FFAvatar';
import FFEmptyState from '../../../shared/components/FFEmptyState';

const VerificationQueueScreen: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [queue, setQueue] = useState<TaskCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBatchApproving, setIsBatchApproving] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user?.familyId) return;
    setIsLoading(true);
    try {
      const data = await TaskCompletionRepository.getVerificationQueue(user.familyId);
      setQueue(data);
    } catch (error) {
      console.error('Failed to fetch verification queue', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.familyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleReview = async (id: string, status: 'approved' | 'flagged') => {
    try {
      await TaskCompletionRepository.reviewCompletion(id, status);
      setQueue(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Failed to review task', error);
    }
  };

  const handleApproveAll = async () => {
    if (!user?.familyId) return;
    setIsBatchApproving(true);
    try {
      await TaskCompletionRepository.approveAll(user.familyId);
      setQueue([]);
    } catch (error) {
      console.error('Failed to approve all', error);
    } finally {
      setIsBatchApproving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-12 text-center space-y-8">
        <motion.div 
           animate={{ rotate: 360 }}
           transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
           className="w-24 h-24 rounded-[32px] bg-success/5 flex items-center justify-center text-success shadow-inner"
        >
           <RefreshCcw size={40} />
        </motion.div>
        <p className="text-[12px] font-black uppercase tracking-[0.5em] text-success/40 italic animate-pulse">SCANNING_INBOUND_TELEMETRY...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-48 overflow-hidden">
      {/* Tactical Header */}
      <header className="bg-white/90 backdrop-blur-2xl p-8 lg:p-14 border-b border-black/[0.03] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="flex items-center gap-10">
            <div className="w-24 h-24 bg-success rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-success/20 relative group overflow-hidden">
              <div className="absolute inset-x-0 bottom-0 h-1 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
              <ShieldCheck size={40} className="relative z-10 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <FFBadge variant="success" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none">VERIFICATION_STATION</FFBadge>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none whitespace-nowrap">QUALITY_CONTROL_ACTIVE</p>
                </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none whitespace-nowrap">
                Review <span className="text-success underline decoration-success/20 decoration-8 underline-offset-8">STATION</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
             {queue.length > 0 && (
                <button 
                  onClick={handleApproveAll}
                  disabled={isBatchApproving}
                  className="h-16 px-10 bg-primary text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-4 hover:bg-primary/90 transition-all shadow-2xl shadow-primary/20 italic group active:scale-95 whitespace-nowrap"
                >
                  {isBatchApproving ? <RefreshCcw className="animate-spin" size={20} /> : <Sparkles size={20} className="group-hover:scale-125 transition-transform" />}
                  MASS_PROTOCOL_EXECUTION
                </button>
              )}
            <button 
              onClick={() => navigate(-1)}
              className="w-16 h-16 bg-white rounded-[24px] border border-black/5 text-gray-300 hover:text-primary transition-all shadow-sm flex items-center justify-center group active:scale-90"
            >
              <ArrowLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-8 lg:p-14 space-y-20 pt-16 relative">
        <div className="absolute top-0 right-0 p-40 opacity-[0.01] pointer-events-none rotate-45 transform translate-x-1/2">
           <Radar size={800} strokeWidth={1} />
        </div>

        {queue.length === 0 ? (
          <div className="py-24 relative z-10">
             <FFEmptyState 
              title="INBOUND_ARRAY_CLEAR"
              message="Operational telemetry indicates no pending verification requests in the current active cycle. System resting."
              icon={
                <div className="w-32 h-32 bg-success/5 rounded-[48px] flex items-center justify-center text-success shadow-inner relative overflow-hidden group">
                   <div className="absolute inset-0 bg-success/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                   <ShieldCheck size={64} strokeWidth={1} />
                </div>
              }
            />
          </div>
        ) : (
          <div className="space-y-16 relative z-10">
            <div className="flex items-center gap-8">
              <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary group-hover:rotate-90 transition-transform">
                 <Radar size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic leading-none">ACTIVE_AUTHORIZATION_MAP ({queue.length})</h3>
              <div className="h-px flex-1 bg-primary/10" />
            </div>

            <AnimatePresence mode="popLayout">
              {queue.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.1, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                  className="group"
                >
                  <FFCard className="p-0 overflow-hidden border-none shadow-3xl shadow-black/[0.01] bg-white rounded-[64px] relative">
                    <div className="p-10 lg:p-12 flex flex-col md:flex-row md:items-center justify-between border-b border-black/[0.03] relative z-10 gap-8">
                      <div className="flex items-center gap-10">
                        <div className="relative">
                           <FFAvatar name={item.childProfileId} size="xl" className="ring-8 ring-gray-50 shadow-inner group-hover:scale-105 transition-transform duration-700" />
                           <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-success rounded-2xl border-4 border-white flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform">
                              <Fingerprint size={18} />
                           </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-4 mb-3">
                             <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] italic leading-none">ORIGIN_UNIT: #{item.id.slice(0, 12).toUpperCase()}</p>
                             <div className="w-1 h-1 rounded-full bg-gray-200" />
                             <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest tabular-nums italic">{new Date(item.submittedAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                          </div>
                          <h4 className="text-4xl font-display font-black text-primary uppercase italic tracking-tighter leading-none group-hover:text-success transition-colors mb-4">{item.taskName}</h4>
                          <div className="flex items-center gap-4">
                             <div className="px-5 py-2 bg-gray-50 rounded-full border border-black/5 flex items-center gap-3">
                                <Clock size={12} className="text-gray-400" />
                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] italic leading-none">{item.timeBlock}</span>
                             </div>
                             <div className="px-5 py-2 bg-success/5 border border-success/10 rounded-full flex items-center gap-3">
                                <Zap size={14} className="text-success" fill="currentColor" />
                                <span className="text-[10px] text-success font-black uppercase tracking-[0.2em] italic leading-none">+{item.coinValue} CREDITS</span>
                             </div>
                          </div>
                        </div>
                      </div>
                      <div className="hidden lg:block">
                         <div className="w-28 h-28 bg-gray-50/50 rounded-[40px] flex flex-col items-center justify-center border border-black/[0.02] shadow-inner group-hover:bg-white transition-all duration-700 group-hover:shadow-xl group-hover:shadow-success/10 group-hover:-translate-y-1">
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none mb-2 italic">VALIDITY</p>
                            <p className="text-4xl font-display font-black text-success italic leading-none">98.4%</p>
                         </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-5 min-h-[520px]">
                       <div className="xl:col-span-3 h-full relative group/image overflow-hidden bg-gray-100/50 flex items-center justify-center min-h-[400px]">
                          {item.photoUrl ? (
                            <>
                              <img 
                                src={item.photoUrl} 
                                alt="Visual Proof" 
                                className="w-full h-full object-cover transition-transform duration-[4000ms] group-hover/image:scale-105" 
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/image:opacity-100 transition-all duration-1000 flex items-center justify-center backdrop-blur-[6px]">
                                <button 
                                  onClick={() => setSelectedPhoto(item.photoUrl || null)}
                                  className="w-24 h-24 bg-white rounded-[40px] flex items-center justify-center text-primary shadow-3xl transform scale-50 group-hover/image:scale-100 transition-all duration-500 hover:bg-success hover:text-white group/btn hover:rotate-90 hover:rounded-[32px]"
                                >
                                  <Maximize2 size={32} className="group-hover/btn:scale-110 transition-transform" />
                                </button>
                              </div>
                              <div className="absolute top-10 left-10 pointer-events-none group-hover/image:translate-y-[-4px] transition-transform duration-700">
                                <FFBadge variant="accent" size="sm" className="font-black backdrop-blur-3xl bg-white/40 shadow-2xl py-2.5 px-8 border border-white/20 text-[12px] uppercase tracking-[0.4em] italic rounded-2xl">VISUAL_TELEMETRY_v1.0</FFBadge>
                              </div>
                              <div className="absolute bottom-10 left-10 pointer-events-none opacity-0 group-hover/image:opacity-100 transition-opacity translate-y-4 group-hover/image:translate-y-0 duration-1000">
                                 <div className="flex gap-3">
                                    {[1,2,3,4].map(i => <div key={i} className="w-2 h-2 rounded-full bg-white/50 animate-pulse" />)}
                                 </div>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center text-center space-y-8">
                               <div className="w-32 h-32 bg-white rounded-[48px] flex items-center justify-center text-gray-100 shadow-inner group-hover:scale-110 transition-transform duration-1000 group-hover:rotate-12">
                                 <Camera size={64} strokeWidth={1} />
                               </div>
                               <p className="text-[12px] font-black text-gray-300 uppercase tracking-[0.6em] italic leading-none">NO_VISUAL_TELEMETRY</p>
                            </div>
                          )}
                        </div>

                      <div className="xl:col-span-2 p-12 lg:p-16 flex flex-col justify-between space-y-16 bg-white relative overflow-hidden group/controls border-l border-black/[0.03]">
                         <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none translate-x-12 translate-y-[-20%] group-hover:rotate-45 transition-transform duration-[6000ms]">
                            <Network size={280} strokeWidth={1} />
                         </div>
                         
                         <div className="space-y-12 relative z-10">
                           <div className="flex items-center gap-6">
                              <div className="w-14 h-14 bg-alert/5 rounded-2xl flex items-center justify-center text-alert shadow-inner group-hover:scale-110 transition-transform">
                                 <AlertTriangle size={28} />
                              </div>
                              <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.5em] text-alert/40 italic leading-none mb-3">INTEGRITY_STAMP_REQUIRED</p>
                                <span className="text-2xl font-display font-black text-primary uppercase italic tracking-tighter leading-none">AUTHORIZATION_FLOW</span>
                              </div>
                           </div>
                           <p className="text-2xl text-gray-400 font-medium leading-relaxed italic pr-4">
                             "Verify all tactical parameters for <span className="text-primary font-black underline decoration-primary/20 decoration-8 underline-offset-8 transition-colors group-hover/controls:text-success">{item.taskName}</span> are finalized before mission completion authorization."
                           </p>
                         </div>

                         <div className="flex flex-col gap-6 relative z-10">
                            <button
                              onClick={() => handleReview(item.id, 'approved')}
                              className="w-full h-24 bg-primary text-white rounded-[32px] shadow-3xl shadow-primary/30 text-[14px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-6 transform hover:translate-y-[-4px] transition-all italic active:scale-95 group/auth hover:bg-success"
                            >
                              <ShieldCheck size={32} className="group-hover/auth:scale-110 transition-transform" /> 
                              AUTHORIZE_DEPLOYMENT
                            </button>
                            <button
                              onClick={() => handleReview(item.id, 'flagged')}
                              className="w-full h-20 bg-white text-alert rounded-[28px] border-2 border-alert/10 text-[11px] font-black uppercase tracking-[0.5em] flex items-center justify-center gap-6 hover:bg-alert hover:text-white transition-all italic shadow-sm active:scale-95 group/flag hover:border-alert"
                            >
                              <XCircle size={24} className="group-hover/flag:rotate-180 transition-transform duration-700" /> 
                              FLAG_STATION_ERR_v4
                            </button>
                         </div>
                      </div>
                    </div>
                  </FFCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-primary/40 backdrop-blur-[60px] z-[200] flex items-center justify-center p-8 lg:p-24"
            onClick={() => setSelectedPhoto(null)}
          >
            <button 
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-12 right-12 w-20 h-20 bg-white text-primary rounded-[32px] shadow-3xl hover:translate-y-[-4px] transition-all flex items-center justify-center group z-10 active:scale-90"
            >
              <X size={32} className="group-hover:rotate-90 transition-transform duration-500" />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, scaleZ: 0.5 }}
              animate={{ scale: 1, opacity: 1, scaleZ: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="max-w-7xl w-full h-full relative rounded-[80px] overflow-hidden shadow-4xl border-[12px] border-white/10"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-16 left-16 z-10 pointer-events-none space-y-6">
                 <FFBadge variant="accent" size="sm" className="font-black backdrop-blur-3xl bg-white/60 shadow-2xl py-4 px-10 border-none text-[14px] uppercase tracking-[0.6em] italic rounded-[28px]">MISSION_CRITICAL_INSPECTION</FFBadge>
                 <div className="flex gap-3">
                    {[1,2,3,4,5,6].map(i => <div key={i} className="w-2.5 h-2.5 rounded-full bg-white/60 animate-pulse" />)}
                 </div>
              </div>
              <img 
                src={selectedPhoto} 
                alt="Full Tactical Proof" 
                className="w-full h-full object-contain bg-black/40" 
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

       <footer className="text-center space-y-12 py-48 px-8 border-t border-black/[0.03]">
         <div className="flex items-center justify-center gap-10 text-primary/10">
            <div className="h-px w-32 bg-current" />
            <Command size={40} />
            <div className="h-px w-32 bg-current" />
         </div>
         <div className="space-y-6">
            <p className="text-[12px] text-gray-400 font-black uppercase tracking-[1em] italic leading-relaxed">AUDIT_STATION // Centralized Verification Command v4.4.8</p>
            <p className="text-[11px] text-gray-300 font-black uppercase tracking-[0.5em] italic opacity-40">System state is authoritative and immutable once finalized</p>
         </div>
      </footer>
    </div>
  );
};

export default VerificationQueueScreen;
