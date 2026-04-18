import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  History, 
  TrendingUp, 
  TrendingDown, 
  Filter,
  Download,
  Search,
  ChevronRight,
  ArrowRight,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Zap,
  ShieldCheck,
  Activity,
  Award,
  Database,
  Calculator
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { RewardRepository, CoinTransaction } from '../../parent/repositories/RewardRepository';
import { FamilyRepository, FamilyMember } from '../../family/repositories/FamilyRepository';
import FFCard from '../../../shared/components/FFCard';
import FFAvatar from '../../../shared/components/FFAvatar';
import FFBadge from '../../../shared/components/FFBadge';

interface ExtendedTransaction extends CoinTransaction {
  childName: string;
}

const FamilyLedgerScreen: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<ExtendedTransaction[]>([]);
  const [children, setChildren] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Earned' | 'Spent'>('all');

  const fetchData = useCallback(async () => {
    if (!user?.familyId) return;
    setIsLoading(true);
    try {
      const members = await FamilyRepository.getMembers(user.familyId);
      const childrenList = members.filter(m => m.role === 'CHILD');
      setChildren(childrenList);

      // In a real app, we'd have a global ledger API. 
      // For demo, we aggregate from multiple children or use the Mock repository.
      const allTransactions: ExtendedTransaction[] = [];
      
      for (const child of childrenList) {
        const history = await RewardRepository.getCoinHistory(child.id);
        allTransactions.push(...history.map(t => ({ ...t, childName: child.name })));
      }

      // Sort by date desc
      setTransactions(allTransactions.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
    } catch (error) {
      console.error('Failed to fetch ledger data', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.familyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         t.childName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const totals = transactions.reduce((acc, t) => {
    if (t.type === 'Earned') acc.earned += t.amount;
    else acc.spent += t.amount;
    return acc;
  }, { earned: 0, spent: 0 });

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-32">
      {/* Treasury Ledger Header */}
      <header className="p-8 lg:p-14 space-y-12 bg-white/50 backdrop-blur-3xl sticky top-0 z-50 border-b border-black/[0.03]">
        <div className="max-w-7xl mx-auto flex items-start justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <FFBadge variant="primary" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none">TREASURY_LEDGER</FFBadge>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none">LEDGER_AUDIT: AUTHORITATIVE</p>
              </div>
            </div>
            <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none">
              Family <span className="text-accent underline decoration-accent/20 decoration-8 underline-offset-8">LEDGER</span>
            </h1>
          </div>
          <div className="flex gap-4">
             <button className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center text-gray-300 hover:text-primary shadow-sm border border-black/[0.03] transition-all active:scale-95 group">
                <Download size={28} className="group-hover:translate-y-1 transition-transform" />
             </button>
            <button 
              onClick={() => navigate(-1)}
              className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center text-gray-300 hover:text-primary shadow-sm border border-black/[0.03] transition-all active:scale-95 group"
            >
              <ArrowLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-12 lg:p-20 space-y-24">
        {/* Metric Directives */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <FFCard className="p-12 bg-primary border-none shadow-3xl shadow-primary/20 rounded-[56px] relative overflow-hidden group min-h-[340px] flex flex-col justify-between">
             <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none group-hover:scale-110 transition-transform duration-[4000ms]">
                <TrendingUp size={320} />
             </div>
             <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-center justify-between">
                  <div className="w-16 h-16 bg-white/10 rounded-[24px] flex items-center justify-center text-accent shadow-inner border border-white/5 group-hover:rotate-12 transition-transform">
                    <ArrowDownLeft size={32} />
                  </div>
                  <FFBadge variant="accent" size="sm" className="font-black border-none bg-accent/20 px-6 py-2 uppercase italic tracking-widest text-[12px] rounded-xl outline-dashed outline-1 outline-white/20">ASSET_INFLOW</FFBadge>
                </div>
                <div className="mt-12">
                  <p className="text-[110px] font-display font-black text-white italic tracking-tighter mb-4 leading-none group-hover:scale-105 transition-transform origin-left tabular-nums">{totals.earned}</p>
                  <div className="flex items-center gap-3">
                     <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                     <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.5em] italic leading-none mt-1">TOTAL_MINTED_CURRENCY</p>
                  </div>
                </div>
             </div>
          </FFCard>

          <FFCard className="p-12 border-none shadow-3xl shadow-black/[0.01] bg-white rounded-[56px] relative overflow-hidden group min-h-[340px] flex flex-col justify-between">
             <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:rotate-12 transition-transform duration-[6000ms]">
                <TrendingDown size={320} />
             </div>
             <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-center justify-between">
                  <div className="w-16 h-16 bg-gray-50 rounded-[24px] flex items-center justify-center text-primary/40 border border-black/[0.01] group-hover:rotate-12 transition-transform shadow-inner">
                    <ArrowUpRight size={32} />
                  </div>
                  <FFBadge variant="primary" size="sm" className="font-black border-none bg-primary/5 px-6 py-2 uppercase italic tracking-widest text-[12px] rounded-xl">ASSET_REDEMPTION</FFBadge>
                </div>
                <div className="mt-12">
                 <p className="text-[110px] font-display font-black text-primary italic tracking-tighter mb-4 leading-none group-hover:text-accent transition-colors tabular-nums">{totals.spent}</p>
                 <div className="flex items-center gap-3">
                    <Activity size={14} className="text-gray-300" />
                    <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.5em] italic leading-none mt-1">TOTAL_REDEEMED_ASSETS</p>
                 </div>
                </div>
             </div>
          </FFCard>
        </div>

        {/* Intelligence Filters */}
        <div className="flex flex-col md:flex-row gap-8 items-center max-w-5xl mx-auto pt-12 relative z-10">
          <div className="relative flex-1 w-full group/search">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-primary/20 group-focus-within/search:text-accent transition-colors" size={24} />
            <input 
              type="text"
              placeholder="SEARCH_LEDGER_BY_UNIT_OR_HASH..."
              className="w-full pl-22 pr-10 h-22 bg-white border-2 border-transparent rounded-[36px] focus:outline-none focus:border-accent/10 focus:bg-white transition-all font-display font-black text-primary text-2xl shadow-3xl shadow-black/[0.02] uppercase italic placeholder:text-gray-200 placeholder:tracking-tighter"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3 p-3 bg-white/60 backdrop-blur-xl border border-black/[0.03] rounded-[40px] shadow-3xl shadow-black/[0.02] overflow-x-auto whitespace-nowrap">
            {(['all', 'Earned', 'Spent'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-12 h-18 rounded-[28px] font-display font-black text-[12px] uppercase tracking-[0.3em] italic transition-all relative overflow-hidden group/btn ${filterType === type ? 'bg-primary text-white shadow-3xl shadow-primary/30 scale-105' : 'text-gray-300 hover:text-primary hover:bg-white'}`}
              >
                {filterType === type && <motion.div layoutId="ledger-filter-bg" className="absolute inset-0 bg-primary -z-10" />}
                {type}
              </button>
            ))}
          </div>
        </div>

        <section className="space-y-16">
          <div className="flex items-center gap-8 px-6">
             <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary group-hover:rotate-90 transition-transform">
                <Database size={24} />
             </div>
             <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic leading-none">TRANSACTION_REGISTRY</h3>
             <div className="h-px flex-1 bg-primary/10" />
             <p className="text-[11px] font-black text-primary/40 uppercase tracking-[0.4em] italic leading-none">{filteredTransactions.length}_ENTRIES_DECRYPTED</p>
          </div>

          {isLoading ? (
             <div className="py-60 text-center relative overflow-hidden rounded-[64px] bg-gray-50/30 border border-black/[0.02]">
                <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                   className="w-20 h-20 border-4 border-primary/5 border-t-primary rounded-[32px] mx-auto mb-10 shadow-2xl shadow-primary/10 flex items-center justify-center text-primary"
                >
                   <Calculator size={32} />
                </motion.div>
                <p className="text-[13px] font-black uppercase tracking-[0.6em] text-gray-300 animate-pulse italic">DECRYPTING_AUTHORITATIVE_LEDGER...</p>
              </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="py-60 text-center relative overflow-hidden rounded-[64px] bg-gray-50/30 border border-black/[0.02] space-y-10 group">
              <div className="w-32 h-32 bg-white rounded-[48px] flex items-center justify-center mx-auto text-gray-100 shadow-inner group-hover:scale-110 transition-transform duration-700">
                <Search size={64} strokeWidth={1} />
              </div>
              <div>
                <h4 className="text-3xl font-display font-black uppercase tracking-tighter text-primary/30 italic leading-none">Ledger: No Records</h4>
                <p className="text-[11px] font-black text-gray-300 mt-6 uppercase tracking-[0.5em] italic leading-none">ADJUST PARAMETERS TO SYNC DATA</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-10">
              {filteredTransactions.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05, duration: 0.6 }}
                >
                  <FFCard className="p-0 overflow-hidden border-none shadow-3xl shadow-black/[0.01] bg-white rounded-[56px] transition-all hover:translate-x-3 group cursor-pointer">
                    <div className="p-10 lg:p-12 flex flex-col md:flex-row md:items-center justify-between gap-10">
                      <div className="flex items-center gap-10">
                        <div className={`w-24 h-24 rounded-[36px] flex items-center justify-center border-2 shadow-2xl transition-all duration-700 group-hover:rotate-12 ${item.type === 'Earned' ? 'bg-success/5 border-success/10 text-success shadow-success/10' : 'bg-alert/5 border-alert/10 text-alert shadow-alert/10'}`}>
                          {item.type === 'Earned' ? <ArrowDownLeft size={40} /> : <ArrowUpRight size={40} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-6 mb-4">
                            <h4 className="font-display font-black text-3xl text-primary uppercase italic tracking-tighter group-hover:text-accent transition-colors leading-none">{item.description}</h4>
                            <FFBadge variant="primary" size="sm" className="bg-gray-50 border-black/5 text-gray-300 tracking-[0.2em] px-4 font-black italic rounded-xl">
                               #{item.id.slice(0, 10).toUpperCase()}
                            </FFBadge>
                          </div>
                          <div className="flex items-center gap-10">
                            <div className="flex items-center gap-4">
                               <FFAvatar name={item.childName} size="md" className="ring-4 ring-gray-50 shadow-inner group-hover:scale-110 transition-transform" />
                               <span className="text-[13px] font-black text-primary/60 uppercase tracking-[0.2em] italic">{item.childName}</span>
                            </div>
                            <div className="w-1.5 h-1.5 bg-gray-100 rounded-full" />
                            <div className="flex items-center gap-4 text-gray-300">
                               <Calendar size={14} className="group-hover:text-primary transition-colors" />
                               <span className="text-[11px] font-black uppercase tracking-[0.3em] italic">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-10 justify-between md:justify-end border-t border-black/[0.03] md:border-none pt-10 md:pt-0">
                        <div className="text-right">
                          <div className={`text-6xl md:text-8xl font-display font-black italic tracking-tighter leading-none mb-3 tabular-nums ${item.type === 'Earned' ? 'text-success' : 'text-alert'}`}>
                            {item.type === 'Earned' ? '+' : '-'}{item.amount}
                          </div>
                          <div className="flex items-center justify-end gap-3 text-amber-500">
                            <Coins size={16} fill="currentColor" className="animate-pulse" />
                            <span className="text-[11px] font-display font-black uppercase italic tracking-[0.4em] leading-none">CREDIT_VALUATION</span>
                          </div>
                        </div>
                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-200 group-hover:text-primary group-hover:bg-white transition-all shadow-inner group-hover:translate-x-1 group-hover:rotate-45">
                           <ArrowRight size={24} />
                        </div>
                      </div>
                    </div>
                  </FFCard>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>

       <footer className="text-center space-y-6 py-48 px-8 border-t border-black/[0.03]">
         <div className="flex items-center justify-center gap-12 text-primary/10">
            <div className="h-px w-32 bg-current" />
            <Database size={40} />
            <div className="h-px w-32 bg-current" />
         </div>
         <div className="space-y-4">
            <p className="text-[13px] text-gray-400 font-black uppercase tracking-[1em] italic leading-relaxed">AUDIT_ENGINE // Treasury Ledger Authorized v4.4.2</p>
            <p className="text-[11px] text-gray-300 font-black uppercase tracking-[0.5em] italic opacity-30">All capital flows are tracked via secure decentralized family hash-grids</p>
         </div>
      </footer>
    </div>
  );
};

export default FamilyLedgerScreen;
