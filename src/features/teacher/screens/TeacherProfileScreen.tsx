import React from 'react';
import { Award, BookOpen, Calendar, ChevronRight, Settings, Star, User, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import FFAvatar from '../../../shared/components/FFAvatar';
import FFBadge from '../../../shared/components/FFBadge';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';

const TeacherProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const firstName = user?.name?.split(' ')[0] ?? 'Teacher';

  return (
    <div className="min-h-screen bg-bg-cream pb-24">
      <FFPageHeader
        title="Teacher profile"
        subtitle="Professional details and quick links"
        showBack
      />

      <main className="page-enter mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <FFCard variant="primary" className="p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <FFAvatar name={user?.name || 'Teacher'} size="xl" />
            <div className="min-w-0 flex-1">
              <p className="font-body text-xs font-bold uppercase tracking-wider text-white/70">
                My profile
              </p>
              <h1 className="mt-1 text-xl font-display font-bold text-white sm:text-2xl">
                {user?.name || 'Teacher'}
              </h1>
              <p className="mt-1 text-sm text-white/80">
                Fast access for sessions, feedback, and account settings
              </p>
            </div>
            <FFBadge variant="accent" size="sm">
              Teacher
            </FFBadge>
          </div>
        </FFCard>

        <section className="space-y-3">
          <FFSectionHeader icon={<User />} title="Account" />
          <FFCard className="space-y-4 p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <div className="rounded-ff-sm bg-[#FDF9F4] p-4">
                <p className="text-xs font-body font-semibold uppercase tracking-wider text-gray-400">
                  Name
                </p>
                <p className="mt-1 text-sm font-display font-semibold text-primary">
                  {user?.name || 'Teacher'}
                </p>
              </div>
              <div className="rounded-ff-sm bg-[#FDF9F4] p-4">
                <p className="text-xs font-body font-semibold uppercase tracking-wider text-gray-400">
                  Role
                </p>
                <p className="mt-1 text-sm font-display font-semibold text-primary">Teacher</p>
              </div>
              <div className="rounded-ff-sm bg-[#FDF9F4] p-4">
                <p className="text-xs font-body font-semibold uppercase tracking-wider text-gray-400">
                  Greeting
                </p>
                <p className="mt-1 text-sm font-display font-semibold text-primary">
                  Hello, {firstName}
                </p>
              </div>
              <div className="rounded-ff-sm bg-[#FDF9F4] p-4">
                <p className="text-xs font-body font-semibold uppercase tracking-wider text-gray-400">
                  Family scope
                </p>
                <p className="mt-1 text-sm font-display font-semibold text-primary">
                  {user?.familyId ? 'Connected' : 'Unavailable'}
                </p>
              </div>
            </div>

            <FFButton
              variant="outline"
              className="w-full"
              icon={<Settings className="h-4 w-4" />}
              onClick={() => navigate('/teacher/settings')}
            >
              Open settings
            </FFButton>
          </FFCard>
        </section>

        <section className="space-y-3">
          <FFSectionHeader icon={<Calendar />} title="Shortcuts" />
          <div className="space-y-3">
            {[
              {
                icon: <Calendar className="h-5 w-5" />,
                title: 'Create a session',
                description: 'Plan the next class and prepare attendance.',
                path: '/teacher/create-session',
              },
              {
                icon: <Star className="h-5 w-5" />,
                title: 'Send feedback',
                description: 'Share appreciation, homework, or weekly notes.',
                path: '/teacher/feedback/new',
              },
              {
                icon: <BookOpen className="h-5 w-5" />,
                title: 'Feedback history',
                description: 'Review submitted notes and acknowledgements.',
                path: '/teacher/feedback/history',
              },
              {
                icon: <Users className="h-5 w-5" />,
                title: 'My sessions',
                description: 'Go back to today’s attendance dashboard.',
                path: '/teacher',
              },
            ].map((item) => (
              <FFCard
                key={item.title}
                hoverable
                onClick={() => navigate(item.path)}
                className="p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-ff-sm bg-primary/10 text-primary">
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-sm font-semibold text-primary">{item.title}</p>
                    <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 flex-shrink-0 text-gray-300" />
                </div>
              </FFCard>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <FFSectionHeader icon={<Award />} title="Session access" />
          <FFCard variant="warm" className="space-y-3 p-4">
            <p className="text-sm text-gray-600">
              This role is optimized for quick class updates. Keep attendance, feedback, and
              history within one tap.
            </p>
            <FFButton
              variant="alert"
              className="w-full"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              Sign out
            </FFButton>
          </FFCard>
        </section>
      </main>
    </div>
  );
};

export default TeacherProfileScreen;
