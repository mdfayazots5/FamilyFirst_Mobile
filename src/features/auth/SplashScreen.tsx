import React from 'react';
import { motion } from 'motion/react';
import { Clock3, ShieldCheck } from 'lucide-react';
import FFCard from '../../shared/components/FFCard';
import FFPageHeader from '../../shared/components/FFPageHeader';
import FFSectionHeader from '../../shared/components/FFSectionHeader';
import FFShimmer from '../../shared/components/FFShimmer';

const SplashScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-cream page-enter">
      <FFPageHeader title="FamilyFirst" subtitle="Getting your account ready" />

      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg items-center px-4 py-6 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full space-y-4"
        >
          <FFCard variant="primary" className="p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-ff bg-white/12">
                <ShieldCheck className="h-8 w-8 text-accent" />
              </div>
              <div className="min-w-0">
                <p className="font-display text-xl font-bold text-white">FamilyFirst</p>
                <p className="mt-1 text-sm text-white/75">
                  A calm, secure start for every family member.
                </p>
              </div>
            </div>
          </FFCard>

          <FFCard variant="warm" className="space-y-4 p-4 sm:p-5 lg:p-6">
            <FFSectionHeader icon={<Clock3 />} title="Preparing your space" />
            <div className="space-y-3">
              <FFShimmer height="1rem" borderRadius="0.75rem" className="shimmer" />
              <FFShimmer height="1rem" borderRadius="0.75rem" className="shimmer" />
              <FFShimmer height="4.5rem" borderRadius="1rem" className="shimmer" />
            </div>
            <p className="text-sm text-gray-500">
              Checking your session and loading the right experience for your role.
            </p>
          </FFCard>
        </motion.div>
      </main>
    </div>
  );
};

export default SplashScreen;
