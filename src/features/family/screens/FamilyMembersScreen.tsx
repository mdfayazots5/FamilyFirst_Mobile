import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Plus, 
  ChevronRight, 
  Shield, 
  Baby, 
  Heart, 
  GraduationCap,
  QrCode,
  Search,
  RefreshCcw,
  Fingerprint,
  Activity,
  ShieldCheck,
  Radar,
  Command,
  ArrowLeft,
  Sparkles,
  Zap,
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FFCard from '../../../shared/components/FFCard';
import FFAvatar from '../../../shared/components/FFAvatar';
import FFBadge from '../../../shared/components/FFBadge';
import FFButton from '../../../shared/components/FFButton';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import { FamilyRepository, FamilyMember } from '../repositories/FamilyRepository';
import { useAuth, UserRole } from '../../../core/auth/AuthContext';
import { AppConfig } from '../../../core/config/appConfig';

const FamilyMembersScreen: React.FC = () => {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMembers = async () => {
      if (!user?.familyId) return;
      try {
        const data = await FamilyRepository.getMembers(user.familyId);
        setMembers(data);
      } catch (error) {
        console.error('Failed to fetch members', error);
      } finally {
        setTimeout(() => setIsLoading(false), 800); // Thematic delay
      }
    };

    fetchMembers();
  }, [user?.familyId]);

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.PARENT: return <Shield size={16} strokeWidth={2.5} />;
      case UserRole.CHILD: return <Baby size={16} strokeWidth={2.5} />;
      case UserRole.ELDER: return <Heart size={16} strokeWidth={2.5} />;
      case UserRole.TEACHER: return <GraduationCap size={16} strokeWidth={2.5} />;
      default: return <Users size={16} strokeWidth={2.5} />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.PARENT: return 'primary';
      case UserRole.CHILD: return 'accent';
      case UserRole.ELDER: return 'success';
      case UserRole.TEACHER: return 'alert';
      default: return 'gray';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#FDFCFB]">
        <div className="w-24 h-24 bg-primary/5 rounded-[32px] flex items-center justify-center text-primary mb-8 relative group">
           <div className="absolute inset-0 bg-primary/10 rounded-[32px] animate-ping opacity-20" />
           <RefreshCcw size={40} className="animate-spin" />
        </div>
        <div className="text-center space-y-3">
           <p className="text-[12px] font-black text-primary uppercase tracking-[0.5em] animate-pulse italic">SCANNING_REGISTRY_ARRAY...</p>
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-60">Authorized Access Protocols Active</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-48">
      {/* Registry Header */}
      <header className="bg-white/95 backdrop-blur-2xl p-8 lg:p-14 border-b border-black/[0.03] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="flex items-center gap-10">
            <div className="w-24 h-24 bg-success/10 rounded-[32px] flex items-center justify-center text-success shadow-inner relative group overflow-hidden">
               <div className="absolute inset-0 bg-success/20 -translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
               <Users size={40} className="relative z-10 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <FFBadge variant="success" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none">PERSONNEL_FILE</FFBadge>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none whitespace-nowrap">FAMILY_NETWORK_STABLE</p>
                </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none">
                Personnel Registry
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/parent/join-code')}
              className="h-16 px-10 rounded-[24px] bg-white text-primary font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-4 border-2 border-primary/10 hover:border-primary hover:bg-primary/5 transition-all shadow-sm active:scale-95 italic whitespace-nowrap"
            >
              <QrCode size={20} />
              JOIN_PROTOCOL
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

      <main className="max-w-4xl mx-auto p-8 lg:p-14 pt-16 space-y-16">
        {/* Registry List */}
        <section className="space-y-10">
          <div className="flex items-center gap-8 px-4">
            <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
               <Radar size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic leading-none">ACTIVE_PERSONNEL_ARRAY</h3>
            <div className="h-px flex-1 bg-primary/10" />
          </div>

          <div className="grid grid-cols-1 gap-8">
            {members.length === 0 ? (
              <FFEmptyState 
                title="NO_PERSONNEL_FOUND"
                message="The registry is currently void of active family units. Initiate recruitment protocol to populate the array."
                icon={<Fingerprint size={64} className="text-gray-200" />}
                actionLabel="INITIATE_RECRUITMENT"
                onAction={() => navigate('/parent/add-member')}
                className="bg-white p-20 rounded-[56px] shadow-3xl shadow-black/[0.01]"
              />
            ) : (
              members.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 8 }}
                >
                  <FFCard 
                    className="group border-none shadow-3xl shadow-black/[0.01] bg-white p-8 rounded-[48px] cursor-pointer hover:bg-primary/5 transition-all overflow-hidden relative"
                    onClick={() => navigate(`/parent/children/${member.id}`)}
                  >
                    <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none translate-x-12 translate-y-[-10%] group-hover:scale-110 transition-transform duration-1000">
                       <Command size={140} strokeWidth={1} />
                    </div>
                    
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-10">
                        <div className="relative group/avatar">
                           <div className="absolute -inset-2 bg-gradient-to-tr from-primary/20 via-primary/5 to-transparent rounded-[32px] opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500 blur-sm" />
                           <FFAvatar name={member.name} size="xl" src={member.avatarUrl} className="ring-8 ring-white shadow-2xl relative z-10" />
                           <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-white flex items-center justify-center text-success shadow-lg z-20 border-2 border-success/10">
                              <ShieldCheck size={16} />
                           </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                             <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] italic leading-none">ID_{member.id.substring(0, 8).toUpperCase()}</p>
                             <div className="h-0.5 w-6 bg-primary/10 rounded-full" />
                          </div>
                          <h3 className="font-display font-black text-primary text-3xl leading-none mb-4 italic tracking-tighter uppercase group-hover:text-primary transition-colors">{member.name}</h3>
                          <div className="flex flex-wrap items-center gap-4">
                            <FFBadge variant={getRoleColor(member.role)} size="sm" className="flex items-center gap-2 px-4 py-1.5 font-black uppercase italic tracking-widest leading-none">
                              {getRoleIcon(member.role)}
                              {member.role.replace('_', ' ')}
                            </FFBadge>
                            <div className="h-6 w-px bg-black/[0.05]" />
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] italic">{member.linkType}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="hidden md:flex flex-col items-end gap-2 text-right">
                           <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none italic">LAST_SYNC</p>
                           <p className="font-bold text-gray-500 italic uppercase tabular-nums">14:02:44</p>
                        </div>
                        <div className="w-16 h-16 bg-white rounded-3xl border border-black/[0.03] flex items-center justify-center text-gray-200 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-500 shadow-sm">
                          <ChevronRight size={28} />
                        </div>
                      </div>
                    </div>
                  </FFCard>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Global Action Tier */}
        <section className="pt-12">
          <button 
            onClick={() => navigate('/parent/add-member')}
            className="w-full h-28 rounded-[56px] bg-primary text-white font-black text-2xl uppercase tracking-[0.4em] flex items-center justify-center gap-6 shadow-3xl shadow-primary/30 hover:bg-black transition-all duration-500 active:scale-95 italic group"
          >
            <div className="relative">
               <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-20" />
               <Plus size={32} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-500" />
            </div>
            INITIALIZE_PERSONNEL_ADD
          </button>
        </section>

        {/* Diagnostics & Quota */}
        {AppConfig.features.subscriptionEnabled && (
          <section className="relative group">
            <div className="absolute inset-0 bg-primary/5 rounded-[64px] -m-4 pointer-events-none group-hover:rotate-1 transition-transform duration-700" />
            <FFCard className="relative bg-white p-12 lg:p-14 rounded-[56px] border-none shadow-3xl shadow-black/[0.02] overflow-hidden">
               <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
                  <Activity size={240} strokeWidth={1} />
               </div>
               
               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                  <div className="space-y-6 flex-1 text-center md:text-left">
                     <div className="flex items-center justify-center md:justify-start gap-4">
                        <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
                           <Target size={24} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-2xl font-display font-black text-primary uppercase italic tracking-tighter">QUOTA_DIAGNOSTICS</h3>
                     </div>
                     <p className="text-gray-400 font-medium italic text-lg leading-relaxed max-w-sm">The current personnel stratum is reaching capacity under the <span className="text-primary font-black uppercase tracking-widest">v0.1_FREE_PROD</span> protocol.</p>
                  </div>
                  
                  <div className="bg-gray-50/80 p-10 rounded-[40px] border border-black/[0.03] w-full md:w-96 space-y-8">
                    <div className="space-y-4">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none">CHILD_UNITS</span>
                        <span className="text-xl font-display font-black text-primary italic leading-none tabular-nums">02 / 02</span>
                      </div>
                      <div className="h-4 bg-white rounded-full overflow-hidden shadow-inner border border-black/[0.02] p-1">
                        <div className="h-full bg-accent rounded-full w-full shadow-lg" />
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => navigate('/profile/subscription')}
                      className="w-full h-16 rounded-[24px] bg-accent text-white font-black text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:shadow-2xl hover:shadow-accent/40 transition-all duration-500 active:scale-95 italic group/sub"
                    >
                       <Zap size={18} fill="currentColor" className="group-hover/sub:scale-125 transition-transform" />
                       UPGRADE_CAPACITY
                    </button>
                    
                    <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest text-center italic opacity-60">Authorize Family Plan for expanded personnel array</p>
                  </div>
               </div>
            </FFCard>
          </section>
        )}

        <footer className="text-center space-y-12 py-40 px-8 border-t border-black/[0.03]">
           <div className="flex items-center justify-center gap-10 text-primary/10">
              <div className="h-px w-32 bg-current" />
              <ShieldCheck size={40} />
              <div className="h-px w-32 bg-current" />
           </div>
           <div className="space-y-4">
              <p className="text-[12px] text-gray-400 font-black uppercase tracking-[0.8em] italic leading-relaxed">PERSONNEL_STATION // Central Unit Registry v1.1.0</p>
              <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.4em] italic opacity-40">Unauthorized registry manipulation is strictly prohibited under security law</p>
           </div>
        </footer>
      </main>
    </div>
  );
};

export default FamilyMembersScreen;
