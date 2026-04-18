import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserPlus, 
  ArrowLeft, 
  Phone,
  User,
  Shield,
  ChevronRight,
  CheckCircle2,
  Fingerprint,
  Activity,
  ShieldCheck,
  Radar,
  Command,
  Sparkles,
  Zap,
  Target,
  Hash,
  Smartphone,
  Info,
  RefreshCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFBadge from '../../../shared/components/FFBadge';
import { FamilyRepository } from '../repositories/FamilyRepository';
import { useAuth, UserRole } from '../../../core/auth/AuthContext';

const AddMemberScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.PARENT);
  const [linkType, setLinkType] = useState('Mother');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.familyId) return;
    
    setIsLoading(true);
    try {
      await FamilyRepository.addMember(user.familyId, { name, phone, role, linkType });
      setIsSuccess(true);
      setTimeout(() => navigate('/parent/members'), 2500);
    } catch (error) {
      console.error('Failed to add member', error);
    } finally {
      setIsLoading(false);
    }
  };

  const linkTypes = [
    'Father', 'Mother', 'Son', 'Daughter', 'Grandfather', 'Grandmother', 
    'Tutor', 'ArabicTeacher', 'Driver', 'Caregiver'
  ];

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-8 overflow-hidden relative">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <Radar size={800} className="absolute -top-1/4 -right-1/4 animate-pulse" />
          <Activity size={400} className="absolute -bottom-20 -left-20" />
        </div>

        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="text-center space-y-12 max-w-sm relative z-10"
        >
          <div className="w-32 h-32 bg-success rounded-[40px] flex items-center justify-center mx-auto text-white shadow-3xl shadow-success/40 relative group overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-white/30 animate-pulse" />
            <ShieldCheck size={64} className="relative z-10" />
            <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
               className="absolute inset-0 border-4 border-white/10 border-dashed rounded-full scale-[1.5]"
            />
          </div>
          
          <div className="space-y-4">
            <FFBadge variant="success" size="sm" className="font-black px-6 py-2 uppercase italic tracking-widest text-[12px] rounded-xl leading-none">PERSONNEL_AUTHORIZED</FFBadge>
            <h2 className="text-5xl lg:text-6xl font-display font-black text-primary tracking-tighter uppercase italic leading-none">Unit_Inducted</h2>
            <p className="text-gray-400 font-medium italic text-lg leading-relaxed">Registry successfully synced. Secure link established for <span className="text-primary font-black uppercase">{name}</span>. Uploading credentials...</p>
          </div>
          
          <div className="pt-8">
            <div className="w-24 h-2.5 bg-gray-100 rounded-full mx-auto overflow-hidden border border-black/[0.03] p-0.5">
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: 2.2, ease: "easeInOut" }}
                className="w-full h-full bg-success rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"
              />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-48">
      {/* Induction Portal Header */}
      <header className="bg-white/95 backdrop-blur-2xl p-8 lg:p-14 border-b border-black/[0.03] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="flex items-center gap-10">
            <div className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-primary/30 relative group overflow-hidden">
               <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 animate-pulse" />
               <UserPlus size={40} className="relative z-10 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <FFBadge variant="primary" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none">PERSONNEL_INDUCTION</FFBadge>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none whitespace-nowrap">NEW_OPERATIVE_GENERATOR</p>
                </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none text-balance">
                Induct New <span className="text-primary underline decoration-primary/10 decoration-8 underline-offset-8">Operative</span>
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

      <main className="max-w-4xl mx-auto p-8 lg:p-14 pt-16 relative">
        <div className="absolute inset-0 opacity-[0.01] pointer-events-none overflow-hidden">
           <Zap size={600} className="absolute -top-20 -right-20" />
        </div>

        <form onSubmit={handleAdd} className="space-y-16 relative z-10">
          <div className="flex items-center gap-8 px-4">
            <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
               <Fingerprint size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic leading-none">BIOMETRIC_IDENTIFIERS</h3>
            <div className="h-px flex-1 bg-primary/10" />
          </div>

          <FFCard className="p-10 lg:p-16 space-y-12 shadow-3xl shadow-black/[0.01] border-none bg-white rounded-[64px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-16 opacity-[0.02] pointer-events-none translate-x-16 translate-y-[-20%] group-hover:scale-110 transition-transform duration-[3000ms]">
               <Command size={280} strokeWidth={1} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
              <div className="space-y-4">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] ml-1 flex items-center gap-2 italic">
                   <User size={14} className="text-primary/40" />
                   OPERATIVE_DESIGNATION
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-20 bg-gray-50/50 border-2 border-transparent rounded-[28px] px-8 font-display font-black text-2xl text-primary placeholder:text-gray-200 focus:bg-white focus:border-primary/10 focus:ring-8 focus:ring-primary/5 transition-all outline-none italic shadow-inner"
                    placeholder="e.g. ARJUN_GUPTA"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] ml-1 flex items-center gap-2 italic">
                   <Smartphone size={14} className="text-primary/40" />
                   COMM_ARRAY_VECTOR
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-20 bg-gray-50/50 border-2 border-transparent rounded-[28px] px-8 font-display font-black text-2xl text-primary placeholder:text-gray-200 focus:bg-white focus:border-primary/10 focus:ring-8 focus:ring-primary/5 transition-all outline-none italic tabular-nums shadow-inner"
                    placeholder="+91_"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/10">
                     <Target size={24} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
              <div className="space-y-4">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] ml-1 flex items-center gap-2 italic">
                   <Shield size={14} className="text-primary/40" />
                   AUTHORIZATION_STRATUM
                </label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full h-20 bg-gray-50/50 border-2 border-transparent rounded-[28px] px-8 font-display font-black text-2xl text-primary appearance-none focus:bg-white focus:border-primary/10 transition-all outline-none cursor-pointer italic shadow-inner"
                  >
                    <option value={UserRole.PARENT}>PARENT_COMMAND</option>
                    <option value={UserRole.ELDER}>ELDER_ADVISOR</option>
                    <option value={UserRole.TEACHER}>FIELD_OPERATIVE</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/30 rotate-90 pointer-events-none">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] ml-1 flex items-center gap-2 italic">
                   <Hash size={14} className="text-primary/40" />
                   RELATIONAL_MAP_KEY
                </label>
                <div className="relative">
                  <select
                    value={linkType}
                    onChange={(e) => setLinkType(e.target.value)}
                    className="w-full h-20 bg-gray-50/50 border-2 border-transparent rounded-[28px] px-8 font-display font-black text-2xl text-primary appearance-none focus:bg-white focus:border-primary/10 transition-all outline-none cursor-pointer italic shadow-inner"
                  >
                    {linkTypes.map(type => (
                      <option key={type} value={type}>{type.toUpperCase()}</option>
                    ))}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/30 rotate-90 pointer-events-none">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </div>
            </div>
          </FFCard>

          <div className="bg-primary/5 border border-primary/10 p-8 rounded-[40px] flex items-start gap-6 relative overflow-hidden group">
             <div className="absolute right-0 bottom-0 opacity-[0.03] group-hover:scale-125 transition-transform duration-1000">
                <Info size={120} />
             </div>
             <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-xl shrink-0 group-hover:rotate-12 transition-transform">
                <Info size={24} />
             </div>
             <p className="text-sm text-gray-500 font-medium italic leading-relaxed relative z-10">Verification signals will be dispatched via the primary cellular array. Upon induction, the operative will be granted immediate access to the centralized family secure grid.</p>
          </div>

          <button 
            type="submit" 
            disabled={isLoading || !name || !phone}
            className="w-full h-28 rounded-[56px] bg-primary text-white font-black text-2xl uppercase tracking-[0.4em] flex items-center justify-center gap-6 shadow-3xl shadow-primary/30 hover:bg-black disabled:bg-gray-200 disabled:shadow-none transition-all duration-500 active:scale-95 italic group relative overflow-hidden"
          >
            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
            {isLoading ? (
               <RefreshCcw size={32} className="animate-spin text-accent" />
            ) : (
               <UserPlus size={32} strokeWidth={3} className="text-accent group-hover:scale-110 transition-transform duration-500" />
            )}
            {isLoading ? 'INITIATING_INDUCTION...' : 'DISPATCH_INVITATION'}
          </button>
        </form>

        <footer className="text-center space-y-12 py-40 px-8 border-t border-black/[0.03]">
           <div className="flex items-center justify-center gap-10 text-primary/10">
              <div className="h-px w-32 bg-current" />
              <ShieldCheck size={40} />
              <div className="h-px w-32 bg-current" />
           </div>
           <div className="space-y-4">
              <p className="text-[12px] text-gray-400 font-black uppercase tracking-[0.8em] italic leading-relaxed">STATION_ENGINE // Parent Command Induction Matrix v4.4.2</p>
              <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.4em] italic opacity-40">Unauthorized operative induction is strictly prohibited and monitored by system integrity</p>
           </div>
        </footer>
      </main>
    </div>
  );
};

export default AddMemberScreen;
