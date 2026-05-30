import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Save } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { SafetyRepository, LocationSettings, MemberLocationSetting } from '../repositories/SafetyRepository';

// SL-08 — Location Settings (FamilyAdmin only)
// Controls per-member sharing state.
// Adult members require explicit consent before enabling sharing (enforced by backend 422).

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
      // Initialise updates from current state
      const init: Record<string, MemberUpdate> = {};
      data.memberSettings.forEach(m => {
        init[m.memberId] = {
          memberId:        m.memberId,
          sharingEnabled:  m.sharingEnabled,
          caregiverViewOnly: m.caregiverViewOnly,
        };
      });
      setUpdates(init);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, [user?.familyId]);

  const setMemberUpdate = (memberId: string, field: keyof Omit<MemberUpdate, 'memberId'>, value: boolean) => {
    setUpdates(prev => ({
      ...prev,
      [memberId]: { ...prev[memberId], [field]: value },
    }));
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
    <div className="min-h-screen bg-[#F8F4EE]">
      <div className="bg-[#1A2E4A] px-5 pt-12 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Location Settings
            </h1>
            <p className="text-xs text-blue-200">Manage who shares their location</p>
          </div>
          <button onClick={load} className="p-2 rounded-xl bg-white/10">
            <RefreshCw className={`w-4 h-4 text-white ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="px-4 pt-5 pb-32 space-y-4">
        {/* Privacy notice */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <p className="text-xs text-blue-700 font-medium">Privacy First</p>
          <p className="text-xs text-blue-600 mt-1">
            Adults must give their own consent to share location.
            Children are always shareable by family admin.
            Location data is auto-purged after 30 days (DPDP Act 2023).
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        {saved && (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
            <p className="text-xs text-green-700 font-medium">Settings saved.</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="w-6 h-6 text-gray-300 animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {settings?.memberSettings.map((member: MemberLocationSetting, index: number) => {
              const u = updates[member.memberId];
              const isAdult = !member.consentGiven;

              return (
                <div
                  key={member.memberId}
                  className={`p-4 ${index !== 0 ? 'border-t border-gray-50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1A2E4A] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {member.memberName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[#1A2E4A]">{member.memberName}</p>
                        {isAdult && (
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                            Consent pending
                          </span>
                        )}
                      </div>

                      <div className="mt-3 space-y-3">
                        {/* Sharing enabled */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-gray-700">Share location</p>
                            {isAdult && !member.consentGiven && (
                              <p className="text-xs text-amber-600">Requires member's consent</p>
                            )}
                          </div>
                          <button
                            onClick={() => setMemberUpdate(member.memberId, 'sharingEnabled', !u?.sharingEnabled)}
                            className={`relative w-11 h-6 rounded-full transition-colors ${
                              u?.sharingEnabled ? 'bg-[#1A2E4A]' : 'bg-gray-200'
                            }`}
                          >
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                              u?.sharingEnabled ? 'translate-x-5' : 'translate-x-0'
                            }`} />
                          </button>
                        </div>

                        {/* Caregiver view only */}
                        {u?.sharingEnabled && (
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-medium text-gray-700">Caregiver view only</p>
                              <p className="text-xs text-gray-400">Current assignment only — no history</p>
                            </div>
                            <button
                              onClick={() => setMemberUpdate(member.memberId, 'caregiverViewOnly', !u?.caregiverViewOnly)}
                              className={`relative w-11 h-6 rounded-full transition-colors ${
                                u?.caregiverViewOnly ? 'bg-[#C8922A]' : 'bg-gray-200'
                              }`}
                            >
                              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                u?.caregiverViewOnly ? 'translate-x-5' : 'translate-x-0'
                              }`} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Save button — sticky at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4">
        <button
          onClick={handleSave}
          disabled={isSaving || !isDirty}
          className="w-full flex items-center justify-center gap-2 bg-[#1A2E4A] text-white py-3.5 rounded-2xl font-semibold text-sm disabled:opacity-40"
        >
          {isSaving ? (
            <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default LocationSettingsScreen;
