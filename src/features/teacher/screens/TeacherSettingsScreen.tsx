import React, { useState } from 'react';
import { Bell, BookOpen, Globe, LogOut, Save, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import FFBadge from '../../../shared/components/FFBadge';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';

const TeacherSettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [name, setName] = useState(user?.name || 'Teacher');
  const [subject, setSubject] = useState('');
  const [language, setLanguage] = useState('English');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSave = () => {
    setIsSaving(true);
    setSaveMessage(null);

    window.setTimeout(() => {
      setIsSaving(false);
      setSaveMessage('Preferences saved on this device.');
    }, 700);
  };

  return (
    <div className="min-h-screen bg-bg-cream pb-24">
      <FFPageHeader
        title="Teacher settings"
        subtitle="Profile details and classroom preferences"
        showBack
      />

      <main className="page-enter mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <FFCard variant="primary" className="space-y-4 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-body text-xs font-bold uppercase tracking-wider text-white/70">
                Teacher preferences
              </p>
              <h1 className="mt-1 text-xl font-display font-bold text-white sm:text-2xl">
                Keep the classroom flow fast
              </h1>
              <p className="mt-2 text-sm text-white/80">
                Update the way your account appears during sessions and feedback.
              </p>
            </div>
            <FFBadge variant="accent" size="sm">
              Settings
            </FFBadge>
          </div>

          <FFButton
            className="w-full"
            icon={<Save className="h-4 w-4" />}
            isLoading={isSaving}
            onClick={handleSave}
          >
            Save preferences
          </FFButton>
        </FFCard>

        {saveMessage ? (
          <FFCard variant="warm" className="p-4">
            <p className="text-sm text-success">{saveMessage}</p>
          </FFCard>
        ) : null}

        <section className="space-y-3">
          <FFSectionHeader icon={<User />} title="Profile" />
          <FFCard className="space-y-4 p-4">
            <label className="block space-y-2">
              <span className="text-xs font-body font-semibold uppercase tracking-wider text-gray-400">
                Display name
              </span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="min-h-12 w-full rounded-xl border border-black/5 bg-white px-4 text-sm text-primary outline-none transition-colors focus:border-primary/20"
                placeholder="Teacher name"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-body font-semibold uppercase tracking-wider text-gray-400">
                Subject
              </span>
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="min-h-12 w-full rounded-xl border border-black/5 bg-white px-4 text-sm text-primary outline-none transition-colors focus:border-primary/20"
                placeholder="Subject name"
              />
            </label>
          </FFCard>
        </section>

        <section className="space-y-3">
          <FFSectionHeader icon={<Globe />} title="Preferences" />
          <FFCard className="space-y-4 p-4">
            <label className="block space-y-2">
              <span className="text-xs font-body font-semibold uppercase tracking-wider text-gray-400">
                Language
              </span>
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="min-h-12 w-full rounded-xl border border-black/5 bg-white px-4 text-sm text-primary outline-none transition-colors focus:border-primary/20"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Tamil">Tamil</option>
                <option value="Telugu">Telugu</option>
                <option value="Marathi">Marathi</option>
              </select>
            </label>

            <div className="flex items-center justify-between gap-4 rounded-ff-sm bg-[#FDF9F4] p-4">
              <div className="min-w-0">
                <p className="font-display text-sm font-semibold text-primary">Notifications</p>
                <p className="mt-1 text-sm text-gray-500">
                  Stay updated when attendance or feedback needs attention.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNotificationsEnabled((current) => !current)}
                className={`flex min-h-12 min-w-12 items-center rounded-full p-1 transition-colors ${
                  notificationsEnabled ? 'bg-primary' : 'bg-black/10'
                }`}
                aria-label="Toggle notifications"
              >
                <span
                  className={`h-10 w-10 rounded-full bg-white transition-transform ${
                    notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </FFCard>
        </section>

        <section className="space-y-3">
          <FFSectionHeader icon={<Bell />} title="Quick links" />
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            <FFCard hoverable onClick={() => navigate('/teacher')} className="p-4">
              <p className="font-display text-sm font-semibold text-primary">My sessions</p>
              <p className="mt-1 text-sm text-gray-500">Return to the teacher dashboard.</p>
            </FFCard>
            <FFCard hoverable onClick={() => navigate('/teacher/feedback/new')} className="p-4">
              <p className="font-display text-sm font-semibold text-primary">Send feedback</p>
              <p className="mt-1 text-sm text-gray-500">Open the class feedback flow.</p>
            </FFCard>
            <FFCard hoverable onClick={() => navigate('/teacher/feedback/history')} className="p-4">
              <p className="font-display text-sm font-semibold text-primary">Feedback history</p>
              <p className="mt-1 text-sm text-gray-500">Review recent notes to families.</p>
            </FFCard>
            <FFCard hoverable onClick={() => navigate('/teacher/create-session')} className="p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-ff-sm bg-accent/10 text-accent">
                <BookOpen className="h-5 w-5" />
              </div>
              <p className="mt-3 font-display text-sm font-semibold text-primary">Create session</p>
              <p className="mt-1 text-sm text-gray-500">Plan the next class schedule.</p>
            </FFCard>
          </div>
        </section>

        <FFButton
          variant="alert"
          className="w-full"
          icon={<LogOut className="h-4 w-4" />}
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          Sign out
        </FFButton>
      </main>
    </div>
  );
};

export default TeacherSettingsScreen;
