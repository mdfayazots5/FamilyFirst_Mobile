import React, { useState } from 'react';
import {
  Bell,
  ChevronRight,
  CreditCard,
  Globe,
  LogOut,
  Share2,
  Shield,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { AppConfig } from '../../../core/config/appConfig';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';

const joinCode = 'FAM-7829-X';

const ParentSettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [language, setLanguage] = useState('English');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleShareCode = async () => {
    const text = `Join my family on FamilyFirst with code ${joinCode}.`;

    if (navigator.share) {
      await navigator.share({ title: 'Join FamilyFirst', text });
      return;
    }

    await navigator.clipboard.writeText(text);
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

          <FFCard className="shadow-card p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-display text-xl font-semibold text-primary">Invite with join code</p>
                <p className="mt-2 font-body text-sm text-slate-500">
                  Share this code with trusted family members who should join your household.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-ff bg-accent/15 px-4 py-3 font-display text-lg font-semibold text-primary">
                  {joinCode}
                </span>
                <FFButton variant="outline" onClick={() => void handleShareCode()} icon={<Share2 size={16} />}>
                  Share code
                </FFButton>
              </div>
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

          <FFCard className="shadow-card p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <span className="rounded-ff-sm bg-primary/5 p-3 text-primary">
                  <Globe size={18} />
                </span>
                <div>
                  <p className="font-display text-xl font-semibold text-primary">Language</p>
                  <p className="mt-2 font-body text-sm text-slate-500">
                    Pick the language you want to use throughout the parent experience.
                  </p>
                </div>
              </div>
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="min-h-12 rounded-ff border border-black/10 bg-white px-4 font-body text-sm text-primary"
              >
                <option>English</option>
                <option>Hindi</option>
                <option>Marathi</option>
                <option>Tamil</option>
                <option>Telugu</option>
              </select>
            </div>
          </FFCard>
        </section>

        {AppConfig.features.subscriptionEnabled ? (
          <section className="space-y-4">
            <FFSectionHeader icon={<CreditCard />} title="Plan" />
            <FFCard hoverable onClick={() => navigate('/profile/subscription')} className="shadow-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-xl font-semibold text-primary">Subscription details</p>
                  <p className="mt-2 font-body text-sm text-slate-500">
                    View your current plan, billing cycle, and member limits.
                  </p>
                </div>
                <ChevronRight size={18} className="text-slate-400" />
              </div>
            </FFCard>
          </section>
        ) : null}

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
