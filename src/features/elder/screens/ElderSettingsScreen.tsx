import React from 'react';
import {
  Bell,
  Languages,
  LogOut,
  Phone,
  Type,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import { useElderSettings } from '../providers/ElderSettingsProvider';

const fontSizes = [
  { label: 'Standard', value: '1.0', description: 'Compact and balanced' },
  { label: 'Comfort', value: '1.3', description: 'Easy to read' },
  { label: 'Large', value: '1.6', description: 'Maximum readability' },
];

const ElderSettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { fontSize, setFontSize, language, setLanguage } = useElderSettings();

  return (
    <div className="min-h-screen bg-[#F8F4EE]">
      <FFPageHeader title="Elder settings" subtitle="Readable, calm, and easy to use" showBack />

      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 pb-24">
        <FFCard variant="primary" className="p-5 text-white">
          <p className="font-body text-sm text-white/75">Make the elder space comfortable</p>
          <h1 className="mt-1 font-display text-3xl font-bold">Choose the settings that feel best for you</h1>
        </FFCard>

        <section className="space-y-4">
          <FFSectionHeader icon={<Type />} title="Text size" />
          <div className="grid gap-3">
            {fontSizes.map((size) => (
              <FFCard
                key={size.value}
                hoverable
                onClick={() => setFontSize(size.value)}
                className={`p-5 shadow-card ${fontSize === size.value ? 'border-primary/30 bg-[#FDF9F4]' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-lg font-semibold text-primary">{size.label}</p>
                    <p className="mt-1 font-body text-sm text-slate-500">{size.description}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 font-body text-xs ${
                      fontSize === size.value ? 'bg-success/10 text-success' : 'bg-primary/5 text-primary'
                    }`}
                  >
                    {fontSize === size.value ? 'Selected' : 'Choose'}
                  </span>
                </div>
              </FFCard>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <FFSectionHeader icon={<Languages />} title="Language" />
          <FFCard className="p-5 shadow-card">
            <label className="block">
              <span className="font-body text-sm text-slate-500">Preferred language</span>
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="mt-3 min-h-12 w-full rounded-xl border border-black/10 bg-white px-4 font-body text-sm text-primary"
              >
                <option>English</option>
                <option>Hindi</option>
                <option>Tamil</option>
                <option>Marathi</option>
              </select>
            </label>
          </FFCard>
        </section>

        <section className="space-y-4">
          <FFSectionHeader icon={<Bell />} title="Helpful links" />
          <div className="grid gap-3 md:grid-cols-2">
            <FFCard
              hoverable
              onClick={() => navigate('/notifications/preferences')}
              className="p-5 shadow-card"
            >
              <p className="font-display text-lg font-semibold text-primary">Notifications</p>
              <p className="mt-2 font-body text-sm text-slate-500">
                Review reminder and alert preferences.
              </p>
            </FFCard>
            <FFCard
              hoverable
              onClick={() => {
                window.location.href = 'tel:911';
              }}
              className="p-5 shadow-card"
            >
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-alert" />
                <p className="font-display text-lg font-semibold text-primary">Emergency call</p>
              </div>
              <p className="mt-2 font-body text-sm text-slate-500">
                Start a phone call to emergency services.
              </p>
            </FFCard>
          </div>
        </section>

        <FFButton
          variant="alert"
          className="w-full"
          icon={<LogOut size={16} />}
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          Log out
        </FFButton>
      </main>
    </div>
  );
};

export default ElderSettingsScreen;
