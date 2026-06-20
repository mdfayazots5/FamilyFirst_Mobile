import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { SafetyRepository, LocationSettings, MemberLocationSetting } from '../repositories/SafetyRepository';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFShimmer from '../../../shared/components/FFShimmer';

// SL-08 — Location Settings (FamilyAdmin only)
// Adults require explicit consent before enabling sharing (enforced by backend 422).

interface MemberUpdate {
  memberId: string;
  sharingEnabled: boolean;
  caregiverViewOnly: boolean;
}

const LocationSettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [settings, setSettings] = useState<LocationSettings | null>(null);
  const [updates, setUpdates]   = useState<Record<string, MemberUpdate>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving]   = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [saved, setSaved]         = useState(false);

  const load = async () => {
    if (!user?.familyId) return;
    setIsLoading(true);
    try {
      const data = await SafetyRepository.getSettings(user.familyId);
      setSettings(data);
      const init: Record<string, MemberUpdate> = {};
      data.memberSettings.forEach(m => {
        init[m.memberId] = { memberId: m.memberId, sharingEnabled: m.sharingEnabled, caregiverViewOnly: m.caregiverViewOnly };
      });
      setUpdates(init);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, [user?.familyId]);

  const setMemberUpdate = (memberId: string, field: keyof Omit<MemberUpdate, 'memberId'>, value: boolean) => {
    setUpdates(prev => ({ ...prev, [memberId]: { ...prev[memberId], [field]: value } }));
  };

  const handleSave = async () => {
    if (!user?.familyId) return;
    setError(null);
    setIsSaving(true);
    try {
      const result = await SafetyRepository.updateSettings(user.familyId, {
        memberSettings: Object.values(updates),
      });
      setSettings(result);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to save settings.';
      setError(msg.includes('422') || msg.includes('consent')
        ? 'Cannot enable sharing for an adult member without their consent. The member must opt in from their own device.'
        : 'Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const isDirty = settings !== null && settings.memberSettings.some(m => {
    const u = updates[m.memberId];
    return u && (u.sharingEnabled !== m.sharingEnabled || u.caregiverViewOnly !== m.caregiverViewOnly);
  });

  return (
    <div className="min-h-screen bg-bg-cream">
      <FFPageHeader
        title="Location Settings"
        subtitle="Manage who shares their location"
        showBack
        rightAction={
          <button onClick={load} className="p-2 rounded-xl bg-white/10" aria-label="Refresh">
            <RefreshCw className={`w-4 h-4 text-white ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      <div className="px-4 pt-5 pb-32 space-y-4">
        {/* Privacy notice */}
        <div className="bg-primary/5 border border-primary/20 rounded-ff p-4">
          <p className="font-body text-xs font-semibold text-primary">Privacy First</p>
          <p className="font-body text-xs text-primary/70 mt-1">
            Adults must give their own consent to share location.
            Children are always shareable by family admin.
            Location data is auto-purged after 30 days (DPDP Act 2023).
          </p>
        </div>

        {error && (
          <div className="bg-alert/5 border border-alert/20 rounded-ff p-4">
            <p className="font-body text-xs text-alert">{error}</p>
          </div>
        )}

        {saved && (
          <div className="bg-success/5 border border-success/20 rounded-ff p-4">
            <p className="font-body text-xs font-semibold text-success">Settings saved.</p>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <FFShimmer key={i} className="h-24 rounded-ff" />)}
          </div>
        ) : (
          <FFCard className="overflow-hidden">
            {settings?.memberSettings.map((member: MemberLocationSetting, index: number) => {
              const u = updates[member.memberId];
              const isAdult = !member.consentGiven;

              return (
                <div
                  key={member.memberId}
                  className={`p-4 ${index !== 0 ? 'border-t border-black/5' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {member.memberName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-body text-sm font-semibold text-primary">{member.memberName}</p>
                        {isAdult && (
                          <span className="font-body text-xs text-gray-400 bg-black/5 px-2 py-0.5 rounded-full">
                            Consent pending
                          </span>
                        )}
                      </div>

                      <div className="mt-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-body text-xs font-medium text-primary">Share location</p>
                            {isAdult && !member.consentGiven && (
                              <p className="font-body text-xs text-accent">Requires member's consent</p>
                            )}
                          </div>
                          <button
                            onClick={() => setMemberUpdate(member.memberId, 'sharingEnabled', !u?.sharingEnabled)}
                            className={`relative w-11 h-6 rounded-full transition-colors ${u?.sharingEnabled ? 'bg-primary' : 'bg-black/10'}`}
                            aria-label="Toggle location sharing"
                          >
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${u?.sharingEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        {u?.sharingEnabled && (
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-body text-xs font-medium text-primary">Caregiver view only</p>
                              <p className="font-body text-xs text-gray-400">Current assignment only — no history</p>
                            </div>
                            <button
                              onClick={() => setMemberUpdate(member.memberId, 'caregiverViewOnly', !u?.caregiverViewOnly)}
                              className={`relative w-11 h-6 rounded-full transition-colors ${u?.caregiverViewOnly ? 'bg-accent' : 'bg-black/10'}`}
                              aria-label="Toggle caregiver view only"
                            >
                              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${u?.caregiverViewOnly ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </FFCard>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/5 px-4 py-4">
        <FFButton onClick={handleSave} disabled={!isDirty} isLoading={isSaving} className="w-full">
          Save Settings
        </FFButton>
      </div>
    </div>
  );
};

export default LocationSettingsScreen;
