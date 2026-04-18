import React from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  LogOut, 
  ChevronRight,
  ArrowLeft,
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import FFCard from '../../../shared/components/FFCard';
import FFAvatar from '../../../shared/components/FFAvatar';
import FFBadge from '../../../shared/components/FFBadge';

import { AppConfig } from '../../../core/config/appConfig';

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/demo-login');
  };

  const getSettingsPath = () => {
    switch (user?.role) {
      case 'CHILD': return '/child/settings';
      case 'PARENT': return '/parent/settings';
      case 'TEACHER': return '/teacher/settings';
      case 'ELDER': return '/elder/settings';
      default: return '/notifications/preferences';
    }
  };

  const menuItems = [
    { 
      id: 'settings', 
      label: 'App Settings', 
      desc: 'Language, PIN, and preferences', 
      icon: <Settings size={20} />, 
      path: getSettingsPath(),
      color: 'bg-primary/5 text-primary'
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      desc: 'Alerts, quiet hours, and digests', 
      icon: <Bell size={20} />, 
      path: '/notifications/preferences',
      color: 'bg-indigo-50 text-indigo-500'
    },
    ...(AppConfig.features.subscriptionEnabled ? [{ 
      id: 'subscription', 
      label: 'Subscription', 
      desc: 'Manage your family plan', 
      icon: <CreditCard size={20} />, 
      path: '/profile/subscription',
      color: 'bg-amber-50 text-amber-500'
    }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-32">
      <header className="p-12 md:p-20 space-y-12 flex flex-col items-center relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 left-0 w-full h-40 bg-primary/[0.02] -skew-y-3 origin-top-left pointer-events-none" />
        <div className="absolute top-20 right-10 w-64 h-64 bg-accent/[0.03] rounded-full blur-3xl pointer-events-none" />

        <div className="relative group">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="p-3 rounded-[36px] bg-white shadow-3xl shadow-primary/5 border border-black/[0.03] relative z-10"
          >
            <FFAvatar name={user?.name || 'User'} size="xl" className="ring-8 ring-gray-50 shadow-inner group-hover:scale-105 transition-transform duration-700" />
          </motion.div>
          
          <motion.button 
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, type: "spring" }}
            onClick={() => navigate(getSettingsPath())}
            className="absolute -bottom-2 -right-2 w-14 h-14 bg-primary text-white rounded-[20px] shadow-2xl border-4 border-white hover:bg-accent hover:rotate-90 transition-all flex items-center justify-center z-20"
          >
            <Settings size={24} />
          </motion.button>
        </div>

        <div className="text-center space-y-6 relative z-10">
          <div className="space-y-4">
             <h1 className="text-5xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none">{user?.name}</h1>
             <div className="flex items-center justify-center gap-4">
               <FFBadge variant="primary" size="sm" className="font-black px-6 py-2 uppercase italic tracking-widest text-[12px] rounded-xl bg-primary/5 border-none outline-dashed outline-1 outline-primary/20">
                 {user?.role.replace('_', ' ')}
               </FFBadge>
               <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
             </div>
          </div>
          <div className="h-px w-20 bg-primary/10 mx-auto" />
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.6em] italic leading-none">CORE_IDENTITY_MATRIX_ACTIVE</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-8 space-y-16">
        <section className="space-y-6">
           <div className="flex items-center gap-6 px-4">
              <Shield size={16} className="text-primary/20" />
              <h3 className="text-[11px] font-black text-primary/30 uppercase tracking-[0.4em] italic">INTERFACE_PROTOCOLS</h3>
              <div className="h-px flex-1 bg-primary/5" />
           </div>

           <div className="grid grid-cols-1 gap-6">
            {menuItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <FFCard 
                  className="p-8 flex items-center justify-between cursor-pointer hover:bg-white hover:scale-[1.02] hover:shadow-3xl hover:shadow-primary/5 transition-all group overflow-hidden relative rounded-[40px] border-none bg-white/50 backdrop-blur-sm"
                  onClick={() => navigate(item.path)}
                >
                  <div className="flex items-center gap-8 relative z-10">
                    <div className={`w-18 h-18 rounded-[24px] flex items-center justify-center shadow-inner border border-black/[0.03] transition-transform group-hover:rotate-12 ${item.color}`}>
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-display font-black text-2xl text-primary uppercase italic tracking-tighter group-hover:text-accent transition-colors leading-none mb-2">{item.label}</h4>
                      <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest italic opacity-60">{item.desc}</p>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-[18px] bg-white border border-black/[0.03] flex items-center justify-center text-gray-100 group-hover:text-accent group-hover:translate-x-1 transition-all shadow-sm">
                    <ChevronRight size={24} className="group-hover:scale-110 transition-transform" />
                  </div>
                </FFCard>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="pt-12">
          <button
            onClick={handleLogout}
            className="w-full h-24 rounded-[32px] bg-alert/5 border-2 border-dashed border-alert/20 text-alert font-display font-black text-xl uppercase italic tracking-[0.2em] flex items-center justify-center gap-6 hover:bg-alert hover:text-white hover:border-solid hover:shadow-3xl hover:shadow-alert/20 transition-all active:scale-95 group"
          >
            <LogOut size={28} className="group-hover:-translate-x-2 transition-transform" />
            <span>TERMINATE_SESSION</span>
          </button>
        </section>
      </main>

      <footer className="mt-40 text-center space-y-4 px-8 opacity-20">
         <div className="flex items-center justify-center gap-8">
            <div className="h-px w-20 bg-primary" />
            <User size={24} className="text-primary" />
            <div className="h-px w-20 bg-primary" />
         </div>
         <p className="text-[12px] text-primary font-black uppercase tracking-[1em] italic leading-none">Security Matrix Protocol v4.4.2</p>
         <p className="text-[9px] text-primary font-black uppercase tracking-[0.5em] italic opacity-40 italic mt-6">All biometric and operational identity data is stored in the vault node</p>
      </footer>
    </div>
  );
};

export default ProfileScreen;
