import React from 'react';
import { Shield } from 'lucide-react';
import SOSButton from '../widgets/SOSButton';

// SL-07 — Emergency Button (Child)
// Always-accessible screen for children:
//   - "Family can see my location" transparency badge
//   - SOSButton widget (2-second hold to activate)

const EmergencyButtonScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-between pb-10 pt-16 px-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8 text-accent" />
        </div>
        <h1 className="font-display font-bold text-2xl text-white">Stay Safe</h1>
        <p className="font-body text-white/60 text-sm max-w-xs mx-auto leading-relaxed">
          Your family can see your location and will always know you're safe.
        </p>
      </div>

      {/* Location transparency badge */}
      <div className="flex items-center gap-2 bg-white/10 rounded-ff px-5 py-3">
        <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
        <p className="font-body text-sm text-white font-medium">Family can see my location</p>
      </div>

      {/* SOS area */}
      <div className="flex flex-col items-center gap-4">
        <p className="font-body text-white/60 text-xs text-center">
          In an emergency, hold the button below for 2 seconds.
          Your parents will be notified immediately.
        </p>

        <div className="relative" style={{ height: 160 }}>
          <SOSButton />
        </div>
      </div>

      {/* Footer note */}
      <p className="font-body text-white/40 text-xs text-center max-w-xs">
        Your location is only shared with your family.
        It is never shared with anyone outside your family circle.
      </p>
    </div>
  );
};

export default EmergencyButtonScreen;
