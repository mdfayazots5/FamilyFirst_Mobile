import React from 'react';
import {
  Award,
  Bell,
  ChevronRight,
  CreditCard,
  LogOut,
  Settings,
  Shield,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { AppConfig } from '../../../core/config/appConfig';
import FFAvatar from '../../../shared/components/FFAvatar';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';

const ParentProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8F4EE]">
      <FFPageHeader
        title="Parent profile"
        subtitle="Account and family overview"
        showBack
        rightAction={
          <FFButton
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
            onClick={() => navigate('/parent/settings')}
            icon={<Settings size={16} />}
          >
            Settings
          </FFButton>
        }
      />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 pb-24">
        <FFCard className="shadow-card p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <FFAvatar name={user?.name ?? 'Parent'} size="xl" />
              <div>
                <h1 className="font-display text-3xl font-bold text-primary">{user?.name ?? 'Parent'}</h1>
                <p className="mt-1 font-body text-sm text-slate-500">
                  {user?.phoneNumber ?? 'Phone number not available'}
                </p>
                <p className="mt-1 font-body text-sm text-slate-500">
                  Family role: {user?.role ?? 'Parent'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-ff-sm bg-primary/5 px-4 py-3 text-center">
                <p className="font-display text-xl font-bold text-primary">Parent</p>
                <p className="font-body text-xs text-slate-500">Role</p>
              </div>
              <div className="rounded-ff-sm bg-accent/15 px-4 py-3 text-center">
                <p className="font-display text-xl font-bold text-primary">1</p>
                <p className="font-body text-xs text-slate-500">Family</p>
              </div>
              <div className="rounded-ff-sm bg-success/10 px-4 py-3 text-center">
                <p className="font-display text-xl font-bold text-primary">Active</p>
                <p className="font-body text-xs text-slate-500">Status</p>
              </div>
            </div>
          </div>
        </FFCard>

        <section className="space-y-4">
          <FFSectionHeader icon={<Users />} title="Family management" />
          <div className="grid gap-4 md:grid-cols-2">
            <FFCard
              hoverable
              onClick={() => navigate('/parent/members')}
              className="shadow-card p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-xl font-semibold text-primary">Family members</p>
                  <p className="mt-2 font-body text-sm text-slate-500">
                    Add members, review roles, and keep access aligned with your family setup.
                  </p>
                </div>
                <ChevronRight size={18} className="text-slate-400" />
              </div>
            </FFCard>

            <FFCard
              hoverable
              onClick={() => navigate('/parent/settings')}
              className="shadow-card p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-xl font-semibold text-primary">Parent settings</p>
                  <p className="mt-2 font-body text-sm text-slate-500">
                    Adjust notifications, sharing preferences, and day-to-day account options.
                  </p>
                </div>
                <ChevronRight size={18} className="text-slate-400" />
              </div>
            </FFCard>
          </div>
        </section>

        <section className="space-y-4">
          <FFSectionHeader icon={<Shield />} title="Shortcuts" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <FFCard hoverable onClick={() => navigate('/parent/feedback')} className="shadow-card p-4">
              <Bell size={20} className="text-primary" />
              <p className="mt-4 font-display text-lg font-semibold text-primary">Feedback inbox</p>
              <p className="mt-2 font-body text-sm text-slate-500">Check teacher messages and summaries.</p>
            </FFCard>

            <FFCard hoverable onClick={() => navigate('/parent/rewards')} className="shadow-card p-4">
              <Award size={20} className="text-primary" />
              <p className="mt-4 font-display text-lg font-semibold text-primary">Reward shop</p>
              <p className="mt-2 font-body text-sm text-slate-500">Approve redemptions and tune family rewards.</p>
            </FFCard>

            <FFCard hoverable onClick={() => navigate('/parent/verification')} className="shadow-card p-4">
              <Shield size={20} className="text-primary" />
              <p className="mt-4 font-display text-lg font-semibold text-primary">Verification queue</p>
              <p className="mt-2 font-body text-sm text-slate-500">Review proof-based task submissions.</p>
            </FFCard>

            {AppConfig.features.subscriptionEnabled ? (
              <FFCard hoverable onClick={() => navigate('/profile/subscription')} className="shadow-card p-4">
                <CreditCard size={20} className="text-primary" />
                <p className="mt-4 font-display text-lg font-semibold text-primary">Subscription</p>
                <p className="mt-2 font-body text-sm text-slate-500">View your current plan and billing details.</p>
              </FFCard>
            ) : null}
          </div>
        </section>

        <FFButton variant="alert" onClick={handleLogout} icon={<LogOut size={18} />} className="w-full">
          Log out
        </FFButton>
      </main>
    </div>
  );
};

export default ParentProfileScreen;
