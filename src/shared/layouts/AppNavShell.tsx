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
    <div className="flex min-h-screen flex-col bg-bg-cream text-primary">
      <OfflineBanner />
      {/* Top Header */}
      <header className="sticky top-0 z-40 flex min-h-16 items-center justify-between border-b border-black/[0.03] bg-white/95 px-4 backdrop-blur sm:px-6">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex min-h-12 items-center gap-2.5 rounded-ff-sm text-left transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-accent shadow-sm transition-transform duration-300">
            <Home size={22} fill="currentColor" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display font-bold tracking-tight text-xl text-primary">
              FamilyFirst
            </span>
            <span className="text-[9px] font-bold tracking-wider text-accent uppercase mt-0.5">PREMIUM CARE</span>
          </div>
        </button>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => navigate('/notifications')}
            className="touch-target relative rounded-ff-sm p-2.5 text-gray-400 transition-all hover:bg-gray-50 hover:text-primary"
            title="Notifications"
            aria-label="Open notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute right-2 top-2 flex min-h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-accent px-1 text-[8px] font-black text-primary shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="touch-target rounded-ff-sm p-2.5 text-gray-400 transition-all hover:bg-gray-50 hover:text-primary"
            title="My Account"
            aria-label="Open profile"
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
      <main className="flex-1 pb-28 md:pb-0 md:pl-64">
        <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 md:px-8">
          <Outlet />
        </div>
      </main>

      {/* Sidebar Navigation (Desktop) */}
      <nav className="fixed bottom-0 left-0 top-16 hidden w-64 flex-col border-r border-black/[0.03] bg-white p-5 md:flex">
        <div className="space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path.split('/').length <= 2}
              className={({ isActive }) => `
                flex min-h-12 items-center gap-3.5 rounded-ff-sm px-4 py-3.5 transition-all duration-300
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
      <nav className="fixed bottom-4 left-4 right-4 z-50 flex h-18 items-center justify-between rounded-ff-lg bg-primary px-4 text-white shadow-2xl shadow-primary/40 md:hidden [padding-bottom:calc(env(safe-area-inset-bottom,0px)+0.25rem)]">
        {navItems.slice(0, 5).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path.split('/').length <= 2}
            className={({ isActive }) => `
              relative flex min-h-12 min-w-12 flex-col items-center justify-center rounded-ff-sm transition-all duration-300
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
