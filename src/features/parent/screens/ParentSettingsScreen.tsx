import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Bell, 
  Users, 
  Shield, 
  CreditCard, 
  Share2, 
  ChevronRight,
  Globe,
  LogOut,
  User,
  Settings,
  Zap,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  ChevronDown,
  Cpu,
  Layers,
  Fingerprint,
  Radar,
  Network,
  Command,
  Activity,
  HardDrive
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFBadge from '../../../shared/components/FFBadge';

import { AppConfig } from '../../../core/config/appConfig';

const ParentSettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [language, setLanguage] = useState('English');

  const handleLogout = () => {
    logout();
    navigate('/demo-login');
  };

  const code = 'FAM-7829-X';
  const handleShareCode = () => {
    const text = `Join my family on FAMILYFIRST! Use code: ${code}`;
    if (navigator.share) {
      navigator.share({ title: 'Join FamilyFirst', text, url: window.location.origin });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-48">
      {/* Command Header */}
      <header className="bg-white/95 backdrop-blur-2xl p-8 lg:p-14 border-b border-black/[0.03] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="flex items-center gap-10">
            <div className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-primary/30 relative group overflow-hidden">
               <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 animate-pulse" />
               <Settings size={40} className="relative z-10 group-hover:rotate-90 transition-transform duration-1000" />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <FFBadge variant="accent" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none">COMMAND_STATION</FFBadge>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none whitespace-nowrap">STATION_LINK_v3.4.0</p>
                </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none">
                Command Array
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

      <main className="max-w-4xl mx-auto p-12 lg:p-24 space-y-24 pt-16">
        {/* Governance Matrix */}
        <section className="space-y-12">
          <div className="flex items-center gap-8 px-4">
            <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
               <Layers size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic leading-none">CORE_GOVERNANCE_LAYERS</h3>
            <div className="h-px flex-1 bg-primary/10" />
          </div>

          <div className="grid grid-cols-1 gap-8">
            <motion.div whileHover={{ y: -8 }} whileTap={{ scale: 0.98 }}>
              <FFCard 
                className="p-10 border-none shadow-3xl shadow-black/[0.01] bg-white rounded-[56px] flex items-center justify-between group hover:bg-primary/5 transition-all cursor-pointer overflow-hidden relative"
                onClick={() => navigate('/parent/admin')}
              >
                <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none translate-x-12 translate-y-[-24%] group-hover:scale-110 transition-transform duration-1000">
                   <Users size={180} strokeWidth={1} />
                </div>
                <div className="flex items-center gap-10 relative z-10">
                  <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center text-primary shadow-3xl shadow-black/[0.02] border border-black/[0.01] group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                    <ShieldCheck size={40} />
                  </div>
                  <div>
                    <h4 className="text-3xl font-display font-black text-primary uppercase italic tracking-tighter leading-none mb-4 group-hover:text-primary transition-colors">Governance Registry</h4>
                    <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.3em] italic leading-none">ROLES_PERMISSIONS_OVERRIDE</p>
                  </div>
                </div>
                <div className="w-16 h-16 bg-gray-50 rounded-[24px] border border-black/[0.03] flex items-center justify-center text-gray-200 group-hover:text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm relative z-10">
                   <ChevronRight size={32} />
                </div>
              </FFCard>
            </motion.div>

            <motion.div whileHover={{ y: -8 }} whileTap={{ scale: 0.98 }}>
              <FFCard 
                className="p-10 border-none shadow-3xl shadow-black/[0.01] bg-white rounded-[56px] flex items-center justify-between group hover:bg-accent/5 transition-all cursor-pointer overflow-hidden relative"
                onClick={handleShareCode}
              >
                <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none translate-x-12 translate-y-[-24%] group-hover:scale-110 transition-transform duration-1000">
                   <Network size={180} strokeWidth={1} />
                </div>
                <div className="flex items-center gap-10 relative z-10">
                  <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center text-accent shadow-3xl shadow-black/[0.02] border border-black/[0.01] group-hover:scale-110 group-hover:-rotate-6 transition-all duration-700">
                    <Share2 size={40} />
                  </div>
                  <div>
                    <h4 className="text-3xl font-display font-black text-primary uppercase italic tracking-tighter leading-none mb-4">Expansion Protocol</h4>
                    <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.3em] italic leading-none">NODE_RECRUITMENT_ACTIVE</p>
                  </div>
                </div>
                 <div className="px-10 h-20 bg-accent text-white rounded-[32px] font-display font-black text-3xl italic tracking-tighter shadow-3xl shadow-accent/40 flex items-center justify-center relative z-10 group-hover:scale-105 transition-all">
                    {code}
                 </div>
              </FFCard>
            </motion.div>
          </div>
        </section>

        {/* Diagnostics & Interface */}
        <section className="space-y-12">
          <div className="flex items-center gap-8 px-4">
            <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
               <Cpu size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic leading-none">DIAGNOSTIC_CALIBRATION</h3>
            <div className="h-px flex-1 bg-primary/10" />
          </div>

          <div className="grid grid-cols-1 gap-10">
            <motion.div whileHover={{ x: 8 }} whileTap={{ scale: 0.98 }}>
              <FFCard 
                className="p-10 border-none shadow-3xl shadow-black/[0.01] bg-white rounded-[48px] flex items-center justify-between group hover:bg-amber-50/50 transition-all cursor-pointer overflow-hidden relative"
                onClick={() => navigate('/notifications/preferences')}
              >
                <div className="flex items-center gap-10 relative z-10">
                  <div className="w-20 h-20 bg-amber-50 rounded-[28px] flex items-center justify-center text-amber-500 shadow-inner group-hover:rotate-12 transition-transform duration-500">
                    <Bell size={32} />
                  </div>
                  <div>
                    <h4 className="text-3xl font-display font-black text-primary uppercase italic tracking-tighter leading-none mb-2">Signal Filters</h4>
                    <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.3em] italic leading-none">TELEMETRY_ALERT_MATRIX</p>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gray-50 rounded-[20px] flex items-center justify-center text-gray-200 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm relative z-10">
                   <ChevronRight size={28} />
                </div>
              </FFCard>
            </motion.div>

            {AppConfig.features.subscriptionEnabled && (
              <motion.div whileHover={{ x: 8 }} whileTap={{ scale: 0.98 }}>
                <FFCard 
                  className="p-10 border-none shadow-3xl shadow-black/[0.01] bg-white rounded-[48px] flex items-center justify-between group hover:bg-success/5 transition-all cursor-pointer overflow-hidden relative"
                  onClick={() => navigate('/profile/subscription')}
                >
                  <div className="flex items-center gap-10 relative z-10">
                    <div className="w-20 h-20 bg-success rounded-[28px] flex items-center justify-center text-white shadow-3xl shadow-success/20 group-hover:scale-110 transition-transform duration-700">
                      <CreditCard size={32} />
                    </div>
                    <div>
                      <div className="flex items-center gap-4 mb-3">
                        <h4 className="text-3xl font-display font-black text-primary uppercase italic tracking-tighter leading-none">Tier Status</h4>
                        <FFBadge size="sm" variant="success" className="font-black px-4 py-1 text-[10px] uppercase italic tracking-widest italic rounded-lg">PRIMARY_NODE</FFBadge>
                      </div>
                      <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.3em] italic leading-none">ENERGY_QUOTA_STRATUM_ACTIVE</p>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-gray-50 rounded-[20px] flex items-center justify-center text-gray-200 group-hover:bg-success group-hover:text-white transition-all shadow-sm relative z-10">
                     <ChevronRight size={28} />
                  </div>
                </FFCard>
              </motion.div>
            )}

            <FFCard className="p-10 border-none shadow-3xl shadow-black/[0.01] bg-white rounded-[48px] flex items-center justify-between group overflow-hidden relative">
              <div className="flex items-center gap-10 relative z-10">
                <div className="w-20 h-20 bg-indigo-50 rounded-[28px] flex items-center justify-center text-indigo-500 shadow-inner group-hover:-rotate-12 transition-transform duration-500">
                  <Globe size={32} />
                </div>
                <div>
                  <h4 className="text-3xl font-display font-black text-primary uppercase italic tracking-tighter leading-none mb-2">Linguistic Unit</h4>
                  <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.3em] italic leading-none">INTERFACE_MAPPING_PROTOCOL</p>
                </div>
              </div>
              <div className="relative z-10">
                <select 
                  className="bg-gray-50/80 border border-black/[0.05] rounded-[24px] px-10 h-16 font-display font-black text-primary uppercase italic appearance-none cursor-pointer focus:outline-none pr-14 hover:bg-indigo-50 transition-colors shadow-inner"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option>English_US</option>
                  <option>Hindi_IN</option>
                  <option>Tamil_IN</option>
                  <option>Telugu_IN</option>
                  <option>Marathi_IN</option>
                </select>
                <ChevronDown size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
              </div>
            </FFCard>
          </div>
        </section>

        {/* Security Module */}
        <section className="pt-24 space-y-12">
           <div className="flex items-center gap-10 px-8 py-10 bg-alert/[0.02] rounded-[48px] border border-alert/5">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-alert shadow-2xl shadow-alert/5 border border-alert/5">
                 <ShieldCheck size={32} />
              </div>
              <div className="space-y-1">
                 <p className="text-[11px] font-black text-primary uppercase tracking-[0.4em] italic leading-none">ENCRYPTION_LAYER_ACTIVE</p>
                 <p className="text-[10px] text-gray-300 font-medium italic opacity-60">Session secured via AES-256 end-to-end command protocol</p>
              </div>
           </div>

          <button
            onClick={handleLogout}
            className="w-full h-32 rounded-[56px] bg-white text-alert font-black text-2xl uppercase tracking-[0.4em] flex items-center justify-center gap-8 hover:bg-alert hover:text-white transition-all duration-700 hover:shadow-3xl hover:shadow-alert/20 active:scale-95 italic border-4 border-alert/5 group overflow-hidden relative"
          >
            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 animate-pulse opacity-0 group-hover:opacity-100" />
            <LogOut size={36} className="group-hover:translate-x-2 transition-transform duration-500" />
            DECOMMISSION_PORTAL_SESSION
          </button>
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

export default ParentSettingsScreen;
