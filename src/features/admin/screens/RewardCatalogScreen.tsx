import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ShoppingBag,
  Gift,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminRepository } from '../repositories/AdminRepository';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFBadge from '../../../shared/components/FFBadge';

const RewardCatalogScreen: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  const demoRewards = [
    { id: 'r1', title: 'Extra Screen Time', cost: 50, category: 'Privilege', icon: '📺' },
    { id: 'r2', title: 'Pizza Night', cost: 200, category: 'Food', icon: '🍕' },
    { id: 'r3', title: 'New Toy', cost: 500, category: 'Physical', icon: '🧸' },
    { id: 'r4', title: 'Bedtime Extension', cost: 30, category: 'Privilege', icon: '⏰' },
    { id: 'r5', title: 'Ice Cream Treat', cost: 40, category: 'Food', icon: '🍦' },
    { id: 'r6', title: 'Zoo Trip', cost: 1000, category: 'Experience', icon: '🦁' },
  ];

  return (
    <div className="min-h-screen bg-bg-cream pb-32">
      <header className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-display font-black text-primary tracking-tight mb-1">Catalog</h1>
            <p className="text-sm text-gray-400 font-medium">Global reward repository</p>
          </div>
          <div className="flex items-center gap-3">
            <FFButton 
              size="sm" 
              onClick={() => {}} 
              className="shadow-lg shadow-primary/20"
              icon={<Plus size={20} />}
            >
              Add Item
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

      <main className="px-6 space-y-8">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-gray-400">Loading rewards...</div>
        ) : (
          demoRewards.map(reward => (
            <FFCard key={reward.id} className="p-6 flex flex-col group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-14 h-14 bg-white border border-black/5 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                  {reward.icon}
                </div>
                <div className="flex gap-1">
                  <button className="p-2 text-gray-300 hover:text-primary transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button className="p-2 text-gray-300 hover:text-alert transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-primary mb-1">{reward.title}</h3>
              <div className="flex items-center gap-2 mb-4">
                <FFBadge variant="outline" size="sm">{reward.category}</FFBadge>
              </div>

              <div className="mt-auto pt-4 border-t border-black/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-amber-50 rounded flex items-center justify-center text-amber-500">
                    <Star size={12} fill="currentColor" />
                  </div>
                  <span className="text-sm font-bold text-primary">{reward.cost} Coins</span>
                </div>
                <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">
                  Settings
                </button>
              </div>
            </FFCard>
          ))
        )}
      </div>
    </main>
  </div>
);
};

export default RewardCatalogScreen;
