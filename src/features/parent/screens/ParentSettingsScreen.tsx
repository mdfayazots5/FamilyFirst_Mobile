import React from 'react';
import {
  Bell,
  ChevronRight,
  LogOut,
  Repeat,
  Shield,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';

const ParentSettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8F4EE]">
      <FFPageHeader title="Parent settings" subtitle="Household controls and preferences" showBack />

      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 pb-24">
        <section className="space-y-4">
          <FFSectionHeader icon={<Users />} title="Family access" />

          <FFCard hoverable onClick={() => navigate('/parent/admin')} className="shadow-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-display text-xl font-semibold text-primary">Role and permissions</p>
                <p className="mt-2 font-body text-sm text-slate-500">
                  Review who can manage children, approvals, and family settings.
                </p>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </div>
          </FFCard>

          <FFCard hoverable onClick={() => navigate('/child-login')} className="shadow-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="rounded-ff-sm bg-primary/5 p-3 text-primary">
                  <Repeat size={18} />
                </span>
                <div>
                  <p className="font-display text-xl font-semibold text-primary">Switch to child / elder</p>
                  <p className="mt-2 font-body text-sm text-slate-500">
                    Hand this device to a child or elder. They sign in with their own 4-digit PIN.
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </div>
          </FFCard>
        </section>

        <section className="space-y-4">
          <FFSectionHeader icon={<Bell />} title="Preferences" />

          <FFCard hoverable onClick={() => navigate('/notifications/preferences')} className="shadow-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-display text-xl font-semibold text-primary">Notifications</p>
                <p className="mt-2 font-body text-sm text-slate-500">
                  Choose how updates, teacher messages, and reminders reach you.
                </p>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </div>
          </FFCard>
        </section>

        <section className="space-y-4">
          <FFSectionHeader icon={<Shield />} title="Session" />
          <FFButton variant="alert" onClick={handleLogout} icon={<LogOut size={18} />} className="w-full">
            Log out
          </FFButton>
        </section>
      </main>
    </div>
  );
};

export default ParentSettingsScreen;
