import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Plus, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  LogOut,
  Settings,
  Cpu,
  Layers,
  Activity,
  ShieldCheck,
  Command,
  Fingerprint,
  Zap,
  Network,
  Monitor,
  Radar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { AttendanceRepository, AttendanceSession } from '../repositories/AttendanceRepository';
import FFCard from '../../../shared/components/FFCard';
import FFBadge from '../../../shared/components/FFBadge';
import FFButton from '../../../shared/components/FFButton';
import FFAvatar from '../../../shared/components/FFAvatar';

import { useLocalNotifications } from '../../../core/notifications/LocalNotificationService';
import { NotificationType } from '../../../core/notifications/NotificationPayloadHandler';

const TeacherHomeScreen: React.FC = () => {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useLocalNotifications();

  const simulateNotification = (type: NotificationType, priority: 'normal' | 'urgent' | 'birthday' = 'normal') => {
    const titles: Record<string, string> = {
      [NotificationType.Attendance]: 'Attendance Alert',
      [NotificationType.Feedback]: 'New Teacher Feedback',
      [NotificationType.UrgentFeedback]: 'URGENT: Teacher Escalation',
      [NotificationType.WeeklyDigest]: 'Weekly Digest Ready',
      [NotificationType.Birthday]: 'Happy Birthday!',
      [NotificationType.SOS]: 'EMERGENCY SOS',
    };

    const bodies: Record<string, string> = {
      [NotificationType.Attendance]: 'Arjun was marked absent for Mathematics.',
      [NotificationType.Feedback]: 'Mr. Ahmed left a new note for Zara.',
      [NotificationType.UrgentFeedback]: 'Immediate attention required for Arjun.',
      [NotificationType.WeeklyDigest]: 'Your family report for this week is ready.',
      [NotificationType.Birthday]: 'Wishing Arjun a fantastic day! 🎂',
      [NotificationType.SOS]: 'Arjun has triggered an SOS alert!',
    };

    showNotification({
      title: titles[type] || 'New Notification',
      body: bodies[type] || 'You have a new update.',
      priority,
      payload: {
        type,
        childId: 'c1',
        referenceId: 'f1',
        memberName: 'Arjun'
      }
    });
  };

  const fetchSessions = useCallback(async () => {
    if (!user?.familyId) return;
    setIsRefreshing(true);
    try {
      const data = await AttendanceRepository.getTodaySessions(user.familyId);
      setSessions(data);
    } catch (error) {
      console.error('Failed to fetch sessions', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.familyId]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const pendingSessions = sessions.filter(s => !s.isSubmitted);
  const completedSessions = sessions.filter(s => s.isSubmitted);

  if (isLoading && sessions.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-12 text-center space-y-8">
        <motion.div 
           animate={{ rotate: 360 }}
           transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
           className="w-24 h-24 rounded-[32px] bg-primary/5 flex items-center justify-center text-primary shadow-inner"
        >
           <RefreshCw size={40} />
        </motion.div>
        <p className="text-[12px] font-black uppercase tracking-[0.5em] text-primary/40 italic animate-pulse">SYNCHRONIZING_STAFF_REGISTRY...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-48">
      {/* High-Command Staff Header */}
      <header className="bg-white/95 backdrop-blur-2xl p-8 lg:p-14 border-b border-black/[0.03] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="flex items-center gap-10">
            <div className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-primary/30 relative group overflow-hidden">
               <div className="absolute inset-x-0 bottom-0 h-1 bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
               <Fingerprint size={40} className="relative z-10 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <FFBadge variant="accent" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none">INSTRUCTIONAL_DIRECTOR</FFBadge>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none whitespace-nowrap">STAFF_COMMAND_PORTAL_v4.4.2</p>
                </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none text-balance">
                Faculty Station: <span className="text-accent underline decoration-accent/20 decoration-8 underline-offset-8">{user?.name?.split(' ')[0]}</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden xl:block mr-10 group cursor-default">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em] italic leading-none mb-2">OPERATIONAL_TIME</p>
               <p className="text-2xl font-display font-black text-primary italic leading-none group-hover:text-accent transition-colors">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} <span className="text-[10px] opacity-30">ZULU</span>
               </p>
            </div>
            <button 
              onClick={() => navigate('/teacher/settings')}
              className="w-16 h-16 bg-white rounded-[24px] border border-black/5 text-gray-300 hover:text-primary transition-all shadow-sm flex items-center justify-center group active:scale-90"
            >
              <Settings size={28} className="group-hover:rotate-45 transition-transform duration-500" />
            </button>
            <button 
              onClick={fetchSessions}
              className="w-16 h-16 bg-white rounded-[24px] border border-black/5 text-gray-300 hover:text-primary transition-all shadow-sm flex items-center justify-center group active:scale-90"
            >
              <RefreshCw size={28} className={isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-12 lg:p-20 pt-16 space-y-24">
        {/* Metric Directives */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <FFCard className="p-12 bg-primary text-white border-none shadow-3xl shadow-primary/30 flex flex-col justify-between group overflow-hidden relative rounded-[56px] min-h-[340px]">
             <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none -rotate-12 translate-x-12 translate-y-[-20%] group-hover:rotate-45 transition-transform duration-[3000ms]">
                <Clock size={320} fill="white" />
             </div>
             <div className="flex items-center justify-between relative z-10">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-accent shadow-inner backdrop-blur-xl border border-white/5 group-hover:rotate-12 transition-transform">
                  <Clock size={32} />
                </div>
                <FFBadge variant="accent" size="sm" className="font-black border-none bg-accent/20 px-6 py-2 uppercase italic tracking-widest text-[12px] rounded-xl outline-dashed outline-1 outline-white/20">AWAITING_INPUT</FFBadge>
             </div>
             <div className="relative z-10">
                <h4 className="text-[120px] font-display font-black italic tracking-tighter mb-4 leading-none">{pendingSessions.length}</h4>
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                   <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.5em] italic leading-none mt-1">SESSIONS_IN_QUE_WAITING</p>
                </div>
             </div>
          </FFCard>

          <FFCard className="p-12 bg-white border-none shadow-3xl shadow-black/[0.01] flex flex-col justify-between rounded-[56px] group relative overflow-hidden min-h-[340px]">
             <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none rotate-12 translate-x-8 translate-y-[-20%] group-hover:scale-110 transition-transform duration-[4000ms]">
                <Users size={320} />
             </div>
             <div className="flex items-center justify-between relative z-10">
                <div className="w-16 h-16 bg-success/5 rounded-2xl text-success shadow-inner border border-success/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users size={32} />
                </div>
                <FFBadge variant="primary" size="sm" className="font-black border-none bg-primary/5 px-6 py-2 uppercase italic tracking-widest text-[12px] rounded-xl">PERSONNEL_LOAD_v4</FFBadge>
             </div>
             <div className="relative z-10">
                <h4 className="text-[120px] font-display font-black italic tracking-tighter text-primary mb-4 leading-none group-hover:text-success transition-all duration-700">
                  {sessions.reduce((acc, s) => acc + s.studentCount, 0)}
                </h4>
                <div className="flex items-center gap-3">
                   <Activity size={14} className="text-gray-300" />
                   <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.5em] italic leading-none mt-1">ACTIVE_ENROLLMENT_COUNT</p>
                </div>
             </div>
          </FFCard>
        </div>

        {/* Operational Grid: Active Sessions */}
        <section className="space-y-16">
          <div className="flex items-center gap-8 px-4">
             <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary group-hover:rotate-90 transition-transform">
                <Layers size={24} strokeWidth={2.5} />
             </div>
             <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic leading-none">PRIMARY_OPERATIONAL_REGISTRY</h3>
             <div className="h-px flex-1 bg-primary/10" />
          </div>
          
          {pendingSessions.length === 0 ? (
            <div className="py-32 bg-white/40 border-[3px] border-dashed border-gray-100 rounded-[64px] text-center flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-success/5 rounded-[40px] flex items-center justify-center text-success mb-8 shadow-inner">
                 <CheckCircle2 size={48} strokeWidth={1} />
              </div>
              <h3 className="font-display font-black text-3xl text-primary opacity-40 uppercase italic tracking-tighter">PROTOCOLS_FORMALIZED</h3>
              <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.4em] mt-4 italic">Baseline Operational Sync Complete</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-10">
              {pendingSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  onClick={() => navigate(`/teacher/attendance/${session.id}`)}
                  className="cursor-pointer group"
                >
                  <FFCard className="p-10 lg:p-12 border-none shadow-3xl shadow-black/[0.01] bg-white rounded-[56px] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-10 group-hover:bg-primary/[0.02] transition-all duration-700">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.01] pointer-events-none translate-x-12 translate-y-[-20%] group-hover:scale-110 transition-transform duration-1000">
                       <Command size={160} strokeWidth={1} />
                    </div>

                    <div className="flex items-center gap-10 relative z-10">
                      <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner border border-black/[0.02]">
                        <Clock size={40} strokeWidth={1} />
                      </div>
                      <div>
                        <div className="flex items-center gap-4 mb-3">
                           <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] italic leading-none">SESSION_ID: {session.id.slice(0, 8).toUpperCase()}</p>
                           <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                        </div>
                        <h3 className="font-display font-black text-primary text-4xl uppercase italic tracking-tighter leading-none mb-4 group-hover:text-primary transition-colors">{session.subject}</h3>
                        <div className="flex items-center gap-4">
                           <div className="px-5 py-2 bg-gray-50 rounded-full border border-black/5 flex items-center gap-3">
                              <Calendar size={14} className="text-gray-400" />
                              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest italic">{session.startTime}</span>
                           </div>
                           <div className="px-5 py-2 bg-accent/5 rounded-full border border-accent/10 flex items-center gap-3 text-accent">
                              <Monitor size={14} />
                              <span className="text-[11px] font-black uppercase tracking-widest italic">{session.sessionName}</span>
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-10 relative z-10">
                      <div className="text-right hidden sm:block">
                        <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.3em] mb-2 italic">ASSIGNMENT_LOAD</p>
                        <p className="text-3xl font-display font-black text-primary italic leading-none">{session.studentCount} UNITS</p>
                      </div>
                      <div className="w-16 h-16 rounded-[24px] bg-gray-50 flex items-center justify-center text-gray-300 group-hover:text-white group-hover:bg-primary transition-all shadow-sm transform group-hover:translate-x-2">
                         <ChevronRight size={28} />
                      </div>
                    </div>
                  </FFCard>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {completedSessions.length > 0 && (
          <section className="space-y-12">
            <div className="flex items-center gap-8 px-4">
               <div className="w-12 h-12 bg-success/5 rounded-[18px] flex items-center justify-center text-success">
                  <Activity size={24} strokeWidth={2.5} />
               </div>
               <h3 className="text-xl font-display font-black uppercase tracking-widest text-success italic leading-none opacity-60">FORMALIZED_ARCHIVES</h3>
               <div className="h-px flex-1 bg-success/10" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {completedSessions.map((session) => (
                <FFCard key={session.id} className="p-8 border-none shadow-3xl shadow-black/[0.005] bg-white group opacity-60 hover:opacity-100 transition-all rounded-[36px] hover:bg-success/[0.02]">
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-14 h-14 bg-success/5 rounded-[20px] flex items-center justify-center text-success border border-success/10 shadow-inner group-hover:scale-110 transition-transform">
                      <CheckCircle2 size={24} />
                    </div>
                    <FFBadge variant="success" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest text-[9px] rounded-lg">PROTOCOL_SECURED</FFBadge>
                  </div>
                  <div>
                    <h4 className="font-display font-black text-primary text-xl uppercase italic tracking-tighter leading-none mb-3">{session.subject}</h4>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] italic">
                      LOCKED_TIMESTAMP: {new Date(session.submittedAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                  </div>
                </FFCard>
              ))}
            </div>
          </section>
        )}

        {/* TACTICAL_EMULATION_STATION */}
        <section className="space-y-12 pt-24 border-t border-black/[0.03]">
           <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-primary/30 italic">TACTICAL_SIGNAL_EMULATION</h3>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
            {[
              { label: 'ATTENDANCE_LOG', type: NotificationType.Attendance, icon: <Network size={16} /> },
              { label: 'FEEDBACK_LINK', type: NotificationType.Feedback, icon: <Monitor size={16} /> },
              { label: 'PRIORITY_ALERT', type: NotificationType.UrgentFeedback, urgent: true, icon: <Zap size={16} fill="currentColor" /> },
              { label: 'DIGEST_RELEASE', type: NotificationType.WeeklyDigest, icon: <Layers size={16} /> },
              { label: 'BIRTHDAY_EVENT', type: NotificationType.Birthday, special: true, icon: <Calendar size={16} /> },
              { label: 'EMERGENCY_SOS', type: NotificationType.SOS, critical: true, icon: <ShieldCheck size={16} /> }
            ].map((trigger, i) => (
              <button 
                key={i}
                onClick={() => simulateNotification(trigger.type, trigger.urgent || trigger.critical ? 'urgent' : 'normal')}
                className={`
                  p-8 rounded-[32px] border transition-all text-[11px] font-black uppercase tracking-widest flex flex-col gap-4 group active:scale-95 text-center items-center italic
                  ${trigger.critical 
                    ? 'bg-alert text-white border-none shadow-3xl shadow-alert/30' 
                    : trigger.urgent 
                      ? 'bg-alert/5 text-alert border-alert/20 hover:bg-alert hover:text-white shadow-2xl shadow-alert/10' 
                      : trigger.special 
                        ? 'bg-accent/5 text-accent border-accent/10 hover:bg-accent hover:text-white shadow-2xl shadow-accent/10'
                        : 'bg-white text-gray-400 border-black/5 hover:border-primary hover:text-primary shadow-sm hover:shadow-2xl hover:shadow-primary/5'}
                `}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${trigger.critical ? 'bg-white/20' : trigger.urgent ? 'bg-alert/10 text-alert group-hover:bg-white/20 group-hover:text-white' : 'bg-gray-50 text-gray-300 group-hover:bg-primary/5 group-hover:text-primary shadow-inner'}`}>
                   {trigger.icon}
                </div>
                {trigger.label}
              </button>
            ))}
          </div>
        </section>

        <footer className="text-center space-y-12 py-40 px-8 border-t border-black/[0.03]">
           <div className="flex items-center justify-center gap-10 text-primary/10">
              <div className="h-px w-32 bg-current" />
              <ShieldCheck size={40} />
              <div className="h-px w-32 bg-current" />
           </div>
           <div className="space-y-4">
              <p className="text-[12px] text-gray-400 font-black uppercase tracking-[0.8em] italic leading-relaxed">STATION_ENGINE // Staff Command Interface v4.4.2</p>
              <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.4em] italic opacity-40">Unauthorized access to staff registers is strictly prohibited by central authority</p>
           </div>
        </footer>
      </main>

      {/* Floating Tactical Deployment Cable */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/teacher/create-session')}
        className="fixed bottom-12 right-12 w-24 h-24 bg-accent text-primary rounded-[36px] shadow-3xl shadow-accent/40 flex items-center justify-center z-50 border-4 border-white transition-all overflow-hidden group"
      >
         <div className="absolute inset-x-0 bottom-0 h-2 bg-primary/20 animate-pulse" />
         <Plus size={40} strokeWidth={3} className="relative z-10" />
      </motion.button>
    </div>
  );
};

export default TeacherHomeScreen;
