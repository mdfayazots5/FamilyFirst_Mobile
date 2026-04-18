import React from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  MapPin, 
  Award, 
  CreditCard, 
  ChevronRight, 
  LogOut,
  Settings,
  ShieldCheck,
  Star,
  Users,
  Briefcase,
  Globe,
  Zap,
  ShieldAlert,
  Fingerprint,
  Cpu,
  Monitor,
  Activity,
  Terminal,
  Layers,
  Command,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import FFAvatar from '../../../shared/components/FFAvatar';
import FFCard from '../../../shared/components/FFCard';
import FFBadge from '../../../shared/components/FFBadge';
import FFButton from '../../../shared/components/FFButton';

import { AppConfig } from '../../../core/config/appConfig';

const ParentProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/demo-login');
  };

  const badges = [
    { id: '1', name: 'Early Adopter', icon: <Star size={14} />, color: 'accent' },
    { id: '2', name: 'Family Shield', icon: <ShieldCheck size={14} />, color: 'primary' },
    { id: '3', name: 'Super Parent', icon: <Award size={14} />, color: 'success' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-48">
      {/* Command Perspective Header */}
      <header className="bg-white/95 backdrop-blur-2xl p-12 lg:p-24 border-b border-black/[0.03] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-24 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-2000">
           <Fingerprint size={320} strokeWidth={1} />
        </div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 relative z-10">
          <div className="relative group/avatar">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="p-3 rounded-[56px] bg-white shadow-3xl border border-black/5 relative z-10"
            >
              <FFAvatar name={user?.name || 'User'} size="xl" className="ring-[12px] ring-primary/5 rounded-[44px] shadow-inner" />
            </motion.div>
            
            <div className="absolute -inset-4 bg-primary/5 rounded-[64px] blur-2xl group-hover/avatar:bg-primary/10 transition-colors" />

            <button 
              onClick={() => navigate('/settings')}
              className="absolute -bottom-4 -right-4 w-16 h-16 bg-primary text-white rounded-[24px] shadow-3xl shadow-primary/30 border-4 border-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-20 group/btn"
            >
              <Settings size={28} className="group-hover/btn:rotate-90 transition-transform" />
            </button>
          </div>

          <div className="text-center md:text-left space-y-6">
             <div className="flex items-center justify-center md:justify-start gap-5">
                <FFBadge variant="primary" size="sm" className="font-black px-5 py-2 uppercase italic tracking-widest text-[11px] rounded-xl shadow-lg shadow-primary/10">EXECUTIVE_GOVERNANCE</FFBadge>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                   <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] italic whitespace-nowrap">VERIFIED_REGISTRY_AGENT_0{user?.uid?.slice(-1) || '7'}</p>
                </div>
             </div>
             
             <h1 className="text-5xl md:text-8xl font-display font-black text-primary tracking-tighter italic uppercase leading-none">
               {user?.name}
             </h1>
             
             <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                <div className="flex items-center gap-3 px-6 py-3 bg-gray-100/50 rounded-[20px] text-[11px] font-black uppercase tracking-widest text-gray-400 border border-black/[0.02] shadow-inner italic">
                   <Globe size={16} className="text-accent" />
                   <span>REGION: MUMBAI_HQ_X</span>
                </div>
                {badges.map(badge => (
                  <div key={badge.id} className="flex items-center gap-3 px-6 py-3 bg-white rounded-[20px] text-[11px] font-black uppercase tracking-widest text-primary border border-black/[0.03] shadow-sm hover:translate-y-[-2px] transition-transform cursor-default italic">
                     <span className="text-accent">{badge.icon}</span>
                     {badge.name.replace(' ', '_').toUpperCase()}
                  </div>
                ))}
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-12 lg:p-24 space-y-24">
        {/* RESOURCE_ALLOCATION_MATRIX */}
        {AppConfig.features.subscriptionEnabled && (
          <FFCard className="bg-primary text-white overflow-hidden relative p-16 border-none shadow-3xl shadow-primary/40 rounded-[72px] group/sub cursor-pointer active:scale-[0.98] transition-all">
            <div className="absolute -top-20 -right-20 p-8 opacity-10 group-hover/sub:scale-110 group-hover/sub:rotate-12 transition-transform duration-1000">
              <Layers size={400} strokeWidth={1} />
            </div>

            <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 group-hover/sub:opacity-100 transition-opacity duration-1000" />
            
            <div className="relative z-10 space-y-12">
              <div className="flex justify-between items-start">
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <Zap size={20} className="text-accent" fill="currentColor" />
                    <p className="text-[12px] font-black uppercase tracking-[0.5em] text-white/50 italic">NODE_RESOURCE_TIER_ALPHA</p>
                  </div>
                  <h3 className="text-5xl md:text-7xl font-display font-black tracking-tighter italic uppercase leading-none">Family_Premium</h3>
                </div>
                <div className="px-8 py-3 bg-accent text-white rounded-full text-[11px] font-black uppercase tracking-[0.3em] shadow-3xl shadow-accent/50 animate-pulse border border-white/20">
                  ACTIVE_LINK_ESTABLISHED
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-black/10 p-10 rounded-[48px] border border-white/5 backdrop-blur-sm">
                 <div className="space-y-1">
                    <p className="text-[11px] text-white/40 font-black uppercase tracking-[0.3em] mb-2 italic leading-none">CYCLE_RENEWAL_TX</p>
                    <p className="text-3xl font-display font-black italic tracking-tight uppercase tabular-nums">May_12_2026</p>
                 </div>
                 <div className="space-y-1 md:text-right">
                    <p className="text-[11px] text-white/40 font-black uppercase tracking-[0.3em] mb-2 italic leading-none">NODE_CAPACITY_LOAD</p>
                    <p className="text-3xl font-display font-black italic tracking-tight uppercase">Unlimited_Capacity</p>
                 </div>
              </div>

              <FFButton 
                variant="accent" 
                size="lg" 
                className="w-full h-24 rounded-[36px] text-xl font-black uppercase tracking-[0.4em] italic shadow-3xl shadow-accent/30 relative overflow-hidden group/mng"
              >
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/mng:translate-x-[100%] transition-transform duration-1000" />
                <span className="relative z-10">MANAGE_ALLOCATION_MATRIX</span>
              </FFButton>
            </div>
          </FFCard>
        )}

        {/* SYSTEM_CONFIGURATION_MODS */}
        <section className="space-y-12">
            <div className="flex items-center gap-8 px-4">
              <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
                 <Cpu size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic leading-none">GOVERNANCE_MODULES</h3>
              <div className="h-px flex-1 bg-primary/10" />
            </div>

            <div className="grid grid-cols-1 gap-8">
              {[
                { icon: <User size={32} />, label: 'Agent Intelligence Profile', description: 'Modify identity parameters and secure metadata.', path: '/profile/edit', color: 'bg-primary/5 text-primary', borderColor: 'border-primary/20', iconBg: 'bg-primary/10', hoverClass: 'hover:-translate-y-2' },
                { icon: <Users size={32} />, label: 'Family Unit Governance', description: 'Configure node membership and authorization levels.', path: '/parent/members', color: 'bg-accent/5 text-accent', borderColor: 'border-accent/20', iconBg: 'bg-accent/10', hoverClass: 'hover:-translate-y-2' },
                { icon: <Shield size={32} />, label: 'Privacy Protocols', description: 'Set visibility and data retention rules.', path: '/settings/privacy', color: 'bg-success/5 text-success', borderColor: 'border-success/20', iconBg: 'bg-success/10', hoverClass: 'hover:-translate-y-2' },
                { icon: <Terminal size={32} />, label: 'Terminal Environment', description: 'Adjust core application behavior and telemetry.', path: '/settings', color: 'bg-indigo-50 text-indigo-500', borderColor: 'border-indigo-200', iconBg: 'bg-indigo-100', hoverClass: 'hover:-translate-y-2' },
              ].map((item, i) => (
                <FFCard
                  key={i}
                  onClick={() => navigate(item.path)}
                  className={`group p-10 flex items-center justify-between cursor-pointer border-none shadow-3xl shadow-black/[0.01] bg-white rounded-[48px] hover:shadow-3xl hover:shadow-black/[0.04] transition-all duration-500 relative overflow-hidden ${item.hoverClass}`}
                >
                  <div className="absolute top-0 right-0 p-10 opacity-[0.01] pointer-events-none translate-x-8 translate-y-[-20%] group-hover:scale-125 transition-transform duration-1000">
                     <Command size={140} strokeWidth={1} />
                  </div>

                  <div className="flex items-center gap-10 relative z-10">
                    <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center shadow-inner border border-black/[0.02] transform group-hover:rotate-6 transition-transform duration-500 ${item.color} ${item.iconBg}`}>
                      {item.icon}
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-2xl font-display font-black text-primary uppercase italic tracking-tighter leading-none group-hover:text-primary transition-colors">{item.label}</h4>
                      <p className="text-[15px] text-gray-400 font-medium italic opacity-70 leading-tight pr-8">{item.description}</p>
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-[24px] bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-sm relative z-10">
                    <ChevronRight size={32} />
                  </div>
                </FFCard>
              ))}
            </div>
        </section>

        {/* SESSION_TERMINATION_PROTOCOL */}
        <div className="pt-12 px-4">
          <button
            onClick={handleLogout}
            className="w-full h-32 rounded-[56px] border-4 border-dashed border-alert/20 text-alert font-black uppercase tracking-[0.5em] flex items-center justify-center gap-8 hover:bg-alert hover:text-white hover:border-alert transition-all duration-700 group overflow-hidden relative shadow-lg italic"
          >
            <div className="absolute inset-0 bg-alert translate-y-full group-hover:translate-y-0 transition-transform duration-700 -z-10" />
            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
               <ShieldAlert size={120} strokeWidth={1} />
            </div>
            <LogOut size={36} className="group-hover:-translate-x-2 transition-transform duration-500" />
            <span className="text-2xl">TERMINATE_COMMAND_SESSION</span>
          </button>
        </div>

        <footer className="text-center space-y-12 py-40 border-t border-black/[0.03]">
           <div className="flex items-center justify-center gap-12 text-primary/10">
              <div className="h-px w-32 bg-current" />
              <Briefcase size={40} />
              <div className="h-px w-32 bg-current" />
           </div>
           <div className="space-y-6">
              <p className="text-[12px] text-gray-400 font-black uppercase tracking-[1em] italic leading-relaxed">STATION_CONTROL // FamilyFirst Terminal OS v1.4.2</p>
              <div className="max-w-md mx-auto relative px-10">
                 <div className="absolute left-0 top-0 text-accent opacity-20"><Command size={20} /></div>
                 <p className="text-[11px] text-gray-300 font-bold italic tracking-wider leading-relaxed uppercase pr-4">
                   "Protocols established to secure the lineage. Every action synchronizes the future. Command sequence verified."
                 </p>
              </div>
           </div>
        </footer>
      </main>
    </div>
  );
};

export default ParentProfileScreen;
