import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Shield, 
  Eye, 
  EyeOff, 
  Save,
  Info,
  Check,
  X,
  Lock,
  Unlock,
  ShieldAlert,
  Fingerprint,
  Cpu,
  Zap,
  Network
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFBadge from '../../../shared/components/FFBadge';

const ModuleVisibilityScreen: React.FC = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const roles = ['PARENT', 'CHILD', 'TEACHER', 'ELDER'];
  const modules = [
    { id: 'attendance', name: 'Attendance', desc: 'PRESENCE_LOG_MARKING', icon: <Fingerprint size={16} /> },
    { id: 'tasks', name: 'Task Board', desc: 'OPERATIONAL_ROUTINES', icon: <Zap size={16} /> },
    { id: 'rewards', name: 'Reward Shop', desc: 'ASSET_REDEMPTION', icon: <Check size={16} /> },
    { id: 'feedback', name: 'Teacher Notes', desc: 'SIGNAL_INTELLIGENCE', icon: <Shield size={16} /> },
    { id: 'calendar', name: 'Family Calendar', desc: 'TEMPORAL_GRID', icon: <ShieldAlert size={16} /> },
    { id: 'reports', name: 'Weekly Reports', desc: 'ANALYTIC_DEBRIEF', icon: <Cpu size={16} /> },
    { id: 'safety', name: 'Safety & SOS', desc: 'EMERGENCY_OVERRIDE', icon: <Shield size={16} /> },
    { id: 'admin', name: 'Admin Panel', desc: 'CORE_CONFIGURATION', icon: <Network size={16} /> },
  ];

  // Initial state: everything visible for parents, restricted for others
  const [visibility, setVisibility] = useState<Record<string, Record<string, boolean>>>(
    roles.reduce((acc, role) => ({
      ...acc,
      [role]: modules.reduce((mAcc, mod) => ({
        ...mAcc,
        [mod.id]: role === 'PARENT' || (role === 'CHILD' && mod.id !== 'admin') || (role === 'TEACHER' && ['attendance', 'feedback'].includes(mod.id))
      }), {})
    }), {})
  );

  const toggleVisibility = (role: string, moduleId: string) => {
    // Prevent disabling admin for parents
    if (role === 'PARENT' && moduleId === 'admin') return;

    setVisibility(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [moduleId]: !prev[role][moduleId]
      }
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-48">
      {/* High-Command Header */}
      <header className="bg-white/95 backdrop-blur-2xl p-8 lg:p-14 border-b border-black/[0.03] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="flex items-center gap-10">
            <div className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-primary/30 relative group overflow-hidden">
               <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
               <Lock size={40} className="relative z-10" />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <FFBadge variant="accent" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none">ACCESS_CONTROL</FFBadge>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none whitespace-nowrap">GRID_VISIBILITY_SYSTEM</p>
                </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none">
                Permission Matrix
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <FFButton 
              size="lg" 
              icon={<Save size={24} />} 
              onClick={handleSave}
              isLoading={isSaving}
              className="px-10 h-16 rounded-[24px] shadow-2xl shadow-primary/20"
            >
              COMMIT_PROTOCOL
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

      <main className="max-w-7xl mx-auto p-8 lg:p-14 pt-16 space-y-16">
        {/* Warning Intel */}
        <div className="bg-primary p-8 lg:p-12 rounded-[48px] text-white overflow-hidden relative shadow-3xl shadow-primary/20 group">
          <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none group-hover:scale-110 transition-transform duration-[3000ms]">
            <ShieldAlert size={200} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="w-20 h-20 bg-white/10 rounded-[28px] flex items-center justify-center backdrop-blur-xl shrink-0">
               <Info size={36} className="text-accent" />
            </div>
            <div className="space-y-3">
               <h4 className="text-xl lg:text-2xl font-display font-black italic uppercase tracking-tight">SECURITY_DIRECTIVE: ACCESS_POLICIES</h4>
               <p className="text-white/60 text-lg leading-relaxed italic font-medium max-w-3xl">
                 Configure asset visibility per authorization tier. Changes are propagated across the secure multi-unit grid instantaneously. Unauthorized vectors will be restricted immediately upon protocol commit.
               </p>
            </div>
          </div>
        </div>

        {/* Visibility Platform */}
        <div className="overflow-hidden">
          <div className="overflow-x-auto no-scrollbar pb-10">
            <table className="w-full border-separate border-spacing-y-6">
              <thead>
                <tr>
                  <th className="text-left py-6 px-10 text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none">PLATFORM_VECTORS</th>
                  {roles.map(role => (
                    <th key={role} className="text-center py-6 px-4 text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none">
                      {role}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {modules.map((mod, index) => (
                  <motion.tr 
                    key={mod.id} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <td className="bg-white rounded-l-[40px] p-10 border-y border-l border-black/[0.03] shadow-3xl shadow-black/[0.01] transition-all group-hover:border-primary/10">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                          {mod.icon}
                        </div>
                        <div>
                          <div className="font-display font-black text-2xl text-primary uppercase italic tracking-tight">{mod.name}</div>
                          <div className="text-[10px] text-gray-300 font-black uppercase tracking-[0.3em] mt-2 italic leading-none">{mod.desc}</div>
                        </div>
                      </div>
                    </td>
                    {roles.map((role, idx) => {
                      const isVisible = visibility[role][mod.id];
                      return (
                        <td 
                          key={`${role}-${mod.id}`} 
                          className={`text-center p-10 border-y border-black/[0.03] bg-white transition-all group-hover:border-primary/10 ${
                            idx === roles.length - 1 ? 'rounded-r-[40px] border-r' : ''
                          } ${!isVisible ? 'bg-gray-50/50' : ''}`}
                        >
                          <motion.button
                            onClick={() => toggleVisibility(role, mod.id)}
                            disabled={role === 'PARENT' && mod.id === 'admin'}
                            whileHover={!(role === 'PARENT' && mod.id === 'admin') ? { scale: 1.1 } : {}}
                            whileTap={!(role === 'PARENT' && mod.id === 'admin') ? { scale: 0.9 } : {}}
                            className={`w-16 h-16 rounded-[24px] flex items-center justify-center mx-auto transition-all shadow-2xl relative overflow-hidden ${
                              isVisible 
                                ? 'bg-primary text-white shadow-primary/20' 
                                : 'bg-white text-gray-300 border border-black/5 hover:border-alert/50'
                            } ${role === 'PARENT' && mod.id === 'admin' ? 'opacity-30 cursor-not-allowed grayscale' : 'cursor-pointer'}`}
                          >
                            <div className="relative z-10">
                              {isVisible ? <Unlock size={24} strokeWidth={2.5} /> : <Lock size={24} strokeWidth={2.5} />}
                            </div>
                            {isVisible && (
                              <div className="absolute inset-0 bg-accent/20 animate-pulse opacity-20" />
                            )}
                          </motion.button>
                          <p className={`text-[9px] font-black uppercase tracking-[0.2em] mt-4 italic transition-colors ${isVisible ? 'text-primary' : 'text-gray-300'}`}>
                            {isVisible ? 'PERMITTED' : 'RESTRICTED'}
                          </p>
                        </td>
                      );
                    })}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <footer className="text-center py-24 space-y-6">
           <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.6em] italic opacity-40 leading-relaxed">
             GRID_ACCESS_PROTOCOL // ISO_SECURITY_STANDARD_v9
           </p>
        </footer>
      </main>
    </div>
  );
};

export default ModuleVisibilityScreen;

