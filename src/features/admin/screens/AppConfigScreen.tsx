import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Settings, 
  ShieldAlert, 
  Zap, 
  Globe, 
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Save
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminRepository, FeatureFlag } from '../repositories/AdminRepository';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';

const AppConfigScreen: React.FC = () => {
  const navigate = useNavigate();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        const data = await AdminRepository.getFeatureFlags();
        setFlags(data);
      } catch (error) {
        console.error('Failed to fetch flags', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFlags();
  }, []);

  const handleToggle = async (id: string, currentState: boolean) => {
    if (id === 'f1' && !currentState) {
      const confirmed = window.confirm('CRITICAL: Are you sure you want to enable MAINTENANCE MODE? This will block all user access.');
      if (!confirmed) return;
    }

    setFlags(prev => prev.map(f => f.id === id ? { ...f, isEnabled: !currentState } : f));
    try {
      await AdminRepository.updateFeatureFlag(id, !currentState);
    } catch (error) {
      console.error('Failed to update flag', error);
      // Revert on error
      setFlags(prev => prev.map(f => f.id === id ? { ...f, isEnabled: currentState } : f));
    }
  };

  return (
    <div className="min-h-screen bg-bg-cream pb-32">
      <header className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-display font-black text-primary tracking-tight mb-1">Config</h1>
            <p className="text-sm text-gray-400 font-medium">Global feature flags and system settings</p>
          </div>
          <div className="flex items-center gap-3">
            <FFButton 
              size="sm" 
              icon={<Save size={20} />} 
              isLoading={isSaving}
              className="shadow-lg shadow-primary/20"
            >
              Save All
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Feature Flags */}
          <div className="lg:col-span-8 space-y-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 ml-1">Feature Flags</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {isLoading ? (
                <div className="col-span-full text-center py-12 text-gray-400">Loading flags...</div>
              ) : (
                flags.map(flag => (
                  <FFCard key={flag.id} className={`p-6 border-2 transition-all group hover:scale-[1.01] ${flag.isEnabled ? 'border-primary/5 bg-white' : 'border-transparent bg-white/40'}`}>
                    <div className="flex justify-between items-start mb-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${flag.isEnabled ? 'bg-primary/5 text-primary' : 'bg-gray-100 text-gray-400'}`}>
                        {flag.id === 'f1' ? <ShieldAlert size={24} /> : <Zap size={24} />}
                      </div>
                      <button 
                        onClick={() => handleToggle(flag.id, flag.isEnabled)}
                        className={`w-14 h-7 rounded-full transition-all relative p-1 ${flag.isEnabled ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-gray-200'}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-all shadow-sm ${flag.isEnabled ? 'translate-x-7' : 'translate-x-0'}`} />
                      </button>
                    </div>
                    <h4 className="font-bold text-primary mb-1.5">{flag.name}</h4>
                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{flag.description}</p>
                  </FFCard>
                ))
              )}
            </div>
          </div>

          {/* Global Config */}
          <div className="lg:col-span-4 space-y-10">
            <section className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 ml-1">System Settings</h3>
              <FFCard className="p-8 space-y-8">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">App Version</label>
                  <div className="flex gap-3">
                    <input type="text" defaultValue="1.2.0" className="flex-1 px-4 py-3 bg-gray-50/50 border border-black/5 rounded-[15px] font-bold text-sm text-primary" />
                    <FFButton size="sm" variant="outline">Update</FFButton>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">Coin Multiplier</label>
                  <input type="number" defaultValue="1.0" step="0.1" className="w-full px-4 py-3 bg-gray-50/50 border border-black/5 rounded-[15px] font-bold text-sm text-primary" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">Support Email</label>
                  <input type="email" defaultValue="support@familyfirst.app" className="w-full px-4 py-3 bg-gray-50/50 border border-black/5 rounded-[15px] font-bold text-sm text-primary" />
                </div>
              </FFCard>
            </section>

            <section className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 ml-1">System Status</h3>
              <div className="space-y-4">
                <StatusItem icon={<Globe size={18} />} label="API Server" status="Healthy" color="text-success" />
                <StatusItem icon={<Smartphone size={18} />} label="Push Service" status="Healthy" color="text-success" />
                <StatusItem icon={<ShieldAlert size={18} />} label="Auth Service" status="Degraded" color="text-amber-500" />
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

const StatusItem = ({ icon, label, status, color }: any) => (
  <div className="flex items-center justify-between p-5 bg-white rounded-2xl border border-black/5 shadow-sm group hover:border-primary/10 transition-colors">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">{icon}</div>
      <span className="text-xs font-bold text-primary">{label}</span>
    </div>
    <span className={`text-[10px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-lg bg-gray-50 ${color}`}>{status}</span>
  </div>
);

export default AppConfigScreen;
