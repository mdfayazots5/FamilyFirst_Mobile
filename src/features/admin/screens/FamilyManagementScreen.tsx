import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  ArrowLeft, 
  MoreVertical,
  Calendar,
  Users,
  CreditCard,
  ShieldAlert,
  Fingerprint,
  Zap,
  Globe,
  Database,
  Activity,
  ShieldCheck,
  RefreshCcw,
  Layers,
  Terminal,
  Cpu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminRepository, AdminFamily } from '../repositories/AdminRepository';
import FFCard from '../../../shared/components/FFCard';
import FFBadge from '../../../shared/components/FFBadge';
import FFButton from '../../../shared/components/FFButton';

const FamilyManagementScreen: React.FC = () => {
  const navigate = useNavigate();
  const [families, setFamilies] = useState<AdminFamily[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        const data = await AdminRepository.getFamilies();
        setFamilies(data);
      } catch (error) {
        console.error('Failed to fetch families', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFamilies();
  }, []);

  const filteredFamilies = families.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'All' || f.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusVariant = (status: string): any => {
    switch (status) {
      case 'Active': return 'success';
      case 'Trial': return 'accent';
      case 'Churned': return 'outline';
      case 'Flagged': return 'alert';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-48">
      {/* High-Command Header */}
      <header className="bg-white/95 backdrop-blur-2xl p-8 lg:p-14 border-b border-black/[0.03] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="flex items-center gap-10">
            <div className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-primary/30 relative group overflow-hidden">
               <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
               <Users size={40} className="relative z-10" />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <FFBadge variant="accent" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none">CORE_REGISTRY</FFBadge>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none whitespace-nowrap">GLOBAL_FAMILY_UNITS</p>
                </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none">
                Family Command
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex gap-2 p-2 bg-gray-50 rounded-3xl border border-black/[0.03] shadow-inner overflow-hidden">
               {['All', 'Active', 'Trial', 'Churned', 'Flagged'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-6 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all italic ${
                      filterStatus === s 
                        ? 'bg-primary text-white shadow-xl shadow-primary/20' 
                        : 'text-gray-400 hover:text-primary transition-colors'
                    }`}
                  >
                    {s}
                  </button>
                ))}
            </div>
            <button 
              onClick={() => navigate(-1)}
              className="w-16 h-16 bg-white rounded-[24px] border border-black/5 text-gray-300 hover:text-primary transition-all shadow-sm flex items-center justify-center group active:scale-90"
            >
              <ArrowLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12">
           <div className="relative group max-w-2xl">
              <Search size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="PROBE_REGISTRY_DATABASE..." 
                className="w-full pl-16 pr-8 py-6 bg-gray-50/50 border border-black/5 rounded-[28px] focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-display font-black text-primary placeholder:text-gray-300 uppercase italic tracking-widest text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 lg:p-14 pt-16 space-y-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-8">
             <RefreshCcw size={48} className="text-primary animate-spin" />
             <p className="text-[12px] font-black text-gray-400 uppercase tracking-[0.8em] italic">FETCHING_REGISTRY_DATA...</p>
          </div>
        ) : filteredFamilies.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-40 space-y-8 bg-white rounded-[56px] border border-dashed border-gray-100"
          >
            <ShieldAlert size={80} className="mx-auto text-gray-200" />
            <div className="space-y-2">
              <h3 className="text-3xl font-display font-black text-gray-300 uppercase italic tracking-tighter">NO_MATCHING_UNITS_FOUND</h3>
              <p className="text-gray-300 font-bold uppercase tracking-widest text-xs italic leading-none">Modify probe parameters and re-scan registry</p>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {filteredFamilies.map((family, index) => (
              <motion.div
                key={family.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <FFCard className="p-10 border-none bg-white shadow-3xl shadow-black/[0.01] group hover:shadow-4xl transition-all rounded-[48px] overflow-hidden relative">
                   <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                    <Database size={140} strokeWidth={1} />
                  </div>
                  
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 relative z-10">
                    <div className="flex-1 space-y-6">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                           <Fingerprint size={28} />
                        </div>
                        <div>
                           <div className="flex items-center gap-4 mb-2">
                              <h3 className="text-3xl font-display font-black text-primary uppercase italic tracking-tighter leading-none group-hover:text-primary transition-colors">{family.name}</h3>
                              <FFBadge variant={getStatusVariant(family.status)} size="sm" className="font-black italic px-4 py-1 uppercase tracking-widest scale-90">{family.status}</FFBadge>
                           </div>
                           <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] italic leading-none">UNIT_ID: {family.id}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-8 pt-4">
                        <div className="space-y-2">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none flex items-center gap-2"><Users size={12} /> COLLECTIVE_SIZE</p>
                          <p className="text-lg font-black text-primary italic tabular-nums">{family.memberCount.toString().padStart(2, '0')}_UNITS</p>
                        </div>
                        <div className="space-y-2 lg:px-8 lg:border-x border-black/[0.03]">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none flex items-center gap-2"><CreditCard size={12} /> PROTOCOL_TIER</p>
                          <p className="text-lg font-black text-primary uppercase italic leading-none">{family.plan}_ACCESS</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none flex items-center gap-2"><Calendar size={12} /> INITIALIZATION</p>
                          <p className="text-lg font-black text-primary italic tabular-nums">{new Date(family.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 lg:pl-12 lg:border-l border-black/[0.03]">
                      <div className="text-right hidden sm:block space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none">Last Synchronization</p>
                        <p className="text-lg font-black text-primary italic tabular-nums leading-none">{new Date(family.lastActive).toLocaleDateString()}</p>
                      </div>
                      <FFButton variant="primary" size="lg" className="rounded-[24px] px-8 h-16 shadow-2xl shadow-primary/20">ACCESS_DEEP_INTEL</FFButton>
                      <button className="w-16 h-16 bg-gray-50 rounded-[20px] flex items-center justify-center text-gray-300 hover:text-primary transition-all">
                        <MoreVertical size={28} />
                      </button>
                    </div>
                  </div>
                </FFCard>
              </motion.div>
            ))}
          </div>
        )}

        <footer className="text-center py-24 space-y-6">
           <div className="flex items-center justify-center gap-10 text-primary/10">
              <div className="h-px w-32 bg-current" />
              <ShieldCheck size={40} />
              <div className="h-px w-32 bg-current" />
           </div>
           <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.8em] italic opacity-40 leading-relaxed">STATION_ENGINE // Registry Control v4.4.2</p>
        </footer>
      </main>
    </div>
  );
};

export default FamilyManagementScreen;

