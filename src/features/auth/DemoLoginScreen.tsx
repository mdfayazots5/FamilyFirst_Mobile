import React from 'react';
import { motion } from 'motion/react';
import { useAuth, UserRole } from '../../core/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  Baby, 
  GraduationCap, 
  Heart, 
  Settings,
  ArrowRight
} from 'lucide-react';

import { AppConfig } from '../../core/config/appConfig';
import FFCard from '../../shared/components/FFCard';
import FFBadge from '../../shared/components/FFBadge';

const RoleCard: React.FC<{ 
  role: UserRole; 
  title: string; 
  icon: React.ReactNode; 
  description: string;
  onClick: () => void;
}> = ({ title, icon, description, onClick }) => (
  <FFCard
    onClick={onClick}
    className="h-full flex flex-col items-start text-left p-8 lg:p-10 rounded-[48px] border-none shadow-3xl shadow-black/[0.01] bg-white/50 backdrop-blur-sm group cursor-pointer hover:scale-[1.03] hover:shadow-primary/5 transition-all relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/[0.02] rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-accent/[0.05] transition-colors" />
    <div className="w-16 h-16 bg-primary/5 rounded-[24px] flex items-center justify-center mb-10 text-primary shadow-inner border border-black/[0.03] group-hover:bg-primary group-hover:text-white group-hover:rotate-12 transition-all duration-500">
      {icon}
    </div>
    <div className="flex-1 space-y-4 relative z-10">
      <h3 className="text-3xl font-display font-black text-primary uppercase italic tracking-tighter group-hover:text-accent transition-colors leading-none">{title}</h3>
      <p className="text-[13px] text-gray-400 font-bold leading-relaxed block uppercase tracking-wide opacity-60 italic">{description}</p>
    </div>
    <div className="mt-10 flex items-center gap-3 text-accent font-black text-[11px] uppercase tracking-[0.3em] italic group-hover:translate-x-2 transition-transform pt-6 border-t border-black/[0.03] w-full">
      <span>ENTRY_PROTOCOL</span> 
      <ArrowRight size={16} />
    </div>
  </FFCard>
);

const DemoLoginScreen: React.FC = () => {
  const { loginAsRole } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (role: UserRole) => {
    loginAsRole(role);
    navigate('/');
  };

  const roles = [
    {
      role: UserRole.SUPER_ADMIN,
      title: 'Super Admin',
      icon: <Settings size={28} />,
      description: 'System-wide management, multi-family oversight, and global platform analytics.'
    },
    {
      role: UserRole.FAMILY_ADMIN,
      title: 'Family Admin',
      icon: <Shield size={28} />,
      description: `Complete control over family units, member clearance, and tactical service plans.`
    },
    {
      role: UserRole.PARENT,
      title: 'Parent',
      icon: <Users size={28} />,
      description: 'Coordinate daily schedules, monitor progress, and manage the secure family vault.'
    },
    {
      role: UserRole.TEACHER,
      title: 'Teacher',
      icon: <GraduationCap size={28} />,
      description: 'Deliver expert guidance, provide structured feedback, and track development milestones.'
    },
    {
      role: UserRole.CHILD,
      title: 'Child',
      icon: <Baby size={28} />,
      description: 'Engage with daily tasks, earn rewards, and grow within a secure environment.'
    },
    {
      role: UserRole.ELDER,
      title: 'Elder',
      icon: <Heart size={28} />,
      description: 'Stay seamlessly connected with the family through high-visibility interfaces.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFB] p-8 md:p-12 lg:p-24 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Tactical Elements */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '60px 60px' }} />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/[0.01] rounded-full blur-[140px] -mr-96 -mt-96" />

      <div className="max-w-7xl w-full relative z-10">
        <header className="text-center mb-28">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-4 mb-10"
          >
            <FFBadge variant="accent" size="sm" className="font-black px-6 py-2 uppercase italic tracking-[0.3em] outline-dashed outline-1 outline-accent/40">PHASE_01_SIMULATION</FFBadge>
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          </motion.div>
          <h1 className="text-5xl md:text-8xl mb-8 tracking-tighter font-display font-black text-primary uppercase italic leading-none">
            Welcome to <span className="text-accent underline decoration-accent/10 underline-offset-8 decoration-8">FamilyFirst</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto font-black uppercase italic tracking-wide opacity-60 leading-relaxed">
            Select an <span className="text-primary">OPERATIVE_ROLE</span> to begin exploration. <br/>
            Experience the depth of our tactical family security ecosystem.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {roles.map((roleData, index) => (
            <motion.div
              key={roleData.role}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <RoleCard 
                {...roleData} 
                onClick={() => handleLogin(roleData.role)} 
              />
            </motion.div>
          ))}
        </div>

        <footer className="mt-40 text-center space-y-10">
          <div className="flex items-center justify-center gap-12 text-primary/5">
             <div className="h-px w-32 bg-current" />
             <Shield size={32} />
             <div className="h-px w-32 bg-current" />
          </div>
          <div className="space-y-4">
             <p className="text-[13px] text-gray-400 font-black uppercase tracking-[1em] italic leading-none">Access Control // Role Selection Matrix v4.4.2</p>
             <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.5em] italic opacity-30">All identity nodes are verified against the central family vault</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DemoLoginScreen;
