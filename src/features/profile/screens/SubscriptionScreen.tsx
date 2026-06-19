import React, { useEffect, useState } from 'react';
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
import { FamilyRepository, type FamilyLookupOption } from '../../family/repositories/FamilyRepository';

interface SubscriptionPlanCard {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  badge?: string;
  accentVariant: 'neutral' | 'primary' | 'accent';
}

const PLAN_DETAILS: Record<string, Omit<SubscriptionPlanCard, 'id'>> = {
  FREETRIAL: {
    name: 'Free Trial',
    price: '₹0',
    period: '14 days',
    features: ['1 Child', 'Starter Family Setup', 'Core Task and Attendance Tracking'],
    badge: 'TRIAL_ACCESS',
    accentVariant: 'neutral',
  },
  BASIC: {
    name: 'Basic',
    price: '₹99',
    period: 'per month',
    features: ['Up to 2 Children', 'Core Task Tracking', 'Standard Rewards'],
    accentVariant: 'primary',
  },
  FAMILY: {
    name: 'Family',
    price: '₹199',
    period: 'per month',
    features: ['Up to 4 Children', 'Teacher Integration', 'Shared Family Coordination'],
    badge: 'GROWTH_TIER',
    accentVariant: 'accent',
  },
  PREMIUM: {
    name: 'Premium',
    price: '₹299',
    period: 'per month',
    features: ['Unlimited Children', 'Advanced Reports', 'Full Household Coverage'],
    badge: 'FULL_ACCESS',
    accentVariant: 'primary',
  },
};

const normalizePlanCode = (code: string): string => code.replace(/[_\s-]/g, '').toUpperCase();

const mapPlanOptionsToCards = (options: FamilyLookupOption[]): SubscriptionPlanCard[] =>
  options.map((option) => {
    const key = normalizePlanCode(option.code);
    const details = PLAN_DETAILS[key] ?? {
      name: option.label,
      price: 'Plan Price [VERIFY]',
      period: 'Billing Cycle [VERIFY]',
      features: ['Feature set not yet documented in mobile source'],
      accentVariant: 'neutral' as const,
    };

    return {
      id: option.id,
      ...details,
    };
  });

const SubscriptionScreen: React.FC = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlanCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlans = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const planOptions = await FamilyRepository.getPlanOptions();
        setPlans(mapPlanOptionsToCards(planOptions));
      } catch (loadError) {
        console.error('Failed to load subscription plans', loadError);
        setError('Plan catalog is unavailable right now. Retry after the family plan service is reachable.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPlans();
  }, []);

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
                  <FFBadge variant="accent" className="font-black px-6 py-2 shadow-2xl shadow-accent/40 uppercase italic tracking-[0.2em] rounded-xl text-[12px]">PLAN_ACCESS_MATRIX</FFBadge>
                  <h2 className="text-5xl md:text-7xl font-display font-black tracking-tighter uppercase italic leading-none">Family Plans</h2>
                </div>
                <div className="w-24 h-24 bg-white/10 rounded-[32px] backdrop-blur-md border-2 border-white/10 flex items-center justify-center shadow-inner group-hover:rotate-[360deg] transition-transform duration-[2000ms]">
                  <CreditCard size={44} />
                </div>
              </div>
              <div className="flex items-center gap-4 text-[12px] font-black uppercase tracking-[0.4em] text-white/60 italic leading-none">
                <Clock size={18} className="text-accent" />
                <span>Live plan options are sourced from the master-data catalog.</span>
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
            {isLoading ? (
              <FFCard className="p-12 border-4 border-transparent bg-white/50 rounded-[56px] shadow-3xl shadow-black/[0.01]">
                <p className="text-[12px] font-black uppercase tracking-[0.4em] text-gray-300 italic">LOADING_PLAN_CATALOG...</p>
              </FFCard>
            ) : error ? (
              <FFCard className="p-12 border-4 border-alert/10 bg-white rounded-[56px] shadow-3xl shadow-black/[0.01]">
                <p className="text-lg font-black text-alert uppercase italic tracking-tight leading-none">{error}</p>
              </FFCard>
            ) : plans.map((plan, idx) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <FFCard 
                  className={`p-12 border-4 transition-all hover:shadow-3xl relative overflow-hidden group rounded-[56px] ${
                    plan.accentVariant === 'primary'
                      ? 'border-primary bg-white shadow-primary/10'
                      : plan.accentVariant === 'accent'
                        ? 'border-accent/20 bg-white shadow-accent/10'
                        : 'border-transparent bg-white/50'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-12 mb-12">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                         <h4 className="text-4xl font-display font-black text-primary uppercase italic tracking-tighter leading-none">{plan.name}</h4>
                         {plan.badge && (
                           <FFBadge variant={plan.accentVariant === 'accent' ? 'accent' : 'success'} className="font-black px-4 py-1 italic tracking-widest text-[9px] rounded-lg">
                             {plan.badge}
                           </FFBadge>
                         )}
                         {!plan.badge && plan.accentVariant === 'accent' && (
                           <FFBadge variant="accent" className="font-black px-4 py-1 italic tracking-widest text-[9px] rounded-lg">SCALING_TIER</FFBadge>
                         )}
                      </div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-5xl font-display font-black text-primary italic leading-none tracking-tighter">{plan.price}</span>
                        <span className="text-[11px] text-gray-400 font-black uppercase tracking-widest italic">{plan.period}</span>
                      </div>
                    </div>

                    <FFButton 
                      variant={plan.accentVariant === 'accent' ? 'accent' : 'outline'}
                      className="px-14 h-20 rounded-[28px] font-display font-black text-[13px] uppercase italic tracking-[0.2em] shadow-2xl active:scale-95 group/btn"
                    >
                      <div className="flex items-center gap-4">
                         <span>PLAN_REFERENCE_ONLY</span>
                         <Zap size={18} className="group-hover/btn:animate-pulse" />
                      </div>
                    </FFButton>
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
            <div className="p-12 text-center space-y-6">
              <div className="w-16 h-16 bg-gray-50 rounded-[24px] flex items-center justify-center text-gray-300 border border-black/[0.03] mx-auto">
                <History size={28} />
              </div>
              <p className="font-display font-black text-2xl text-primary uppercase italic tracking-tighter leading-none">Billing History Not Exposed</p>
              <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.4em] italic leading-none">
                ProjectOverview does not document a family-side payment-history API for this screen yet.
              </p>
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
