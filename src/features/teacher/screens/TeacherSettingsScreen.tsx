import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  User, 
  BookOpen, 
  Users, 
  Languages, 
  Bell, 
  LogOut,
  ChevronRight,
  Save,
  Settings,
  Fingerprint,
  Cpu,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFAvatar from '../../../shared/components/FFAvatar';
import FFBadge from '../../../shared/components/FFBadge';

const TeacherSettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [name, setName] = useState(user?.name || 'Mr. Ahmed');
  const [subject, setSubject] = useState('Mathematics');
  const [language, setLanguage] = useState('English');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-48">
      {/* Config Header */}
      <header className="bg-white/95 backdrop-blur-2xl p-8 lg:p-14 border-b border-black/[0.03] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="flex items-center gap-10">
            <div className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-primary/30 relative group overflow-hidden">
               <div className="absolute inset-x-0 bottom-0 h-1 bg-accent/30 animate-pulse" />
               <Settings size={40} className="relative z-10 group-hover:rotate-90 transition-transform duration-1000" />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <FFBadge variant="accent" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none">CONFIG_STATION</FFBadge>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none whitespace-nowrap">STATION_LINK_v4.2.0</p>
                </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none">
                Terminal Config
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <FFButton 
              variant="primary" 
              size="sm" 
              icon={<Save size={20} />} 
              onClick={handleSave}
              isLoading={isSaving}
              className="px-10 rounded-[20px] h-16 text-[12px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 italic group"
            >
              APPLY_CHANGES
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

      <main className="max-w-3xl mx-auto p-12 lg:p-24 space-y-24 pt-16">
        {/* Profile Cluster */}
        <div className="flex flex-col items-center text-center space-y-8 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-10" />
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            className="p-3 rounded-[56px] bg-white shadow-3xl border border-black/5 relative group/avatar"
          >
            <FFAvatar name={name} size="xl" className="ring-[12px] ring-primary/5 rounded-[44px]" />
            <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-accent rounded-[18px] border-4 border-white shadow-xl flex items-center justify-center text-primary scale-90">
               <Fingerprint size={20} />
            </div>
          </motion.div>
          
          <div className="space-y-4">
             <div className="flex items-center justify-center gap-3">
                <FFBadge variant="primary" className="font-black px-4 py-1.5 text-[10px] uppercase tracking-widest italic rounded-lg">VERIFIED_EDUCATOR</FFBadge>
                <p className="text-[11px] text-gray-300 font-black uppercase tracking-[0.4em] italic leading-none">REGISTRY_ACTIVE</p>
             </div>
             <h2 className="text-5xl font-display font-black text-primary tracking-tighter uppercase italic leading-none">{name}</h2>
          </div>
        </div>

        {/* Identity Matrix */}
        <section className="space-y-12">
          <div className="flex items-center gap-8 px-4">
            <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
               <Cpu size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic leading-none">PROFESSIONAL_IDENTITY_MATRIX</h3>
            <div className="h-px flex-1 bg-primary/10" />
          </div>

          <FFCard className="p-12 space-y-12 border-none shadow-3xl shadow-black/[0.01] bg-white rounded-[56px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-[0.01] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
               <User size={240} strokeWidth={1} />
            </div>

            <div className="space-y-4 relative z-10">
              <label className="text-[10px] font-black text-primary/30 uppercase tracking-[0.4em] italic ml-1 leading-none">NOMENCLATURE_PROTOCOL</label>
              <div className="relative group/field">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/20 group-focus-within/field:text-primary transition-colors">
                  <User size={28} />
                </div>
                <input 
                  type="text" 
                  className="w-full pl-20 pr-10 py-8 bg-gray-50/50 border border-black/[0.02] rounded-[32px] font-display font-black text-3xl text-primary focus:bg-white focus:border-primary/20 focus:ring-8 focus:ring-primary/5 transition-all italic uppercase tracking-tighter placeholder:text-gray-200"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="NOMENCLATURE..."
                />
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              <label className="text-[10px] font-black text-primary/30 uppercase tracking-[0.4em] italic ml-1 leading-none">ACADEMIC_DOMAIN_VECTOR</label>
              <div className="relative group/field">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/20 group-focus-within/field:text-primary transition-colors">
                  <BookOpen size={28} />
                </div>
                <input 
                  type="text" 
                  className="w-full pl-20 pr-10 py-8 bg-gray-50/50 border border-black/[0.02] rounded-[32px] font-display font-black text-3xl text-primary focus:bg-white focus:border-primary/20 focus:ring-8 focus:ring-primary/5 transition-all italic uppercase tracking-tighter placeholder:text-gray-200"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="DOMAIN..."
                />
              </div>
            </div>
          </FFCard>
        </section>

        {/* Operational Modules */}
        <section className="space-y-12">
          <div className="flex items-center gap-8 px-4">
            <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
               <Layers size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic leading-none">OPERATIONAL_PREFERENCES</h3>
            <div className="h-px flex-1 bg-primary/10" />
          </div>

          <div className="grid gap-8">
            <FFCard 
              className="p-8 flex items-center justify-between cursor-pointer border-none shadow-3xl shadow-black/[0.01] bg-white rounded-[40px] group hover:bg-amber-50/50 transition-all overflow-hidden relative"
              onClick={() => navigate('/notifications/preferences')}
            >
               <div className="absolute top-0 right-0 p-8 opacity-[0.01] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                  <Bell size={120} strokeWidth={1} />
               </div>
              <div className="flex items-center gap-10 relative z-10">
                <div className="w-20 h-20 bg-amber-50 rounded-[28px] flex items-center justify-center text-amber-500 shadow-inner group-hover:rotate-6 transition-transform duration-500">
                  <Bell size={32} />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-amber-600/40 uppercase tracking-[0.2em] italic leading-none mb-2">SIGNAL_CALIBRATION</p>
                  <h4 className="text-3xl font-display font-black text-primary uppercase italic tracking-tighter leading-none">Interaction Alerts</h4>
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-200 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:translate-x-1">
                <ChevronRight size={28} />
              </div>
            </FFCard>

            <FFCard className="p-8 flex items-center justify-between border-none shadow-3xl shadow-black/[0.01] bg-white rounded-[40px] group overflow-hidden relative">
               <div className="absolute top-0 right-0 p-8 opacity-[0.01] pointer-events-none">
                  <Languages size={120} strokeWidth={1} />
               </div>
              <div className="flex items-center gap-10 relative z-10">
                <div className="w-20 h-20 bg-indigo-50 rounded-[28px] flex items-center justify-center text-indigo-500 shadow-inner group-hover:-rotate-6 transition-transform duration-500">
                  <Languages size={32} />
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-indigo-600/40 uppercase tracking-[0.2em] italic leading-none mb-2">LINGUISTIC_MATRIX</p>
                   <h4 className="text-3xl font-display font-black text-primary uppercase italic tracking-tighter leading-none">Core Language</h4>
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
                <ChevronRight size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-primary opacity-20 rotate-90 pointer-events-none" />
              </div>
            </FFCard>
          </div>
        </section>

        {/* Security Matrix */}
        <section className="pt-12 space-y-12">
          <button
            onClick={() => {
              logout();
              navigate('/demo-login');
            }}
            className="w-full h-32 rounded-[56px] border-4 border-dashed border-alert/20 text-alert font-black uppercase tracking-[0.5em] flex items-center justify-center gap-8 hover:bg-alert hover:text-white hover:border-alert transition-all duration-700 group overflow-hidden relative shadow-lg italic"
          >
            <div className="absolute inset-0 bg-alert translate-y-full group-hover:translate-y-0 transition-transform duration-700 -z-10" />
            <LogOut size={36} className="group-hover:-translate-x-2 transition-transform duration-500" />
            <span className="text-2xl">TERMINATE_PORTAL_SESSION</span>
          </button>
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
    </div>
  );
};

export default TeacherSettingsScreen;
