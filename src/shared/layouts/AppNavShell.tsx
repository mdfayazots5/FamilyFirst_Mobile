import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth, UserRole } from '../../core/auth/AuthContext';
import { useNotifications } from '../../features/notifications/providers/NotificationProvider';
import OfflineBanner from '../../core/connectivity/OfflineBanner';
import FFButton from '../components/FFButton';
import { 
  Home, 
  Users, 
  Shield,
  Calendar, 
  Lock, 
  User, 
  LogOut,
  BookOpen,
  Star,
  Heart,
  Settings,
  LayoutDashboard,
  Coins,
  Trophy,
  Bell,
  FileText
} from 'lucide-react';

const AppNavShell: React.FC = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/demo-login');
  };

  // Define navigation items based on role
  const getNavItems = () => {
    switch (user?.role) {
      case UserRole.PARENT:
        return [
          { icon: <Home size={20} />, label: 'Home', path: '/parent' },
          { icon: <Users size={20} />, label: 'Family', path: '/parent/members' },
          { icon: <Star size={20} />, label: 'Feedback', path: '/parent/feedback' },
          { icon: <Calendar size={20} />, label: 'Calendar', path: '/calendar' },
          { icon: <FileText size={20} />, label: 'Reports', path: '/reports' },
        ];
      case UserRole.TEACHER:
        return [
          { icon: <Home size={20} />, label: 'Home', path: '/teacher' },
          { icon: <Star size={20} />, label: 'Feedback', path: '/teacher/feedback/new' },
          { icon: <Calendar size={20} />, label: 'History', path: '/teacher/feedback/history' },
        ];
      case UserRole.CHILD:
        return [
          { icon: <Home size={20} />, label: 'My Day', path: '/child' },
          { icon: <Coins size={20} />, label: 'Rewards', path: '/child/coins' },
          { icon: <Trophy size={20} />, label: 'Scores', path: '/child/scores' },
          { icon: <Users size={20} />, label: 'Family', path: '/child/family' },
        ];
      case UserRole.ELDER:
        return [
          { icon: <Home size={20} />, label: 'Home', path: '/elder' },
          { icon: <Calendar size={20} />, label: 'Calendar', path: '/calendar' },
          { icon: <Settings size={20} />, label: 'Settings', path: '/elder/settings' },
        ];
      case UserRole.SUPER_ADMIN:
        return [
          { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin' },
          { icon: <Users size={20} />, label: 'Families', path: '/admin/families' },
          { icon: <Settings size={20} />, label: 'Config', path: '/admin/config' },
        ];
      case UserRole.FAMILY_ADMIN:
        return [
          { icon: <Shield size={20} />, label: 'Admin', path: '/parent/admin' },
          { icon: <Users size={20} />, label: 'Family', path: '/parent/members' },
          { icon: <Home size={20} />, label: 'Parent Home', path: '/parent' },
        ];
      default:
        return [{ icon: <Home size={20} />, label: 'Home', path: '/' }];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen flex flex-col bg-bg-cream">
      <OfflineBanner />
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-black/[0.03] flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-accent shadow-sm transition-transform duration-300">
            <Home size={22} fill="currentColor" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display font-bold tracking-tight text-xl text-primary">
              FamilyFirst
            </span>
            <span className="text-[9px] font-bold tracking-wider text-accent uppercase mt-0.5">PREMIUM CARE</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/notifications')}
            className="p-2.5 hover:bg-gray-50 text-gray-400 hover:text-primary rounded-ff-sm transition-all relative"
            title="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-4 h-4 bg-accent text-primary text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <button 
            onClick={() => navigate('/profile')}
            className="p-2.5 hover:bg-gray-50 text-gray-400 hover:text-primary rounded-ff-sm transition-all"
            title="My Account"
          >
            <User size={20} />
          </button>

          <div className="h-8 w-px bg-black/[0.05] mx-1 hidden md:block" />

          <div className="hidden md:flex items-center gap-3 pl-2">
            <div className="text-right">
              <p className="text-sm font-black text-primary leading-none">{user?.name}</p>
              <p className="text-[9px] text-accent font-black tracking-[0.1em] uppercase mt-1">Verified Account</p>
            </div>
          </div>

          <FFButton 
            variant="alert"
            size="sm"
            onClick={handleLogout}
            className="px-3"
            icon={<LogOut size={18} />}
          >
            Logout
          </FFButton>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-24 md:pb-0 md:pl-64">
        <div className="max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Sidebar Navigation (Desktop) */}
      <nav className="hidden md:flex flex-col w-64 bg-white border-r border-black/[0.03] fixed top-16 bottom-0 left-0 p-5">
        <div className="space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path.split('/').length <= 2}
              className={({ isActive }) => `
                flex items-center gap-3.5 px-4 py-3.5 rounded-ff-sm transition-all duration-300
                ${isActive 
                  ? 'bg-primary text-white shadow-xl shadow-primary/15 translate-x-1' 
                  : 'text-gray-400 hover:bg-gray-50 hover:text-primary'}
              `}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="font-bold text-sm">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 bg-primary text-white h-16 px-6 flex items-center justify-between z-50 rounded-ff-lg shadow-2xl shadow-primary/40">
        {navItems.slice(0, 5).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path.split('/').length <= 2}
            className={({ isActive }) => `
              flex flex-col items-center justify-center transition-all duration-300 relative
              ${isActive ? 'text-accent scale-110' : 'text-white/40 hover:text-white/60'}
            `}
          >
            {({ isActive }) => (
              <>
                <div className="relative z-10">
                  {React.cloneElement(item.icon as React.ReactElement, { size: 22 })}
                </div>
                {isActive && (
                  <motion.div 
                    layoutId="nav-active"
                    className="absolute -inset-2 bg-white/10 rounded-xl -z-0"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default AppNavShell;
