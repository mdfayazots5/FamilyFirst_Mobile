import React, { useState } from 'react';
import {
  Bell,
  ChevronRight,
  Languages,
  Lock,
  Palette,
  Volume2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import FFAvatar from '../../../shared/components/FFAvatar';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';

const ChildSettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [language, setLanguage] = useState('English');
  const [selectedAvatar, setSelectedAvatar] = useState('A');
  const [showPinEditor, setShowPinEditor] = useState(false);
  const [pinValue, setPinValue] = useState('');
  const [pinMessage, setPinMessage] = useState('');

  const handleSavePin = () => {
    if (pinValue.length !== 4) {
      setPinMessage('Enter a 4-digit PIN.');
      return;
    }

    setPinMessage('PIN updated for demo mode.');
    setShowPinEditor(false);
    setPinValue('');
  };

  return (
    <div className="min-h-screen bg-[#F8F4EE]">
      <FFPageHeader title="Child settings" subtitle="Personal choices and safe controls" showBack />

      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 pb-24">
        <FFCard className="shadow-card p-5">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <FFAvatar name={user?.name ?? 'Child'} size="xl" />
            <div>
              <h1 className="font-display text-2xl font-bold text-primary">{user?.name ?? 'Child'}</h1>
              <p className="mt-1 font-body text-sm text-slate-500">
                Make this space feel fun, clear, and easy to use every day.
              </p>
            </div>
          </div>
        </FFCard>

        <section className="space-y-4">
          <FFSectionHeader icon={<Palette />} title="Avatar style" />
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
            {['A', 'B', 'C', 'D', 'E', 'F'].map((avatar) => (
              <button
                key={avatar}
                type="button"
                onClick={() => setSelectedAvatar(avatar)}
                className={`rounded-ff border p-3 transition-colors ${
                  selectedAvatar === avatar ? 'border-accent bg-accent/10' : 'border-black/5 bg-white'
                }`}
              >
                <FFAvatar name={`${user?.name ?? 'Child'} ${avatar}`} size="md" />
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <FFSectionHeader icon={<Bell />} title="Preferences" />

          <FFCard className="shadow-card p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="rounded-ff-sm bg-primary/5 p-3 text-primary">
                  <Volume2 size={18} />
                </span>
                <div>
                  <p className="font-display text-lg font-semibold text-primary">Sounds</p>
                  <p className="mt-1 font-body text-sm text-slate-500">
                    Turn task and reward sounds on or off.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSoundEnabled((value) => !value)}
                className={`min-h-12 rounded-full px-4 font-body text-sm font-bold ${
                  soundEnabled ? 'bg-success text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {soundEnabled ? 'On' : 'Off'}
              </button>
            </div>
          </FFCard>

          <FFCard className="shadow-card p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="rounded-ff-sm bg-primary/5 p-3 text-primary">
                  <Languages size={18} />
                </span>
                <div>
                  <p className="font-display text-lg font-semibold text-primary">Language</p>
                  <p className="mt-1 font-body text-sm text-slate-500">
                    Choose the language you want to read in the app.
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
              </select>
            </div>
          </FFCard>
        </section>

        <section className="space-y-4">
          <FFSectionHeader icon={<Lock />} title="PIN safety" />
          <FFCard className="shadow-card p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-display text-lg font-semibold text-primary">Child PIN</p>
                <p className="mt-1 font-body text-sm text-slate-500">
                  Ask a parent to help if you want to change the PIN for this account.
                </p>
              </div>
              <FFButton variant="outline" onClick={() => setShowPinEditor((value) => !value)} icon={<ChevronRight size={16} />}>
                {showPinEditor ? 'Hide PIN editor' : 'Change PIN'}
              </FFButton>
            </div>

            {showPinEditor ? (
              <div className="mt-4 space-y-3 border-t border-black/5 pt-4">
                <input
                  value={pinValue}
                  onChange={(event) => setPinValue(event.target.value.replace(/\D/g, '').slice(0, 4))}
                  inputMode="numeric"
                  className="min-h-12 w-full rounded-ff border border-black/10 px-4 font-body text-sm text-primary"
                  placeholder="Enter 4-digit PIN"
                />
                <FFButton onClick={handleSavePin}>Save PIN</FFButton>
              </div>
            ) : null}

            {pinMessage ? <p className="mt-3 font-body text-sm text-slate-500">{pinMessage}</p> : null}
          </FFCard>
        </section>

        <FFButton variant="outline" onClick={() => navigate('/child')}>
          Back to my day
        </FFButton>
      </main>
    </div>
  );
};

export default ChildSettingsScreen;
