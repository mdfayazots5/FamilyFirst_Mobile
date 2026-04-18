import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Camera, 
  CheckCircle2, 
  Clock, 
  Send, 
  X, 
  AlertCircle,
  Info,
  Loader2,
  ListChecks,
  Target,
  Zap,
  ShieldCheck,
  Activity,
  Cpu,
  Layers,
  ArrowRight,
  Fingerprint,
  CloudUpload,
  Sparkles,
  RefreshCcw,
  Trophy
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { TaskCompletionRepository, TaskCompletion } from '../repositories/TaskCompletionRepository';
import { S3UploadService } from '../../../core/services/S3UploadService';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFBadge from '../../../shared/components/FFBadge';

const TaskDetailScreen: React.FC = () => {
  const { completionId } = useParams<{ completionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [task, setTask] = useState<TaskCompletion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchTask = async () => {
      if (!user?.familyId || !user?.id || !completionId) return;
      try {
        const completions = await TaskCompletionRepository.getCompletions(
          user.familyId, 
          user.id, 
          new Date().toISOString().split('T')[0]
        );
        const detail = completions.find(c => c.id === completionId);
        setTask(detail || null);
      } catch (error) {
        console.error('Failed to fetch task detail', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTask();
  }, [user?.familyId, user?.id, completionId]);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!task || !completionId) return;
    
    setIsSubmitting(true);
    try {
      let photoUrl = task.photoUrl;
      
      if (capturedImage && fileInputRef.current?.files?.[0]) {
        photoUrl = await S3UploadService.uploadImage(
          fileInputRef.current.files[0],
          (progress) => setUploadProgress(progress)
        );
      }

      await TaskCompletionRepository.submitCompletion(task.taskId, {
        scheduledDate: new Date().toISOString().split('T')[0],
        photoUrl
      });
      
      navigate('/child');
    } catch (error) {
      console.error('Failed to submit task', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return (
     <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-12 text-center space-y-8">
        <motion.div 
           animate={{ rotate: 360 }}
           transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
           className="w-24 h-24 rounded-[32px] bg-primary/5 flex items-center justify-center text-primary"
        >
           <RefreshCcw size={40} />
        </motion.div>
        <p className="text-[12px] font-black uppercase tracking-[0.5em] text-primary/30 italic animate-pulse">INITIALIZING_MISSION_BRIEFING...</p>
     </div>
  );
  
  if (!task) return (
     <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-12 text-center space-y-8">
        <div className="w-24 h-24 rounded-[32px] bg-alert/5 flex items-center justify-center text-alert">
           <AlertCircle size={40} />
        </div>
        <p className="text-[12px] font-black uppercase tracking-[0.5em] text-alert animate-pulse">MISSION_PROTOCOL_NOT_FOUND.</p>
        <FFButton variant="outline" onClick={() => navigate(-1)}>RETURN_TO_HOME</FFButton>
     </div>
  );

  const isCompleted = task.status === 'approved' || task.status === 'submitted';

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-48">
      {/* Dynamic Mission Header */}
      <header className="bg-white/90 backdrop-blur-2xl p-8 lg:p-14 border-b border-black/[0.03] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="flex items-center gap-10">
            <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center text-white shadow-2xl transition-all duration-700 ${isCompleted ? 'bg-success shadow-success/30 rotate-3' : 'bg-primary shadow-primary/30 -rotate-3'}`}>
              <Target size={40} />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <FFBadge variant={isCompleted ? 'success' : 'primary'} size="sm" className="font-black px-4 py-1.5 italic tracking-widest uppercase uppercase">MISSION_BRIEF</FFBadge>
                <div className="flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full animate-pulse ${isCompleted ? 'bg-success' : 'bg-accent'}`} />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] italic">{task.timeBlock}_PROTOCOL</p>
                </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none">
                {task.taskName}
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
        {/* Intelligence Hub: Strategic Overview */}
        <section className="bg-primary p-16 rounded-[64px] text-white overflow-hidden relative shadow-2xl shadow-primary/30 group">
          <div className="absolute top-0 right-0 p-16 opacity-[0.05] group-hover:opacity-10 transition-opacity duration-1000 -rotate-12 translate-x-16 pointer-events-none">
            <Zap size={480} strokeWidth={1} fill="white" />
          </div>
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div className="space-y-12">
               <div className="flex items-center gap-8">
                 <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-accent shadow-inner backdrop-blur-xl border border-white/5">
                   <Clock size={32} />
                 </div>
                 <div>
                   <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40 mb-2 italic leading-none">TARGET_WINDOW</p>
                   <p className="text-3xl font-display font-black italic uppercase tracking-tighter leading-none">{task.timeBlock}_Execution</p>
                 </div>
               </div>
               
               <div className="flex items-center gap-8">
                 <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-success shadow-inner backdrop-blur-xl border border-white/5">
                   <Zap size={32} fill="currentColor" />
                 </div>
                 <div>
                   <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40 mb-2 italic leading-none">ASSET_REWARD</p>
                   <p className="text-3xl font-display font-black italic uppercase tracking-tighter text-accent leading-none">+{task.coinValue}.00_CREDITS</p>
                 </div>
               </div>
            </div>

            <div className="p-10 bg-white/5 rounded-[40px] border border-white/10 backdrop-blur-2xl shadow-inner space-y-6">
               <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                    <ShieldCheck size={16} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.4em] text-accent italic">VERIFICATION_MANDATE</span>
               </div>
               <p className="text-white/70 text-base font-medium leading-relaxed italic">
                 "Photographic evidence is strictly required for this protocol. Ensure frames are well-lit and unobstructed to avoid authorization delay or rejection."
               </p>
            </div>
          </div>
        </section>

        {/* Operating Procedures: Execution Path */}
        <section className="space-y-12">
           <div className="flex items-center gap-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/30 italic">OPERATING_PROCEDURES</h3>
            <div className="h-px flex-1 bg-primary/10" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { id: '01', title: 'Execution', desc: 'Perform the task with maximum strategic precision.', icon: Activity },
              { id: '02', title: 'Capture', desc: 'Sustain photographic proof for neural uplink.', icon: Camera },
              { id: '03', title: 'Uplink', desc: 'Submit data for final parent authorization.', icon: CloudUpload }
            ].map((step, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-10 bg-white rounded-[48px] border border-black/[0.02] shadow-2xl shadow-black/[0.01] hover:shadow-black/[0.03] hover:bg-primary/[0.01] transition-all group"
              >
                <div className="flex items-center justify-between mb-8">
                   <div className="text-6xl font-display font-black text-primary/5 italic leading-none group-hover:text-primary/10 transition-colors uppercase">{step.id}</div>
                   <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                      <step.icon size={24} />
                   </div>
                </div>
                <h4 className="text-2xl font-display font-black text-primary uppercase italic tracking-tighter mb-4">{step.title}</h4>
                <p className="text-sm text-gray-400 font-medium leading-relaxed italic">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Visual Proof: Real-Time Telemetry */}
        <section className="space-y-12">
          <div className="flex items-center gap-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/30 italic">VISUAL_TELEMETRY</h3>
            <div className="h-px flex-1 bg-primary/10" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
             <div className="lg:col-span-12">
               <motion.div 
                 whileHover={!isCompleted ? { scale: 1.01, y: -4 } : {}}
                 whileTap={!isCompleted ? { scale: 0.99 } : {}}
                 onClick={() => !isCompleted && fileInputRef.current?.click()}
                 className={`
                   aspect-video rounded-[64px] border-4 border-dashed relative overflow-hidden transition-all duration-700 shadow-2xl shadow-black/[0.02]
                   ${capturedImage || task.photoUrl 
                     ? 'border-transparent' 
                     : 'border-gray-100 bg-white hover:border-primary/20 cursor-pointer'}
                 `}
               >
                 {capturedImage || task.photoUrl ? (
                   <>
                     <img 
                       src={capturedImage || task.photoUrl} 
                       className="w-full h-full object-cover" 
                       alt="Proof" 
                       referrerPolicy="no-referrer"
                     />
                     {!isCompleted && (
                        <div className="absolute inset-0 bg-primary/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-md">
                           <div className="px-10 py-5 bg-white rounded-[24px] text-[12px] font-black uppercase tracking-[0.3em] text-primary shadow-2xl flex items-center gap-3 italic">
                             <RefreshCcw size={18} />
                             Replace_Vision_Asset
                           </div>
                        </div>
                     )}
                     <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between pointer-events-none">
                        <FFBadge variant="primary" className="backdrop-blur-xl bg-primary/80 border-white/20 px-6 py-2">SCAN_READY: 100%</FFBadge>
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl border border-white/40 flex items-center justify-center text-white">
                           <Fingerprint size={24} />
                        </div>
                     </div>
                   </>
                 ) : (
                   <div className="absolute inset-0 flex flex-col items-center justify-center gap-8">
                     <div className="w-32 h-32 bg-gray-50 rounded-[48px] flex items-center justify-center text-gray-200 border-2 border-dashed border-gray-100 animate-pulse">
                       <Camera size={56} />
                     </div>
                     <div className="text-center">
                        <p className="text-3xl font-display font-black text-primary uppercase italic tracking-tighter">Initialize_Lens</p>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] mt-3 italic">Tap_To_Trigger_Neural_Capture</p>
                     </div>
                   </div>
                 )}
               </motion.div>
             </div>
          </div>
          
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleCapture}
          />

          {/* Status Protocols: Authentication Stream */}
          <AnimatePresence>
            {task.status === 'submitted' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-12 bg-accent/5 rounded-[48px] border border-accent/10 flex items-center gap-10 shadow-xl shadow-accent/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.05] -rotate-12 translate-x-8 translate-y-[-10%]">
                   <CloudUpload size={160} />
                </div>
                <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center text-accent shadow-inner relative z-10">
                  <Loader2 size={40} className="animate-spin" />
                </div>
                <div className="relative z-10">
                  <h4 className="text-3xl font-display font-black text-primary uppercase italic tracking-tighter">In_Review</h4>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-2 italic">Awaiting high-level parental authorization signal.</p>
                </div>
              </motion.div>
            )}

            {task.status === 'flagged' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-12 bg-alert/5 rounded-[48px] border border-alert/10 flex items-center gap-10 shadow-xl shadow-alert/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.05] -rotate-12 translate-x-8 translate-y-[-10%]">
                   <AlertCircle size={160} />
                </div>
                <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center text-alert shadow-inner relative z-10">
                  <AlertCircle size={40} />
                </div>
                <div className="flex-1 relative z-10">
                  <h4 className="text-3xl font-display font-black text-primary uppercase italic tracking-tighter">Protocol_Deviation</h4>
                  <p className="text-base text-gray-500 font-medium mt-2 leading-relaxed italic">
                    "{task.reviewNote || 'The submitted proof did not meet strategic quality standards. Re-attempt protocol execution immediately.'}"
                  </p>
                </div>
              </motion.div>
            )}

            {task.status === 'approved' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-12 bg-success/5 rounded-[48px] border border-success/10 flex items-center gap-10 shadow-xl shadow-success/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.05] -rotate-12 translate-x-8 translate-y-[-10%]">
                   <Trophy size={160} />
                </div>
                <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center text-success shadow-inner relative z-10">
                  <CheckCircle2 size={40} />
                </div>
                <div className="relative z-10">
                  <h4 className="text-3xl font-display font-black text-primary uppercase italic tracking-tighter">Mission_Success</h4>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-2 italic">Status verified. Transfer of {task.coinValue}.00 credits confirmed.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Action Infrastructure: Uplink Cable */}
        {!isCompleted && (
          <div className="fixed bottom-0 left-0 right-0 p-8 lg:p-14 bg-white/90 backdrop-blur-2xl border-t border-black/[0.03] z-[50]">
            <div className="max-w-5xl mx-auto flex flex-col gap-8">
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <div className="flex items-center gap-3">
                       <CloudUpload size={14} className="text-primary animate-bounce" />
                       <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary italic">TRANSMITTING_UPLINK...</span>
                    </div>
                    <span className="text-[10px] font-black text-primary italic">{uploadProgress}%_SECURED</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner p-0.5">
                    <motion.div 
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
              <FFButton 
                variant="primary"
                className="w-full h-24 rounded-[32px] text-2xl font-black uppercase tracking-[0.3em] italic shadow-2xl shadow-primary/30 relative overflow-hidden group" 
                isLoading={isSubmitting}
                onClick={handleSubmit}
                disabled={!capturedImage && !task.photoUrl}
              >
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
                <span className="flex items-center gap-4 relative z-10">
                   <Send size={28} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                   UPLINK_PROTOCOL_COMPLETION
                </span>
              </FFButton>
            </div>
          </div>
        )}
      </main>

       <footer className="text-center space-y-6 py-24 px-8">
         <div className="flex items-center justify-center gap-4 text-primary/10">
            <div className="h-px w-16 bg-current" />
            <Cpu size={24} />
            <div className="h-px w-16 bg-current" />
         </div>
         <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.5em] italic">MISSION_ENGINE // FamilyFirst Strategic Intelligence v2.1.0</p>
      </footer>
    </div>
  );
};

export default TaskDetailScreen;
