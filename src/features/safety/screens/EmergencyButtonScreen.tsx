import React from 'react';
import { Shield } from 'lucide-react';
import SOSButton from '../widgets/SOSButton';

// SL-07 — Emergency Button (Child)
// Always-accessible screen for children showing:
//   - "Family can see my location" badge (transparency)
//   - SOSButton widget (2-second hold to activate)
// Child sees only this — NOT a live tracking panel.

const EmergencyButtonScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#1A2E4A] flex flex-col items-center justify-between pb-10 pt-16 px-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8 text-[#C8922A]" />
        </div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Stay Safe
        </h1>
        <p className="text-blue-200 text-sm max-w-xs mx-auto leading-relaxed">
          Your family can see your location and will always know you're safe.
        </p>
      </div>

      {/* Location transparency badge */}
      <div className="flex items-center gap-2 bg-white/10 rounded-2xl px-5 py-3">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <p className="text-sm text-white font-medium">Family can see my location</p>
      </div>

      {/* SOS area */}
      <div className="flex flex-col items-center gap-4">
        <p className="text-blue-200 text-xs text-center">
          In an emergency, hold the button below for 2 seconds.
          Your parents will be notified immediately.
        </p>

        {/* SOSButton is positioned fixed by default — show inline here */}
        <div className="relative" style={{ height: 160 }}>
          <SOSButton />
        </div>
      </div>

      {/* Footer note */}
      <p className="text-blue-300/60 text-xs text-center max-w-xs">
        Your location is only shared with your family.
        It is never shared with anyone outside your family circle.
      </p>
    </div>
  );
};

export default EmergencyButtonScreen;
