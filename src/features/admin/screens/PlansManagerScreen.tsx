import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Check, 
  Edit2, 
  Trash2, 
  CreditCard,
  Users,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminRepository, SubscriptionPlan } from '../repositories/AdminRepository';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFBadge from '../../../shared/components/FFBadge';

const PlansManagerScreen: React.FC = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await AdminRepository.getPlans();
        setPlans(data);
      } catch (error) {
        console.error('Failed to fetch plans', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, []);

  return (
    <div className="min-h-screen bg-bg-cream pb-32">
      <header className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-display font-black text-primary tracking-tight mb-1">Plans</h1>
            <p className="text-sm text-gray-400 font-medium">Manage system subscription models</p>
          </div>
          <div className="flex items-center gap-3">
            <FFButton 
              size="sm" 
              onClick={() => {}} 
              className="shadow-lg shadow-primary/20"
              icon={<Plus size={20} />}
            >
              Create New
            </FFButton>
            <button 
              onClick={() => navigate(-1)}
              className="p-3 bg-white rounded-2xl border border-black/5 text-gray-400 hover:text-primary transition-all shadow-sm"
            >
              <ArrowLeft size={24} />
            </button>
          </div>
        </div>
      </header>

      <main className="px-6 space-y-12">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-gray-400">Loading plans...</div>
        ) : (
          plans.map(plan => (
            <FFCard key={plan.id} className="p-8 flex flex-col h-full relative overflow-hidden group">
              <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-display font-bold text-primary">{plan.name}</h3>
                  <button className="p-2 text-gray-300 hover:text-primary transition-colors">
                    <Edit2 size={18} />
                  </button>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-display font-bold text-primary">₹{plan.price}</span>
                  <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">/month</span>
                </div>
              </div>

              <div className="space-y-4 mb-8 flex-1">
                <div className="flex items-center gap-3 text-sm font-bold text-primary">
                  <Users size={18} className="text-primary/40" />
                  <span>Up to {plan.maxChildren} Children</span>
                </div>
                <div className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs text-gray-600 font-medium">
                      <Check size={16} className="text-success shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-black/5 flex gap-3">
                <FFButton variant="outline" className="flex-1" size="sm">Edit</FFButton>
                <button className="p-2 text-gray-300 hover:text-alert transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="absolute -right-4 -top-4 text-primary/5 group-hover:text-primary/10 transition-colors">
                <Zap size={100} />
              </div>
            </FFCard>
          ))
        )}
      </div>

      {/* Coupons Section */}
      <section className="mt-12">
        <h2 className="text-xl font-display font-bold mb-6">Active Coupons</h2>
        <FFCard className="p-6 flex items-center justify-between bg-white/50 border-dashed">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
              <CreditCard size={24} />
            </div>
            <div>
              <h4 className="font-bold text-primary">WELCOME50</h4>
              <p className="text-xs text-gray-500">50% off for first 3 months</p>
            </div>
          </div>
          <FFBadge variant="success">Active</FFBadge>
        </FFCard>
      </section>
    </main>
  </div>
);
};

export default PlansManagerScreen;
