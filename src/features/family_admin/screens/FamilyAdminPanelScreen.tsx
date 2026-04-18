import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Users, 
  Shield, 
  Eye, 
  Bell, 
  Settings,
  Check,
  X,
  Plus,
  Save,
  BarChart3,
  MessageSquare,
  Layout,
  ChevronRight,
  Cpu,
  Fingerprint,
  Zap,
  Globe,
  RefreshCcw,
  Network,
  Activity,
  ShieldCheck,
  Radar,
  Command,
  Layers,
  HardDrive
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFBadge from '../../../shared/components/FFBadge';

const FamilyAdminPanelScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);

  const familyModules = [
    { 
      id: 'visibility', 
      label: 'Module Visibility', 
      desc: 'Control child/elder feature access', 
      icon: <Eye size={24} />, 
      path: '/family-admin/modules',
      color: 'bg-primary text-white',
      diagnostic: 'ACCESS_VECTORS'
    },
    { 
      id: 'notifications', 
      label: 'Alert Logic', 
      desc: 'Configure family broadcast rules', 
      icon: <Bell size={24} />, 
      path: '/family-admin/notifications',
      color: 'bg-accent text-primary',
      diagnostic: 'SIGNAL_GEOMETRY'
    },
    { 
      id: 'members', 
      label: 'Family Registry', 
      desc: 'Manage biometrics and invites', 
      icon: <Users size={24} />, 
      path: '/parent/members',
      color: 'bg-success text-white',
      diagnostic: 'IDENTITY_MATRIX'
    },
  ];

  const advancedModules = [
    { 
      id: 'security', 
      label: 'Safety Protocols', 
      desc: 'Emergency SOS & tracking', 
      icon: <Shield size={20} />, 
      path: '#',
      color: 'text-alert bg-alert/5',
      status: 'OFFLINE'
    },
    { 
      id: 'automation', 
      label: 'Routine Engine', 
      desc: 'Smart task generation', 
      icon: <Cpu size={20} />, 
      path: '#',
      color: 'text-indigo-500 bg-indigo-50',
      status: 'STABLE'
    },
    { 
      id: 'analytics', 
      label: 'Audit Logging', 
      desc: 'Deep event inspection', 
      icon: <Activity size={20} />, 
      path: '#',
      color: 'text-primary bg-primary/5',
      status: 'ENCRYPTED'
    },
  ];

  const handleDeepSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-48">
      {/* High-Command Header */}
      <header className="bg-white/95 backdrop-blur-2xl p-8 lg:p-14 border-b border-black/[0.03] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="flex items-center gap-10">
            <div className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-primary/30 relative group overflow-hidden">
               <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
               <Fingerprint size={40} className="relative z-10" />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <FFBadge variant="accent" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none">ROOT_AUTHORITY</FFBadge>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none whitespace-nowrap">GLOBAL_SYNC_SECURED</p>
                </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none">
                Governance Registry
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={handleDeepSync}
              disabled={isSyncing}
              className={`h-16 px-10 rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] transition-all flex items-center gap-4 italic shadow-2xl shadow-primary/10 active:scale-95 border-2 ${isSyncing ? 'bg-gray-50 text-gray-400 border-gray-100' : 'bg-white border-primary/5 text-primary hover:bg-primary hover:text-white'}`}
            >
              {isSyncing ? <RefreshCcw size={20} className="animate-spin" /> : <Zap size={20} fill={isSyncing ? 'none' : 'currentColor'} />} 
              {isSyncing ? 'SYNCHRONIZING...' : 'FORCE_GLOBAL_SYNC'}
            </button>
            <button 
              onClick={() => navigate(-1)}
              className="w-16 h-16 bg-white rounded-[24px] border border-black/5 text-gray-300 hover:text-primary transition-all shadow-sm flex items-center justify-center group active:scale-90"
            >
              <ArrowLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 lg:p-14 pt-16 space-y-24">
        {/* Module Matrix */}
        <section className="space-y-12">
          <div className="flex items-center gap-8 px-4">
            <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
               <Layers size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic">PRIMARY_LOGIC_GATES</h3>
            <div className="h-px flex-1 bg-primary/10" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {familyModules.map((item, index) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                whileTap={{ scale: 0.98 }}
              >
                <FFCard 
                  className="p-10 flex flex-col justify-between cursor-pointer border-none shadow-3xl shadow-black/[0.01] bg-white group h-full rounded-[56px] relative overflow-hidden"
                  onClick={() => navigate(item.path)}
                >
                  <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none translate-x-12 translate-y-[-20%] group-hover:scale-110 transition-transform duration-1000">
                     <Command size={160} strokeWidth={1} />
                  </div>
                  
                  <div className="relative z-10">
                    <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center mb-8 shadow-2xl transition-all duration-700 group-hover:rotate-6 ${item.color}`}>
                      {item.icon}
                    </div>
                    <div className="mb-10">
                       <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] italic mb-2 leading-none">{item.diagnostic}</p>
                       <h4 className="font-display font-black text-primary text-3xl uppercase italic tracking-tighter mb-4 leading-none group-hover:text-success transition-colors">{item.label}</h4>
                       <p className="text-gray-400 font-medium leading-relaxed italic text-lg">{item.desc}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between relative z-10 pt-6 border-t border-black/[0.03]">
                    <div className="flex items-center gap-3 text-[10px] font-black text-primary/30 uppercase tracking-[0.2em] group-hover:text-primary transition-colors italic">
                      CONFIG_PROTOCOL
                    </div>
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:translate-x-1 shadow-sm">
                       <ChevronRight size={24} />
                    </div>
                  </div>
                </FFCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Global Operational Overview */}
        <section className="relative">
          <div className="absolute inset-0 bg-primary/5 rounded-[64px] -m-4 lg:-m-8 pointer-events-none" />
          <div className="bg-primary p-12 lg:p-20 rounded-[56px] text-white overflow-hidden relative shadow-3xl shadow-primary/30 group">
            <div className="absolute top-0 right-0 p-20 opacity-[0.05] pointer-events-none group-hover:scale-110 group-hover:rotate-12 transition-transform duration-[3000ms]">
              <Globe size={400} />
            </div>
            <div className="absolute bottom-0 left-0 p-20 opacity-[0.05] pointer-events-none -translate-x-20">
              <Network size={300} />
            </div>
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
               <div className="space-y-6 max-w-lg text-center lg:text-left">
                  <FFBadge variant="accent" size="sm" className="font-black px-6 py-2 uppercase italic tracking-widest text-[12px] rounded-xl">OPERATIONAL_SNAPSHOT</FFBadge>
                  <h3 className="text-4xl lg:text-6xl font-display font-black italic tracking-tighter leading-tight drop-shadow-2xl">GLOBAL_SYNC_STABLE</h3>
                  <p className="text-white/40 text-lg italic leading-relaxed font-medium">Telemetry indicates all family units are currently synchronized via secure grid protocols. Module uptime is exceeding baseline expectations.</p>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20 w-full lg:w-auto">
                <div className="text-center group/stat">
                  <p className="text-[11px] font-black uppercase tracking-[0.5em] text-white/40 mb-4 italic group-hover:text-accent transition-colors">ENCRYPTION</p>
                  <h4 className="text-5xl lg:text-6xl font-display font-black italic leading-none group-hover:scale-110 transition-transform">AES_256</h4>
                </div>
                <div className="text-center group/stat border-y md:border-y-0 md:border-x border-white/10 py-10 md:py-0 md:px-12 lg:px-20">
                  <p className="text-[11px] font-black uppercase tracking-[0.5em] text-white/40 mb-4 italic group-hover:text-accent transition-colors">ACTIVE_UNITS</p>
                  <h4 className="text-5xl lg:text-6xl font-display font-black italic leading-none group-hover:scale-110 transition-transform tabular-nums">06_LIVE</h4>
                </div>
                <div className="text-center group/stat">
                  <p className="text-[11px] font-black uppercase tracking-[0.5em] text-white/40 mb-4 italic group-hover:text-accent transition-colors">GRID_UPTIME</p>
                  <h4 className="text-5xl lg:text-6xl font-display font-black italic leading-none group-hover:scale-110 transition-transform tabular-nums">99.9%</h4>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Deep Stack Management */}
        <section className="space-y-12">
          <div className="flex items-center gap-8 px-4">
            <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
               <HardDrive size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic">DEEP_STACK_MANAGEMENT</h3>
            <div className="h-px flex-1 bg-primary/10" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advancedModules.map((item, index) => (
              <motion.div 
                key={item.id}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <FFCard 
                  className="p-8 flex items-center justify-between cursor-pointer border-none shadow-3xl shadow-black/[0.005] bg-white group opacity-60 hover:opacity-100 transition-all rounded-[36px] hover:bg-gray-50/50"
                  onClick={() => {}}
                >
                  <div className="flex items-center gap-8">
                    <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500 ${item.color}`}>
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-display font-black text-primary text-xl uppercase italic tracking-tighter leading-none group-hover:text-primary transition-colors">{item.label}</h4>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] mt-2 italic leading-none">{item.desc}</p>
                    </div>
                  </div>
                  <div className="text-[10px] font-black italic text-gray-300 uppercase tracking-widest group-hover:text-success transition-colors">
                     {item.status}
                  </div>
                </FFCard>
              </motion.div>
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
              <p className="text-[12px] text-gray-400 font-black uppercase tracking-[0.8em] italic leading-relaxed">STATION_ENGINE // Parent Command Oversight Matrix v4.4.2</p>
              <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.4em] italic opacity-40">Unauthorized access to governance layer is strictly prohibited by central authority</p>
           </div>
        </footer>
      </main>
    </div>
  );
};

export default FamilyAdminPanelScreen;
