import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Type, 
  Languages, 
  Phone, 
  LogOut,
  ChevronRight,
  Check,
  Bell,
  Settings2,
  HelpCircle,
  MoreVertical,
  Scale
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { useElderSettings } from '../providers/ElderSettingsProvider';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFBadge from '../../../shared/components/FFBadge';

const ElderSettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { fontSize, setFontSize, language, scale } = useElderSettings();

  const fontSizes = [
    { label: 'Standard', value: '1.0', sub: 'Compact view' },
    { label: 'Magnified', value: '1.3', sub: 'Better visibility' },
    { label: 'Ultra', value: '1.6', sub: 'Maximum readability' },
  ];

  return (
    <div className="min-h-screen bg-bg-cream pb-32">
      <header className="p-8 space-y-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-display font-black text-primary tracking-tight mb-1" style={{ fontSize: `${36 * scale}px` }}>
              Preferences
            </h1>
            <p className="text-sm text-gray-400 font-medium italic" style={{ fontSize: `${14 * scale}px` }}>
              Calibrate your interface for optimal comfort
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-4 bg-white rounded-2xl border border-black/5 text-gray-400 hover:text-primary transition-all shadow-sm"
            >
              <ArrowLeft size={28} />
            </button>
          </div>
        </div>

        {/* Quick Actions Button with Options */}
        <FFCard className="bg-primary p-6 text-white relative overflow-hidden shadow-2xl shadow-primary/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[100px] -z-0" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <FFBadge variant="accent" className="font-black px-3 py-1 shadow-lg shadow-accent/20">SYSTEM ACCESS</FFBadge>
              <h3 className="text-2xl font-display font-bold mt-2" style={{ fontSize: `${20 * scale}px` }}>Accessibility Terminal</h3>
              <p className="text-white/60 text-xs font-medium italic">Execute quick adjustments to the platform environment.</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <FFButton 
                variant="accent" 
                size="sm" 
                className="font-black uppercase tracking-widest text-[10px] px-6"
                icon={<Settings2 size={16} />}
              >
                Launch Optimizer
              </FFButton>
              <button className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all border border-white/10">
                <MoreVertical size={20} className="text-white" />
              </button>
            </div>
          </div>
        </FFCard>
      </header>

      <main className="px-6 space-y-12">
        {/* Font Size Section - Professional Tactical Grid */}
        <section className="space-y-6">
          <div className="px-2 flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400" style={{ fontSize: `${10 * scale}px` }}>
              Visual Scale Calibration
            </h3>
            <Scale size={16} className="text-gray-300" />
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {fontSizes.map(size => (
              <FFCard
                key={size.value}
                onClick={() => setFontSize(size.value)}
                className={`p-6 flex items-center justify-between cursor-pointer transition-all border-2 group ${
                  fontSize === size.value 
                    ? 'border-primary bg-white ring-4 ring-primary/5 shadow-xl shadow-primary/10' 
                    : 'border-transparent bg-white hover:border-primary/20 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-sm border border-black/[0.03] ${
                    fontSize === size.value ? 'bg-primary text-white scale-110' : 'bg-gray-50 text-gray-400'
                  }`}>
                    <Type size={parseFloat(size.value) * 16} />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-primary leading-tight transition-all" style={{ fontSize: `${18 * parseFloat(size.value)}px` }}>
                      {size.label}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 italic">
                      {size.sub}
                    </p>
                  </div>
                </div>
                {fontSize === size.value ? (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                    <Check size={18} strokeWidth={3} />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-primary/5 transition-colors">
                    <ChevronRight size={18} />
                  </div>
                )}
              </FFCard>
            ))}
          </div>
        </section>

        {/* Global Settings Grid */}
        <section className="space-y-6">
          <div className="px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400" style={{ fontSize: `${10 * scale}px` }}>
              Core Synchronization
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FFCard 
              className="p-5 flex items-center justify-between cursor-pointer hover:border-primary/20 transition-all group"
              onClick={() => navigate('/notifications/preferences')}
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 border border-indigo-100 shadow-sm">
                  <Bell size={24} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-primary leading-tight" style={{ fontSize: `${16 * scale}px` }}>Alert Logic</h4>
                  <p className="text-[11px] text-gray-400 font-medium italic mt-0.5" style={{ fontSize: `${11 * scale}px` }}>Notification routing</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:text-primary transition-colors" />
            </FFCard>

            <FFCard className="p-5 flex items-center justify-between hover:border-accent/20 transition-all group">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-100 shadow-sm">
                  <Languages size={24} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-primary leading-tight" style={{ fontSize: `${16 * scale}px` }}>Linguistic</h4>
                  <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest mt-1 opacity-60 italic" style={{ fontSize: `${10 * scale}px` }}>{language}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:text-accent transition-colors" />
            </FFCard>
          </div>
        </section>

        {/* Critical Overrides */}
        <section className="space-y-6">
          <div className="px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400" style={{ fontSize: `${10 * scale}px` }}>
              Critical Protocol
            </h3>
          </div>
          <FFCard 
            onClick={() => window.location.href = 'tel:911'}
            className="p-8 bg-alert text-white relative overflow-hidden shadow-2xl shadow-alert/20 border-alert cursor-pointer hover:scale-[1.02] active:scale-98 transition-all"
          >
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 bg-white/20 rounded-[32px] flex items-center justify-center shadow-xl backdrop-blur-md border border-white/20 rotate-12 group-hover:rotate-0 transition-transform">
                <Phone size={36} fill="white" className="text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-display font-black tracking-tighter" style={{ fontSize: `${28 * scale}px` }}>Dispatch Assistance</h3>
                <p className="text-white/80 font-medium italic leading-relaxed" style={{ fontSize: `${14 * scale}px` }}>Synchronous voice link to global emergency responders.</p>
              </div>
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  animate={{ x: [-100, 300] }} 
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-1/2 h-full bg-white/40"
                />
              </div>
            </div>
          </FFCard>
        </section>

        {/* Platform Termination */}
        <div className="pt-10">
          <button
            onClick={() => {
              logout();
              navigate('/demo-login');
            }}
            className="w-full py-6 text-alert font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-4 bg-white border border-alert/10 rounded-[32px] shadow-sm hover:bg-alert hover:text-white hover:shadow-xl hover:shadow-alert/20 transition-all active:scale-95"
            style={{ fontSize: `${11 * scale}px` }}
          >
            <LogOut size={20} />
            Terminate Current Session
          </button>
          
          <footer className="text-center py-10 opacity-30 space-y-2">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">Elder Interface v1.0.4</p>
            <p className="text-[10px] text-gray-300 font-bold italic">Optimized for reliability and clarity.</p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default ElderSettingsScreen;
