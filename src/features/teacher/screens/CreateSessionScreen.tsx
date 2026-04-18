import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  BookOpen, 
  Users, 
  Repeat,
  Check,
  ShieldCheck,
  Activity,
  Cpu,
  Layers,
  Zap,
  Monitor
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { AttendanceRepository } from '../repositories/AttendanceRepository';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFBadge from '../../../shared/components/FFBadge';

const CreateSessionScreen: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [batch, setBatch] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('16:00');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.familyId) return;
    
    setIsLoading(true);
    try {
      await AttendanceRepository.createSession(user.familyId, {
        subject,
        sessionName: batch,
        scheduledDate: date,
        startTime: time,
        isRecurring
      });
      navigate('/teacher');
    } catch (error) {
      console.error('Failed to create session', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-48">
      {/* Strategic Initialization Header */}
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
                <FFBadge variant="accent" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none">STRATEGIC_COMMAND</FFBadge>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none whitespace-nowrap">INIT_PROTOCOL_ACTIVE</p>
                </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none whitespace-nowrap">
                New <span className="text-accent underline decoration-accent/20 decoration-8 underline-offset-8">SESSION</span>
              </h1>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4 text-right">
             <div>
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] italic mb-1">COMMAND_AUTHORIZATION</p>
                <div className="flex items-center gap-3 justify-end">
                   <ShieldCheck className="text-success" size={20} />
                   <span className="text-primary font-display font-black text-xl italic uppercase tracking-tighter">SECURE_INIT</span>
                </div>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-8 lg:p-14 lg:pt-24 space-y-16">
        <div className="flex items-center gap-4 px-4 opacity-30">
           <p className="text-[11px] font-black uppercase tracking-[0.5em] text-primary italic whitespace-nowrap">MISSION_PARAMETERS_REGISTRY</p>
           <div className="h-px flex-1 bg-primary/20" />
        </div>

        <form onSubmit={handleCreate} className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 italic ml-4 leading-none">SUBJECT_PROTOCOL</label>
              <div className="relative group">
                <BookOpen className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-200 group-focus-within:text-primary transition-colors" size={24} strokeWidth={1.5} />
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-white border border-black/[0.03] rounded-[36px] pl-20 pr-10 py-8 font-display font-black text-2xl text-primary focus:outline-none focus:border-primary/20 shadow-inner transition-all placeholder:text-gray-100 italic"
                  placeholder="v[Mathematics]"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 italic ml-4 leading-none">TARGET_GROUP_IDENTIFIER</label>
              <div className="relative group">
                <Users className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-200 group-focus-within:text-primary transition-colors" size={24} strokeWidth={1.5} />
                <input
                  type="text"
                  required
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  className="w-full bg-white border border-black/[0.03] rounded-[36px] pl-20 pr-10 py-8 font-display font-black text-2xl text-primary focus:outline-none focus:border-primary/20 shadow-inner transition-all placeholder:text-gray-100 italic"
                  placeholder="v[Batch Alpha]"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 italic ml-4 leading-none">CHRONOLOGICAL_LOCK (DATE)</label>
              <div className="relative group">
                <Calendar className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-200 group-focus-within:text-primary transition-colors" size={24} strokeWidth={1.5} />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white border border-black/[0.03] rounded-[36px] pl-20 pr-10 py-8 font-display font-black text-2xl text-primary focus:outline-none focus:border-primary/20 shadow-inner transition-all italic"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 italic ml-4 leading-none">OPERATIONAL_ZERO_HOUR (TIME)</label>
              <div className="relative group">
                <Clock className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-200 group-focus-within:text-primary transition-colors" size={24} strokeWidth={1.5} />
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-white border border-black/[0.03] rounded-[36px] pl-20 pr-10 py-8 font-display font-black text-2xl text-primary focus:outline-none focus:border-primary/20 shadow-inner transition-all italic"
                />
              </div>
            </div>
          </div>

          <div className="p-12 bg-white rounded-[48px] border border-black/[0.03] shadow-3xl shadow-black/[0.01] flex flex-col md:flex-row items-center justify-between gap-10 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
               <Repeat size={160} />
            </div>

            <div className="flex items-center gap-8 relative z-10">
              <div className="w-20 h-20 bg-primary/5 rounded-[24px] flex items-center justify-center text-primary shadow-inner">
                <Repeat size={32} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] italic mb-2">RECURRENCE_PROTOCOL</p>
                <h4 className="text-primary font-display font-black text-3xl italic uppercase tracking-tighter leading-none">Weekly Strategic Cycle</h4>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => setIsRecurring(!isRecurring)}
              className={`w-20 h-10 rounded-full transition-all relative z-10 p-1 flex items-center ${isRecurring ? 'bg-primary' : 'bg-gray-100 shadow-inner'}`}
            >
              <motion.div 
                animate={{ x: isRecurring ? '100%' : 0 }}
                className="w-8 h-8 bg-white rounded-full shadow-lg" 
              />
            </button>
          </div>

          <footer className="pt-20 flex flex-col items-center gap-12">
             <FFButton 
               type="submit" 
               className="w-full h-24 rounded-[48px] text-[12px] font-black uppercase tracking-[0.5em] shadow-3xl shadow-primary/30 group active:scale-95 italic transition-all" 
               isLoading={isLoading}
               icon={<Check size={32} className="group-hover:scale-125 transition-transform" />}
             >
               INITIALIZE_SESSION_COMMAND
             </FFButton>
             
             <div className="space-y-4 text-center opacity-40">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.8em] italic leading-relaxed whitespace-nowrap">STATION_ENGINE // Initialization Unit v4.0.0</p>
                <p className="text-[9px] text-gray-300 font-black uppercase tracking-[0.4em] italic">Parameters confirmed via central station auth protocol</p>
             </div>
          </footer>
        </form>
      </main>
    </div>
  );
};

export default CreateSessionScreen;
