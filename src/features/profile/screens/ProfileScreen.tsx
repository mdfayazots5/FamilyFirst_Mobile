import React from 'react';
import {
  Bell,
  CreditCard,
  LogOut,
  Settings,
  Shield,
  User,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { UserRole } from '../../../core/auth/UserRole';
import { AppConfig } from '../../../core/config/appConfig';
import FFAvatar from '../../../shared/components/FFAvatar';
import FFBadge from '../../../shared/components/FFBadge';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';

const formatRole = (role?: UserRole) => {
  if (!role) {
    return 'Family member';
  }

  return role
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getSettingsPath = () => {
    switch (user?.role) {
      case UserRole.CHILD:
        return '/child/settings';
      case UserRole.PARENT:
        return '/parent/settings';
      case UserRole.TEACHER:
        return '/teacher/settings';
      case UserRole.ELDER:
        return '/elder/settings';
      default:
        return '/notifications/preferences';
    }
  };

  const menuItems = [
    {
      id: 'settings',
      label: 'Settings',
      description: 'Update language, PIN, and account preferences.',
      icon: <Settings className="h-4 w-4" />,
      path: getSettingsPath(),
    },
    {
      id: 'notifications',
      label: 'Notifications',
      description: 'Manage alerts, quiet hours, and digest timing.',
      icon: <Bell className="h-4 w-4" />,
      path: '/notifications/preferences',
    },
    ...(AppConfig.features.subscriptionEnabled
      ? [
          {
            id: 'subscription',
            label: 'Subscription',
            description: 'Review the family plan options available in this app.',
            icon: <CreditCard className="h-4 w-4" />,
            path: '/profile/subscription',
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-bg-cream pb-24">
      <FFPageHeader title="Profile" subtitle="Account and family preferences" showBack />

      <main className="page-enter mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <FFCard variant="primary" className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <FFAvatar name={user?.name || 'Family Member'} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-display font-bold text-white sm:text-2xl">
                  {user?.name || 'Family member'}
                </h1>
                <FFBadge variant="accent" size="sm">
                  {formatRole(user?.role)}
                </FFBadge>
              </div>
              <p className="mt-2 text-sm text-white/80">
                Keep your account details, notification choices, and family settings in one place.
              </p>
            </div>
          </div>
        </FFCard>

        <section className="space-y-3">
          <FFSectionHeader icon={<User />} title="Account" />
          <FFCard className="space-y-4 p-4 shadow-card">
            <div className="flex items-center justify-between gap-3 rounded-ff-sm bg-primary/5 p-4">
              <div>
                <p className="text-sm font-body font-semibold text-primary">Signed in as</p>
                <p className="mt-1 text-sm text-gray-500">{formatRole(user?.role)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-ff-sm bg-white text-primary">
                <Shield className="h-5 w-5" />
              </div>
            </div>

            {user?.familyId ? (
              <div className="flex items-center justify-between gap-3 rounded-ff-sm bg-primary/5 p-4">
                <div>
                  <p className="text-sm font-body font-semibold text-primary">Family access</p>
                  <p className="mt-1 text-sm text-gray-500">Connected to your current family account.</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-ff-sm bg-white text-primary">
                  <Users className="h-5 w-5" />
                </div>
              </div>
            ) : null}
          </FFCard>
        </section>

        <section className="space-y-3">
          <FFSectionHeader icon={<Settings />} title="Shortcuts" />
          <div className="space-y-3">
            {menuItems.map((item) => (
              <FFCard
                key={item.id}
                hoverable
                onClick={() => navigate(item.path)}
                className="flex items-center gap-4 p-4 shadow-card"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-ff-sm bg-primary/5 text-primary">
                  {item.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-display font-semibold text-primary">{item.label}</p>
                  <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                </div>
              </FFCard>
            ))}
          </div>
        </section>

        <FFButton
          variant="alert"
          className="w-full"
          icon={<LogOut className="h-4 w-4" />}
          onClick={() => void handleLogout()}
        >
          Log out
        </FFButton>
      </main>
    </div>
  );
};

export default ProfileScreen;
