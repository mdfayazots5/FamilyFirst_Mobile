import React from 'react';
import { motion } from 'motion/react';
import { Coins, Lock, Clock, CheckCircle2 } from 'lucide-react';
import { Reward } from '../../parent/repositories/RewardRepository';

interface RewardCardProps {
  reward: Reward;
  currentCoins: number;
  isPending?: boolean;
  onClick: () => void;
}

const RewardCard: React.FC<RewardCardProps> = ({ reward, currentCoins, isPending, onClick }) => {
  const canAfford = currentCoins >= reward.coinCost;
  const progress = Math.min((currentCoins / reward.coinCost) * 100, 100);
  const coinsNeeded = reward.coinCost - currentCoins;

  return (
    <motion.div
      whileTap={canAfford && !isPending ? { scale: 0.98 } : {}}
      onClick={() => canAfford && !isPending && onClick()}
      className={`relative overflow-hidden rounded-[40px] border transition-all duration-300 group ${
        isPending 
          ? 'bg-accent/5 border-accent/20 shadow-xl shadow-accent/5' 
          : canAfford 
            ? 'bg-white border-black/[0.03] hover:border-primary/20 cursor-pointer shadow-md hover:shadow-2xl' 
            : 'bg-gray-50 border-black/5 opacity-80'
      }`}
    >
      <div className="p-6 flex flex-col h-full relative z-10">
        <div className="flex justify-between items-start mb-5">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-transform duration-500 shadow-inner border border-black/[0.02] ${canAfford ? 'bg-gray-50 group-hover:bg-primary group-hover:text-white group-hover:scale-110' : 'bg-gray-100'}`}>
            {reward.icon}
          </div>
          <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100/50 shadow-sm">
            <Coins size={14} className="text-amber-500" fill="currentColor" />
            <span className="text-xs font-numbers font-bold text-primary">{reward.coinCost}</span>
          </div>
        </div>

        <div className="flex-1">
          <h4 className="font-display font-bold text-primary leading-tight mb-1 content-center min-h-[40px] group-hover:text-accent transition-colors">{reward.name}</h4>
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">{reward.category}</p>
        </div>

        <div className="mt-6 pt-5 border-t border-black/[0.03]">
          {isPending ? (
            <div className="flex items-center gap-2 text-accent">
              <Clock size={16} className="animate-pulse" strokeWidth={2.5} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Pending Release</span>
            </div>
          ) : canAfford ? (
            <div className="flex items-center gap-2 text-success group/btn">
              <CheckCircle2 size={16} strokeWidth={2.5} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Ready for Claim</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between text-[8px] font-bold uppercase tracking-[0.2em] text-gray-400">
                <span>Gap: {coinsNeeded} Coins</span>
                <span>{Math.round(progress)}% Progress</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden border border-black/[0.02] shadow-inner">
                <motion.div 
                  className="h-full bg-primary relative"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                >
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </div>

      {!canAfford && !isPending && (
        <div className="absolute inset-0 bg-gray-50/20 backdrop-blur-[1px] pointer-events-none flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-black/[0.03]">
            <Lock size={20} className="text-gray-300" />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default RewardCard;
