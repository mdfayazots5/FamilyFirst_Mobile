import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Shield, UserCheck, UserX } from 'lucide-react';
import { FinanceProvider, useFinance } from '../providers/FinanceProvider';
import { FinanceRepository } from '../repositories/FinanceRepository';
import { useAuth } from '../../../core/auth/AuthContext';

const TIER_LABELS: Record<number, { label: string; desc: string; color: string }> = {
  1: { label: 'Full Visibility',   desc: 'All transactions with merchant names', color: 'text-red-600 bg-red-50' },
  2: { label: 'Category Only',     desc: 'Amounts + categories, merchant private', color: 'text-amber-700 bg-amber-50' },
  3: { label: 'Aggregate Only',    desc: 'Monthly total only — most private', color: 'text-green-700 bg-green-50' },
};

const CONSENT_LABELS: Record<string, { label: string; color: string }> = {
  NotInvited: { label: 'Not Invited',   color: 'text-gray-400' },
  Invited:    { label: 'Invite Sent',   color: 'text-amber-600' },
  Accepted:   { label: 'Active',        color: 'text-green-600' },
  Declined:   { label: 'Declined',      color: 'text-red-500' },
  OptedOut:   { label: 'Opted Out',     color: 'text-gray-400' },
};

const FinanceSettingsContent: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings, isLoading, loadSettings } = useFinance();
  const [inviting, setInviting] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const handleInvite = async (memberId: string) => {
    if (!user?.familyId) return;
    setInviting(memberId);
    try {
      await FinanceRepository.inviteConsent(user.familyId, { memberId, privacyTier: 2 });
      await loadSettings();
    } finally {
      setInviting(null);
    }
  };

  const handleRevoke = async (memberId: string) => {
    if (!user?.familyId) return;
    setRevoking(memberId);
    try {
      await FinanceRepository.revokeConsent(user.familyId, memberId);
      await loadSettings();
    } finally {
      setRevoking(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F4EE]">
      <div className="bg-[#1A2E4A] px-5 pt-12 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Finance Settings
            </h1>
            <p className="text-xs text-blue-200">Privacy tiers & consent</p>
          </div>
          <button onClick={loadSettings} className="p-2 rounded-xl bg-white/10">
            <RefreshCw className={`w-4 h-4 text-white ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="px-4 pt-5 pb-24 space-y-4">
        {/* Privacy tier legend */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#1A2E4A]" />
            <h2 className="text-sm font-bold text-[#1A2E4A]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Privacy Tier Guide
            </h2>
          </div>
          {Object.entries(TIER_LABELS).map(([tier, { label, desc, color }]) => (
            <div key={tier} className="flex items-start gap-3">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${color}`}>T{tier}</span>
              <div>
                <p className="text-xs font-semibold text-[#1A2E4A]">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-400 border-t pt-2 mt-1">
            Tiers cannot be lowered without member re-consent. Upgrades (more privacy) apply immediately.
          </p>
        </div>

        {/* Module status */}
        {settings && (
          <div className={`rounded-2xl p-4 shadow-sm ${settings.isModuleEnabled ? 'bg-green-50 border border-green-100' : 'bg-gray-50'}`}>
            <p className="text-sm font-semibold text-[#1A2E4A]">
              Module {settings.isModuleEnabled ? '✓ Enabled' : '— Not Enabled'}
            </p>
            {settings.cfoMemberName && (
              <p className="text-xs text-gray-500 mt-0.5">Family CFO: {settings.cfoMemberName}</p>
            )}
          </div>
        )}

        {/* Member consent table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <h2 className="text-sm font-bold text-[#1A2E4A]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Member Consent
            </h2>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-5 h-5 text-gray-300 animate-spin" />
            </div>
          ) : (
            settings?.memberSettings.map((m, i) => {
              const consent = CONSENT_LABELS[m.consentStatus] ?? CONSENT_LABELS.NotInvited;
              const tierMeta = TIER_LABELS[m.privacyTier];

              return (
                <div key={m.memberId} className={`px-4 py-3 ${i !== 0 ? 'border-t border-gray-50' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1A2E4A] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {m.memberName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[#1A2E4A]">{m.memberName}</p>
                        <span className={`text-xs font-medium ${tierMeta?.color ?? 'text-gray-400 bg-gray-100'} px-2 py-0.5 rounded-full`}>
                          T{m.privacyTier}
                        </span>
                      </div>
                      <p className={`text-xs font-medium mt-0.5 ${consent.color}`}>{consent.label}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {m.consentStatus === 'Accepted' ? (
                        <button
                          onClick={() => handleRevoke(m.memberId)}
                          disabled={revoking === m.memberId}
                          className="flex items-center gap-1 text-xs text-red-500 border border-red-200 px-2 py-1.5 rounded-xl"
                        >
                          {revoking === m.memberId ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <UserX className="w-3 h-3" />
                          )}
                          Revoke
                        </button>
                      ) : m.consentStatus === 'NotInvited' || m.consentStatus === 'Declined' ? (
                        <button
                          onClick={() => handleInvite(m.memberId)}
                          disabled={inviting === m.memberId}
                          className="flex items-center gap-1 text-xs text-[#1A2E4A] border border-gray-200 px-2 py-1.5 rounded-xl"
                        >
                          {inviting === m.memberId ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <UserCheck className="w-3 h-3" />
                          )}
                          Invite
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* DPDP notice */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <p className="text-xs text-blue-700 font-medium">DPDP Act 2023 Compliant</p>
          <p className="text-xs text-blue-600 mt-1">
            Consent is explicit, recorded, and revocable at any time. Members can stop sharing by texting STOP.
            Data is purged immediately on opt-out. No residual data. No follow-up pressure.
          </p>
        </div>
      </div>
    </div>
  );
};

const FinanceSettingsScreen: React.FC = () => (
  <FinanceProvider>
    <FinanceSettingsContent />
  </FinanceProvider>
);

export default FinanceSettingsScreen;
