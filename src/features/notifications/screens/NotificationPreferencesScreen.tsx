import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Bell, 
  Moon, 
  Clock, 
  CheckCircle2, 
  Save,
  AlertCircle,
  MessageSquare,
  Trophy,
  Heart,
  ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { NotificationRepository, NotificationPreferences } from '../repositories/NotificationRepository';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFBadge from '../../../shared/components/FFBadge';

const NotificationPreferencesScreen: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchPrefs = async () => {
      if (!user?.id) return;
      try {
        const data = await NotificationRepository.getPreferences(user.id);
        setPrefs(data);
      } catch (error) {
        console.error('Failed to fetch preferences', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrefs();
  }, [user?.id]);

  const handleToggle = (key: keyof NotificationPreferences) => {
    if (!prefs) return;
    setPrefs({ ...prefs, [key]: !prefs[key] });
  };

  const handleSave = async () => {
    if (!user?.id || !prefs) return;
    setIsSaving(true);
    try {
      await NotificationRepository.updatePreferences(user.id, prefs);
      navigate(-1);
    } catch (error) {
      console.error('Failed to update preferences', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !prefs) return <div className="p-8 text-center text-gray-400">Loading Preferences...</div>;

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-48">
      <header className="bg-white/95 backdrop-blur-2xl p-8 lg:p-14 border-b border-black/[0.03] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="flex items-center gap-10">
            <div className="w-24 h-24 bg-primary/5 rounded-[32px] flex items-center justify-center text-primary shadow-inner relative group overflow-hidden">
               <div className="absolute inset-x-0 bottom-0 h-1 bg-primary/20 animate-pulse" />
               <Bell size={40} className="relative z-10 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <FFBadge variant="accent" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none">SIGNAL_INTELLIGENCE</FFBadge>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none whitespace-nowrap">PREFERENCE_CALIBRATION_v1.0.1</p>
                </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none">
                Signal Matrix
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <FFButton 
              size="lg" 
              icon={<Save size={24} />} 
              onClick={handleSave}
              isLoading={isSaving}
              className="h-16 px-10 rounded-[24px] shadow-2xl shadow-primary/20 italic font-black uppercase tracking-[0.2em]"
            >
              COMMIT_CHANGES
            </FFButton>
            <button 
              onClick={() => navigate(-1)}
              className="w-16 h-16 bg-white rounded-[24px] border border-black/5 text-gray-300 hover:text-primary transition-all shadow-sm flex items-center justify-center group active:scale-90"
            >
              <ArrowLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-12 lg:p-24 space-y-24 pt-16">
        {/* Notification Types */}
        <section className="space-y-12">
          <div className="flex items-center gap-8 px-4">
            <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
               <Bell size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic leading-none">ALERT_DISPATCH_PROTOCOL</h3>
            <div className="h-px flex-1 bg-primary/10" />
          </div>
          <div className="space-y-3">
            <PreferenceToggle 
              icon={<AlertCircle size={20} />} 
              label="Attendance Alerts" 
              desc="When a child is marked absent or late"
              isEnabled={prefs.attendanceEnabled}
              onToggle={() => handleToggle('attendanceEnabled')}
              color="bg-alert/10 text-alert"
            />
            <PreferenceToggle 
              icon={<MessageSquare size={20} />} 
              label="Teacher Feedback" 
              desc="When a teacher submits a new remark"
              isEnabled={prefs.feedbackEnabled}
              onToggle={() => handleToggle('feedbackEnabled')}
              color="bg-primary/10 text-primary"
            />
            <PreferenceToggle 
              icon={<Trophy size={20} />} 
              label="Reward Requests" 
              desc="When a child wants to redeem coins"
              isEnabled={prefs.rewardEnabled}
              onToggle={() => handleToggle('rewardEnabled')}
              color="bg-amber-50 text-amber-500"
            />
            <PreferenceToggle 
              icon={<CheckCircle2 size={20} />} 
              label="Task Completions" 
              desc="When a child submits a task for review"
              isEnabled={prefs.taskEnabled}
              onToggle={() => handleToggle('taskEnabled')}
              color="bg-success/10 text-success"
            />
            <PreferenceToggle 
              icon={<Heart size={20} />} 
              label="Family Appreciations" 
              desc="When an elder sends love or stickers"
              isEnabled={prefs.appreciationEnabled}
              onToggle={() => handleToggle('appreciationEnabled')}
              color="bg-accent/10 text-accent"
            />
          </div>
        </section>

        {/* Quiet Hours */}
        <section className="space-y-12">
          <div className="flex items-center gap-8 px-4">
            <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
               <Moon size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic leading-none">SILENT_COMM_PROTOCOL</h3>
            <div className="h-px flex-1 bg-primary/10" />
          </div>
          <FFCard className="p-10 lg:p-14 rounded-[56px] border-none shadow-3xl shadow-black/[0.01] bg-white group overflow-hidden relative">
             <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                <Moon size={180} />
             </div>
            <div className="flex items-center gap-10 mb-14 relative z-10 transition-transform group-hover:translate-x-2">
              <div className="w-20 h-20 bg-indigo-50 rounded-[32px] flex items-center justify-center text-indigo-500 shadow-inner group-hover:rotate-12 transition-transform duration-500">
                <Moon size={36} />
              </div>
              <div>
                <h4 className="text-3xl font-display font-black text-primary uppercase italic tracking-tighter leading-none mb-3">Do Not Disturb</h4>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] italic leading-none">SILENCE_NON_CRITICAL_TELEMETRY</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-10 relative z-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] ml-4 italic">START_T_SYNC</label>
                <div className="relative">
                  <input 
                    type="time" 
                    className="w-full px-8 h-20 bg-gray-50/50 border-2 border-transparent rounded-[28px] focus:bg-white focus:border-primary/10 transition-all outline-none font-display font-black text-2xl text-primary italic tabular-nums shadow-inner"
                    value={prefs.quietHoursStart}
                    onChange={e => setPrefs({ ...prefs, quietHoursStart: e.target.value })}
                  />
                  <Clock size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-primary opacity-10" />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] ml-4 italic">END_T_SYNC</label>
                <div className="relative">
                  <input 
                    type="time" 
                    className="w-full px-8 h-20 bg-gray-50/50 border-2 border-transparent rounded-[28px] focus:bg-white focus:border-primary/10 transition-all outline-none font-display font-black text-2xl text-primary italic tabular-nums shadow-inner"
                    value={prefs.quietHoursEnd}
                    onChange={e => setPrefs({ ...prefs, quietHoursEnd: e.target.value })}
                  />
                  <Clock size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-primary opacity-10" />
                </div>
              </div>
            </div>
          </FFCard>
        </section>

        {/* Digests */}
        <section className="space-y-12">
           <div className="flex items-center gap-8 px-4">
            <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
               <Clock size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic leading-none">ANALYTIC_RECAP_SCHEDULE</h3>
            <div className="h-px flex-1 bg-primary/10" />
          </div>
          <FFCard className="p-10 lg:p-14 rounded-[56px] border-none shadow-3xl shadow-black/[0.01] bg-white space-y-12">
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-8">
                <div className="w-16 h-16 bg-amber-50 rounded-[24px] flex items-center justify-center text-amber-500 shadow-inner group-hover:rotate-12 transition-transform duration-500">
                  <Clock size={28} />
                </div>
                <div>
                  <h4 className="text-2xl font-display font-black text-primary uppercase italic tracking-tighter leading-none mb-2">Morning Digest</h4>
                  <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.3em] italic leading-none">STRATEGIC_DAILY_OBJECTIVES</p>
                </div>
              </div>
              <div className="relative">
                <input 
                  type="time" 
                  className="w-48 px-8 h-16 bg-gray-50 border border-black/[0.03] rounded-2xl font-display font-black text-primary uppercase italic transition-all outline-none focus:bg-white focus:border-amber-400 tabular-nums shadow-inner"
                  value={prefs.morningDigestTime}
                  onChange={e => setPrefs({ ...prefs, morningDigestTime: e.target.value })}
                />
              </div>
            </div>
            <div className="h-px bg-black/[0.03]" />
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-8">
                <div className="w-16 h-16 bg-blue-50 rounded-[24px] flex items-center justify-center text-blue-500 shadow-inner group-hover:-rotate-12 transition-transform duration-500">
                  <Clock size={28} />
                </div>
                <div>
                  <h4 className="text-2xl font-display font-black text-primary uppercase italic tracking-tighter leading-none mb-2">Evening Digest</h4>
                  <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.3em] italic leading-none">OPERATIONAL_WIN_METRICS</p>
                </div>
              </div>
              <div className="relative">
                <input 
                  type="time" 
                  className="w-48 px-8 h-16 bg-gray-50 border border-black/[0.03] rounded-2xl font-display font-black text-primary uppercase italic transition-all outline-none focus:bg-white focus:border-blue-400 tabular-nums shadow-inner"
                  value={prefs.eveningDigestTime}
                  onChange={e => setPrefs({ ...prefs, eveningDigestTime: e.target.value })}
                />
              </div>
            </div>
          </FFCard>
        </section>

         <footer className="text-center space-y-12 py-40 px-8 border-t border-black/[0.03]">
           <div className="flex items-center justify-center gap-10 text-primary/10">
              <div className="h-px w-32 bg-current" />
              <ShieldCheck size={40} />
              <div className="h-px w-32 bg-current" />
           </div>
           <div className="space-y-4">
              <p className="text-[12px] text-gray-400 font-black uppercase tracking-[0.8em] italic leading-relaxed">STATION_ENGINE // Signal Preference Array v4.4.2</p>
              <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.4em] italic opacity-40">Unauthorized modification of telemetry schedules is logged and monitored</p>
           </div>
        </footer>
      </main>
    </div>
  );
};

interface PreferenceToggleProps {
  icon: React.ReactNode;
  label: string;
  desc: string;
  isEnabled: boolean;
  onToggle: () => void;
  color: string;
}

const PreferenceToggle: React.FC<PreferenceToggleProps> = ({ icon, label, desc, isEnabled, onToggle, color }) => (
  <FFCard className="p-8 flex items-center justify-between bg-white border-none shadow-3xl shadow-black/[0.01] rounded-[40px] group hover:bg-primary/5 transition-all relative overflow-hidden">
    <div className="flex items-center gap-8 relative z-10">
      <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500 ${color}`}>
        {icon}
      </div>
      <div>
        <h4 className="text-2xl font-display font-black text-primary uppercase italic tracking-tighter leading-none mb-2">{label}</h4>
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] italic leading-none">{desc}</p>
      </div>
    </div>
    <button 
      onClick={onToggle}
      className={`w-20 h-10 rounded-full transition-all relative group/toggle ${isEnabled ? 'bg-primary shadow-glow shadow-primary/20' : 'bg-gray-100 shadow-inner'}`}
    >
      <motion.div 
        animate={{ x: isEnabled ? 44 : 4 }}
        className="absolute top-1 w-8 h-8 bg-white rounded-full shadow-2xl flex items-center justify-center"
      >
        <div className={`w-1.5 h-1.5 rounded-full ${isEnabled ? 'bg-primary animate-pulse' : 'bg-gray-200'}`} />
      </motion.div>
    </button>
  </FFCard>
);

export default NotificationPreferencesScreen;
