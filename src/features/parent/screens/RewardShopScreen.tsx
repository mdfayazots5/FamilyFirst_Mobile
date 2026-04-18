import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Plus, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Settings2,
  ChevronRight,
  Coins,
  Sparkles,
  Trash2,
  Package,
  ShieldCheck,
  Target,
  Zap,
  Ticket,
  Gem,
  Gift,
  Search,
  Cpu,
  RefreshCcw,
  Layers,
  Fingerprint,
  Smartphone,
  ShieldAlert,
  Archive,
  Menu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { RewardRepository, Reward, Redemption } from '../../parent/repositories/RewardRepository';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFBadge from '../../../shared/components/FFBadge';
import FFAvatar from '../../../shared/components/FFAvatar';
import FFEmptyState from '../../../shared/components/FFEmptyState';

const RewardShopScreen: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [rewards, setRewards] = useState<Reward[]>([]);
  const [pendingRedemptions, setPendingRedemptions] = useState<Redemption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');

  const fetchData = useCallback(async () => {
    if (!user?.familyId) return;
    setIsLoading(true);
    try {
      const [rewardList, pendingList] = await Promise.all([
        RewardRepository.getRewards(user.familyId, false),
        RewardRepository.getPendingRedemptions(user.familyId)
      ]);
      setRewards(rewardList);
      setPendingRedemptions(pendingList);
    } catch (error) {
      console.error('Failed to fetch reward shop data', error);
    } finally {
      setTimeout(() => setIsLoading(false), 800);
    }
  }, [user?.familyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleReviewRedemption = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      await RewardRepository.reviewRedemption(id, status);
      setPendingRedemptions(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Failed to review redemption', error);
    }
  };

  const toggleReward = async (reward: Reward) => {
    if (!user?.familyId) return;
    try {
      await RewardRepository.updateReward(user.familyId, reward.id, { isEnabled: !reward.isEnabled });
      setRewards(prev => prev.map(r => r.id === reward.id ? { ...r, isEnabled: !r.isEnabled } : r));
    } catch (error) {
      console.error('Failed to toggle reward', error);
    }
  };

  if (isLoading && rewards.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#FDFCFB]">
        <div className="w-24 h-24 bg-amber-500/5 rounded-[32px] flex items-center justify-center text-amber-500 mb-8 relative group">
           <div className="absolute inset-0 bg-amber-500/10 rounded-[32px] animate-ping opacity-20" />
           <Gem size={40} className="animate-pulse" />
        </div>
        <div className="text-center space-y-3">
           <p className="text-[12px] font-black text-amber-600 uppercase tracking-[0.5em] animate-pulse italic">SYNCHRONIZING_TREASURY...</p>
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-60">Asset Registry Protocol Active</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-48">
      {/* Requisition Header */}
      <header className="bg-white/95 backdrop-blur-2xl p-8 lg:p-14 border-b border-black/[0.03] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="flex items-center gap-10">
            <div className="w-24 h-24 bg-amber-500 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-amber-500/30 relative group overflow-hidden">
               <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 animate-pulse" />
               <Gift size={40} className="relative z-10" />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <FFBadge variant="accent" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none">ASSET_TREASURY</FFBadge>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none whitespace-nowrap">REGISTRY_STATUS: ONLINE</p>
                </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none">
                The Marketplace
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4 p-2 bg-gray-50 border border-black/5 rounded-[28px] shadow-inner">
            {[
              { id: 'active', label: 'INVENTORY', icon: <Package size={18} /> },
              { id: 'pending', label: 'REDEMPTIONS', icon: <Clock size={18} /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-10 py-5 rounded-[20px] text-[11px] font-black uppercase tracking-widest transition-all duration-500 italic relative overflow-hidden group/tab ${activeTab === tab.id ? 'bg-primary text-white shadow-2xl shadow-primary/40 scale-105' : 'text-gray-400 hover:text-primary'}`}
              >
                {tab.icon} 
                {tab.label}
                {tab.id === 'pending' && pendingRedemptions.length > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 bg-accent text-white rounded-full text-[9px] flex items-center justify-center border-2 border-white shadow-lg ml-2 font-black tabular-nums"
                  >
                    {pendingRedemptions.length}
                  </motion.span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 lg:p-14 space-y-24 pt-16">
        <AnimatePresence mode="wait">
          {activeTab === 'active' ? (
            <motion.section
              key="active"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
              className="space-y-16"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-4">
                 <div className="space-y-4">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-amber-500/5 rounded-xl flex items-center justify-center text-amber-600">
                          <Ticket size={20} />
                       </div>
                       <h2 className="text-4xl font-display font-black text-primary uppercase italic tracking-tighter leading-none">Global Inventory</h2>
                    </div>
                    <p className="text-gray-400 font-medium italic max-w-xl text-lg leading-relaxed">
                      Manage active protocol rewards and deployment readiness. Changes to stock levels synchronize across all connected marketplace terminals.
                    </p>
                 </div>
                 <FFButton 
                  variant="primary" 
                  size="sm" 
                  icon={<Plus size={20} />}
                  className="px-10 rounded-[20px] h-16 text-[12px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 italic group"
                >
                  ADD_NEW_ASSET
                </FFButton>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {rewards.map((reward, index) => (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <FFCard className={`p-10 border-none shadow-3xl shadow-black/[0.01] rounded-[56px] transition-all duration-700 relative overflow-hidden bg-white group/card ${!reward.isEnabled ? 'grayscale-[0.8] opacity-60' : 'hover:bg-gray-50/50'}`}>
                      <div className="absolute top-0 right-0 p-12 opacity-[0.01] pointer-events-none translate-x-12 translate-y-[-10%] group-hover/card:scale-105 transition-transform duration-1000">
                         <Package size={240} strokeWidth={1} />
                      </div>

                      <div className="relative z-10 flex flex-col h-full justify-between gap-12">
                        <div className="flex justify-between items-start">
                          <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center text-5xl shadow-inner border-2 border-black/[0.02] transform group-hover/card:rotate-6 transition-transform duration-700 ${reward.isEnabled ? 'bg-amber-50 text-amber-500' : 'bg-gray-100'}`}>
                            {reward.icon}
                          </div>
                          <FFBadge variant={reward.isEnabled ? 'success' : 'gray'} size="sm" className="font-black px-4 py-2 uppercase italic tracking-widest text-[10px] rounded-xl whitespace-nowrap">
                             {reward.isEnabled ? 'IN_STOCK' : 'RESERVE_MODE'}
                          </FFBadge>
                        </div>

                        <div className="space-y-6">
                          <div className="space-y-2">
                             <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] italic leading-none">ID_{reward.id.substring(0, 8).toUpperCase()}</p>
                             <h4 className="text-4xl font-display font-black text-primary uppercase italic tracking-tighter leading-none group-hover/card:text-amber-600 transition-colors">{reward.name}</h4>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3 px-6 py-3 bg-amber-500 rounded-[20px] text-white shadow-xl shadow-amber-500/20 group-hover/card:scale-110 transition-transform">
                              <Coins size={20} fill="white" strokeWidth={0} />
                              <span className="text-2xl font-display font-black italic tabular-nums leading-none mb-1">{reward.coinCost}</span>
                            </div>
                            <div className="px-5 py-2.5 bg-gray-50 border border-black/5 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest italic leading-none">
                               {reward.category.toUpperCase()}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-10 border-t border-black/[0.03]">
                           <div className="flex items-center gap-4">
                              <button
                                onClick={() => toggleReward(reward)}
                                className={`w-20 h-10 rounded-full transition-all duration-500 relative ${reward.isEnabled ? 'bg-success shadow-xl shadow-success/20' : 'bg-gray-200'}`}
                              >
                                <motion.div 
                                  animate={{ x: reward.isEnabled ? 40 : 4 }}
                                  className="absolute top-2 left-1 w-6 h-6 bg-white rounded-full shadow-md"
                                />
                              </button>
                              <span className={`text-[10px] font-black uppercase tracking-widest italic ${reward.isEnabled ? 'text-success' : 'text-gray-300'}`}>
                                 {reward.isEnabled ? 'ACTIVE' : 'DISABLED'}
                              </span>
                           </div>
                          <button className="w-12 h-12 rounded-[18px] flex items-center justify-center text-gray-200 hover:text-alert hover:bg-alert/5 transition-all duration-500 group/trash">
                             <Trash2 size={24} className="group-hover/trash:scale-110" />
                          </button>
                        </div>
                      </div>
                    </FFCard>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          ) : (
            <motion.section
              key="pending"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto space-y-16"
            >
               <div className="flex items-center gap-8 px-4">
                  <div className="w-12 h-12 bg-accent/5 rounded-[18px] flex items-center justify-center text-accent">
                     <RefreshCcw size={24} strokeWidth={2.5} className="animate-spin-slow" />
                  </div>
                  <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic leading-none">PENDING_REQUISITION_QUEUE</h3>
                  <div className="h-px flex-1 bg-primary/10" />
               </div>

              {pendingRedemptions.length === 0 ? (
                <div className="bg-white p-24 rounded-[64px] border border-black/[0.03] text-center shadow-3xl shadow-black/[0.01]">
                   <div className="w-24 h-24 bg-success/5 rounded-[40px] flex items-center justify-center text-success/20 mx-auto mb-10">
                      <ShieldCheck size={48} />
                   </div>
                   <h4 className="text-2xl font-display font-black text-primary uppercase italic tracking-tighter mb-4">VAULT_LOCKED_SECURE</h4>
                   <p className="text-gray-400 font-medium italic">All requisition packets have been processed. The pending queue is currently encrypted and clear.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-10">
                  {pendingRedemptions.map((redemption, idx) => (
                    <motion.div
                      key={redemption.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <FFCard className="p-0 overflow-hidden border-none shadow-3xl shadow-black/[0.01] rounded-[64px] group bg-white relative">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.01] pointer-events-none group-hover:scale-105 transition-transform duration-1000">
                           <Gem size={240} strokeWidth={1} />
                        </div>

                        <div className="p-12 flex flex-col gap-12 relative z-10">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                              <div className="flex items-center gap-8">
                                <div className="relative group/avatar">
                                  <FFAvatar name={redemption.childName} size="xl" className="ring-8 ring-accent/5 rounded-[36px] shadow-2xl transition-all group-hover/avatar:ring-accent group-hover/avatar:rotate-3 duration-500" />
                                  <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-accent rounded-[18px] border-4 border-white shadow-xl flex items-center justify-center text-white scale-90 group-hover/avatar:scale-110 transition-transform">
                                     <Fingerprint size={20} />
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <div className="space-y-1">
                                     <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] italic leading-none">SIGNAL_ORIGIN: UNIT_{redemption.childName.toUpperCase()}</p>
                                     <h4 className="text-4xl lg:text-5xl font-display font-black text-primary uppercase italic tracking-tighter leading-none">{redemption.childName}</h4>
                                  </div>
                                  <FFBadge variant="accent" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest text-[10px] rounded-lg">REQUISITION_AUTH_PENDING</FFBadge>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-3 text-right">
                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 mb-2">
                                   <Smartphone size={20} />
                                </div>
                                <p className="text-[10px] text-gray-200 font-black uppercase tracking-widest italic leading-none">ENTRY_TIMESTAMP</p>
                                <p className="text-lg font-display font-black text-gray-400 uppercase tracking-widest italic leading-none tabular-nums overflow-hidden text-ellipsis whitespace-nowrap">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                              </div>
                          </div>

                          <div className="bg-gray-50/50 rounded-[48px] p-10 flex flex-col md:flex-row md:items-center justify-between gap-10 border border-black/[0.02] shadow-inner">
                             <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                   <div className="w-6 h-0.5 bg-accent/30 rounded-full" />
                                   <p className="text-[11px] text-accent font-black uppercase tracking-[0.4em] italic leading-none">ASSET_REQUEST_PKT</p>
                                </div>
                                <h5 className="text-4xl md:text-5xl font-display font-black text-primary uppercase italic tracking-tighter leading-none flex items-center gap-6">
                                   <span className="text-4xl text-gray-200 bg-white p-6 rounded-[24px] shadow-sm"><Gem size={32} /></span>
                                   {redemption.rewardName}
                                </h5>
                             </div>
                             <div className="flex items-center gap-6 px-10 py-5 bg-amber-500 rounded-[32px] text-white shadow-2xl shadow-amber-500/20 border-4 border-white group-hover:scale-105 transition-all duration-500">
                                <Coins size={32} fill="white" strokeWidth={0} />
                                <span className="text-4xl font-display font-black italic tabular-nums leading-none mb-1">{redemption.coinCost}</span>
                             </div>
                          </div>
                        </div>

                        <div className="p-8 flex flex-col md:flex-row gap-6 bg-white border-t border-black/[0.03]">
                          <button
                            onClick={() => handleReviewRedemption(redemption.id, 'Rejected')}
                            className="flex-1 h-24 bg-gray-50 text-gray-400 rounded-[36px] font-black text-[12px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-alert/5 hover:text-alert transition-all border border-black/[0.01] hover:shadow-xl hover:shadow-alert/5 group/deny"
                          >
                            <XCircle size={28} className="group-hover/deny:rotate-90 transition-transform duration-500" />
                            DENY_PURCHASE
                          </button>
                          <button
                            onClick={() => handleReviewRedemption(redemption.id, 'Approved')}
                            className="flex-[2] h-24 bg-success text-white rounded-[36px] font-black text-[12px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-2xl shadow-success/30 hover:bg-black transition-all active:scale-95 italic group/auth"
                          >
                            <ShieldCheck size={28} className="group-hover/auth:animate-pulse" />
                            AUTHORIZE_DISBURSEMENT
                          </button>
                        </div>
                      </FFCard>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>

        <footer className="text-center space-y-12 py-40 px-8 border-t border-black/[0.03]">
           <div className="flex items-center justify-center gap-10 text-primary/10">
              <div className="h-px w-32 bg-current" />
              <ShieldCheck size={40} />
              <div className="h-px w-32 bg-current" />
           </div>
           <div className="space-y-4">
              <p className="text-[12px] text-gray-400 font-black uppercase tracking-[0.8em] italic leading-relaxed">STATION_ENGINE // Tactical Requisition Matrix v4.4.2</p>
              <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.4em] italic opacity-40">Unauthorized access to requisition telemetry is strictly prohibited</p>
           </div>
        </footer>
      </main>
    </div>
  );
};

export default RewardShopScreen;
