import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Send, User, MessageSquare, AlertTriangle, Check, ShieldCheck, Activity, Cpu, Layers, Fingerprint, Zap, ChevronRight, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../../../core/auth/AuthContext';
import { FeedbackRepository, FeedbackType, Severity } from '../repositories/FeedbackRepository';
import { FamilyRepository } from '../../family/repositories/FamilyRepository';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFBadge from '../../../shared/components/FFBadge';
import FFAvatar from '../../../shared/components/FFAvatar';
import FeedbackTypePicker from '../widgets/FeedbackTypePicker';
import WeeklySummaryForm from '../widgets/WeeklySummaryForm';

const FeedbackSubmissionScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<FeedbackType | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [severity, setSeverity] = useState<Severity>('Low');
  const [message, setMessage] = useState('');
  const [weeklyData, setWeeklyData] = useState({
    attendanceRate: '',
    homeworkRate: '',
    standout: '',
    focusArea: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchChildren = async () => {
      if (!user?.familyId) return;
      try {
        const members = await FamilyRepository.getMembers(user.familyId);
        setChildren(members.filter(m => m.role === UserRole.CHILD));
      } catch (error) {
        console.error('Failed to fetch children', error);
      }
    };
    fetchChildren();
  }, [user?.familyId]);

  const handleSubmit = async () => {
    if (!user?.familyId || !selectedChildId || !selectedType) return;
    
    setIsLoading(true);
    try {
      await FeedbackRepository.submitFeedback(user.familyId, {
        childProfileId: selectedChildId,
        type: selectedType,
        severity,
        message: selectedType === 'WeeklySummary' ? 'Weekly Progress Report' : message,
        weeklyData: selectedType === 'WeeklySummary' ? weeklyData : undefined
      });
      navigate('/teacher');
    } catch (error) {
      console.error('Failed to submit feedback', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFriday = new Date().getDay() === 5;
  const disabledTypes: FeedbackType[] = user?.role === UserRole.ELDER 
    ? ['Complaint', 'Observation', 'Homework', 'Urgent', 'WeeklySummary']
    : (!isFriday ? ['WeeklySummary'] : []);

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Classification Matrix';
      case 2: return 'Subject Synchronization';
      case 3: return 'Briefing Payload';
      default: return 'Operational Log';
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-48">
      {/* Operational Briefing Header */}
      <header className="bg-white/95 backdrop-blur-2xl p-8 lg:p-14 border-b border-black/[0.03] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="flex items-center gap-10">
            <button 
              onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
              className="w-16 h-16 bg-white rounded-[24px] border border-black/5 text-gray-300 hover:text-primary transition-all shadow-sm flex items-center justify-center group active:scale-90"
            >
              <ArrowLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <FFBadge variant="accent" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none">OPERATIONAL_BRIEFING</FFBadge>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none whitespace-nowrap">MISSION_STATUS: ACTIVE_DISPATCH</p>
                </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none">
                {getStepTitle().split(' ')[0]} <span className="text-accent underline decoration-accent/20 decoration-8 underline-offset-8">{getStepTitle().split(' ')[1]}</span>
              </h1>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 min-w-[240px]">
             <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] italic leading-none whitespace-nowrap">PROTOCOL_COMPLETION: {Math.round((step / 3) * 100)}%</p>
             <div className="flex gap-2 w-full">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`h-2.5 flex-1 rounded-full transition-all duration-700 overflow-hidden bg-black/[0.03] border border-black/[0.05] p-0.5 shadow-inner`}>
                    <motion.div 
                      initial={false}
                      animate={{ width: step >= i ? '100%' : '0%' }}
                      className={`h-full rounded-full ${step === i ? 'bg-accent shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-primary'}`}
                    />
                  </div>
                ))}
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-12 lg:p-20 pt-16 space-y-24">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="space-y-16"
            >
              <div className="flex items-center gap-8 px-4 opacity-30">
                 <p className="text-[11px] font-black uppercase tracking-[0.5em] text-primary italic whitespace-nowrap">CLASS_IDENTIFICATION_MATRIX</p>
                 <div className="h-px flex-1 bg-primary/20" />
              </div>
              <FeedbackTypePicker 
                selectedType={selectedType} 
                onSelect={(type) => {
                  setSelectedType(type);
                  setStep(2);
                }}
                disabledTypes={disabledTypes}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="space-y-16"
            >
              <div className="flex items-center gap-8 px-4 opacity-30">
                 <p className="text-[11px] font-black uppercase tracking-[0.5em] text-primary italic whitespace-nowrap">TARGET_PERSONNEL_IDENTIFICATION</p>
                 <div className="h-px flex-1 bg-primary/20" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {children.map(child => (
                  <button
                    key={child.id}
                    onClick={() => {
                      setSelectedChildId(child.id);
                      setStep(3);
                    }}
                    className={`flex items-center justify-between p-10 rounded-[48px] border-2 transition-all duration-700 relative overflow-hidden group ${selectedChildId === child.id ? 'border-primary bg-primary text-white shadow-3xl shadow-primary/20 scale-[1.02]' : 'border-black/[0.03] bg-white hover:border-primary/20 shadow-sm hover:shadow-xl hover:shadow-primary/5'}`}
                  >
                    <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none -rotate-12 translate-x-8 translate-y-[-20%] group-hover:rotate-45 transition-transform duration-1000">
                       <Fingerprint size={160} />
                    </div>

                    <div className="flex items-center gap-8 relative z-10">
                      <FFAvatar name={child.name} size="xl" className="border-4 border-white shadow-xl group-hover:scale-110 transition-transform" />
                      <div className="text-left">
                        <h4 className={`font-display font-black text-3xl uppercase italic tracking-tighter leading-none mb-3 ${selectedChildId === child.id ? 'text-white' : 'text-primary'}`}>{child.name}</h4>
                        <div className="flex items-center gap-3">
                           <div className={`w-2 h-2 rounded-full ${selectedChildId === child.id ? 'bg-accent animate-pulse' : 'bg-success'}`} />
                           <p className={`text-[10px] font-black uppercase tracking-[0.3em] italic leading-none ${selectedChildId === child.id ? 'text-white/60' : 'text-gray-300'}`}>ID_TARGET: #{child.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                      </div>
                    </div>
                    {selectedChildId === child.id ? (
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white relative z-10">
                        <Check size={32} strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gray-50 rounded-[24px] flex items-center justify-center text-gray-200 group-hover:text-primary transition-all relative z-10 shadow-inner">
                        <ChevronRight size={32} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="space-y-16"
            >
              <FFCard className="bg-white border-none shadow-3xl shadow-black/[0.01] p-12 rounded-[64px] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none -rotate-12 translate-x-12 translate-y-[-20%]">
                   <Monitor size={280} />
                </div>
                <div className="relative z-10 lg:flex items-center justify-between gap-12">
                   <div className="flex items-center gap-10 mb-10 lg:mb-0">
                      <FFAvatar name={children.find(c => c.id === selectedChildId)?.name || 'C'} size="2xl" className="border-4 border-white shadow-2xl" />
                      <div>
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] italic mb-3">ACTIVE_SUBJECT_LOCK</p>
                        <h3 className="font-display font-black text-primary text-5xl italic uppercase tracking-tighter leading-none mb-4">{children.find(c => c.id === selectedChildId)?.name}</h3>
                        <div className="flex items-center gap-3">
                           <FFBadge variant="accent" className="bg-accent/10 border-none px-6 py-2 text-[10px] uppercase font-black tracking-widest italic rounded-xl">{selectedType?.replace(/([A-Z])/g, ' $1').trim()}</FFBadge>
                           <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                        </div>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] italic mb-2 leading-none">REGISTRY_STATUS</p>
                      <p className="text-primary font-display font-black text-3xl italic uppercase leading-none">AWAITING_PAYLOAD</p>
                   </div>
                </div>
              </FFCard>

              {selectedType === 'WeeklySummary' ? (
                <WeeklySummaryForm data={weeklyData} onChange={setWeeklyData} />
              ) : (
                <div className="space-y-16">
                  {selectedType === 'Complaint' && (
                    <div className="space-y-8 px-4">
                      <div className="flex items-center gap-4">
                         <div className="w-2 h-2 rounded-full bg-alert animate-ping" />
                         <label className="text-[11px] font-black uppercase tracking-[0.5em] text-primary italic">ESCALATION_SEVERITY_LEVEL</label>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {(['Low', 'Medium', 'Urgent'] as Severity[]).map(s => (
                          <button
                            key={s}
                            onClick={() => setSeverity(s)}
                            className={`h-20 rounded-[28px] font-black text-[12px] uppercase tracking-[0.4em] transition-all border-2 italic ${severity === s ? 'bg-alert text-white border-alert shadow-3xl shadow-alert/30' : 'bg-white border-black/[0.03] text-gray-300 hover:border-alert/20 hover:text-alert'}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-8 px-4">
                    <div className="flex items-center gap-4">
                       <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                       <label className="text-[11px] font-black uppercase tracking-[0.5em] text-primary italic leading-none">OBSERVATION_BRIEFING_TRANSCRIPT</label>
                    </div>
                    <div className="relative group/text">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Detail qualitative observations for central review..."
                        className="w-full bg-white border border-black/[0.03] rounded-[56px] px-12 py-12 font-medium text-primary focus:outline-none focus:border-primary/20 shadow-inner min-h-[300px] placeholder:text-gray-200 text-xl italic"
                      />
                      <div className="absolute right-12 bottom-12 p-5 bg-gray-50 rounded-[24px] text-gray-300 group-hover/text:bg-primary/5 group-hover/text:text-primary transition-all shadow-inner border border-black/[0.03]">
                         <MessageSquare size={32} strokeWidth={1.5} />
                      </div>
                    </div>
                  </div>

                  {severity === 'Urgent' && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-12 bg-alert/5 rounded-[48px] border border-alert/20 flex gap-8 items-center shadow-3xl shadow-alert/10 relative overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none rotate-12 translate-x-4 translate-y-[-20%] group-hover:rotate-45 transition-transform duration-1000">
                         <AlertTriangle size={160} />
                      </div>
                      <div className="w-20 h-20 bg-alert text-white rounded-[24px] flex items-center justify-center shrink-0 animate-pulse shadow-xl shadow-alert/20">
                        <AlertTriangle size={40} />
                      </div>
                      <div>
                        <p className="text-[13px] text-alert font-black uppercase tracking-[0.3em] leading-relaxed italic mb-2">CRITICAL_THREAT_DETECTION</p>
                        <p className="text-sm text-alert/60 font-medium italic">Execute protocol will trigger immediate HIGH-FREQUENCY alerts to all verified family guardians.</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              <footer className="pt-20 border-t border-black/[0.03] flex flex-col items-center gap-12">
                 <FFButton 
                   className="w-full h-24 rounded-[48px] text-[12px] font-black uppercase tracking-[0.5em] shadow-3xl shadow-primary/30 group active:scale-95 italic transition-all" 
                   icon={<Send size={32} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                   isLoading={isLoading}
                   onClick={handleSubmit}
                   disabled={selectedType === 'WeeklySummary' ? (!weeklyData.attendanceRate || !weeklyData.homeworkRate) : !message}
                 >
                   EXECUTE_FEEDBACK_BROADCAST
                 </FFButton>
                 
                 <div className="space-y-4 text-center opacity-40">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.8em] italic leading-relaxed whitespace-nowrap">STATION_ENGINE // Observation Network v4.2.1</p>
                    <p className="text-[9px] text-gray-300 font-black uppercase tracking-[0.4em] italic">Signals transmitted via encrypted core gateway</p>
                 </div>
              </footer>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default FeedbackSubmissionScreen;
