import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Send,
  Info,
  WifiOff,
  X,
  Clock,
  ShieldCheck,
  Activity,
  Cpu,
  Layers,
  Fingerprint,
  Monitor
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { 
  AttendanceRepository, 
  AttendanceRecord, 
  AttendanceStatus,
  CommentTemplate 
} from '../repositories/AttendanceRepository';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFBadge from '../../../shared/components/FFBadge';
import AttendanceChildRow from '../widgets/AttendanceChildRow';
import CommentTemplateSheet from '../widgets/CommentTemplateSheet';

const AttendanceMarkingScreen: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [templates, setTemplates] = useState<CommentTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [isCommentSheetOpen, setIsCommentSheetOpen] = useState(false);
  const [isConfirmSheetOpen, setIsConfirmSheetOpen] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchData = useCallback(async () => {
    if (!user?.familyId || !sessionId) return;
    try {
      const [recordList, templateList] = await Promise.all([
         AttendanceRepository.getSessionRecords(user.familyId, sessionId),
         AttendanceRepository.getCommentTemplates(user.familyId)
      ]);
      setRecords(recordList);
      setTemplates(templateList);
    } catch (error) {
      console.error('Failed to fetch attendance data', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.familyId, sessionId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleStatus = (recordId: string) => {
    const statusCycle: AttendanceStatus[] = ['Present', 'Absent', 'Late', 'LeftEarly'];
    setRecords(prev => prev.map(rec => {
      if (rec.id === recordId) {
        const currentIndex = statusCycle.indexOf(rec.status);
        const nextIndex = (currentIndex + 1) % statusCycle.length;
        return { ...rec, status: statusCycle[nextIndex] };
      }
      return rec;
    }));
  };

  const saveComment = (comment: string) => {
    if (!selectedRecordId) return;
    setRecords(prev => prev.map(rec => 
      rec.id === selectedRecordId ? { ...rec, comment } : rec
    ));
    setSelectedRecordId(null);
  };

  const handleSubmit = async () => {
    if (!sessionId) return;
    setIsSubmitting(true);
    try {
      if (isOffline) {
        // Simulate offline storage
        localStorage.setItem(`offline_attendance_${sessionId}`, JSON.stringify(records));
        alert('Offline: Attendance saved locally. It will sync when you are back online.');
      } else {
        await AttendanceRepository.submitAttendance(sessionId, records);
      }
      navigate('/teacher');
    } catch (error) {
      console.error('Failed to submit attendance', error);
    } finally {
      setIsSubmitting(false);
      setIsConfirmSheetOpen(false);
    }
  };

  const stats = {
    present: records.filter(r => r.status === 'Present').length,
    absent: records.filter(r => r.status === 'Absent').length,
    late: records.filter(r => r.status === 'Late').length,
    leftEarly: records.filter(r => r.status === 'LeftEarly').length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-12 text-center space-y-8">
        <motion.div 
           animate={{ rotate: 360 }}
           transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
           className="w-24 h-24 rounded-[32px] bg-primary/5 flex items-center justify-center text-primary shadow-inner"
        >
           <Activity size={40} />
        </motion.div>
        <p className="text-[12px] font-black uppercase tracking-[0.5em] text-primary/40 italic animate-pulse">CORE_REGISTRY_LOAD_v4...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-48">
      {/* Precision Evaluation Header */}
      <header className="bg-white/95 backdrop-blur-2xl p-8 lg:p-14 border-b border-black/[0.03] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="flex items-center gap-10">
            <button 
              onClick={() => navigate(-1)}
              className="w-16 h-16 bg-white rounded-[24px] border border-black/5 text-gray-300 hover:text-primary transition-all shadow-sm flex items-center justify-center group active:scale-90"
            >
              <ArrowLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <FFBadge variant="accent" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none">PERSONNEL_EVALUATION</FFBadge>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none whitespace-nowrap">REGISTRY_PROTOCOL_ACTIVE</p>
                </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none whitespace-nowrap">
                Attendance <span className="text-accent underline decoration-accent/20 decoration-8 underline-offset-8">LOG</span>
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            {[
              { label: 'PRESENT_TARGETS', count: stats.present, color: 'success' },
              { label: 'ABSENT_SIGNALS', count: stats.absent, color: 'alert' },
              { label: 'EXCEPTION_MATRIX', count: stats.late + stats.leftEarly, color: 'accent' }
            ].map((stat, i) => (
              <FFCard key={i} className="px-6 py-4 bg-white border-black/[0.03] rounded-3xl shadow-sm flex items-center gap-5 hover:translate-y--1 transition-all">
                <div className={`w-3 h-3 rounded-full bg-${stat.color} ${stat.color === 'success' ? 'animate-pulse' : ''} shadow-[0_0_12px_rgba(0,0,0,0.1)]`} />
                <div className="flex flex-col">
                  <span className="text-3xl font-display font-black text-primary italic leading-none mb-1">{stat.count}</span>
                  <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-none whitespace-nowrap">{stat.label}</span>
                </div>
              </FFCard>
            ))}
          </div>
        </div>

        {isOffline && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="flex items-center gap-3 px-8 py-4 bg-alert text-white rounded-[24px] mt-8 shadow-2xl shadow-alert/20"
          >
            <WifiOff size={18} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] italic leading-none">LOCAL_CACHE_MODE_ACTIVE // SYNC_PENDING_PROTOCOL</span>
          </motion.div>
        )}
      </header>

      <main className="max-w-4xl mx-auto p-8 lg:p-14 space-y-8">
        {/* Personnel Registry */}
        <div className="flex items-center gap-4 px-4 opacity-30">
           <p className="text-[11px] font-black uppercase tracking-[0.5em] text-primary italic whitespace-nowrap">PERSONNEL_REGISTRY_v4.2</p>
           <div className="h-px flex-1 bg-primary/20" />
        </div>
        
        <div className="space-y-6">
          {records.map((record) => (
            <AttendanceChildRow
              key={record.id}
              name={record.childName}
              avatarUrl={record.avatarUrl}
              status={record.status}
              comment={record.comment}
              onStatusToggle={() => toggleStatus(record.id)}
              onCommentClick={() => {
                setSelectedRecordId(record.id);
                setIsCommentSheetOpen(true);
              }}
            />
          ))}
        </div>
      </main>

      {/* Floating Tactical Formalization Cabinet */}
      <div className="fixed bottom-0 left-0 right-0 p-8 lg:p-14 bg-white/80 backdrop-blur-2xl border-t border-black/[0.03] z-50">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="hidden md:block">
              <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.4em] italic mb-1">FINAL_SYNC_EXPECTED</p>
              <h4 className="text-primary font-display font-black text-xl italic uppercase tracking-tighter">{records.length} PERSONNEL_REPORTS</h4>
           </div>
           <FFButton 
             className="w-full md:w-auto h-20 px-16 rounded-[36px] text-[12px] font-black uppercase tracking-[0.5em] shadow-3xl shadow-primary/30 group active:scale-95 italic transition-all" 
             icon={<Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
             onClick={() => setIsConfirmSheetOpen(true)}
           >
             FORMALIZE_RECORDS
           </FFButton>
        </div>
      </div>

      {/* Comment Sheet */}
      <CommentTemplateSheet
        isOpen={isCommentSheetOpen}
        onClose={() => setIsCommentSheetOpen(false)}
        templates={templates}
        onSave={saveComment}
        initialComment={records.find(r => r.id === selectedRecordId)?.comment}
      />

      {/* Tactical Confirmation Modal */}
      <AnimatePresence>
        {isConfirmSheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfirmSheetOpen(false)}
              className="fixed inset-0 bg-primary/60 z-[60] backdrop-blur-md"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[54px] z-[70] p-12 lg:p-20 shadow-[-20px_0_60px_rgba(0,0,0,0.2)]"
            >
              <div className="max-w-2xl mx-auto space-y-12">
                <div className="flex items-center gap-10">
                   <div className="w-24 h-24 bg-primary text-white rounded-[40px] flex items-center justify-center shadow-3xl shadow-primary/30">
                      <ShieldCheck size={48} strokeWidth={1} />
                   </div>
                   <div>
                      <h3 className="text-4xl lg:text-5xl font-display font-black text-primary uppercase italic tracking-tighter leading-none mb-3">Protocol Sync</h3>
                      <p className="text-[12px] font-black text-gray-400 uppercase tracking-[0.4em] italic">CONFIRM_FORMALIZATION_COMMAND</p>
                   </div>
                </div>

                <div className="bg-gray-50 p-10 rounded-[40px] border border-black/[0.03] space-y-8">
                   <p className="text-2xl font-display font-medium text-gray-500 italic leading-relaxed">
                     You are about to transmit the <span className="text-primary font-black underline decoration-primary/20 decoration-8 underline-offset-8">FORMALIZED REGISTRY</span> for this session.
                   </p>
                   <div className="grid grid-cols-3 gap-6">
                      <div className="space-y-2">
                         <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic leading-none">PRESENT</p>
                         <p className="text-3xl font-display font-black text-success italic leading-none">{stats.present}</p>
                      </div>
                      <div className="space-y-2">
                         <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic leading-none">ABSENT</p>
                         <p className="text-3xl font-display font-black text-alert italic leading-none">{stats.absent}</p>
                      </div>
                      <div className="space-y-2">
                         <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic leading-none">EXCEPT.</p>
                         <p className="text-3xl font-display font-black text-accent italic leading-none">{stats.late + stats.leftEarly}</p>
                      </div>
                   </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <FFButton 
                    variant="outline" 
                    className="flex-1 h-20 rounded-[32px] text-[11px] font-black uppercase tracking-[0.4em] italic shadow-inner" 
                    onClick={() => setIsConfirmSheetOpen(false)}
                  >
                    ABORT_COMMAND
                  </FFButton>
                  <FFButton 
                    className="flex-1 h-20 rounded-[32px] text-[11px] font-black uppercase tracking-[0.4em] italic shadow-3xl shadow-primary/30" 
                    isLoading={isSubmitting}
                    onClick={handleSubmit}
                  >
                    YES_TRANSMIT
                  </FFButton>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <footer className="text-center space-y-12 py-40 px-8 border-t border-black/[0.03]">
           <div className="flex items-center justify-center gap-10 text-primary/10">
              <div className="h-px w-32 bg-current" />
              <ShieldCheck size={40} />
              <div className="h-px w-32 bg-current" />
           </div>
           <div className="space-y-4">
              <p className="text-[12px] text-gray-400 font-black uppercase tracking-[0.8em] italic leading-relaxed">STATION_ENGINE // Tactical Evaluation Unit v4.1.0</p>
              <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.4em] italic opacity-40">All evaluation signals are finalized via authoritative central protocol</p>
           </div>
      </footer>
    </div>
  );
};

export default AttendanceMarkingScreen;
