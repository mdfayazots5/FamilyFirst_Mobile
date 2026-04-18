import React from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronRight, 
  ShieldCheck, 
  BookOpen,
  Award,
  Calendar,
  Activity,
  Cpu,
  Layers,
  Zap,
  Monitor,
  Fingerprint
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import FFAvatar from '../../../shared/components/FFAvatar';
import FFCard from '../../../shared/components/FFCard';
import FFBadge from '../../../shared/components/FFBadge';
import FFButton from '../../../shared/components/FFButton';

const TeacherProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/phone-login');
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-48 font-sans">
      {/* Instructional Commander Header */}
      <header className="p-12 lg:p-24 pb-16 space-y-12 flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[320px] bg-primary/[0.02] -z-10 blur-3xl opacity-50" />
        <div className="absolute top-0 right-0 p-24 opacity-[0.01] pointer-events-none -rotate-12 translate-x-12 translate-y-[-20%]">
           <Cpu size={320} />
        </div>

        <div className="relative group">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            className="p-3 rounded-full bg-white shadow-3xl shadow-black/[0.05] border border-black/5"
          >
            <FFAvatar name={user?.name || 'Teacher'} size="2xl" className="ring-8 ring-primary/[0.02]" />
          </motion.div>
          <button className="absolute bottom-4 right-4 w-16 h-16 bg-primary text-white rounded-[24px] shadow-3xl shadow-primary/30 border-4 border-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all group-hover:rotate-12">
            <Settings size={28} />
          </button>
        </div>

        <div className="text-center space-y-6 max-w-2xl relative z-10">
          <div className="flex flex-col items-center gap-4">
             <FFBadge variant="accent" size="sm" className="font-black px-6 py-2 uppercase italic tracking-[0.2em] leading-none shadow-xl shadow-accent/10">VERIFIED_EDUCATOR</FFBadge>
             <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none underline decoration-accent/10 decoration-8 underline-offset-8 decoration-wavy">{user?.name}</h1>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4 text-gray-400 text-[11px] font-black uppercase tracking-[0.4em] italic">
              <BookOpen size={16} className="text-accent" />
              <span>MATHEMATICS_OPERATIONS_SPECIALIST</span>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-3 px-6 py-2 bg-primary/5 rounded-xl">
                 <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                 <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest italic leading-none whitespace-nowrap">STATUS: MASTER_COMMANDER</p>
              </div>
              <div className="flex items-center gap-3 px-6 py-2 bg-accent/5 rounded-xl">
                 <p className="text-[10px] font-black text-accent/60 uppercase tracking-widest italic leading-none whitespace-nowrap">BATCH: CORE_2026</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 lg:px-14 space-y-16">
        {/* Strategic Performance Summary */}
        <div className="grid grid-cols-2 gap-8 px-4 opacity-100">
           <FFCard className="p-10 rounded-[48px] border-none shadow-3xl shadow-black/[0.01] bg-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-125 transition-transform">
                 <Activity size={80} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 italic mb-3">TOTAL_MISSIONS</p>
              <div className="text-5xl font-display font-black text-primary italic leading-none">124</div>
           </FFCard>
           <FFCard className="p-10 rounded-[48px] border-none shadow-3xl shadow-black/[0.01] bg-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-125 transition-transform">
                 <Zap size={80} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 italic mb-3">TACTICAL_RATING</p>
              <div className="text-5xl font-display font-black text-success italic leading-none">4.9<span className="text-xl text-success/40">/5.0</span></div>
           </FFCard>
        </div>

        {/* Tactical Menu Units */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 px-8 opacity-20">
             <p className="text-[11px] font-black uppercase tracking-[0.5em] text-primary italic whitespace-nowrap">UNIT_CONTROL_ACCESS</p>
             <div className="h-px flex-1 bg-primary/20" />
          </div>

          <div className="space-y-6 px-4">
            {[
              { icon: <Fingerprint size={28} />, label: 'Personnel Identification', path: '/profile/edit', color: 'bg-primary/5 text-primary' },
              { icon: <Calendar size={28} />, label: 'Strategic Timetable', path: '/teacher/schedule', color: 'bg-accent/5 text-accent' },
              { icon: <Award size={28} />, label: 'Instructional Merit', path: '/profile/certs', color: 'bg-success/5 text-success' },
              { icon: <ShieldCheck size={28} />, label: 'Security & Protocol', path: '/settings/privacy', color: 'bg-amber-50 text-amber-500' },
              { icon: <Monitor size={28} />, label: 'System Configuration', path: '/settings', color: 'bg-indigo-50 text-indigo-500' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <FFCard
                  onClick={() => navigate(item.path)}
                  className="p-8 rounded-[48px] border-none shadow-3xl shadow-black/[0.01] bg-white flex items-center justify-between cursor-pointer hover:translate-x-3 transition-all group active:scale-[0.98]"
                >
                  <div className="flex items-center gap-8">
                    <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center shadow-inner border border-black/[0.03] ${item.color} group-hover:scale-110 transition-transform`}>
                      {item.icon}
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] italic mb-1 opacity-0 group-hover:opacity-100 transition-opacity">ACCESSING_UNIT_DATA_v4</p>
                       <span className="font-display font-black text-primary text-2xl italic uppercase tracking-tighter leading-none">{item.label}</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-[16px] bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                    <ChevronRight size={24} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                  </div>
                </FFCard>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="px-4 pt-12">
          <button
            onClick={handleLogout}
            className="w-full h-24 text-alert font-black uppercase tracking-[0.5em] text-[12px] italic flex items-center justify-center gap-6 bg-white border border-alert/20 rounded-[48px] shadow-3xl shadow-alert/5 hover:bg-alert hover:text-white hover:shadow-alert/30 transition-all active:scale-95 group"
          >
            <LogOut size={28} className="group-hover:-translate-x-2 transition-transform" />
            Deactivate Sector Command
          </button>
        </div>
      </main>

      <footer className="text-center space-y-12 py-40 px-8 border-t border-black/[0.03]">
           <div className="flex items-center justify-center gap-10 text-primary/10">
              <div className="h-px w-32 bg-current" />
              <ShieldCheck size={40} />
              <div className="h-px w-32 bg-current" />
           </div>
           <div className="space-y-4">
              <p className="text-[12px] text-gray-400 font-black uppercase tracking-[0.8em] italic leading-relaxed whitespace-nowrap">STATION_ENGINE // Commander Profile v4.1.0</p>
              <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.4em] italic opacity-40">Profile identity verified via authoritative central authority servers</p>
           </div>
      </footer>
    </div>
  );
};

export default TeacherProfileScreen;
