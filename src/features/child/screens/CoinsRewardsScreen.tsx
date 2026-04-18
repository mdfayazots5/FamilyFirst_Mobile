import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Coins, 
  History, 
  ShoppingBag, 
  ChevronRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  X,
  Sparkles,
  Zap,
  Globe,
  Quote,
  ArrowRight,
  ShieldAlert,
  Wallet,
  Building2,
  Gem
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { RewardRepository, Reward, CoinTransaction, Redemption } from '../../parent/repositories/RewardRepository';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFBadge from '../../../shared/components/FFBadge';
import RewardCard from '../widgets/RewardCard';

const CoinsRewardsScreen: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [rewards, setRewards] = useState<Reward[]>([]);
  const [history, setHistory] = useState<CoinTransaction[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [activeTab, setActiveTab] = useState<'shop' | 'history'>('shop');

  const currentCoins = 340; // Demo value

  const fetchData = useCallback(async () => {
    if (!user?.familyId || !user?.id) return;
    setIsLoading(true);
    try {
      const [rewardList, historyList] = await Promise.all([
        RewardRepository.getRewards(user.familyId),
        RewardRepository.getCoinHistory(user.id)
      ]);
      setRewards(rewardList);
      setHistory(historyList);
    } catch (error) {
      console.error('Failed to fetch coins/rewards data', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.familyId, user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRedeem = async () => {
    if (!selectedReward || !user?.id) return;
    setIsRedeeming(true);
    try {
       // In a real app we'd call the repository
       // await RewardRepository.redeemReward(selectedReward.id, user.id);
       // For demo/UI polish:
       const mockRedemption: Redemption = {
         id: Math.random().toString(36).substr(2, 9),
         rewardId: selectedReward.id,
         rewardName: selectedReward.name,
         childProfileId: user?.id || 'demo_child',
         childName: user?.name || 'Arjun',
         status: 'Pending',
         coinCost: selectedReward.coinCost,
         requestedAt: new Date().toISOString()
       };
      setRedemptions(prev => [...prev, mockRedemption]);
      setSelectedReward(null);
    } catch (error) {
      console.error('Failed to redeem reward', error);
    } finally {
      setIsRedeeming(false);
    }
  };

  if (isLoading) return (
     <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-8">
        <div className="text-center space-y-8">
           <motion.div 
              animate={{ rotateY: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="w-24 h-24 bg-amber-400 rounded-full flex items-center justify-center text-white text-5xl shadow-2xl shadow-amber-400/20 mx-auto"
           >
              <Coins size={48} fill="white" />
           </motion.div>
           <p className="text-[12px] font-black text-primary uppercase tracking-[0.5em] animate-pulse">SYNCHRONIZING_TREASURY_OFFLINE...</p>
        </div>
     </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-40">
      {/* Dynamic Navigation Header */}
      <header className="bg-white/90 backdrop-blur-2xl p-8 lg:p-14 border-b border-black/[0.03] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="flex items-center gap-10">
            <div className="w-24 h-24 bg-amber-400 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-amber-400/20 transition-transform hover:rotate-12 duration-500">
              <Coins size={40} fill="white" />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <FFBadge variant="accent" size="sm" className="font-black">TREASURY_DEPOT</FFBadge>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Liquid_Value: Maximum</p>
                </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none">
                The Vault
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-2 p-2 bg-gray-50 border border-black/5 rounded-[28px] shadow-inner">
              {[
                { id: 'shop', label: 'MARKETPLACE', icon: <ShoppingBag size={18} /> },
                { id: 'history', label: 'LEDGER', icon: <History size={18} /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-3 px-8 h-14 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] italic transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-2xl shadow-primary/20 scale-105' : 'text-gray-400 hover:text-primary'}`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
            <button 
              onClick={() => navigate(-1)}
              className="w-14 h-14 bg-white rounded-2xl border border-black/5 text-gray-300 hover:text-primary transition-all shadow-sm flex items-center justify-center group active:scale-90"
            >
              <ArrowLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 lg:p-14 space-y-20">
        {/* Wealth Administration Section */}
        <section className="bg-primary p-16 rounded-[64px] text-white overflow-hidden relative shadow-2xl shadow-primary/30 group">
          <div className="absolute top-0 right-0 p-16 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-1000 -rotate-12 translate-x-16 translate-y-[-20%] pointer-events-none">
            <Globe size={480} strokeWidth={1} />
          </div>
          
          <div className="relative z-10 grid grid-cols-1 xl:grid-cols-2 gap-16 items-center">
            <div className="flex items-end gap-8">
              <span className="text-9xl md:text-[12rem] font-display font-black tracking-tighter italic leading-none group-hover:scale-105 transition-transform origin-left duration-700">{currentCoins}</span>
              <div className="pb-8">
                <p className="text-[12px] font-black uppercase tracking-[0.5em] text-white/40 mb-3 italic">CREDITS_RESERVE</p>
                <div className="flex items-center gap-3">
                   <FFBadge variant="accent" size="sm" className="font-black px-4 py-1.5">TIER: ELITE_PROTOCOL</FFBadge>
                   <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40">
                      <Gem size={18} />
                   </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="p-10 bg-white/5 rounded-[40px] border border-white/5 backdrop-blur-xl shadow-inner group/stat hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between mb-6">
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 italic">DAILY_ACCUMULATION</p>
                   <TrendingUp size={16} className="text-success" />
                </div>
                <div className="text-5xl font-display font-black italic text-success tracking-tighter">+55.00</div>
              </div>
              <div className="p-10 bg-white/5 rounded-[40px] border border-white/5 backdrop-blur-xl shadow-inner group/stat hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between mb-6">
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 italic">VELOCITY_EXPENDED</p>
                   <TrendingDown size={16} className="text-alert" />
                </div>
                <div className="text-5xl font-display font-black italic text-alert tracking-tighter">-120.00</div>
              </div>
            </div>
          </div>
        </section>

        <AnimatePresence mode="wait">
          {activeTab === 'shop' ? (
            <motion.div
              key="shop"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-16"
            >
              <div className="flex items-center gap-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/30 italic">AVAILABLE_BOUNTIES</h3>
                <div className="h-px flex-1 bg-primary/10" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{rewards.length} Units_Active</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {rewards.map(reward => (
                  <RewardCard 
                    key={reward.id} 
                    reward={reward} 
                    currentCoins={currentCoins}
                    isPending={redemptions.some(r => r.rewardId === reward.id && r.status === 'Pending')}
                    onClick={() => setSelectedReward(reward)}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-16 max-w-5xl mx-auto"
            >
               <div className="flex items-center gap-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/30 italic">TRANSACTION_ARCHIVES</h3>
                <div className="h-px flex-1 bg-primary/10" />
              </div>
              <div className="space-y-6">
                {history.length === 0 ? (
                   <div className="py-40 text-center opacity-20">
                      <Building2 size={80} strokeWidth={1} className="mx-auto mb-10" />
                      <p className="text-[12px] font-black uppercase tracking-[0.5em]">No_Archives_Found</p>
                   </div>
                ) : (
                  history.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <FFCard className="p-10 border-none shadow-2xl shadow-black/[0.01] bg-white rounded-[40px] flex items-center justify-between group cursor-pointer hover:bg-primary/[0.01] transition-all">
                        <div className="flex items-center gap-10">
                          <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 duration-500 ${item.type === 'Earned' ? 'bg-success/5 text-success border border-success/10' : 'bg-alert/5 text-alert border border-alert/10'}`}>
                            {item.type === 'Earned' ? <TrendingUp size={32} /> : <TrendingDown size={32} />}
                          </div>
                          <div>
                            <h4 className="text-2xl font-display font-black text-primary uppercase italic tracking-tighter group-hover:text-accent transition-colors">{item.description}</h4>
                            <div className="flex items-center gap-4 mt-3">
                               <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-lg">
                                  <Clock size={12} />
                                  {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                               </div>
                               <div className="w-1 h-1 bg-gray-200 rounded-full" />
                               <span className="text-[10px] text-gray-300 font-black uppercase tracking-[0.2em]">SEQ_ID: {item.id.slice(0, 8).toUpperCase()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-10">
                           <div className={`text-4xl md:text-5xl font-display font-black italic tracking-tighter ${item.type === 'Earned' ? 'text-success' : 'text-alert'}`}>
                             {item.type === 'Earned' ? '+' : '-'}{item.amount}
                           </div>
                           <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-200 group-hover:bg-white group-hover:text-primary transition-all shadow-inner">
                              <ArrowRight size={20} />
                           </div>
                        </div>
                      </FFCard>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Corporate Redemption Protocol Overlay */}
      <AnimatePresence>
        {selectedReward && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReward(null)}
              className="fixed inset-0 bg-primary/40 backdrop-blur-xl z-[60] px-6 flex items-center justify-center p-8"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0, rotateX: 20 }}
                animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                exit={{ scale: 0.8, opacity: 0, rotateX: 20 }}
                className="max-w-2xl w-full bg-white rounded-[64px] shadow-2xl p-16 text-center space-y-12 relative overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="absolute top-0 right-0 p-16 opacity-[0.05] pointer-events-none -rotate-12 translate-x-12">
                  <Zap size={320} strokeWidth={1} />
                </div>

                <div className="relative">
                   <div className="absolute inset-0 bg-amber-400/20 blur-3xl rounded-full scale-150 animate-pulse" />
                   <div className="w-32 h-32 bg-amber-400 rounded-[40px] flex items-center justify-center text-6xl shadow-2xl shadow-amber-400/40 mx-auto relative transform -rotate-6 group-hover:rotate-0 transition-transform duration-700">
                     {selectedReward.icon}
                   </div>
                </div>
                
                <div className="space-y-6 relative z-10">
                  <h3 className="text-5xl font-display font-black text-primary tracking-tighter uppercase italic leading-tight">Authorize_Transfer?</h3>
                  <p className="text-gray-500 font-medium leading-relaxed text-lg px-8">
                    Initiating high-velocity redemption order for <span className="text-primary font-black italic">{selectedReward.title.toUpperCase()}</span>. This operation will debit <span className="text-accent font-black underline decoration-4 underline-offset-8">{selectedReward.coinCost} CREDITS</span> from your reserve.
                  </p>
                </div>

                <div className="pt-8 flex flex-col gap-6 relative z-10">
                  <button 
                     className="w-full h-24 rounded-[32px] bg-primary text-white font-display font-black text-2xl uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 transform hover:scale-[1.02] active:scale-95 transition-all italic flex items-center justify-center gap-4 group"
                     onClick={handleRedeem}
                  >
                     <ShieldAlert size={28} />
                     CONFIRM_AUTHORITY
                  </button>
                  <button 
                    className="h-16 text-[11px] font-black text-gray-300 uppercase tracking-[0.5em] hover:text-primary transition-all underline decoration-2 underline-offset-8 decoration-gray-100 hover:decoration-primary"
                    onClick={() => setSelectedReward(null)}
                  >
                    ABORT_PROTOCOL
                  </button>
                </div>

                <div className="flex items-center justify-center gap-3 text-[8px] font-black text-gray-200 uppercase tracking-[0.4em]">
                   <Building2 size={12} />
                   VAULT_SECURE_ENCRYPTION_ACTIVE
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <footer className="text-center space-y-4 py-20 px-8">
         <div className="flex items-center justify-center gap-4 text-primary/10">
            <div className="h-px w-12 bg-current" />
            <Wallet size={20} />
            <div className="h-px w-12 bg-current" />
         </div>
         <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.5em]">TREASURY_ENGINE // FamilyFirst Wealth Administration v1.0.2</p>
      </footer>
    </div>
  );
};

export default CoinsRewardsScreen;
