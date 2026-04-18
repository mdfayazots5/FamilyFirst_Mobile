import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Check, 
  Zap, 
  Shield, 
  Users, 
  Clock,
  CreditCard,
  History
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFBadge from '../../../shared/components/FFBadge';

const SubscriptionScreen: React.FC = () => {
  const navigate = useNavigate();

  const plans = [
    {
      id: 'free',
      name: 'Basic',
      price: '₹0',
      period: 'Forever',
      features: ['Up to 2 Children', 'Basic Task Tracking', 'Standard Rewards'],
      isCurrent: false,
      color: 'bg-gray-50 text-gray-400'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '₹199',
      period: 'per month',
      features: ['Unlimited Children', 'AI Task Suggestions', 'Teacher Integration', 'Advanced Reports', 'Priority Support'],
      isCurrent: true,
      color: 'bg-primary text-white'
    },
    {
      id: 'family',
      name: 'Family Plus',
      price: '₹999',
      period: 'per year',
      features: ['Everything in Premium', '2 Months Free', 'Family Vault Access', 'Custom Reward Catalog'],
      isCurrent: false,
      color: 'bg-accent text-white'
    }
  ];

  const paymentHistory = [
    { id: 'inv_1', date: 'Oct 12, 2025', amount: '₹199', status: 'Paid' },
    { id: 'inv_2', date: 'Sep 12, 2025', amount: '₹199', status: 'Paid' },
    { id: 'inv_3', date: 'Aug 12, 2025', amount: '₹199', status: 'Paid' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-48">
      <header className="p-12 lg:p-24 space-y-12 flex flex-col md:flex-row md:items-end md:justify-between gap-12 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/[0.02] rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />

        <div className="flex-1 space-y-6 relative z-10">
          <div className="flex items-center gap-4">
             <FFBadge variant="accent" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none outline-dashed outline-1 outline-accent/40">TREASURY_OVERSIGHT</FFBadge>
             <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          </div>
          <h1 className="text-5xl md:text-8xl font-display font-black text-primary tracking-tighter uppercase italic leading-none">Command Matrix</h1>
          <p className="text-[14px] text-gray-400 font-black uppercase tracking-[0.4em] italic leading-none opacity-60">Manage your treasury nodes and operational access</p>
        </div>

        <div className="flex items-center gap-6 relative z-10">
          <button 
            onClick={() => navigate(-1)}
            className="w-18 h-18 bg-white rounded-[28px] border-2 border-black/[0.03] text-gray-300 hover:text-primary transition-all shadow-3xl shadow-black/[0.02] flex items-center justify-center group active:scale-95"
          >
            <ArrowLeft size={32} className="group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 space-y-24">
        {/* Current Plan Status */}
        <section>
          <FFCard className="p-12 md:p-16 bg-primary text-white relative overflow-hidden shadow-3xl shadow-primary/20 border-none rounded-[64px] group">
            <div className="absolute top-0 right-0 p-16 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-1000 p-16 pointer-events-none translate-x-12 translate-y-[-24%]">
               <Zap size={320} strokeWidth={1} />
            </div>
            <div className="relative z-10 space-y-12">
              <div className="flex justify-between items-start">
                <div className="space-y-6">
                  <FFBadge variant="accent" className="font-black px-6 py-2 shadow-2xl shadow-accent/40 uppercase italic tracking-[0.2em] rounded-xl text-[12px]">ACTIVE_ACCESS_PROTOCOL</FFBadge>
                  <h2 className="text-5xl md:text-7xl font-display font-black tracking-tighter uppercase italic leading-none">Premium Matrix</h2>
                </div>
                <div className="w-24 h-24 bg-white/10 rounded-[32px] backdrop-blur-md border-2 border-white/10 flex items-center justify-center shadow-inner group-hover:rotate-[360deg] transition-transform duration-[2000ms]">
                  <CreditCard size={44} />
                </div>
              </div>
              <div className="flex items-center gap-4 text-[12px] font-black uppercase tracking-[0.4em] text-white/60 italic leading-none">
                <Clock size={18} className="text-accent" />
                <span>Auto-sync sequence: Nov 12, 2025</span>
              </div>
            </div>
          </FFCard>
        </section>

        {/* Plan Selection Matrix */}
        <section className="space-y-12">
          <div className="flex items-center gap-8 px-4">
            <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
               <Shield size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic leading-none">STRATUM_SELECTION_MATRIX</h3>
            <div className="h-px flex-1 bg-primary/10" />
          </div>

          <div className="grid gap-10">
            {plans.map((plan, idx) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <FFCard 
                  className={`p-12 border-4 transition-all hover:shadow-3xl relative overflow-hidden group rounded-[56px] ${
                    plan.isCurrent 
                      ? 'border-primary bg-white shadow-primary/10' 
                      : 'border-transparent bg-white/50 grayscale-[0.5] hover:grayscale-0 hover:bg-white'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-12 mb-12">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                         <h4 className="text-4xl font-display font-black text-primary uppercase italic tracking-tighter leading-none">{plan.name}</h4>
                         {plan.isCurrent && (
                           <FFBadge variant="success" className="font-black px-4 py-1 italic tracking-widest text-[9px] rounded-lg">LIVE_CONFIG</FFBadge>
                         )}
                         {plan.id === 'family' && !plan.isCurrent && (
                           <FFBadge variant="accent" className="font-black px-4 py-1 italic tracking-widest text-[9px] rounded-lg">OPTIMIZED_UNIT</FFBadge>
                         )}
                      </div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-5xl font-display font-black text-primary italic leading-none tracking-tighter">{plan.price}</span>
                        <span className="text-[11px] text-gray-400 font-black uppercase tracking-widest italic">{plan.period}</span>
                      </div>
                    </div>

                    {!plan.isCurrent && (
                      <FFButton 
                        variant={plan.id === 'family' ? 'accent' : 'outline'}
                        className="px-14 h-20 rounded-[28px] font-display font-black text-[13px] uppercase italic tracking-[0.2em] shadow-2xl active:scale-95 group/btn"
                      >
                        <div className="flex items-center gap-4">
                           <span>{plan.id === 'free' ? 'DEGRADE_UNIT' : 'SYNC_PROTOCOL'}</span>
                           <Zap size={18} className="group-hover/btn:animate-pulse" />
                        </div>
                      </FFButton>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 pt-12 border-t border-black/[0.03]">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-4 text-[13px] text-primary font-black uppercase tracking-wide italic leading-none list-none">
                        <div className="w-6 h-6 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                          <Check size={14} className="text-success" strokeWidth={4} />
                        </div>
                        <span className="opacity-70">{f}</span>
                      </li>
                    ))}
                  </div>
                </FFCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Tactical Ledger */}
        <section className="space-y-12">
          <div className="flex items-center gap-8 px-4">
            <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
               <History size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic leading-none">TACTICAL_TRANSACTION_LEDGER</h3>
            <div className="h-px flex-1 bg-primary/10" />
          </div>

          <FFCard className="border-none shadow-3xl shadow-black/[0.01] bg-white rounded-[56px] overflow-hidden">
            <div className="divide-y-2 divide-black/[0.03]">
              {paymentHistory.map((item, idx) => (
                <motion.div 
                  key={item.id} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-10 flex justify-between items-center hover:bg-gray-50/50 transition-colors group cursor-default"
                >
                  <div className="flex items-center gap-10">
                    <div className="w-16 h-16 bg-gray-50 rounded-[24px] flex items-center justify-center text-gray-300 border border-black/[0.03] group-hover:rotate-6 transition-transform">
                      <History size={28} />
                    </div>
                    <div className="space-y-2">
                      <p className="font-display font-black text-2xl text-primary uppercase italic tracking-tighter leading-none">{item.date}</p>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.5em] italic leading-none opacity-40">NODE_ID::{item.id}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-4">
                    <p className="text-4xl font-display font-black text-primary leading-none tracking-tighter italic">{item.amount}</p>
                    <FFBadge variant="success" size="sm" className="font-black text-[9px] py-1 px-4 italic tracking-widest rounded-lg">LEDGER_PAID</FFBadge>
                  </div>
                </motion.div>
              ))}
            </div>
          </FFCard>
        </section>
      </main>

      <footer className="mt-48 text-center space-y-8 px-8 opacity-20">
         <div className="flex items-center justify-center gap-12 text-primary">
            <div className="h-px w-32 bg-current" />
            <Shield size={32} />
            <div className="h-px w-32 bg-current" />
         </div>
         <p className="text-[12px] text-primary font-black uppercase tracking-[1em] italic leading-none">Treasury Protocol Access Node v4.4.2</p>
         <p className="text-[10px] text-primary font-black uppercase tracking-[0.5em] italic opacity-40 italic mt-6">All financial data is secured via end-to-end tactical encryption layers</p>
      </footer>
    </div>
  );
};

export default SubscriptionScreen;
